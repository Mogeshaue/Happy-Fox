#!/usr/bin/env python3
"""
Comprehensive Sample Data Creation Script for Student Flow System

This script creates realistic sample data for the entire student flow system,
demonstrating all models and their relationships in action.

Run this script to populate your database with comprehensive test data.
"""

import os
import sys
import django
from datetime import datetime, timedelta, date
from decimal import Decimal
import random
import uuid

# Set up Django
sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'base_app.settings')
django.setup()

from django.contrib.auth.models import User
from django.utils import timezone
from students.models import *

# =================== SAMPLE DATA GENERATORS ===================

def create_organizations():
    """Create sample organizations"""
    print("📊 Creating Organizations...")
    
    organizations = [
        {
            'name': 'Tech University',
            'slug': 'tech-university',
            'billing_tier': 'enterprise',
            'max_users': 5000,
            'storage_limit_gb': 500.0,
            'api_rate_limit': 10000,
            'openai_api_key': 'sk-tech-university-demo-key',
            'default_logo_color': '#1f2937'
        },
        {
            'name': 'Code Academy Pro',
            'slug': 'code-academy-pro',
            'billing_tier': 'premium',
            'max_users': 1000,
            'storage_limit_gb': 100.0,
            'api_rate_limit': 5000,
            'openai_api_key': 'sk-code-academy-demo-key',
            'default_logo_color': '#3b82f6'
        },
        {
            'name': 'Startup Bootcamp',
            'slug': 'startup-bootcamp',
            'billing_tier': 'free',
            'max_users': 100,
            'storage_limit_gb': 10.0,
            'api_rate_limit': 1000,
            'openai_free_trial': True,
            'default_logo_color': '#10b981'
        }
    ]
    
    created_orgs = []
    for org_data in organizations:
        org, created = Organization.objects.get_or_create(
            slug=org_data['slug'],
            defaults=org_data
        )
        created_orgs.append(org)
        status = "✅ Created" if created else "📋 Exists"
        print(f"   {status}: {org.name} ({org.billing_tier})")
    
    return created_orgs


def create_users_and_relationships(organizations):
    """Create users and their organization relationships"""
    print("\n👥 Creating Users and Organization Relationships...")
    
    # Admin users
    admin_users = [
        {
            'username': 'admin_tech',
            'email': 'admin@techuniversity.edu',
            'first_name': 'Sarah',
            'last_name': 'Thompson',
            'password': 'admin123',
            'org': organizations[0],
            'role': 'owner'
        },
        {
            'username': 'admin_code',
            'email': 'admin@codeacademy.com',
            'first_name': 'Michael',
            'last_name': 'Rodriguez',
            'password': 'admin123',
            'org': organizations[1],
            'role': 'owner'
        }
    ]
    
    # Instructor users
    instructor_users = [
        {
            'username': 'prof_smith',
            'email': 'john.smith@techuniversity.edu',
            'first_name': 'John',
            'last_name': 'Smith',
            'password': 'instructor123',
            'org': organizations[0],
            'role': 'admin'
        },
        {
            'username': 'prof_garcia',
            'email': 'maria.garcia@codeacademy.com',
            'first_name': 'Maria',
            'last_name': 'Garcia',
            'password': 'instructor123',
            'org': organizations[1],
            'role': 'admin'
        }
    ]
    
    # Student users
    student_data = [
        # Tech University Students
        {'first_name': 'Emma', 'last_name': 'Wilson', 'email': 'emma.wilson@student.tech.edu', 'org': organizations[0]},
        {'first_name': 'Liam', 'last_name': 'Johnson', 'email': 'liam.johnson@student.tech.edu', 'org': organizations[0]},
        {'first_name': 'Olivia', 'last_name': 'Brown', 'email': 'olivia.brown@student.tech.edu', 'org': organizations[0]},
        {'first_name': 'Noah', 'last_name': 'Davis', 'email': 'noah.davis@student.tech.edu', 'org': organizations[0]},
        {'first_name': 'Ava', 'last_name': 'Miller', 'email': 'ava.miller@student.tech.edu', 'org': organizations[0]},
        {'first_name': 'William', 'last_name': 'Wilson', 'email': 'william.wilson@student.tech.edu', 'org': organizations[0]},
        {'first_name': 'Sophia', 'last_name': 'Moore', 'email': 'sophia.moore@student.tech.edu', 'org': organizations[0]},
        {'first_name': 'James', 'last_name': 'Taylor', 'email': 'james.taylor@student.tech.edu', 'org': organizations[0]},
        
        # Code Academy Students
        {'first_name': 'Isabella', 'last_name': 'Anderson', 'email': 'isabella.anderson@codeacademy.com', 'org': organizations[1]},
        {'first_name': 'Benjamin', 'last_name': 'Thomas', 'email': 'benjamin.thomas@codeacademy.com', 'org': organizations[1]},
        {'first_name': 'Mia', 'last_name': 'Jackson', 'email': 'mia.jackson@codeacademy.com', 'org': organizations[1]},
        {'first_name': 'Lucas', 'last_name': 'White', 'email': 'lucas.white@codeacademy.com', 'org': organizations[1]},
        {'first_name': 'Charlotte', 'last_name': 'Harris', 'email': 'charlotte.harris@codeacademy.com', 'org': organizations[1]},
        {'first_name': 'Mason', 'last_name': 'Martin', 'email': 'mason.martin@codeacademy.com', 'org': organizations[1]},
        
        # Startup Bootcamp Students
        {'first_name': 'Amelia', 'last_name': 'Clark', 'email': 'amelia.clark@startup.io', 'org': organizations[2]},
        {'first_name': 'Ethan', 'last_name': 'Lewis', 'email': 'ethan.lewis@startup.io', 'org': organizations[2]},
        {'first_name': 'Harper', 'last_name': 'Young', 'email': 'harper.young@startup.io', 'org': organizations[2]},
        {'first_name': 'Alexander', 'last_name': 'King', 'email': 'alexander.king@startup.io', 'org': organizations[2]},
    ]
    
    all_users = []
    
    # Create admin users
    for user_data in admin_users:
        user, created = User.objects.get_or_create(
            username=user_data['username'],
            defaults={
                'email': user_data['email'],
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name']
            }
        )
        if created:
            user.set_password(user_data['password'])
            user.save()
        
        # Create organization relationship
        UserOrganization.objects.get_or_create(
            user=user,
            org=user_data['org'],
            defaults={
                'role': user_data['role'],
                'permissions': {
                    'can_create_courses': True,
                    'can_manage_users': True,
                    'can_view_analytics': True
                }
            }
        )
        
        all_users.append(user)
        status = "✅ Created" if created else "📋 Exists"
        print(f"   {status} Admin: {user.get_full_name()} ({user_data['org'].name})")
    
    # Create instructor users
    for user_data in instructor_users:
        user, created = User.objects.get_or_create(
            username=user_data['username'],
            defaults={
                'email': user_data['email'],
                'first_name': user_data['first_name'],
                'last_name': user_data['last_name']
            }
        )
        if created:
            user.set_password(user_data['password'])
            user.save()
        
        # Create organization relationship
        UserOrganization.objects.get_or_create(
            user=user,
            org=user_data['org'],
            defaults={
                'role': user_data['role'],
                'permissions': {
                    'can_create_courses': True,
                    'can_grade_assignments': True,
                    'can_view_student_analytics': True
                }
            }
        )
        
        all_users.append(user)
        status = "✅ Created" if created else "📋 Exists"
        print(f"   {status} Instructor: {user.get_full_name()} ({user_data['org'].name})")
    
    # Create student users
    for i, student in enumerate(student_data):
        username = f"{student['first_name'].lower()}.{student['last_name'].lower()}"
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': student['email'],
                'first_name': student['first_name'],
                'last_name': student['last_name']
            }
        )
        if created:
            user.set_password('student123')
            user.save()
        
        # Create organization relationship
        UserOrganization.objects.get_or_create(
            user=user,
            org=student['org'],
            defaults={
                'role': 'member',
                'permissions': {
                    'can_view_own_progress': True,
                    'can_submit_assignments': True,
                    'can_join_study_groups': True
                }
            }
        )
        
        all_users.append(user)
        status = "✅ Created" if created else "📋 Exists"
        print(f"   {status} Student: {user.get_full_name()} ({student['org'].name})")
    
    return all_users


def create_cohorts_and_courses(organizations, users):
    """Create cohorts and courses"""
    print("\n📚 Creating Cohorts and Courses...")
    
    # Create milestones
    milestones_data = [
        {'name': 'Foundations', 'color': '#3b82f6'},
        {'name': 'Intermediate', 'color': '#f59e0b'},
        {'name': 'Advanced', 'color': '#ef4444'},
        {'name': 'Capstone', 'color': '#10b981'},
    ]
    
    milestones = []
    for org in organizations:
        for milestone_data in milestones_data:
            milestone, created = Milestone.objects.get_or_create(
                name=milestone_data['name'],
                org=org,
                defaults={
                    'description': f"{milestone_data['name']} level coursework",
                    'color': milestone_data['color']
                }
            )
            milestones.append(milestone)
    
    # Create cohorts
    cohorts_data = [
        {
            'name': 'Fall 2024 Full-Stack Web Development',
            'org': organizations[0],
            'start_date': date(2024, 9, 1),
            'end_date': date(2024, 12, 15),
            'max_students': 30
        },
        {
            'name': 'Winter 2024 Data Science Bootcamp',
            'org': organizations[0],
            'start_date': date(2024, 1, 15),
            'end_date': date(2024, 4, 30),
            'max_students': 25
        },
        {
            'name': 'JavaScript Mastery Course',
            'org': organizations[1],
            'start_date': date(2024, 10, 1),
            'end_date': date(2024, 12, 1),
            'max_students': 20
        },
        {
            'name': 'Startup MVP Development',
            'org': organizations[2],
            'start_date': date(2024, 11, 1),
            'end_date': date(2025, 2, 1),
            'max_students': 15
        }
    ]
    
    cohorts = []
    for cohort_data in cohorts_data:
        cohort, created = Cohort.objects.get_or_create(
            name=cohort_data['name'],
            org=cohort_data['org'],
            defaults=cohort_data
        )
        cohorts.append(cohort)
        status = "✅ Created" if created else "📋 Exists"
        print(f"   {status} Cohort: {cohort.name}")
    
    # Create courses
    courses_data = [
        {
            'org': organizations[0],
            'name': 'Full-Stack Web Development with Django',
            'description': 'Comprehensive course covering HTML, CSS, JavaScript, Python, and Django framework',
            'status': 'published',
            'difficulty_level': 'intermediate',
            'estimated_duration_weeks': 16,
            'learning_objectives': [
                'Master HTML5 and CSS3',
                'Understand JavaScript ES6+',
                'Build APIs with Django REST Framework',
                'Deploy applications to cloud platforms',
                'Implement user authentication and authorization'
            ],
            'tags': ['web-development', 'django', 'javascript', 'python']
        },
        {
            'org': organizations[0],
            'name': 'Data Science and Machine Learning',
            'description': 'Complete data science pipeline from data collection to model deployment',
            'status': 'published',
            'difficulty_level': 'advanced',
            'estimated_duration_weeks': 12,
            'learning_objectives': [
                'Master pandas and numpy for data manipulation',
                'Understand statistical analysis and visualization',
                'Build machine learning models with scikit-learn',
                'Deploy ML models to production',
                'Work with big data technologies'
            ],
            'tags': ['data-science', 'machine-learning', 'python', 'statistics']
        },
        {
            'org': organizations[1],
            'name': 'Advanced JavaScript and Node.js',
            'description': 'Deep dive into modern JavaScript development and server-side programming',
            'status': 'published',
            'difficulty_level': 'intermediate',
            'estimated_duration_weeks': 8,
            'learning_objectives': [
                'Master ES6+ features and async programming',
                'Build RESTful APIs with Node.js and Express',
                'Understand database integration with MongoDB',
                'Implement real-time features with WebSockets',
                'Deploy Node.js applications'
            ],
            'tags': ['javascript', 'nodejs', 'api', 'backend']
        },
        {
            'org': organizations[2],
            'name': 'Startup MVP Development',
            'description': 'Build and launch a minimum viable product from idea to market',
            'status': 'published',
            'difficulty_level': 'beginner',
            'estimated_duration_weeks': 12,
            'learning_objectives': [
                'Validate startup ideas and find product-market fit',
                'Design user-friendly interfaces and experiences',
                'Build rapid prototypes and MVPs',
                'Implement analytics and user feedback systems',
                'Launch and iterate based on user data'
            ],
            'tags': ['startup', 'mvp', 'entrepreneurship', 'product-development']
        }
    ]
    
    courses = []
    admin_user = users[0]  # Use first admin user as course creator
    
    for course_data in courses_data:
        course, created = Course.objects.get_or_create(
            name=course_data['name'],
            org=course_data['org'],
            defaults={
                **course_data,
                'created_by': admin_user
            }
        )
        courses.append(course)
        status = "✅ Created" if created else "📋 Exists"
        print(f"   {status} Course: {course.name}")
    
    # Link cohorts to courses
    course_cohort_links = [
        (courses[0], cohorts[0]),  # Full-Stack Web Dev -> Fall 2024 Full-Stack
        (courses[1], cohorts[1]),  # Data Science -> Winter 2024 Data Science
        (courses[2], cohorts[2]),  # JavaScript -> JavaScript Mastery
        (courses[3], cohorts[3]),  # Startup MVP -> Startup MVP Development
    ]
    
    for course, cohort in course_cohort_links:
        CourseCohort.objects.get_or_create(
            course=course,
            cohort=cohort,
            defaults={
                'start_date': cohort.start_date,
                'end_date': cohort.end_date,
                'is_active': True
            }
        )
    
    return cohorts, courses, milestones


def create_tasks_and_content(courses, milestones, users):
    """Create tasks and learning content"""
    print("\n📋 Creating Tasks and Learning Content...")
    
    # Sample tasks for Full-Stack Web Development course
    fullstack_tasks = [
        {
            'type': 'learning_material',
            'title': 'HTML5 Fundamentals',
            'description': 'Learn the basics of HTML5 structure and semantic elements',
            'difficulty_level': 'beginner',
            'estimated_time_minutes': 120,
            'points': 50
        },
        {
            'type': 'learning_material',
            'title': 'CSS3 Styling and Layout',
            'description': 'Master CSS styling, flexbox, and grid layouts',
            'difficulty_level': 'beginner',
            'estimated_time_minutes': 150,
            'points': 60
        },
        {
            'type': 'quiz',
            'title': 'HTML & CSS Knowledge Check',
            'description': 'Test your understanding of HTML and CSS concepts',
            'difficulty_level': 'beginner',
            'estimated_time_minutes': 30,
            'points': 25
        },
        {
            'type': 'assignment',
            'title': 'Personal Portfolio Website',
            'description': 'Create a responsive personal portfolio using HTML and CSS',
            'difficulty_level': 'intermediate',
            'estimated_time_minutes': 480,
            'points': 100
        },
        {
            'type': 'learning_material',
            'title': 'JavaScript ES6+ Features',
            'description': 'Explore modern JavaScript features and syntax',
            'difficulty_level': 'intermediate',
            'estimated_time_minutes': 180,
            'points': 75
        },
        {
            'type': 'assignment',
            'title': 'Interactive Web Application',
            'description': 'Build a dynamic web app with JavaScript',
            'difficulty_level': 'intermediate',
            'estimated_time_minutes': 600,
            'points': 150
        },
        {
            'type': 'learning_material',
            'title': 'Python and Django Basics',
            'description': 'Introduction to Python programming and Django framework',
            'difficulty_level': 'intermediate',
            'estimated_time_minutes': 240,
            'points': 80
        },
        {
            'type': 'project',
            'title': 'Full-Stack Blog Application',
            'description': 'Build a complete blog application with Django backend and interactive frontend',
            'difficulty_level': 'advanced',
            'estimated_time_minutes': 1200,
            'points': 200
        }
    ]
    
    # Create tasks for courses
    all_tasks = []
    instructor_user = users[2]  # Use instructor as task creator
    
    for i, course in enumerate(courses):
        if i == 0:  # Full-stack course gets detailed tasks
            task_list = fullstack_tasks
        else:  # Other courses get simplified task structure
            task_list = [
                {
                    'type': 'learning_material',
                    'title': f'{course.name} - Introduction',
                    'description': f'Introduction to {course.name}',
                    'difficulty_level': 'beginner',
                    'estimated_time_minutes': 120,
                    'points': 50
                },
                {
                    'type': 'assignment',
                    'title': f'{course.name} - Practice Project',
                    'description': f'Hands-on project for {course.name}',
                    'difficulty_level': 'intermediate',
                    'estimated_time_minutes': 480,
                    'points': 100
                },
                {
                    'type': 'project',
                    'title': f'{course.name} - Final Project',
                    'description': f'Capstone project for {course.name}',
                    'difficulty_level': 'advanced',
                    'estimated_time_minutes': 960,
                    'points': 200
                }
            ]
        
        for j, task_data in enumerate(task_list):
            task, created = Task.objects.get_or_create(
                title=task_data['title'],
                org=course.org,
                defaults={
                    **task_data,
                    'status': 'published',
                    'created_by': instructor_user
                }
            )
            
            # Link task to course
            CourseTask.objects.get_or_create(
                task=task,
                course=course,
                defaults={
                    'ordering': j + 1,
                    'is_required': True
                }
            )
            
            all_tasks.append(task)
            status = "✅ Created" if created else "📋 Exists"
            print(f"   {status} Task: {task.title}")
    
    return all_tasks


def create_student_profiles(users, organizations):
    """Create detailed student profiles"""
    print("\n👤 Creating Student Profiles...")
    
    learning_styles = ['visual', 'auditory', 'kinesthetic', 'reading_writing', 'mixed']
    difficulties = ['beginner', 'intermediate', 'advanced']
    statuses = ['active', 'on_break']
    
    # Common learning objectives by focus area
    learning_objectives_pool = {
        'web_dev': [
            'Master front-end development',
            'Learn backend API development',
            'Understand database design',
            'Deploy applications to cloud',
            'Build responsive websites'
        ],
        'data_science': [
            'Master data analysis with Python',
            'Understand machine learning algorithms',
            'Learn data visualization techniques',
            'Work with big data technologies',
            'Build predictive models'
        ],
        'general': [
            'Improve problem-solving skills',
            'Learn to work in teams',
            'Develop project management skills',
            'Enhance communication abilities',
            'Build a professional portfolio'
        ]
    }
    
    career_goals_pool = [
        "Transition to a career in software development and work at a tech startup",
        "Become a full-stack developer and build my own SaaS product",
        "Advance to a senior data scientist role at a Fortune 500 company",
        "Start my own tech consulting business",
        "Join a product team as a technical product manager",
        "Become a freelance web developer and work remotely",
        "Lead a development team at my current company",
        "Create educational technology products for schools"
    ]
    
    student_profiles = []
    
    # Filter for student users (members, not admins)
    student_users = [user for user in users if UserOrganization.objects.filter(user=user, role='member').exists()]
    
    for i, user in enumerate(student_users):
        # Determine focus area based on organization
        user_org = UserOrganization.objects.filter(user=user).first().org
        if 'tech' in user_org.name.lower():
            focus = 'web_dev'
        elif 'data' in user_org.name.lower():
            focus = 'data_science'
        else:
            focus = 'general'
        
        # Create learning objectives
        objectives = random.sample(learning_objectives_pool[focus], 3) + random.sample(learning_objectives_pool['general'], 2)
        
        profile_data = {
            'user': user,
            'bio': f"Passionate learner interested in technology and innovation. Looking to advance my career through hands-on learning and practical projects.",
            'learning_style': random.choice(learning_styles),
            'preferred_difficulty': random.choice(difficulties),
            'study_hours_per_week': random.randint(10, 25),
            'timezone': random.choice(['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London']),
            'learning_objectives': objectives,
            'interests': random.sample(['programming', 'data analysis', 'web design', 'mobile development', 'AI/ML', 'cybersecurity', 'cloud computing'], 3),
            'career_goals': random.choice(career_goals_pool),
            'status': random.choice(statuses),
            'overall_grade': Decimal(str(random.uniform(75.0, 95.0))),
            'streak_days': random.randint(0, 30),
            'total_study_hours': random.randint(50, 200),
            'email_notifications': random.choice([True, False]),
            'reminder_frequency': random.choice(['daily', 'weekly', 'none'])
        }
        
        profile, created = StudentProfile.objects.get_or_create(
            user=user,
            defaults=profile_data
        )
        
        student_profiles.append(profile)
        status = "✅ Created" if created else "📋 Exists"
        print(f"   {status} Profile: {user.get_full_name()} ({profile.learning_style}, {profile.preferred_difficulty})")
    
    return student_profiles


def create_enrollments(student_profiles, cohorts, courses):
    """Create student enrollments"""
    print("\n📚 Creating Student Enrollments...")
    
    enrollments = []
    statuses = ['enrolled', 'in_progress', 'completed']
    
    # Enroll students in courses based on their organization
    for profile in student_profiles:
        user_org = UserOrganization.objects.filter(user=profile.user).first().org
        
        # Find cohorts and courses for this organization
        org_cohorts = [c for c in cohorts if c.org == user_org]
        org_courses = [c for c in courses if c.org == user_org]
        
        if org_cohorts and org_courses:
            # Enroll in the first cohort and course for this org
            cohort = org_cohorts[0]
            course = org_courses[0]
            
            # Create enrollment
            enrollment_data = {
                'student': profile.user,
                'course': course,
                'cohort': cohort,
                'status': random.choice(statuses),
                'progress_percentage': Decimal(str(random.uniform(10.0, 90.0))),
                'expected_completion_date': cohort.end_date,
                'grade': Decimal(str(random.uniform(70.0, 95.0))) if random.choice([True, False]) else None,
                'certificate_issued': random.choice([True, False]) if random.choice([True, False]) else False
            }
            
            enrollment, created = StudentEnrollment.objects.get_or_create(
                student=profile.user,
                course=course,
                cohort=cohort,
                defaults=enrollment_data
            )
            
            enrollments.append(enrollment)
            status = "✅ Created" if created else "📋 Exists"
            print(f"   {status} Enrollment: {profile.user.get_full_name()} -> {course.name} ({enrollment.status})")
    
    return enrollments


def create_learning_sessions(enrollments, tasks):
    """Create learning sessions"""
    print("\n⏱️ Creating Learning Sessions...")
    
    session_types = ['learning_material', 'quiz_practice', 'assignment_work', 'project_work', 'review']
    session_statuses = ['completed', 'active', 'paused']
    device_types = ['laptop', 'desktop', 'tablet', 'mobile']
    browsers = ['Chrome', 'Firefox', 'Safari', 'Edge']
    
    sessions = []
    
    for enrollment in enrollments:
        course = enrollment.course
        course_tasks = [ct.task for ct in CourseTask.objects.filter(course=course)]
        
        # Create 3-8 sessions per enrollment
        num_sessions = random.randint(3, 8)
        
        for i in range(num_sessions):
            if course_tasks:
                task = random.choice(course_tasks)
                
                # Create session data
                start_time = timezone.now() - timedelta(days=random.randint(1, 30), hours=random.randint(0, 23))
                duration = random.randint(30, 180)
                
                session_data = {
                    'student': enrollment.student,
                    'course': course,
                    'task': task,
                    'session_type': random.choice(session_types),
                    'status': random.choice(session_statuses),
                    'started_at': start_time,
                    'ended_at': start_time + timedelta(minutes=duration) if random.choice([True, False]) else None,
                    'total_duration_minutes': duration,
                    'active_duration_minutes': random.randint(int(duration * 0.7), duration),
                    'progress_at_start': Decimal(str(random.uniform(0.0, 50.0))),
                    'progress_at_end': Decimal(str(random.uniform(0.0, 100.0))),
                    'tasks_completed': random.randint(1, 5),
                    'questions_answered': random.randint(5, 25),
                    'correct_answers': random.randint(3, 20),
                    'points_earned': random.randint(10, 50),
                    'satisfaction_rating': random.randint(3, 5),
                    'device_type': random.choice(device_types),
                    'browser': random.choice(browsers)
                }
                
                session = LearningSession.objects.create(**session_data)
                sessions.append(session)
        
        print(f"   ✅ Created {num_sessions} sessions for {enrollment.student.get_full_name()}")
    
    print(f"   📊 Total sessions created: {len(sessions)}")
    return sessions


def create_assignments_and_submissions(enrollments, tasks):
    """Create assignment submissions"""
    print("\n📝 Creating Assignment Submissions...")
    
    submission_statuses = ['submitted', 'graded', 'returned', 'resubmitted']
    grade_letters = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C']
    
    submissions = []
    
    # Get assignment and project tasks
    assignment_tasks = [t for t in tasks if t.type in ['assignment', 'project']]
    
    for enrollment in enrollments:
        course = enrollment.course
        course_assignment_tasks = [ct.task for ct in CourseTask.objects.filter(course=course, task__in=assignment_tasks)]
        
        # Create submissions for 1-3 assignments
        num_submissions = min(random.randint(1, 3), len(course_assignment_tasks))
        selected_tasks = random.sample(course_assignment_tasks, num_submissions)
        
        for task in selected_tasks:
            submission_content = f"""
This is my submission for {task.title}.

I have completed the following requirements:
1. Implemented the core functionality as specified
2. Added error handling and validation
3. Included comprehensive documentation
4. Tested the application thoroughly

Key features implemented:
- User interface design
- Database integration
- API endpoints
- Authentication system

Challenges encountered:
- Initially struggled with the database design
- Had to refactor the code for better performance
- Learned new concepts during implementation

I'm proud of this submission and believe it demonstrates my understanding of the concepts covered in this course.
            """.strip()
            
            submission_data = {
                'student': enrollment.student,
                'task': task,
                'course': course,
                'status': random.choice(submission_statuses),
                'content': submission_content,
                'file_urls': [
                    f'https://github.com/{enrollment.student.username}/{task.title.lower().replace(" ", "-")}',
                    f'https://demo-{enrollment.student.username}.netlify.app'
                ] if random.choice([True, False]) else [],
                'metadata': {
                    'programming_language': random.choice(['Python', 'JavaScript', 'HTML/CSS']),
                    'tools_used': random.sample(['VS Code', 'Git', 'Docker', 'Postman', 'Figma'], 2),
                    'time_spent_hours': random.randint(5, 20)
                },
                'version': 1,
                'submitted_at': timezone.now() - timedelta(days=random.randint(1, 15)),
                'score': Decimal(str(random.uniform(75.0, 98.0))),
                'max_score': Decimal('100.00'),
                'grade_letter': random.choice(grade_letters),
                'is_passed': True,
                'grader_feedback': f"""
Excellent work on this {task.title}! Your implementation shows a solid understanding of the concepts.

Strengths:
- Clean, well-organized code
- Good error handling
- Comprehensive documentation
- Creative approach to the problem

Areas for improvement:
- Consider adding more unit tests
- Could optimize performance in some areas
- Minor UI/UX enhancements possible

Overall: Great job! Keep up the excellent work.
                """.strip(),
                'is_late': random.choice([True, False]),
                'plagiarism_checked': True,
                'plagiarism_score': Decimal(str(random.uniform(0.0, 5.0)))
            }
            
            submission = AssignmentSubmission.objects.create(**submission_data)
            submissions.append(submission)
        
        if selected_tasks:
            print(f"   ✅ Created {len(selected_tasks)} submissions for {enrollment.student.get_full_name()}")
    
    print(f"   📊 Total submissions created: {len(submissions)}")
    return submissions


def create_study_groups(courses, student_profiles):
    """Create study groups"""
    print("\n👥 Creating Study Groups...")
    
    group_types = ['peer_study', 'project_team', 'discussion', 'mentorship']
    join_policies = ['open', 'invite_only', 'request_to_join']
    
    study_groups = []
    
    for course in courses:
        # Create 1-2 study groups per course
        num_groups = random.randint(1, 2)
        
        for i in range(num_groups):
            group_name = f"{course.name} - {random.choice(['Study Group', 'Project Team', 'Discussion Circle'])}"
            
            # Find students in this course's organization
            course_students = [p for p in student_profiles if UserOrganization.objects.filter(user=p.user, org=course.org).exists()]
            
            if course_students:
                creator = random.choice(course_students)
                
                group_data = {
                    'name': group_name,
                    'description': f"Collaborative learning group for {course.name}. Join us to study together, share resources, and work on projects!",
                    'organization': course.org,
                    'course': course,
                    'status': 'active',
                    'join_policy': random.choice(join_policies),
                    'max_members': random.randint(5, 12),
                    'creator': creator.user,
                    'meeting_schedule': {
                        'days': random.sample(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], 2),
                        'time': random.choice(['18:00', '19:00', '20:00']),
                        'duration_minutes': random.choice([60, 90, 120]),
                        'platform': random.choice(['Zoom', 'Google Meet', 'Discord', 'Microsoft Teams'])
                    },
                    'meeting_link': f"https://zoom.us/j/{random.randint(100000000, 999999999)}",
                    'timezone': creator.timezone
                }
                
                study_group, created = StudyGroup.objects.get_or_create(
                    name=group_name,
                    organization=course.org,
                    defaults=group_data
                )
                
                if created:
                    # Add creator as moderator
                    StudyGroupMembership.objects.create(
                        study_group=study_group,
                        student=creator.user,
                        status='active',
                        role='creator',
                        approved_at=timezone.now(),
                        sessions_attended=random.randint(1, 5),
                        contributions=random.randint(5, 15)
                    )
                    
                    # Add 2-5 more members
                    other_students = [s for s in course_students if s != creator]
                    num_members = min(random.randint(2, 5), len(other_students))
                    selected_members = random.sample(other_students, num_members)
                    
                    for member in selected_members:
                        StudyGroupMembership.objects.create(
                            study_group=study_group,
                            student=member.user,
                            status='active',
                            role='member',
                            approved_at=timezone.now(),
                            sessions_attended=random.randint(0, 3),
                            contributions=random.randint(1, 8)
                        )
                
                study_groups.append(study_group)
                status = "✅ Created" if created else "📋 Exists"
                member_count = study_group.member_count
                print(f"   {status} Study Group: {study_group.name} ({member_count} members)")
    
    return study_groups


def create_learning_goals(student_profiles, courses):
    """Create personal learning goals"""
    print("\n🎯 Creating Learning Goals...")
    
    categories = ['academic', 'skill_development', 'career', 'personal', 'project']
    priorities = ['low', 'medium', 'high']
    statuses = ['not_started', 'in_progress', 'completed']
    
    goal_templates = [
        {
            'title': 'Complete {course_name} with excellence',
            'category': 'academic',
            'description': 'Achieve a grade of A- or better in {course_name} by mastering all key concepts and completing all assignments with high quality.',
            'priority': 'high'
        },
        {
            'title': 'Build a portfolio project',
            'category': 'project',
            'description': 'Create a comprehensive portfolio project that demonstrates the skills learned in {course_name}.',
            'priority': 'medium'
        },
        {
            'title': 'Master {skill} programming',
            'category': 'skill_development',
            'description': 'Become proficient in {skill} programming through practice and real-world projects.',
            'priority': 'high'
        },
        {
            'title': 'Join tech community',
            'category': 'personal',
            'description': 'Actively participate in tech meetups, forums, and online communities to network and learn from others.',
            'priority': 'medium'
        },
        {
            'title': 'Land a developer job',
            'category': 'career',
            'description': 'Secure a position as a software developer at a reputable tech company within 6 months of course completion.',
            'priority': 'high'
        }
    ]
    
    skills = ['Python', 'JavaScript', 'React', 'Django', 'Node.js', 'Machine Learning', 'Data Analysis']
    
    learning_goals = []
    
    for profile in student_profiles:
        # Get user's enrolled courses
        user_enrollments = StudentEnrollment.objects.filter(student=profile.user)
        user_courses = [e.course for e in user_enrollments]
        
        # Create 2-4 goals per student
        num_goals = random.randint(2, 4)
        selected_templates = random.sample(goal_templates, min(num_goals, len(goal_templates)))
        
        for template in selected_templates:
            # Customize template based on user's context
            if user_courses and '{course_name}' in template['title']:
                course_name = random.choice(user_courses).name
                title = template['title'].format(course_name=course_name)
                description = template['description'].format(course_name=course_name)
                related_course = random.choice(user_courses)
            elif '{skill}' in template['title']:
                skill = random.choice(skills)
                title = template['title'].format(skill=skill)
                description = template['description'].format(skill=skill)
                related_course = random.choice(user_courses) if user_courses else None
            else:
                title = template['title']
                description = template['description']
                related_course = random.choice(user_courses) if user_courses else None
            
            # Set target date based on priority
            if template['priority'] == 'high':
                target_date = date.today() + timedelta(days=random.randint(30, 90))
            else:
                target_date = date.today() + timedelta(days=random.randint(60, 180))
            
            goal_data = {
                'student': profile.user,
                'title': title,
                'description': description,
                'category': template['category'],
                'status': random.choice(statuses),
                'priority': template['priority'],
                'course': related_course,
                'target_date': target_date,
                'progress_percentage': Decimal(str(random.uniform(0.0, 80.0))),
                'success_criteria': [
                    'Complete all required coursework',
                    'Achieve target grade or performance metric',
                    'Document learning and progress',
                    'Apply skills in practical project'
                ],
                'milestones': [
                    {'name': '25% Progress', 'completed': random.choice([True, False])},
                    {'name': '50% Progress', 'completed': random.choice([True, False])},
                    {'name': '75% Progress', 'completed': False},
                    {'name': 'Final Achievement', 'completed': False}
                ],
                'reminder_frequency': random.choice(['daily', 'weekly', 'none'])
            }
            
            # Set completion date if status is completed
            if goal_data['status'] == 'completed':
                goal_data['completed_at'] = timezone.now() - timedelta(days=random.randint(1, 30))
                goal_data['progress_percentage'] = Decimal('100.00')
            elif goal_data['status'] == 'in_progress':
                goal_data['started_at'] = timezone.now() - timedelta(days=random.randint(1, 60))
            
            goal = LearningGoal.objects.create(**goal_data)
            learning_goals.append(goal)
        
        print(f"   ✅ Created {len(selected_templates)} goals for {profile.user.get_full_name()}")
    
    print(f"   📊 Total goals created: {len(learning_goals)}")
    return learning_goals


def create_analytics_data(student_profiles):
    """Create student analytics data"""
    print("\n📊 Creating Student Analytics Data...")
    
    analytics_records = []
    
    for profile in student_profiles:
        # Create analytics for the past 30 days
        for days_ago in range(30, 0, -1):
            analytics_date = date.today() - timedelta(days=days_ago)
            
            # Skip some days randomly to simulate realistic patterns
            if random.random() < 0.3:  # 30% chance to skip a day
                continue
            
            # Generate realistic daily metrics
            is_weekend = analytics_date.weekday() >= 5
            is_active_day = random.random() < (0.4 if is_weekend else 0.8)
            
            if is_active_day:
                study_time = random.randint(30, 180) if not is_weekend else random.randint(60, 240)
                sessions = random.randint(1, 4)
                tasks = random.randint(1, 3)
                questions = random.randint(5, 20)
                correct = random.randint(int(questions * 0.6), questions)
            else:
                study_time = sessions = tasks = questions = correct = 0
            
            analytics_data = {
                'student': profile.user,
                'date': analytics_date,
                'study_time_minutes': study_time,
                'sessions_count': sessions,
                'tasks_completed': tasks,
                'questions_answered': questions,
                'correct_answers': correct,
                'average_score': Decimal(str((correct / questions * 100) if questions > 0 else 0)),
                'accuracy_rate': Decimal(str((correct / questions * 100) if questions > 0 else 0)),
                'courses_enrolled': StudentEnrollment.objects.filter(student=profile.user).count(),
                'courses_in_progress': StudentEnrollment.objects.filter(student=profile.user, status='in_progress').count(),
                'courses_completed': StudentEnrollment.objects.filter(student=profile.user, status='completed').count(),
                'overall_progress': profile.completion_rate if hasattr(profile, 'completion_rate') else Decimal('0.00'),
                'login_count': random.randint(0, 3) if is_active_day else 0,
                'resource_views': random.randint(0, 10) if is_active_day else 0,
                'forum_posts': random.randint(0, 2) if is_active_day and random.random() < 0.3 else 0,
                'study_group_activities': random.randint(0, 1) if is_active_day and random.random() < 0.2 else 0,
                'goals_created': random.randint(0, 1) if random.random() < 0.05 else 0,
                'goals_completed': random.randint(0, 1) if random.random() < 0.02 else 0,
                'study_streak_days': profile.streak_days,
                'achievements_earned': random.randint(0, 1) if is_active_day and random.random() < 0.1 else 0
            }
            
            analytics = StudentAnalytics.objects.create(**analytics_data)
            analytics_records.append(analytics)
        
        # Count analytics days for this student
        student_analytics_count = len([a for a in analytics_records if a.student == profile.user])
        print(f"   ✅ Created {student_analytics_count} analytics records for {profile.user.get_full_name()}")
    
    print(f"   📊 Total analytics records created: {len(analytics_records)}")
    return analytics_records


def create_achievements(student_profiles):
    """Create student achievements"""
    print("\n🏆 Creating Student Achievements...")
    
    achievement_templates = [
        {
            'type': 'streak',
            'title': 'Week Warrior',
            'description': 'Maintained a 7-day learning streak',
            'badge_icon': '🔥',
            'badge_color': '#ef4444',
            'points': 50
        },
        {
            'type': 'completion',
            'title': 'Course Conqueror',
            'description': 'Completed first course with excellence',
            'badge_icon': '🎓',
            'badge_color': '#10b981',
            'points': 100
        },
        {
            'type': 'performance',
            'title': 'Quiz Master',
            'description': 'Achieved 90%+ average on all quizzes',
            'badge_icon': '🧠',
            'badge_color': '#3b82f6',
            'points': 75
        },
        {
            'type': 'engagement',
            'title': 'Community Builder',
            'description': 'Active participant in study groups',
            'badge_icon': '👥',
            'badge_color': '#8b5cf6',
            'points': 60
        },
        {
            'type': 'milestone',
            'title': 'First Steps',
            'description': 'Completed first learning session',
            'badge_icon': '🚀',
            'badge_color': '#f59e0b',
            'points': 25
        }
    ]
    
    achievements = []
    
    for profile in student_profiles:
        # Award 1-3 achievements per student
        num_achievements = random.randint(1, 3)
        selected_templates = random.sample(achievement_templates, num_achievements)
        
        for template in selected_templates:
            achievement_data = {
                'student': profile.user,
                'achievement_type': template['type'],
                'title': template['title'],
                'description': template['description'],
                'badge_icon': template['badge_icon'],
                'badge_color': template['badge_color'],
                'criteria_met': {
                    'metric': template['type'],
                    'threshold': random.choice([7, 90, 100]),
                    'achieved_value': random.choice([10, 95, 105])
                },
                'points_earned': template['points'],
                'is_public': random.choice([True, False]),
                'is_featured': random.choice([True, False]),
                'earned_at': timezone.now() - timedelta(days=random.randint(1, 30))
            }
            
            achievement = StudentAchievement.objects.create(**achievement_data)
            achievements.append(achievement)
        
        print(f"   ✅ Created {num_achievements} achievements for {profile.user.get_full_name()}")
    
    print(f"   📊 Total achievements created: {len(achievements)}")
    return achievements


def create_notifications(student_profiles, courses):
    """Create student notifications"""
    print("\n🔔 Creating Student Notifications...")
    
    notification_templates = [
        {
            'type': 'course_update',
            'title': 'New content available in {course}',
            'message': 'Check out the latest learning materials and assignments in {course}.',
            'priority': 'medium'
        },
        {
            'type': 'assignment_due',
            'title': 'Assignment due soon',
            'message': 'Don\'t forget to submit your assignment for {course} by the deadline.',
            'priority': 'high'
        },
        {
            'type': 'achievement',
            'title': 'New achievement unlocked!',
            'message': 'Congratulations! You\'ve earned a new badge for your learning progress.',
            'priority': 'medium'
        },
        {
            'type': 'study_reminder',
            'title': 'Time to study',
            'message': 'You haven\'t logged any study time today. Keep your streak going!',
            'priority': 'low'
        },
        {
            'type': 'grade_released',
            'title': 'Grade available',
            'message': 'Your grade for the recent assignment in {course} is now available.',
            'priority': 'medium'
        }
    ]
    
    notifications = []
    
    for profile in student_profiles:
        # Get user's courses
        user_enrollments = StudentEnrollment.objects.filter(student=profile.user)
        user_courses = [e.course for e in user_enrollments]
        
        # Create 2-5 notifications per student
        num_notifications = random.randint(2, 5)
        
        for _ in range(num_notifications):
            template = random.choice(notification_templates)
            
            # Customize message if it contains course placeholder
            if user_courses and '{course}' in template['message']:
                course = random.choice(user_courses)
                title = template['title'].format(course=course.name)
                message = template['message'].format(course=course.name)
                notification_course = course
            else:
                title = template['title']
                message = template['message']
                notification_course = random.choice(user_courses) if user_courses else None
            
            notification_data = {
                'recipient': profile.user,
                'notification_type': template['type'],
                'priority': template['priority'],
                'title': title,
                'message': message,
                'course': notification_course,
                'action_url': f'/courses/{notification_course.id}/' if notification_course else '/dashboard/',
                'action_text': 'View Course' if notification_course else 'Go to Dashboard',
                'is_read': random.choice([True, False]),
                'sent_via_email': random.choice([True, False]),
                'expires_at': timezone.now() + timedelta(days=random.randint(7, 30))
            }
            
            # Set read timestamp if notification is read
            if notification_data['is_read']:
                notification_data['read_at'] = timezone.now() - timedelta(hours=random.randint(1, 72))
            
            # Set email sent timestamp if sent via email
            if notification_data['sent_via_email']:
                notification_data['email_sent_at'] = timezone.now() - timedelta(hours=random.randint(1, 24))
            
            notification = StudentNotification.objects.create(**notification_data)
            notifications.append(notification)
        
        print(f"   ✅ Created {num_notifications} notifications for {profile.user.get_full_name()}")
    
    print(f"   📊 Total notifications created: {len(notifications)}")
    return notifications


def main():
    """Run the complete sample data creation process"""
    print("🎓 Student Flow System - Sample Data Creation")
    print("=" * 60)
    print("This script will create comprehensive sample data for the student flow system.")
    print("It demonstrates all models working together in realistic scenarios.\n")
    
    try:
        # Step 1: Create organizations
        organizations = create_organizations()
        
        # Step 2: Create users and relationships
        users = create_users_and_relationships(organizations)
        
        # Step 3: Create cohorts and courses
        cohorts, courses, milestones = create_cohorts_and_courses(organizations, users)
        
        # Step 4: Create tasks and content
        tasks = create_tasks_and_content(courses, milestones, users)
        
        # Step 5: Create student profiles
        student_profiles = create_student_profiles(users, organizations)
        
        # Step 6: Create enrollments
        enrollments = create_enrollments(student_profiles, cohorts, courses)
        
        # Step 7: Create learning sessions
        sessions = create_learning_sessions(enrollments, tasks)
        
        # Step 8: Create assignments and submissions
        submissions = create_assignments_and_submissions(enrollments, tasks)
        
        # Step 9: Create study groups
        study_groups = create_study_groups(courses, student_profiles)
        
        # Step 10: Create learning goals
        learning_goals = create_learning_goals(student_profiles, courses)
        
        # Step 11: Create analytics data
        analytics = create_analytics_data(student_profiles)
        
        # Step 12: Create achievements
        achievements = create_achievements(student_profiles)
        
        # Step 13: Create notifications
        notifications = create_notifications(student_profiles, courses)
        
        # Summary
        print("\n" + "=" * 60)
        print("✅ SAMPLE DATA CREATION COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        print(f"📊 Summary of created data:")
        print(f"   🏢 Organizations: {len(organizations)}")
        print(f"   👥 Users: {len(users)}")
        print(f"   🎓 Cohorts: {len(cohorts)}")
        print(f"   📚 Courses: {len(courses)}")
        print(f"   📋 Tasks: {len(tasks)}")
        print(f"   👤 Student Profiles: {len(student_profiles)}")
        print(f"   📝 Enrollments: {len(enrollments)}")
        print(f"   ⏱️  Learning Sessions: {len(sessions)}")
        print(f"   📄 Assignment Submissions: {len(submissions)}")
        print(f"   👥 Study Groups: {len(study_groups)}")
        print(f"   🎯 Learning Goals: {len(learning_goals)}")
        print(f"   📈 Analytics Records: {len(analytics)}")
        print(f"   🏆 Achievements: {len(achievements)}")
        print(f"   🔔 Notifications: {len(notifications)}")
        print("\n🎉 Your student flow system is now populated with realistic sample data!")
        print("🔗 Next steps:")
        print("   1. Run the Django development server: python manage.py runserver")
        print("   2. Access the admin interface at http://localhost:8000/admin/")
        print("   3. Explore the data using the demo_student.py script")
        print("   4. Build your frontend to interact with this rich dataset")
        
    except Exception as e:
        print(f"❌ Error during sample data creation: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
    return True


if __name__ == "__main__":
    success = main()
    if success:
        print("\n✅ Sample data creation completed successfully!")
    else:
        print("\n❌ Sample data creation failed. Check the error messages above.")
