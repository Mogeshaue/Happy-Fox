# Admin Flow Django App

A comprehensive Django application for managing all administrative operations in educational platforms. This app provides a complete admin interface with user management, content management, analytics, bulk operations, AI-powered content generation, and more.

## 🚀 Features

### Core Administrative Functionality
- **Admin Dashboard**: Comprehensive overview with key metrics, recent activities, and system alerts
- **Organization Management**: Full CRUD operations for organizations with billing and limits management
- **User Management**: Advanced user management with roles, permissions, and bulk operations
- **Content Management**: Complete content lifecycle management for courses, tasks, and questions
- **Analytics & Reporting**: Detailed analytics with custom date ranges and export capabilities
- **Audit Logging**: Complete audit trail of all administrative actions
- **Notification System**: Real-time notifications for admins with email integration
- **System Configuration**: Flexible system-wide and organization-specific configuration management

### Advanced Features
- **AI Content Generation**: Integrated AI-powered content creation with job tracking
- **Bulk Operations**: Import/export users, bulk enrollments, and data migrations
- **Role-Based Access Control**: Granular permissions system with multiple admin roles
- **Multi-Organization Support**: Manage multiple organizations with isolated data
- **Customizable Dashboard**: Widget-based dashboard with drag-and-drop customization
- **Content Templates**: Reusable templates for courses, tasks, and assessments

### Admin Roles Supported
- **Super Admin**: Full system access across all organizations
- **Organization Admin**: Full access within specific organizations
- **Content Admin**: Specialized access for content creation and management
- **Support Admin**: Access for user support and troubleshooting

## 📋 Key Models

### Core Models

#### AdminProfile
Extended profile for admin users with role-based permissions:
- Role hierarchy (Super Admin, Org Admin, Content Admin, Support Admin)
- Organization assignments and custom permissions
- Contact information and security tracking
- Performance metrics and activity monitoring

#### Organization
Enhanced organization model with admin-specific features:
- Billing tiers and user limits
- Storage quotas and API rate limiting
- Custom branding and configuration
- Activity monitoring and alerts

#### AdminAction
Comprehensive audit logging system:
- Complete action tracking with context
- IP address and user agent logging
- Detailed action descriptions and metadata
- Security monitoring and alerts

#### ContentGenerationJob
AI-powered content creation tracking:
- Job status and progress monitoring
- Input/output data management
- Error handling and retry logic
- Completion notifications

#### AdminNotification
Advanced notification system:
- Multiple notification types and priorities
- Email integration and read receipts
- Expiration dates and action URLs
- Rich metadata support

#### AdminAnalytics
Comprehensive analytics system:
- Daily metrics aggregation
- User, content, and engagement analytics
- System performance metrics
- AI usage and cost tracking

#### BulkOperation
Bulk operation management:
- Progress tracking and error handling
- File upload/download support
- Operation history and results
- Retry and resume capabilities

## 🛠 Installation

### 1. Copy the Admin Flow App

Copy the entire `admin_flow` directory to your Django project:

```bash
cp -r admin_flow/ /path/to/your/django/project/
```

### 2. Install Dependencies

Install the required packages:

```bash
pip install -r admin_flow/requirements.txt
```

### 3. Django Settings Configuration

Add to your `INSTALLED_APPS` in `settings.py`:

```python
INSTALLED_APPS = [
    # ... your existing apps
    'rest_framework',
    'django_filters',
    'admin_flow',
]

# REST Framework configuration
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework_simplejwt.authentication.JWTAuthentication',  # Optional
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

# Admin Flow specific settings
SEND_ADMIN_EMAILS = True  # Enable email notifications
DEFAULT_FROM_EMAIL = 'admin@yourplatform.com'

# Optional: Celery configuration for background tasks
CELERY_BROKER_URL = 'redis://localhost:6379/0'
CELERY_RESULT_BACKEND = 'redis://localhost:6379/0'
```

### 4. URL Configuration

Include the admin flow URLs in your main `urls.py`:

```python
from django.urls import path, include

urlpatterns = [
    # ... your existing URLs
    path('admin-flow/', include('admin_flow.urls')),
]
```

### 5. Database Migration

Run migrations to create the necessary database tables:

```bash
python manage.py makemigrations admin_flow
python manage.py migrate
```

### 6. Create Initial Admin User

Create your first super admin:

```python
# In Django shell (python manage.py shell)
from django.contrib.auth import get_user_model
from admin_flow.models import AdminProfile

User = get_user_model()

# Create user
admin_user = User.objects.create_user(
    email='admin@yourplatform.com',
    first_name='Admin',
    last_name='User',
    password='your_secure_password'
)

# Create admin profile
AdminProfile.objects.create(
    user=admin_user,
    role=AdminProfile.Role.SUPER_ADMIN,
    is_active=True,
    permissions=[
        'manage_organizations',
        'manage_users',
        'manage_content',
        'view_analytics',
        'system_config',
        'bulk_operations'
    ]
)
```

## 🔧 Configuration

### Model Integration

The admin flow expects these models to exist in your project. Update the imports in `admin_flow/models.py` to match your existing models:

```python
# Replace the placeholder models with your actual models
from your_app.models import User, Organization, Cohort, Course, Task
```

### Email Configuration

Configure email settings for notifications:

```python
# Email backend configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'your-smtp-host.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = 'your-email@example.com'
EMAIL_HOST_PASSWORD = 'your-email-password'
DEFAULT_FROM_EMAIL = 'Admin System <admin@yourplatform.com>'
```

### Storage Configuration

For file uploads and exports:

```python
# Media files configuration
MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# Optional: Use AWS S3 for production
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
AWS_STORAGE_BUCKET_NAME = 'your-bucket-name'
```

## 🌐 API Endpoints

### Dashboard & Overview
- `GET /admin-flow/api/dashboard/` - Main admin dashboard
- `GET /admin-flow/api/organizations/{id}/stats/` - Organization statistics

### Organization Management
- `GET /admin-flow/api/organizations/` - List organizations
- `POST /admin-flow/api/organizations/` - Create organization (Super Admin only)
- `GET /admin-flow/api/organizations/{id}/` - Organization details
- `PATCH /admin-flow/api/organizations/{id}/` - Update organization
- `DELETE /admin-flow/api/organizations/{id}/` - Delete organization

### User Management
- `GET /admin-flow/api/users/` - List users with filtering and search
- `POST /admin-flow/api/users/` - Create user
- `GET /admin-flow/api/users/{id}/` - User details
- `PATCH /admin-flow/api/users/{id}/` - Update user
- `DELETE /admin-flow/api/users/{id}/` - Delete user

### Content Management
- `GET /admin-flow/api/content/` - Content overview
- `GET /admin-flow/api/courses/` - List courses
- `POST /admin-flow/api/courses/` - Create course
- `GET /admin-flow/api/courses/{id}/` - Course details
- `PATCH /admin-flow/api/courses/{id}/` - Update course
- `DELETE /admin-flow/api/courses/{id}/` - Delete course
- `GET /admin-flow/api/tasks/` - List tasks
- `POST /admin-flow/api/tasks/` - Create task
- `GET /admin-flow/api/tasks/{id}/` - Task details
- `PATCH /admin-flow/api/tasks/{id}/` - Update task

### Analytics & Reporting
- `GET /admin-flow/api/analytics/` - Analytics data with date filtering
- `GET /admin-flow/api/analytics/?date_from=2024-01-01&date_to=2024-01-31`
- `GET /admin-flow/api/analytics/?organization={org_id}`

### Bulk Operations
- `POST /admin-flow/api/bulk/import-users/` - Bulk user import from CSV
- `POST /admin-flow/api/bulk/enrollment/` - Bulk enrollment operations
- `POST /admin-flow/api/bulk/export/` - Data export operations

### Content Generation (AI)
- `POST /admin-flow/api/generate/` - Start content generation
- `GET /admin-flow/api/generate/{job_id}/status/` - Check generation status

### Notifications
- `GET /admin-flow/api/notifications/` - List notifications
- `PATCH /admin-flow/api/notifications/{id}/` - Update notification
- `POST /admin-flow/api/notifications/mark-all-read/` - Mark all as read

### System Configuration
- `GET /admin-flow/api/system-config/` - List configurations
- `POST /admin-flow/api/system-config/` - Create configuration
- `PATCH /admin-flow/api/system-config/{id}/` - Update configuration

### Audit Logging
- `GET /admin-flow/api/actions/` - Admin actions log
- `GET /admin-flow/api/actions/?action_type=create`
- `GET /admin-flow/api/actions/?date_from=2024-01-01`

## 🔐 Permissions System

### Built-in Permission Classes

#### Basic Permissions
- `IsAdminUser` - User must have an AdminProfile
- `IsSuperAdmin` - Super admin access only
- `IsOrgAdmin` - Organization admin access
- `IsContentAdmin` - Content admin access
- `IsSupportAdmin` - Support admin access

#### Object-Level Permissions
- `CanManageOrganization` - Manage specific organizations
- `CanManageUsers` - Manage users within organizations
- `CanManageContent` - Manage content within organizations
- `CanViewAnalytics` - View analytics data
- `CanPerformBulkOperations` - Execute bulk operations
- `CanGenerateContent` - Access AI content generation
- `CanManageSystemConfig` - System configuration access

#### Compound Permissions
- `AdminOrOrgOwner` - Admin or organization owner
- `ReadOnlyForNonAdmins` - Read-only for non-admins
- `OrganizationScopedPermission` - Base class for org-scoped resources

### Custom Permission Usage

```python
from admin_flow.permissions import IsOrgAdmin, CanManageUsers

class MyAdminView(APIView):
    permission_classes = [IsOrgAdmin, CanManageUsers]
    
    def get(self, request):
        # Your view logic here
        pass
```

## 📊 Analytics System

### Automatic Analytics Collection

The system automatically collects daily analytics for each organization:

- **User Metrics**: Total users, new users, active users
- **Content Metrics**: Total courses, new courses, total tasks
- **Engagement Metrics**: Session data, completion rates
- **System Metrics**: API calls, storage usage, error counts
- **AI Metrics**: Content generations, API usage, costs

### Manual Analytics Update

Use the management command to update analytics:

```bash
# Update analytics for all organizations
python manage.py update_admin_analytics

# Update for specific date
python manage.py update_admin_analytics --date 2024-01-15

# Update for specific organization
python manage.py update_admin_analytics --org-id 123

# Force update (overwrite existing data)
python manage.py update_admin_analytics --force
```

### Analytics API Usage

```python
# Get analytics data
response = requests.get('/admin-flow/api/analytics/', {
    'date_from': '2024-01-01',
    'date_to': '2024-01-31',
    'organization': 123
})

analytics_data = response.json()
print(f"Total users: {analytics_data['totals']['total_users']}")
```

## 🔄 Bulk Operations

### User Import

Import users from CSV file:

```python
import requests

files = {'file': open('users.csv', 'rb')}
data = {
    'organization': 123,
    'default_role': 'member',
    'send_welcome_email': True,
    'auto_enroll_cohorts': [456, 789]  # Optional cohort IDs
}

response = requests.post('/admin-flow/api/bulk/import-users/', 
                        files=files, data=data)
operation_id = response.json()['operation_id']
```

### Bulk Enrollment

Enroll multiple users into multiple cohorts:

```python
data = {
    'users': [123, 456, 789],
    'cohorts': [10, 20],
    'role': 'learner',
    'send_notification': True
}

response = requests.post('/admin-flow/api/bulk/enrollment/', json=data)
```

### Data Export

Export data in various formats:

```python
data = {
    'export_type': 'users',  # 'users', 'courses', 'completions', 'analytics'
    'organization': 123,
    'format': 'csv',  # 'csv' or 'json'
    'date_from': '2024-01-01',  # Optional
    'date_to': '2024-01-31',    # Optional
    'include_deleted': False
}

response = requests.post('/admin-flow/api/bulk/export/', json=data)
# Returns file download or error message
```

## 🤖 AI Content Generation

### Course Generation

Generate complete course structure using AI:

```python
data = {
    'type': 'course',
    'course_name': 'Introduction to Python',
    'course_description': 'A comprehensive course for Python beginners',
    'intended_audience': 'Programming beginners',
    'difficulty_level': 'beginner',
    'estimated_weeks': 8,
    'learning_objectives': [
        'Understand Python syntax',
        'Build simple applications',
        'Learn best practices'
    ],
    'organization': 123
}

response = requests.post('/admin-flow/api/generate/', json=data)
job_id = response.json()['job_id']

# Check status
status_response = requests.get(f'/admin-flow/api/generate/{job_id}/status/')
print(status_response.json()['status'])  # 'pending', 'in_progress', 'completed'
```

### Task Generation

Generate individual tasks:

```python
data = {
    'type': 'task',
    'task_type': 'learning_material',
    'title': 'Python Variables and Data Types',
    'description': 'Learn about variables and basic data types in Python',
    'course': 456,
    'difficulty_level': 'beginner',
    'estimated_time': 30,
    'context': 'This is part of an introductory Python course'
}

response = requests.post('/admin-flow/api/generate/', json=data)
```

### Quiz Generation

Generate quiz questions:

```python
data = {
    'type': 'quiz',
    'task': 789,
    'num_questions': 10,
    'question_types': ['multiple_choice', 'true_false', 'short_answer'],
    'difficulty_distribution': {
        'easy': 4,
        'medium': 4,
        'hard': 2
    }
}

response = requests.post('/admin-flow/api/generate/', json=data)
```

## 🔔 Notification System

### Automatic Notifications

The system automatically creates notifications for:

- New user signups
- Content publication
- Content generation completion
- System alerts and errors
- Billing and limit warnings
- Security events

### Email Integration

Configure email notifications:

```python
# settings.py
SEND_ADMIN_EMAILS = True
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
DEFAULT_FROM_EMAIL = 'Admin System <admin@yourplatform.com>'
```

### Manual Notification Creation

```python
from admin_flow.models import AdminNotification

AdminNotification.objects.create(
    recipient=admin_user,
    notification_type=AdminNotification.Type.SYSTEM_ALERT,
    priority=AdminNotification.Priority.HIGH,
    title='Custom Alert',
    message='This is a custom notification',
    organization=organization,
    action_url='/admin/some-action/',
    metadata={'custom_data': 'value'}
)
```

## 🎛 Django Admin Interface

### Admin Features

The Django admin interface provides:

- **User Management**: Enhanced user admin with organization relationships
- **Organization Management**: Complete organization CRUD with metrics
- **Content Management**: Course and task management with inline editing
- **Analytics Dashboard**: Visual analytics data with charts
- **Audit Log**: Searchable admin action history
- **Notification Management**: Bulk notification management
- **System Configuration**: Easy configuration management

### Admin Customizations

- Custom list filters for organizations and roles
- Inline editing for related models
- Readonly fields for calculated values
- Bulk actions for common operations
- Custom admin actions for administrative tasks

### Accessing the Admin

1. Create a superuser:
```bash
python manage.py createsuperuser
```

2. Create admin profile:
```python
from admin_flow.models import AdminProfile
AdminProfile.objects.create(
    user=your_superuser,
    role=AdminProfile.Role.SUPER_ADMIN,
    is_active=True
)
```

3. Access at: `http://yoursite.com/admin/admin_flow/`

## 🧪 Testing

### Running Tests

```bash
# Run all admin flow tests
python manage.py test admin_flow

# Run specific test categories
python manage.py test admin_flow.tests.AdminProfileTests
python manage.py test admin_flow.tests.AdminFlowAPITests

# Run with coverage
coverage run --source='admin_flow' manage.py test admin_flow
coverage report
coverage html  # Generate HTML report
```

### Test Categories

- **Model Tests**: Test all model functionality and relationships
- **API Tests**: Test all API endpoints with proper authentication
- **Permission Tests**: Test role-based access control
- **Signal Tests**: Test automatic notifications and analytics
- **Integration Tests**: Test complete workflows

### Sample Test Usage

```python
from admin_flow.tests import AdminFlowTestCase

class MyCustomTests(AdminFlowTestCase):
    def test_custom_functionality(self):
        # Use pre-created test data from AdminFlowTestCase
        self.assertTrue(self.super_admin_profile.is_active)
        self.assertEqual(self.org.current_user_count, 2)
```

## 🚀 Deployment

### Production Settings

```python
# Additional production settings
SECURE_SSL_REDIRECT = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Rate limiting
RATELIMIT_ENABLE = True

# Monitoring
import sentry_sdk
sentry_sdk.init(dsn="your-sentry-dsn")

# Background tasks
CELERY_ALWAYS_EAGER = False  # Enable actual async processing
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yoursite.com;
    
    location /admin-flow/api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    location /media/ {
        alias /path/to/your/media/;
    }
}
```

### Celery Configuration

For background tasks (content generation, bulk operations):

```python
# celery.py
from celery import Celery
import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'your_project.settings')

app = Celery('your_project')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
```

### Monitoring Setup

```bash
# Start Celery worker
celery -A your_project worker -l info

# Start Celery beat (for periodic tasks)
celery -A your_project beat -l info

# Monitor with Flower
pip install flower
celery -A your_project flower
```

## 🎨 Customization

### Extending Models

```python
from admin_flow.models import AdminProfile

class CustomAdminProfile(AdminProfile):
    class Meta:
        proxy = True
    
    def custom_method(self):
        # Your custom logic
        pass
```

### Custom Permissions

```python
from admin_flow.permissions import IsAdminUser

class CustomAdminPermission(IsAdminUser):
    def has_permission(self, request, view):
        base_permission = super().has_permission(request, view)
        # Add your custom logic
        return base_permission and your_custom_condition(request.user)
```

### Custom Views

```python
from admin_flow.views import AdminDashboardView

class CustomDashboardView(AdminDashboardView):
    def get(self, request):
        data = super().get(request).data
        # Add custom dashboard data
        data['custom_metrics'] = self.get_custom_metrics()
        return Response(data)
```

### Custom Signals

```python
from django.db.models.signals import post_save
from django.dispatch import receiver
from admin_flow.models import AdminAction

@receiver(post_save, sender=AdminAction)
def custom_action_handler(sender, instance, created, **kwargs):
    if created and instance.action_type == 'custom_action':
        # Your custom logic
        pass
```

## 📚 Advanced Usage

### Custom Dashboard Widgets

```python
from admin_flow.models import AdminDashboardWidget

# Create custom widget
widget = AdminDashboardWidget.objects.create(
    admin=admin_user,
    organization=organization,
    widget_type=AdminDashboardWidget.WidgetType.CHART,
    title='Custom Analytics',
    position_x=0,
    position_y=0,
    width=2,
    height=2,
    configuration={
        'chart_type': 'line',
        'data_source': 'custom_analytics',
        'time_range': '30d'
    },
    data_source='custom_analytics_endpoint'
)
```

### Content Templates

```python
from admin_flow.models import ContentTemplate

# Create course template
template = ContentTemplate.objects.create(
    name='Standard Programming Course',
    type=ContentTemplate.Type.COURSE,
    description='Template for programming courses',
    template_data={
        'structure': {
            'modules': [
                {'name': 'Introduction', 'duration_weeks': 1},
                {'name': 'Fundamentals', 'duration_weeks': 3},
                {'name': 'Advanced Topics', 'duration_weeks': 2},
                {'name': 'Projects', 'duration_weeks': 2}
            ]
        },
        'default_settings': {
            'difficulty_level': 'beginner',
            'estimated_hours_per_week': 10
        }
    },
    organization=organization,
    created_by=admin_user
)
```

### Integration with External APIs

```python
# Custom content generation with external AI API
from admin_flow.models import ContentGenerationJob

def custom_ai_generation(job_id):
    job = ContentGenerationJob.objects.get(uuid=job_id)
    
    try:
        job.status = ContentGenerationJob.Status.IN_PROGRESS
        job.save()
        
        # Call your AI API
        ai_response = your_ai_api.generate_content(job.input_data)
        
        job.output_data = ai_response
        job.status = ContentGenerationJob.Status.COMPLETED
        job.completed_at = timezone.now()
        job.save()
        
    except Exception as e:
        job.status = ContentGenerationJob.Status.FAILED
        job.error_message = str(e)
        job.save()
```

## 🔧 Troubleshooting

### Common Issues

1. **Migration Errors**: Ensure your existing models match the expected structure
2. **Permission Denied**: Check admin profile creation and role assignments
3. **Email Not Sending**: Verify email backend configuration
4. **Celery Tasks Not Running**: Check Celery worker status and Redis connection

### Debug Mode

Enable detailed logging:

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'DEBUG',
            'class': 'logging.FileHandler',
            'filename': 'admin_flow.log',
        },
    },
    'loggers': {
        'admin_flow': {
            'handlers': ['file'],
            'level': 'DEBUG',
            'propagate': True,
        },
    },
}
```

### Performance Optimization

```python
# Database optimization
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'OPTIONS': {
            'MAX_CONNS': 20,
            'CONN_MAX_AGE': 3600,
        }
    }
}

# Caching
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.redis.RedisCache',
        'LOCATION': 'redis://127.0.0.1:6379/1',
        'OPTIONS': {
            'CLIENT_CLASS': 'django_redis.client.DefaultClient',
        }
    }
}
```

## 🗺 Roadmap

### Planned Features

- **Advanced Analytics**: Machine learning insights and predictions
- **Mobile App Support**: React Native admin app
- **Multi-language Support**: Internationalization and localization
- **Advanced Reporting**: Custom report builder with scheduling
- **Integration Marketplace**: Pre-built integrations with popular tools
- **Workflow Automation**: Visual workflow builder for admin tasks
- **Advanced Security**: Two-factor authentication and SSO integration

### Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

This admin flow app is designed to be integrated into your Django project. Ensure compliance with your project's license requirements.

## 🆘 Support

### Documentation
- API documentation: `/admin-flow/api/docs/` (if using drf-spectacular)
- Model documentation: See docstrings in `models.py`
- Test examples: See `tests.py` for usage patterns

### Getting Help
1. Check the test cases for usage examples
2. Review the Django admin interface for data relationships
3. Examine the API endpoints using Django REST framework browsable API
4. Check the logs for detailed error information

---

**🎉 Congratulations!** You now have a comprehensive admin flow system that can handle all administrative operations for your educational platform. The system is designed to be scalable, secure, and easily customizable to meet your specific needs. 