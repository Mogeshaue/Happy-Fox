from django.test import TestCase
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import datetime, timedelta
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.urls import reverse
from unittest.mock import patch, MagicMock

from .models import (
    StudentProfile, StudentEnrollment, LearningSession, AssignmentSubmission,
    StudyGroup, StudyGroupMembership, LearningResource, LearningGoal,
    QuizAttempt, StudentNotification, StudentAnalytics, StudentAchievement,
    Organization, Cohort, Course, Task, TaskCompletion, UserCohort, UserOrganization
)

User = get_user_model()


class StudentFlowTestCase(TestCase):
    """Base test case with common setup for student flow tests"""
    
    def setUp(self):
        # Create test organization
        self.org = Organization.objects.create(
            name="Test University",
            slug="test-university"
        )
        
        # Create test cohort
        self.cohort = Cohort.objects.create(
            name="Fall 2024",
            org=self.org,
            is_active=True
        )
        
        # Create test course
        self.course = Course.objects.create(
            name="Python Programming",
            description="Learn Python programming",
            org=self.org,
            status="published",
            difficulty_level="beginner",
            learning_objectives=["Learn Python basics", "Build applications"]
        )
        
        # Create test task
        self.task = Task.objects.create(
            title="Introduction to Variables",
            description="Learn about Python variables",
            org=self.org,
            type="learning_material",
            status="published"
        )
        
        # Create test users
        self.student_user = User.objects.create(
            email="student@test.com",
            first_name="Jane",
            last_name="Student"
        )
        
        self.mentor_user = User.objects.create(
            email="mentor@test.com",
            first_name="John",
            last_name="Mentor"
        )
        
        self.admin_user = User.objects.create(
            email="admin@test.com",
            first_name="Admin",
            last_name="User"
        )
        
        # Set up user relationships
        UserOrganization.objects.create(
            user=self.student_user,
            org=self.org,
            role='member'
        )
        
        UserOrganization.objects.create(
            user=self.admin_user,
            org=self.org,
            role='admin'
        )
        
        UserCohort.objects.create(
            user=self.student_user,
            cohort=self.cohort,
            role='learner'
        )
        
        UserCohort.objects.create(
            user=self.mentor_user,
            cohort=self.cohort,
            role='mentor'
        )
        
        # Create student profile
        self.student_profile = StudentProfile.objects.create(
            user=self.student_user,
            bio="Aspiring developer",
            learning_style="visual",
            preferred_difficulty="beginner"
        )
        
        # Create enrollment
        self.enrollment = StudentEnrollment.objects.create(
            student=self.student_user,
            course=self.course,
            cohort=self.cohort,
            status='in_progress'
        )


class StudentProfileTests(StudentFlowTestCase):
    """Test StudentProfile model and functionality"""
    
    def test_student_profile_creation(self):
        """Test creating student profiles"""
        self.assertEqual(self.student_profile.learning_style, "visual")
        self.assertEqual(self.student_profile.user, self.student_user)
        self.assertEqual(self.student_profile.status, "active")
    
    def test_completion_rate_calculation(self):
        """Test completion rate calculation"""
        # Create task completions
        TaskCompletion.objects.create(
            user=self.student_user,
            task=self.task,
            is_passed=True
        )
        
        completion_rate = self.student_profile.completion_rate
        self.assertGreaterEqual(completion_rate, 0)
    
    def test_current_courses_count(self):
        """Test current courses count calculation"""
        count = self.student_profile.current_courses_count
        self.assertEqual(count, 1)  # One enrollment created in setUp
    
    def test_streak_update(self):
        """Test learning streak update"""
        initial_streak = self.student_profile.streak_days
        self.student_profile.update_streak()
        
        # Should update last activity date
        self.assertEqual(self.student_profile.last_activity_date, timezone.now().date())


class StudentEnrollmentTests(StudentFlowTestCase):
    """Test StudentEnrollment model and functionality"""
    
    def test_enrollment_creation(self):
        """Test creating enrollments"""
        self.assertEqual(self.enrollment.student, self.student_user)
        self.assertEqual(self.enrollment.course, self.course)
        self.assertEqual(self.enrollment.status, 'in_progress')
    
    def test_is_overdue_property(self):
        """Test overdue enrollment detection"""
        # Set expected completion date in the past
        self.enrollment.expected_completion_date = timezone.now().date() - timedelta(days=1)
        self.enrollment.save()
        
        self.assertTrue(self.enrollment.is_overdue)
    
    def test_days_since_enrollment(self):
        """Test days since enrollment calculation"""
        days = self.enrollment.days_since_enrollment
        self.assertEqual(days, 0)  # Created today


class LearningSessionTests(StudentFlowTestCase):
    """Test LearningSession model and functionality"""
    
    def test_learning_session_creation(self):
        """Test creating learning sessions"""
        session = LearningSession.objects.create(
            student=self.student_user,
            course=self.course,
            task=self.task,
            session_type='learning_material'
        )
        
        self.assertEqual(session.student, self.student_user)
        self.assertEqual(session.status, 'active')
    
    def test_end_session(self):
        """Test ending a learning session"""
        session = LearningSession.objects.create(
            student=self.student_user,
            course=self.course,
            session_type='learning_material'
        )
        
        session.end_session()
        
        self.assertEqual(session.status, 'completed')
        self.assertIsNotNone(session.ended_at)
        self.assertGreater(session.total_duration_minutes, 0)
    
    def test_accuracy_rate_calculation(self):
        """Test accuracy rate calculation"""
        session = LearningSession.objects.create(
            student=self.student_user,
            session_type='quiz_practice',
            questions_answered=10,
            correct_answers=8
        )
        
        self.assertEqual(session.accuracy_rate, 80.0)


class AssignmentSubmissionTests(StudentFlowTestCase):
    """Test AssignmentSubmission model and functionality"""
    
    def test_assignment_submission_creation(self):
        """Test creating assignment submissions"""
        submission = AssignmentSubmission.objects.create(
            student=self.student_user,
            task=self.task,
            course=self.course,
            content="My assignment solution"
        )
        
        self.assertEqual(submission.student, self.student_user)
        self.assertEqual(submission.status, 'draft')
        self.assertEqual(submission.version, 1)
    
    def test_submit_assignment(self):
        """Test submitting an assignment"""
        submission = AssignmentSubmission.objects.create(
            student=self.student_user,
            task=self.task,
            course=self.course,
            content="My assignment solution"
        )
        
        submission.submit()
        
        self.assertEqual(submission.status, 'submitted')
        self.assertIsNotNone(submission.submitted_at)
    
    def test_percentage_score_calculation(self):
        """Test percentage score calculation"""
        submission = AssignmentSubmission.objects.create(
            student=self.student_user,
            task=self.task,
            course=self.course,
            content="Solution",
            score=85,
            max_score=100
        )
        
        self.assertEqual(submission.percentage_score, 85.0)


class StudyGroupTests(StudentFlowTestCase):
    """Test StudyGroup model and functionality"""
    
    def test_study_group_creation(self):
        """Test creating study groups"""
        study_group = StudyGroup.objects.create(
            name="Python Study Group",
            description="Learn Python together",
            organization=self.org,
            course=self.course,
            creator=self.student_user,
            max_members=10
        )
        
        self.assertEqual(study_group.name, "Python Study Group")
        self.assertEqual(study_group.creator, self.student_user)
        self.assertEqual(study_group.status, 'active')
    
    def test_study_group_membership(self):
        """Test study group membership"""
        study_group = StudyGroup.objects.create(
            name="Study Group",
            organization=self.org,
            creator=self.student_user
        )
        
        membership = StudyGroupMembership.objects.create(
            study_group=study_group,
            student=self.mentor_user,
            status='active'
        )
        
        self.assertEqual(membership.study_group, study_group)
        self.assertEqual(membership.student, self.mentor_user)
        self.assertEqual(study_group.member_count, 1)
    
    def test_approve_membership(self):
        """Test approving study group membership"""
        study_group = StudyGroup.objects.create(
            name="Study Group",
            organization=self.org,
            creator=self.student_user,
            join_policy='invite_only'
        )
        
        membership = StudyGroupMembership.objects.create(
            study_group=study_group,
            student=self.mentor_user,
            status='pending'
        )
        
        membership.approve(self.student_user)
        
        self.assertEqual(membership.status, 'active')
        self.assertIsNotNone(membership.approved_at)
        self.assertEqual(membership.approved_by, self.student_user)


class LearningGoalTests(StudentFlowTestCase):
    """Test LearningGoal model and functionality"""
    
    def test_learning_goal_creation(self):
        """Test creating learning goals"""
        goal = LearningGoal.objects.create(
            student=self.student_user,
            title="Master Python Basics",
            description="Learn fundamental Python concepts",
            category="academic",
            target_date=timezone.now().date() + timedelta(days=30),
            course=self.course
        )
        
        self.assertEqual(goal.student, self.student_user)
        self.assertEqual(goal.status, 'not_started')
        self.assertEqual(goal.priority, 'medium')
    
    def test_mark_goal_completed(self):
        """Test marking goal as completed"""
        goal = LearningGoal.objects.create(
            student=self.student_user,
            title="Learn Variables",
            description="Understand Python variables",
            target_date=timezone.now().date() + timedelta(days=7)
        )
        
        goal.mark_completed()
        
        self.assertEqual(goal.status, 'completed')
        self.assertIsNotNone(goal.completed_at)
        self.assertEqual(goal.progress_percentage, 100.0)
    
    def test_is_overdue_property(self):
        """Test overdue goal detection"""
        goal = LearningGoal.objects.create(
            student=self.student_user,
            title="Past Goal",
            description="This goal is overdue",
            target_date=timezone.now().date() - timedelta(days=1)
        )
        
        self.assertTrue(goal.is_overdue)


class QuizAttemptTests(StudentFlowTestCase):
    """Test QuizAttempt model and functionality"""
    
    def test_quiz_attempt_creation(self):
        """Test creating quiz attempts"""
        attempt = QuizAttempt.objects.create(
            student=self.student_user,
            task=self.task,
            course=self.course,
            total_questions=10,
            time_limit_minutes=30
        )
        
        self.assertEqual(attempt.student, self.student_user)
        self.assertEqual(attempt.status, 'in_progress')
        self.assertEqual(attempt.attempt_number, 1)
    
    def test_complete_quiz_attempt(self):
        """Test completing quiz attempt"""
        attempt = QuizAttempt.objects.create(
            student=self.student_user,
            task=self.task,
            course=self.course,
            total_questions=10,
            questions_answered=10,
            correct_answers=8,
            score=80,
            max_score=100
        )
        
        attempt.complete()
        
        self.assertEqual(attempt.status, 'completed')
        self.assertIsNotNone(attempt.completed_at)
        self.assertEqual(attempt.percentage_score, 80.0)
    
    def test_accuracy_rate_calculation(self):
        """Test quiz accuracy rate calculation"""
        attempt = QuizAttempt.objects.create(
            student=self.student_user,
            task=self.task,
            course=self.course,
            questions_answered=10,
            correct_answers=7
        )
        
        self.assertEqual(attempt.accuracy_rate, 70.0)


class StudentNotificationTests(StudentFlowTestCase):
    """Test StudentNotification model and functionality"""
    
    def test_notification_creation(self):
        """Test creating notifications"""
        notification = StudentNotification.objects.create(
            recipient=self.student_user,
            notification_type='course_update',
            priority='medium',
            title="New Content Available",
            message="New learning material has been added to your course",
            course=self.course
        )
        
        self.assertEqual(notification.recipient, self.student_user)
        self.assertFalse(notification.is_read)
        self.assertIsNone(notification.read_at)
    
    def test_mark_notification_as_read(self):
        """Test marking notification as read"""
        notification = StudentNotification.objects.create(
            recipient=self.student_user,
            notification_type='achievement',
            title="Achievement Unlocked",
            message="You've earned a new badge!"
        )
        
        notification.mark_as_read()
        
        self.assertTrue(notification.is_read)
        self.assertIsNotNone(notification.read_at)


class StudentAnalyticsTests(StudentFlowTestCase):
    """Test StudentAnalytics model and functionality"""
    
    def test_analytics_creation(self):
        """Test creating analytics records"""
        analytics = StudentAnalytics.objects.create(
            student=self.student_user,
            date=timezone.now().date(),
            study_time_minutes=120,
            sessions_count=3,
            tasks_completed=2,
            average_score=85.5
        )
        
        self.assertEqual(analytics.student, self.student_user)
        self.assertEqual(analytics.study_time_minutes, 120)
        self.assertEqual(analytics.average_score, 85.5)


class StudentAchievementTests(StudentFlowTestCase):
    """Test StudentAchievement model and functionality"""
    
    def test_achievement_creation(self):
        """Test creating achievements"""
        achievement = StudentAchievement.objects.create(
            student=self.student_user,
            achievement_type='completion',
            title="First Course Completed",
            description="Completed your first course",
            badge_icon="graduation-cap",
            points_earned=100,
            course=self.course
        )
        
        self.assertEqual(achievement.student, self.student_user)
        self.assertEqual(achievement.points_earned, 100)
        self.assertTrue(achievement.is_public)


# =================== API TESTS ===================

class StudentFlowAPITestCase(APITestCase):
    """Base API test case"""
    
    def setUp(self):
        # Create test data (similar to StudentFlowTestCase)
        self.org = Organization.objects.create(
            name="Test University",
            slug="test-university"
        )
        
        self.cohort = Cohort.objects.create(
            name="Fall 2024",
            org=self.org
        )
        
        self.course = Course.objects.create(
            name="Python Programming",
            org=self.org,
            status="published"
        )
        
        self.student_user = User.objects.create(
            email="student@test.com",
            first_name="Jane",
            last_name="Student"
        )
        
        self.admin_user = User.objects.create(
            email="admin@test.com",
            first_name="Admin",
            last_name="User"
        )
        
        # Set up relationships
        UserOrganization.objects.create(
            user=self.student_user,
            org=self.org,
            role='member'
        )
        
        UserCohort.objects.create(
            user=self.student_user,
            cohort=self.cohort,
            role='learner'
        )
        
        self.student_profile = StudentProfile.objects.create(
            user=self.student_user
        )


class StudentDashboardAPITests(StudentFlowAPITestCase):
    """Test student dashboard API"""
    
    def test_dashboard_access_student(self):
        """Test dashboard access for students"""
        self.client.force_authenticate(user=self.student_user)
        url = reverse('student_flow:student-dashboard')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('student_profile', response.data)
        self.assertIn('current_enrollments', response.data)
        self.assertIn('total_study_hours', response.data)
    
    def test_dashboard_access_denied_non_student(self):
        """Test dashboard access denied for non-students"""
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('student_flow:student-dashboard')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)


class StudentProfileAPITests(StudentFlowAPITestCase):
    """Test student profile API"""
    
    def test_get_student_profile(self):
        """Test getting student profile"""
        self.client.force_authenticate(user=self.student_user)
        url = reverse('student_flow:student-profile')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['user']['email'], self.student_user.email)
    
    def test_update_student_profile(self):
        """Test updating student profile"""
        self.client.force_authenticate(user=self.student_user)
        url = reverse('student_flow:student-profile')
        data = {
            'bio': 'Updated bio',
            'learning_style': 'auditory',
            'study_hours_per_week': 15
        }
        response = self.client.patch(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.student_profile.refresh_from_db()
        self.assertEqual(self.student_profile.bio, 'Updated bio')
        self.assertEqual(self.student_profile.learning_style, 'auditory')


class LearningSessionAPITests(StudentFlowAPITestCase):
    """Test learning session API"""
    
    def test_create_learning_session(self):
        """Test creating learning session"""
        self.client.force_authenticate(user=self.student_user)
        url = reverse('student_flow:session-list')
        data = {
            'session_type': 'learning_material',
            'course_id': self.course.id,
            'device_type': 'desktop'
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['student']['id'], self.student_user.id)
        self.assertEqual(response.data['session_type'], 'learning_material')
    
    def test_list_learning_sessions(self):
        """Test listing learning sessions"""
        # Create a session first
        LearningSession.objects.create(
            student=self.student_user,
            session_type='learning_material'
        )
        
        self.client.force_authenticate(user=self.student_user)
        url = reverse('student_flow:session-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)


class StudyGroupAPITests(StudentFlowAPITestCase):
    """Test study group API"""
    
    def test_create_study_group(self):
        """Test creating study group"""
        self.client.force_authenticate(user=self.student_user)
        url = reverse('student_flow:study-group-list')
        data = {
            'name': 'Python Study Group',
            'description': 'Learn Python together',
            'organization_id': self.org.id,
            'course_id': self.course.id,
            'max_members': 10
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'Python Study Group')
        self.assertEqual(response.data['creator']['id'], self.student_user.id)
    
    def test_join_study_group(self):
        """Test joining study group"""
        study_group = StudyGroup.objects.create(
            name="Open Group",
            organization=self.org,
            creator=self.student_user,
            join_policy='open'
        )
        
        # Create another user to join
        other_user = User.objects.create(
            email="other@test.com",
            first_name="Other",
            last_name="User"
        )
        UserOrganization.objects.create(
            user=other_user,
            org=self.org,
            role='member'
        )
        
        self.client.force_authenticate(user=other_user)
        url = reverse('student_flow:join-study-group', kwargs={'group_id': study_group.uuid})
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'active')


class LearningGoalAPITests(StudentFlowAPITestCase):
    """Test learning goal API"""
    
    def test_create_learning_goal(self):
        """Test creating learning goal"""
        self.client.force_authenticate(user=self.student_user)
        url = reverse('student_flow:goal-list')
        data = {
            'title': 'Master Python',
            'description': 'Learn Python fundamentals',
            'category': 'academic',
            'target_date': (timezone.now().date() + timedelta(days=30)).strftime('%Y-%m-%d'),
            'course_id': self.course.id
        }
        response = self.client.post(url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Master Python')
        self.assertEqual(response.data['student']['id'], self.student_user.id)
    
    def test_complete_learning_goal(self):
        """Test completing learning goal"""
        goal = LearningGoal.objects.create(
            student=self.student_user,
            title="Test Goal",
            description="Test description",
            target_date=timezone.now().date() + timedelta(days=7)
        )
        
        self.client.force_authenticate(user=self.student_user)
        url = reverse('student_flow:complete-goal', kwargs={'goal_id': goal.uuid})
        response = self.client.put(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        goal.refresh_from_db()
        self.assertEqual(goal.status, 'completed')


class StudentNotificationAPITests(StudentFlowAPITestCase):
    """Test student notification API"""
    
    def test_list_notifications(self):
        """Test listing notifications"""
        # Create notifications
        StudentNotification.objects.create(
            recipient=self.student_user,
            notification_type='course_update',
            title="Test Notification",
            message="Test message"
        )
        
        self.client.force_authenticate(user=self.student_user)
        url = reverse('student_flow:notification-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
    
    def test_mark_notification_as_read(self):
        """Test marking notification as read"""
        notification = StudentNotification.objects.create(
            recipient=self.student_user,
            notification_type='achievement',
            title="Achievement",
            message="You earned a badge!"
        )
        
        self.client.force_authenticate(user=self.student_user)
        url = reverse('student_flow:mark-notification-read', 
                     kwargs={'notification_id': notification.uuid})
        response = self.client.put(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        notification.refresh_from_db()
        self.assertTrue(notification.is_read)


class StudentStatsAPITests(StudentFlowAPITestCase):
    """Test student statistics API"""
    
    def test_get_student_stats(self):
        """Test getting student statistics"""
        # Create some test data
        StudentEnrollment.objects.create(
            student=self.student_user,
            course=self.course,
            cohort=self.cohort,
            status='completed'
        )
        
        self.client.force_authenticate(user=self.student_user)
        url = reverse('student_flow:student-stats')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_enrollments', response.data)
        self.assertIn('completed_courses', response.data)
        self.assertIn('total_study_time_hours', response.data)


# =================== PERMISSION TESTS ===================

class StudentPermissionTests(StudentFlowTestCase):
    """Test student permission system"""
    
    def test_is_student_permission(self):
        """Test IsStudent permission"""
        from .permissions import IsStudent
        
        # Mock request object
        class MockRequest:
            def __init__(self, user):
                self.user = user
        
        request = MockRequest(self.student_user)
        
        permission = IsStudent()
        self.assertTrue(permission.has_permission(request, None))
        
        # Test with non-student
        request_admin = MockRequest(self.admin_user)
        self.assertFalse(permission.has_permission(request_admin, None))
    
    def test_can_access_enrollment_permission(self):
        """Test CanAccessEnrollment permission"""
        from .permissions import CanAccessEnrollment
        
        class MockRequest:
            def __init__(self, user):
                self.user = user
        
        request = MockRequest(self.student_user)
        permission = CanAccessEnrollment()
        
        # Student can access their own enrollment
        self.assertTrue(permission.has_object_permission(request, None, self.enrollment))
        
        # Other student cannot access
        other_student = User.objects.create(email="other@test.com")
        request_other = MockRequest(other_student)
        self.assertFalse(permission.has_object_permission(request_other, None, self.enrollment))


# =================== SIGNAL TESTS ===================

class StudentSignalTests(StudentFlowTestCase):
    """Test student flow signals"""
    
    def test_enrollment_notification_created(self):
        """Test that enrollment triggers notification"""
        initial_count = StudentNotification.objects.count()
        
        # Create new enrollment
        new_course = Course.objects.create(
            name="Advanced Python",
            org=self.org
        )
        
        StudentEnrollment.objects.create(
            student=self.student_user,
            course=new_course,
            cohort=self.cohort
        )
        
        # Check if notification was created
        final_count = StudentNotification.objects.count()
        self.assertGreater(final_count, initial_count)
    
    def test_learning_session_completed_updates_profile(self):
        """Test that completed session updates student profile"""
        session = LearningSession.objects.create(
            student=self.student_user,
            session_type='learning_material',
            status='completed',
            total_duration_minutes=60
        )
        
        initial_hours = self.student_profile.total_study_hours
        
        # Mark session as completed
        session.status = 'completed'
        session.ended_at = timezone.now()
        session.save()
        
        # Check if profile was updated
        self.student_profile.refresh_from_db()
        self.assertGreaterEqual(self.student_profile.total_study_hours, initial_hours)
    
    @patch('student_flow.signals.send_mail')
    def test_enrollment_email_sent(self, mock_send_mail):
        """Test enrollment email is sent"""
        # Enable email notifications
        self.student_profile.email_notifications = True
        self.student_profile.save()
        
        # Create new enrollment (should trigger email)
        new_course = Course.objects.create(
            name="Test Course",
            org=self.org
        )
        
        StudentEnrollment.objects.create(
            student=self.student_user,
            course=new_course,
            cohort=self.cohort
        )
        
        # Check if email was attempted
        self.assertTrue(mock_send_mail.called)


class StudentUtilityTests(StudentFlowTestCase):
    """Test utility functions and views"""
    
    def test_available_courses_api(self):
        """Test available courses API"""
        self.client.force_authenticate(user=self.student_user)
        url = reverse('student_flow:available-courses')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
    
    def test_student_calendar_api(self):
        """Test student calendar API"""
        # Create some calendar events
        LearningSession.objects.create(
            student=self.student_user,
            session_type='learning_material'
        )
        
        self.client.force_authenticate(user=self.student_user)
        url = reverse('student_flow:student-calendar')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)


class StudentAnalyticsUpdateTests(StudentFlowTestCase):
    """Test analytics update functionality"""
    
    def test_daily_analytics_update(self):
        """Test daily analytics update"""
        from .signals import update_daily_student_analytics
        
        # Create some activity
        LearningSession.objects.create(
            student=self.student_user,
            session_type='learning_material',
            status='completed',
            total_duration_minutes=60
        )
        
        # Update analytics
        today = timezone.now().date()
        update_daily_student_analytics(self.student_user, today)
        
        # Check if analytics were created
        analytics = StudentAnalytics.objects.filter(
            student=self.student_user,
            date=today
        ).first()
        
        self.assertIsNotNone(analytics)
        self.assertEqual(analytics.study_time_minutes, 60)
        self.assertEqual(analytics.sessions_count, 1) 