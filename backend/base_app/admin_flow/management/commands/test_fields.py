"""
Minimal sample data generator for testing field compatibility
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from admin_flow.models import (
    User, Organization, UserOrganization, AdminProfile
)


class Command(BaseCommand):
    help = 'Test data creation to verify field compatibility'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Testing field compatibility...'))
        
        try:
            with transaction.atomic():
                # Test organization creation
                org = Organization.objects.create(
                    slug='test-org-compatibility',
                    name='Test Organization for Fields',
                    default_logo_color='#2196F3'
                )
                self.stdout.write('✅ Organization created successfully')

                # Test user creation
                user = User.objects.create(
                    email='test@compatibility.com',
                    first_name='Test',
                    last_name='User'
                )
                self.stdout.write('✅ User created successfully')

                # Test UserOrganization creation
                user_org = UserOrganization.objects.create(
                    user=user,
                    org=org,
                    role='admin'
                )
                self.stdout.write('✅ UserOrganization created successfully')

                # Test AdminProfile creation
                admin_profile = AdminProfile.objects.create(
                    user=user,
                    role=AdminProfile.Role.ORG_ADMIN,
                    permissions=['test_permission'],
                    is_active=True
                )
                self.stdout.write('✅ AdminProfile created successfully')

                # Test adding organization to admin
                admin_profile.organizations.add(org)
                self.stdout.write('✅ Organization added to AdminProfile successfully')

                self.stdout.write(
                    self.style.SUCCESS('All field compatibility tests passed! ✅')
                )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Field compatibility test failed: {str(e)}')
            )
