# Student Flow Django App

A comprehensive Django application for managing all student learning activities, progress tracking, and educational interactions. This app provides a complete student-centered learning management system with dashboard, goal setting, study groups, assignment submissions, quiz attempts, achievements, and detailed analytics.

## 🚀 Features

### Core Student Functionality
- **Student Dashboard**: Comprehensive overview with progress, recent activities, upcoming deadlines, and study statistics
- **Learning Progress Tracking**: Detailed tracking of course enrollment, task completion, and skill development
- **Assignment Management**: Complete assignment submission, grading, and feedback system
- **Quiz & Assessment System**: Interactive quiz attempts with scoring and detailed performance analytics
- **Study Sessions**: Automatic tracking of learning sessions with time spent and progress metrics
- **Goal Setting & Management**: Personal learning goals with progress tracking and deadline reminders

### Collaborative Learning Features
- **Study Groups**: Student-created and managed study groups with different access policies
- **Peer Learning Resources**: Shared bookmarks, notes, summaries, and learning materials
- **Resource Management**: Organized learning resources with tagging, folders, and public sharing
- **Achievement System**: Gamified learning with badges, streaks, and milestone rewards

### Advanced Features
- **Learning Analytics**: Comprehensive analytics with study patterns, performance metrics, and insights
- **Notification System**: Real-time notifications with email integration and priority levels
- **Calendar Integration**: Study calendar with sessions, deadlines, and goal targets
- **Mobile-Friendly API**: REST API designed for web and mobile applications
- **Customizable Profiles**: Rich student profiles with learning preferences and styles

### Student Roles Supported
- **Active Students**: Full access to all learning features and progress tracking
- **Graduated Students**: Historical access to achievements and completed coursework
- **Suspended Students**: Limited access with potential for reactivation

## 📋 Key Models

### Core Models

#### StudentProfile
Extended profile for students with learning preferences and progress:
- Personal information and bio
- Learning style preferences (visual, auditory, kinesthetic, etc.)
- Study goals and career objectives
- Performance metrics (completion rate, streak days, total study hours)
- Notification and reminder settings

#### StudentEnrollment
Tracks student enrollments in courses:
- Enrollment status and timeline
- Progress percentage and current milestone
- Grade tracking and certificate management
- Expected completion dates with overdue detection

#### LearningSession
Individual learning session tracking:
- Session types (learning material, quiz practice, assignment work, etc.)
- Time tracking with active vs. total duration
- Progress metrics and difficulty tracking
- Device and browser information for analytics

#### AssignmentSubmission
Complete assignment submission and grading system:
- Version control with revision tracking
- File uploads and content management
- Grading workflow with feedback system
- Plagiarism checking and quality assurance

### Collaborative Models

#### StudyGroup
Student-created study groups for collaborative learning:
- Different access policies (open, invite-only, request-to-join)
- Member management with roles and permissions
- Meeting scheduling and recurring sessions
- Activity tracking and engagement metrics

#### StudyGroupMembership
Manages individual memberships in study groups:
- Approval workflow for restricted groups
- Role assignments (member, moderator, creator)
- Activity tracking and contribution metrics
- Session attendance and participation

#### LearningResource
Student-saved learning resources and materials:
- Multiple resource types (bookmarks, notes, summaries, flashcards)
- Organization with tags and folders
- Public sharing with classmates
- Access tracking and popularity metrics

### Progress & Goals Models

#### LearningGoal
Personal learning goals and milestones:
- Goal categorization (academic, skill development, career, personal)
- Priority levels and progress tracking
- Success criteria and milestone definitions
- Reminder system with customizable frequency

#### QuizAttempt
Detailed quiz attempt tracking:
- Multiple attempts with attempt numbering
- Timing controls and time limits
- Answer tracking and review capabilities
- Performance analytics and accuracy rates

#### StudentAchievement
Gamified achievement and badge system:
- Achievement types (completion, performance, streaks, engagement)
- Customizable badges with icons and colors
- Point system for motivation
- Public/private visibility controls

### Analytics & Communication Models

#### StudentAnalytics
Daily analytics and learning metrics:
- Study time and session tracking
- Performance metrics and accuracy rates
- Course progress and completion tracking
- Engagement metrics and goal achievement

#### StudentNotification
Comprehensive notification system:
- Multiple notification types with priority levels
- Course, task, and study group context
- Email integration with customizable preferences
- Expiration dates and automatic cleanup

## 🔧 Installation

### Prerequisites
- Python 3.8+
- Django 4.2+
- PostgreSQL 12+ (recommended) or SQLite for development

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Add to Django Settings
```python
# settings.py
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'student_flow',  # Add the student flow app
    # ... your other apps
]

# Django REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.TokenAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20
}

# Email settings for notifications (optional)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'your-smtp-host.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@example.com'
EMAIL_HOST_PASSWORD = 'your-password'
DEFAULT_FROM_EMAIL = 'Student Portal <noreply@yourschool.edu>'

# Student flow specific settings
SEND_STUDENT_EMAILS = True  # Enable/disable email notifications
```

### Step 3: Configure URLs
```python
# urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('student-flow/', include('student_flow.urls')),
    # ... your other URLs
]
```

### Step 4: Run Migrations
```bash
python manage.py makemigrations student_flow
python manage.py migrate
```

### Step 5: Create Superuser (Optional)
```bash
python manage.py createsuperuser
```

## 📚 API Endpoints

### Authentication Required
All endpoints require authentication. Use Django's built-in authentication or integrate with your existing auth system.

### Student Profile Management
- `GET /student-flow/api/profile/` - Get current student profile
- `PATCH /student-flow/api/profile/` - Update student profile
- `POST /student-flow/api/profile/create/` - Create new student profile

### Dashboard & Overview
- `GET /student-flow/api/dashboard/` - Comprehensive student dashboard
- `GET /student-flow/api/progress/` - Course progress summary
- `GET /student-flow/api/stats/` - Personal learning statistics
- `GET /student-flow/api/calendar/` - Learning calendar with events

### Course Enrollment
- `GET /student-flow/api/enrollments/` - List student enrollments
- `GET /student-flow/api/enrollments/{id}/` - Enrollment details
- `GET /student-flow/api/available-courses/` - Available courses for enrollment

### Learning Sessions
- `GET /student-flow/api/sessions/` - List learning sessions
- `POST /student-flow/api/sessions/` - Start new learning session
- `GET /student-flow/api/sessions/{id}/` - Session details
- `PATCH /student-flow/api/sessions/{id}/` - Update session
- `PUT /student-flow/api/sessions/{uuid}/end/` - End active session

### Assignment Management
- `GET /student-flow/api/assignments/` - List assignment submissions
- `POST /student-flow/api/assignments/` - Create new submission
- `GET /student-flow/api/assignments/{id}/` - Submission details
- `PATCH /student-flow/api/assignments/{id}/` - Update submission
- `PUT /student-flow/api/assignments/{uuid}/submit/` - Submit assignment

### Study Groups
- `GET /student-flow/api/study-groups/` - List available study groups
- `POST /student-flow/api/study-groups/` - Create new study group
- `GET /student-flow/api/study-groups/{uuid}/` - Study group details
- `PATCH /student-flow/api/study-groups/{uuid}/` - Update study group
- `POST /student-flow/api/study-groups/{uuid}/join/` - Join study group
- `DELETE /student-flow/api/study-groups/{uuid}/leave/` - Leave study group
- `GET /student-flow/api/study-groups/{uuid}/members/` - List group members

### Learning Resources
- `GET /student-flow/api/resources/` - List personal learning resources
- `POST /student-flow/api/resources/` - Create new resource
- `GET /student-flow/api/resources/{uuid}/` - Resource details
- `PATCH /student-flow/api/resources/{uuid}/` - Update resource
- `DELETE /student-flow/api/resources/{uuid}/` - Delete resource
- `GET /student-flow/api/resources/public/` - Browse public resources

### Learning Goals
- `GET /student-flow/api/goals/` - List personal learning goals
- `POST /student-flow/api/goals/` - Create new goal
- `GET /student-flow/api/goals/{uuid}/` - Goal details
- `PATCH /student-flow/api/goals/{uuid}/` - Update goal
- `PUT /student-flow/api/goals/{uuid}/complete/` - Mark goal as completed

### Quiz Attempts
- `GET /student-flow/api/quiz-attempts/` - List quiz attempts
- `POST /student-flow/api/quiz-attempts/` - Start new quiz attempt
- `GET /student-flow/api/quiz-attempts/{uuid}/` - Attempt details
- `PATCH /student-flow/api/quiz-attempts/{uuid}/` - Update attempt
- `PUT /student-flow/api/quiz-attempts/{uuid}/complete/` - Complete quiz

### Notifications
- `GET /student-flow/api/notifications/` - List notifications
- `PUT /student-flow/api/notifications/{uuid}/read/` - Mark as read
- `POST /student-flow/api/notifications/mark-all-read/` - Mark all as read

### Analytics & Achievements
- `GET /student-flow/api/analytics/` - Personal learning analytics
- `GET /student-flow/api/achievements/` - Student achievements and badges
- `GET /student-flow/api/completions/` - Task completion history

## 🔐 Permissions System

### Built-in Permission Classes

#### Basic Permissions
- `IsStudent` - User must be a student (has student profile or learner role)
- `IsStudentOwner` - User must own the specific object
- `IsStudentOrReadOnly` - Read access for all, write access for students only
- `ActiveStudentOnly` - Only active students can access

#### Access Control Permissions
- `CanAccessEnrollment` - Access enrollment information (student, mentor, admin)
- `CanAccessStudyGroup` - Access study group (member, creator, moderator, admin)
- `CanJoinStudyGroup` - Permission to join specific study groups
- `CanModerateStudyGroup` - Moderate study group activities
- `CanViewStudentProgress` - View student progress (student, mentor, admin)

#### Assignment & Assessment Permissions
- `CanSubmitAssignment` - Submit assignments (students only)
- `CanGradeAssignment` - Grade assignments (instructors, mentors, admins)
- `EnrolledStudentOnly` - Must be enrolled in the course
- `CanAccessLearningResource` - Access learning resources based on visibility

#### Goal & Communication Permissions
- `CanManageGoals` - Manage learning goals (student owner, mentor read-only)
- `CanAccessNotifications` - Access own notifications only
- `CanAccessAnalytics` - Access analytics (student, mentor for their students, admin)

#### Compound Permissions
- `StudentOrMentor` - Access for students or mentors
- `StudentOrAdminReadOnly` - Full access for students, read-only for admins
- `StudentInSameOrganization` - Students in the same organization
- `StudentInSameCohort` - Students in the same cohort

### Custom Permission Usage

```python
from student_flow.permissions import IsStudent, CanAccessEnrollment

class MyStudentView(APIView):
    permission_classes = [IsStudent, CanAccessEnrollment]
    
    def get(self, request):
        # Your view logic here
        pass
```

## 📊 Analytics System

### Automatic Analytics Collection

The system automatically collects daily analytics for each student:

#### Study Metrics
- **Study Time**: Total and active learning time
- **Session Tracking**: Number of sessions and types
- **Task Progress**: Tasks completed and learning outcomes

#### Performance Metrics
- **Quiz Scores**: Average scores and accuracy rates
- **Assignment Grades**: Grade trends and improvement tracking
- **Skill Development**: Progress in different skill areas

#### Engagement Metrics
- **Login Patterns**: Frequency and time of day preferences
- **Resource Usage**: Most accessed materials and learning paths
- **Social Learning**: Study group participation and peer interactions

#### Goal Achievement
- **Goal Completion**: Success rates and timeline adherence
- **Milestone Tracking**: Progress towards learning objectives
- **Streak Maintenance**: Consistent learning habit tracking

### Manual Analytics Update

Use the management command to update analytics:

```bash
# Update analytics for all students
python manage.py update_student_analytics

# Update for specific date
python manage.py update_student_analytics --date 2024-01-15

# Update for specific student
python manage.py update_student_analytics --student-email student@example.com

# Update for specific organization
python manage.py update_student_analytics --org-id 1

# Force update (override existing analytics)
python manage.py update_student_analytics --force
```

### Analytics API Usage

```python
# Get student analytics
response = requests.get('/student-flow/api/analytics/', {
    'date_from': '2024-01-01',
    'date_to': '2024-01-31'
})

# Get comprehensive statistics
stats = requests.get('/student-flow/api/stats/')
```

## 🏆 Achievement System

### Achievement Types

#### Completion Achievements
- Course completion badges
- Milestone achievements
- Learning path completion

#### Performance Achievements
- Perfect quiz scores
- High assignment grades
- Consistent high performance

#### Engagement Achievements
- Study streaks (7, 30, 100, 365 days)
- Active participation in study groups
- Resource sharing and collaboration

#### Special Achievements
- First course completed
- Early adopter badges
- Community contribution awards

### Custom Achievement Creation

```python
from student_flow.models import StudentAchievement

# Create custom achievement
achievement = StudentAchievement.objects.create(
    student=student,
    achievement_type='special',
    title='Python Master',
    description='Completed all Python programming courses',
    badge_icon='python-logo',
    badge_color='#3776ab',
    points_earned=500,
    criteria_met={
        'courses_completed': ['intro-python', 'advanced-python', 'python-projects'],
        'average_grade': 85.0
    }
)
```

## 📱 Mobile & Frontend Integration

### REST API Design

The API is designed to be mobile-friendly with:
- Consistent JSON responses
- Proper HTTP status codes
- Pagination for large datasets
- Filtering and search capabilities
- Comprehensive error handling

### Frontend Integration Example

```javascript
// Fetch student dashboard
const dashboard = await fetch('/student-flow/api/dashboard/', {
  headers: {
    'Authorization': 'Token your-auth-token',
    'Content-Type': 'application/json'
  }
}).then(response => response.json());

// Start learning session
const session = await fetch('/student-flow/api/sessions/', {
  method: 'POST',
  headers: {
    'Authorization': 'Token your-auth-token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    session_type: 'learning_material',
    course_id: 123,
    device_type: 'mobile'
  })
}).then(response => response.json());

// Submit assignment
const submission = await fetch('/student-flow/api/assignments/', {
  method: 'POST',
  headers: {
    'Authorization': 'Token your-auth-token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    task_id: 456,
    course_id: 123,
    content: 'My assignment solution...',
    file_urls: ['https://example.com/my-file.pdf']
  })
}).then(response => response.json());
```

## 🔧 Customization

### Custom Student Profile Fields

```python
# Extend StudentProfile model
from student_flow.models import StudentProfile

class CustomStudentProfile(StudentProfile):
    class Meta:
        proxy = True
    
    # Add custom methods or properties
    @property
    def academic_level(self):
        if self.completed_courses >= 10:
            return 'Advanced'
        elif self.completed_courses >= 5:
            return 'Intermediate'
        return 'Beginner'
```

### Custom Notification Types

```python
from student_flow.models import StudentNotification

# Create custom notification
StudentNotification.objects.create(
    recipient=student,
    notification_type='custom_reminder',
    priority='medium',
    title='Custom Study Reminder',
    message='Time for your weekly Python practice!',
    action_url='/custom-study-path/',
    action_text='Start Studying'
)
```

### Custom Achievement Logic

```python
from student_flow.signals import post_save
from student_flow.models import LearningSession, StudentAchievement

@receiver(post_save, sender=LearningSession)
def check_night_owl_achievement(sender, instance, **kwargs):
    if instance.started_at.hour >= 22:  # After 10 PM
        night_sessions = LearningSession.objects.filter(
            student=instance.student,
            started_at__hour__gte=22
        ).count()
        
        if night_sessions >= 10:
            StudentAchievement.objects.get_or_create(
                student=instance.student,
                achievement_type='engagement',
                title='Night Owl',
                defaults={
                    'description': 'Completed 10 late-night study sessions',
                    'badge_icon': 'moon',
                    'points_earned': 50
                }
            )
```

## 🧪 Testing

### Run Tests

```bash
# Run all student flow tests
python manage.py test student_flow

# Run specific test modules
python manage.py test student_flow.tests.StudentProfileTests
python manage.py test student_flow.tests.StudentDashboardAPITests

# Run with coverage
coverage run --source='.' manage.py test student_flow
coverage report
coverage html  # Generate HTML coverage report
```

### Test Data Factory

```python
import factory
from django.contrib.auth import get_user_model
from student_flow.models import StudentProfile, StudentEnrollment

User = get_user_model()

class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
    
    email = factory.Sequence(lambda n: f'student{n}@example.com')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')

class StudentProfileFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = StudentProfile
    
    user = factory.SubFactory(UserFactory)
    bio = factory.Faker('text', max_nb_chars=200)
    learning_style = factory.Iterator(['visual', 'auditory', 'kinesthetic'])
    preferred_difficulty = factory.Iterator(['beginner', 'intermediate', 'advanced'])
```

## 🚀 Deployment

### Production Settings

```python
# production_settings.py
from .settings import *

# Security settings
DEBUG = False
ALLOWED_HOSTS = ['your-domain.com']

# Database (use PostgreSQL in production)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'student_portal',
        'USER': 'your_db_user',
        'PASSWORD': 'your_db_password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

# Email settings for production
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

# Caching (Redis recommended)
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}

# Celery for background tasks
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
```

### Background Tasks Setup

```python
# celery.py
from celery import Celery
from celery.schedules import crontab

app = Celery('student_portal')
app.config_from_object('django.conf:settings', namespace='CELERY')

# Periodic tasks
app.conf.beat_schedule = {
    'update-daily-analytics': {
        'task': 'student_flow.tasks.update_daily_analytics',
        'schedule': crontab(hour=1, minute=0),  # Run daily at 1 AM
    },
    'send-goal-reminders': {
        'task': 'student_flow.tasks.send_goal_reminders',
        'schedule': crontab(hour=9, minute=0),  # Run daily at 9 AM
    },
    'send-study-reminders': {
        'task': 'student_flow.tasks.send_study_reminders',
        'schedule': crontab(hour=18, minute=0),  # Run daily at 6 PM
    },
}
```

## 📈 Monitoring & Analytics

### Performance Monitoring

```python
# monitoring.py
import logging
from django.db.models.signals import post_save
from django.dispatch import receiver
from student_flow.models import LearningSession

logger = logging.getLogger('student_flow.performance')

@receiver(post_save, sender=LearningSession)
def log_session_performance(sender, instance, **kwargs):
    if instance.status == 'completed':
        logger.info(f'Session completed: {instance.total_duration_minutes}min, '
                   f'Student: {instance.student.id}, '
                   f'Course: {instance.course.id if instance.course else None}')
```

### Error Tracking

```python
# Install Sentry for error tracking
pip install sentry-sdk

# settings.py
import sentry_sdk
from sentry_sdk.integrations.django import DjangoIntegration

sentry_sdk.init(
    dsn="your-sentry-dsn",
    integrations=[DjangoIntegration()],
    traces_sample_rate=0.1,
)
```

## 🎯 Future Roadmap

### Planned Features
- **AI-Powered Recommendations**: Personalized learning path suggestions
- **Advanced Analytics Dashboard**: Rich visualizations and insights
- **Mobile App**: Native iOS and Android applications
- **Offline Support**: Downloadable content for offline studying
- **Peer Tutoring**: Student-to-student tutoring marketplace
- **Learning Streaks**: Advanced gamification and social challenges
- **Integration APIs**: LTI compliance and third-party integrations
- **Advanced Notifications**: Push notifications and SMS integration

### Performance Improvements
- **Caching Layer**: Redis-based caching for improved performance
- **Database Optimization**: Query optimization and indexing strategies
- **CDN Integration**: Content delivery network for media files
- **API Rate Limiting**: Advanced rate limiting and throttling

### Security Enhancements
- **Two-Factor Authentication**: Enhanced account security
- **GDPR Compliance**: Data privacy and deletion capabilities
- **Advanced Permissions**: Fine-grained access control
- **Audit Logging**: Comprehensive activity tracking

## 🤝 Contributing

### Development Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd student-flow

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install development dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create test data
python manage.py loaddata fixtures/test_data.json

# Run development server
python manage.py runserver
```

### Code Style

- Follow PEP 8 for Python code
- Use meaningful variable and function names
- Add docstrings to all functions and classes
- Write comprehensive tests for new features
- Use type hints where appropriate

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with tests
4. Run the test suite (`python manage.py test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Email: support@yourschool.edu
- Documentation: [Link to your documentation site]

---

**Student Flow Django App** - Empowering students with comprehensive learning management and progress tracking tools. 