from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Count, Q, Sum, Avg
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from datetime import datetime, timedelta
import csv
import json

from .models import (
    User, Organization, UserOrganization, Cohort, UserCohort, Milestone,
    Course, CourseCohort, Task, CourseTask, Question, TaskCompletion,
    AdminProfile, AdminAction, ContentTemplate, SystemConfiguration,
    ContentGenerationJob, AdminNotification, AdminAnalytics, BulkOperation,
    AdminDashboardWidget
)
from .serializers import (
    UserSerializer, UserDetailSerializer, OrganizationSerializer, OrganizationDetailSerializer,
    UserOrganizationSerializer, CohortSerializer, CohortDetailSerializer,
    CourseSerializer, CourseDetailSerializer, TaskSerializer, TaskDetailSerializer,
    QuestionSerializer, TaskCompletionSerializer, AdminProfileSerializer,
    AdminActionSerializer, ContentTemplateSerializer, SystemConfigurationSerializer,
    ContentGenerationJobSerializer, AdminNotificationSerializer, AdminAnalyticsSerializer,
    BulkOperationSerializer, AdminDashboardWidgetSerializer, AdminDashboardSerializer,
    UserManagementSummarySerializer, ContentManagementSummarySerializer,
    OrganizationStatsSerializer, BulkUserImportSerializer, BulkEnrollmentSerializer,
    DataExportSerializer, CourseGenerationSerializer, TaskGenerationSerializer,
    QuizGenerationSerializer
)
from .permissions import (
    IsAdminUser, IsSuperAdmin, IsOrgAdmin, IsContentAdmin, IsSupportAdmin,
    CanManageOrganization, CanManageUsers, CanManageContent, CanViewAnalytics,
    CanPerformBulkOperations, CanManageSystemConfig, CanGenerateContent,
    CanManageNotifications, OrganizationScopedPermission
)


# =================== DASHBOARD VIEWS ===================

class AdminDashboardView(APIView):
    """Main admin dashboard with overview statistics"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        user = request.user
        
        # Get user's managed organizations
        if hasattr(user, 'admin_profile') and user.admin_profile.role == AdminProfile.Role.SUPER_ADMIN:
            organizations = Organization.objects.all()
        else:
            organizations = Organization.objects.filter(
                userorganization__user=user,
                userorganization__role__in=['admin', 'owner']
            )

        if not organizations.exists():
            return Response({'error': 'No organizations to manage'}, 
                          status=status.HTTP_403_FORBIDDEN)

        # Get overview stats
        total_users = User.objects.filter(
            userorganization__org__in=organizations
        ).distinct().count()

        new_users_today = User.objects.filter(
            userorganization__org__in=organizations,
            created_at__date=timezone.now().date()
        ).distinct().count()

        total_courses = Course.objects.filter(org__in=organizations).count()
        total_tasks = Task.objects.filter(org__in=organizations).count()
        active_cohorts = Cohort.objects.filter(org__in=organizations, is_active=True).count()

        # Recent activity
        recent_actions = AdminAction.objects.filter(
            organization__in=organizations
        )[:10]

        # Pending jobs
        pending_jobs = ContentGenerationJob.objects.filter(
            organization__in=organizations,
            status__in=['pending', 'in_progress']
        )

        # Unread notifications
        unread_notifications = AdminNotification.objects.filter(
            recipient=user,
            is_read=False,
            organization__in=organizations
        )[:5]

        # Latest analytics
        analytics_summary = AdminAnalytics.objects.filter(
            organization__in=organizations
        ).first()

        # System alerts
        system_alerts = []
        for org in organizations:
            if org.is_over_user_limit:
                system_alerts.append({
                    'type': 'warning',
                    'message': f'{org.name} is over user limit ({org.current_user_count}/{org.max_users})',
                    'organization': org.name
                })

        dashboard_data = {
            'organization': OrganizationSerializer(organizations.first()).data if organizations.count() == 1 else None,
            'total_users': total_users,
            'new_users_today': new_users_today,
            'total_courses': total_courses,
            'total_tasks': total_tasks,
            'active_cohorts': active_cohorts,
            'recent_actions': AdminActionSerializer(recent_actions, many=True).data,
            'pending_jobs': ContentGenerationJobSerializer(pending_jobs, many=True).data,
            'unread_notifications': AdminNotificationSerializer(unread_notifications, many=True).data,
            'analytics_summary': AdminAnalyticsSerializer(analytics_summary).data if analytics_summary else None,
            'system_alerts': system_alerts
        }

        return Response(dashboard_data)


# =================== ORGANIZATION MANAGEMENT ===================

class OrganizationManagementView(APIView):
    """Organization management operations"""
    permission_classes = [IsAdminUser, CanManageOrganization]

    def get(self, request):
        """List organizations user can manage"""
        user = request.user
        
        if hasattr(user, 'admin_profile') and user.admin_profile.role == AdminProfile.Role.SUPER_ADMIN:
            organizations = Organization.objects.all()
        else:
            org_ids = list(UserOrganization.objects.filter(
                user=user, role__in=['admin', 'owner']
            ).values_list('org_id', flat=True))
            
            if hasattr(user, 'admin_profile'):
                managed_org_ids = list(user.admin_profile.organizations.values_list('id', flat=True))
                org_ids.extend(managed_org_ids)
            
            organizations = Organization.objects.filter(id__in=org_ids).distinct()

        serializer = OrganizationDetailSerializer(organizations, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Create new organization (Super Admin only)"""
        if not (hasattr(request.user, 'admin_profile') and 
                request.user.admin_profile.role == AdminProfile.Role.SUPER_ADMIN):
            return Response({'error': 'Only Super Admins can create organizations'}, 
                          status=status.HTTP_403_FORBIDDEN)

        serializer = OrganizationSerializer(data=request.data)
        if serializer.is_valid():
            organization = serializer.save()
            
            # Log action
            AdminAction.objects.create(
                admin=request.user,
                action_type=AdminAction.ActionType.CREATE,
                object_type='Organization',
                object_id=organization.id,
                object_name=organization.name,
                description=f'Created organization: {organization.name}',
                ip_address=request.META.get('REMOTE_ADDR')
            )
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OrganizationDetailView(RetrieveUpdateDestroyAPIView):
    """Individual organization management"""
    serializer_class = OrganizationDetailSerializer
    permission_classes = [IsAdminUser, CanManageOrganization]

    def get_queryset(self):
        user = self.request.user
        
        if hasattr(user, 'admin_profile') and user.admin_profile.role == AdminProfile.Role.SUPER_ADMIN:
            return Organization.objects.all()
        
        org_ids = list(UserOrganization.objects.filter(
            user=user, role__in=['admin', 'owner']
        ).values_list('org_id', flat=True))
        
        if hasattr(user, 'admin_profile'):
            managed_org_ids = list(user.admin_profile.organizations.values_list('id', flat=True))
            org_ids.extend(managed_org_ids)
        
        return Organization.objects.filter(id__in=org_ids).distinct()

    def perform_update(self, serializer):
        org = serializer.save()
        
        # Log action
        AdminAction.objects.create(
            admin=self.request.user,
            action_type=AdminAction.ActionType.UPDATE,
            object_type='Organization',
            object_id=org.id,
            object_name=org.name,
            organization=org,
            description=f'Updated organization: {org.name}',
            ip_address=self.request.META.get('REMOTE_ADDR')
        )


class OrganizationStatsView(APIView):
    """Organization statistics"""
    permission_classes = [IsAdminUser, CanViewAnalytics]

    def get(self, request, org_id):
        organization = get_object_or_404(Organization, id=org_id)
        
        # Check permission
        self.check_object_permissions(request, organization)
        
        member_count = UserOrganization.objects.filter(org=organization).count()
        cohort_count = organization.cohort_set.count()
        course_count = organization.course_set.count()
        
        # Storage usage (placeholder - implement based on your storage solution)
        storage_usage = 0.0
        
        # API usage from analytics
        latest_analytics = organization.adminanalytics_set.first()
        api_usage = latest_analytics.api_calls if latest_analytics else 0
        
        # Monthly active users (based on last organization access)
        monthly_active_users = UserOrganization.objects.filter(
            org=organization,
            last_accessed__gte=timezone.now() - timedelta(days=30)
        ).count()

        stats_data = {
            'organization': OrganizationSerializer(organization).data,
            'member_count': member_count,
            'cohort_count': cohort_count,
            'course_count': course_count,
            'storage_usage': storage_usage,
            'api_usage': api_usage,
            'monthly_active_users': monthly_active_users
        }

        return Response(stats_data)


# =================== USER MANAGEMENT ===================

class UserManagementView(APIView):
    """User management operations"""
    permission_classes = [IsAdminUser, CanManageUsers]

    def get(self, request):
        """List users with filtering and search"""
        user = request.user
        
        # Get user's managed organizations
        if hasattr(user, 'admin_profile') and user.admin_profile.role == AdminProfile.Role.SUPER_ADMIN:
            user_qs = User.objects.all()
        else:
            org_ids = UserOrganization.objects.filter(
                user=user, role__in=['admin', 'owner']
            ).values_list('org_id', flat=True)
            user_qs = User.objects.filter(userorganization__org_id__in=org_ids).distinct()

        # Apply filters
        search = request.query_params.get('search', '')
        if search:
            user_qs = user_qs.filter(
                Q(email__icontains=search) |
                Q(first_name__icontains=search) |
                Q(last_name__icontains=search)
            )

        role = request.query_params.get('role', '')
        if role:
            user_qs = user_qs.filter(userorganization__role=role)

        org_id = request.query_params.get('organization', '')
        if org_id:
            user_qs = user_qs.filter(userorganization__org_id=org_id)

        # Pagination
        page_size = min(int(request.query_params.get('page_size', 20)), 100)
        page = int(request.query_params.get('page', 1))
        start = (page - 1) * page_size
        end = start + page_size

        users = user_qs[start:end]
        total_count = user_qs.count()

        # Summary stats
        total_users = user_qs.count()
        # Active users based on organization access
        active_users = UserOrganization.objects.filter(
            user__in=user_qs,
            last_accessed__gte=timezone.now() - timedelta(days=30)
        ).count()
        new_users_this_week = user_qs.filter(
            created_at__gte=timezone.now() - timedelta(days=7)
        ).count()
        
        users_by_role = dict(UserOrganization.objects.filter(
            user__in=user_qs
        ).values('role').annotate(count=Count('id')).values_list('role', 'count'))

        recent_signups = user_qs.order_by('-created_at')[:5]

        response_data = {
            'users': UserDetailSerializer(users, many=True).data,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total_count': total_count,
                'total_pages': (total_count + page_size - 1) // page_size
            },
            'summary': {
                'total_users': total_users,
                'active_users': active_users,
                'new_users_this_week': new_users_this_week,
                'users_by_role': users_by_role,
                'recent_signups': UserSerializer(recent_signups, many=True).data
            }
        }

        return Response(response_data)

    def post(self, request):
        """Create new user"""
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Add to organization if specified
            org_id = request.data.get('organization_id')
            if org_id:
                try:
                    organization = Organization.objects.get(id=org_id)
                    # Check if requesting user can manage this organization
                    if self.check_org_permission(request.user, organization):
                        UserOrganization.objects.create(
                            user=user,
                            org=organization,
                            role=request.data.get('role', 'member')
                        )
                except Organization.DoesNotExist:
                    pass

            # Log action
            AdminAction.objects.create(
                admin=request.user,
                action_type=AdminAction.ActionType.CREATE,
                object_type='User',
                object_id=user.id,
                object_name=user.email,
                description=f'Created user: {user.email}',
                ip_address=request.META.get('REMOTE_ADDR')
            )

            return Response(UserDetailSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def check_org_permission(self, user, organization):
        """Check if user can manage the organization"""
        if hasattr(user, 'admin_profile') and user.admin_profile.role == AdminProfile.Role.SUPER_ADMIN:
            return True
        
        return UserOrganization.objects.filter(
            user=user,
            org=organization,
            role__in=['admin', 'owner']
        ).exists()


class UserDetailView(RetrieveUpdateDestroyAPIView):
    """Individual user management"""
    serializer_class = UserDetailSerializer
    permission_classes = [IsAdminUser, CanManageUsers]

    def get_queryset(self):
        user = self.request.user
        
        if hasattr(user, 'admin_profile') and user.admin_profile.role == AdminProfile.Role.SUPER_ADMIN:
            return User.objects.all()
        
        org_ids = UserOrganization.objects.filter(
            user=user, role__in=['admin', 'owner']
        ).values_list('org_id', flat=True)
        return User.objects.filter(userorganization__org_id__in=org_ids).distinct()

    def perform_update(self, serializer):
        user = serializer.save()
        
        # Log action
        AdminAction.objects.create(
            admin=self.request.user,
            action_type=AdminAction.ActionType.UPDATE,
            object_type='User',
            object_id=user.id,
            object_name=user.email,
            description=f'Updated user: {user.email}',
            ip_address=self.request.META.get('REMOTE_ADDR')
        )


# =================== CONTENT MANAGEMENT ===================

class ContentManagementView(APIView):
    """Content management dashboard"""
    permission_classes = [IsAdminUser, CanManageContent]

    def get(self, request):
        """Get content management overview"""
        user = request.user
        
        # Get organizations user can manage
        if hasattr(user, 'admin_profile') and user.admin_profile.role == AdminProfile.Role.SUPER_ADMIN:
            organizations = Organization.objects.all()
        else:
            organizations = Organization.objects.filter(
                userorganization__user=user,
                userorganization__role__in=['admin', 'owner']
            )

        # Course statistics
        courses_qs = Course.objects.filter(org__in=organizations)
        total_courses = courses_qs.count()
        published_courses = courses_qs.filter(status='published').count()
        draft_courses = courses_qs.filter(status='draft').count()

        # Task statistics
        tasks_qs = Task.objects.filter(org__in=organizations)
        total_tasks = tasks_qs.count()
        tasks_by_type = dict(tasks_qs.values('type').annotate(
            count=Count('id')
        ).values_list('type', 'count'))

        # Recent content
        recent_content = courses_qs.order_by('-created_at')[:5]

        summary_data = {
            'total_courses': total_courses,
            'published_courses': published_courses,
            'draft_courses': draft_courses,
            'total_tasks': total_tasks,
            'tasks_by_type': tasks_by_type,
            'recent_content': CourseSerializer(recent_content, many=True).data
        }

        return Response(summary_data)


class CourseManagementView(ModelViewSet):
    """Course CRUD operations"""
    serializer_class = CourseDetailSerializer
    permission_classes = [IsAdminUser, CanManageContent]

    def get_queryset(self):
        user = self.request.user
        
        if hasattr(user, 'admin_profile') and user.admin_profile.role == AdminProfile.Role.SUPER_ADMIN:
            return Course.objects.all()
        
        organizations = Organization.objects.filter(
            userorganization__user=user,
            userorganization__role__in=['admin', 'owner']
        )
        return Course.objects.filter(org__in=organizations)

    def perform_create(self, serializer):
        course = serializer.save(created_by=self.request.user)
        
        # Log action
        AdminAction.objects.create(
            admin=self.request.user,
            action_type=AdminAction.ActionType.CREATE,
            object_type='Course',
            object_id=course.id,
            object_name=course.name,
            organization=course.org,
            description=f'Created course: {course.name}',
            ip_address=self.request.META.get('REMOTE_ADDR')
        )

    def perform_update(self, serializer):
        course = serializer.save()
        
        # Log action
        AdminAction.objects.create(
            admin=self.request.user,
            action_type=AdminAction.ActionType.UPDATE,
            object_type='Course',
            object_id=course.id,
            object_name=course.name,
            organization=course.org,
            description=f'Updated course: {course.name}',
            ip_address=self.request.META.get('REMOTE_ADDR')
        )


class TaskManagementView(ModelViewSet):
    """Task CRUD operations"""
    serializer_class = TaskDetailSerializer
    permission_classes = [IsAdminUser, CanManageContent]

    def get_queryset(self):
        user = self.request.user
        
        if hasattr(user, 'admin_profile') and user.admin_profile.role == AdminProfile.Role.SUPER_ADMIN:
            return Task.objects.all()
        
        organizations = Organization.objects.filter(
            userorganization__user=user,
            userorganization__role__in=['admin', 'owner']
        )
        return Task.objects.filter(org__in=organizations)

    def perform_create(self, serializer):
        task = serializer.save(created_by=self.request.user)
        
        # Log action
        AdminAction.objects.create(
            admin=self.request.user,
            action_type=AdminAction.ActionType.CREATE,
            object_type='Task',
            object_id=task.id,
            object_name=task.title,
            organization=task.org,
            description=f'Created task: {task.title}',
            ip_address=self.request.META.get('REMOTE_ADDR')
        )


# =================== ANALYTICS ===================

class AnalyticsView(APIView):
    """Analytics dashboard"""
    permission_classes = [IsAdminUser, CanViewAnalytics]

    def get(self, request):
        """Get analytics data"""
        user = request.user
        
        # Get date range
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=30)
        
        date_from = request.query_params.get('date_from')
        if date_from:
            start_date = datetime.strptime(date_from, '%Y-%m-%d').date()
        
        date_to = request.query_params.get('date_to')
        if date_to:
            end_date = datetime.strptime(date_to, '%Y-%m-%d').date()

        # Get organizations
        if hasattr(user, 'admin_profile') and user.admin_profile.role == AdminProfile.Role.SUPER_ADMIN:
            organizations = Organization.objects.all()
        else:
            organizations = Organization.objects.filter(
                userorganization__user=user,
                userorganization__role__in=['admin', 'owner']
            )

        # Get analytics data
        analytics_qs = AdminAnalytics.objects.filter(
            organization__in=organizations,
            date__range=[start_date, end_date]
        ).order_by('-date')

        org_id = request.query_params.get('organization')
        if org_id:
            analytics_qs = analytics_qs.filter(organization_id=org_id)

        analytics_data = AdminAnalyticsSerializer(analytics_qs[:100], many=True).data

        # Aggregate totals
        totals = analytics_qs.aggregate(
            total_users=Sum('total_users'),
            total_courses=Sum('total_courses'),
            total_tasks=Sum('total_tasks'),
            total_sessions=Sum('total_sessions'),
            avg_completion_rate=Avg('completion_rate'),
            total_api_calls=Sum('api_calls'),
            total_storage=Sum('storage_used_gb'),
            total_errors=Sum('error_count'),
            total_ai_cost=Sum('ai_cost_usd')
        )

        return Response({
            'analytics': analytics_data,
            'totals': totals,
            'date_range': {'start': start_date, 'end': end_date}
        })


# =================== BULK OPERATIONS ===================

class BulkUserImportView(APIView):
    """Bulk user import from CSV"""
    permission_classes = [IsAdminUser, CanPerformBulkOperations]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        serializer = BulkUserImportSerializer(data=request.data)
        if serializer.is_valid():
            # Create bulk operation record
            operation = BulkOperation.objects.create(
                operation_type=BulkOperation.OperationType.USER_IMPORT,
                organization=serializer.validated_data['organization'],
                status=BulkOperation.Status.PENDING,
                parameters=serializer.validated_data,
                started_by=request.user
            )

            # Process file (in a real implementation, this would be done asynchronously)
            # For now, return the operation ID
            
            return Response({
                'operation_id': str(operation.uuid),
                'status': 'pending',
                'message': 'User import started'
            }, status=status.HTTP_202_ACCEPTED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BulkEnrollmentView(APIView):
    """Bulk enrollment operations"""
    permission_classes = [IsAdminUser, CanPerformBulkOperations]

    def post(self, request):
        serializer = BulkEnrollmentSerializer(data=request.data)
        if serializer.is_valid():
            users = serializer.validated_data['users']
            cohorts = serializer.validated_data['cohorts']
            role = serializer.validated_data['role']

            # Create bulk operation record
            operation = BulkOperation.objects.create(
                operation_type=BulkOperation.OperationType.BULK_ENROLL,
                organization=cohorts[0].org,  # Assume all cohorts are in same org
                status=BulkOperation.Status.IN_PROGRESS,
                total_items=len(users) * len(cohorts),
                started_by=request.user,
                parameters=serializer.validated_data
            )

            success_count = 0
            error_count = 0

            for user in users:
                for cohort in cohorts:
                    try:
                        user_cohort, created = UserCohort.objects.get_or_create(
                            user=user,
                            cohort=cohort,
                            defaults={'role': role}
                        )
                        if created:
                            success_count += 1
                        operation.processed_items += 1
                    except Exception as e:
                        error_count += 1
                        operation.error_log += f"Error enrolling {user.email} in {cohort.name}: {str(e)}\n"

            operation.success_count = success_count
            operation.error_count = error_count
            operation.status = BulkOperation.Status.COMPLETED
            operation.completed_at = timezone.now()
            operation.save()

            # Log action
            AdminAction.objects.create(
                admin=request.user,
                action_type=AdminAction.ActionType.BULK_OPERATION,
                object_type='BulkEnrollment',
                description=f'Bulk enrolled {success_count} users',
                ip_address=request.META.get('REMOTE_ADDR')
            )

            return Response({
                'operation_id': str(operation.uuid),
                'success_count': success_count,
                'error_count': error_count,
                'status': 'completed'
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DataExportView(APIView):
    """Data export operations"""
    permission_classes = [IsAdminUser, CanPerformBulkOperations]

    def post(self, request):
        serializer = DataExportSerializer(data=request.data)
        if serializer.is_valid():
            export_type = serializer.validated_data['export_type']
            organization = serializer.validated_data['organization']
            format_type = serializer.validated_data['format']

            # Check permission
            if not self.check_org_permission(request.user, organization):
                return Response({'error': 'Permission denied'}, 
                              status=status.HTTP_403_FORBIDDEN)

            # Create bulk operation record
            operation = BulkOperation.objects.create(
                operation_type=BulkOperation.OperationType.DATA_EXPORT,
                organization=organization,
                status=BulkOperation.Status.IN_PROGRESS,
                parameters=serializer.validated_data,
                started_by=request.user
            )

            try:
                # Generate export data
                if export_type == 'users':
                    data = self.export_users(organization, serializer.validated_data)
                elif export_type == 'courses':
                    data = self.export_courses(organization, serializer.validated_data)
                elif export_type == 'completions':
                    data = self.export_completions(organization, serializer.validated_data)
                else:
                    raise ValueError(f"Unsupported export type: {export_type}")

                # Create response
                if format_type == 'csv':
                    response = self.create_csv_response(data, export_type)
                else:
                    response = self.create_json_response(data)

                operation.status = BulkOperation.Status.COMPLETED
                operation.completed_at = timezone.now()
                operation.save()

                # Log action
                AdminAction.objects.create(
                    admin=request.user,
                    action_type=AdminAction.ActionType.DATA_EXPORT,
                    object_type='DataExport',
                    organization=organization,
                    description=f'Exported {export_type} data',
                    ip_address=request.META.get('REMOTE_ADDR')
                )

                return response

            except Exception as e:
                operation.status = BulkOperation.Status.FAILED
                operation.error_message = str(e)
                operation.completed_at = timezone.now()
                operation.save()

                return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def check_org_permission(self, user, organization):
        """Check if user can manage the organization"""
        if hasattr(user, 'admin_profile') and user.admin_profile.role == AdminProfile.Role.SUPER_ADMIN:
            return True
        
        return UserOrganization.objects.filter(
            user=user,
            org=organization,
            role__in=['admin', 'owner']
        ).exists()

    def export_users(self, organization, params):
        """Export users data"""
        users = User.objects.filter(userorganization__org=organization)
        
        return [{
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'created_at': user.created_at.isoformat(),
            'roles': list(user.userorganization_set.filter(org=organization).values_list('role', flat=True))
        } for user in users]

    def export_courses(self, organization, params):
        """Export courses data"""
        courses = Course.objects.filter(org=organization)
        
        return [{
            'name': course.name,
            'status': course.status,
            'difficulty_level': course.difficulty_level,
            'estimated_duration_weeks': course.estimated_duration_weeks,
            'total_tasks': course.total_tasks,
            'created_at': course.created_at.isoformat()
        } for course in courses]

    def export_completions(self, organization, params):
        """Export task completions data"""
        completions = TaskCompletion.objects.filter(
            task__org=organization
        ).select_related('user', 'task')
        
        return [{
            'user_email': completion.user.email,
            'task_title': completion.task.title,
            'score': float(completion.score) if completion.score else None,
            'max_score': float(completion.max_score) if completion.max_score else None,
            'is_passed': completion.is_passed,
            'completed_at': completion.completed_at.isoformat()
        } for completion in completions]

    def create_csv_response(self, data, export_type):
        """Create CSV response"""
        if not data:
            return Response({'error': 'No data to export'}, status=status.HTTP_404_NOT_FOUND)

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = f'attachment; filename="{export_type}_export.csv"'
        
        writer = csv.DictWriter(response, fieldnames=data[0].keys())
        writer.writeheader()
        writer.writerows(data)
        
        return response

    def create_json_response(self, data):
        """Create JSON response"""
        response = HttpResponse(
            json.dumps(data, indent=2),
            content_type='application/json'
        )
        response['Content-Disposition'] = 'attachment; filename="export.json"'
        return response


# =================== CONTENT GENERATION ===================

class ContentGenerationView(APIView):
    """AI content generation operations"""
    permission_classes = [IsAdminUser, CanGenerateContent]

    def post(self, request):
        """Start content generation job"""
        generation_type = request.data.get('type')
        
        if generation_type == 'course':
            serializer = CourseGenerationSerializer(data=request.data)
        elif generation_type == 'task':
            serializer = TaskGenerationSerializer(data=request.data)
        elif generation_type == 'quiz':
            serializer = QuizGenerationSerializer(data=request.data)
        else:
            return Response({'error': 'Invalid generation type'}, 
                          status=status.HTTP_400_BAD_REQUEST)

        if serializer.is_valid():
            # Create content generation job
            job = ContentGenerationJob.objects.create(
                job_type=generation_type.upper() + '_GENERATION',
                organization=serializer.validated_data.get('organization') or 
                           serializer.validated_data.get('course').org,
                status=ContentGenerationJob.Status.PENDING,
                input_data=serializer.validated_data,
                started_by=request.user
            )

            # In a real implementation, this would trigger async processing
            
            # Log action
            AdminAction.objects.create(
                admin=request.user,
                action_type=AdminAction.ActionType.CONTENT_GENERATION,
                object_type='ContentGenerationJob',
                object_id=job.id,
                description=f'Started {generation_type} generation',
                ip_address=request.META.get('REMOTE_ADDR')
            )

            return Response({
                'job_id': str(job.uuid),
                'status': 'pending',
                'message': f'{generation_type.title()} generation started'
            }, status=status.HTTP_202_ACCEPTED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ContentGenerationStatusView(APIView):
    """Check content generation job status"""
    permission_classes = [IsAdminUser]

    def get(self, request, job_id):
        """Get job status"""
        try:
            job = ContentGenerationJob.objects.get(uuid=job_id)
            
            # Check permission
            if not self.check_job_permission(request.user, job):
                return Response({'error': 'Permission denied'}, 
                              status=status.HTTP_403_FORBIDDEN)

            serializer = ContentGenerationJobSerializer(job)
            return Response(serializer.data)
        
        except ContentGenerationJob.DoesNotExist:
            return Response({'error': 'Job not found'}, 
                          status=status.HTTP_404_NOT_FOUND)

    def check_job_permission(self, user, job):
        """Check if user can access this job"""
        if hasattr(user, 'admin_profile') and user.admin_profile.role == AdminProfile.Role.SUPER_ADMIN:
            return True
        
        return UserOrganization.objects.filter(
            user=user,
            org=job.organization,
            role__in=['admin', 'owner']
        ).exists()


# =================== NOTIFICATIONS ===================

class AdminNotificationView(ModelViewSet):
    """Admin notifications management"""
    serializer_class = AdminNotificationSerializer
    permission_classes = [IsAdminUser, CanManageNotifications]

    def get_queryset(self):
        user = self.request.user
        return user.admin_notifications.all()

    def update(self, request, *args, **kwargs):
        """Mark notification as read"""
        notification = self.get_object()
        
        if 'is_read' in request.data and request.data['is_read']:
            notification.mark_as_read()
        
        return super().update(request, *args, **kwargs)


@api_view(['POST'])
@permission_classes([IsAdminUser, CanManageNotifications])
def mark_all_notifications_read(request):
    """Mark all notifications as read for the current user"""
    updated = AdminNotification.objects.filter(
        recipient=request.user,
        is_read=False
    ).update(is_read=True, read_at=timezone.now())
    
    return Response({'marked_read': updated})


# =================== SYSTEM CONFIGURATION ===================

class SystemConfigurationView(ModelViewSet):
    """System configuration management"""
    serializer_class = SystemConfigurationSerializer
    permission_classes = [IsAdminUser, CanManageSystemConfig]

    def get_queryset(self):
        user = self.request.user
        
        if hasattr(user, 'admin_profile') and user.admin_profile.role == AdminProfile.Role.SUPER_ADMIN:
            return SystemConfiguration.objects.all()
        
        # Org admins can only see their org's configs
        organizations = Organization.objects.filter(
            userorganization__user=user,
            userorganization__role__in=['admin', 'owner']
        )
        return SystemConfiguration.objects.filter(
            Q(organization__in=organizations) | Q(organization__isnull=True)
        )


# =================== ADMIN ACTIONS LOG ===================

class AdminActionView(APIView):
    """Admin actions audit log"""
    permission_classes = [IsAdminUser]

    def get(self, request):
        """Get admin actions log"""
        user = request.user
        
        # Filter by user's organizations
        if hasattr(user, 'admin_profile') and user.admin_profile.role == AdminProfile.Role.SUPER_ADMIN:
            actions_qs = AdminAction.objects.all()
        else:
            organizations = Organization.objects.filter(
                userorganization__user=user,
                userorganization__role__in=['admin', 'owner']
            )
            actions_qs = AdminAction.objects.filter(
                Q(organization__in=organizations) | Q(organization__isnull=True)
            )

        # Apply filters
        action_type = request.query_params.get('action_type')
        if action_type:
            actions_qs = actions_qs.filter(action_type=action_type)

        object_type = request.query_params.get('object_type')
        if object_type:
            actions_qs = actions_qs.filter(object_type=object_type)

        admin_id = request.query_params.get('admin_id')
        if admin_id:
            actions_qs = actions_qs.filter(admin_id=admin_id)

        # Date range
        date_from = request.query_params.get('date_from')
        if date_from:
            actions_qs = actions_qs.filter(created_at__gte=date_from)

        date_to = request.query_params.get('date_to')
        if date_to:
            actions_qs = actions_qs.filter(created_at__lte=date_to)

        # Pagination
        page_size = min(int(request.query_params.get('page_size', 50)), 100)
        page = int(request.query_params.get('page', 1))
        start = (page - 1) * page_size
        end = start + page_size

        actions = actions_qs[start:end]
        total_count = actions_qs.count()

        return Response({
            'actions': AdminActionSerializer(actions, many=True).data,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total_count': total_count,
                'total_pages': (total_count + page_size - 1) // page_size
            }
        }) 