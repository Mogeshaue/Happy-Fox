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

    def __str__(self):
        return self.name


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


class CourseCohort(models.Model):
    """Course-Cohort relationship - placeholder"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    cohort = models.ForeignKey(Cohort, on_delete=models.CASCADE)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('course', 'cohort')


class CourseMilestone(models.Model):
    """Course-Milestone relationship - placeholder"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    milestone = models.ForeignKey(Milestone, on_delete=models.CASCADE)
    ordering = models.IntegerField()
    unlock_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('course', 'milestone')
        ordering = ['ordering']


class Task(models.Model):
    """Task model - placeholder"""
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
    blocks = models.TextField(blank=True, null=True)  # JSON content blocks
    status = models.CharField(max_length=50, choices=Status.choices, default=Status.DRAFT)
    difficulty_level = models.CharField(max_length=50, default='beginner')
    estimated_time_minutes = models.PositiveIntegerField(default=30)
    points = models.PositiveIntegerField(default=10)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    deleted_at = models.DateTimeField(blank=True, null=True)
    scheduled_publish_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return self.title


class CourseTask(models.Model):
    """Course-Task relationship - placeholder"""
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
    """Question model - placeholder"""
    class Type(TextChoices):
        MULTIPLE_CHOICE = 'multiple_choice', 'Multiple Choice'
        TRUE_FALSE = 'true_false', 'True/False'
        SHORT_ANSWER = 'short_answer', 'Short Answer'
        LONG_ANSWER = 'long_answer', 'Long Answer'
        CODE = 'code', 'Code'
    
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    type = models.CharField(max_length=50, choices=Type.choices)
    title = models.CharField(max_length=255)
    blocks = models.TextField(blank=True)  # JSON content blocks
    context = models.TextField(blank=True)
    correct_answer = models.TextField(blank=True)
    explanation = models.TextField(blank=True)
    points = models.PositiveIntegerField(default=1)
    position = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title


class TaskCompletion(models.Model):
    """Task completion tracking - placeholder"""
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


# =================== STUDENT FLOW SPECIFIC MODELS ===================

class StudentProfile(models.Model):
    """Extended profile for students with learning preferences and progress"""
    
    class LearningStyle(TextChoices):
        VISUAL = 'visual', 'Visual'
        AUDITORY = 'auditory', 'Auditory'
        KINESTHETIC = 'kinesthetic', 'Kinesthetic'
        READING_WRITING = 'reading_writing', 'Reading/Writing'
        MIXED = 'mixed', 'Mixed'
    
    class Status(TextChoices):
        ACTIVE = 'active', 'Active'
        INACTIVE = 'inactive', 'Inactive'
        GRADUATED = 'graduated', 'Graduated'
        SUSPENDED = 'suspended', 'Suspended'
        ON_BREAK = 'on_break', 'On Break'
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    bio = models.TextField(blank=True, help_text="Student's background and interests")
    learning_style = models.CharField(max_length=20, choices=LearningStyle.choices, default=LearningStyle.MIXED)
    
    # Academic preferences
    preferred_difficulty = models.CharField(max_length=20, default='beginner')  # beginner, intermediate, advanced
    study_hours_per_week = models.PositiveIntegerField(default=10)
    timezone = models.CharField(max_length=50, default='UTC')
    
    # Learning goals and interests
    learning_objectives = models.JSONField(default=list, help_text="Personal learning objectives")
    interests = models.JSONField(default=list, help_text="Areas of interest")
    career_goals = models.TextField(blank=True)
    
    # Progress tracking
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    enrollment_date = models.DateField(auto_now_add=True)
    graduation_date = models.DateField(null=True, blank=True)
    
    # Performance metrics
    overall_grade = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, validators=[MinValueValidator(0), MaxValueValidator(100)])
    completed_courses = models.PositiveIntegerField(default=0)
    total_study_hours = models.PositiveIntegerField(default=0)
    streak_days = models.PositiveIntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)
    
    # Preferences
    email_notifications = models.BooleanField(default=True)
    reminder_frequency = models.CharField(max_length=20, default='daily')  # daily, weekly, none
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Student: {self.user.get_full_name() or self.user.email}"

    @property
    def completion_rate(self):
        """Calculate overall completion rate across all courses"""
        from django.db.models import Count, Q
        
        total_tasks = TaskCompletion.objects.filter(
            user=self.user
        ).aggregate(
            total=Count('id'),
            completed=Count('id', filter=Q(is_passed=True))
        )
        
        if total_tasks['total'] > 0:
            return (total_tasks['completed'] / total_tasks['total']) * 100
        return 0

    @property
    def current_courses_count(self):
        """Get number of currently enrolled courses"""
        return UserCohort.objects.filter(
            user=self.user,
            role='learner',
            status='active'
        ).values('cohort__coursecohort__course').distinct().count()

    def update_streak(self):
        """Update learning streak based on recent activity"""
        if self.last_activity_date:
            days_since = (timezone.now().date() - self.last_activity_date).days
            if days_since <= 1:
                if days_since == 1:
                    self.streak_days += 1
            else:
                self.streak_days = 0
        self.last_activity_date = timezone.now().date()
        self.save()


class StudentEnrollment(models.Model):
    """Track student enrollments in courses with detailed metadata"""
    
    class Status(TextChoices):
        ENROLLED = 'enrolled', 'Enrolled'
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'
        DROPPED = 'dropped', 'Dropped'
        PAUSED = 'paused', 'Paused'
        FAILED = 'failed', 'Failed'
    
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='student_enrollments')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='student_enrollments')
    cohort = models.ForeignKey(Cohort, on_delete=models.CASCADE, related_name='student_enrollments')
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ENROLLED)
    
    # Timeline
    enrolled_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    expected_completion_date = models.DateField(null=True, blank=True)
    
    # Progress tracking
    progress_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, validators=[MinValueValidator(0), MaxValueValidator(100)])
    current_milestone = models.ForeignKey(Milestone, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Performance
    grade = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, validators=[MinValueValidator(0), MaxValueValidator(100)])
    certificate_issued = models.BooleanField(default=False)
    certificate_url = models.URLField(blank=True)
    
    # Metadata
    enrolled_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='enrollments_created')
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'course', 'cohort')
        ordering = ['-enrolled_at']

    def __str__(self):
        return f"{self.student.get_full_name() or self.student.email} - {self.course.name} ({self.status})"

    @property
    def is_overdue(self):
        """Check if enrollment is overdue"""
        if self.expected_completion_date and self.status not in ['completed', 'dropped']:
            return timezone.now().date() > self.expected_completion_date
        return False

    @property
    def days_since_enrollment(self):
        """Days since enrollment"""
        return (timezone.now().date() - self.enrolled_at.date()).days


class LearningSession(models.Model):
    """Track individual learning sessions and study time"""
    
    class SessionType(TextChoices):
        LEARNING_MATERIAL = 'learning_material', 'Learning Material'
        QUIZ_PRACTICE = 'quiz_practice', 'Quiz Practice'
        ASSIGNMENT_WORK = 'assignment_work', 'Assignment Work'
        PROJECT_WORK = 'project_work', 'Project Work'
        REVIEW = 'review', 'Review'
        STUDY_GROUP = 'study_group', 'Study Group'
    
    class Status(TextChoices):
        ACTIVE = 'active', 'Active'
        COMPLETED = 'completed', 'Completed'
        PAUSED = 'paused', 'Paused'
        ABANDONED = 'abandoned', 'Abandoned'
    
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='learning_sessions')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='learning_sessions', null=True, blank=True)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='learning_sessions', null=True, blank=True)
    
    session_type = models.CharField(max_length=20, choices=SessionType.choices)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    
    # Time tracking
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)
    total_duration_minutes = models.PositiveIntegerField(default=0)
    active_duration_minutes = models.PositiveIntegerField(default=0)  # Time actually engaged
    
    # Progress during session
    progress_at_start = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    progress_at_end = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    
    # Session outcomes
    tasks_completed = models.PositiveIntegerField(default=0)
    questions_answered = models.PositiveIntegerField(default=0)
    correct_answers = models.PositiveIntegerField(default=0)
    points_earned = models.PositiveIntegerField(default=0)
    
    # Notes and feedback
    student_notes = models.TextField(blank=True)
    difficulties_encountered = models.JSONField(default=list)
    satisfaction_rating = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    
    # Technical metadata
    device_type = models.CharField(max_length=50, blank=True)  # desktop, mobile, tablet
    browser = models.CharField(max_length=100, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.student.get_full_name() or self.student.email} - {self.session_type} ({self.started_at.strftime('%Y-%m-%d %H:%M')})"

    def end_session(self):
        """Mark session as completed and calculate duration"""
        if self.status == self.Status.ACTIVE:
            self.ended_at = timezone.now()
            self.status = self.Status.COMPLETED
            self.total_duration_minutes = int((self.ended_at - self.started_at).total_seconds() / 60)
            self.save()

    @property
    def accuracy_rate(self):
        """Calculate accuracy rate for the session"""
        if self.questions_answered > 0:
            return (self.correct_answers / self.questions_answered) * 100
        return 0


class AssignmentSubmission(models.Model):
    """Track student assignment and project submissions"""
    
    class Status(TextChoices):
        DRAFT = 'draft', 'Draft'
        SUBMITTED = 'submitted', 'Submitted'
        UNDER_REVIEW = 'under_review', 'Under Review'
        GRADED = 'graded', 'Graded'
        RETURNED = 'returned', 'Returned for Revision'
        RESUBMITTED = 'resubmitted', 'Resubmitted'
    
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assignment_submissions')
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='student_submissions')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='assignment_submissions')
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    
    # Submission content
    content = models.TextField(help_text="Main submission content/answer")
    file_urls = models.JSONField(default=list, help_text="List of uploaded file URLs")
    metadata = models.JSONField(default=dict, help_text="Additional submission metadata")
    
    # Version control
    version = models.PositiveIntegerField(default=1)
    parent_submission = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='revisions')
    
    # Timeline
    created_at = models.DateTimeField(auto_now_add=True)
    submitted_at = models.DateTimeField(null=True, blank=True)
    graded_at = models.DateTimeField(null=True, blank=True)
    
    # Grading
    score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    max_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    grade_letter = models.CharField(max_length=5, blank=True)  # A, B+, etc.
    is_passed = models.BooleanField(default=False)
    
    # Feedback
    grader = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='graded_submissions')
    grader_feedback = models.TextField(blank=True)
    grading_rubric = models.JSONField(default=dict, help_text="Detailed grading breakdown")
    
    # Student response to feedback
    student_response = models.TextField(blank=True)
    revision_notes = models.TextField(blank=True)
    
    # Flags
    requires_attention = models.BooleanField(default=False)
    is_late = models.BooleanField(default=False)
    plagiarism_checked = models.BooleanField(default=False)
    plagiarism_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)

    class Meta:
        ordering = ['-submitted_at', '-created_at']

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
        return f"{self.student.get_full_name() or self.student.email} - {self.study_group.name} ({self.role})"

    def approve(self, approver=None):
        """Approve membership"""
        if self.status == self.Status.PENDING:
            self.status = self.Status.ACTIVE
            self.approved_at = timezone.now()
            self.approved_by = approver
            self.save()


class LearningResource(models.Model):
    """Student-saved learning resources and bookmarks"""
    
    class ResourceType(TextChoices):
        BOOKMARK = 'bookmark', 'Bookmark'
        NOTE = 'note', 'Personal Note'
        SUMMARY = 'summary', 'Summary'
        FLASHCARD = 'flashcard', 'Flashcard'
        EXTERNAL_LINK = 'external_link', 'External Link'
        DOCUMENT = 'document', 'Document'
        VIDEO = 'video', 'Video'
    
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='learning_resources')
    
    # Resource details
    resource_type = models.CharField(max_length=20, choices=ResourceType.choices)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    content = models.TextField(blank=True)
    
    # Links and references
    url = models.URLField(blank=True)
    file_url = models.URLField(blank=True)
    
    # Context
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True, related_name='student_resources')
    task = models.ForeignKey(Task, on_delete=models.CASCADE, null=True, blank=True, related_name='student_resources')
    
    # Organization
    tags = models.JSONField(default=list, help_text="Student-defined tags")
    folder = models.CharField(max_length=255, blank=True, help_text="Organization folder")
    is_public = models.BooleanField(default=False, help_text="Share with study group/classmates")
    
    # Interaction
    is_favorite = models.BooleanField(default=False)
    last_accessed = models.DateTimeField(null=True, blank=True)
    access_count = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} ({self.resource_type}) - {self.student.get_full_name() or self.student.email}"

    def access(self):
        """Track resource access"""
        self.last_accessed = timezone.now()
        self.access_count += 1
        self.save()


class LearningGoal(models.Model):
    """Student personal learning goals and milestones"""
    
    class Status(TextChoices):
        NOT_STARTED = 'not_started', 'Not Started'
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'
        ON_HOLD = 'on_hold', 'On Hold'
        CANCELLED = 'cancelled', 'Cancelled'
    
    class Priority(TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'
    
    class Category(TextChoices):
        ACADEMIC = 'academic', 'Academic'
        SKILL_DEVELOPMENT = 'skill_development', 'Skill Development'
        CAREER = 'career', 'Career'
        PERSONAL = 'personal', 'Personal'
        PROJECT = 'project', 'Project'
    
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='learning_goals')
    
    # Goal details
    title = models.CharField(max_length=255)
    description = models.TextField()
    category = models.CharField(max_length=20, choices=Category.choices, default=Category.ACADEMIC)
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NOT_STARTED)
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    
    # Context
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True, related_name='student_goals')
    related_tasks = models.ManyToManyField(Task, blank=True, related_name='student_goals')
    
    # Timeline
    target_date = models.DateField()
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    # Progress tracking
    progress_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, validators=[MinValueValidator(0), MaxValueValidator(100)])
    success_criteria = models.JSONField(default=list, help_text="Measurable success criteria")
    milestones = models.JSONField(default=list, help_text="Intermediate milestones")
    
    # Reflection
    notes = models.TextField(blank=True)
    challenges = models.JSONField(default=list, help_text="Challenges encountered")
    learnings = models.JSONField(default=list, help_text="Key learnings")
    
    # Reminders
    reminder_frequency = models.CharField(max_length=20, default='weekly')  # daily, weekly, none
    last_reminder_sent = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['target_date', '-priority']

    def __str__(self):
        return f"{self.title} - {self.student.get_full_name() or self.student.email}"

    def mark_completed(self):
        """Mark goal as completed"""
        self.status = self.Status.COMPLETED
        self.completed_at = timezone.now()
        self.progress_percentage = 100.00
        self.save()

    @property
    def days_until_target(self):
        """Days until target date"""
        if self.target_date:
            return (self.target_date - timezone.now().date()).days
        return None

    @property
    def is_overdue(self):
        """Check if goal is overdue"""
        if self.target_date and self.status not in [self.Status.COMPLETED, self.Status.CANCELLED]:
            return timezone.now().date() > self.target_date
        return False


class QuizAttempt(models.Model):
    """Track student quiz attempts and performance"""
    
    class Status(TextChoices):
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'
        ABANDONED = 'abandoned', 'Abandoned'
        TIMED_OUT = 'timed_out', 'Timed Out'
    
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='quiz_attempts')
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='student_attempts')
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='quiz_attempts')
    
    # Attempt details
    attempt_number = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.IN_PROGRESS)
    
    # Timing
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    time_limit_minutes = models.PositiveIntegerField(null=True, blank=True)
    time_spent_minutes = models.PositiveIntegerField(default=0)
    
    # Performance
    score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    max_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    percentage_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    is_passed = models.BooleanField(default=False)
    
    # Question tracking
    total_questions = models.PositiveIntegerField(default=0)
    questions_answered = models.PositiveIntegerField(default=0)
    correct_answers = models.PositiveIntegerField(default=0)
    
    # Responses
    answers = models.JSONField(default=dict, help_text="Student answers keyed by question ID")
    question_order = models.JSONField(default=list, help_text="Order questions were presented")
    
    # Feedback and review
    feedback_shown = models.BooleanField(default=False)
    can_retake = models.BooleanField(default=True)
    review_mode = models.BooleanField(default=False)
    
    # Metadata
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.student.get_full_name() or self.student.email} - {self.task.title} (Attempt {self.attempt_number})"

    def complete(self):
        """Complete the quiz attempt"""
        if self.status == self.Status.IN_PROGRESS:
            self.status = self.Status.COMPLETED
            self.completed_at = timezone.now()
            self.time_spent_minutes = int((self.completed_at - self.started_at).total_seconds() / 60)
            
            # Calculate performance
            if self.max_score > 0:
                self.percentage_score = (self.score / self.max_score) * 100
            
            self.save()

    @property
    def accuracy_rate(self):
        """Calculate accuracy rate"""
        if self.questions_answered > 0:
            return (self.correct_answers / self.questions_answered) * 100
        return 0


class StudentNotification(models.Model):
    """Notifications for students about their learning progress"""
    
    class Type(TextChoices):
        COURSE_UPDATE = 'course_update', 'Course Update'
        ASSIGNMENT_DUE = 'assignment_due', 'Assignment Due'
        GRADE_RELEASED = 'grade_released', 'Grade Released'
        NEW_CONTENT = 'new_content', 'New Content Available'
        STUDY_REMINDER = 'study_reminder', 'Study Reminder'
        ACHIEVEMENT = 'achievement', 'Achievement Unlocked'
        GOAL_REMINDER = 'goal_reminder', 'Goal Reminder'
        STUDY_GROUP = 'study_group', 'Study Group Activity'
        MENTOR_MESSAGE = 'mentor_message', 'Mentor Message'
        SYSTEM_ALERT = 'system_alert', 'System Alert'
    
    class Priority(TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'
        URGENT = 'urgent', 'Urgent'
    
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='student_notifications')
    
    # Notification details
    notification_type = models.CharField(max_length=20, choices=Type.choices)
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    
    title = models.CharField(max_length=255)
    message = models.TextField()
    
    # Context
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True, related_name='student_notifications')
    task = models.ForeignKey(Task, on_delete=models.CASCADE, null=True, blank=True, related_name='student_notifications')
    study_group = models.ForeignKey(StudyGroup, on_delete=models.CASCADE, null=True, blank=True, related_name='notifications')
    
    # Action
    action_url = models.URLField(blank=True, help_text="URL for notification action")
    action_text = models.CharField(max_length=100, blank=True, help_text="Text for action button")
    
    # Status
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Delivery
    sent_via_email = models.BooleanField(default=False)
    email_sent_at = models.DateTimeField(null=True, blank=True)
    
    # Expiration
    expires_at = models.DateTimeField(null=True, blank=True, help_text="When notification should be auto-deleted")
    
    # Metadata
    metadata = models.JSONField(default=dict, help_text="Additional notification data")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.recipient.get_full_name() or self.recipient.email}"

    def mark_as_read(self):
        """Mark notification as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()


class StudentAnalytics(models.Model):
    """Daily analytics and metrics for students"""
    
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='student_analytics')
    date = models.DateField()
    
    # Study metrics
    study_time_minutes = models.PositiveIntegerField(default=0)
    sessions_count = models.PositiveIntegerField(default=0)
    tasks_completed = models.PositiveIntegerField(default=0)
    questions_answered = models.PositiveIntegerField(default=0)
    correct_answers = models.PositiveIntegerField(default=0)
    
    # Performance metrics
    average_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    accuracy_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    # Progress metrics
    courses_enrolled = models.PositiveIntegerField(default=0)
    courses_in_progress = models.PositiveIntegerField(default=0)
    courses_completed = models.PositiveIntegerField(default=0)
    overall_progress = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    # Engagement metrics
    login_count = models.PositiveIntegerField(default=0)
    resource_views = models.PositiveIntegerField(default=0)
    forum_posts = models.PositiveIntegerField(default=0)
    study_group_activities = models.PositiveIntegerField(default=0)
    
    # Goal tracking
    goals_created = models.PositiveIntegerField(default=0)
    goals_completed = models.PositiveIntegerField(default=0)
    goals_overdue = models.PositiveIntegerField(default=0)
    
    # Streaks and milestones
    study_streak_days = models.PositiveIntegerField(default=0)
    achievements_earned = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('student', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"Analytics for {self.student.get_full_name() or self.student.email} on {self.date}"


class StudentAchievement(models.Model):
    """Student achievements and badges"""
    
    class Type(TextChoices):
        COMPLETION = 'completion', 'Course/Task Completion'
        PERFORMANCE = 'performance', 'Performance Milestone'
        STREAK = 'streak', 'Study Streak'
        ENGAGEMENT = 'engagement', 'Engagement Achievement'
        MILESTONE = 'milestone', 'Learning Milestone'
        SPECIAL = 'special', 'Special Achievement'
    
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='achievements')
    
    # Achievement details
    achievement_type = models.CharField(max_length=20, choices=Type.choices)
    title = models.CharField(max_length=255)
    description = models.TextField()
    badge_icon = models.CharField(max_length=100, blank=True)  # Icon class or URL
    badge_color = models.CharField(max_length=7, default='#6366f1')  # Hex color
    
    # Context
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True, related_name='achievements')
    task = models.ForeignKey(Task, on_delete=models.CASCADE, null=True, blank=True, related_name='achievements')
    
    # Achievement data
    criteria_met = models.JSONField(default=dict, help_text="Criteria that were met")
    points_earned = models.PositiveIntegerField(default=0)
    
    # Visibility
    is_public = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    
    # Timestamps
    earned_at = models.DateTimeField(auto_now_add=True)
    notified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-earned_at']

    def __str__(self):
        return f"{self.title} - {self.student.get_full_name() or self.student.email}" 