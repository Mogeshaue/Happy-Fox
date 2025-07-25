from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.utils import timezone
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings

from .models import (
    MentorshipAssignment, MentorSession, MentorMessage, 
    MentorFeedback, MentorshipGoal, MentorNotification,
    StudentProgress, MentorAnalytics
)


@receiver(post_save, sender=MentorshipAssignment)
def handle_assignment_created(sender, instance, created, **kwargs):
    """Handle new mentorship assignment creation"""
    if created:
        # Create notification for mentor
        MentorNotification.objects.create(
            recipient=instance.mentor,
            notification_type=MentorNotification.NotificationType.NEW_ASSIGNMENT,
            title=f"New Student Assignment: {instance.student.full_name}",
            message=f"You have been assigned a new student: {instance.student.full_name} in {instance.cohort.name}",
            assignment=instance,
            action_url=f"/mentor/assignments/{instance.id}/"
        )
        
        # Create notification for student
        MentorNotification.objects.create(
            recipient=instance.student,
            notification_type=MentorNotification.NotificationType.NEW_ASSIGNMENT,
            title=f"Mentor Assigned: {instance.mentor.full_name}",
            message=f"You have been assigned a mentor: {instance.mentor.full_name}",
            assignment=instance,
            action_url=f"/student/mentor/{instance.id}/"
        )
        
        # Send email notifications if configured
        if hasattr(settings, 'SEND_MENTOR_EMAILS') and settings.SEND_MENTOR_EMAILS:
            send_assignment_emails(instance)


@receiver(post_save, sender=MentorSession)
def handle_session_created_or_updated(sender, instance, created, **kwargs):
    """Handle session creation and status updates"""
    if created:
        # Create reminder notification 24 hours before session
        MentorNotification.objects.create(
            recipient=instance.assignment.mentor,
            notification_type=MentorNotification.NotificationType.SESSION_REMINDER,
            title=f"Upcoming Session: {instance.title}",
            message=f"You have a session scheduled with {instance.assignment.student.full_name} on {instance.scheduled_at.strftime('%Y-%m-%d at %H:%M')}",
            session=instance,
            assignment=instance.assignment,
            action_url=f"/mentor/sessions/{instance.id}/"
        )
        
        # Create notification for student
        MentorNotification.objects.create(
            recipient=instance.assignment.student,
            notification_type=MentorNotification.NotificationType.SESSION_REMINDER,
            title=f"Upcoming Session: {instance.title}",
            message=f"You have a session scheduled with {instance.assignment.mentor.full_name} on {instance.scheduled_at.strftime('%Y-%m-%d at %H:%M')}",
            session=instance,
            assignment=instance.assignment,
            action_url=f"/student/sessions/{instance.id}/"
        )
    
    # Handle status changes
    if not created and instance.status == MentorSession.Status.COMPLETED:
        update_mentor_analytics_for_session(instance)


@receiver(post_save, sender=MentorMessage)
def handle_message_created(sender, instance, created, **kwargs):
    """Handle new message creation"""
    if created:
        # Determine recipient (opposite of sender)
        if instance.sender == instance.assignment.mentor:
            recipient = instance.assignment.student
            recipient_type = "student"
        else:
            recipient = instance.assignment.mentor
            recipient_type = "mentor"
        
        # Create notification
        MentorNotification.objects.create(
            recipient=recipient,
            notification_type=MentorNotification.NotificationType.MESSAGE_RECEIVED,
            title=f"New Message from {instance.sender.full_name}",
            message=f"You have received a new message: {instance.content[:100]}{'...' if len(instance.content) > 100 else ''}",
            assignment=instance.assignment,
            action_url=f"/{recipient_type}/messages/{instance.assignment.id}/"
        )
        
        # Update analytics
        update_mentor_analytics_for_message(instance)


@receiver(post_save, sender=MentorFeedback)
def handle_feedback_created(sender, instance, created, **kwargs):
    """Handle new feedback creation"""
    if created:
        # Create notification for student
        MentorNotification.objects.create(
            recipient=instance.assignment.student,
            notification_type=MentorNotification.NotificationType.FEEDBACK_REQUEST,
            title=f"New Feedback: {instance.title}",
            message=f"Your mentor has provided feedback on: {instance.title}",
            assignment=instance.assignment,
            action_url=f"/student/feedback/{instance.id}/"
        )
        
        # Update analytics
        update_mentor_analytics_for_feedback(instance)


@receiver(post_save, sender=MentorshipGoal)
def handle_goal_created_or_updated(sender, instance, created, **kwargs):
    """Handle goal creation and deadline reminders"""
    if created:
        # Notify both mentor and student
        for recipient in [instance.assignment.mentor, instance.assignment.student]:
            MentorNotification.objects.create(
                recipient=recipient,
                notification_type=MentorNotification.NotificationType.GOAL_DEADLINE,
                title=f"New Goal: {instance.title}",
                message=f"A new goal has been set: {instance.title} (Due: {instance.target_date})",
                assignment=instance.assignment,
                action_url=f"/mentor/goals/{instance.id}/" if recipient == instance.assignment.mentor else f"/student/goals/{instance.id}/"
            )
    
    # Check for approaching deadlines
    if instance.status in [MentorshipGoal.Status.NOT_STARTED, MentorshipGoal.Status.IN_PROGRESS]:
        days_until_deadline = (instance.target_date - timezone.now().date()).days
        if days_until_deadline <= 3:  # 3 days warning
            for recipient in [instance.assignment.mentor, instance.assignment.student]:
                MentorNotification.objects.create(
                    recipient=recipient,
                    notification_type=MentorNotification.NotificationType.GOAL_DEADLINE,
                    title=f"Goal Deadline Approaching: {instance.title}",
                    message=f"Goal '{instance.title}' is due in {days_until_deadline} days",
                    assignment=instance.assignment,
                    action_url=f"/mentor/goals/{instance.id}/" if recipient == instance.assignment.mentor else f"/student/goals/{instance.id}/"
                )


@receiver(post_save, sender=StudentProgress)
def handle_progress_updated(sender, instance, created, **kwargs):
    """Handle student progress updates"""
    if created or not created:  # Handle both create and update
        # Notify mentor of progress update
        MentorNotification.objects.create(
            recipient=instance.assignment.mentor,
            notification_type=MentorNotification.NotificationType.STUDENT_PROGRESS,
            title=f"Progress Update: {instance.assignment.student.full_name}",
            message=f"New progress recorded for {instance.assignment.student.full_name} on {instance.date}",
            assignment=instance.assignment,
            action_url=f"/mentor/students/{instance.assignment.student.id}/progress/"
        )


# Utility functions for signals

def send_assignment_emails(assignment):
    """Send email notifications for new assignments"""
    try:
        # Email to mentor
        mentor_subject = f"New Student Assignment - {assignment.student.full_name}"
        mentor_message = render_to_string('mentor_flow/emails/mentor_assignment.html', {
            'mentor': assignment.mentor,
            'student': assignment.student,
            'cohort': assignment.cohort,
            'assignment': assignment,
        })
        
        send_mail(
            mentor_subject,
            '',
            settings.DEFAULT_FROM_EMAIL,
            [assignment.mentor.email],
            html_message=mentor_message,
            fail_silently=True
        )
        
        # Email to student
        student_subject = f"Mentor Assigned - {assignment.mentor.full_name}"
        student_message = render_to_string('mentor_flow/emails/student_assignment.html', {
            'student': assignment.student,
            'mentor': assignment.mentor,
            'cohort': assignment.cohort,
            'assignment': assignment,
        })
        
        send_mail(
            student_subject,
            '',
            settings.DEFAULT_FROM_EMAIL,
            [assignment.student.email],
            html_message=student_message,
            fail_silently=True
        )
        
    except Exception as e:
        # Log error but don't fail the assignment creation
        print(f"Failed to send assignment emails: {e}")


def update_mentor_analytics_for_session(session):
    """Update mentor analytics when a session is completed"""
    if session.status != MentorSession.Status.COMPLETED:
        return
    
    mentor = session.assignment.mentor
    today = timezone.now().date()
    
    analytics, created = MentorAnalytics.objects.get_or_create(
        mentor=mentor,
        date=today,
        defaults={
            'sessions_conducted': 0,
            'total_session_time_minutes': 0,
            'active_students': 0,
            'students_helped': 0,
            'messages_sent': 0,
            'feedback_given': 0,
            'student_satisfaction': 0.0,
            'goal_completion_rate': 0.0,
        }
    )
    
    analytics.sessions_conducted += 1
    if session.actual_duration_minutes:
        analytics.total_session_time_minutes += session.actual_duration_minutes
    
    # Update average session rating
    if session.student_rating:
        sessions_with_ratings = MentorSession.objects.filter(
            assignment__mentor=mentor,
            student_rating__isnull=False,
            status=MentorSession.Status.COMPLETED
        )
        total_rating = sum(s.student_rating for s in sessions_with_ratings)
        analytics.average_session_rating = total_rating / sessions_with_ratings.count()
    
    analytics.save()


def update_mentor_analytics_for_message(message):
    """Update mentor analytics when a message is sent"""
    if message.sender.usercohort_set.filter(role='mentor').exists():
        mentor = message.sender
        today = timezone.now().date()
        
        analytics, created = MentorAnalytics.objects.get_or_create(
            mentor=mentor,
            date=today,
            defaults={
                'sessions_conducted': 0,
                'total_session_time_minutes': 0,
                'active_students': 0,
                'students_helped': 0,
                'messages_sent': 0,
                'feedback_given': 0,
                'student_satisfaction': 0.0,
                'goal_completion_rate': 0.0,
            }
        )
        
        analytics.messages_sent += 1
        analytics.save()


def update_mentor_analytics_for_feedback(feedback):
    """Update mentor analytics when feedback is given"""
    mentor = feedback.assignment.mentor
    today = timezone.now().date()
    
    analytics, created = MentorAnalytics.objects.get_or_create(
        mentor=mentor,
        date=today,
        defaults={
            'sessions_conducted': 0,
            'total_session_time_minutes': 0,
            'active_students': 0,
            'students_helped': 0,
            'messages_sent': 0,
            'feedback_given': 0,
            'student_satisfaction': 0.0,
            'goal_completion_rate': 0.0,
        }
    )
    
    analytics.feedback_given += 1
    analytics.save()


# Daily analytics update (would be called by a management command or cron job)
def update_daily_mentor_analytics():
    """Update mentor analytics for all mentors"""
    from django.db.models import Count, Avg
    from .models import MentorProfile
    
    today = timezone.now().date()
    
    for mentor_profile in MentorProfile.objects.filter(status=MentorProfile.Status.ACTIVE):
        mentor = mentor_profile.user
        
        # Get or create analytics record
        analytics, created = MentorAnalytics.objects.get_or_create(
            mentor=mentor,
            date=today,
            defaults={
                'sessions_conducted': 0,
                'total_session_time_minutes': 0,
                'active_students': 0,
                'students_helped': 0,
                'messages_sent': 0,
                'feedback_given': 0,
                'student_satisfaction': 0.0,
                'goal_completion_rate': 0.0,
            }
        )
        
        # Update active students count
        active_assignments = MentorshipAssignment.objects.filter(
            mentor=mentor,
            status__in=[MentorshipAssignment.Status.ACTIVE, MentorshipAssignment.Status.PENDING]
        )
        analytics.active_students = active_assignments.count()
        
        # Update students helped (total unique students mentored)
        analytics.students_helped = MentorshipAssignment.objects.filter(
            mentor=mentor,
            status__in=[
                MentorshipAssignment.Status.ACTIVE,
                MentorshipAssignment.Status.COMPLETED,
                MentorshipAssignment.Status.PENDING
            ]
        ).values('student').distinct().count()
        
        # Calculate goal completion rate
        goals = MentorshipGoal.objects.filter(assignment__mentor=mentor)
        if goals.exists():
            completed_goals = goals.filter(status=MentorshipGoal.Status.COMPLETED).count()
            analytics.goal_completion_rate = (completed_goals / goals.count()) * 100
        
        # Calculate student satisfaction from recent sessions
        recent_sessions = MentorSession.objects.filter(
            assignment__mentor=mentor,
            student_rating__isnull=False,
            scheduled_at__gte=today - timezone.timedelta(days=30)  # Last 30 days
        )
        if recent_sessions.exists():
            analytics.student_satisfaction = recent_sessions.aggregate(
                avg_rating=Avg('student_rating')
            )['avg_rating'] or 0
        
        analytics.save() 