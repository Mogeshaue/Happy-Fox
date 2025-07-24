from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings
from datetime import datetime, timedelta

from .models import (
    User, Organization, UserOrganization, Course, Task, TaskCompletion,
    AdminProfile, AdminAction, AdminNotification, AdminAnalytics,
    ContentGenerationJob, BulkOperation
)


# =================== AUDIT LOGGING SIGNALS ===================

@receiver(post_save, sender=User)
def log_user_creation(sender, instance, created, **kwargs):
    """Log user creation"""
    if created:
        # Create notification for organization admins
        for user_org in instance.userorganization_set.all():
            admins = UserOrganization.objects.filter(
                org=user_org.org,
                role__in=['admin', 'owner']
            ).select_related('user')
            
            for admin_user_org in admins:
                AdminNotification.objects.create(
                    recipient=admin_user_org.user,
                    notification_type=AdminNotification.Type.USER_SIGNUP,
                    priority=AdminNotification.Priority.LOW,
                    title='New User Signup',
                    message=f'New user {instance.email} has joined {user_org.org.name}',
                    organization=user_org.org,
                    related_object_type='User',
                    related_object_id=instance.id,
                    metadata={'user_email': instance.email}
                )


@receiver(post_save, sender=Course)
def log_course_creation(sender, instance, created, **kwargs):
    """Log course creation and notify admins"""
    if created:
        # Notify organization admins
        admins = UserOrganization.objects.filter(
            org=instance.org,
            role__in=['admin', 'owner']
        ).select_related('user')
        
        for admin_user_org in admins:
            AdminNotification.objects.create(
                recipient=admin_user_org.user,
                notification_type=AdminNotification.Type.CONTENT_PUBLISHED,
                priority=AdminNotification.Priority.MEDIUM,
                title='New Course Created',
                message=f'Course "{instance.name}" has been created',
                organization=instance.org,
                related_object_type='Course',
                related_object_id=instance.id,
                metadata={'course_name': instance.name}
            )


@receiver(post_save, sender=Task)
def log_task_updates(sender, instance, created, **kwargs):
    """Log task creation and status changes"""
    if created:
        # Update daily analytics
        update_daily_content_analytics(instance.org)
    elif instance.status == 'published':
        # Notify when task is published
        admins = UserOrganization.objects.filter(
            org=instance.org,
            role__in=['admin', 'owner']
        ).select_related('user')
        
        for admin_user_org in admins:
            AdminNotification.objects.create(
                recipient=admin_user_org.user,
                notification_type=AdminNotification.Type.CONTENT_PUBLISHED,
                priority=AdminNotification.Priority.LOW,
                title='Task Published',
                message=f'Task "{instance.title}" has been published',
                organization=instance.org,
                related_object_type='Task',
                related_object_id=instance.id
            )


@receiver(post_save, sender=TaskCompletion)
def update_completion_analytics(sender, instance, created, **kwargs):
    """Update analytics when tasks are completed"""
    if created and instance.task:
        update_daily_engagement_analytics(instance.task.org)


@receiver(post_save, sender=ContentGenerationJob)
def notify_generation_status(sender, instance, created, **kwargs):
    """Notify admin when content generation completes"""
    if not created and instance.status == ContentGenerationJob.Status.COMPLETED:
        AdminNotification.objects.create(
            recipient=instance.started_by,
            notification_type=AdminNotification.Type.GENERATION_COMPLETE,
            priority=AdminNotification.Priority.MEDIUM,
            title='Content Generation Complete',
            message=f'{instance.job_type} generation has completed successfully',
            organization=instance.organization,
            related_object_type='ContentGenerationJob',
            related_object_id=instance.id,
            action_url=f'/admin/content-generation/{instance.uuid}/'
        )
        
        # Send email notification if enabled
        if getattr(settings, 'SEND_ADMIN_EMAILS', True):
            send_generation_complete_email(instance)


@receiver(post_save, sender=BulkOperation)
def notify_bulk_operation_status(sender, instance, created, **kwargs):
    """Notify admin when bulk operation completes"""
    if not created and instance.status in [BulkOperation.Status.COMPLETED, BulkOperation.Status.FAILED]:
        status_text = 'completed' if instance.status == BulkOperation.Status.COMPLETED else 'failed'
        priority = AdminNotification.Priority.MEDIUM if instance.status == BulkOperation.Status.COMPLETED else AdminNotification.Priority.HIGH
        
        AdminNotification.objects.create(
            recipient=instance.started_by,
            notification_type=AdminNotification.Type.SYSTEM_ALERT,
            priority=priority,
            title=f'Bulk Operation {status_text.title()}',
            message=f'{instance.operation_type} operation has {status_text}',
            organization=instance.organization,
            related_object_type='BulkOperation',
            related_object_id=instance.id
        )


# =================== ANALYTICS UPDATE SIGNALS ===================

@receiver(post_save, sender=UserOrganization)
def update_user_analytics(sender, instance, created, **kwargs):
    """Update user analytics when users join organizations"""
    if created:
        update_daily_user_analytics(instance.org)


@receiver(post_delete, sender=UserOrganization)
def update_user_analytics_on_removal(sender, instance, **kwargs):
    """Update analytics when users are removed from organizations"""
    update_daily_user_analytics(instance.org)


# =================== SYSTEM MONITORING SIGNALS ===================

@receiver(post_save, sender=Organization)
def monitor_organization_limits(sender, instance, created, **kwargs):
    """Monitor organization limits and send alerts"""
    if not created and instance.is_over_user_limit:
        # Send alert to organization admins
        admins = UserOrganization.objects.filter(
            org=instance,
            role__in=['admin', 'owner']
        ).select_related('user')
        
        for admin_user_org in admins:
            AdminNotification.objects.create(
                recipient=admin_user_org.user,
                notification_type=AdminNotification.Type.BILLING_ALERT,
                priority=AdminNotification.Priority.HIGH,
                title='User Limit Exceeded',
                message=f'{instance.name} has exceeded its user limit ({instance.current_user_count}/{instance.max_users})',
                organization=instance,
                related_object_type='Organization',
                related_object_id=instance.id,
                metadata={
                    'current_users': instance.current_user_count,
                    'max_users': instance.max_users
                }
            )


# =================== HELPER FUNCTIONS ===================

def update_daily_user_analytics(organization):
    """Update daily user analytics for an organization"""
    today = timezone.now().date()
    
    analytics, created = AdminAnalytics.objects.get_or_create(
        organization=organization,
        date=today,
        defaults={}
    )
    
    # Calculate user metrics
    total_users = UserOrganization.objects.filter(org=organization).count()
    new_users_today = UserOrganization.objects.filter(
        org=organization,
        created_at__date=today
    ).count()
    
    # Active users (logged in within last 30 days)
    thirty_days_ago = timezone.now() - timedelta(days=30)
    active_users = User.objects.filter(
        userorganization__org=organization,
        last_login__gte=thirty_days_ago
    ).distinct().count()
    
    analytics.total_users = total_users
    analytics.new_users = new_users_today
    analytics.active_users = active_users
    analytics.save()


def update_daily_content_analytics(organization):
    """Update daily content analytics for an organization"""
    today = timezone.now().date()
    
    analytics, created = AdminAnalytics.objects.get_or_create(
        organization=organization,
        date=today,
        defaults={}
    )
    
    # Calculate content metrics
    total_courses = Course.objects.filter(org=organization).count()
    new_courses_today = Course.objects.filter(
        org=organization,
        created_at__date=today
    ).count()
    total_tasks = Task.objects.filter(org=organization).count()
    
    analytics.total_courses = total_courses
    analytics.new_courses = new_courses_today
    analytics.total_tasks = total_tasks
    analytics.save()


def update_daily_engagement_analytics(organization):
    """Update daily engagement analytics for an organization"""
    today = timezone.now().date()
    
    analytics, created = AdminAnalytics.objects.get_or_create(
        organization=organization,
        date=today,
        defaults={}
    )
    
    # Calculate completion rate
    total_tasks = Task.objects.filter(org=organization).count()
    if total_tasks > 0:
        total_completions = TaskCompletion.objects.filter(
            task__org=organization
        ).count()
        
        # Get total possible completions (tasks * enrolled users)
        enrolled_users = User.objects.filter(
            userorganization__org=organization,
            userorganization__role='learner'
        ).distinct().count()
        
        total_possible = total_tasks * enrolled_users
        completion_rate = (total_completions / total_possible * 100) if total_possible > 0 else 0
        
        analytics.completion_rate = completion_rate
        analytics.save()


def send_generation_complete_email(job):
    """Send email notification for completed content generation"""
    if not getattr(settings, 'SEND_ADMIN_EMAILS', True):
        return
    
    subject = f'Content Generation Complete - {job.job_type}'
    message = f"""
    Hello {job.started_by.full_name},
    
    Your {job.job_type} content generation job has completed successfully.
    
    Organization: {job.organization.name}
    Job Type: {job.job_type}
    Started: {job.started_at}
    Completed: {job.completed_at}
    
    You can view the results in your admin dashboard.
    
    Best regards,
    Admin System
    """
    
    try:
        send_mail(
            subject,
            message,
            getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@example.com'),
            [job.started_by.email],
            fail_silently=True
        )
    except Exception:
        # Log error but don't fail the signal
        pass


def send_system_alert_email(notification):
    """Send email for critical system alerts"""
    if not getattr(settings, 'SEND_ADMIN_EMAILS', True):
        return
    
    if notification.priority != AdminNotification.Priority.URGENT:
        return
    
    subject = f'URGENT: {notification.title}'
    message = f"""
    URGENT SYSTEM ALERT
    
    {notification.message}
    
    Organization: {notification.organization.name if notification.organization else 'System Wide'}
    Time: {notification.created_at}
    
    Please take immediate action.
    
    Admin System
    """
    
    try:
        send_mail(
            subject,
            message,
            getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@example.com'),
            [notification.recipient.email],
            fail_silently=True
        )
    except Exception:
        pass


# =================== DAILY ANALYTICS UPDATE ===================

def update_daily_admin_analytics():
    """
    Function to be called by management command or cron job
    Updates analytics for all organizations
    """
    today = timezone.now().date()
    
    for org in Organization.objects.filter(is_active=True):
        analytics, created = AdminAnalytics.objects.get_or_create(
            organization=org,
            date=today,
            defaults={}
        )
        
        # User metrics
        total_users = UserOrganization.objects.filter(org=org).count()
        new_users_today = UserOrganization.objects.filter(
            org=org,
            created_at__date=today
        ).count()
        
        thirty_days_ago = timezone.now() - timedelta(days=30)
        active_users = User.objects.filter(
            userorganization__org=org,
            last_login__gte=thirty_days_ago
        ).distinct().count()
        
        # Content metrics
        total_courses = Course.objects.filter(org=org).count()
        new_courses_today = Course.objects.filter(
            org=org,
            created_at__date=today
        ).count()
        total_tasks = Task.objects.filter(org=org).count()
        
        # Engagement metrics
        today_completions = TaskCompletion.objects.filter(
            task__org=org,
            completed_at__date=today
        ).count()
        
        # Calculate completion rate
        total_completions = TaskCompletion.objects.filter(task__org=org).count()
        enrolled_users = User.objects.filter(
            userorganization__org=org,
            userorganization__role='learner'
        ).distinct().count()
        
        total_possible = total_tasks * enrolled_users
        completion_rate = (total_completions / total_possible * 100) if total_possible > 0 else 0
        
        # System metrics (placeholder - implement based on your infrastructure)
        api_calls = 0  # Implement based on your API logging
        storage_used = 0.0  # Implement based on your storage solution
        error_count = 0  # Implement based on your error logging
        
        # AI metrics
        ai_generations_today = ContentGenerationJob.objects.filter(
            organization=org,
            started_at__date=today,
            status=ContentGenerationJob.Status.COMPLETED
        ).count()
        
        # Update analytics
        analytics.total_users = total_users
        analytics.new_users = new_users_today
        analytics.active_users = active_users
        analytics.total_courses = total_courses
        analytics.new_courses = new_courses_today
        analytics.total_tasks = total_tasks
        analytics.total_sessions = today_completions  # Using completions as session proxy
        analytics.completion_rate = completion_rate
        analytics.api_calls = api_calls
        analytics.storage_used_gb = storage_used
        analytics.error_count = error_count
        analytics.content_generations = ai_generations_today
        analytics.save()


# =================== SECURITY MONITORING ===================

@receiver(post_save, sender=AdminProfile)
def monitor_admin_profile_changes(sender, instance, created, **kwargs):
    """Monitor changes to admin profiles for security"""
    if not created:
        # Check for role escalation
        if instance.role == AdminProfile.Role.SUPER_ADMIN:
            # Create security alert
            AdminNotification.objects.create(
                recipient=instance.user,
                notification_type=AdminNotification.Type.SECURITY_ALERT,
                priority=AdminNotification.Priority.URGENT,
                title='Admin Role Change',
                message=f'Admin profile for {instance.user.email} has been modified',
                related_object_type='AdminProfile',
                related_object_id=instance.id,
                metadata={'new_role': instance.role}
            )


@receiver(post_save, sender=AdminAction)
def monitor_sensitive_actions(sender, instance, created, **kwargs):
    """Monitor sensitive admin actions"""
    if created and instance.action_type in [
        AdminAction.ActionType.DELETE,
        AdminAction.ActionType.PERMISSION_CHANGE,
        AdminAction.ActionType.SYSTEM_CONFIG
    ]:
        # Create alert for sensitive actions
        AdminNotification.objects.create(
            recipient=instance.admin,
            notification_type=AdminNotification.Type.SECURITY_ALERT,
            priority=AdminNotification.Priority.HIGH,
            title='Sensitive Action Performed',
            message=f'Sensitive action {instance.action_type} was performed on {instance.object_type}',
            organization=instance.organization,
            related_object_type='AdminAction',
            related_object_id=instance.id,
            metadata={
                'action_type': instance.action_type,
                'object_type': instance.object_type,
                'object_name': instance.object_name
            }
        ) 