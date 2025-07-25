from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import Count, Avg, Sum, Q, F
from django.db import transaction
from datetime import datetime, timedelta
from rest_framework import generics, permissions, status, views
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model

from .models import (
    StudentProfile, StudentEnrollment, LearningSession, AssignmentSubmission,
    StudyGroup, StudyGroupMembership, LearningResource, LearningGoal,
    QuizAttempt, StudentNotification, StudentAnalytics, StudentAchievement,
    Organization, Cohort, Course, Task, Question, TaskCompletion, UserCohort
)
from .serializers import (
    StudentProfileSerializer, StudentProfileUpdateSerializer, StudentEnrollmentSerializer,
    LearningSessionSerializer, LearningSessionCreateSerializer, AssignmentSubmissionSerializer,
    AssignmentSubmissionCreateSerializer, StudyGroupSerializer, StudyGroupMembershipSerializer,
    LearningResourceSerializer, LearningGoalSerializer, QuizAttemptSerializer,
    QuizAttemptCreateSerializer, StudentNotificationSerializer, StudentAnalyticsSerializer,
    StudentAchievementSerializer, StudentDashboardSerializer, StudentProgressSummarySerializer,
    TaskCompletionSerializer
)
from .permissions import (
    IsStudent, IsStudentOwner, CanAccessEnrollment, CanAccessStudyGroup,
    CanJoinStudyGroup, CanModerateStudyGroup, CanViewStudentProgress,
    CanSubmitAssignment, CanGradeAssignment, CanAccessLearningResource,
    CanManageGoals, CanAccessNotifications, CanAccessAnalytics,
    StudentInSameOrganization, EnrolledStudentOnly, ActiveStudentOnly
)

User = get_user_model()


# =================== STUDENT PROFILE VIEWS ===================

class StudentProfileView(generics.RetrieveUpdateAPIView):
    """View and update student profile"""
    serializer_class = StudentProfileSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    
    def get_object(self):
        profile, created = StudentProfile.objects.get_or_create(
            user=self.request.user,
            defaults={
                'bio': '',
                'learning_style': 'mixed',
                'preferred_difficulty': 'beginner',
                'study_hours_per_week': 10,
                'timezone': 'UTC'
            }
        )
        return profile
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return StudentProfileUpdateSerializer
        return StudentProfileSerializer


class CreateStudentProfileView(generics.CreateAPIView):
    """Create a new student profile"""
    serializer_class = StudentProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# =================== DASHBOARD VIEWS ===================

class StudentDashboardView(APIView):
    """Comprehensive student dashboard"""
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    
    def get(self, request):
        user = request.user
        
        # Get or create student profile
        student_profile, created = StudentProfile.objects.get_or_create(
            user=user,
            defaults={'bio': '', 'learning_style': 'mixed'}
        )
        
        # Get current enrollments
        current_enrollments = StudentEnrollment.objects.filter(
            student=user,
            status__in=['enrolled', 'in_progress']
        ).select_related('course', 'cohort', 'course__org')[:5]
        
        # Get recent learning sessions
        recent_sessions = LearningSession.objects.filter(
            student=user,
            status='completed'
        ).select_related('course', 'task').order_by('-started_at')[:10]
        
        # Get pending assignments
        pending_assignments = AssignmentSubmission.objects.filter(
            student=user,
            status__in=['draft', 'submitted', 'returned']
        ).select_related('task', 'course').order_by('-created_at')[:5]
        
        # Get upcoming deadlines
        upcoming_deadlines = self.get_upcoming_deadlines(user)
        
        # Get study groups
        study_groups = StudyGroup.objects.filter(
            memberships__student=user,
            memberships__status='active',
            status='active'
        ).distinct()[:5]
        
        # Get recent achievements
        recent_achievements = StudentAchievement.objects.filter(
            student=user
        ).order_by('-earned_at')[:5]
        
        # Get learning goals
        learning_goals = LearningGoal.objects.filter(
            student=user,
            status__in=['not_started', 'in_progress']
        ).order_by('target_date')[:5]
        
        # Get unread notifications
        unread_notifications = StudentNotification.objects.filter(
            recipient=user,
            is_read=False
        ).order_by('-created_at')[:10]
        
        # Calculate statistics
        stats = self.calculate_dashboard_stats(user)
        
        dashboard_data = {
            'student_profile': StudentProfileSerializer(student_profile).data,
            'current_enrollments': StudentEnrollmentSerializer(current_enrollments, many=True).data,
            'recent_sessions': LearningSessionSerializer(recent_sessions, many=True).data,
            'pending_assignments': AssignmentSubmissionSerializer(pending_assignments, many=True).data,
            'upcoming_deadlines': upcoming_deadlines,
            'study_groups': StudyGroupSerializer(study_groups, many=True).data,
            'recent_achievements': StudentAchievementSerializer(recent_achievements, many=True).data,
            'learning_goals': LearningGoalSerializer(learning_goals, many=True).data,
            'unread_notifications': StudentNotificationSerializer(unread_notifications, many=True).data,
            **stats
        }
        
        return Response(dashboard_data)
    
    def get_upcoming_deadlines(self, user):
        """Get upcoming assignment deadlines and goal targets"""
        deadlines = []
        
        # Assignment deadlines
        assignments = AssignmentSubmission.objects.filter(
            student=user,
            status__in=['draft', 'submitted'],
            task__coursetask__due_date__isnull=False,
            task__coursetask__due_date__gte=timezone.now()
        ).select_related('task', 'course').order_by('task__coursetask__due_date')[:5]
        
        for assignment in assignments:
            course_task = assignment.task.coursetask_set.first()
            if course_task and course_task.due_date:
                deadlines.append({
                    'type': 'assignment',
                    'title': assignment.task.title,
                    'course': assignment.course.name,
                    'due_date': course_task.due_date,
                    'days_remaining': (course_task.due_date.date() - timezone.now().date()).days
                })
        
        # Goal deadlines
        goals = LearningGoal.objects.filter(
            student=user,
            status__in=['not_started', 'in_progress'],
            target_date__gte=timezone.now().date()
        ).order_by('target_date')[:5]
        
        for goal in goals:
            deadlines.append({
                'type': 'goal',
                'title': goal.title,
                'course': goal.course.name if goal.course else None,
                'due_date': goal.target_date,
                'days_remaining': (goal.target_date - timezone.now().date()).days
            })
        
        return sorted(deadlines, key=lambda x: x['due_date'])[:10]
    
    def calculate_dashboard_stats(self, user):
        """Calculate dashboard statistics"""
        # Total study hours
        total_study_hours = LearningSession.objects.filter(
            student=user,
            status='completed'
        ).aggregate(
            total=Sum('total_duration_minutes')
        )['total'] or 0
        total_study_hours = total_study_hours // 60  # Convert to hours
        
        # Courses in progress
        courses_in_progress = StudentEnrollment.objects.filter(
            student=user,
            status='in_progress'
        ).count()
        
        # Overall completion rate
        completion_rate = 0
        if hasattr(user, 'student_profile'):
            completion_rate = user.student_profile.completion_rate
        
        # Current streak
        current_streak = 0
        if hasattr(user, 'student_profile'):
            current_streak = user.student_profile.streak_days
        
        # Weekly progress (last 7 days)
        week_ago = timezone.now() - timedelta(days=7)
        weekly_sessions = LearningSession.objects.filter(
            student=user,
            started_at__gte=week_ago,
            status='completed'
        ).values('started_at__date').annotate(
            sessions=Count('id'),
            minutes=Sum('total_duration_minutes')
        ).order_by('started_at__date')
        
        weekly_progress = {}
        for session in weekly_sessions:
            date_str = session['started_at__date'].strftime('%Y-%m-%d')
            weekly_progress[date_str] = {
                'sessions': session['sessions'],
                'minutes': session['minutes'] or 0
            }
        
        return {
            'total_study_hours': total_study_hours,
            'courses_in_progress': courses_in_progress,
            'completion_rate': completion_rate,
            'current_streak': current_streak,
            'weekly_progress': weekly_progress
        }


class StudentProgressView(APIView):
    """Student progress summary across all courses"""
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    
    def get(self, request):
        user = request.user
        
        # Get all enrollments
        enrollments = StudentEnrollment.objects.filter(
            student=user
        ).select_related('course', 'cohort').prefetch_related(
            'course__coursetask_set__task'
        )
        
        progress_summaries = []
        
        for enrollment in enrollments:
            course = enrollment.course
            
            # Get tasks for this course
            course_tasks = course.coursetask_set.all()
            total_tasks = course_tasks.count()
            
            # Get completed tasks
            completed_task_ids = TaskCompletion.objects.filter(
                user=user,
                task__in=[ct.task for ct in course_tasks],
                is_passed=True
            ).values_list('task_id', flat=True)
            completed_tasks = len(completed_task_ids)
            
            # Calculate average score
            avg_score = TaskCompletion.objects.filter(
                user=user,
                task__in=[ct.task for ct in course_tasks],
                score__isnull=False
            ).aggregate(avg=Avg('score'))['avg'] or 0
            
            # Time spent on course
            time_spent = LearningSession.objects.filter(
                student=user,
                course=course,
                status='completed'
            ).aggregate(total=Sum('total_duration_minutes'))['total'] or 0
            
            # Next deadline
            next_deadline = course_tasks.filter(
                due_date__gte=timezone.now()
            ).order_by('due_date').first()
            
            # Recent activity
            recent_activity = LearningSession.objects.filter(
                student=user,
                course=course
            ).order_by('-started_at').first()
            
            progress_summaries.append({
                'course': course,
                'enrollment': enrollment,
                'completed_tasks': completed_tasks,
                'total_tasks': total_tasks,
                'progress_percentage': (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0,
                'average_score': float(avg_score),
                'time_spent_minutes': time_spent,
                'next_deadline': next_deadline.due_date if next_deadline else None,
                'recent_activity': recent_activity.started_at if recent_activity else None
            })
        
        serializer = StudentProgressSummarySerializer(progress_summaries, many=True)
        return Response(serializer.data)


# =================== ENROLLMENT VIEWS ===================

class StudentEnrollmentListView(generics.ListAPIView):
    """List student's enrollments"""
    serializer_class = StudentEnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    
    def get_queryset(self):
        return StudentEnrollment.objects.filter(
            student=self.request.user
        ).select_related('course', 'cohort', 'course__org').order_by('-enrolled_at')


class StudentEnrollmentDetailView(generics.RetrieveAPIView):
    """Get detailed enrollment information"""
    serializer_class = StudentEnrollmentSerializer
    permission_classes = [permissions.IsAuthenticated, CanAccessEnrollment]
    
    def get_queryset(self):
        return StudentEnrollment.objects.select_related(
            'course', 'cohort', 'course__org', 'enrolled_by'
        )


# =================== LEARNING SESSIONS ===================

class LearningSessionListView(generics.ListCreateAPIView):
    """List and create learning sessions"""
    serializer_class = LearningSessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    
    def get_queryset(self):
        return LearningSession.objects.filter(
            student=self.request.user
        ).select_related('course', 'task').order_by('-started_at')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return LearningSessionCreateSerializer
        return LearningSessionSerializer
    
    def perform_create(self, serializer):
        serializer.save(student=self.request.user)


class LearningSessionDetailView(generics.RetrieveUpdateAPIView):
    """Get and update learning session details"""
    serializer_class = LearningSessionSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudentOwner]
    
    def get_queryset(self):
        return LearningSession.objects.filter(
            student=self.request.user
        ).select_related('course', 'task')


class EndLearningSessionView(APIView):
    """End an active learning session"""
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    
    def put(self, request, session_id):
        session = get_object_or_404(
            LearningSession,
            uuid=session_id,
            student=request.user,
            status='active'
        )
        
        session.end_session()
        
        # Update student profile activity
        if hasattr(request.user, 'student_profile'):
            request.user.student_profile.update_streak()
        
        return Response(LearningSessionSerializer(session).data)


# =================== ASSIGNMENT SUBMISSIONS ===================

class AssignmentSubmissionListView(generics.ListCreateAPIView):
    """List and create assignment submissions"""
    permission_classes = [permissions.IsAuthenticated, CanSubmitAssignment]
    
    def get_queryset(self):
        return AssignmentSubmission.objects.filter(
            student=self.request.user
        ).select_related('task', 'course', 'grader').order_by('-created_at')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AssignmentSubmissionCreateSerializer
        return AssignmentSubmissionSerializer
    
    def perform_create(self, serializer):
        serializer.save(student=self.request.user)


class AssignmentSubmissionDetailView(generics.RetrieveUpdateAPIView):
    """Get and update assignment submission"""
    serializer_class = AssignmentSubmissionSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudentOwner]
    
    def get_queryset(self):
        return AssignmentSubmission.objects.filter(
            student=self.request.user
        ).select_related('task', 'course', 'grader')


class SubmitAssignmentView(APIView):
    """Submit an assignment"""
    permission_classes = [permissions.IsAuthenticated, CanSubmitAssignment]
    
    def put(self, request, submission_id):
        submission = get_object_or_404(
            AssignmentSubmission,
            uuid=submission_id,
            student=request.user,
            status='draft'
        )
        
        submission.submit()
        
        return Response(AssignmentSubmissionSerializer(submission).data)


# =================== STUDY GROUPS ===================

class StudyGroupListView(generics.ListCreateAPIView):
    """List and create study groups"""
    serializer_class = StudyGroupSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    
    def get_queryset(self):
        user = self.request.user
        
        # Get user's organizations
        user_orgs = user.userorganization_set.values_list('org_id', flat=True)
        
        # Filter study groups
        queryset = StudyGroup.objects.filter(
            organization_id__in=user_orgs,
            status='active'
        ).select_related('organization', 'course', 'cohort', 'creator')
        
        # Add search functionality
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | Q(description__icontains=search)
            )
        
        # Filter by course
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        return queryset.order_by('-created_at')
    
    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)


class StudyGroupDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete study group"""
    serializer_class = StudyGroupSerializer
    permission_classes = [permissions.IsAuthenticated, CanAccessStudyGroup]
    
    def get_queryset(self):
        return StudyGroup.objects.select_related(
            'organization', 'course', 'cohort', 'creator'
        ).prefetch_related('moderators')


class JoinStudyGroupView(APIView):
    """Join a study group"""
    permission_classes = [permissions.IsAuthenticated, CanJoinStudyGroup]
    
    def post(self, request, group_id):
        study_group = get_object_or_404(StudyGroup, uuid=group_id)
        
        # Check permissions
        self.check_object_permissions(request, study_group)
        
        # Create membership
        membership, created = StudyGroupMembership.objects.get_or_create(
            study_group=study_group,
            student=request.user,
            defaults={
                'status': 'pending' if study_group.join_policy != 'open' else 'active',
                'join_message': request.data.get('message', '')
            }
        )
        
        if study_group.join_policy == 'open':
            membership.approve()
        
        return Response(StudyGroupMembershipSerializer(membership).data)


class LeaveStudyGroupView(APIView):
    """Leave a study group"""
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request, group_id):
        study_group = get_object_or_404(StudyGroup, uuid=group_id)
        membership = get_object_or_404(
            StudyGroupMembership,
            study_group=study_group,
            student=request.user,
            status='active'
        )
        
        membership.status = 'inactive'
        membership.left_at = timezone.now()
        membership.save()
        
        return Response({'detail': 'Successfully left the study group'})


class StudyGroupMembersView(generics.ListAPIView):
    """List study group members"""
    serializer_class = StudyGroupMembershipSerializer
    permission_classes = [permissions.IsAuthenticated, CanAccessStudyGroup]
    
    def get_queryset(self):
        group_id = self.kwargs['group_id']
        study_group = get_object_or_404(StudyGroup, uuid=group_id)
        
        # Check permissions
        self.check_object_permissions(self.request, study_group)
        
        return StudyGroupMembership.objects.filter(
            study_group=study_group,
            status='active'
        ).select_related('student').order_by('-joined_at')


# =================== LEARNING RESOURCES ===================

class LearningResourceListView(generics.ListCreateAPIView):
    """List and create learning resources"""
    serializer_class = LearningResourceSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    
    def get_queryset(self):
        queryset = LearningResource.objects.filter(
            student=self.request.user
        ).select_related('course', 'task').order_by('-created_at')
        
        # Filter by resource type
        resource_type = self.request.query_params.get('type')
        if resource_type:
            queryset = queryset.filter(resource_type=resource_type)
        
        # Filter by course
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        # Filter by folder
        folder = self.request.query_params.get('folder')
        if folder:
            queryset = queryset.filter(folder=folder)
        
        # Filter favorites
        favorites_only = self.request.query_params.get('favorites')
        if favorites_only == 'true':
            queryset = queryset.filter(is_favorite=True)
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(student=self.request.user)


class LearningResourceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete learning resource"""
    serializer_class = LearningResourceSerializer
    permission_classes = [permissions.IsAuthenticated, CanAccessLearningResource]
    
    def get_queryset(self):
        return LearningResource.objects.select_related('course', 'task')
    
    def retrieve(self, request, *args, **kwargs):
        # Track resource access
        instance = self.get_object()
        instance.access()
        return super().retrieve(request, *args, **kwargs)


class PublicLearningResourcesView(generics.ListAPIView):
    """List public learning resources from classmates"""
    serializer_class = LearningResourceSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    
    def get_queryset(self):
        user = self.request.user
        
        # Get user's courses
        user_courses = StudentEnrollment.objects.filter(
            student=user,
            status__in=['enrolled', 'in_progress']
        ).values_list('course_id', flat=True)
        
        # Get public resources from students in same courses
        return LearningResource.objects.filter(
            is_public=True,
            course_id__in=user_courses
        ).exclude(
            student=user
        ).select_related('student', 'course', 'task').order_by('-created_at')


# =================== LEARNING GOALS ===================

class LearningGoalListView(generics.ListCreateAPIView):
    """List and create learning goals"""
    serializer_class = LearningGoalSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    
    def get_queryset(self):
        queryset = LearningGoal.objects.filter(
            student=self.request.user
        ).select_related('course').prefetch_related('related_tasks')
        
        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by course
        course_id = self.request.query_params.get('course')
        if course_id:
            queryset = queryset.filter(course_id=course_id)
        
        return queryset.order_by('target_date')
    
    def perform_create(self, serializer):
        serializer.save(student=self.request.user)


class LearningGoalDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update, or delete learning goal"""
    serializer_class = LearningGoalSerializer
    permission_classes = [permissions.IsAuthenticated, CanManageGoals]
    
    def get_queryset(self):
        return LearningGoal.objects.filter(
            student=self.request.user
        ).select_related('course').prefetch_related('related_tasks')


class CompleteGoalView(APIView):
    """Mark a learning goal as completed"""
    permission_classes = [permissions.IsAuthenticated, CanManageGoals]
    
    def put(self, request, goal_id):
        goal = get_object_or_404(
            LearningGoal,
            uuid=goal_id,
            student=request.user
        )
        
        goal.mark_completed()
        
        return Response(LearningGoalSerializer(goal).data)


# =================== QUIZ ATTEMPTS ===================

class QuizAttemptListView(generics.ListCreateAPIView):
    """List and create quiz attempts"""
    permission_classes = [permissions.IsAuthenticated, EnrolledStudentOnly]
    
    def get_queryset(self):
        return QuizAttempt.objects.filter(
            student=self.request.user
        ).select_related('task', 'course').order_by('-started_at')
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return QuizAttemptCreateSerializer
        return QuizAttemptSerializer
    
    def perform_create(self, serializer):
        # Get the latest attempt number
        task_id = serializer.validated_data['task_id']
        latest_attempt = QuizAttempt.objects.filter(
            student=self.request.user,
            task_id=task_id
        ).order_by('-attempt_number').first()
        
        attempt_number = (latest_attempt.attempt_number + 1) if latest_attempt else 1
        
        serializer.save(
            student=self.request.user,
            attempt_number=attempt_number
        )


class QuizAttemptDetailView(generics.RetrieveUpdateAPIView):
    """Get and update quiz attempt"""
    serializer_class = QuizAttemptSerializer
    permission_classes = [permissions.IsAuthenticated, IsStudentOwner]
    
    def get_queryset(self):
        return QuizAttempt.objects.filter(
            student=self.request.user
        ).select_related('task', 'course')


class CompleteQuizAttemptView(APIView):
    """Complete a quiz attempt"""
    permission_classes = [permissions.IsAuthenticated, IsStudentOwner]
    
    def put(self, request, attempt_id):
        attempt = get_object_or_404(
            QuizAttempt,
            uuid=attempt_id,
            student=request.user,
            status='in_progress'
        )
        
        attempt.complete()
        
        return Response(QuizAttemptSerializer(attempt).data)


# =================== NOTIFICATIONS ===================

class StudentNotificationListView(generics.ListAPIView):
    """List student notifications"""
    serializer_class = StudentNotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = StudentNotification.objects.filter(
            recipient=self.request.user
        ).select_related('course', 'task', 'study_group').order_by('-created_at')
        
        # Filter by read status
        unread_only = self.request.query_params.get('unread')
        if unread_only == 'true':
            queryset = queryset.filter(is_read=False)
        
        return queryset


class MarkNotificationAsReadView(APIView):
    """Mark notification as read"""
    permission_classes = [permissions.IsAuthenticated, CanAccessNotifications]
    
    def put(self, request, notification_id):
        notification = get_object_or_404(
            StudentNotification,
            uuid=notification_id,
            recipient=request.user
        )
        
        notification.mark_as_read()
        
        return Response(StudentNotificationSerializer(notification).data)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_all_notifications_read(request):
    """Mark all notifications as read"""
    StudentNotification.objects.filter(
        recipient=request.user,
        is_read=False
    ).update(is_read=True, read_at=timezone.now())
    
    return Response({'detail': 'All notifications marked as read'})


# =================== ANALYTICS ===================

class StudentAnalyticsView(generics.ListAPIView):
    """Student analytics and metrics"""
    serializer_class = StudentAnalyticsSerializer
    permission_classes = [permissions.IsAuthenticated, CanAccessAnalytics]
    
    def get_queryset(self):
        # Get date range
        end_date = timezone.now().date()
        start_date = end_date - timedelta(days=30)
        
        date_from = self.request.query_params.get('date_from')
        if date_from:
            start_date = datetime.strptime(date_from, '%Y-%m-%d').date()
        
        date_to = self.request.query_params.get('date_to')
        if date_to:
            end_date = datetime.strptime(date_to, '%Y-%m-%d').date()
        
        return StudentAnalytics.objects.filter(
            student=self.request.user,
            date__range=[start_date, end_date]
        ).order_by('-date')


class StudentStatsView(APIView):
    """Student statistics and insights"""
    permission_classes = [permissions.IsAuthenticated, IsStudent]
    
    def get(self, request):
        user = request.user
        
        # Basic stats
        total_enrollments = StudentEnrollment.objects.filter(student=user).count()
        completed_courses = StudentEnrollment.objects.filter(
            student=user, 
            status='completed'
        ).count()
        
        total_study_time = LearningSession.objects.filter(
            student=user,
            status='completed'
        ).aggregate(total=Sum('total_duration_minutes'))['total'] or 0
        
        total_achievements = StudentAchievement.objects.filter(student=user).count()
        
        # Performance stats
        avg_quiz_score = QuizAttempt.objects.filter(
            student=user,
            status='completed'
        ).aggregate(avg=Avg('percentage_score'))['avg'] or 0
        
        total_assignments = AssignmentSubmission.objects.filter(student=user).count()
        passed_assignments = AssignmentSubmission.objects.filter(
            student=user,
            is_passed=True
        ).count()
        
        # Learning streaks
        current_streak = 0
        if hasattr(user, 'student_profile'):
            current_streak = user.student_profile.streak_days
        
        # Study habits (last 30 days)
        thirty_days_ago = timezone.now() - timedelta(days=30)
        study_habits = LearningSession.objects.filter(
            student=user,
            started_at__gte=thirty_days_ago,
            status='completed'
        ).extra(
            select={'hour': 'EXTRACT(hour FROM started_at)'}
        ).values('hour').annotate(
            sessions=Count('id')
        ).order_by('hour')
        
        # Subject preferences
        subject_time = LearningSession.objects.filter(
            student=user,
            status='completed',
            course__isnull=False
        ).values('course__name').annotate(
            time_spent=Sum('total_duration_minutes'),
            sessions=Count('id')
        ).order_by('-time_spent')[:5]
        
        stats = {
            'total_enrollments': total_enrollments,
            'completed_courses': completed_courses,
            'total_study_time_hours': total_study_time // 60,
            'total_achievements': total_achievements,
            'average_quiz_score': round(avg_quiz_score, 2),
            'assignment_pass_rate': (passed_assignments / total_assignments * 100) if total_assignments > 0 else 0,
            'current_streak_days': current_streak,
            'study_habits': list(study_habits),
            'top_subjects': list(subject_time)
        }
        
        return Response(stats)


# =================== ACHIEVEMENTS ===================

class StudentAchievementListView(generics.ListAPIView):
    """List student achievements"""
    serializer_class = StudentAchievementSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return StudentAchievement.objects.filter(
            student=self.request.user
        ).select_related('course', 'task').order_by('-earned_at')


# =================== TASK COMPLETION ===================

class TaskCompletionListView(generics.ListCreateAPIView):
    """List and create task completions"""
    serializer_class = TaskCompletionSerializer
    permission_classes = [permissions.IsAuthenticated, EnrolledStudentOnly]
    
    def get_queryset(self):
        return TaskCompletion.objects.filter(
            user=self.request.user
        ).select_related('task', 'question').order_by('-completed_at')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# =================== UTILITY VIEWS ===================

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsStudent])
def available_courses(request):
    """Get available courses for enrollment"""
    user = request.user
    
    # Get user's organizations
    user_orgs = user.userorganization_set.values_list('org_id', flat=True)
    
    # Get courses not already enrolled in
    enrolled_courses = StudentEnrollment.objects.filter(
        student=user
    ).values_list('course_id', flat=True)
    
    available = Course.objects.filter(
        org_id__in=user_orgs,
        status='published'
    ).exclude(
        id__in=enrolled_courses
    ).select_related('org')
    
    from .serializers import CourseBasicSerializer
    return Response(CourseBasicSerializer(available, many=True).data)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated, IsStudent])
def student_calendar(request):
    """Get student's learning calendar with sessions, deadlines, and goals"""
    user = request.user
    
    # Get date range
    start_date = request.GET.get('start', timezone.now().date().strftime('%Y-%m-%d'))
    end_date = request.GET.get('end', (timezone.now().date() + timedelta(days=30)).strftime('%Y-%m-%d'))
    
    start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
    end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
    
    calendar_events = []
    
    # Learning sessions
    sessions = LearningSession.objects.filter(
        student=user,
        started_at__date__range=[start_date, end_date]
    ).select_related('course', 'task')
    
    for session in sessions:
        calendar_events.append({
            'type': 'session',
            'title': f"Study: {session.course.name if session.course else 'General'}",
            'date': session.started_at.date(),
            'time': session.started_at.time(),
            'duration': session.total_duration_minutes,
            'course': session.course.name if session.course else None
        })
    
    # Assignment deadlines
    assignments = AssignmentSubmission.objects.filter(
        student=user,
        status__in=['draft', 'submitted'],
        task__coursetask__due_date__date__range=[start_date, end_date]
    ).select_related('task', 'course')
    
    for assignment in assignments:
        course_task = assignment.task.coursetask_set.first()
        if course_task and course_task.due_date:
            calendar_events.append({
                'type': 'deadline',
                'title': f"Due: {assignment.task.title}",
                'date': course_task.due_date.date(),
                'time': course_task.due_date.time(),
                'course': assignment.course.name
            })
    
    # Goal targets
    goals = LearningGoal.objects.filter(
        student=user,
        target_date__range=[start_date, end_date]
    )
    
    for goal in goals:
        calendar_events.append({
            'type': 'goal',
            'title': f"Goal: {goal.title}",
            'date': goal.target_date,
            'course': goal.course.name if goal.course else None
        })
    
    # Sort by date and time
    calendar_events.sort(key=lambda x: (x['date'], x.get('time', timezone.now().time())))
    
    return Response(calendar_events) 