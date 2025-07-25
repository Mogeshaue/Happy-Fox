"""
Django management command to generate sample data for the Happy Fox LMS
"""
import random
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from admin_flow.models import (
    User, Organization, UserOrganization, Cohort, UserCohort, Milestone,
    Course, CourseCohort, CourseMilestone, Task, CourseTask, Question,
    TaskCompletion, AdminProfile, AdminAction, ContentTemplate,
    SystemConfiguration, ContentGenerationJob, AdminNotification,
    AdminAnalytics, BulkOperation, AdminDashboardWidget
)


class Command(BaseCommand):
    help = 'Generate sample data for the Happy Fox LMS'

    def add_arguments(self, parser):
        parser.add_argument(
            '--users',
            type=int,
            default=50,
            help='Number of users to create (default: 50)'
        )
        parser.add_argument(
            '--organizations',
            type=int,
            default=3,
            help='Number of organizations to create (default: 3)'
        )
        parser.add_argument(
            '--courses',
            type=int,
            default=10,
            help='Number of courses to create (default: 10)'
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before generating new data'
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing data...'))
            self.clear_data()

        self.stdout.write(self.style.SUCCESS('Starting sample data generation...'))
        
        with transaction.atomic():
            # Create organizations first
            organizations = self.create_organizations(options['organizations'])
            self.stdout.write(f'Created {len(organizations)} organizations')

            # Create users and assign to organizations
            users = self.create_users(options['users'], organizations)
            self.stdout.write(f'Created {len(users)} users')

            # Create admin profiles
            admin_users = self.create_admin_profiles(users[:10], organizations)
            self.stdout.write(f'Created {len(admin_users)} admin profiles')

            # Create cohorts
            cohorts = self.create_cohorts(organizations)
            self.stdout.write(f'Created {len(cohorts)} cohorts')

            # Create milestones
            milestones = self.create_milestones(organizations)
            self.stdout.write(f'Created {len(milestones)} milestones')

            # Create courses
            courses = self.create_courses(options['courses'], organizations, users[:5])
            self.stdout.write(f'Created {len(courses)} courses')

            # Create tasks
            tasks = self.create_tasks(organizations, users[:5])
            self.stdout.write(f'Created {len(tasks)} tasks')

            # Create course-task relationships
            course_tasks = self.create_course_tasks(courses, tasks, milestones)
            self.stdout.write(f'Created {len(course_tasks)} course-task relationships')

            # Create questions for quiz tasks
            questions = self.create_questions(tasks)
            self.stdout.write(f'Created {len(questions)} questions')

            # Enroll users in cohorts
            user_cohorts = self.create_user_cohorts(users, cohorts)
            self.stdout.write(f'Created {len(user_cohorts)} user-cohort relationships')

            # Assign courses to cohorts
            course_cohorts = self.create_course_cohorts(courses, cohorts)
            self.stdout.write(f'Created {len(course_cohorts)} course-cohort relationships')

            # Create task completions
            completions = self.create_task_completions(users, tasks)
            self.stdout.write(f'Created {len(completions)} task completions')

            # Create admin actions
            admin_actions = self.create_admin_actions(admin_users, organizations)
            self.stdout.write(f'Created {len(admin_actions)} admin actions')

            # Create notifications
            notifications = self.create_notifications(admin_users, organizations)
            self.stdout.write(f'Created {len(notifications)} notifications')

            # Create analytics data
            analytics = self.create_analytics_data(organizations)
            self.stdout.write(f'Created {len(analytics)} analytics records')

            # Create system configurations
            configs = self.create_system_configurations(organizations)
            self.stdout.write(f'Created {len(configs)} system configurations')

        self.stdout.write(
            self.style.SUCCESS('Successfully generated all sample data!')
        )

    def clear_data(self):
        """Clear existing data"""
        models_to_clear = [
            TaskCompletion, Question, CourseTask, Task, CourseMilestone,
            CourseCohort, Course, UserCohort, Cohort, Milestone,
            UserOrganization, AdminAction, AdminNotification, AdminAnalytics,
            BulkOperation, ContentGenerationJob, SystemConfiguration,
            AdminProfile, User, Organization
        ]
        
        for model in models_to_clear:
            count = model.objects.count()
            model.objects.all().delete()
            self.stdout.write(f'Cleared {count} {model.__name__} records')

    def create_organizations(self, count):
        """Create sample organizations"""
        organizations = []
        org_names = [
            'TechEdu Institute', 'Future Skills Academy', 'Innovation University',
            'Digital Learning Hub', 'CodeCraft School', 'DataMind College'
        ]
        
        for i in range(min(count, len(org_names))):
            org = Organization.objects.create(
                slug=f'org-{i+1}',
                name=org_names[i],
                default_logo_color=random.choice(['#FF5722', '#2196F3', '#4CAF50', '#FFC107']),
                billing_tier=random.choice(['free', 'basic', 'premium', 'enterprise']),
                max_users=random.choice([50, 100, 500, 1000]),
                storage_limit_gb=random.choice([10, 50, 100, 500]),
                api_rate_limit=random.choice([1000, 5000, 10000, 50000]),
                openai_free_trial=random.choice([True, False])
            )
            organizations.append(org)
        
        return organizations

    def create_users(self, count, organizations):
        """Create sample users"""
        users = []
        first_names = ['John', 'Jane', 'Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry']
        last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']
        
        for i in range(count):
            first_name = random.choice(first_names)
            last_name = random.choice(last_names)
            
            user = User.objects.create(
                email=f'{first_name.lower()}.{last_name.lower()}{i}@example.com',
                first_name=first_name,
                last_name=last_name,
                default_dp_color=random.choice(['#FF5722', '#2196F3', '#4CAF50', '#FFC107', '#9C27B0'])
            )
            users.append(user)
            
            # Assign user to random organization(s)
            org = random.choice(organizations)
            role = random.choice(['member', 'admin', 'owner']) if i < 10 else 'member'
            
            UserOrganization.objects.create(
                user=user,
                org=org,
                role=role,
                last_accessed=timezone.now() - timedelta(days=random.randint(0, 30))
            )
        
        return users

    def create_admin_profiles(self, users, organizations):
        """Create admin profiles for some users"""
        admin_users = []
        roles = [AdminProfile.Role.SUPER_ADMIN, AdminProfile.Role.ORG_ADMIN, 
                AdminProfile.Role.CONTENT_ADMIN, AdminProfile.Role.SUPPORT_ADMIN]
        
        for i, user in enumerate(users):
            if i == 0:  # First user is super admin
                role = AdminProfile.Role.SUPER_ADMIN
            else:
                role = random.choice(roles[1:])  # Others get different roles
            
            admin_profile = AdminProfile.objects.create(
                user=user,
                role=role,
                permissions=['can_manage_users', 'can_view_analytics'],
                is_active=True
            )
            
            # Assign organizations to manage
            if role != AdminProfile.Role.SUPER_ADMIN:
                admin_profile.organizations.add(random.choice(organizations))
            
            admin_users.append(user)
        
        return admin_users

    def create_cohorts(self, organizations):
        """Create sample cohorts"""
        cohorts = []
        cohort_names = [
            'Fall 2024 Bootcamp', 'Spring 2025 Advanced', 'Summer Intensive',
            'Weekend Warriors', 'Evening Class', 'Fast Track Program'
        ]
        
        for org in organizations:
            for i in range(2):  # 2 cohorts per org
                start_date = timezone.now().date() + timedelta(days=random.randint(-30, 30))
                cohort = Cohort.objects.create(
                    name=f'{cohort_names[i]} - {org.name}',
                    org=org,
                    description=f'A comprehensive learning cohort for {org.name}',
                    start_date=start_date,
                    end_date=start_date + timedelta(weeks=random.randint(8, 16)),
                    max_students=random.randint(20, 50)
                )
                cohorts.append(cohort)
        
        return cohorts

    def create_milestones(self, organizations):
        """Create sample milestones"""
        milestones = []
        milestone_names = [
            'Fundamentals', 'Intermediate Concepts', 'Advanced Topics',
            'Project Work', 'Capstone', 'Final Assessment'
        ]
        
        for org in organizations:
            for name in milestone_names:
                milestone = Milestone.objects.create(
                    name=f'{name} - {org.name}',
                    org=org,
                    color=random.choice(['#FF5722', '#2196F3', '#4CAF50', '#FFC107']),
                    description=f'{name} milestone for {org.name}',
                    estimated_hours=random.randint(10, 40)
                )
                milestones.append(milestone)
        
        return milestones

    def create_courses(self, count, organizations, instructors):
        """Create sample courses"""
        courses = []
        course_templates = [
            {
                'name': 'Introduction to Python Programming',
                'description': 'Learn the fundamentals of Python programming',
                'difficulty': 'beginner',
                'weeks': 8,
                'objectives': ['Variables and data types', 'Control structures', 'Functions', 'Object-oriented programming']
            },
            {
                'name': 'Web Development with React',
                'description': 'Build modern web applications with React',
                'difficulty': 'intermediate',
                'weeks': 12,
                'objectives': ['React components', 'State management', 'API integration', 'Deployment']
            },
            {
                'name': 'Data Science Fundamentals',
                'description': 'Introduction to data science and analytics',
                'difficulty': 'beginner',
                'weeks': 10,
                'objectives': ['Data analysis', 'Visualization', 'Statistical methods', 'Machine learning basics']
            },
            {
                'name': 'Advanced Machine Learning',
                'description': 'Deep dive into machine learning algorithms',
                'difficulty': 'advanced',
                'weeks': 16,
                'objectives': ['Neural networks', 'Deep learning', 'Model optimization', 'Production deployment']
            },
            {
                'name': 'Database Design and SQL',
                'description': 'Master database design and SQL querying',
                'difficulty': 'intermediate',
                'weeks': 6,
                'objectives': ['Database design', 'SQL queries', 'Optimization', 'Administration']
            }
        ]
        
        for i in range(count):
            template = course_templates[i % len(course_templates)]
            org = random.choice(organizations)
            instructor = random.choice(instructors)
            
            course = Course.objects.create(
                org=org,
                name=f"{template['name']} ({org.name})",
                description=template['description'],
                status=random.choice(['draft', 'published']),
                difficulty_level=template['difficulty'],
                estimated_duration_weeks=template['weeks'],
                learning_objectives=template['objectives'],
                tags=['programming', 'technology', 'education'],
                created_by=instructor
            )
            courses.append(course)
        
        return courses

    def create_tasks(self, organizations, instructors):
        """Create sample tasks"""
        tasks = []
        task_templates = [
            {
                'title': 'Introduction to Variables',
                'type': 'learning_material',
                'description': 'Learn about variables and data types',
                'time': 30
            },
            {
                'title': 'Quiz: Basic Concepts',
                'type': 'quiz',
                'description': 'Test your understanding of basic concepts',
                'time': 15
            },
            {
                'title': 'Coding Assignment: Functions',
                'type': 'assignment',
                'description': 'Write functions to solve problems',
                'time': 120
            },
            {
                'title': 'Final Project Setup',
                'type': 'project',
                'description': 'Set up your final project environment',
                'time': 60
            }
        ]
        
        for org in organizations:
            for i in range(20):  # 20 tasks per organization
                template = task_templates[i % len(task_templates)]
                instructor = random.choice(instructors)
                
                task = Task.objects.create(
                    org=org,
                    type=template['type'],
                    title=f"{template['title']} - {org.name} #{i+1}",
                    description=template['description'],
                    status=random.choice(['draft', 'published']),
                    difficulty_level=random.choice(['beginner', 'intermediate', 'advanced']),
                    estimated_time_minutes=template['time'],
                    points=random.randint(5, 25),
                    created_by=instructor
                )
                tasks.append(task)
        
        return tasks

    def create_course_tasks(self, courses, tasks, milestones):
        """Create course-task relationships"""
        course_tasks = []
        
        for course in courses:
            # Get tasks from the same organization
            org_tasks = [task for task in tasks if task.org == course.org]
            org_milestones = [m for m in milestones if m.org == course.org]
            
            # Assign 5-10 tasks per course
            selected_tasks = random.sample(org_tasks, min(random.randint(5, 10), len(org_tasks)))
            
            for i, task in enumerate(selected_tasks):
                milestone = random.choice(org_milestones) if org_milestones else None
                
                course_task = CourseTask.objects.create(
                    task=task,
                    course=course,
                    milestone=milestone,
                    ordering=i + 1,
                    is_required=random.choice([True, True, False]),  # 2/3 chance of required
                    due_date=timezone.now() + timedelta(days=random.randint(7, 30))
                )
                course_tasks.append(course_task)
        
        return course_tasks

    def create_questions(self, tasks):
        """Create questions for quiz tasks"""
        questions = []
        question_templates = [
            {
                'title': 'Python Function Syntax',
                'content': 'What is the correct syntax for a Python function?',
                'type': 'multiple_choice',
                'options': ['def function_name():', 'function function_name():', 'func function_name():'],
                'answer': 'def function_name():'
            },
            {
                'title': 'Data Types',
                'content': 'Which data type is used for decimal numbers?',
                'type': 'multiple_choice',
                'options': ['int', 'float', 'string'],
                'answer': 'float'
            },
            {
                'title': 'List vs Tuple',
                'content': 'Explain the difference between a list and a tuple.',
                'type': 'short_answer',
                'answer': 'Lists are mutable while tuples are immutable'
            }
        ]
        
        quiz_tasks = [task for task in tasks if task.type == 'quiz']
        
        for task in quiz_tasks:
            # Add 3-5 questions per quiz
            for i in range(random.randint(3, 5)):
                template = random.choice(question_templates)
                
                question = Question.objects.create(
                    task=task,
                    type=template['type'],
                    title=template['title'],
                    content=f"{template['content']} (Task: {task.title})",
                    options=template.get('options', []),
                    answer=template['answer'],
                    points=random.randint(1, 5),
                    position=i + 1
                )
                questions.append(question)
        
        return questions

    def create_user_cohorts(self, users, cohorts):
        """Create user-cohort relationships"""
        user_cohorts = []
        
        for user in users:
            # Each user joins 1-2 cohorts
            user_cohorts_count = random.randint(1, 2)
            selected_cohorts = random.sample(cohorts, min(user_cohorts_count, len(cohorts)))
            
            for cohort in selected_cohorts:
                role = random.choice(['learner', 'learner', 'learner', 'mentor'])  # 3/4 chance learner
                
                user_cohort = UserCohort.objects.create(
                    user=user,
                    cohort=cohort,
                    role=role,
                    status=random.choice(['active', 'active', 'completed'])  # 2/3 chance active
                )
                user_cohorts.append(user_cohort)
        
        return user_cohorts

    def create_course_cohorts(self, courses, cohorts):
        """Create course-cohort relationships"""
        course_cohorts = []
        
        for course in courses:
            # Get cohorts from the same organization
            org_cohorts = [cohort for cohort in cohorts if cohort.org == course.org]
            
            # Assign course to 1-2 cohorts
            selected_cohorts = random.sample(org_cohorts, min(random.randint(1, 2), len(org_cohorts)))
            
            for cohort in selected_cohorts:
                course_cohort = CourseCohort.objects.create(
                    course=course,
                    cohort=cohort,
                    is_drip_enabled=random.choice([True, False]),
                    frequency_value=random.randint(1, 7) if random.choice([True, False]) else None,
                    frequency_unit='days' if random.choice([True, False]) else None,
                    publish_at=timezone.now() + timedelta(days=random.randint(0, 14))
                )
                course_cohorts.append(course_cohort)
        
        return course_cohorts

    def create_task_completions(self, users, tasks):
        """Create task completion records"""
        completions = []
        
        # Get all course tasks
        course_tasks = CourseTask.objects.all()
        
        for user in users:
            # Get user's cohorts
            user_cohorts = UserCohort.objects.filter(user=user, role='learner')
            
            for user_cohort in user_cohorts:
                # Get courses for this cohort
                course_cohorts = CourseCohort.objects.filter(cohort=user_cohort.cohort)
                
                for course_cohort in course_cohorts:
                    # Get tasks for this course
                    tasks_for_course = CourseTask.objects.filter(course=course_cohort.course)
                    
                    # Complete 60-90% of tasks
                    completion_rate = random.uniform(0.6, 0.9)
                    tasks_to_complete = random.sample(
                        list(tasks_for_course), 
                        int(len(tasks_for_course) * completion_rate)
                    )
                    
                    for course_task in tasks_to_complete:
                        score = random.uniform(70, 100)  # Most students do well
                        max_score = course_task.task.points
                        
                        completion = TaskCompletion.objects.create(
                            user=user,
                            task=course_task.task,
                            score=score,
                            max_score=max_score,
                            is_passed=score >= (max_score * 0.7),  # 70% pass rate
                            completed_at=timezone.now() - timedelta(days=random.randint(0, 60)),
                            time_spent_minutes=random.randint(
                                course_task.task.estimated_time_minutes // 2,
                                course_task.task.estimated_time_minutes * 2
                            )
                        )
                        completions.append(completion)
        
        return completions

    def create_admin_actions(self, admin_users, organizations):
        """Create admin action logs"""
        actions = []
        action_types = ['CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT']
        object_types = ['User', 'Course', 'Task', 'Organization', 'Cohort']
        
        for i in range(100):  # Create 100 admin actions
            admin = random.choice(admin_users)
            org = random.choice(organizations)
            
            action = AdminAction.objects.create(
                admin=admin,
                action_type=random.choice(action_types),
                object_type=random.choice(object_types),
                object_id=random.randint(1, 100),
                object_name=f'Sample {random.choice(object_types)} {random.randint(1, 100)}',
                organization=org,
                description=f'Admin action performed by {admin.email}',
                ip_address=f'192.168.1.{random.randint(1, 255)}',
                created_at=timezone.now() - timedelta(days=random.randint(0, 30))
            )
            actions.append(action)
        
        return actions

    def create_notifications(self, admin_users, organizations):
        """Create admin notifications"""
        notifications = []
        notification_types = ['INFO', 'WARNING', 'ERROR', 'SUCCESS']
        
        for admin in admin_users:
            for i in range(random.randint(3, 8)):  # 3-8 notifications per admin
                org = random.choice(organizations)
                
                notification = AdminNotification.objects.create(
                    recipient=admin,
                    organization=org,
                    notification_type=random.choice(notification_types),
                    title=f'System Notification #{i+1}',
                    message=f'This is a sample notification for {admin.email}',
                    is_read=random.choice([True, False]),
                    priority=random.choice(['low', 'medium', 'high']),
                    created_at=timezone.now() - timedelta(days=random.randint(0, 7))
                )
                notifications.append(notification)
        
        return notifications

    def create_analytics_data(self, organizations):
        """Create analytics data"""
        analytics = []
        
        for org in organizations:
            # Create analytics for the last 30 days
            for i in range(30):
                date = timezone.now().date() - timedelta(days=i)
                
                analytic = AdminAnalytics.objects.create(
                    organization=org,
                    date=date,
                    total_users=random.randint(50, 200),
                    total_courses=random.randint(5, 20),
                    total_tasks=random.randint(50, 200),
                    total_sessions=random.randint(100, 500),
                    completion_rate=random.uniform(70, 95),
                    api_calls=random.randint(1000, 10000),
                    storage_used_gb=random.uniform(1, 50),
                    error_count=random.randint(0, 10),
                    ai_cost_usd=random.uniform(0, 100)
                )
                analytics.append(analytic)
        
        return analytics

    def create_system_configurations(self, organizations):
        """Create system configurations"""
        configs = []
        
        # Global configurations
        global_configs = [
            ('email_notifications', True),
            ('maintenance_mode', False),
            ('max_file_upload_size', 10),
            ('session_timeout_minutes', 120)
        ]
        
        for key, value in global_configs:
            config = SystemConfiguration.objects.create(
                key=key,
                value=str(value),
                description=f'Global setting for {key}',
                is_active=True
            )
            configs.append(config)
        
        # Organization-specific configurations
        for org in organizations:
            org_configs = [
                ('course_auto_publish', random.choice([True, False])),
                ('student_self_registration', random.choice([True, False])),
                ('mentor_assignment_auto', random.choice([True, False]))
            ]
            
            for key, value in org_configs:
                config = SystemConfiguration.objects.create(
                    organization=org,
                    key=key,
                    value=str(value),
                    description=f'Organization setting for {key}',
                    is_active=True
                )
                configs.append(config)
        
        return configs
