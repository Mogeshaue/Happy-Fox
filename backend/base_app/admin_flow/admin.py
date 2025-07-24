from django.contrib import admin
from django.db.models import Count, Avg
from django.utils.html import format_html
from django.urls import reverse
from django.utils.safestring import mark_safe
from django.http import HttpResponseRedirect
from django.contrib.admin import SimpleListFilter
from django.utils import timezone

from .models import (
    User, Organization, UserOrganization, Cohort, UserCohort, Milestone,
    Course, CourseCohort, CourseMilestone, Task, CourseTask, Question,
    TaskCompletion, AdminProfile, AdminAction, ContentTemplate,
    SystemConfiguration, ContentGenerationJob, AdminNotification,
    AdminAnalytics, BulkOperation, AdminDashboardWidget
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
            return queryset.filter(organization_id=self.value())
        return queryset


class AdminRoleFilter(SimpleListFilter):
    title = 'admin role'
    parameter_name = 'admin_role'

    def lookups(self, request, model_admin):
        return AdminProfile.Role.choices

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(admin_profile__role=self.value())
        return queryset


# =================== INLINE ADMIN CLASSES ===================

class UserOrganizationInline(admin.TabularInline):
    model = UserOrganization
    extra = 0
    readonly_fields = ['created_at', 'last_accessed']


class UserCohortInline(admin.TabularInline):
    model = UserCohort
    extra = 0
    readonly_fields = ['joined_at']


class CourseTaskInline(admin.TabularInline):
    model = CourseTask
    extra = 0
    readonly_fields = ['created_at']
    ordering = ['ordering']


class CourseMilestoneInline(admin.TabularInline):
    model = CourseMilestone
    extra = 0
    readonly_fields = ['created_at']
    ordering = ['ordering']


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 0
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['position']


# =================== MAIN ADMIN CLASSES ===================

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = [
        'email', 'full_name', 'created_at', 'organization_count',
        'cohort_count', 'completion_count'
    ]
    list_filter = ['created_at']
    search_fields = ['email', 'first_name', 'last_name']
    readonly_fields = ['created_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('email', 'first_name', 'middle_name', 'last_name')
        }),
        ('Profile', {
            'fields': ('default_dp_color',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [UserOrganizationInline, UserCohortInline]
    
    def organization_count(self, obj):
        return obj.userorganization_set.count()
    organization_count.short_description = 'Organizations'
    
    def cohort_count(self, obj):
        return obj.usercohort_set.count()
    cohort_count.short_description = 'Cohorts'
    
    def completion_count(self, obj):
        return obj.taskcompletion_set.count()
    completion_count.short_description = 'Completions'
    
    def get_queryset(self, request):
        return super().get_queryset(request).prefetch_related(
            'userorganization_set', 'usercohort_set', 'taskcompletion_set'
        )


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'slug', 'billing_tier', 'current_user_count', 'max_users',
        'is_active', 'storage_used_indicator', 'created_at'
    ]
    list_filter = ['billing_tier', 'is_active', 'created_at']
    search_fields = ['name', 'slug']
    readonly_fields = ['created_at', 'current_user_count', 'is_over_user_limit']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'default_logo_color', 'is_active')
        }),
        ('Billing & Limits', {
            'fields': ('billing_tier', 'max_users', 'current_user_count', 
                      'is_over_user_limit', 'storage_limit_gb', 'api_rate_limit')
        }),
        ('API Configuration', {
            'fields': ('openai_api_key', 'openai_free_trial'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at',),
            'classes': ('collapse',)
        }),
    )
    
    def storage_used_indicator(self, obj):
        # Placeholder - implement based on your storage solution
        return format_html(
            '<span style="color: green;">0 GB / {} GB</span>',
            obj.storage_limit_gb
        )
    storage_used_indicator.short_description = 'Storage Usage'


@admin.register(AdminProfile)
class AdminProfileAdmin(admin.ModelAdmin):
    list_display = [
        'user_email', 'user_name', 'role', 'is_active', 'managed_orgs_count',
        'total_users_managed', 'department', 'created_at'
    ]
    list_filter = ['role', 'is_active', 'department', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name', 'department']
    readonly_fields = ['managed_orgs_count', 'total_users_managed', 'created_at', 'updated_at']
    filter_horizontal = ['organizations']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('user', 'role', 'is_active')
        }),
        ('Permissions & Organizations', {
            'fields': ('permissions', 'organizations')
        }),
        ('Contact Information', {
            'fields': ('phone', 'department', 'hire_date')
        }),
        ('Security', {
            'fields': ('last_login_ip',),
            'classes': ('collapse',)
        }),
        ('Statistics', {
            'fields': ('managed_orgs_count', 'total_users_managed'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = 'Email'
    user_email.admin_order_field = 'user__email'
    
    def user_name(self, obj):
        return obj.user.full_name
    user_name.short_description = 'Name'
    user_name.admin_order_field = 'user__first_name'


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'org_name', 'status', 'difficulty_level', 
        'total_tasks', 'enrolled_students_count', 'completion_rate', 'created_at'
    ]
    list_filter = ['status', 'difficulty_level', 'org', 'created_at']
    search_fields = ['name', 'description', 'org__name']
    readonly_fields = ['total_tasks', 'completion_rate', 'enrolled_students_count', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('org', 'name', 'description', 'status')
        }),
        ('Course Details', {
            'fields': ('difficulty_level', 'estimated_duration_weeks', 
                      'prerequisites', 'learning_objectives', 'tags')
        }),
        ('Media', {
            'fields': ('thumbnail_url',)
        }),
        ('Statistics', {
            'fields': ('total_tasks', 'completion_rate', 'enrolled_students_count'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [CourseMilestoneInline, CourseTaskInline]
    
    def org_name(self, obj):
        return obj.org.name
    org_name.short_description = 'Organization'
    org_name.admin_order_field = 'org__name'


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'org_name', 'type', 'status', 'difficulty_level',
        'estimated_time_minutes', 'points', 'completion_rate', 'created_at'
    ]
    list_filter = ['type', 'status', 'difficulty_level', 'org', 'created_at']
    search_fields = ['title', 'description', 'org__name']
    readonly_fields = ['completion_rate', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('org', 'title', 'description', 'type', 'status')
        }),
        ('Task Details', {
            'fields': ('difficulty_level', 'estimated_time_minutes', 'points')
        }),
        ('Content', {
            'fields': ('blocks',),
            'classes': ('collapse',)
        }),
        ('Publishing', {
            'fields': ('scheduled_publish_at', 'deleted_at'),
            'classes': ('collapse',)
        }),
        ('Statistics', {
            'fields': ('completion_rate',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [QuestionInline]
    
    def org_name(self, obj):
        return obj.org.name
    org_name.short_description = 'Organization'
    org_name.admin_order_field = 'org__name'


@admin.register(AdminAction)
class AdminActionAdmin(admin.ModelAdmin):
    list_display = [
        'admin_email', 'action_type', 'object_type', 'object_name',
        'organization', 'created_at'
    ]
    list_filter = ['action_type', 'object_type', OrganizationFilter, 'created_at']
    search_fields = ['admin__email', 'object_name', 'description']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Action Details', {
            'fields': ('admin', 'action_type', 'object_type', 'object_id', 'object_name')
        }),
        ('Context', {
            'fields': ('organization', 'description', 'details')
        }),
        ('Security', {
            'fields': ('ip_address', 'user_agent'),
            'classes': ('collapse',)
        }),
        ('Timestamp', {
            'fields': ('created_at',)
        }),
    )
    
    def admin_email(self, obj):
        return obj.admin.email
    admin_email.short_description = 'Admin'
    admin_email.admin_order_field = 'admin__email'
    
    def has_add_permission(self, request):
        return False  # Actions are created automatically
    
    def has_delete_permission(self, request, obj=None):
        return False  # Don't allow deletion of audit logs


@admin.register(ContentGenerationJob)
class ContentGenerationJobAdmin(admin.ModelAdmin):
    list_display = [
        'job_type', 'organization', 'status', 'progress', 'started_by',
        'started_at', 'completed_at'
    ]
    list_filter = ['job_type', 'status', OrganizationFilter, 'started_at']
    search_fields = ['uuid', 'organization__name', 'started_by__email']
    readonly_fields = ['uuid', 'started_at', 'completed_at']
    
    fieldsets = (
        ('Job Information', {
            'fields': ('uuid', 'job_type', 'organization', 'course', 'status', 'progress')
        }),
        ('Data', {
            'fields': ('input_data', 'output_data', 'error_message')
        }),
        ('Timeline', {
            'fields': ('started_by', 'started_at', 'completed_at', 'estimated_completion')
        }),
    )
    
    def has_add_permission(self, request):
        return False  # Jobs are created through API


@admin.register(AdminNotification)
class AdminNotificationAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'recipient_email', 'notification_type', 'priority',
        'is_read', 'organization', 'created_at'
    ]
    list_filter = ['notification_type', 'priority', 'is_read', OrganizationFilter, 'created_at']
    search_fields = ['title', 'message', 'recipient__email']
    readonly_fields = ['created_at', 'read_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Notification Details', {
            'fields': ('recipient', 'notification_type', 'priority', 'title', 'message')
        }),
        ('Context', {
            'fields': ('organization', 'related_object_type', 'related_object_id', 
                      'action_url', 'metadata')
        }),
        ('Status', {
            'fields': ('is_read', 'read_at', 'expires_at')
        }),
        ('Timestamp', {
            'fields': ('created_at',)
        }),
    )
    
    def recipient_email(self, obj):
        return obj.recipient.email
    recipient_email.short_description = 'Recipient'
    recipient_email.admin_order_field = 'recipient__email'
    
    actions = ['mark_as_read', 'mark_as_unread']
    
    def mark_as_read(self, request, queryset):
        updated = queryset.update(is_read=True, read_at=timezone.now())
        self.message_user(request, f'{updated} notifications marked as read.')
    mark_as_read.short_description = 'Mark selected notifications as read'
    
    def mark_as_unread(self, request, queryset):
        updated = queryset.update(is_read=False, read_at=None)
        self.message_user(request, f'{updated} notifications marked as unread.')
    mark_as_unread.short_description = 'Mark selected notifications as unread'


@admin.register(AdminAnalytics)
class AdminAnalyticsAdmin(admin.ModelAdmin):
    list_display = [
        'organization', 'date', 'total_users', 'new_users', 'active_users',
        'total_courses', 'completion_rate', 'content_generations'
    ]
    list_filter = [OrganizationFilter, 'date']
    search_fields = ['organization__name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'date'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('organization', 'date')
        }),
        ('User Metrics', {
            'fields': ('total_users', 'new_users', 'active_users')
        }),
        ('Content Metrics', {
            'fields': ('total_courses', 'new_courses', 'total_tasks')
        }),
        ('Engagement Metrics', {
            'fields': ('total_sessions', 'avg_session_duration', 'completion_rate')
        }),
        ('System Metrics', {
            'fields': ('api_calls', 'storage_used_gb', 'error_count'),
            'classes': ('collapse',)
        }),
        ('AI Metrics', {
            'fields': ('content_generations', 'ai_api_calls', 'ai_cost_usd'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(BulkOperation)
class BulkOperationAdmin(admin.ModelAdmin):
    list_display = [
        'operation_type', 'organization', 'status', 'progress_percentage',
        'success_count', 'error_count', 'started_by', 'started_at'
    ]
    list_filter = ['operation_type', 'status', OrganizationFilter, 'started_at']
    search_fields = ['uuid', 'organization__name', 'started_by__email']
    readonly_fields = ['uuid', 'progress_percentage', 'started_at', 'completed_at']
    
    fieldsets = (
        ('Operation Details', {
            'fields': ('uuid', 'operation_type', 'organization', 'status', 'progress')
        }),
        ('Progress', {
            'fields': ('total_items', 'processed_items', 'success_count', 
                      'error_count', 'progress_percentage')
        }),
        ('Files & Logs', {
            'fields': ('input_file_url', 'output_file_url', 'error_log'),
            'classes': ('collapse',)
        }),
        ('Data', {
            'fields': ('parameters', 'results'),
            'classes': ('collapse',)
        }),
        ('Timeline', {
            'fields': ('started_by', 'started_at', 'completed_at')
        }),
    )
    
    def has_add_permission(self, request):
        return False  # Operations are created through API


@admin.register(SystemConfiguration)
class SystemConfigurationAdmin(admin.ModelAdmin):
    list_display = [
        'key', 'value_preview', 'value_type', 'organization', 'is_sensitive', 'updated_at'
    ]
    list_filter = ['value_type', 'is_sensitive', OrganizationFilter, 'updated_at']
    search_fields = ['key', 'description']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Configuration', {
            'fields': ('key', 'value', 'value_type', 'is_sensitive')
        }),
        ('Context', {
            'fields': ('description', 'organization')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def value_preview(self, obj):
        if obj.is_sensitive:
            return '***'
        return obj.value[:50] + '...' if len(obj.value) > 50 else obj.value
    value_preview.short_description = 'Value'


@admin.register(ContentTemplate)
class ContentTemplateAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'type', 'organization', 'is_global', 'is_active', 
        'usage_count', 'created_by', 'created_at'
    ]
    list_filter = ['type', 'is_global', 'is_active', OrganizationFilter, 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['usage_count', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Template Information', {
            'fields': ('name', 'type', 'description', 'is_global', 'is_active')
        }),
        ('Content', {
            'fields': ('template_data',)
        }),
        ('Usage & Organization', {
            'fields': ('organization', 'usage_count')
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


# =================== ADMIN SITE CUSTOMIZATION ===================

admin.site.site_header = "Admin Flow Administration"
admin.site.site_title = "Admin Flow Admin"
admin.site.index_title = "Welcome to Admin Flow Administration"

# Hide some models from admin if they're not needed for direct editing
admin.site.unregister(UserOrganization)
admin.site.unregister(UserCohort)
admin.site.unregister(CourseCohort)
admin.site.unregister(CourseMilestone)
admin.site.unregister(CourseTask)
admin.site.unregister(Question)
admin.site.unregister(TaskCompletion)
admin.site.unregister(AdminDashboardWidget) 