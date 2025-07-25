from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from .models import (
    User, Organization, UserOrganization, Cohort, UserCohort, Milestone,
    Course, CourseCohort, CourseMilestone, Task, CourseTask, Question,
    TaskCompletion, AdminProfile, AdminAction, ContentTemplate,
    SystemConfiguration, ContentGenerationJob, AdminNotification,
    AdminAnalytics, BulkOperation, AdminDashboardWidget
)


# =================== BASE SERIALIZERS ===================

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'middle_name', 'last_name', 
                  'full_name', 'default_dp_color', 'created_at']
        read_only_fields = ['id', 'created_at']


class UserDetailSerializer(UserSerializer):
    organizations = serializers.SerializerMethodField()
    cohorts = serializers.SerializerMethodField()
    total_completions = serializers.SerializerMethodField()
    
    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + [
            'organizations', 'cohorts', 'total_completions'
        ]
    
    def get_organizations(self, obj):
        return UserOrganizationSerializer(
            obj.userorganization_set.all(), many=True
        ).data
    
    def get_cohorts(self, obj):
        return UserCohortSerializer(
            obj.usercohort_set.all(), many=True
        ).data
    
    def get_total_completions(self, obj):
        return obj.taskcompletion_set.count()


class OrganizationSerializer(serializers.ModelSerializer):
    current_user_count = serializers.ReadOnlyField()
    is_over_user_limit = serializers.ReadOnlyField()
    
    class Meta:
        model = Organization
        fields = ['id', 'slug', 'name', 'default_logo_color', 'billing_tier',
                  'max_users', 'current_user_count', 'is_over_user_limit',
                  'storage_limit_gb', 'api_rate_limit', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class OrganizationDetailSerializer(OrganizationSerializer):
    members = serializers.SerializerMethodField()
    cohorts = serializers.SerializerMethodField()
    courses = serializers.SerializerMethodField()
    analytics = serializers.SerializerMethodField()
    
    class Meta(OrganizationSerializer.Meta):
        fields = OrganizationSerializer.Meta.fields + [
            'members', 'cohorts', 'courses', 'analytics'
        ]
    
    def get_members(self, obj):
        return UserOrganizationSerializer(
            obj.userorganization_set.all()[:10], many=True
        ).data
    
    def get_cohorts(self, obj):
        return CohortSerializer(
            obj.cohort_set.all()[:10], many=True
        ).data
    
    def get_courses(self, obj):
        return CourseSerializer(
            obj.course_set.all()[:10], many=True
        ).data
    
    def get_analytics(self, obj):
        latest_analytics = obj.adminanalytics_set.first()
        return AdminAnalyticsSerializer(latest_analytics).data if latest_analytics else None


class UserOrganizationSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    org_name = serializers.CharField(source='org.name', read_only=True)
    
    class Meta:
        model = UserOrganization
        fields = ['id', 'user', 'user_email', 'user_name', 'org', 'org_name',
                  'role', 'permissions', 'created_at', 'last_accessed']
        read_only_fields = ['id', 'created_at']


class CohortSerializer(serializers.ModelSerializer):
    current_student_count = serializers.ReadOnlyField()
    org_name = serializers.CharField(source='org.name', read_only=True)
    
    class Meta:
        model = Cohort
        fields = ['id', 'name', 'org', 'org_name', 'description', 'is_active',
                  'start_date', 'end_date', 'max_students', 'current_student_count',
                  'created_at']
        read_only_fields = ['id', 'created_at']


class CohortDetailSerializer(CohortSerializer):
    members = serializers.SerializerMethodField()
    courses = serializers.SerializerMethodField()
    
    class Meta(CohortSerializer.Meta):
        fields = CohortSerializer.Meta.fields + ['members', 'courses']
    
    def get_members(self, obj):
        return UserCohortSerializer(
            obj.usercohort_set.all(), many=True
        ).data
    
    def get_courses(self, obj):
        return CourseSerializer(
            [cc.course for cc in obj.coursecohort_set.all()], many=True
        ).data


class UserCohortSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    cohort_name = serializers.CharField(source='cohort.name', read_only=True)
    
    class Meta:
        model = UserCohort
        fields = ['id', 'user', 'user_email', 'user_name', 'cohort', 'cohort_name',
                  'role', 'joined_at', 'status']
        read_only_fields = ['id', 'joined_at']


class MilestoneSerializer(serializers.ModelSerializer):
    org_name = serializers.CharField(source='org.name', read_only=True)
    
    class Meta:
        model = Milestone
        fields = ['id', 'name', 'org', 'org_name', 'color', 'description',
                  'estimated_hours', 'created_at']
        read_only_fields = ['id', 'created_at']


class CourseSerializer(serializers.ModelSerializer):
    org_name = serializers.CharField(source='org.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    total_tasks = serializers.ReadOnlyField()
    completion_rate = serializers.ReadOnlyField()
    enrolled_students_count = serializers.ReadOnlyField()
    
    class Meta:
        model = Course
        fields = ['id', 'org', 'org_name', 'name', 'description', 'status',
                  'difficulty_level', 'estimated_duration_weeks', 'prerequisites',
                  'learning_objectives', 'tags', 'thumbnail_url', 'created_by',
                  'created_by_name', 'total_tasks', 'completion_rate',
                  'enrolled_students_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class CourseDetailSerializer(CourseSerializer):
    milestones = serializers.SerializerMethodField()
    tasks = serializers.SerializerMethodField()
    cohorts = serializers.SerializerMethodField()
    
    class Meta(CourseSerializer.Meta):
        fields = CourseSerializer.Meta.fields + ['milestones', 'tasks', 'cohorts']
    
    def get_milestones(self, obj):
        course_milestones = obj.coursemilestone_set.all()
        return CourseMilestoneSerializer(course_milestones, many=True).data
    
    def get_tasks(self, obj):
        course_tasks = obj.coursetask_set.all()[:20]  # Limit for performance
        return CourseTaskSerializer(course_tasks, many=True).data
    
    def get_cohorts(self, obj):
        cohorts = [cc.cohort for cc in obj.coursecohort_set.all()]
        return CohortSerializer(cohorts, many=True).data


class CourseMilestoneSerializer(serializers.ModelSerializer):
    milestone_name = serializers.CharField(source='milestone.name', read_only=True)
    milestone_color = serializers.CharField(source='milestone.color', read_only=True)
    
    class Meta:
        model = CourseMilestone
        fields = ['id', 'course', 'milestone', 'milestone_name', 'milestone_color',
                  'ordering', 'unlock_at', 'created_at']
        read_only_fields = ['id', 'created_at']


class TaskSerializer(serializers.ModelSerializer):
    org_name = serializers.CharField(source='org.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    completion_rate = serializers.ReadOnlyField()
    
    class Meta:
        model = Task
        fields = ['id', 'org', 'org_name', 'type', 'title', 'description',
                  'status', 'difficulty_level', 'estimated_time_minutes', 'points',
                  'created_by', 'created_by_name', 'completion_rate', 'created_at',
                  'updated_at', 'scheduled_publish_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class TaskDetailSerializer(TaskSerializer):
    blocks = serializers.JSONField()
    questions = serializers.SerializerMethodField()
    
    class Meta(TaskSerializer.Meta):
        fields = TaskSerializer.Meta.fields + ['blocks', 'questions']
    
    def get_questions(self, obj):
        if obj.type == Task.Type.QUIZ:
            return QuestionSerializer(obj.questions.all(), many=True).data
        return []


class CourseTaskSerializer(serializers.ModelSerializer):
    task_title = serializers.CharField(source='task.title', read_only=True)
    task_type = serializers.CharField(source='task.type', read_only=True)
    milestone_name = serializers.CharField(source='milestone.name', read_only=True)
    
    class Meta:
        model = CourseTask
        fields = ['id', 'task', 'task_title', 'task_type', 'course', 'milestone',
                  'milestone_name', 'ordering', 'is_required', 'unlock_at',
                  'due_date', 'created_at']
        read_only_fields = ['id', 'created_at']


class QuestionSerializer(serializers.ModelSerializer):
    task_title = serializers.CharField(source='task.title', read_only=True)
    
    class Meta:
        model = Question
        fields = ['id', 'task', 'task_title', 'type', 'title', 'content',
                  'answer', 'options', 'explanation', 'points', 'difficulty_level',
                  'position', 'max_attempts', 'is_feedback_shown', 'context',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class TaskCompletionSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    task_title = serializers.CharField(source='task.title', read_only=True)
    question_title = serializers.CharField(source='question.title', read_only=True)
    
    class Meta:
        model = TaskCompletion
        fields = ['id', 'user', 'user_email', 'task', 'task_title', 'question',
                  'question_title', 'score', 'max_score', 'time_spent_minutes',
                  'attempts', 'is_passed', 'completed_at']
        read_only_fields = ['id', 'completed_at']


# =================== ADMIN-SPECIFIC SERIALIZERS ===================

class AdminProfileSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    managed_orgs_count = serializers.ReadOnlyField()
    total_users_managed = serializers.ReadOnlyField()
    
    class Meta:
        model = AdminProfile
        fields = ['id', 'user', 'user_email', 'user_name', 'role', 'permissions',
                  'organizations', 'phone', 'department', 'hire_date', 'is_active',
                  'managed_orgs_count', 'total_users_managed', 'last_login_ip',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class AdminActionSerializer(serializers.ModelSerializer):
    admin_email = serializers.CharField(source='admin.email', read_only=True)
    admin_name = serializers.CharField(source='admin.full_name', read_only=True)
    org_name = serializers.CharField(source='organization.name', read_only=True)
    
    class Meta:
        model = AdminAction
        fields = ['id', 'admin', 'admin_email', 'admin_name', 'action_type',
                  'object_type', 'object_id', 'object_name', 'organization',
                  'org_name', 'description', 'details', 'ip_address',
                  'user_agent', 'created_at']
        read_only_fields = ['id', 'created_at']


class ContentTemplateSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    org_name = serializers.CharField(source='organization.name', read_only=True)
    
    class Meta:
        model = ContentTemplate
        fields = ['id', 'name', 'type', 'description', 'template_data',
                  'organization', 'org_name', 'is_global', 'is_active',
                  'usage_count', 'created_by', 'created_by_name',
                  'created_at', 'updated_at']
        read_only_fields = ['id', 'usage_count', 'created_at', 'updated_at']


class SystemConfigurationSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    org_name = serializers.CharField(source='organization.name', read_only=True)
    typed_value = serializers.SerializerMethodField()
    
    class Meta:
        model = SystemConfiguration
        fields = ['id', 'key', 'value', 'value_type', 'description', 'is_sensitive',
                  'organization', 'org_name', 'created_by', 'created_by_name',
                  'typed_value', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_typed_value(self, obj):
        return obj.get_typed_value() if not obj.is_sensitive else None


class ContentGenerationJobSerializer(serializers.ModelSerializer):
    started_by_name = serializers.CharField(source='started_by.full_name', read_only=True)
    org_name = serializers.CharField(source='organization.name', read_only=True)
    course_name = serializers.CharField(source='course.name', read_only=True)
    
    class Meta:
        model = ContentGenerationJob
        fields = ['id', 'uuid', 'job_type', 'organization', 'org_name',
                  'course', 'course_name', 'status', 'progress', 'input_data',
                  'output_data', 'error_message', 'started_by', 'started_by_name',
                  'started_at', 'completed_at', 'estimated_completion']
        read_only_fields = ['id', 'uuid', 'started_at']


class AdminNotificationSerializer(serializers.ModelSerializer):
    recipient_email = serializers.CharField(source='recipient.email', read_only=True)
    org_name = serializers.CharField(source='organization.name', read_only=True)
    
    class Meta:
        model = AdminNotification
        fields = ['id', 'recipient', 'recipient_email', 'notification_type',
                  'priority', 'title', 'message', 'organization', 'org_name',
                  'related_object_type', 'related_object_id', 'action_url',
                  'metadata', 'is_read', 'read_at', 'expires_at', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def update(self, instance, validated_data):
        if 'is_read' in validated_data and validated_data['is_read'] and not instance.is_read:
            instance.mark_as_read()
            validated_data.pop('is_read', None)
        return super().update(instance, validated_data)


class AdminAnalyticsSerializer(serializers.ModelSerializer):
    org_name = serializers.CharField(source='organization.name', read_only=True)
    
    class Meta:
        model = AdminAnalytics
        fields = ['id', 'organization', 'org_name', 'date', 'total_users',
                  'new_users', 'active_users', 'total_courses', 'new_courses',
                  'total_tasks', 'total_sessions', 'avg_session_duration',
                  'completion_rate', 'api_calls', 'storage_used_gb',
                  'error_count', 'content_generations', 'ai_api_calls',
                  'ai_cost_usd', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class BulkOperationSerializer(serializers.ModelSerializer):
    started_by_name = serializers.CharField(source='started_by.full_name', read_only=True)
    org_name = serializers.CharField(source='organization.name', read_only=True)
    progress_percentage = serializers.ReadOnlyField()
    
    class Meta:
        model = BulkOperation
        fields = ['id', 'uuid', 'operation_type', 'organization', 'org_name',
                  'status', 'progress', 'progress_percentage', 'total_items',
                  'processed_items', 'success_count', 'error_count',
                  'input_file_url', 'output_file_url', 'error_log',
                  'parameters', 'results', 'started_by', 'started_by_name',
                  'started_at', 'completed_at']
        read_only_fields = ['id', 'uuid', 'started_at']


class AdminDashboardWidgetSerializer(serializers.ModelSerializer):
    admin_email = serializers.CharField(source='admin.email', read_only=True)
    org_name = serializers.CharField(source='organization.name', read_only=True)
    
    class Meta:
        model = AdminDashboardWidget
        fields = ['id', 'admin', 'admin_email', 'organization', 'org_name',
                  'widget_type', 'title', 'position_x', 'position_y',
                  'width', 'height', 'configuration', 'data_source',
                  'refresh_interval', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


# =================== DASHBOARD & SUMMARY SERIALIZERS ===================

class AdminDashboardSerializer(serializers.Serializer):
    """Summary data for admin dashboard"""
    organization = OrganizationSerializer(read_only=True)
    
    # Quick stats
    total_users = serializers.IntegerField()
    new_users_today = serializers.IntegerField()
    total_courses = serializers.IntegerField()
    total_tasks = serializers.IntegerField()
    active_cohorts = serializers.IntegerField()
    
    # Recent activity
    recent_actions = AdminActionSerializer(many=True, read_only=True)
    pending_jobs = ContentGenerationJobSerializer(many=True, read_only=True)
    unread_notifications = AdminNotificationSerializer(many=True, read_only=True)
    
    # Analytics summary
    analytics_summary = AdminAnalyticsSerializer(read_only=True)
    
    # Alerts
    system_alerts = serializers.ListField(child=serializers.DictField())
    

class UserManagementSummarySerializer(serializers.Serializer):
    """Summary for user management"""
    total_users = serializers.IntegerField()
    active_users = serializers.IntegerField()
    new_users_this_week = serializers.IntegerField()
    users_by_role = serializers.DictField()
    recent_signups = UserSerializer(many=True, read_only=True)


class ContentManagementSummarySerializer(serializers.Serializer):
    """Summary for content management"""
    total_courses = serializers.IntegerField()
    published_courses = serializers.IntegerField()
    draft_courses = serializers.IntegerField()
    total_tasks = serializers.IntegerField()
    tasks_by_type = serializers.DictField()
    recent_content = CourseSerializer(many=True, read_only=True)


class OrganizationStatsSerializer(serializers.Serializer):
    """Organization statistics"""
    organization = OrganizationSerializer(read_only=True)
    member_count = serializers.IntegerField()
    cohort_count = serializers.IntegerField()
    course_count = serializers.IntegerField()
    storage_usage = serializers.DecimalField(max_digits=8, decimal_places=2)
    api_usage = serializers.IntegerField()
    monthly_active_users = serializers.IntegerField()


# =================== BULK OPERATION SERIALIZERS ===================

class BulkUserImportSerializer(serializers.Serializer):
    """Serializer for bulk user import"""
    file = serializers.FileField()
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())
    default_role = serializers.ChoiceField(choices=UserOrganization.Role.choices, default='member')
    send_welcome_email = serializers.BooleanField(default=True)
    auto_enroll_cohorts = serializers.ListField(
        child=serializers.PrimaryKeyRelatedField(queryset=Cohort.objects.all()),
        required=False
    )


class BulkEnrollmentSerializer(serializers.Serializer):
    """Serializer for bulk enrollment operations"""
    users = serializers.ListField(
        child=serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    )
    cohorts = serializers.ListField(
        child=serializers.PrimaryKeyRelatedField(queryset=Cohort.objects.all())
    )
    role = serializers.CharField(default='learner')
    send_notification = serializers.BooleanField(default=True)


class DataExportSerializer(serializers.Serializer):
    """Serializer for data export operations"""
    export_type = serializers.ChoiceField(choices=[
        ('users', 'Users'),
        ('courses', 'Courses'),
        ('completions', 'Task Completions'),
        ('analytics', 'Analytics'),
        ('full_backup', 'Full Backup')
    ])
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())
    date_from = serializers.DateField(required=False)
    date_to = serializers.DateField(required=False)
    format = serializers.ChoiceField(choices=[('csv', 'CSV'), ('json', 'JSON')], default='csv')
    include_deleted = serializers.BooleanField(default=False)


# =================== CONTENT GENERATION SERIALIZERS ===================

class CourseGenerationSerializer(serializers.Serializer):
    """Serializer for AI course generation"""
    course_name = serializers.CharField(max_length=255)
    course_description = serializers.CharField()
    intended_audience = serializers.CharField()
    difficulty_level = serializers.ChoiceField(
        choices=[('beginner', 'Beginner'), ('intermediate', 'Intermediate'), ('advanced', 'Advanced')]
    )
    estimated_weeks = serializers.IntegerField(min_value=1, max_value=52)
    learning_objectives = serializers.ListField(child=serializers.CharField())
    reference_materials = serializers.FileField(required=False)
    organization = serializers.PrimaryKeyRelatedField(queryset=Organization.objects.all())


class TaskGenerationSerializer(serializers.Serializer):
    """Serializer for AI task generation"""
    task_type = serializers.ChoiceField(choices=Task.Type.choices)
    title = serializers.CharField(max_length=255)
    description = serializers.CharField()
    course = serializers.PrimaryKeyRelatedField(queryset=Course.objects.all())
    milestone = serializers.PrimaryKeyRelatedField(queryset=Milestone.objects.all(), required=False)
    difficulty_level = serializers.ChoiceField(
        choices=[('beginner', 'Beginner'), ('intermediate', 'Intermediate'), ('advanced', 'Advanced')]
    )
    estimated_time = serializers.IntegerField(min_value=5, max_value=300)
    context = serializers.CharField(required=False)


class QuizGenerationSerializer(serializers.Serializer):
    """Serializer for AI quiz generation"""
    task = serializers.PrimaryKeyRelatedField(queryset=Task.objects.all())
    num_questions = serializers.IntegerField(min_value=1, max_value=50)
    question_types = serializers.ListField(
        child=serializers.ChoiceField(choices=Question.Type.choices)
    )
    difficulty_distribution = serializers.DictField(
        child=serializers.IntegerField(min_value=0),
        required=False
    )
    context_material = serializers.CharField(required=False) 