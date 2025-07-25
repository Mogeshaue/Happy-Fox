from django.contrib import admin
from django.db.models import Count, Avg
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.http import HttpResponseRedirect
from django.contrib.admin import SimpleListFilter
from django.utils import timezone

from .models import (
    StudentProfile, StudentEnrollment, LearningSession, AssignmentSubmission,
    StudyGroup, StudyGroupMembership, LearningResource, LearningGoal,
    QuizAttempt, StudentNotification, StudentAnalytics, StudentAchievement,
    Organization, Cohort, Course, Task, TaskCompletion, User, UserCohort, UserOrganization
)


# =================== CUSTOM FILTERS ===================

class OrganizationFilter(SimpleListFilter):
    title = 'organization'
    parameter_name = 'org'

    def lookups(self, request, model_admin):
        organizations = Organization.objects.all()
        return [(org.id, org.name) for org in organizations]

    def queryset(self, request, queryset):
        if self.value():
            if hasattr(queryset.model, 'organization'):
                return queryset.filter(organization_id=self.value())
            elif hasattr(queryset.model, 'course'):
                return queryset.filter(course__org_id=self.value())
            elif hasattr(queryset.model, 'student'):
                return queryset.filter(student__userorganization__org_id=self.value())
        return queryset


class LearningStyleFilter(SimpleListFilter):
    title = 'learning style'
    parameter_name = 'learning_style'

    def lookups(self, request, model_admin):
        return StudentProfile.LearningStyle.choices

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(learning_style=self.value())
        return queryset


class EnrollmentStatusFilter(SimpleListFilter):
    title = 'enrollment status'
    parameter_name = 'status'

    def lookups(self, request, model_admin):
        return StudentEnrollment.Status.choices

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(status=self.value())
        return queryset


# =================== INLINE ADMIN CLASSES ===================

class StudentEnrollmentInline(admin.TabularInline):
    model = StudentEnrollment
    fk_name = 'student'  # Specify the foreign key field name
    extra = 0
    readonly_fields = ['enrolled_at', 'progress_percentage', 'is_overdue']
    fields = ['course', 'cohort', 'status', 'progress_percentage', 'grade', 'enrolled_at', 'is_overdue']


class LearningSessionInline(admin.TabularInline):
    model = LearningSession
    fk_name = 'student'  # Specify the foreign key field name
    extra = 0
    readonly_fields = ['started_at', 'total_duration_minutes', 'accuracy_rate']
    fields = ['course', 'task', 'session_type', 'status', 'total_duration_minutes', 'accuracy_rate']


class LearningGoalInline(admin.TabularInline):
    model = LearningGoal
    fk_name = 'student'  # Specify the foreign key field name
    extra = 0
    readonly_fields = ['created_at', 'days_until_target', 'is_overdue']
    fields = ['title', 'category', 'status', 'target_date', 'days_until_target', 'is_overdue']


class StudyGroupMembershipInline(admin.TabularInline):
    model = StudyGroupMembership
    fk_name = 'study_group'  # Specify the foreign key field name pointing to StudyGroup
    extra = 0
    readonly_fields = ['joined_at', 'approved_at']
    fields = ['student', 'status', 'role', 'joined_at', 'approved_at']


# =================== MAIN ADMIN CLASSES ===================

@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = [
        'user_name', 'user_email', 'learning_style', 'status', 'overall_grade',
        'completed_courses', 'streak_days', 'current_courses_count', 'created_at'
    ]
    list_filter = [LearningStyleFilter, 'status', 'preferred_difficulty', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    readonly_fields = [
        'created_at', 'updated_at', 'completion_rate', 'current_courses_count',
        'overall_grade', 'completed_courses', 'total_study_hours', 'streak_days',
        'enrollment_date'
    ]
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Learning Preferences', {
            'fields': ('bio', 'learning_style', 'preferred_difficulty', 'study_hours_per_week', 'timezone')
        }),
        ('Goals & Interests', {
            'fields': ('learning_objectives', 'interests', 'career_goals')
        }),
        ('Status & Progress', {
            'fields': ('status', 'enrollment_date', 'graduation_date', 'overall_grade', 
                      'completed_courses', 'total_study_hours', 'streak_days', 'last_activity_date')
        }),
        ('Settings', {
            'fields': ('email_notifications', 'reminder_frequency')
        }),
        ('Metrics', {
            'fields': ('completion_rate', 'current_courses_count'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    # Note: Removed inlines as they have foreign keys to User, not StudentProfile
    # Related objects can be viewed through the User admin or dedicated admin pages
    
    def user_name(self, obj):
        return obj.user.get_full_name() or obj.user.email
    user_name.short_description = 'Name'
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


@admin.register(StudentEnrollment)
class StudentEnrollmentAdmin(admin.ModelAdmin):
    list_display = [
        'student_name', 'course_name', 'cohort_name', 'status', 'progress_percentage',
        'grade', 'enrolled_at', 'is_overdue', 'days_since_enrollment'
    ]
    list_filter = [EnrollmentStatusFilter, OrganizationFilter, 'enrolled_at', 'expected_completion_date']
    search_fields = [
        'student__email', 'student__first_name', 'student__last_name',
        'course__name', 'cohort__name'
    ]
    readonly_fields = [
        'uuid', 'enrolled_at', 'is_overdue', 'days_since_enrollment',
        'created_at', 'updated_at'
    ]
    
    fieldsets = (
        ('Enrollment Details', {
            'fields': ('uuid', 'student', 'course', 'cohort', 'status')
        }),
        ('Timeline', {
            'fields': ('enrolled_at', 'started_at', 'completed_at', 'expected_completion_date')
        }),
        ('Progress', {
            'fields': ('progress_percentage', 'current_milestone', 'grade')
        }),
        ('Certificate', {
            'fields': ('certificate_issued', 'certificate_url')
        }),
        ('Additional Info', {
            'fields': ('enrolled_by', 'notes')
        }),
        ('Status Indicators', {
            'fields': ('is_overdue', 'days_since_enrollment'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def student_name(self, obj):
        return obj.student.get_full_name() or obj.student.email
    student_name.short_description = 'Student'
    
    def course_name(self, obj):
        return obj.course.name
    course_name.short_description = 'Course'
    
    def cohort_name(self, obj):
        return obj.cohort.name
    cohort_name.short_description = 'Cohort'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'student', 'course', 'cohort', 'enrolled_by'
        )


@admin.register(LearningSession)
class LearningSessionAdmin(admin.ModelAdmin):
    list_display = [
        'student_name', 'course_name', 'task_name', 'session_type', 'status',
        'started_at', 'duration_display', 'accuracy_rate', 'satisfaction_rating'
    ]
    list_filter = ['session_type', 'status', 'started_at', OrganizationFilter]
    search_fields = [
        'student__email', 'student__first_name', 'student__last_name',
        'course__name', 'task__title'
    ]
    readonly_fields = [
        'uuid', 'started_at', 'total_duration_minutes', 'accuracy_rate',
        'created_at', 'updated_at'
    ]
    
    fieldsets = (
        ('Session Details', {
            'fields': ('uuid', 'student', 'course', 'task', 'session_type', 'status')
        }),
        ('Timing', {
            'fields': ('started_at', 'ended_at', 'total_duration_minutes', 'active_duration_minutes')
        }),
        ('Progress', {
            'fields': ('progress_at_start', 'progress_at_end', 'tasks_completed', 
                      'questions_answered', 'correct_answers', 'points_earned')
        }),
        ('Feedback', {
            'fields': ('student_notes', 'difficulties_encountered', 'satisfaction_rating')
        }),
        ('Technical', {
            'fields': ('device_type', 'browser', 'ip_address'),
            'classes': ('collapse',)
        }),
        ('Metrics', {
            'fields': ('accuracy_rate',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def student_name(self, obj):
        return obj.student.get_full_name() or obj.student.email
    student_name.short_description = 'Student'
    
    def course_name(self, obj):
        return obj.course.name if obj.course else '-'
    course_name.short_description = 'Course'
    
    def task_name(self, obj):
        return obj.task.title if obj.task else '-'
    task_name.short_description = 'Task'
    
    def duration_display(self, obj):
        if obj.total_duration_minutes:
            hours = obj.total_duration_minutes // 60
            minutes = obj.total_duration_minutes % 60
            return f"{hours}h {minutes}m"
        return '-'
    duration_display.short_description = 'Duration'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'student', 'course', 'task'
        )


@admin.register(AssignmentSubmission)
class AssignmentSubmissionAdmin(admin.ModelAdmin):
    list_display = [
        'student_name', 'task_name', 'course_name', 'status', 'version',
        'submitted_at', 'percentage_score', 'is_passed', 'grader_name'
    ]
    list_filter = ['status', 'is_passed', 'submitted_at', 'graded_at', OrganizationFilter]
    search_fields = [
        'student__email', 'student__first_name', 'student__last_name',
        'task__title', 'course__name'
    ]
    readonly_fields = [
        'uuid', 'version', 'created_at', 'submitted_at', 'graded_at',
        'percentage_score'
    ]
    
    fieldsets = (
        ('Submission Details', {
            'fields': ('uuid', 'student', 'task', 'course', 'status', 'version')
        }),
        ('Content', {
            'fields': ('content', 'file_urls', 'metadata')
        }),
        ('Timeline', {
            'fields': ('created_at', 'submitted_at', 'graded_at')
        }),
        ('Grading', {
            'fields': ('score', 'max_score', 'grade_letter', 'is_passed', 'grader')
        }),
        ('Feedback', {
            'fields': ('grader_feedback', 'grading_rubric', 'student_response', 'revision_notes')
        }),
        ('Flags', {
            'fields': ('requires_attention', 'is_late', 'plagiarism_checked', 'plagiarism_score'),
            'classes': ('collapse',)
        }),
        ('Metrics', {
            'fields': ('percentage_score',),
            'classes': ('collapse',)
        }),
    )
    
    def student_name(self, obj):
        return obj.student.get_full_name() or obj.student.email
    student_name.short_description = 'Student'
    
    def task_name(self, obj):
        return obj.task.title
    task_name.short_description = 'Task'
    
    def course_name(self, obj):
        return obj.course.name
    course_name.short_description = 'Course'
    
    def grader_name(self, obj):
        return obj.grader.get_full_name() if obj.grader else '-'
    grader_name.short_description = 'Grader'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'student', 'task', 'course', 'grader'
        )


@admin.register(StudyGroup)
class StudyGroupAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'organization_name', 'course_name', 'creator_name', 'status',
        'join_policy', 'member_count', 'max_members', 'is_full', 'created_at'
    ]
    list_filter = ['status', 'join_policy', OrganizationFilter, 'created_at']
    search_fields = ['name', 'description', 'creator__email']
    readonly_fields = ['uuid', 'member_count', 'is_full', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Group Details', {
            'fields': ('uuid', 'name', 'description', 'organization', 'course', 'cohort')
        }),
        ('Settings', {
            'fields': ('status', 'join_policy', 'max_members', 'creator', 'moderators')
        }),
        ('Meeting Info', {
            'fields': ('meeting_schedule', 'meeting_link', 'timezone')
        }),
        ('Activity', {
            'fields': ('last_activity', 'session_count')
        }),
        ('Metrics', {
            'fields': ('member_count', 'is_full'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [StudyGroupMembershipInline]
    
    def organization_name(self, obj):
        return obj.organization.name
    organization_name.short_description = 'Organization'
    
    def course_name(self, obj):
        return obj.course.name if obj.course else '-'
    course_name.short_description = 'Course'
    
    def creator_name(self, obj):
        return obj.creator.get_full_name() or obj.creator.email
    creator_name.short_description = 'Creator'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'organization', 'course', 'cohort', 'creator'
        ).prefetch_related('moderators')


@admin.register(StudyGroupMembership)
class StudyGroupMembershipAdmin(admin.ModelAdmin):
    list_display = [
        'student_name', 'study_group_name', 'status', 'role',
        'joined_at', 'sessions_attended', 'contributions'
    ]
    list_filter = ['status', 'role', 'joined_at', 'approved_at']
    search_fields = [
        'student__email', 'student__first_name', 'student__last_name',
        'study_group__name'
    ]
    readonly_fields = [
        'uuid', 'joined_at', 'approved_at', 'left_at',
        'created_at', 'updated_at'
    ]
    
    def student_name(self, obj):
        return obj.student.get_full_name() or obj.student.email
    student_name.short_description = 'Student'
    
    def study_group_name(self, obj):
        return obj.study_group.name
    study_group_name.short_description = 'Study Group'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'student', 'study_group', 'approved_by'
        )


@admin.register(LearningResource)
class LearningResourceAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'student_name', 'resource_type', 'course_name',
        'is_public', 'is_favorite', 'access_count', 'created_at'
    ]
    list_filter = ['resource_type', 'is_public', 'is_favorite', 'created_at', OrganizationFilter]
    search_fields = [
        'title', 'description', 'student__email',
        'course__name', 'task__title', 'tags'
    ]
    readonly_fields = [
        'uuid', 'last_accessed', 'access_count',
        'created_at', 'updated_at'
    ]
    
    fieldsets = (
        ('Resource Details', {
            'fields': ('uuid', 'student', 'resource_type', 'title', 'description', 'content')
        }),
        ('Links & Files', {
            'fields': ('url', 'file_url')
        }),
        ('Context', {
            'fields': ('course', 'task')
        }),
        ('Organization', {
            'fields': ('tags', 'folder', 'is_public', 'is_favorite')
        }),
        ('Metrics', {
            'fields': ('last_accessed', 'access_count'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def student_name(self, obj):
        return obj.student.get_full_name() or obj.student.email
    student_name.short_description = 'Student'
    
    def course_name(self, obj):
        return obj.course.name if obj.course else '-'
    course_name.short_description = 'Course'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'student', 'course', 'task'
        )


@admin.register(LearningGoal)
class LearningGoalAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'student_name', 'category', 'status', 'priority',
        'target_date', 'progress_percentage', 'is_overdue', 'created_at'
    ]
    list_filter = ['category', 'status', 'priority', 'target_date', 'created_at', OrganizationFilter]
    search_fields = [
        'title', 'description', 'student__email',
        'course__name'
    ]
    readonly_fields = [
        'uuid', 'started_at', 'completed_at', 'last_reminder_sent',
        'days_until_target', 'is_overdue', 'created_at', 'updated_at'
    ]
    
    fieldsets = (
        ('Goal Details', {
            'fields': ('uuid', 'student', 'title', 'description', 'category')
        }),
        ('Status & Priority', {
            'fields': ('status', 'priority', 'progress_percentage')
        }),
        ('Context', {
            'fields': ('course', 'related_tasks')
        }),
        ('Timeline', {
            'fields': ('target_date', 'started_at', 'completed_at')
        }),
        ('Planning', {
            'fields': ('success_criteria', 'milestones')
        }),
        ('Reflection', {
            'fields': ('notes', 'challenges', 'learnings')
        }),
        ('Reminders', {
            'fields': ('reminder_frequency', 'last_reminder_sent')
        }),
        ('Metrics', {
            'fields': ('days_until_target', 'is_overdue'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def student_name(self, obj):
        return obj.student.get_full_name() or obj.student.email
    student_name.short_description = 'Student'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'student', 'course'
        ).prefetch_related('related_tasks')


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = [
        'student_name', 'task_name', 'attempt_number', 'status',
        'percentage_score', 'accuracy_rate', 'is_passed',
        'started_at', 'time_spent_display'
    ]
    list_filter = ['status', 'is_passed', 'started_at', 'completed_at', OrganizationFilter]
    search_fields = [
        'student__email', 'student__first_name', 'student__last_name',
        'task__title', 'course__name'
    ]
    readonly_fields = [
        'uuid', 'attempt_number', 'started_at', 'completed_at',
        'time_spent_minutes', 'percentage_score', 'accuracy_rate',
        'created_at', 'updated_at'
    ]
    
    fieldsets = (
        ('Attempt Details', {
            'fields': ('uuid', 'student', 'task', 'course', 'attempt_number', 'status')
        }),
        ('Timing', {
            'fields': ('started_at', 'completed_at', 'time_limit_minutes', 'time_spent_minutes')
        }),
        ('Performance', {
            'fields': ('score', 'max_score', 'percentage_score', 'is_passed')
        }),
        ('Questions', {
            'fields': ('total_questions', 'questions_answered', 'correct_answers', 'answers')
        }),
        ('Settings', {
            'fields': ('question_order', 'feedback_shown', 'can_retake', 'review_mode')
        }),
        ('Technical', {
            'fields': ('ip_address', 'user_agent'),
            'classes': ('collapse',)
        }),
        ('Metrics', {
            'fields': ('accuracy_rate',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def student_name(self, obj):
        return obj.student.get_full_name() or obj.student.email
    student_name.short_description = 'Student'
    
    def task_name(self, obj):
        return obj.task.title
    task_name.short_description = 'Task'
    
    def time_spent_display(self, obj):
        if obj.time_spent_minutes:
            hours = obj.time_spent_minutes // 60
            minutes = obj.time_spent_minutes % 60
            return f"{hours}h {minutes}m"
        return '-'
    time_spent_display.short_description = 'Time Spent'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'student', 'task', 'course'
        )


@admin.register(StudentNotification)
class StudentNotificationAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'recipient_name', 'notification_type', 'priority',
        'is_read', 'created_at', 'expires_at'
    ]
    list_filter = [
        'notification_type', 'priority', 'is_read', 'sent_via_email',
        'created_at', 'expires_at', OrganizationFilter
    ]
    search_fields = [
        'title', 'message', 'recipient__email',
        'course__name', 'task__title'
    ]
    readonly_fields = [
        'uuid', 'read_at', 'sent_via_email', 'email_sent_at',
        'created_at', 'updated_at'
    ]
    
    fieldsets = (
        ('Notification Details', {
            'fields': ('uuid', 'recipient', 'notification_type', 'priority', 'title', 'message')
        }),
        ('Context', {
            'fields': ('course', 'task', 'study_group')
        }),
        ('Action', {
            'fields': ('action_url', 'action_text')
        }),
        ('Status', {
            'fields': ('is_read', 'read_at')
        }),
        ('Email', {
            'fields': ('sent_via_email', 'email_sent_at')
        }),
        ('Expiration', {
            'fields': ('expires_at',)
        }),
        ('Metadata', {
            'fields': ('metadata',),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def recipient_name(self, obj):
        return obj.recipient.get_full_name() or obj.recipient.email
    recipient_name.short_description = 'Recipient'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'recipient', 'course', 'task', 'study_group'
        )


@admin.register(StudentAnalytics)
class StudentAnalyticsAdmin(admin.ModelAdmin):
    list_display = [
        'student_name', 'date', 'study_time_hours', 'sessions_count',
        'tasks_completed', 'accuracy_rate', 'courses_in_progress'
    ]
    list_filter = ['date', OrganizationFilter]
    search_fields = ['student__email', 'student__first_name', 'student__last_name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Analytics Details', {
            'fields': ('student', 'date')
        }),
        ('Study Metrics', {
            'fields': ('study_time_minutes', 'sessions_count', 'tasks_completed')
        }),
        ('Performance Metrics', {
            'fields': ('questions_answered', 'correct_answers', 'average_score', 'accuracy_rate')
        }),
        ('Course Metrics', {
            'fields': ('courses_enrolled', 'courses_in_progress', 'courses_completed', 'overall_progress')
        }),
        ('Engagement Metrics', {
            'fields': ('login_count', 'resource_views', 'forum_posts', 'study_group_activities')
        }),
        ('Goal Metrics', {
            'fields': ('goals_created', 'goals_completed', 'goals_overdue')
        }),
        ('Achievements', {
            'fields': ('study_streak_days', 'achievements_earned')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def student_name(self, obj):
        return obj.student.get_full_name() or obj.student.email
    student_name.short_description = 'Student'
    
    def study_time_hours(self, obj):
        return f"{obj.study_time_minutes // 60}h {obj.study_time_minutes % 60}m"
    study_time_hours.short_description = 'Study Time'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('student')


@admin.register(StudentAchievement)
class StudentAchievementAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'student_name', 'achievement_type', 'points_earned',
        'is_public', 'is_featured', 'earned_at'
    ]
    list_filter = ['achievement_type', 'is_public', 'is_featured', 'earned_at', OrganizationFilter]
    search_fields = [
        'title', 'description', 'student__email',
        'course__name', 'task__title'
    ]
    readonly_fields = ['uuid', 'earned_at', 'notified_at']
    
    fieldsets = (
        ('Achievement Details', {
            'fields': ('uuid', 'student', 'achievement_type', 'title', 'description')
        }),
        ('Badge', {
            'fields': ('badge_icon', 'badge_color', 'points_earned')
        }),
        ('Context', {
            'fields': ('course', 'task')
        }),
        ('Criteria', {
            'fields': ('criteria_met',)
        }),
        ('Visibility', {
            'fields': ('is_public', 'is_featured')
        }),
        ('Timestamps', {
            'fields': ('earned_at', 'notified_at')
        }),
    )
    
    def student_name(self, obj):
        return obj.student.get_full_name() or obj.student.email
    student_name.short_description = 'Student'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'student', 'course', 'task'
        )


# =================== HIDE RELATED MODELS ===================
# These models are typically managed via inlines or through the API

# Don't register these as they are handled by other apps or are auxiliary:
# - User (handled by Django's built-in auth admin)
# - Organization, Cohort, Course, Task (handled by main app admin)
# - UserCohort, UserOrganization (handled via inlines)
# - TaskCompletion (can be registered if needed, but typically managed via API) 