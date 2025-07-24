from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    StudentProfile, StudentEnrollment, LearningSession, AssignmentSubmission,
    StudyGroup, StudyGroupMembership, LearningResource, LearningGoal,
    QuizAttempt, StudentNotification, StudentAnalytics, StudentAchievement,
    Organization, Cohort, Course, Task, Question, TaskCompletion
)

User = get_user_model()


# =================== BASIC SERIALIZERS ===================

class UserBasicSerializer(serializers.ModelSerializer):
    """Basic user serializer for nested representations"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'full_name']
        read_only_fields = ['id', 'email', 'first_name', 'last_name']
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}".strip()


class OrganizationBasicSerializer(serializers.ModelSerializer):
    """Basic organization serializer"""
    class Meta:
        model = Organization
        fields = ['id', 'name', 'slug']
        read_only_fields = ['id', 'name', 'slug']


class CohortBasicSerializer(serializers.ModelSerializer):
    """Basic cohort serializer"""
    organization = OrganizationBasicSerializer(source='org', read_only=True)
    
    class Meta:
        model = Cohort
        fields = ['id', 'name', 'description', 'organization', 'is_active']
        read_only_fields = ['id', 'name', 'description', 'organization', 'is_active']


class CourseBasicSerializer(serializers.ModelSerializer):
    """Basic course serializer"""
    organization = OrganizationBasicSerializer(source='org', read_only=True)
    
    class Meta:
        model = Course
        fields = [
            'id', 'name', 'description', 'status', 'difficulty_level',
            'estimated_duration_weeks', 'learning_objectives', 'tags',
            'thumbnail_url', 'organization'
        ]
        read_only_fields = [
            'id', 'name', 'description', 'status', 'difficulty_level',
            'estimated_duration_weeks', 'learning_objectives', 'tags',
            'thumbnail_url', 'organization'
        ]


class TaskBasicSerializer(serializers.ModelSerializer):
    """Basic task serializer"""
    class Meta:
        model = Task
        fields = [
            'id', 'type', 'title', 'description', 'difficulty_level',
            'estimated_time_minutes', 'points', 'status'
        ]
        read_only_fields = [
            'id', 'type', 'title', 'description', 'difficulty_level',
            'estimated_time_minutes', 'points', 'status'
        ]


# =================== STUDENT PROFILE ===================

class StudentProfileSerializer(serializers.ModelSerializer):
    """Comprehensive student profile serializer"""
    user = UserBasicSerializer(read_only=True)
    completion_rate = serializers.ReadOnlyField()
    current_courses_count = serializers.ReadOnlyField()
    
    class Meta:
        model = StudentProfile
        fields = [
            'id', 'user', 'bio', 'learning_style', 'preferred_difficulty',
            'study_hours_per_week', 'timezone', 'learning_objectives', 'interests',
            'career_goals', 'status', 'enrollment_date', 'graduation_date',
            'overall_grade', 'completed_courses', 'total_study_hours', 'streak_days',
            'last_activity_date', 'email_notifications', 'reminder_frequency',
            'completion_rate', 'current_courses_count', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'user', 'enrollment_date', 'overall_grade', 'completed_courses',
            'total_study_hours', 'streak_days', 'last_activity_date',
            'completion_rate', 'current_courses_count', 'created_at', 'updated_at'
        ]


class StudentProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating student profile"""
    class Meta:
        model = StudentProfile
        fields = [
            'bio', 'learning_style', 'preferred_difficulty', 'study_hours_per_week',
            'timezone', 'learning_objectives', 'interests', 'career_goals',
            'email_notifications', 'reminder_frequency'
        ]


# =================== ENROLLMENT ===================

class StudentEnrollmentSerializer(serializers.ModelSerializer):
    """Student enrollment serializer"""
    student = UserBasicSerializer(read_only=True)
    course = CourseBasicSerializer(read_only=True)
    cohort = CohortBasicSerializer(read_only=True)
    enrolled_by = UserBasicSerializer(read_only=True)
    is_overdue = serializers.ReadOnlyField()
    days_since_enrollment = serializers.ReadOnlyField()
    
    # Write-only fields for creation
    student_id = serializers.IntegerField(write_only=True, required=False)
    course_id = serializers.IntegerField(write_only=True)
    cohort_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = StudentEnrollment
        fields = [
            'id', 'uuid', 'student', 'course', 'cohort', 'status',
            'enrolled_at', 'started_at', 'completed_at', 'expected_completion_date',
            'progress_percentage', 'current_milestone', 'grade', 'certificate_issued',
            'certificate_url', 'enrolled_by', 'notes', 'is_overdue',
            'days_since_enrollment', 'created_at', 'updated_at',
            'student_id', 'course_id', 'cohort_id'
        ]
        read_only_fields = [
            'id', 'uuid', 'enrolled_at', 'certificate_issued', 'certificate_url',
            'is_overdue', 'days_since_enrollment', 'created_at', 'updated_at'
        ]


# =================== LEARNING SESSIONS ===================

class LearningSessionSerializer(serializers.ModelSerializer):
    """Learning session tracking serializer"""
    student = UserBasicSerializer(read_only=True)
    course = CourseBasicSerializer(read_only=True)
    task = TaskBasicSerializer(read_only=True)
    accuracy_rate = serializers.ReadOnlyField()
    
    # Write-only fields
    course_id = serializers.IntegerField(write_only=True, required=False)
    task_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = LearningSession
        fields = [
            'id', 'uuid', 'student', 'course', 'task', 'session_type', 'status',
            'started_at', 'ended_at', 'total_duration_minutes', 'active_duration_minutes',
            'progress_at_start', 'progress_at_end', 'tasks_completed', 'questions_answered',
            'correct_answers', 'points_earned', 'student_notes', 'difficulties_encountered',
            'satisfaction_rating', 'device_type', 'browser', 'accuracy_rate',
            'created_at', 'updated_at', 'course_id', 'task_id'
        ]
        read_only_fields = [
            'id', 'uuid', 'student', 'started_at', 'total_duration_minutes',
            'accuracy_rate', 'created_at', 'updated_at'
        ]


class LearningSessionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating learning sessions"""
    course_id = serializers.IntegerField(required=False)
    task_id = serializers.IntegerField(required=False)
    
    class Meta:
        model = LearningSession
        fields = [
            'session_type', 'course_id', 'task_id', 'device_type', 'browser'
        ]


# =================== ASSIGNMENTS ===================

class AssignmentSubmissionSerializer(serializers.ModelSerializer):
    """Assignment submission serializer"""
    student = UserBasicSerializer(read_only=True)
    task = TaskBasicSerializer(read_only=True)
    course = CourseBasicSerializer(read_only=True)
    grader = UserBasicSerializer(read_only=True)
    percentage_score = serializers.ReadOnlyField()
    
    # Write-only fields
    task_id = serializers.IntegerField(write_only=True)
    course_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = AssignmentSubmission
        fields = [
            'id', 'uuid', 'student', 'task', 'course', 'status', 'content',
            'file_urls', 'metadata', 'version', 'parent_submission', 'created_at',
            'submitted_at', 'graded_at', 'score', 'max_score', 'grade_letter',
            'is_passed', 'grader', 'grader_feedback', 'grading_rubric',
            'student_response', 'revision_notes', 'requires_attention', 'is_late',
            'plagiarism_checked', 'plagiarism_score', 'percentage_score',
            'task_id', 'course_id'
        ]
        read_only_fields = [
            'id', 'uuid', 'student', 'version', 'created_at', 'submitted_at',
            'graded_at', 'grader', 'grader_feedback', 'grading_rubric',
            'requires_attention', 'is_late', 'plagiarism_checked',
            'plagiarism_score', 'percentage_score'
        ]


class AssignmentSubmissionCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating assignment submissions"""
    task_id = serializers.IntegerField()
    course_id = serializers.IntegerField()
    
    class Meta:
        model = AssignmentSubmission
        fields = ['task_id', 'course_id', 'content', 'file_urls', 'metadata']


# =================== STUDY GROUPS ===================

class StudyGroupSerializer(serializers.ModelSerializer):
    """Study group serializer"""
    creator = UserBasicSerializer(read_only=True)
    moderators = UserBasicSerializer(many=True, read_only=True)
    organization = OrganizationBasicSerializer(read_only=True)
    course = CourseBasicSerializer(read_only=True)
    cohort = CohortBasicSerializer(read_only=True)
    member_count = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    
    # Write-only fields
    organization_id = serializers.IntegerField(write_only=True)
    course_id = serializers.IntegerField(write_only=True, required=False)
    cohort_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = StudyGroup
        fields = [
            'id', 'uuid', 'name', 'description', 'organization', 'course', 'cohort',
            'status', 'join_policy', 'max_members', 'creator', 'moderators',
            'last_activity', 'session_count', 'meeting_schedule', 'meeting_link',
            'timezone', 'member_count', 'is_full', 'created_at', 'updated_at',
            'organization_id', 'course_id', 'cohort_id'
        ]
        read_only_fields = [
            'id', 'uuid', 'creator', 'last_activity', 'session_count',
            'member_count', 'is_full', 'created_at', 'updated_at'
        ]


class StudyGroupMembershipSerializer(serializers.ModelSerializer):
    """Study group membership serializer"""
    study_group = StudyGroupSerializer(read_only=True)
    student = UserBasicSerializer(read_only=True)
    approved_by = UserBasicSerializer(read_only=True)
    
    # Write-only fields
    study_group_id = serializers.UUIDField(write_only=True)
    
    class Meta:
        model = StudyGroupMembership
        fields = [
            'id', 'uuid', 'study_group', 'student', 'status', 'role',
            'joined_at', 'approved_at', 'left_at', 'last_active',
            'sessions_attended', 'contributions', 'approved_by',
            'join_message', 'created_at', 'updated_at', 'study_group_id'
        ]
        read_only_fields = [
            'id', 'uuid', 'student', 'joined_at', 'approved_at', 'left_at',
            'last_active', 'sessions_attended', 'contributions', 'approved_by',
            'created_at', 'updated_at'
        ]


# =================== LEARNING RESOURCES ===================

class LearningResourceSerializer(serializers.ModelSerializer):
    """Learning resource serializer"""
    student = UserBasicSerializer(read_only=True)
    course = CourseBasicSerializer(read_only=True)
    task = TaskBasicSerializer(read_only=True)
    
    # Write-only fields
    course_id = serializers.IntegerField(write_only=True, required=False)
    task_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = LearningResource
        fields = [
            'id', 'uuid', 'student', 'resource_type', 'title', 'description',
            'content', 'url', 'file_url', 'course', 'task', 'tags', 'folder',
            'is_public', 'is_favorite', 'last_accessed', 'access_count',
            'created_at', 'updated_at', 'course_id', 'task_id'
        ]
        read_only_fields = [
            'id', 'uuid', 'student', 'last_accessed', 'access_count',
            'created_at', 'updated_at'
        ]


# =================== LEARNING GOALS ===================

class LearningGoalSerializer(serializers.ModelSerializer):
    """Learning goal serializer"""
    student = UserBasicSerializer(read_only=True)
    course = CourseBasicSerializer(read_only=True)
    related_tasks = TaskBasicSerializer(many=True, read_only=True)
    days_until_target = serializers.ReadOnlyField()
    is_overdue = serializers.ReadOnlyField()
    
    # Write-only fields
    course_id = serializers.IntegerField(write_only=True, required=False)
    related_task_ids = serializers.ListField(
        child=serializers.IntegerField(), write_only=True, required=False
    )
    
    class Meta:
        model = LearningGoal
        fields = [
            'id', 'uuid', 'student', 'title', 'description', 'category',
            'status', 'priority', 'course', 'related_tasks', 'target_date',
            'started_at', 'completed_at', 'progress_percentage', 'success_criteria',
            'milestones', 'notes', 'challenges', 'learnings', 'reminder_frequency',
            'last_reminder_sent', 'days_until_target', 'is_overdue',
            'created_at', 'updated_at', 'course_id', 'related_task_ids'
        ]
        read_only_fields = [
            'id', 'uuid', 'student', 'started_at', 'completed_at',
            'last_reminder_sent', 'days_until_target', 'is_overdue',
            'created_at', 'updated_at'
        ]


# =================== QUIZ ATTEMPTS ===================

class QuizAttemptSerializer(serializers.ModelSerializer):
    """Quiz attempt serializer"""
    student = UserBasicSerializer(read_only=True)
    task = TaskBasicSerializer(read_only=True)
    course = CourseBasicSerializer(read_only=True)
    accuracy_rate = serializers.ReadOnlyField()
    
    # Write-only fields
    task_id = serializers.IntegerField(write_only=True)
    course_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = QuizAttempt
        fields = [
            'id', 'uuid', 'student', 'task', 'course', 'attempt_number',
            'status', 'started_at', 'completed_at', 'time_limit_minutes',
            'time_spent_minutes', 'score', 'max_score', 'percentage_score',
            'is_passed', 'total_questions', 'questions_answered', 'correct_answers',
            'answers', 'question_order', 'feedback_shown', 'can_retake',
            'review_mode', 'accuracy_rate', 'created_at', 'updated_at',
            'task_id', 'course_id'
        ]
        read_only_fields = [
            'id', 'uuid', 'student', 'attempt_number', 'started_at',
            'completed_at', 'time_spent_minutes', 'percentage_score',
            'accuracy_rate', 'created_at', 'updated_at'
        ]


class QuizAttemptCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating quiz attempts"""
    task_id = serializers.IntegerField()
    course_id = serializers.IntegerField()
    
    class Meta:
        model = QuizAttempt
        fields = ['task_id', 'course_id', 'time_limit_minutes']


# =================== NOTIFICATIONS ===================

class StudentNotificationSerializer(serializers.ModelSerializer):
    """Student notification serializer"""
    recipient = UserBasicSerializer(read_only=True)
    course = CourseBasicSerializer(read_only=True)
    task = TaskBasicSerializer(read_only=True)
    study_group = StudyGroupSerializer(read_only=True)
    
    class Meta:
        model = StudentNotification
        fields = [
            'id', 'uuid', 'recipient', 'notification_type', 'priority',
            'title', 'message', 'course', 'task', 'study_group',
            'action_url', 'action_text', 'is_read', 'read_at',
            'sent_via_email', 'email_sent_at', 'expires_at', 'metadata',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'uuid', 'recipient', 'read_at', 'sent_via_email',
            'email_sent_at', 'created_at', 'updated_at'
        ]


# =================== ANALYTICS ===================

class StudentAnalyticsSerializer(serializers.ModelSerializer):
    """Student analytics serializer"""
    student = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = StudentAnalytics
        fields = [
            'id', 'student', 'date', 'study_time_minutes', 'sessions_count',
            'tasks_completed', 'questions_answered', 'correct_answers',
            'average_score', 'accuracy_rate', 'courses_enrolled',
            'courses_in_progress', 'courses_completed', 'overall_progress',
            'login_count', 'resource_views', 'forum_posts', 'study_group_activities',
            'goals_created', 'goals_completed', 'goals_overdue', 'study_streak_days',
            'achievements_earned', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'student', 'created_at', 'updated_at'
        ]


# =================== ACHIEVEMENTS ===================

class StudentAchievementSerializer(serializers.ModelSerializer):
    """Student achievement serializer"""
    student = UserBasicSerializer(read_only=True)
    course = CourseBasicSerializer(read_only=True)
    task = TaskBasicSerializer(read_only=True)
    
    class Meta:
        model = StudentAchievement
        fields = [
            'id', 'uuid', 'student', 'achievement_type', 'title', 'description',
            'badge_icon', 'badge_color', 'course', 'task', 'criteria_met',
            'points_earned', 'is_public', 'is_featured', 'earned_at',
            'notified_at'
        ]
        read_only_fields = [
            'id', 'uuid', 'student', 'earned_at', 'notified_at'
        ]


# =================== DASHBOARD SERIALIZERS ===================

class StudentDashboardSerializer(serializers.Serializer):
    """Student dashboard summary serializer"""
    student_profile = StudentProfileSerializer()
    current_enrollments = StudentEnrollmentSerializer(many=True)
    recent_sessions = LearningSessionSerializer(many=True)
    pending_assignments = AssignmentSubmissionSerializer(many=True)
    upcoming_deadlines = serializers.ListField(child=serializers.DictField())
    study_groups = StudyGroupSerializer(many=True)
    recent_achievements = StudentAchievementSerializer(many=True)
    learning_goals = LearningGoalSerializer(many=True)
    unread_notifications = StudentNotificationSerializer(many=True)
    
    # Statistics
    total_study_hours = serializers.IntegerField()
    courses_in_progress = serializers.IntegerField()
    completion_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    current_streak = serializers.IntegerField()
    weekly_progress = serializers.DictField()


class StudentProgressSummarySerializer(serializers.Serializer):
    """Student progress summary for courses"""
    course = CourseBasicSerializer()
    enrollment = StudentEnrollmentSerializer()
    completed_tasks = serializers.IntegerField()
    total_tasks = serializers.IntegerField()
    progress_percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
    average_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    time_spent_minutes = serializers.IntegerField()
    next_deadline = serializers.DateTimeField()
    recent_activity = serializers.DateTimeField()


# =================== TASK COMPLETION SERIALIZERS ===================

class TaskCompletionSerializer(serializers.ModelSerializer):
    """Task completion tracking serializer"""
    user = UserBasicSerializer(read_only=True)
    task = TaskBasicSerializer(read_only=True)
    question = serializers.SerializerMethodField()
    
    class Meta:
        model = TaskCompletion
        fields = [
            'id', 'user', 'task', 'question', 'score', 'max_score',
            'time_spent_minutes', 'attempts', 'is_passed', 'completed_at'
        ]
        read_only_fields = [
            'id', 'user', 'task', 'question', 'completed_at'
        ]
    
    def get_question(self, obj):
        if obj.question:
            return {
                'id': obj.question.id,
                'title': obj.question.title,
                'type': obj.question.type
            }
        return None 