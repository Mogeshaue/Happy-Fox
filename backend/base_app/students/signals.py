from django.db.models.signals import post_save, post_delete, pre_save
from django.dispatch import receiver
from django.utils import timezone
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from datetime import timedelta, datetime
import logging

from .models import (
    StudentProfile, StudentEnrollment, LearningSession, AssignmentSubmission,
    StudyGroup, StudyGroupMembership, LearningGoal, QuizAttempt,
    StudentNotification, StudentAnalytics, StudentAchievement,
    TaskCompletion, User, Course, Task
)

logger = logging.getLogger(__name__)


# =================== ENROLLMENT SIGNALS ===================

@receiver(post_save, sender=StudentEnrollment)
def handle_enrollment_created(sender, instance, created, **kwargs):
    """Handle new student enrollment"""
    if created:
        # Send welcome notification
        StudentNotification.objects.create(
            recipient=instance.student,
            notification_type=StudentNotification.Type.COURSE_UPDATE,
            priority=StudentNotification.Priority.MEDIUM,
            title=f'Welcome to {instance.course.name}!',
            message=f'You have been enrolled in {instance.course.name}. Start your learning journey now!',
            course=instance.course,
            action_url=f'/courses/{instance.course.id}/',
            action_text='Start Learning'
        )
        
        # Send email notification if enabled
        if hasattr(instance.student, 'student_profile') and instance.student.student_profile.email_notifications:
            send_enrollment_email(instance)
        
        # Create initial learning goal
        if instance.course.learning_objectives:
            for i, objective in enumerate(instance.course.learning_objectives[:3]):  # Limit to first 3
                LearningGoal.objects.create(
                    student=instance.student,
                    title=f'Master: {objective}',
                    description=f'Complete learning objective: {objective}',
                    category=LearningGoal.Category.ACADEMIC,
                    priority=LearningGoal.Priority.HIGH if i == 0 else LearningGoal.Priority.MEDIUM,
                    course=instance.course,
                    target_date=timezone.now().date() + timedelta(
                        weeks=instance.course.estimated_duration_weeks or 8
                    )
                )


@receiver(post_save, sender=StudentEnrollment)
def handle_enrollment_completion(sender, instance, **kwargs):
    """Handle course completion"""
    if instance.status == 'completed' and instance.completed_at:
        # Create achievement
        StudentAchievement.objects.get_or_create(
            student=instance.student,
            course=instance.course,
            achievement_type=StudentAchievement.Type.COMPLETION,
            defaults={
                'title': f'Course Completed: {instance.course.name}',
                'description': f'Successfully completed {instance.course.name}',
                'badge_icon': 'graduation-cap',
                'badge_color': '#10B981',
                'points_earned': 100,
                'criteria_met': {
                    'course_id': instance.course.id,
                    'completion_date': instance.completed_at.isoformat(),
                    'final_grade': float(instance.grade) if instance.grade else 0
                }
            }
        )
        
        # Update student profile
        if hasattr(instance.student, 'student_profile'):
            profile = instance.student.student_profile
            profile.completed_courses += 1
            profile.save()
        
        # Send completion notification
        StudentNotification.objects.create(
            recipient=instance.student,
            notification_type=StudentNotification.Type.ACHIEVEMENT,
            priority=StudentNotification.Priority.HIGH,
            title='Congratulations! Course Completed!',
            message=f'You have successfully completed {instance.course.name}. Well done!',
            course=instance.course,
            action_url=f'/certificates/{instance.id}/',
            action_text='View Certificate'
        )


# =================== LEARNING SESSION SIGNALS ===================

@receiver(post_save, sender=LearningSession)
def handle_session_completed(sender, instance, **kwargs):
    """Handle completed learning session"""
    if instance.status == 'completed' and instance.ended_at:
        # Update student profile activity
        if hasattr(instance.student, 'student_profile'):
            profile = instance.student.student_profile
            profile.total_study_hours += (instance.total_duration_minutes // 60)
            profile.update_streak()
            profile.save()
        
        # Check for study streak achievements
        if hasattr(instance.student, 'student_profile'):
            streak_days = instance.student.student_profile.streak_days
            
            # Achievement milestones
            milestones = [7, 30, 60, 100, 365]
            for milestone in milestones:
                if streak_days == milestone:
                    StudentAchievement.objects.get_or_create(
                        student=instance.student,
                        achievement_type=StudentAchievement.Type.STREAK,
                        title=f'{milestone}-Day Study Streak',
                        defaults={
                            'description': f'Maintained a {milestone}-day consecutive study streak',
                            'badge_icon': 'fire',
                            'badge_color': '#F59E0B',
                            'points_earned': milestone // 7 * 10,
                            'criteria_met': {'streak_days': milestone}
                        }
                    )
        
        # Update daily analytics
        update_daily_student_analytics(instance.student, timezone.now().date())


# =================== ASSIGNMENT SIGNALS ===================

@receiver(post_save, sender=AssignmentSubmission)
def handle_assignment_submitted(sender, instance, created, **kwargs):
    """Handle assignment submission"""
    if instance.status == 'submitted' and instance.submitted_at:
        # Notify instructors/mentors
        notify_assignment_submitted(instance)
        
        # Send confirmation to student
        StudentNotification.objects.create(
            recipient=instance.student,
            notification_type=StudentNotification.Type.ASSIGNMENT_DUE,
            priority=StudentNotification.Priority.MEDIUM,
            title='Assignment Submitted Successfully',
            message=f'Your submission for "{instance.task.title}" has been received and is under review.',
            course=instance.course,
            task=instance.task,
            action_url=f'/assignments/{instance.uuid}/',
            action_text='View Submission'
        )


@receiver(post_save, sender=AssignmentSubmission)
def handle_assignment_graded(sender, instance, **kwargs):
    """Handle assignment grading"""
    if instance.status == 'graded' and instance.graded_at and instance.score is not None:
        # Notify student of grade
        grade_message = f'Grade: {instance.score}/{instance.max_score}'
        if instance.grade_letter:
            grade_message += f' ({instance.grade_letter})'
        
        StudentNotification.objects.create(
            recipient=instance.student,
            notification_type=StudentNotification.Type.GRADE_RELEASED,
            priority=StudentNotification.Priority.HIGH,
            title=f'Assignment Graded: {instance.task.title}',
            message=f'{grade_message}. {instance.grader_feedback[:100] if instance.grader_feedback else ""}',
            course=instance.course,
            task=instance.task,
            action_url=f'/assignments/{instance.uuid}/',
            action_text='View Feedback'
        )
        
        # Check for high performance achievement
        if instance.percentage_score >= 95:
            StudentAchievement.objects.get_or_create(
                student=instance.student,
                task=instance.task,
                achievement_type=StudentAchievement.Type.PERFORMANCE,
                title='Excellence in Assignment',
                defaults={
                    'description': f'Scored {instance.percentage_score:.1f}% on {instance.task.title}',
                    'badge_icon': 'star',
                    'badge_color': '#8B5CF6',
                    'points_earned': 25,
                    'criteria_met': {
                        'assignment_id': instance.id,
                        'score': float(instance.percentage_score)
                    }
                }
            )


# =================== STUDY GROUP SIGNALS ===================

@receiver(post_save, sender=StudyGroupMembership)
def handle_study_group_membership(sender, instance, created, **kwargs):
    """Handle study group membership changes"""
    if created:
        # Notify group creator of new join request
        if instance.status == 'pending':
            StudentNotification.objects.create(
                recipient=instance.study_group.creator,
                notification_type=StudentNotification.Type.STUDY_GROUP,
                priority=StudentNotification.Priority.MEDIUM,
                title='New Study Group Join Request',
                message=f'{instance.student.full_name} wants to join "{instance.study_group.name}"',
                study_group=instance.study_group,
                action_url=f'/study-groups/{instance.study_group.uuid}/members/',
                action_text='Review Request'
            )
        
        # Welcome new member
        elif instance.status == 'active':
            StudentNotification.objects.create(
                recipient=instance.student,
                notification_type=StudentNotification.Type.STUDY_GROUP,
                priority=StudentNotification.Priority.MEDIUM,
                title=f'Welcome to {instance.study_group.name}!',
                message=f'You are now a member of the study group "{instance.study_group.name}"',
                study_group=instance.study_group,
                action_url=f'/study-groups/{instance.study_group.uuid}/',
                action_text='View Group'
            )


# =================== LEARNING GOAL SIGNALS ===================

@receiver(post_save, sender=LearningGoal)
def handle_goal_completion(sender, instance, **kwargs):
    """Handle learning goal completion"""
    if instance.status == 'completed' and instance.completed_at:
        # Create achievement
        StudentAchievement.objects.get_or_create(
            student=instance.student,
            achievement_type=StudentAchievement.Type.MILESTONE,
            title=f'Goal Achieved: {instance.title}',
            defaults={
                'description': f'Successfully completed learning goal: {instance.title}',
                'badge_icon': 'target',
                'badge_color': '#06B6D4',
                'points_earned': 15,
                'criteria_met': {
                    'goal_id': instance.id,
                    'completion_date': instance.completed_at.isoformat()
                }
            }
        )
        
        # Send congratulations
        StudentNotification.objects.create(
            recipient=instance.student,
            notification_type=StudentNotification.Type.ACHIEVEMENT,
            priority=StudentNotification.Priority.HIGH,
            title='Goal Completed!',
            message=f'Congratulations! You have achieved your goal: {instance.title}',
            course=instance.course,
            action_url=f'/goals/{instance.uuid}/',
            action_text='View Goal'
        )


# =================== QUIZ ATTEMPT SIGNALS ===================

@receiver(post_save, sender=QuizAttempt)
def handle_quiz_completion(sender, instance, **kwargs):
    """Handle quiz attempt completion"""
    if instance.status == 'completed' and instance.completed_at:
        # Check for perfect score achievement
        if instance.percentage_score == 100:
            StudentAchievement.objects.get_or_create(
                student=instance.student,
                task=instance.task,
                achievement_type=StudentAchievement.Type.PERFORMANCE,
                title='Perfect Score!',
                defaults={
                    'description': f'Scored 100% on {instance.task.title}',
                    'badge_icon': 'trophy',
                    'badge_color': '#F59E0B',
                    'points_earned': 20,
                    'criteria_met': {
                        'quiz_attempt_id': instance.id,
                        'score': 100.0
                    }
                }
            )
        
        # Update daily analytics
        update_daily_student_analytics(instance.student, timezone.now().date())


# =================== TASK COMPLETION SIGNALS ===================

@receiver(post_save, sender=TaskCompletion)
def handle_task_completion(sender, instance, created, **kwargs):
    """Handle task completion"""
    if created and instance.is_passed:
        # Update enrollment progress
        if instance.task:
            enrollments = StudentEnrollment.objects.filter(
                student=instance.user,
                course__coursetask__task=instance.task
            )
            
            for enrollment in enrollments:
                update_enrollment_progress(enrollment)
        
        # Update daily analytics
        update_daily_student_analytics(instance.user, timezone.now().date())


# =================== NOTIFICATION SIGNALS ===================

@receiver(post_save, sender=StudentNotification)
def handle_notification_created(sender, instance, created, **kwargs):
    """Handle new notification creation"""
    if created and getattr(settings, 'SEND_STUDENT_EMAILS', True):
        # Send email notification if user has email notifications enabled
        if (hasattr(instance.recipient, 'student_profile') and 
            instance.recipient.student_profile.email_notifications and
            instance.priority in ['high', 'urgent']):
            
            send_notification_email(instance)


# =================== HELPER FUNCTIONS ===================

def send_enrollment_email(enrollment):
    """Send enrollment confirmation email"""
    try:
        subject = f'Welcome to {enrollment.course.name}'
        context = {
            'student_name': enrollment.student.first_name,
            'course_name': enrollment.course.name,
            'course_description': enrollment.course.description,
            'course_url': f'/courses/{enrollment.course.id}/',
            'organization': enrollment.course.org.name
        }
        
        html_message = render_to_string('student_flow/emails/enrollment_welcome.html', context)
        plain_message = render_to_string('student_flow/emails/enrollment_welcome.txt', context)
        
        send_mail(
            subject=subject,
            message=plain_message,
            html_message=html_message,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@example.com'),
            recipient_list=[enrollment.student.email],
            fail_silently=True
        )
        
        # Mark as sent
        enrollment_notification = StudentNotification.objects.filter(
            recipient=enrollment.student,
            course=enrollment.course,
            notification_type=StudentNotification.Type.COURSE_UPDATE
        ).first()
        
        if enrollment_notification:
            enrollment_notification.sent_via_email = True
            enrollment_notification.email_sent_at = timezone.now()
            enrollment_notification.save()
            
    except Exception as e:
        logger.error(f'Failed to send enrollment email: {e}')


def send_notification_email(notification):
    """Send email for high priority notifications"""
    try:
        subject = notification.title
        context = {
            'student_name': notification.recipient.first_name,
            'title': notification.title,
            'message': notification.message,
            'action_url': notification.action_url,
            'action_text': notification.action_text,
            'course_name': notification.course.name if notification.course else None
        }
        
        html_message = render_to_string('student_flow/emails/notification.html', context)
        plain_message = render_to_string('student_flow/emails/notification.txt', context)
        
        send_mail(
            subject=subject,
            message=plain_message,
            html_message=html_message,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply@example.com'),
            recipient_list=[notification.recipient.email],
            fail_silently=True
        )
        
        # Mark as sent
        notification.sent_via_email = True
        notification.email_sent_at = timezone.now()
        notification.save()
        
    except Exception as e:
        logger.error(f'Failed to send notification email: {e}')


def notify_assignment_submitted(assignment):
    """Notify instructors about assignment submission"""
    # Get instructors/mentors for this course
    instructors = User.objects.filter(
        usercohort__cohort__coursecohort__course=assignment.course,
        usercohort__role='mentor'
    ).distinct()
    
    for instructor in instructors:
        StudentNotification.objects.create(
            recipient=instructor,
            notification_type=StudentNotification.Type.COURSE_UPDATE,
            priority=StudentNotification.Priority.MEDIUM,
            title='Assignment Submitted for Review',
            message=f'{assignment.student.full_name} submitted "{assignment.task.title}"',
            course=assignment.course,
            task=assignment.task,
            action_url=f'/assignments/{assignment.uuid}/grade/',
            action_text='Review Submission'
        )


def update_enrollment_progress(enrollment):
    """Update enrollment progress based on completed tasks"""
    course = enrollment.course
    
    # Get all tasks for the course
    total_tasks = course.coursetask_set.count()
    
    if total_tasks == 0:
        return
    
    # Get completed tasks
    completed_tasks = TaskCompletion.objects.filter(
        user=enrollment.student,
        task__coursetask__course=course,
        is_passed=True
    ).count()
    
    # Update progress
    new_progress = (completed_tasks / total_tasks) * 100
    enrollment.progress_percentage = new_progress
    
    # Check if course is completed
    if new_progress >= 100 and enrollment.status != 'completed':
        enrollment.status = 'completed'
        enrollment.completed_at = timezone.now()
        
        # Calculate final grade
        avg_score = TaskCompletion.objects.filter(
            user=enrollment.student,
            task__coursetask__course=course,
            score__isnull=False
        ).aggregate(avg=models.Avg('score'))['avg']
        
        if avg_score:
            enrollment.grade = avg_score
    
    enrollment.save()


def update_daily_student_analytics(student, date):
    """Update daily analytics for a student"""
    try:
        analytics, created = StudentAnalytics.objects.get_or_create(
            student=student,
            date=date,
            defaults={
                'study_time_minutes': 0,
                'sessions_count': 0,
                'tasks_completed': 0,
                'questions_answered': 0,
                'correct_answers': 0,
                'average_score': 0.0,
                'accuracy_rate': 0.0
            }
        )
        
        # Study metrics
        daily_sessions = LearningSession.objects.filter(
            student=student,
            started_at__date=date,
            status='completed'
        )
        
        analytics.study_time_minutes = daily_sessions.aggregate(
            total=models.Sum('total_duration_minutes')
        )['total'] or 0
        analytics.sessions_count = daily_sessions.count()
        
        # Task completions
        daily_completions = TaskCompletion.objects.filter(
            user=student,
            completed_at__date=date,
            is_passed=True
        )
        analytics.tasks_completed = daily_completions.count()
        
        # Quiz performance
        daily_quiz_attempts = QuizAttempt.objects.filter(
            student=student,
            completed_at__date=date,
            status='completed'
        )
        
        if daily_quiz_attempts.exists():
            quiz_stats = daily_quiz_attempts.aggregate(
                total_questions=models.Sum('total_questions'),
                total_answered=models.Sum('questions_answered'),
                total_correct=models.Sum('correct_answers'),
                avg_score=models.Avg('percentage_score')
            )
            
            analytics.questions_answered = quiz_stats['total_answered'] or 0
            analytics.correct_answers = quiz_stats['total_correct'] or 0
            analytics.average_score = quiz_stats['avg_score'] or 0.0
            
            if analytics.questions_answered > 0:
                analytics.accuracy_rate = (analytics.correct_answers / analytics.questions_answered) * 100
        
        # Course metrics
        analytics.courses_enrolled = StudentEnrollment.objects.filter(
            student=student,
            enrolled_at__date__lte=date,
            status__in=['enrolled', 'in_progress', 'completed']
        ).count()
        
        analytics.courses_in_progress = StudentEnrollment.objects.filter(
            student=student,
            enrolled_at__date__lte=date,
            status='in_progress'
        ).count()
        
        analytics.courses_completed = StudentEnrollment.objects.filter(
            student=student,
            completed_at__date__lte=date,
            status='completed'
        ).count()
        
        # Goal metrics
        analytics.goals_created = LearningGoal.objects.filter(
            student=student,
            created_at__date=date
        ).count()
        
        analytics.goals_completed = LearningGoal.objects.filter(
            student=student,
            completed_at__date=date,
            status='completed'
        ).count()
        
        analytics.goals_overdue = LearningGoal.objects.filter(
            student=student,
            target_date__lt=date,
            status__in=['not_started', 'in_progress']
        ).count()
        
        # Streak and achievements
        if hasattr(student, 'student_profile'):
            analytics.study_streak_days = student.student_profile.streak_days
        
        analytics.achievements_earned = StudentAchievement.objects.filter(
            student=student,
            earned_at__date=date
        ).count()
        
        analytics.save()
        
    except Exception as e:
        logger.error(f'Failed to update student analytics: {e}')


# =================== PERIODIC TASKS ===================

def send_goal_reminders():
    """Send reminders for upcoming goal deadlines (called by management command)"""
    tomorrow = timezone.now().date() + timedelta(days=1)
    next_week = timezone.now().date() + timedelta(days=7)
    
    # Goals due tomorrow
    urgent_goals = LearningGoal.objects.filter(
        target_date=tomorrow,
        status__in=['not_started', 'in_progress']
    ).select_related('student')
    
    for goal in urgent_goals:
        StudentNotification.objects.get_or_create(
            recipient=goal.student,
            notification_type=StudentNotification.Type.GOAL_REMINDER,
            priority=StudentNotification.Priority.URGENT,
            title='Goal Due Tomorrow!',
            message=f'Your goal "{goal.title}" is due tomorrow. Don\'t forget to complete it!',
            course=goal.course,
            action_url=f'/goals/{goal.uuid}/',
            action_text='Work on Goal',
            defaults={
                'metadata': {'goal_id': str(goal.uuid)}
            }
        )
    
    # Goals due next week
    weekly_goals = LearningGoal.objects.filter(
        target_date=next_week,
        status__in=['not_started', 'in_progress']
    ).select_related('student')
    
    for goal in weekly_goals:
        StudentNotification.objects.get_or_create(
            recipient=goal.student,
            notification_type=StudentNotification.Type.GOAL_REMINDER,
            priority=StudentNotification.Priority.MEDIUM,
            title='Goal Due Next Week',
            message=f'Reminder: Your goal "{goal.title}" is due next week.',
            course=goal.course,
            action_url=f'/goals/{goal.uuid}/',
            action_text='Work on Goal',
            defaults={
                'metadata': {'goal_id': str(goal.uuid)}
            }
        )


def send_study_reminders():
    """Send study reminders to inactive students (called by management command)"""
    # Students who haven't studied in 3 days
    three_days_ago = timezone.now() - timedelta(days=3)
    
    inactive_students = User.objects.filter(
        student_profile__status='active',
        student_profile__email_notifications=True
    ).exclude(
        learning_sessions__started_at__gte=three_days_ago
    ).distinct()
    
    for student in inactive_students:
        # Get their current enrollments
        current_courses = StudentEnrollment.objects.filter(
            student=student,
            status='in_progress'
        ).select_related('course')[:3]
        
        if current_courses:
            course_names = ', '.join([e.course.name for e in current_courses])
            StudentNotification.objects.create(
                recipient=student,
                notification_type=StudentNotification.Type.STUDY_REMINDER,
                priority=StudentNotification.Priority.LOW,
                title='Time to Study!',
                message=f'You haven\'t studied in a while. Continue with: {course_names}',
                action_url='/dashboard/',
                action_text='Start Learning'
            ) 