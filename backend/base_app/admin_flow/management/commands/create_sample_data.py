from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
import json
from admin_flow.models import (
    User, Organization, UserOrganization, Cohort, UserCohort, 
    Course, Milestone, Task, Question, CourseTask, CourseMilestone,
    AdminProfile, AdminAction, ContentTemplate, SystemConfiguration,
    AdminNotification, AdminAnalytics, BulkOperation, AdminDashboardWidget
)


class Command(BaseCommand):
    help = 'Create sample data for admin_flow module'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before creating new data',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write(self.style.WARNING('Clearing existing data...'))
            self.clear_data()

        self.stdout.write(self.style.SUCCESS('Creating sample data...'))
        
        # Create in order of dependencies
        self.create_users()
        self.create_organizations()
        self.create_user_organizations()
        self.create_cohorts()
        self.create_user_cohorts()
        self.create_milestones()
        self.create_courses()
        self.create_course_milestones()
        self.create_tasks()
        self.create_course_tasks()
        self.create_questions()
        self.create_admin_profiles()
        self.create_admin_actions()
        self.create_content_templates()
        self.create_system_configurations()
        self.create_admin_notifications()
        self.create_admin_analytics()
        self.create_bulk_operations()
        self.create_dashboard_widgets()
        
        self.stdout.write(self.style.SUCCESS('Sample data created successfully!'))

    def clear_data(self):
        """Clear all existing data"""
        models_to_clear = [
            AdminDashboardWidget, BulkOperation, AdminAnalytics, AdminNotification,
            SystemConfiguration, ContentTemplate, AdminAction, AdminProfile,
            Question, CourseTask, Task, CourseMilestone, Course, Milestone,
            UserCohort, Cohort, UserOrganization, Organization, User
        ]
        
        for model in models_to_clear:
            model.objects.all().delete()
            self.stdout.write(f'Cleared {model.__name__}')

    def create_users(self):
        """Create sample users"""
        users_data = [
            {'email': 'admin@happyfox.com', 'first_name': 'Super', 'last_name': 'Admin', 'default_dp_color': '#FF5733'},
            {'email': 'john.doe@techcorp.com', 'first_name': 'John', 'last_name': 'Doe', 'default_dp_color': '#33FF57'},
            {'email': 'jane.smith@edutech.com', 'first_name': 'Jane', 'last_name': 'Smith', 'default_dp_color': '#3357FF'},
            {'email': 'mike.wilson@startupinc.com', 'first_name': 'Mike', 'last_name': 'Wilson', 'default_dp_color': '#FF33F5'},
            {'email': 'sarah.jones@academyplus.com', 'first_name': 'Sarah', 'last_name': 'Jones', 'default_dp_color': '#F5FF33'},
            {'email': 'student1@example.com', 'first_name': 'Alice', 'last_name': 'Johnson', 'default_dp_color': '#33FFF5'},
            {'email': 'student2@example.com', 'first_name': 'Bob', 'last_name': 'Brown', 'default_dp_color': '#FF8C33'},
            {'email': 'mentor1@example.com', 'first_name': 'Dr. Carol', 'last_name': 'Davis', 'default_dp_color': '#8C33FF'},
        ]
        
        for user_data in users_data:
            user, created = User.objects.get_or_create(
                email=user_data['email'],
                defaults=user_data
            )
            if created:
                self.stdout.write(f'Created user: {user.email}')

    def create_organizations(self):
        """Create sample organizations"""
        orgs_data = [
            {
                'slug': 'techcorp',
                'name': 'TechCorp Solutions',
                'default_logo_color': '#2E86AB',
                'billing_tier': 'enterprise',
                'max_users': 1000,
                'storage_limit_gb': 100,
                'api_rate_limit': 10000,
                'openai_free_trial': False
            },
            {
                'slug': 'edutech',
                'name': 'EduTech Academy',
                'default_logo_color': '#A23B72',
                'billing_tier': 'professional',
                'max_users': 500,
                'storage_limit_gb': 50,
                'api_rate_limit': 5000,
                'openai_free_trial': True
            },
            {
                'slug': 'startupinc',
                'name': 'StartupInc',
                'default_logo_color': '#F18F01',
                'billing_tier': 'free',
                'max_users': 100,
                'storage_limit_gb': 10,
                'api_rate_limit': 1000,
                'openai_free_trial': True
            }
        ]
        
        for org_data in orgs_data:
            org, created = Organization.objects.get_or_create(
                slug=org_data['slug'],
                defaults=org_data
            )
            if created:
                self.stdout.write(f'Created organization: {org.name}')

    def create_user_organizations(self):
        """Create user-organization relationships"""
        relationships = [
            ('admin@happyfox.com', 'techcorp', 'owner'),
            ('john.doe@techcorp.com', 'techcorp', 'admin'),
            ('jane.smith@edutech.com', 'edutech', 'owner'),
            ('mike.wilson@startupinc.com', 'startupinc', 'owner'),
            ('sarah.jones@academyplus.com', 'edutech', 'admin'),
            ('student1@example.com', 'techcorp', 'member'),
            ('student2@example.com', 'edutech', 'member'),
            ('mentor1@example.com', 'techcorp', 'member'),
        ]
        
        for email, org_slug, role in relationships:
            user = User.objects.get(email=email)
            org = Organization.objects.get(slug=org_slug)
            
            user_org, created = UserOrganization.objects.get_or_create(
                user=user,
                org=org,
                defaults={
                    'role': role,
                    'permissions': {
                        'can_manage_users': role in ['owner', 'admin'],
                        'can_create_content': role in ['owner', 'admin'],
                        'can_view_analytics': role in ['owner', 'admin']
                    }
                }
            )
            if created:
                self.stdout.write(f'Created relationship: {user.email} -> {org.name} ({role})')

    def create_cohorts(self):
        """Create sample cohorts"""
        cohorts_data = [
            {
                'name': 'Python Bootcamp 2025-Q1',
                'org_slug': 'techcorp',
                'description': 'Intensive Python programming bootcamp',
                'start_date': timezone.now().date(),
                'end_date': timezone.now().date() + timedelta(days=90),
                'max_students': 30
            },
            {
                'name': 'Data Science Fundamentals',
                'org_slug': 'edutech',
                'description': 'Introduction to data science and analytics',
                'start_date': timezone.now().date() + timedelta(days=30),
                'end_date': timezone.now().date() + timedelta(days=120),
                'max_students': 25
            },
            {
                'name': 'Web Development Basics',
                'org_slug': 'startupinc',
                'description': 'Learn HTML, CSS, and JavaScript fundamentals',
                'start_date': timezone.now().date() + timedelta(days=15),
                'end_date': timezone.now().date() + timedelta(days=75),
                'max_students': 20
            }
        ]
        
        for cohort_data in cohorts_data:
            org = Organization.objects.get(slug=cohort_data.pop('org_slug'))
            cohort, created = Cohort.objects.get_or_create(
                name=cohort_data['name'],
                org=org,
                defaults=cohort_data
            )
            if created:
                self.stdout.write(f'Created cohort: {cohort.name}')

    def create_user_cohorts(self):
        """Create user-cohort relationships"""
        relationships = [
            ('student1@example.com', 'Python Bootcamp 2025-Q1', 'learner'),
            ('student2@example.com', 'Data Science Fundamentals', 'learner'),
            ('mentor1@example.com', 'Python Bootcamp 2025-Q1', 'mentor'),
            ('john.doe@techcorp.com', 'Python Bootcamp 2025-Q1', 'instructor'),
        ]
        
        for email, cohort_name, role in relationships:
            user = User.objects.get(email=email)
            cohort = Cohort.objects.get(name=cohort_name)
            
            user_cohort, created = UserCohort.objects.get_or_create(
                user=user,
                cohort=cohort,
                defaults={'role': role}
            )
            if created:
                self.stdout.write(f'Created user-cohort: {user.email} -> {cohort.name} ({role})')

    def create_milestones(self):
        """Create sample milestones"""
        milestones_data = [
            {
                'name': 'Python Basics',
                'org_slug': 'techcorp',
                'color': '#FF6B6B',
                'description': 'Learn Python syntax and fundamentals',
                'estimated_hours': 20
            },
            {
                'name': 'Object-Oriented Programming',
                'org_slug': 'techcorp',
                'color': '#4ECDC4',
                'description': 'Master OOP concepts in Python',
                'estimated_hours': 25
            },
            {
                'name': 'Data Analysis with Pandas',
                'org_slug': 'edutech',
                'color': '#45B7D1',
                'description': 'Learn data manipulation with Pandas',
                'estimated_hours': 30
            },
            {
                'name': 'HTML & CSS Fundamentals',
                'org_slug': 'startupinc',
                'color': '#96CEB4',
                'description': 'Build web pages with HTML and CSS',
                'estimated_hours': 15
            }
        ]
        
        for milestone_data in milestones_data:
            org = Organization.objects.get(slug=milestone_data.pop('org_slug'))
            milestone, created = Milestone.objects.get_or_create(
                name=milestone_data['name'],
                org=org,
                defaults=milestone_data
            )
            if created:
                self.stdout.write(f'Created milestone: {milestone.name}')

    def create_courses(self):
        """Create sample courses"""
        courses_data = [
            {
                'name': 'Complete Python Developer',
                'org_slug': 'techcorp',
                'description': 'Comprehensive Python programming course from beginner to advanced',
                'status': 'published',
                'difficulty_level': 'intermediate',
                'estimated_duration_weeks': 12,
                'prerequisites': [],
                'learning_objectives': [
                    'Master Python syntax and data structures',
                    'Build real-world applications',
                    'Understand OOP principles'
                ],
                'tags': ['python', 'programming', 'backend']
            },
            {
                'name': 'Data Science Masterclass',
                'org_slug': 'edutech',
                'description': 'Learn data science from scratch with Python and R',
                'status': 'published',
                'difficulty_level': 'advanced',
                'estimated_duration_weeks': 16,
                'prerequisites': ['python-basics'],
                'learning_objectives': [
                    'Analyze complex datasets',
                    'Build machine learning models',
                    'Create data visualizations'
                ],
                'tags': ['data-science', 'machine-learning', 'python']
            }
        ]
        
        for course_data in courses_data:
            org = Organization.objects.get(slug=course_data.pop('org_slug'))
            admin_user = User.objects.filter(
                userorganization__org=org,
                userorganization__role__in=['owner', 'admin']
            ).first()
            
            course, created = Course.objects.get_or_create(
                name=course_data['name'],
                org=org,
                defaults={
                    **course_data,
                    'created_by': admin_user
                }
            )
            if created:
                self.stdout.write(f'Created course: {course.name}')

    def create_course_milestones(self):
        """Create course-milestone relationships"""
        relationships = [
            ('Complete Python Developer', 'Python Basics', 1),
            ('Complete Python Developer', 'Object-Oriented Programming', 2),
            ('Data Science Masterclass', 'Data Analysis with Pandas', 1),
        ]
        
        for course_name, milestone_name, ordering in relationships:
            course = Course.objects.get(name=course_name)
            milestone = Milestone.objects.get(name=milestone_name)
            
            course_milestone, created = CourseMilestone.objects.get_or_create(
                course=course,
                milestone=milestone,
                defaults={'ordering': ordering}
            )
            if created:
                self.stdout.write(f'Created course-milestone: {course.name} -> {milestone.name}')

    def create_tasks(self):
        """Create sample tasks"""
        tasks_data = [
            {
                'type': 'learning_material',
                'title': 'Introduction to Python Variables',
                'org_slug': 'techcorp',
                'description': 'Learn about Python variables and data types',
                'blocks': json.dumps({
                    'content': [
                        {'type': 'text', 'content': 'Variables are containers for storing data values.'},
                        {'type': 'code', 'language': 'python', 'content': 'x = 5\nname = "John"'},
                        {'type': 'video', 'url': 'https://example.com/python-variables.mp4'}
                    ]
                }),
                'status': 'published',
                'difficulty_level': 'beginner',
                'estimated_time_minutes': 45,
                'points': 10
            },
            {
                'type': 'quiz',
                'title': 'Python Variables Quiz',
                'org_slug': 'techcorp',
                'description': 'Test your knowledge of Python variables',
                'status': 'published',
                'difficulty_level': 'beginner',
                'estimated_time_minutes': 15,
                'points': 20
            },
            {
                'type': 'assignment',
                'title': 'Build a Calculator',
                'org_slug': 'techcorp',
                'description': 'Create a simple calculator using Python',
                'status': 'published',
                'difficulty_level': 'intermediate',
                'estimated_time_minutes': 120,
                'points': 50
            }
        ]
        
        for task_data in tasks_data:
            org = Organization.objects.get(slug=task_data.pop('org_slug'))
            admin_user = User.objects.filter(
                userorganization__org=org,
                userorganization__role__in=['owner', 'admin']
            ).first()
            
            task, created = Task.objects.get_or_create(
                title=task_data['title'],
                org=org,
                defaults={
                    **task_data,
                    'created_by': admin_user
                }
            )
            if created:
                self.stdout.write(f'Created task: {task.title}')

    def create_course_tasks(self):
        """Create course-task relationships"""
        relationships = [
            ('Complete Python Developer', 'Introduction to Python Variables', 'Python Basics', 1),
            ('Complete Python Developer', 'Python Variables Quiz', 'Python Basics', 2),
            ('Complete Python Developer', 'Build a Calculator', 'Object-Oriented Programming', 1),
        ]
        
        for course_name, task_title, milestone_name, ordering in relationships:
            course = Course.objects.get(name=course_name)
            task = Task.objects.get(title=task_title)
            milestone = Milestone.objects.get(name=milestone_name)
            
            course_task, created = CourseTask.objects.get_or_create(
                course=course,
                task=task,
                defaults={
                    'milestone': milestone,
                    'ordering': ordering,
                    'is_required': True
                }
            )
            if created:
                self.stdout.write(f'Created course-task: {course.name} -> {task.title}')

    def create_questions(self):
        """Create sample questions for quizzes"""
        quiz_task = Task.objects.filter(type='quiz').first()
        if not quiz_task:
            return
            
        questions_data = [
            {
                'type': 'multiple_choice',
                'title': 'Python Variable Declaration',
                'content': 'Which of the following is the correct way to declare a variable in Python?',
                'options': [
                    'var x = 5',
                    'int x = 5',
                    'x = 5',
                    'declare x = 5'
                ],
                'answer': 'x = 5',
                'explanation': 'Python uses dynamic typing, so you simply assign a value to a variable name.',
                'points': 5,
                'position': 1
            },
            {
                'type': 'true_false',
                'title': 'Python Case Sensitivity',
                'content': 'Python is case-sensitive, meaning "Variable" and "variable" are different.',
                'answer': 'True',
                'explanation': 'Python is indeed case-sensitive.',
                'points': 3,
                'position': 2
            }
        ]
        
        for question_data in questions_data:
            question, created = Question.objects.get_or_create(
                task=quiz_task,
                title=question_data['title'],
                defaults=question_data
            )
            if created:
                self.stdout.write(f'Created question: {question.title}')

    def create_admin_profiles(self):
        """Create admin profiles"""
        admin_data = [
            {
                'email': 'admin@happyfox.com',
                'role': 'super_admin',
                'permissions': ['all'],
                'phone': '+1-555-0101',
                'department': 'Technology'
            },
            {
                'email': 'john.doe@techcorp.com',
                'role': 'org_admin',
                'permissions': ['manage_users', 'manage_content', 'view_analytics'],
                'phone': '+1-555-0102',
                'department': 'Education'
            },
            {
                'email': 'jane.smith@edutech.com',
                'role': 'content_admin',
                'permissions': ['manage_content', 'create_courses'],
                'phone': '+1-555-0103',
                'department': 'Content Development'
            }
        ]
        
        for admin_info in admin_data:
            user = User.objects.get(email=admin_info['email'])
            orgs = Organization.objects.filter(
                userorganization__user=user,
                userorganization__role__in=['owner', 'admin']
            )
            
            admin_profile, created = AdminProfile.objects.get_or_create(
                user=user,
                defaults={
                    'role': admin_info['role'],
                    'permissions': admin_info['permissions'],
                    'phone': admin_info['phone'],
                    'department': admin_info['department'],
                    'hire_date': timezone.now().date() - timedelta(days=365)
                }
            )
            
            if created:
                admin_profile.organizations.set(orgs)
                self.stdout.write(f'Created admin profile: {user.email}')

    def create_admin_actions(self):
        """Create sample admin actions"""
        admin_users = User.objects.filter(admin_profile__isnull=False)
        
        actions_data = [
            {
                'action_type': 'create',
                'object_type': 'Course',
                'description': 'Created new course: Complete Python Developer',
                'details': {'course_id': 1, 'status': 'published'}
            },
            {
                'action_type': 'update',
                'object_type': 'User',
                'description': 'Updated user permissions',
                'details': {'user_id': 2, 'permissions_changed': ['manage_content']}
            },
            {
                'action_type': 'login',
                'object_type': 'System',
                'description': 'Admin login successful',
                'details': {'login_method': 'email'}
            }
        ]
        
        for i, action_data in enumerate(actions_data):
            admin_user = admin_users[i % len(admin_users)]
            org = admin_user.admin_profile.organizations.first()
            
            admin_action = AdminAction.objects.create(
                admin=admin_user,
                organization=org,
                object_name=f"Object {i+1}",
                ip_address='192.168.1.100',
                **action_data
            )
            self.stdout.write(f'Created admin action: {admin_action.description}')

    def create_content_templates(self):
        """Create sample content templates"""
        templates_data = [
            {
                'name': 'Basic Course Template',
                'type': 'course',
                'description': 'Standard template for creating new courses',
                'template_data': {
                    'structure': {
                        'introduction': {'type': 'learning_material', 'duration': 30},
                        'main_content': {'type': 'learning_material', 'duration': 60},
                        'quiz': {'type': 'quiz', 'questions': 5},
                        'assignment': {'type': 'assignment', 'duration': 120}
                    }
                },
                'is_global': True
            },
            {
                'name': 'Programming Quiz Template',
                'type': 'quiz',
                'description': 'Template for programming quizzes',
                'template_data': {
                    'question_types': ['multiple_choice', 'coding'],
                    'default_points': 10,
                    'time_limit': 30
                },
                'is_global': False
            }
        ]
        
        for template_data in templates_data:
            admin_user = User.objects.filter(admin_profile__role='super_admin').first()
            org = None if template_data['is_global'] else Organization.objects.first()
            
            template = ContentTemplate.objects.create(
                organization=org,
                created_by=admin_user,
                **template_data
            )
            self.stdout.write(f'Created content template: {template.name}')

    def create_system_configurations(self):
        """Create system configurations"""
        configs_data = [
            {
                'key': 'max_file_upload_size',
                'value': '100',
                'value_type': 'integer',
                'description': 'Maximum file upload size in MB'
            },
            {
                'key': 'enable_ai_content_generation',
                'value': 'true',
                'value_type': 'boolean',
                'description': 'Enable AI-powered content generation'
            },
            {
                'key': 'default_course_settings',
                'value': '{"difficulty": "beginner", "duration_weeks": 8}',
                'value_type': 'json',
                'description': 'Default settings for new courses'
            }
        ]
        
        for config_data in configs_data:
            admin_user = User.objects.filter(admin_profile__role='super_admin').first()
            
            config = SystemConfiguration.objects.create(
                created_by=admin_user,
                **config_data
            )
            self.stdout.write(f'Created system config: {config.key}')

    def create_admin_notifications(self):
        """Create sample admin notifications"""
        admin_users = User.objects.filter(admin_profile__isnull=False)
        
        notifications_data = [
            {
                'notification_type': 'user_signup',
                'priority': 'medium',
                'title': 'New User Registration',
                'message': 'A new user has registered for TechCorp Solutions',
                'action_url': '/admin/users/new'
            },
            {
                'notification_type': 'system_alert',
                'priority': 'high',
                'title': 'High Storage Usage',
                'message': 'Storage usage has exceeded 80% of the limit',
                'action_url': '/admin/storage'
            },
            {
                'notification_type': 'content_published',
                'priority': 'low',
                'title': 'Course Published',
                'message': 'Complete Python Developer course has been published',
                'action_url': '/admin/courses/1'
            }
        ]
        
        for i, notif_data in enumerate(notifications_data):
            admin_user = admin_users[i % len(admin_users)]
            org = admin_user.admin_profile.organizations.first()
            
            notification = AdminNotification.objects.create(
                recipient=admin_user,
                organization=org,
                expires_at=timezone.now() + timedelta(days=30),
                **notif_data
            )
            self.stdout.write(f'Created notification: {notification.title}')

    def create_admin_analytics(self):
        """Create sample analytics data"""
        orgs = Organization.objects.all()
        
        for org in orgs:
            for days_ago in range(7):
                date = timezone.now().date() - timedelta(days=days_ago)
                
                analytics, created = AdminAnalytics.objects.get_or_create(
                    organization=org,
                    date=date,
                    defaults={
                        'total_users': org.current_user_count + days_ago,
                        'new_users': 2 if days_ago < 3 else 0,
                        'active_users': max(1, org.current_user_count - days_ago),
                        'total_courses': Course.objects.filter(org=org).count(),
                        'new_courses': 1 if days_ago == 0 else 0,
                        'total_tasks': Task.objects.filter(org=org).count(),
                        'total_sessions': 50 + (days_ago * 10),
                        'avg_session_duration': 25.5 + days_ago,
                        'completion_rate': 85.0 - days_ago,
                        'api_calls': 1000 + (days_ago * 100),
                        'storage_used_gb': 5.5 + (days_ago * 0.1),
                        'content_generations': 5 if days_ago < 2 else 0,
                        'ai_api_calls': 20 + days_ago,
                        'ai_cost_usd': 2.50 + (days_ago * 0.25)
                    }
                )
                
            self.stdout.write(f'Created analytics for {org.name}')

    def create_bulk_operations(self):
        """Create sample bulk operations"""
        admin_users = User.objects.filter(admin_profile__isnull=False)
        
        operations_data = [
            {
                'operation_type': 'user_import',
                'status': 'completed',
                'total_items': 100,
                'processed_items': 100,
                'success_count': 95,
                'error_count': 5,
                'parameters': {'file_type': 'csv', 'auto_enroll': True}
            },
            {
                'operation_type': 'bulk_enroll',
                'status': 'in_progress',
                'total_items': 50,
                'processed_items': 30,
                'success_count': 28,
                'error_count': 2,
                'parameters': {'course_id': 1, 'cohort_id': 1}
            }
        ]
        
        for i, op_data in enumerate(operations_data):
            admin_user = admin_users[i % len(admin_users)]
            org = admin_user.admin_profile.organizations.first()
            
            bulk_op = BulkOperation.objects.create(
                organization=org,
                started_by=admin_user,
                **op_data
            )
            
            if bulk_op.status == 'completed':
                bulk_op.completed_at = timezone.now()
                bulk_op.save()
                
            self.stdout.write(f'Created bulk operation: {bulk_op.operation_type}')

    def create_dashboard_widgets(self):
        """Create sample dashboard widgets"""
        admin_users = User.objects.filter(admin_profile__isnull=False)
        
        widgets_data = [
            {
                'widget_type': 'metric',
                'title': 'Total Users',
                'position_x': 0,
                'position_y': 0,
                'width': 2,
                'height': 1,
                'configuration': {'metric': 'total_users', 'color': '#4CAF50'},
                'data_source': 'user_analytics'
            },
            {
                'widget_type': 'chart',
                'title': 'Course Completion Rate',
                'position_x': 2,
                'position_y': 0,
                'width': 4,
                'height': 2,
                'configuration': {'chart_type': 'line', 'time_range': '7d'},
                'data_source': 'completion_analytics'
            },
            {
                'widget_type': 'table',
                'title': 'Recent User Activity',
                'position_x': 0,
                'position_y': 1,
                'width': 6,
                'height': 3,
                'configuration': {'columns': ['user', 'action', 'timestamp'], 'limit': 10},
                'data_source': 'user_activity'
            }
        ]
        
        for i, widget_data in enumerate(widgets_data):
            admin_user = admin_users[i % len(admin_users)]
            org = admin_user.admin_profile.organizations.first()
            
            widget = AdminDashboardWidget.objects.create(
                admin=admin_user,
                organization=org,
                **widget_data
            )
            self.stdout.write(f'Created dashboard widget: {widget.title}')
