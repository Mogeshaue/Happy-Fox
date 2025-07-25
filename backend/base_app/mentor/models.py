from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone
from django.db import models
import uuid

# For Python 3.7 compatibility, use Django's TextChoices
try:
    from django.db.models import TextChoices
except ImportError:
    # Fallback for older Django versions
    class TextChoices(models.TextChoices):
        pass

# Import User model from students app to avoid duplication
from students.models import Student as User


class Organization(models.Model):
    """Organization model - should match your existing structure"""
    slug = models.CharField(max_length=255, unique=True)
    name = models.CharField(max_length=255)
    default_logo_color = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    openai_api_key = models.TextField(blank=True, null=True)
    openai_free_trial = models.BooleanField(default=False)

    def __str__(self):
        return self.name


class UserOrganization(models.Model):
    """User-Organization relationship - should match your existing structure"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    org = models.ForeignKey(Organization, on_delete=models.CASCADE)
    role = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'org')


class Cohort(models.Model):
    """Cohort model - should match your existing structure"""
    name = models.CharField(max_length=255)
    org = models.ForeignKey(Organization, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.name} ({self.org.name})"


class UserCohort(models.Model):
    """User-Cohort relationship - should match your existing structure"""
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    cohort = models.ForeignKey(Cohort, on_delete=models.CASCADE)
    role = models.CharField(max_length=50)  # 'learner', 'mentor'
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'cohort')


class Course(models.Model):
    """Course model - should match your existing structure"""
    org = models.ForeignKey(Organization, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class CourseCohort(models.Model):
    """Course-Cohort relationship - should match your existing structure"""
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    cohort = models.ForeignKey(Cohort, on_delete=models.CASCADE)
    is_drip_enabled = models.BooleanField(default=False)
    frequency_value = models.IntegerField(blank=True, null=True)
    frequency_unit = models.CharField(max_length=50, blank=True, null=True)
    publish_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('course', 'cohort')


# =================== MENTOR FLOW SPECIFIC MODELS ===================

class MentorProfile(models.Model):
    """Extended profile for mentors with additional information"""
    
    class ExperienceLevel(TextChoices):
        JUNIOR = 'junior', 'Junior (0-2 years)'
        MID = 'mid', 'Mid-level (2-5 years)'
        SENIOR = 'senior', 'Senior (5-10 years)'
        EXPERT = 'expert', 'Expert (10+ years)'
    
    class Status(TextChoices):
        ACTIVE = 'active', 'Active'
        INACTIVE = 'inactive', 'Inactive'
        ON_LEAVE = 'on_leave', 'On Leave'
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='mentor_profile')
    bio = models.TextField(blank=True, help_text="Mentor's background and experience")
    expertise_areas = models.TextField(default='[]', help_text="List of expertise areas (JSON format)")
    experience_level = models.CharField(max_length=20, choices=ExperienceLevel.choices)
    max_students = models.PositiveIntegerField(default=10, help_text="Maximum number of students this mentor can handle")
    hourly_rate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    timezone = models.CharField(max_length=50, default='UTC')
    availability_schedule = models.TextField(default='{}', help_text="Weekly availability schedule (JSON format)")
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.ACTIVE)
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00, validators=[MinValueValidator(0), MaxValueValidator(5)])
    total_reviews = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Mentor: {self.user.full_name}"

    @property
    def current_student_count(self):
        return self.user.mentor_assignments.filter(
            status__in=['active', 'pending']
        ).count()

    @property
    def can_accept_students(self):
        return self.current_student_count < self.max_students and self.status == self.Status.ACTIVE


class MentorshipAssignment(models.Model):
    """Assignment relationship between mentor and student"""
    
    class Status(TextChoices):
        PENDING = 'pending', 'Pending'
        ACTIVE = 'active', 'Active'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'
        PAUSED = 'paused', 'Paused'
    
    class Priority(TextChoices):
        LOW = 'low', 'Low'
        MEDIUM = 'medium', 'Medium'
        HIGH = 'high', 'High'
        URGENT = 'urgent', 'Urgent'
    
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    mentor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mentor_assignments', limit_choices_to={'usercohort__role': 'mentor'})
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='student_assignments', limit_choices_to={'usercohort__role': 'learner'})
    cohort = models.ForeignKey(Cohort, on_delete=models.CASCADE, related_name='mentorship_assignments',null=True, blank=True)
    course = models.ForeignKey(Course, on_delete=models.CASCADE, null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='assignment_creator')
    assigned_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    expected_duration_weeks = models.PositiveIntegerField(default=12, help_text="Expected duration in weeks")
    
    notes = models.TextField(blank=True, help_text="Assignment notes and goals")
    student_goals = models.TextField(default='[]', help_text="Specific learning goals for the student (JSON format)")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('mentor', 'student', 'cohort')
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.mentor.full_name} → {self.student.full_name} ({self.cohort.name})"

    def activate(self):
        """Activate the mentorship assignment"""
        self.status = self.Status.ACTIVE
        self.started_at = timezone.now()
        self.save()

    def complete(self):
        """Complete the mentorship assignment"""
        self.status = self.Status.COMPLETED
        self.completed_at = timezone.now()
        self.save()


class MentorSession(models.Model):
    """Individual mentoring sessions"""
    
    class SessionType(TextChoices):
        ONE_ON_ONE = 'one_on_one', 'One-on-One'
        GROUP = 'group', 'Group Session'
        WORKSHOP = 'workshop', 'Workshop'
        CODE_REVIEW = 'code_review', 'Code Review'
        CAREER_GUIDANCE = 'career_guidance', 'Career Guidance'
    
    class Status(TextChoices):
        SCHEDULED = 'scheduled', 'Scheduled'
        IN_PROGRESS = 'in_progress', 'In Progress'
        COMPLETED = 'completed', 'Completed'
        CANCELLED = 'cancelled', 'Cancelled'
        NO_SHOW = 'no_show', 'No Show'
    
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    assignment = models.ForeignKey(MentorshipAssignment, on_delete=models.CASCADE, related_name='sessions')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    session_type = models.CharField(max_length=20, choices=SessionType.choices, default=SessionType.ONE_ON_ONE)
    
    scheduled_at = models.DateTimeField()
    duration_minutes = models.PositiveIntegerField(default=60)
    actual_duration_minutes = models.PositiveIntegerField(null=True, blank=True)
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.SCHEDULED)
    meeting_link = models.URLField(blank=True, help_text="Video call link")
    meeting_notes = models.TextField(blank=True)
    
    agenda = models.TextField(default='[]', help_text="Session agenda items (JSON format)")
    outcomes = models.TextField(default='[]', help_text="Session outcomes and action items (JSON format)")
    
    student_rating = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    mentor_rating = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(5)])
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-scheduled_at']

    def __str__(self):
        return f"{self.title} - {self.scheduled_at.strftime('%Y-%m-%d %H:%M')}"

    @property
    def is_upcoming(self):
        return self.scheduled_at > timezone.now() and self.status == self.Status.SCHEDULED


class MentorMessage(models.Model):
    """Direct messages between mentors and students"""
    
    class MessageType(TextChoices):
        TEXT = 'text', 'Text'
        FILE = 'file', 'File'
        LINK = 'link', 'Link'
        TASK_FEEDBACK = 'task_feedback', 'Task Feedback'
    
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    assignment = models.ForeignKey(MentorshipAssignment, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_mentor_messages')
    
    message_type = models.CharField(max_length=20, choices=MessageType.choices, default=MessageType.TEXT)
    content = models.TextField()
    file_url = models.URLField(blank=True)
    metadata = models.TextField(default='{}', help_text="Additional message metadata (JSON format)")
    
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    reply_to = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='replies')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Message from {self.sender.full_name} at {self.created_at.strftime('%Y-%m-%d %H:%M')}"

    def mark_as_read(self):
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()


class StudentProgress(models.Model):
    """Track student progress in mentorship"""
    
    assignment = models.ForeignKey(MentorshipAssignment, on_delete=models.CASCADE, related_name='progress_records')
    date = models.DateField()
    
    # Progress metrics
    tasks_completed = models.PositiveIntegerField(default=0)
    time_spent_minutes = models.PositiveIntegerField(default=0)
    engagement_score = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    # Skill assessments
    technical_skills_rating = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(10)])
    communication_skills_rating = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(10)])
    problem_solving_rating = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(10)])
    
    # Notes and feedback
    mentor_notes = models.TextField(blank=True)
    student_reflection = models.TextField(blank=True)
    goals_achieved = models.TextField(default='[]', help_text="Goals achieved (JSON format)")
    challenges_faced = models.TextField(default='[]', help_text="Challenges faced (JSON format)")
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('assignment', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"Progress for {self.assignment.student.full_name} on {self.date}"


class MentorFeedback(models.Model):
    """Feedback given by mentors on student work"""
    
    class FeedbackType(TextChoices):
        TASK_REVIEW = 'task_review', 'Task Review'
        GENERAL_FEEDBACK = 'general_feedback', 'General Feedback'
        SKILL_ASSESSMENT = 'skill_assessment', 'Skill Assessment'
        CAREER_ADVICE = 'career_advice', 'Career Advice'
    
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    assignment = models.ForeignKey(MentorshipAssignment, on_delete=models.CASCADE, related_name='feedback_given')
    feedback_type = models.CharField(max_length=20, choices=FeedbackType.choices, default=FeedbackType.GENERAL_FEEDBACK)
    
    title = models.CharField(max_length=255)
    content = models.TextField()
    
    # If feedback is related to a specific task/question
    task_id = models.PositiveIntegerField(null=True, blank=True, help_text="ID of the task being reviewed")
    question_id = models.PositiveIntegerField(null=True, blank=True, help_text="ID of the question being reviewed")
    
    # Ratings and scores
    overall_score = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(10)])
    strengths = models.TextField(default='[]', help_text="List of identified strengths (JSON format)")
    improvement_areas = models.TextField(default='[]', help_text="Areas for improvement (JSON format)")
    action_items = models.TextField(default='[]', help_text="Specific action items for student (JSON format)")
    
    # Student response
    student_acknowledged = models.BooleanField(default=False)
    student_response = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Feedback: {self.title} ({self.assignment})"


class MentorshipGoal(models.Model):
    """Learning goals set for mentorship assignments"""
    
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
    
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    assignment = models.ForeignKey(MentorshipAssignment, on_delete=models.CASCADE, related_name='goals')
    
    title = models.CharField(max_length=255)
    description = models.TextField()
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.NOT_STARTED)
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    
    target_date = models.DateField()
    completed_at = models.DateTimeField(null=True, blank=True)
    
    success_criteria = models.TextField(default='[]', help_text="Criteria for measuring goal completion (JSON format)")
    milestones = models.TextField(default='[]', help_text="Intermediate milestones (JSON format)")
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_goals')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['target_date', '-priority']

    def __str__(self):
        return f"Goal: {self.title} ({self.assignment})"

    def mark_completed(self):
        self.status = self.Status.COMPLETED
        self.completed_at = timezone.now()
        self.save()


class MentorNotification(models.Model):
    """Notifications for mentors"""
    
    class NotificationType(TextChoices):
        NEW_ASSIGNMENT = 'new_assignment', 'New Assignment'
        SESSION_REMINDER = 'session_reminder', 'Session Reminder'
        MESSAGE_RECEIVED = 'message_received', 'Message Received'
        STUDENT_PROGRESS = 'student_progress', 'Student Progress Update'
        FEEDBACK_REQUEST = 'feedback_request', 'Feedback Request'
        GOAL_DEADLINE = 'goal_deadline', 'Goal Deadline Approaching'
        SYSTEM_ALERT = 'system_alert', 'System Alert'
    
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mentor_notifications')
    notification_type = models.CharField(max_length=20, choices=NotificationType.choices)
    
    title = models.CharField(max_length=255)
    message = models.TextField()
    
    # Related objects
    assignment = models.ForeignKey(MentorshipAssignment, on_delete=models.CASCADE, null=True, blank=True)
    session = models.ForeignKey(MentorSession, on_delete=models.CASCADE, null=True, blank=True)
    
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    action_url = models.URLField(blank=True)
    metadata = models.TextField(default='{}', help_text="Notification metadata (JSON format)")
    
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notification: {self.title} for {self.recipient.full_name}"

    def mark_as_read(self):
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            self.save()


class MentorAnalytics(models.Model):
    """Analytics and metrics for mentors"""
    
    mentor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mentor_analytics')
    date = models.DateField()
    
    # Session metrics
    sessions_conducted = models.PositiveIntegerField(default=0)
    total_session_time_minutes = models.PositiveIntegerField(default=0)
    average_session_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    
    # Student metrics
    active_students = models.PositiveIntegerField(default=0)
    students_helped = models.PositiveIntegerField(default=0)
    
    # Communication metrics
    messages_sent = models.PositiveIntegerField(default=0)
    feedback_given = models.PositiveIntegerField(default=0)
    
    # Performance metrics
    student_satisfaction = models.DecimalField(max_digits=3, decimal_places=2, default=0.00, validators=[MinValueValidator(0), MaxValueValidator(5)])
    goal_completion_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0.00, validators=[MinValueValidator(0), MaxValueValidator(100)])
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('mentor', 'date')
        ordering = ['-date']

    def __str__(self):
        return f"Analytics for {self.mentor.full_name} on {self.date}" 