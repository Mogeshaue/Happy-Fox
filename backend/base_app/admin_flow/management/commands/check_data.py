"""
Check what sample data exists in the database
"""
from django.core.management.base import BaseCommand
from admin_flow.models import (
    User, Organization, UserOrganization, Course, Task, 
    AdminProfile, Cohort, TaskCompletion
)


class Command(BaseCommand):
    help = 'Check current sample data in database'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Current Database Status:'))
        
        # Check counts
        counts = {
            'Organizations': Organization.objects.count(),
            'Users': User.objects.count(),
            'UserOrganizations': UserOrganization.objects.count(),
            'AdminProfiles': AdminProfile.objects.count(),
            'Cohorts': Cohort.objects.count(),
            'Courses': Course.objects.count(),
            'Tasks': Task.objects.count(),
            'TaskCompletions': TaskCompletion.objects.count(),
        }
        
        for model_name, count in counts.items():
            if count > 0:
                self.stdout.write(f'✅ {model_name}: {count}')
            else:
                self.stdout.write(f'❌ {model_name}: {count}')
        
        # Show sample data
        if Organization.objects.exists():
            self.stdout.write('\n📋 Sample Organizations:')
            for org in Organization.objects.all()[:3]:
                self.stdout.write(f'  - {org.name} (slug: {org.slug})')
        
        if User.objects.exists():
            self.stdout.write('\n👥 Sample Users:')
            for user in User.objects.all()[:5]:
                is_admin = hasattr(user, 'admin_profile')
                admin_text = ' [ADMIN]' if is_admin else ''
                self.stdout.write(f'  - {user.email}{admin_text}')
        
        if Course.objects.exists():
            self.stdout.write('\n📚 Sample Courses:')
            for course in Course.objects.all()[:3]:
                self.stdout.write(f'  - {course.name} ({course.org.name})')
                
        self.stdout.write('\n✨ Database check complete!')
