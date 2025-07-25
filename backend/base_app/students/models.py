from django.db import models
from django.contrib.auth import get_user_model
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.db.models import TextChoices, JSONField
import uuid
from datetime import timedelta

User = get_user_model()

# =================== PLACEHOLDER MODELS ===================
# These models should exist in your main Django project.
# Update the imports below to match your actual model locations.

class Organization(models.Model):
    """Organization model - placeholder, should exist in main project"""
    name = models.CharField(max_length=255)
    slug = models.CharField(max_length=100, unique=True)
    billing_tier = models.CharField(max_length=50, default='free')
    max_users = models.PositiveIntegerField(default=50)
    current_user_count = models.PositiveIntegerField(default=0)
    storage_limit_gb = models.DecimalField(max_digits=10, decimal_places=2, default=5.0)
    api_rate_limit = models.PositiveIntegerField(default=1000)
    openai_api_key = models.CharField(max_length=255, blank=True)
    openai_free_trial = models.BooleanField(default=True)
    default_logo_color = models.CharField(max_length=7, default='#6366f1')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

    @property
    def is_over_user_limit(self):
        return self.current_user_count > self.max_users


class UserOrganization(models.Model):
    """User-Organization relationship - placeholder"""
    class Role(TextChoices):
        OWNER = 'owner', 'Owner'
        ADMIN = 'admin', 'Admin'
        MEMBER = 'member', 'Member'
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    org = models.ForeignKey(Organization, on_delete=models.CASCADE)
    role = models.CharField(max_length=50, choices=Role.choices, default=Role.MEMBER)
    created_at = models.DateTimeField(auto_now_add=True)
    last_accessed = models.DateTimeField(null=True, blank=True)
    permissions = models.JSONField(default=dict)

    class Meta:
        unique_together = ('user', 'org')

    def __str__(self):
        return f"{self.user.email} - {self.org.name} ({self.role})"


class Cohort(models.Model):
    """Cohort model - placeholder"""
    name = models.CharField(max_length=255)
    org = models.ForeignKey(Organization, on_delete=models.CASCADE)
    description = models.TextField(blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    max_students = models.PositiveIntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.org.name})"


class UserCohort(models.Model):
    """User-Cohort relationship - placeholder"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    cohort = models.ForeignKey(Cohort, on_delete=models.CASCADE)
    role = models.CharField(max_length=50)  # 'learner', 'mentor', 'instructor'
    joined_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, default='active')

    class Meta:
        unique_together = ('user', 'cohort')

    def __str__(self):
        return f"{self.user.email} - {self.cohort.name} ({self.role})"


class Milestone(models.Model):
    """Milestone model - placeholder"""
    name = models.CharField(max_length=255)
    org = models.ForeignKey(Organization, on_delete=models.CASCADE)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=7, default='#6366f1')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.email

    @property
    def full_name(self):
        return f'{self.first_name or ""} {self.last_name or ""}'.strip()

class Course(models.Model):
    """Course model - placeholder"""
    class Status(TextChoices):
        DRAFT = 'draft', 'Draft'
        PUBLISHED = 'published', 'Published'
        ARCHIVED = 'archived', 'Archived'
    
    org = models.ForeignKey(Organization, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    difficulty_level = models.CharField(max_length=50, default='beginner')
    estimated_duration_weeks = models.PositiveIntegerField(default=8)
    prerequisites = models.JSONField(default=list)
    learning_objectives = models.JSONField(default=list)
    tags = models.JSONField(default=list)
    thumbnail_url = models.URLField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Cohort(models.Model):
    name = models.CharField(max_length=255)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='cohorts')
    start_date = models.DateField()
    end_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.student.get_full_name() or self.student.email} - {self.task.title} (v{self.version})"

    def submit(self):
        """Submit the assignment"""
        if self.status == self.Status.DRAFT:
            self.status = self.Status.SUBMITTED
            self.submitted_at = timezone.now()
            self.save()

    @property
    def percentage_score(self):
        """Get percentage score"""
        if self.score and self.max_score and self.max_score > 0:
            return (self.score / self.max_score) * 100
        return 0


class StudyGroup(models.Model):
    """Student-created study groups for collaborative learning"""
    
    class Status(TextChoices):
        ACTIVE = 'active', 'Active'
        INACTIVE = 'inactive', 'Inactive'
        ARCHIVED = 'archived', 'Archived'
    
    class JoinPolicy(TextChoices):
        OPEN = 'open', 'Open to All'
        INVITE_ONLY = 'invite_only', 'Invite Only'
        REQUEST_TO_JOIN = 'request_to_join', 'Request to Join'
    
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    # Organization and course context
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='study_groups')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='study_groups', null=True, blank=True)
    cohort = models.ForeignKey(Cohort, on_delete=models.CASCADE, related_name='study_groups', null=True, blank=True)
    
    # Group settings
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    join_policy = models.CharField(max_length=20, choices=JoinPolicy.choices, default=JoinPolicy.OPEN)
    max_members = models.PositiveIntegerField(default=10)
    
    # Leadership
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_study_groups')
    moderators = models.ManyToManyField(User, blank=True, related_name='moderated_study_groups')
    
    # Activity tracking
    last_activity = models.DateTimeField(null=True, blank=True)
    session_count = models.PositiveIntegerField(default=0)
    
    # Meeting information
    meeting_schedule = models.JSONField(default=dict, help_text="Regular meeting schedule")
    meeting_link = models.URLField(blank=True, help_text="Recurring meeting link")
    timezone = models.CharField(max_length=50, default='UTC')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.organization.name})"

    @property
    def member_count(self):
        """Get current member count"""
        return self.memberships.filter(status='active').count()

    @property
    def is_full(self):
        """Check if group is at capacity"""
        return self.member_count >= self.max_members


class StudyGroupMembership(models.Model):
    """Track student membership in study groups"""
    
    class Status(TextChoices):
        PENDING = 'pending', 'Pending'
        ACTIVE = 'active', 'Active'
        INACTIVE = 'inactive', 'Inactive'
        REMOVED = 'removed', 'Removed'
    
    class Role(TextChoices):
        MEMBER = 'member', 'Member'
        MODERATOR = 'moderator', 'Moderator'
        CREATOR = 'creator', 'Creator'
    
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    study_group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE, related_name='memberships')
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='study_group_memberships')
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.MEMBER)
    
    # Membership timeline
    joined_at = models.DateTimeField(auto_now_add=True)
    approved_at = models.DateTimeField(null=True, blank=True)
    left_at = models.DateTimeField(null=True, blank=True)
    
    # Activity tracking
    last_active = models.DateTimeField(null=True, blank=True)
    sessions_attended = models.PositiveIntegerField(default=0)
    contributions = models.PositiveIntegerField(default=0)  # Messages, resources shared, etc.
    
    # Approval process
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_memberships')
    join_message = models.TextField(blank=True, help_text="Message when requesting to join")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('study_group', 'student')
        ordering = ['-joined_at']

    def __str__(self):
        return f"{self.email} invited to {self.team.name}"
    
    @property
    def full_name(self):
        """Return full name combining first, middle, and last names"""
        names = [self.first_name, self.middle_name, self.last_name]
        return ' '.join(filter(None, names)) or self.email
    def approve(self, approver=None):
        """Approve membership"""
        if self.status == self.Status.PENDING:
            self.status = self.Status.ACTIVE
            self.approved_at = timezone.now()
            self.approved_by = approver
            self.save()    
    @property
    def full_name(self):
        """Return full name combining first, middle, and last names"""
        names = [self.first_name, self.middle_name, self.last_name]
        return ' '.join(filter(None, names)) or self.email    
    @property
    def full_name(self):
        """Return full name combining first, middle, and last names"""
        names = [self.first_name, self.middle_name, self.last_name]
        return ' '.join(filter(None, names)) or self.email