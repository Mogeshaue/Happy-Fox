from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import datetime, timedelta
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from unittest.mock import patch

from .models import (
    Organization, UserOrganization, Cohort, UserCohort, Course, Task,
    TaskCompletion, AdminProfile, AdminAction, ContentTemplate,
    SystemConfiguration, ContentGenerationJob, AdminNotification,
    AdminAnalytics, BulkOperation, AdminDashboardWidget
)


class AdminFlowTestCase(TestCase):
    """Base test case with common setup for admin flow tests"""
    
    def setUp(self):
        User = get_user_model()
        
        # Create test organization
        self.org = Organization.objects.create(
            name="Test Organization",
            slug="test-org",
            billing_tier="premium",
            max_users=100
        )
        
        # Create test users
        self.super_admin_user = User.objects.create(
            email="superadmin@test.com",
            first_name="Super",
            last_name="Admin"
        )
        
        self.org_admin_user = User.objects.create(
            email="orgadmin@test.com",
            first_name="Org",
            last_name="Admin"
        )
        
        self.content_admin_user = User.objects.create(
            email="contentadmin@test.com",
            first_name="Content",
            last_name="Admin"
        )
        
        self.regular_user = User.objects.create(
            email="user@test.com",
            first_name="Regular",
            last_name="User"
        )
        
        # Create admin profiles
        self.super_admin_profile = AdminProfile.objects.create(
            user=self.super_admin_user,
            role=AdminProfile.Role.SUPER_ADMIN,
            is_active=True
        )
        
        self.org_admin_profile = AdminProfile.objects.create(
            user=self.org_admin_user,
            role=AdminProfile.Role.ORG_ADMIN,
            is_active=True
        )
        self.org_admin_profile.organizations.add(self.org)
        
        self.content_admin_profile = AdminProfile.objects.create(
            user=self.content_admin_user,
            role=AdminProfile.Role.CONTENT_ADMIN,
            is_active=True
        )
        
        # Create user-organization relationships
        UserOrganization.objects.create(
            user=self.org_admin_user,
            org=self.org,
            role='admin'
        )
        
        UserOrganization.objects.create(
            user=self.regular_user,
            org=self.org,
            role='member'
        )
        
        # Create test cohort
        self.cohort = Cohort.objects.create(
            name="Test Cohort",
            org=self.org,
            is_active=True
        )
        
        # Create test course
        self.course = Course.objects.create(
            name="Test Course",
            description="Test course description",
            org=self.org,
            status=Course.Status.PUBLISHED,
            created_by=self.content_admin_user
        )
        
        # Create test task
        self.task = Task.objects.create(
            title="Test Task",
            description="Test task description",
            org=self.org,
            type=Task.Type.LEARNING_MATERIAL,
            status=Task.Status.PUBLISHED,
            created_by=self.content_admin_user
        )


class AdminProfileTests(AdminFlowTestCase):
    """Test AdminProfile model and functionality"""
    
    def test_admin_profile_creation(self):
        """Test creating admin profiles"""
        self.assertEqual(self.super_admin_profile.role, AdminProfile.Role.SUPER_ADMIN)
        self.assertTrue(self.super_admin_profile.is_active)
        self.assertEqual(self.super_admin_profile.managed_orgs_count, 0)  # Super admin doesn't need explicit orgs
    
    def test_org_admin_managed_orgs(self):
        """Test organization admin's managed organizations"""
        self.assertEqual(self.org_admin_profile.managed_orgs_count, 1)
        self.assertIn(self.org, self.org_admin_profile.organizations.all())
    
    def test_total_users_managed(self):
        """Test calculation of total users managed by admin"""
        # This should count users in organizations the admin manages
        count = self.org_admin_profile.total_users_managed
        self.assertGreaterEqual(count, 2)  # At least org_admin and regular_user


class OrganizationTests(AdminFlowTestCase):
    """Test Organization model and functionality"""
    
    def test_organization_user_limits(self):
        """Test organization user limit functionality"""
        self.assertFalse(self.org.is_over_user_limit)
        
        # Set a low limit to test over limit
        self.org.max_users = 1
        self.org.save()
        self.assertTrue(self.org.is_over_user_limit)
    
    def test_current_user_count(self):
        """Test current user count calculation"""
        count = self.org.current_user_count
        self.assertEqual(count, 2)  # org_admin_user and regular_user


class AdminActionTests(AdminFlowTestCase):
    """Test AdminAction audit logging"""
    
    def test_admin_action_creation(self):
        """Test creating admin action log entries"""
        action = AdminAction.objects.create(
            admin=self.org_admin_user,
            action_type=AdminAction.ActionType.CREATE,
            object_type='Course',
            object_id=self.course.id,
            object_name=self.course.name,
            organization=self.org,
            description='Created test course',
            ip_address='127.0.0.1'
        )
        
        self.assertEqual(action.admin, self.org_admin_user)
        self.assertEqual(action.action_type, AdminAction.ActionType.CREATE)
        self.assertEqual(action.object_type, 'Course')
        self.assertEqual(action.organization, self.org)


class ContentGenerationJobTests(AdminFlowTestCase):
    """Test ContentGenerationJob functionality"""
    
    def test_content_generation_job_creation(self):
        """Test creating content generation jobs"""
        job = ContentGenerationJob.objects.create(
            job_type=ContentGenerationJob.JobType.COURSE_STRUCTURE,
            organization=self.org,
            status=ContentGenerationJob.Status.PENDING,
            input_data={'course_name': 'Generated Course'},
            started_by=self.content_admin_user
        )
        
        self.assertEqual(job.job_type, ContentGenerationJob.JobType.COURSE_STRUCTURE)
        self.assertEqual(job.status, ContentGenerationJob.Status.PENDING)
        self.assertEqual(job.progress, 0)


class AdminNotificationTests(AdminFlowTestCase):
    """Test AdminNotification functionality"""
    
    def test_notification_creation(self):
        """Test creating admin notifications"""
        notification = AdminNotification.objects.create(
            recipient=self.org_admin_user,
            notification_type=AdminNotification.Type.USER_SIGNUP,
            priority=AdminNotification.Priority.MEDIUM,
            title='Test Notification',
            message='This is a test notification',
            organization=self.org
        )
        
        self.assertFalse(notification.is_read)
        self.assertIsNone(notification.read_at)
    
    def test_mark_notification_as_read(self):
        """Test marking notification as read"""
        notification = AdminNotification.objects.create(
            recipient=self.org_admin_user,
            notification_type=AdminNotification.Type.USER_SIGNUP,
            priority=AdminNotification.Priority.MEDIUM,
            title='Test Notification',
            message='This is a test notification',
            organization=self.org
        )
        
        notification.mark_as_read()
        self.assertTrue(notification.is_read)
        self.assertIsNotNone(notification.read_at)


class AdminAnalyticsTests(AdminFlowTestCase):
    """Test AdminAnalytics functionality"""
    
    def test_analytics_creation(self):
        """Test creating analytics records"""
        analytics = AdminAnalytics.objects.create(
            organization=self.org,
            date=timezone.now().date(),
            total_users=10,
            new_users=2,
            active_users=8,
            total_courses=5,
            completion_rate=75.5
        )
        
        self.assertEqual(analytics.organization, self.org)
        self.assertEqual(analytics.total_users, 10)
        self.assertEqual(analytics.completion_rate, 75.5)


class BulkOperationTests(AdminFlowTestCase):
    """Test BulkOperation functionality"""
    
    def test_bulk_operation_creation(self):
        """Test creating bulk operations"""
        operation = BulkOperation.objects.create(
            operation_type=BulkOperation.OperationType.USER_IMPORT,
            organization=self.org,
            status=BulkOperation.Status.PENDING,
            total_items=100,
            started_by=self.org_admin_user
        )
        
        self.assertEqual(operation.progress_percentage, 0)
        self.assertEqual(operation.processed_items, 0)
    
    def test_bulk_operation_progress(self):
        """Test bulk operation progress calculation"""
        operation = BulkOperation.objects.create(
            operation_type=BulkOperation.OperationType.USER_IMPORT,
            organization=self.org,
            total_items=100,
            processed_items=50,
            started_by=self.org_admin_user
        )
        
        self.assertEqual(operation.progress_percentage, 50.0)


# =================== API TESTS ===================

class AdminFlowAPITestCase(APITestCase):
    """Base API test case"""
    
    def setUp(self):
        User = get_user_model()
        
        # Create test data (similar to AdminFlowTestCase)
        self.org = Organization.objects.create(
            name="Test Organization",
            slug="test-org"
        )
        
        self.super_admin_user = User.objects.create(
            email="superadmin@test.com",
            first_name="Super",
            last_name="Admin"
        )
        
        self.org_admin_user = User.objects.create(
            email="orgadmin@test.com",
            first_name="Org",
            last_name="Admin"
        )
        
        self.regular_user = User.objects.create(
            email="user@test.com",
            first_name="Regular",
            last_name="User"
        )
        
        # Create admin profiles
        self.super_admin_profile = AdminProfile.objects.create(
            user=self.super_admin_user,
            role=AdminProfile.Role.SUPER_ADMIN,
            is_active=True
        )
        
        self.org_admin_profile = AdminProfile.objects.create(
            user=self.org_admin_user,
            role=AdminProfile.Role.ORG_ADMIN,
            is_active=True
        )
        self.org_admin_profile.organizations.add(self.org)
        
        UserOrganization.objects.create(
            user=self.org_admin_user,
            org=self.org,
            role='admin'
        )


class AdminDashboardAPITests(AdminFlowAPITestCase):
    """Test admin dashboard API"""
    
    def test_dashboard_access_super_admin(self):
        """Test dashboard access for super admin"""
        self.client.force_authenticate(user=self.super_admin_user)
        url = reverse('admin_flow:admin-dashboard')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_users', response.data)
        self.assertIn('total_courses', response.data)
    
    def test_dashboard_access_org_admin(self):
        """Test dashboard access for organization admin"""
        self.client.force_authenticate(user=self.org_admin_user)
        url = reverse('admin_flow:admin-dashboard')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_users', response.data)
    
    def test_dashboard_access_denied_regular_user(self):
        """Test dashboard access denied for regular users"""
        self.client.force_authenticate(user=self.regular_user)
        url = reverse('admin_flow:admin-dashboard')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class OrganizationManagementAPITests(AdminFlowAPITestCase):
    """Test organization management API"""
    
    def test_list_organizations_super_admin(self):
        """Test listing organizations as super admin"""
        self.client.force_authenticate(user=self.super_admin_user)
        url = reverse('admin_flow:organization-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
    
    def test_list_organizations_org_admin(self):
        """Test listing organizations as org admin"""
        self.client.force_authenticate(user=self.org_admin_user)
        url = reverse('admin_flow:organization-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should only see their managed organizations
        self.assertEqual(len(response.data), 1)
    
    def test_create_organization_super_admin_only(self):
        """Test that only super admins can create organizations"""
        self.client.force_authenticate(user=self.super_admin_user)
        url = reverse('admin_flow:organization-list')
        data = {
            'name': 'New Test Org',
            'slug': 'new-test-org'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
    
    def test_create_organization_denied_org_admin(self):
        """Test that org admins cannot create organizations"""
        self.client.force_authenticate(user=self.org_admin_user)
        url = reverse('admin_flow:organization-list')
        data = {
            'name': 'New Test Org',
            'slug': 'new-test-org'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class UserManagementAPITests(AdminFlowAPITestCase):
    """Test user management API"""
    
    def test_list_users_with_permissions(self):
        """Test listing users with proper permissions"""
        self.client.force_authenticate(user=self.org_admin_user)
        url = reverse('admin_flow:user-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('users', response.data)
        self.assertIn('summary', response.data)
    
    def test_user_search_functionality(self):
        """Test user search functionality"""
        self.client.force_authenticate(user=self.org_admin_user)
        url = reverse('admin_flow:user-list')
        response = self.client.get(url, {'search': 'orgadmin'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should find the org admin user
        self.assertGreaterEqual(len(response.data['users']), 1)


class ContentGenerationAPITests(AdminFlowAPITestCase):
    """Test content generation API"""
    
    def test_start_course_generation(self):
        """Test starting course generation"""
        self.client.force_authenticate(user=self.org_admin_user)
        url = reverse('admin_flow:content-generation')
        data = {
            'type': 'course',
            'course_name': 'Generated Course',
            'course_description': 'A course generated by AI',
            'intended_audience': 'Beginners',
            'difficulty_level': 'beginner',
            'estimated_weeks': 8,
            'learning_objectives': ['Learn basics', 'Build projects'],
            'organization': self.org.id
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_202_ACCEPTED)
        self.assertIn('job_id', response.data)
        self.assertIn('status', response.data)
    
    def test_generation_status_check(self):
        """Test checking generation job status"""
        # Create a job first
        job = ContentGenerationJob.objects.create(
            job_type=ContentGenerationJob.JobType.COURSE_STRUCTURE,
            organization=self.org,
            status=ContentGenerationJob.Status.IN_PROGRESS,
            input_data={'test': 'data'},
            started_by=self.org_admin_user
        )
        
        self.client.force_authenticate(user=self.org_admin_user)
        url = reverse('admin_flow:generation-status', kwargs={'job_id': job.uuid})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], ContentGenerationJob.Status.IN_PROGRESS)


class AnalyticsAPITests(AdminFlowAPITestCase):
    """Test analytics API"""
    
    def setUp(self):
        super().setUp()
        
        # Create some analytics data
        AdminAnalytics.objects.create(
            organization=self.org,
            date=timezone.now().date(),
            total_users=50,
            new_users=5,
            active_users=40,
            total_courses=10,
            completion_rate=85.5
        )
    
    def test_analytics_access(self):
        """Test analytics API access"""
        self.client.force_authenticate(user=self.org_admin_user)
        url = reverse('admin_flow:analytics')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('analytics', response.data)
        self.assertIn('totals', response.data)
    
    def test_analytics_date_filtering(self):
        """Test analytics filtering by date range"""
        self.client.force_authenticate(user=self.org_admin_user)
        url = reverse('admin_flow:analytics')
        
        today = timezone.now().date()
        yesterday = today - timedelta(days=1)
        
        response = self.client.get(url, {
            'date_from': yesterday.strftime('%Y-%m-%d'),
            'date_to': today.strftime('%Y-%m-%d')
        })
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)


class BulkOperationAPITests(AdminFlowAPITestCase):
    """Test bulk operation APIs"""
    
    def test_bulk_enrollment(self):
        """Test bulk enrollment functionality"""
        # Create a cohort first
        cohort = Cohort.objects.create(
            name="Test Cohort",
            org=self.org
        )
        
        self.client.force_authenticate(user=self.org_admin_user)
        url = reverse('admin_flow:bulk-enrollment')
        data = {
            'users': [self.regular_user.id],
            'cohorts': [cohort.id],
            'role': 'learner',
            'send_notification': True
        }
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('success_count', response.data)


class AdminActionAPITests(AdminFlowAPITestCase):
    """Test admin action log API"""
    
    def setUp(self):
        super().setUp()
        
        # Create some admin actions
        AdminAction.objects.create(
            admin=self.org_admin_user,
            action_type=AdminAction.ActionType.CREATE,
            object_type='User',
            object_name='test@example.com',
            organization=self.org,
            description='Created test user'
        )
    
    def test_admin_actions_list(self):
        """Test listing admin actions"""
        self.client.force_authenticate(user=self.org_admin_user)
        url = reverse('admin_flow:admin-actions')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('actions', response.data)
        self.assertGreaterEqual(len(response.data['actions']), 1)
    
    def test_admin_actions_filtering(self):
        """Test filtering admin actions"""
        self.client.force_authenticate(user=self.org_admin_user)
        url = reverse('admin_flow:admin-actions')
        response = self.client.get(url, {'action_type': 'create'})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should filter to only CREATE actions
        for action in response.data['actions']:
            self.assertEqual(action['action_type'], 'create')


# =================== PERMISSION TESTS ===================

class AdminPermissionTests(AdminFlowTestCase):
    """Test admin permission system"""
    
    def test_super_admin_permissions(self):
        """Test super admin has all permissions"""
        from .permissions import IsSuperAdmin, CanManageSystemConfig
        
        # Mock request object
        class MockRequest:
            def __init__(self, user):
                self.user = user
        
        request = MockRequest(self.super_admin_user)
        
        # Test super admin permission
        permission = IsSuperAdmin()
        self.assertTrue(permission.has_permission(request, None))
        
        # Test system config permission
        config_permission = CanManageSystemConfig()
        self.assertTrue(config_permission.has_permission(request, None))
    
    def test_org_admin_permissions(self):
        """Test organization admin permissions"""
        from .permissions import IsOrgAdmin, CanManageUsers
        
        class MockRequest:
            def __init__(self, user):
                self.user = user
        
        request = MockRequest(self.org_admin_user)
        
        # Test org admin permission
        permission = IsOrgAdmin()
        self.assertTrue(permission.has_permission(request, None))
        
        # Test user management permission
        user_permission = CanManageUsers()
        self.assertTrue(user_permission.has_permission(request, None))
    
    def test_regular_user_denied(self):
        """Test regular users are denied admin permissions"""
        from .permissions import IsAdminUser
        
        class MockRequest:
            def __init__(self, user):
                self.user = user
        
        request = MockRequest(self.regular_user)
        
        permission = IsAdminUser()
        self.assertFalse(permission.has_permission(request, None))


# =================== SIGNAL TESTS ===================

class AdminSignalTests(AdminFlowTestCase):
    """Test admin flow signals"""
    
    def test_user_creation_notification(self):
        """Test that user creation triggers notifications"""
        initial_count = AdminNotification.objects.count()
        
        # Create a new user
        User = get_user_model()
        new_user = User.objects.create(
            email="newuser@test.com",
            first_name="New",
            last_name="User"
        )
        
        # Add to organization to trigger notification
        UserOrganization.objects.create(
            user=new_user,
            org=self.org,
            role='member'
        )
        
        # Check if notification was created
        final_count = AdminNotification.objects.count()
        self.assertGreater(final_count, initial_count)
    
    @patch('admin_flow.signals.send_mail')
    def test_content_generation_email(self, mock_send_mail):
        """Test content generation completion email"""
        job = ContentGenerationJob.objects.create(
            job_type=ContentGenerationJob.JobType.COURSE_STRUCTURE,
            organization=self.org,
            status=ContentGenerationJob.Status.IN_PROGRESS,
            input_data={'test': 'data'},
            started_by=self.org_admin_user
        )
        
        # Update status to completed (should trigger email)
        job.status = ContentGenerationJob.Status.COMPLETED
        job.completed_at = timezone.now()
        job.save()
        
        # Check if email was attempted
        self.assertTrue(mock_send_mail.called)


class SystemConfigurationTests(AdminFlowTestCase):
    """Test system configuration functionality"""
    
    def test_typed_value_conversion(self):
        """Test configuration value type conversion"""
        # String value
        config = SystemConfiguration.objects.create(
            key='test_string',
            value='hello world',
            value_type='string',
            organization=self.org
        )
        self.assertEqual(config.get_typed_value(), 'hello world')
        
        # Integer value
        config_int = SystemConfiguration.objects.create(
            key='test_int',
            value='42',
            value_type='integer',
            organization=self.org
        )
        self.assertEqual(config_int.get_typed_value(), 42)
        
        # Boolean value
        config_bool = SystemConfiguration.objects.create(
            key='test_bool',
            value='true',
            value_type='boolean',
            organization=self.org
        )
        self.assertTrue(config_bool.get_typed_value())
        
        # JSON value
        config_json = SystemConfiguration.objects.create(
            key='test_json',
            value='{"key": "value"}',
            value_type='json',
            organization=self.org
        )
        self.assertEqual(config_json.get_typed_value(), {"key": "value"}) 