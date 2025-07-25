"""
Quick sample data generator for testing
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from admin_flow.models import (
    User, Organization, UserOrganization, Cohort, UserCohort,
    Course, Task, AdminProfile
)


class Command(BaseCommand):
    help = 'Generate minimal sample data for quick testing'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Creating quick test data...'))
        
        with transaction.atomic():
            # Create test organization
            org = Organization.objects.create(
                slug='test-org',
                name='Test Organization',
                default_logo_color='#2196F3',
                billing_tier='premium',
                max_users=100,
                storage_limit_gb=50
            )

            # Create super admin user
            admin_user = User.objects.create(
                email='admin@test.com',
                first_name='Super',
                last_name='Admin',
                default_dp_color='#FF5722'
            )

            # Create admin profile
            AdminProfile.objects.create(
                user=admin_user,
                role=AdminProfile.Role.SUPER_ADMIN,
                is_active=True
            )

            # Add admin to organization
            UserOrganization.objects.create(
                user=admin_user,
                org=org,
                role='owner'
            )

            # Create test users
            test_users = []
            for i in range(10):
                user = User.objects.create(
                    email=f'user{i+1}@test.com',
                    first_name=f'Test{i+1}',
                    last_name='User',
                    default_dp_color='#4CAF50'
                )
                test_users.append(user)
                
                UserOrganization.objects.create(
                    user=user,
                    org=org,
                    role='member'
                )

            # Create test cohort
            cohort = Cohort.objects.create(
                name='Test Cohort 2025',
                org=org,
                description='A test cohort for development',
                start_date=timezone.now().date(),
                max_students=50
            )

            # Enroll users in cohort
            for user in test_users[:5]:  # Enroll first 5 users
                UserCohort.objects.create(
                    user=user,
                    cohort=cohort,
                    role='learner'
                )

            # Create test course
            course = Course.objects.create(
                org=org,
                name='Introduction to Testing',
                description='A sample course for testing the platform',
                status='published',
                difficulty_level='beginner',
                estimated_duration_weeks=4,
                learning_objectives=['Testing basics', 'Sample data', 'Platform usage'],
                tags=['testing', 'sample'],
                created_by=admin_user
            )

            # Create test tasks
            tasks = []
            task_data = [
                ('Welcome to Testing', 'learning_material', 'Introduction to the platform'),
                ('Quick Quiz', 'quiz', 'Test your basic knowledge'),
                ('First Assignment', 'assignment', 'Complete your first task'),
            ]

            for title, task_type, description in task_data:
                task = Task.objects.create(
                    org=org,
                    type=task_type,
                    title=title,
                    description=description,
                    status='published',
                    difficulty_level='beginner',
                    estimated_time_minutes=30,
                    points=10,
                    created_by=admin_user
                )
                tasks.append(task)

        self.stdout.write(
            self.style.SUCCESS(
                f'Quick test data created successfully!\n'
                f'- Organization: {org.name}\n'
                f'- Admin user: {admin_user.email}\n'
                f'- Test users: {len(test_users)} created\n'
                f'- Cohort: {cohort.name}\n'
                f'- Course: {course.name}\n'
                f'- Tasks: {len(tasks)} created\n\n'
                f'You can now test the API with these sample entities.'
            )
        )
