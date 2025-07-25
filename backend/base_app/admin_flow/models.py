from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.db.models import TextChoices
import uuid
import json


# =================== BASE MODELS (should match your existing structure) ===================

class User(models.Model):
    """User model - should match your existing structure"""
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=255, blank=True, null=True)
    middle_name = models.CharField(max_length=255, blank=True, null=True)
    last_name = models.CharField(max_length=255, blank=True, null=True)
    default_dp_color = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        names = [self.first_name, self.middle_name, self.last_name]
        return ' '.join(filter(None, names)) or self.email


class Organization(models.Model):
    """Organization model - should match your existing structure"""
    slug = models.CharField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    default_logo_color = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    openai_api_key = models.TextField(blank=True, null=True)
    openai_free_trial = models.BooleanField(default=False)
    
    # Admin-specific fields
    billing_tier = models.CharField(max_length=50, default='free', help_text="Billing tier for the organization")
    max_users = models.PositiveIntegerField(default=100, help_text="Maximum users allowed")
    storage_limit_gb = models.PositiveIntegerField(default=10, help_text="Storage limit in GB")
    api_rate_limit = models.PositiveIntegerField(default=1000, help_text="API calls per hour")
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name

    @property
    def current_user_count(self):
        return self.userorganization_set.count()

    @property
    def is_over_user_limit(self):
        return self.current_user_count > self.max_users


class UserOrganization(models.Model):
    """User-Organization relationship"""
    class Role(TextChoices):
        OWNER = 'owner', 'Owner'
        ADMIN = 'admin', 'Admin'
        MEMBER = 'member', 'Member'
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    org = models.ForeignKey(Organization, on_delete=models.CASCADE)
    role = models.CharField(max_length=50, choices=Role.choices, default=Role.MEMBER)
    created_at = models.DateTimeField(auto_now_add=True)
    last_accessed = models.DateTimeField(null=True, blank=True)
    permissions = models.JSONField(default=dict, help_text="Custom permissions for this user")

    class Meta:
        unique_together = ('user', 'org')

    def __str__(self):
        return f"{self.user.email} - {self.org.name} ({self.role})"


class Cohort(models.Model):
    """Cohort model"""
    name = models.CharField(max_length=255)
    org = models.ForeignKey(Organization, on_delete=models.CASCADE)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    max_students = models.PositiveIntegerField(default=50)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.org.name})"

    @property
    def current_student_count(self):
        return self.usercohort_set.filter(role='learner').count()


class UserCohort(models.Model):
    """User-Cohort relationship"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    cohort = models.ForeignKey(Cohort, on_delete=models.CASCADE)
    role = models.CharField(max_length=50)  # 'learner', 'mentor', 'instructor'
    joined_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, default='active')  # active, inactive, completed

    class Meta:
        unique_together = ('user', 'cohort')


class Milestone(models.Model):
    """Milestone/Module model"""
    name = models.CharField(max_length=255)
    org = models.ForeignKey(Organization, on_delete=models.CASCADE)
    color = models.CharField(max_length=50, blank=True, null=True)
    description = models.TextField(blank=True)
    estimated_hours = models.PositiveIntegerField(default=5, help_text="Estimated hours to complete")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Course(models.Model):
    """Course model"""
    class Status(TextChoices):
        DRAFT = 'draft', 'Draft'
        PUBLISHED = 'published', 'Published'
        ARCHIVED = 'archived', 'Archived'
    
    org = models.ForeignKey(Organization, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    difficulty_level = models.CharField(max_length=50, default='beginner')  # beginner, intermediate, advanced
    estimated_duration_weeks = models.PositiveIntegerField(default=8)
    prerequisites = models.JSONField(default=list, help_text="List of prerequisite course IDs")
    learning_objectives = models.JSONField(default=list, help_text="List of learning objectives")
    tags = models.JSONField(default=list, help_text="Course tags for categorization")
    thumbnail_url = models.URLField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    @property
    def total_tasks(self):
        return self.coursetask_set.count()

    @property
    def completion_rate(self):
        # Calculate average completion rate across all students
        total_completions = TaskCompletion.objects.filter(
            task__coursetask__course=self
        ).count()
        total_possible = self.total_tasks * self.enrolled_students_count
        return (total_completions / total_possible * 100) if total_possible > 0 else 0

    @property
    def enrolled_students_count(self):
        return UserCohort.objects.filter(
            cohort__coursecohort__course=self,
            role='learner'
        ).count()


class CourseCohort(models.Model):
    """Course-Cohort relationship"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    cohort = models.ForeignKey(Cohort, on_delete=models.CASCADE)
    is_drip_enabled = models.BooleanField(default=False)
    frequency_value = models.IntegerField(blank=True, null=True)
    frequency_unit = models.CharField(max_length=50, blank=True, null=True)
    publish_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('course', 'cohort')


class CourseMilestone(models.Model):
    """Course-Milestone relationship"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    milestone = models.ForeignKey(Milestone, on_delete=models.CASCADE)
    ordering = models.IntegerField()
    unlock_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('course', 'milestone')
        ordering = ['ordering']


class Task(models.Model):
    """Task model for learning materials and quizzes"""
    class Type(TextChoices):
        LEARNING_MATERIAL = 'learning_material', 'Learning Material'
        QUIZ = 'quiz', 'Quiz'
        ASSIGNMENT = 'assignment', 'Assignment'
        PROJECT = 'project', 'Project'
    
    class Status(TextChoices):
        DRAFT = 'draft', 'Draft'
        PUBLISHED = 'published', 'Published'
        ARCHIVED = 'archived', 'Archived'
    
    org = models.ForeignKey(Organization, on_delete=models.CASCADE)
    type = models.CharField(max_length=50, choices=Type.choices)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    blocks = models.TextField(blank=True, null=True)  #JSON content blocks
    status = models.CharField(max_length=50, choices=Status.choices, default=Status.DRAFT)
    difficulty_level = models.CharField(max_length=50, default='beginner')
    estimated_time_minutes = models.PositiveIntegerField(default=30)
    points = models.PositiveIntegerField(default=10, help_text="Points awarded for completion")
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(blank=True, null=True)
    scheduled_publish_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return self.title

    @property
    def completion_rate(self):
        total_completions = self.taskcompletion_set.count()
        total_assignments = CourseTask.objects.filter(task=self).count()
        return (total_completions / total_assignments * 100) if total_assignments > 0 else 0


class CourseTask(models.Model):
    """Course-Task relationship"""
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    milestone = models.ForeignKey(Milestone, on_delete=models.CASCADE, blank=True, null=True)
    ordering = models.IntegerField()
    is_required = models.BooleanField(default=True)
    unlock_at = models.DateTimeField(null=True, blank=True)
    due_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('task', 'course')
        ordering = ['ordering']


class Question(models.Model):
    """Question model for quizzes"""
    class Type(TextChoices):
        MULTIPLE_CHOICE = 'multiple_choice', 'Multiple Choice'
        TRUE_FALSE = 'true_false', 'True/False'
        SHORT_ANSWER = 'short_answer', 'Short Answer'
        CODING = 'coding', 'Coding'
        ESSAY = 'essay', 'Essay'
    
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='questions')
    type = models.CharField(max_length=50, choices=Type.choices)
    title = models.CharField(max_length=255)
    content = models.TextField()  # Question content/blocks
    answer = models.TextField(blank=True, null=True)
    options = models.JSONField(default=list, help_text="Multiple choice options")
    explanation = models.TextField(blank=True)
    points = models.PositiveIntegerField(default=1)
    difficulty_level = models.CharField(max_length=50, default='medium')
    position = models.IntegerField()
    max_attempts = models.IntegerField(blank=True, null=True)
    is_feedback_shown = models.BooleanField(default=True)
    context = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['position']

    def __str__(self):
        return f"{self.title} ({self.task.title})"


class TaskCompletion(models.Model):
    """Track task completions by users"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, blank=True, null=True)
    question = models.ForeignKey(Question, on_delete=models.CASCADE, blank=True, null=True)
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    max_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    time_spent_minutes = models.PositiveIntegerField(null=True, blank=True)
    attempts = models.PositiveIntegerField(default=1)
    is_passed = models.BooleanField(default=False)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = (('user', 'task'), ('user', 'question'))

    def __str__(self):
        return f"{self.user.email} - {self.task.title if self.task else self.question.title}"


# =================== ADMIN-SPECIFIC MODELS ===================

class AdminProfile(models.Model):
    """Extended profile for admin users"""
    
    class Role(TextChoices):
        SUPER_ADMIN = 'super_admin', 'Super Admin'
        ORG_ADMIN = 'org_admin', 'Organization Admin'
        CONTENT_ADMIN = 'content_admin', 'Content Admin'
        SUPPORT_ADMIN = 'support_admin', 'Support Admin'
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='admin_profile')
    role = models.CharField(max_length=50, choices=Role.choices, default=Role.ORG_ADMIN)
    permissions = models.JSONField(default=list, help_text="List of specific permissions")
    organizations = models.ManyToManyField(Organization, blank=True, help_text="Organizations this admin can manage")
    phone = models.CharField(max_length=20, blank=True)
    department = models.CharField(max_length=100, blank=True)
    hire_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Admin: {self.user.full_name} ({self.role})"

    @property
    def managed_orgs_count(self):
        return self.organizations.count()

    @property
    def total_users_managed(self):
        return User.objects.filter(
            userorganization__org__in=self.organizations.all()
        ).distinct().count()


class AdminAction(models.Model):
    """Log all admin actions for audit trail"""
    
    class ActionType(TextChoices):
        CREATE = 'create', 'Create'
        UPDATE = 'update', 'Update'
        DELETE = 'delete', 'Delete'
        LOGIN = 'login', 'Login'
        LOGOUT = 'logout', 'Logout'
        PERMISSION_CHANGE = 'permission_change', 'Permission Change'
        BULK_OPERATION = 'bulk_operation', 'Bulk Operation'
        CONTENT_GENERATION = 'content_generation', 'Content Generation'
        DATA_EXPORT = 'data_export', 'Data Export'
        SYSTEM_CONFIG = 'system_config', 'System Configuration'
    
    admin = models.ForeignKey(User, on_delete=models.CASCADE, related_name='admin_actions')
    action_type = models.CharField(max_length=50, choices=ActionType.choices)
    object_type = models.CharField(max_length=100, help_text="Type of object affected (User, Course, etc.)")
    object_id = models.PositiveIntegerField(null=True, blank=True)
    object_name = models.CharField(max_length=255, blank=True)
    organization = models.ForeignKey(Organization, on_delete=models.SET_NULL, null=True, blank=True)
    
    description = models.TextField()
    details = models.JSONField(default=dict, help_text="Additional action details")
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.admin.email} - {self.action_type} - {self.object_type}"


class ContentTemplate(models.Model):
    """Templates for content creation"""
    
    class Type(TextChoices):
        COURSE = 'course', 'Course Template'
        LEARNING_MATERIAL = 'learning_material', 'Learning Material Template'
        QUIZ = 'quiz', 'Quiz Template'
        ASSIGNMENT = 'assignment', 'Assignment Template'
    
    name = models.CharField(max_length=255)
    type = models.CharField(max_length=50, choices=Type.choices)
    description = models.TextField()
    template_data = models.JSONField(help_text="Template structure and content")
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, null=True, blank=True)
    is_global = models.BooleanField(default=False, help_text="Available to all organizations")
    is_active = models.BooleanField(default=True)
    usage_count = models.PositiveIntegerField(default=0)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.type})"


class SystemConfiguration(models.Model):
    """System-wide configuration settings"""
    
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    value_type = models.CharField(max_length=20, default='string')  # string, integer, boolean, json
    description = models.TextField(blank=True)
    is_sensitive = models.BooleanField(default=False, help_text="Hide value in admin interface")
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, null=True, blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.key}: {self.value if not self.is_sensitive else '***'}"

    def get_typed_value(self):
        """Return value converted to appropriate type"""
        if self.value_type == 'integer':
            return int(self.value)
        elif self.value_type == 'boolean':
            return self.value.lower() == 'true'
        elif self.value_type == 'json':
            return json.loads(self.value)
        return self.value


class ContentGenerationJob(models.Model):
    """Track AI content generation jobs"""
    
    class Status(TextChoices):
        PENDING = 'pending', 'Pending'
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed'
        CANCELLED = 'cancelled', 'Cancelled'
    
    class JobType(TextChoices):
        COURSE_STRUCTURE = 'course_structure', 'Course Structure'
        LEARNING_MATERIAL = 'learning_material', 'Learning Material'
        QUIZ_QUESTIONS = 'quiz_questions', 'Quiz Questions'
        BULK_CONTENT = 'bulk_content', 'Bulk Content Generation'
    
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    job_type = models.CharField(max_length=50, choices=JobType.choices)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    progress = models.PositiveIntegerField(default=0, help_text="Progress percentage")
    
    input_data = models.JSONField(help_text="Job input parameters")
    output_data = models.JSONField(default=dict, help_text="Generated content")
    error_message = models.TextField(blank=True)
    
    started_by = models.ForeignKey(User, on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    estimated_completion = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.job_type} - {self.status} ({self.progress}%)"


class AdminNotification(models.Model):
    """Notifications for admin users"""
    
    class Type(TextChoices):
        SYSTEM_ALERT = 'system_alert', 'System Alert'
        USER_SIGNUP = 'user_signup', 'New User Signup'
        CONTENT_PUBLISHED = 'content_published', 'Content Published'
        BILLING_ALERT = 'billing_alert', 'Billing Alert'
        SECURITY_ALERT = 'security_alert', 'Security Alert'
        GENERATION_COMPLETE = 'generation_complete', 'Content Generation Complete'
    
    class Priority(TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'
        URGENT = 'urgent', 'Urgent'
    
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='admin_notifications')
    notification_type = models.CharField(max_length=50, choices=Type.choices)
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    
    title = models.CharField(max_length=255)
    message = models.TextField()
    
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, null=True, blank=True)
    related_object_type = models.CharField(max_length=100, blank=True)
    related_object_id = models.PositiveIntegerField(null=True, blank=True)
    
    action_url = models.URLField(blank=True)
    metadata = models.JSONField(default=dict)
    
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    expires_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.priority})"

    def mark_as_read(self):
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()


class AdminAnalytics(models.Model):
    """Analytics data for admin dashboards"""
    
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    date = models.DateField()
    
    # User metrics
    total_users = models.PositiveIntegerField(default=0)
    new_users = models.PositiveIntegerField(default=0)
    active_users = models.PositiveIntegerField(default=0)
    
    # Content metrics
    total_courses = models.PositiveIntegerField(default=0)
    new_courses = models.PositiveIntegerField(default=0)
    total_tasks = models.PositiveIntegerField(default=0)
    
    # Engagement metrics
    total_sessions = models.PositiveIntegerField(default=0)
    avg_session_duration = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    completion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    
    # System metrics
    api_calls = models.PositiveIntegerField(default=0)
    storage_used_gb = models.DecimalField(max_digits=8, decimal_places=2, default=0.00)
    error_count = models.PositiveIntegerField(default=0)
    
    # AI usage metrics
    content_generations = models.PositiveIntegerField(default=0)
    ai_api_calls = models.PositiveIntegerField(default=0)
    ai_cost_usd = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('organization', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"{self.organization.name} Analytics - {self.date}"


class BulkOperation(models.Model):
    """Track bulk operations performed by admins"""
    
    class OperationType(TextChoices):
        USER_IMPORT = 'user_import', 'User Import'
        CONTENT_IMPORT = 'content_import', 'Content Import'
        BULK_ENROLL = 'bulk_enroll', 'Bulk Enrollment'
        BULK_UNENROLL = 'bulk_unenroll', 'Bulk Unenrollment'
        BULK_DELETE = 'bulk_delete', 'Bulk Delete'
        BULK_UPDATE = 'bulk_update', 'Bulk Update'
        DATA_EXPORT = 'data_export', 'Data Export'
    
    class Status(TextChoices):
        PENDING = 'pending', 'Pending'
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'
        FAILED = 'failed', 'Failed'
        PARTIALLY_COMPLETED = 'partially_completed', 'Partially Completed'
    
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    operation_type = models.CharField(max_length=50, choices=OperationType.choices)
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE)
    
    status = models.CharField(max_length=50, choices=Status.choices, default=Status.PENDING)
    progress = models.PositiveIntegerField(default=0)
    
    total_items = models.PositiveIntegerField(default=0)
    processed_items = models.PositiveIntegerField(default=0)
    success_count = models.PositiveIntegerField(default=0)
    error_count = models.PositiveIntegerField(default=0)
    
    input_file_url = models.URLField(blank=True)
    output_file_url = models.URLField(blank=True)
    error_log = models.TextField(blank=True)
    
    parameters = models.JSONField(default=dict, help_text="Operation parameters")
    results = models.JSONField(default=dict, help_text="Operation results")
    
    started_by = models.ForeignKey(User, on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.operation_type} - {self.status}"

    @property
    def progress_percentage(self):
        if self.total_items == 0:
            return 0
        return (self.processed_items / self.total_items) * 100


class AdminDashboardWidget(models.Model):
    """Customizable dashboard widgets for admins"""
    
    class WidgetType(TextChoices):
        METRIC = 'metric', 'Metric'
        CHART = 'chart', 'Chart'
        TABLE = 'table', 'Table'
        LIST = 'list', 'List'
        MAP = 'map', 'Map'
    
    admin = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dashboard_widgets')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, null=True, blank=True)
    
    widget_type = models.CharField(max_length=50, choices=WidgetType.choices)
    title = models.CharField(max_length=255)
    
    position_x = models.PositiveIntegerField(default=0)
    position_y = models.PositiveIntegerField(default=0)
    width = models.PositiveIntegerField(default=2)
    height = models.PositiveIntegerField(default=2)
    
    configuration = models.JSONField(default=dict, help_text="Widget configuration")
    data_source = models.CharField(max_length=100, help_text="Data source identifier")
    refresh_interval = models.PositiveIntegerField(default=300, help_text="Refresh interval in seconds")
    
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['position_y', 'position_x']

    def __str__(self):
        return f"{self.title} - {self.admin.email}" 