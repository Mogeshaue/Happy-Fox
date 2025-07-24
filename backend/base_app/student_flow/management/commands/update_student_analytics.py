from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from student_flow.signals import update_daily_student_analytics
from student_flow.models import StudentProfile, UserCohort
from django.db.models import Q

User = get_user_model()


class Command(BaseCommand):
    help = 'Update daily student analytics for all active students'

    def add_arguments(self, parser):
        parser.add_argument(
            '--date',
            type=str,
            help='Date to update analytics for (YYYY-MM-DD format). Defaults to today.',
        )

        parser.add_argument(
            '--student-id',
            type=int,
            help='Update analytics for specific student ID only',
        )

        parser.add_argument(
            '--student-email',
            type=str,
            help='Update analytics for specific student email only',
        )

        parser.add_argument(
            '--force',
            action='store_true',
            help='Force update even if analytics already exist for the date',
        )

        parser.add_argument(
            '--org-id',
            type=int,
            help='Update analytics for students in specific organization only',
        )

    def handle(self, *args, **options):
        date_str = options.get('date')
        student_id = options.get('student_id')
        student_email = options.get('student_email')
        org_id = options.get('org_id')
        force = options.get('force', False)

        if date_str:
            try:
                target_date = timezone.datetime.strptime(date_str, '%Y-%m-%d').date()
                self.stdout.write(f'Updating analytics for date: {target_date}')
            except ValueError:
                self.stdout.write(
                    self.style.ERROR('Invalid date format. Use YYYY-MM-DD.')
                )
                return
        else:
            target_date = timezone.now().date()
            self.stdout.write(f'Updating analytics for today: {target_date}')

        # Filter students
        students = User.objects.all()
        
        if student_id:
            students = students.filter(id=student_id)
            self.stdout.write(f'Updating analytics for student ID: {student_id}')
        elif student_email:
            students = students.filter(email=student_email)
            self.stdout.write(f'Updating analytics for student email: {student_email}')
        else:
            # Filter to active students only
            students = students.filter(
                Q(student_profile__status='active') | 
                Q(usercohort__role='learner', usercohort__status='active')
            ).distinct()

        if org_id:
            students = students.filter(
                userorganization__org_id=org_id
            )
            self.stdout.write(f'Updating analytics for organization ID: {org_id}')

        if not students.exists():
            self.stdout.write(
                self.style.WARNING('No students found matching criteria')
            )
            return

        updated_count = 0
        skipped_count = 0

        try:
            for student in students:
                # Check if analytics already exist for this date
                from student_flow.models import StudentAnalytics
                
                if not force and StudentAnalytics.objects.filter(
                    student=student, 
                    date=target_date
                ).exists():
                    self.stdout.write(
                        self.style.WARNING(
                            f'Analytics already exist for {student.email} on {target_date}, skipping'
                        )
                    )
                    skipped_count += 1
                    continue

                # Update analytics for this student
                update_daily_student_analytics(student, target_date)
                updated_count += 1
                
                self.stdout.write(
                    self.style.SUCCESS(f'Updated analytics for {student.email}')
                )

            # Summary
            self.stdout.write(
                self.style.SUCCESS(
                    f'Analytics update completed. Updated: {updated_count}, Skipped: {skipped_count}'
                )
            )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error updating student analytics: {str(e)}')
            ) 