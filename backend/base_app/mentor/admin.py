from django.contrib import admin
from django.db.models import Count, Avg
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.http import HttpResponseRedirect

from .models import (
    MentorProfile, MentorshipAssignment, MentorSession, MentorMessage,
    StudentProgress, MentorFeedback, MentorshipGoal, MentorNotification,
    MentorAnalytics, User, Cohort, Course, UserCohort
)


# Custom admin site for better organization
class MentorFlowAdminSite(admin.AdminSite):
    site_header = "Mentor Flow Administration"
    site_title = "Mentor Flow Admin"
    index_title = "Welcome to Mentor Flow Administration"


mentor_admin_site = MentorFlowAdminSite(name='mentor_admin')


# Inline admins
class MentorshipAssignmentInline(admin.TabularInline):
    model = MentorshipAssignment
    fk_name = 'mentor'  # Specify which foreign key to use
    fields = ['student', 'cohort', 'course', 'status', 'priority', 'assigned_at']
    readonly_fields = ['assigned_at']
    extra = 0
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('student', 'cohort', 'course')


class MentorSessionInline(admin.TabularInline):
    model = MentorSession
    fields = ['title', 'session_type', 'scheduled_at', 'status', 'student_rating']
    readonly_fields = ['student_rating']
    extra = 0


class MentorMessageInline(admin.TabularInline):
    model = MentorMessage
    fields = ['sender', 'message_type', 'content', 'is_read', 'created_at']
    readonly_fields = ['sender', 'created_at']
    extra = 0


class StudentProgressInline(admin.TabularInline):
    model = StudentProgress
    fields = ['date', 'tasks_completed', 'engagement_score', 'technical_skills_rating']
    extra = 0


class MentorshipGoalInline(admin.TabularInline):
    model = MentorshipGoal
    fields = ['title', 'status', 'priority', 'target_date', 'created_by']
    readonly_fields = ['created_by']
    extra = 0


# Main admin classes
@admin.register(MentorProfile)
class MentorProfileAdmin(admin.ModelAdmin):
    list_display = [
        'user_email', 'user_full_name', 'experience_level', 'status',
        'current_student_count', 'max_students', 'rating', 'total_reviews'
    ]
    list_filter = ['status', 'experience_level', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['rating', 'total_reviews', 'current_student_count', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'bio', 'experience_level', 'status')
        }),
        ('Expertise & Capacity', {
            'fields': ('expertise_areas', 'max_students', 'current_student_count')
        }),
        ('Professional Details', {
            'fields': ('hourly_rate', 'timezone', 'availability_schedule')
        }),
        ('Performance Metrics', {
            'fields': ('rating', 'total_reviews'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    # Remove the inline since MentorshipAssignment doesn't have FK to MentorProfile
    # inlines = [MentorshipAssignmentInline]
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email'
    user_email.admin_order_field = 'user__email'
    
    def user_full_name(self, obj):
        return obj.user.full_name
    user_full_name.short_description = 'Full Name'
    user_full_name.admin_order_field = 'user__first_name'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user').annotate(
            assignment_count=Count('user__mentor_assignments')
        )


@admin.register(MentorshipAssignment)
class MentorshipAssignmentAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'mentor_name', 'student_name', 'cohort_name', 'status',
        'priority', 'assigned_at', 'duration_weeks', 'progress_indicator'
    ]
    list_filter = ['status', 'priority', 'assigned_at', 'cohort__org']
    search_fields = [
        'mentor__email', 'student__email', 'mentor__first_name',
        'mentor__last_name', 'student__first_name', 'student__last_name'
    ]
    readonly_fields = ['uuid', 'assigned_at', 'started_at', 'completed_at', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Assignment Details', {
            'fields': ('uuid', 'mentor', 'student', 'cohort', 'course')
        }),
        ('Status & Priority', {
            'fields': ('status', 'priority', 'expected_duration_weeks')
        }),
        ('Goals & Notes', {
            'fields': ('notes', 'student_goals')
        }),
        ('Timeline', {
            'fields': ('assigned_by', 'assigned_at', 'started_at', 'completed_at'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [MentorSessionInline, MentorMessageInline, StudentProgressInline, MentorshipGoalInline]
    
    actions = ['activate_assignments', 'complete_assignments']
    
    def mentor_name(self, obj):
        return obj.mentor.full_name
    mentor_name.short_description = 'Mentor'
    mentor_name.admin_order_field = 'mentor__first_name'
    
    def student_name(self, obj):
        return obj.student.full_name
    student_name.short_description = 'Student'
    student_name.admin_order_field = 'student__first_name'
    
    def cohort_name(self, obj):
        return obj.cohort.name
    cohort_name.short_description = 'Cohort'
    cohort_name.admin_order_field = 'cohort__name'
    
    def duration_weeks(self, obj):
        return f"{obj.expected_duration_weeks} weeks"
    duration_weeks.short_description = 'Duration'
    
    def progress_indicator(self, obj):
        if obj.status == MentorshipAssignment.Status.COMPLETED:
            return format_html('<span style="color: green;">✓ Completed</span>')
        elif obj.status == MentorshipAssignment.Status.ACTIVE:
            session_count = obj.sessions.count()
            message_count = obj.messages.count()
            return format_html(
                '<span style="color: blue;">📊 {} sessions, {} messages</span>',
                session_count, message_count
            )
        elif obj.status == MentorshipAssignment.Status.PENDING:
            return format_html('<span style="color: orange;">⏳ Pending</span>')
        else:
            return format_html('<span style="color: red;">❌ {}</span>', obj.get_status_display())
    progress_indicator.short_description = 'Progress'
    
    def activate_assignments(self, request, queryset):
        updated = 0
        for assignment in queryset:
            if assignment.status == MentorshipAssignment.Status.PENDING:
                assignment.activate()
                updated += 1
        self.message_user(request, f'Successfully activated {updated} assignments.')
    activate_assignments.short_description = "Activate selected assignments"
    
    def complete_assignments(self, request, queryset):
        updated = 0
        for assignment in queryset:
            if assignment.status == MentorshipAssignment.Status.ACTIVE:
                assignment.complete()
                updated += 1
        self.message_user(request, f'Successfully completed {updated} assignments.')
    complete_assignments.short_description = "Complete selected assignments"
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'mentor', 'student', 'cohort', 'course', 'assigned_by'
        ).prefetch_related('sessions', 'messages')


@admin.register(MentorSession)
class MentorSessionAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'mentor_name', 'student_name', 'session_type',
        'scheduled_at', 'duration', 'status', 'rating_display'
    ]
    list_filter = ['session_type', 'status', 'scheduled_at']
    search_fields = [
        'title', 'assignment__mentor__email', 'assignment__student__email'
    ]
    readonly_fields = ['uuid', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Session Details', {
            'fields': ('uuid', 'assignment', 'title', 'description', 'session_type')
        }),
        ('Scheduling', {
            'fields': ('scheduled_at', 'duration_minutes', 'actual_duration_minutes', 'status')
        }),
        ('Meeting Information', {
            'fields': ('meeting_link', 'meeting_notes')
        }),
        ('Session Content', {
            'fields': ('agenda', 'outcomes')
        }),
        ('Feedback', {
            'fields': ('student_rating', 'mentor_rating'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def mentor_name(self, obj):
        return obj.assignment.mentor.full_name
    mentor_name.short_description = 'Mentor'
    
    def student_name(self, obj):
        return obj.assignment.student.full_name
    student_name.short_description = 'Student'
    
    def duration(self, obj):
        if obj.actual_duration_minutes:
            return f"{obj.actual_duration_minutes} min (actual)"
        return f"{obj.duration_minutes} min (planned)"
    duration.short_description = 'Duration'
    
    def rating_display(self, obj):
        if obj.student_rating:
            stars = '⭐' * obj.student_rating
            return format_html('<span title="Student Rating">{}</span>', stars)
        return '-'
    rating_display.short_description = 'Rating'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'assignment__mentor', 'assignment__student'
        )


@admin.register(MentorMessage)
class MentorMessageAdmin(admin.ModelAdmin):
    list_display = [
        'sender_name', 'recipient_name', 'message_type', 'content_preview',
        'is_read', 'created_at'
    ]
    list_filter = ['message_type', 'is_read', 'created_at']
    search_fields = ['sender__email', 'content']
    readonly_fields = ['uuid', 'sender', 'is_read', 'read_at', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Message Details', {
            'fields': ('uuid', 'assignment', 'sender', 'message_type')
        }),
        ('Content', {
            'fields': ('content', 'file_url', 'metadata', 'reply_to')
        }),
        ('Status', {
            'fields': ('is_read', 'read_at')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def sender_name(self, obj):
        return obj.sender.full_name
    sender_name.short_description = 'Sender'
    
    def recipient_name(self, obj):
        if obj.sender == obj.assignment.mentor:
            return obj.assignment.student.full_name
        return obj.assignment.mentor.full_name
    recipient_name.short_description = 'Recipient'
    
    def content_preview(self, obj):
        return obj.content[:50] + '...' if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'sender', 'assignment__mentor', 'assignment__student'
        )


@admin.register(StudentProgress)
class StudentProgressAdmin(admin.ModelAdmin):
    list_display = [
        'student_name', 'mentor_name', 'date', 'tasks_completed',
        'engagement_score', 'skills_average'
    ]
    list_filter = ['date', 'assignment__cohort']
    search_fields = ['assignment__student__email', 'assignment__mentor__email']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Progress Details', {
            'fields': ('assignment', 'date')
        }),
        ('Metrics', {
            'fields': (
                'tasks_completed', 'time_spent_minutes', 'engagement_score'
            )
        }),
        ('Skill Ratings', {
            'fields': (
                'technical_skills_rating', 'communication_skills_rating',
                'problem_solving_rating'
            )
        }),
        ('Notes & Reflection', {
            'fields': ('mentor_notes', 'student_reflection')
        }),
        ('Goals & Challenges', {
            'fields': ('goals_achieved', 'challenges_faced')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def student_name(self, obj):
        return obj.assignment.student.full_name
    student_name.short_description = 'Student'
    
    def mentor_name(self, obj):
        return obj.assignment.mentor.full_name
    mentor_name.short_description = 'Mentor'
    
    def skills_average(self, obj):
        ratings = [
            obj.technical_skills_rating,
            obj.communication_skills_rating,
            obj.problem_solving_rating
        ]
        valid_ratings = [r for r in ratings if r is not None]
        if valid_ratings:
            avg = sum(valid_ratings) / len(valid_ratings)
            return f"{avg:.1f}/10"
        return '-'
    skills_average.short_description = 'Avg Skills'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'assignment__student', 'assignment__mentor'
        )


@admin.register(MentorFeedback)
class MentorFeedbackAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'mentor_name', 'student_name', 'feedback_type',
        'overall_score', 'student_acknowledged', 'created_at'
    ]
    list_filter = ['feedback_type', 'student_acknowledged', 'created_at']
    search_fields = ['title', 'assignment__mentor__email', 'assignment__student__email']
    readonly_fields = ['uuid', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Feedback Details', {
            'fields': ('uuid', 'assignment', 'feedback_type', 'title')
        }),
        ('Content', {
            'fields': ('content', 'overall_score')
        }),
        ('Task Reference', {
            'fields': ('task_id', 'question_id'),
            'classes': ('collapse',)
        }),
        ('Analysis', {
            'fields': ('strengths', 'improvement_areas', 'action_items')
        }),
        ('Student Response', {
            'fields': ('student_acknowledged', 'student_response'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def mentor_name(self, obj):
        return obj.assignment.mentor.full_name
    mentor_name.short_description = 'Mentor'
    
    def student_name(self, obj):
        return obj.assignment.student.full_name
    student_name.short_description = 'Student'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'assignment__mentor', 'assignment__student'
        )


@admin.register(MentorshipGoal)
class MentorshipGoalAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'student_name', 'status', 'priority',
        'target_date', 'days_remaining', 'created_by_name'
    ]
    list_filter = ['status', 'priority', 'target_date', 'created_at']
    search_fields = ['title', 'assignment__student__email']
    readonly_fields = ['uuid', 'completed_at', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Goal Details', {
            'fields': ('uuid', 'assignment', 'title', 'description')
        }),
        ('Status & Priority', {
            'fields': ('status', 'priority', 'target_date', 'completed_at')
        }),
        ('Success Criteria', {
            'fields': ('success_criteria', 'milestones')
        }),
        ('Attribution', {
            'fields': ('created_by',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_completed']
    
    def student_name(self, obj):
        return obj.assignment.student.full_name
    student_name.short_description = 'Student'
    
    def created_by_name(self, obj):
        return obj.created_by.full_name
    created_by_name.short_description = 'Created By'
    
    def days_remaining(self, obj):
        if obj.status == MentorshipGoal.Status.COMPLETED:
            return 'Completed'
        
        from django.utils import timezone
        days = (obj.target_date - timezone.now().date()).days
        if days < 0:
            return format_html('<span style="color: red;">Overdue by {} days</span>', abs(days))
        elif days <= 3:
            return format_html('<span style="color: orange;">{} days</span>', days)
        else:
            return f"{days} days"
    days_remaining.short_description = 'Days Remaining'
    
    def mark_completed(self, request, queryset):
        updated = 0
        for goal in queryset:
            if goal.status != MentorshipGoal.Status.COMPLETED:
                goal.mark_completed()
                updated += 1
        self.message_user(request, f'Successfully marked {updated} goals as completed.')
    mark_completed.short_description = "Mark selected goals as completed"
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related(
            'assignment__student', 'created_by'
        )


@admin.register(MentorNotification)
class MentorNotificationAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'recipient_name', 'notification_type', 'is_read', 'created_at'
    ]
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['title', 'recipient__email', 'message']
    readonly_fields = ['uuid', 'is_read', 'read_at', 'created_at']
    
    fieldsets = (
        ('Notification Details', {
            'fields': ('uuid', 'recipient', 'notification_type', 'title', 'message')
        }),
        ('Related Objects', {
            'fields': ('assignment', 'session'),
            'classes': ('collapse',)
        }),
        ('Action', {
            'fields': ('action_url', 'metadata'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('is_read', 'read_at')
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def recipient_name(self, obj):
        return obj.recipient.full_name
    recipient_name.short_description = 'Recipient'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('recipient')


@admin.register(MentorAnalytics)
class MentorAnalyticsAdmin(admin.ModelAdmin):
    list_display = [
        'mentor_name', 'date', 'sessions_conducted', 'active_students',
        'average_session_rating', 'student_satisfaction', 'goal_completion_rate'
    ]
    list_filter = ['date']
    search_fields = ['mentor__email']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Analytics Details', {
            'fields': ('mentor', 'date')
        }),
        ('Session Metrics', {
            'fields': (
                'sessions_conducted', 'total_session_time_minutes',
                'average_session_rating'
            )
        }),
        ('Student Metrics', {
            'fields': ('active_students', 'students_helped')
        }),
        ('Communication Metrics', {
            'fields': ('messages_sent', 'feedback_given')
        }),
        ('Performance Metrics', {
            'fields': ('student_satisfaction', 'goal_completion_rate')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def mentor_name(self, obj):
        return obj.mentor.full_name
    mentor_name.short_description = 'Mentor'
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('mentor')


# Custom admin views and actions
class MentorFlowDashboard(admin.ModelAdmin):
    """Custom dashboard for mentor flow overview"""
    
    def changelist_view(self, request, extra_context=None):
        # Get summary statistics
        from django.db.models import Count, Avg
        
        stats = {
            'total_mentors': MentorProfile.objects.filter(status=MentorProfile.Status.ACTIVE).count(),
            'total_assignments': MentorshipAssignment.objects.filter(status=MentorshipAssignment.Status.ACTIVE).count(),
            'total_sessions_this_month': MentorSession.objects.filter(
                scheduled_at__month=timezone.now().month,
                status=MentorSession.Status.COMPLETED
            ).count(),
            'average_mentor_rating': MentorSession.objects.filter(
                student_rating__isnull=False
            ).aggregate(avg=Avg('student_rating'))['avg'] or 0,
        }
        
        extra_context = extra_context or {}
        extra_context['stats'] = stats
        
        return super().changelist_view(request, extra_context=extra_context)


# Register models with the custom admin site
mentor_admin_site.register(MentorProfile, MentorProfileAdmin)
mentor_admin_site.register(MentorshipAssignment, MentorshipAssignmentAdmin)
mentor_admin_site.register(MentorSession, MentorSessionAdmin)
mentor_admin_site.register(MentorMessage, MentorMessageAdmin)
mentor_admin_site.register(StudentProgress, StudentProgressAdmin)
mentor_admin_site.register(MentorFeedback, MentorFeedbackAdmin)
mentor_admin_site.register(MentorshipGoal, MentorshipGoalAdmin)
mentor_admin_site.register(MentorNotification, MentorNotificationAdmin)
mentor_admin_site.register(MentorAnalytics, MentorAnalyticsAdmin) 