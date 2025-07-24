from django.core.management.base import BaseCommand
from django.utils import timezone
from admin_flow.signals import update_daily_admin_analytics
from admin_flow.models import Organization, AdminAnalytics


class Command(BaseCommand):
    help = 'Update daily admin analytics for all organizations'

    def add_arguments(self, parser):
        parser.add_argument(
            '--date',
            type=str,
            help='Date to update analytics for (YYYY-MM-DD format). Defaults to today.',
        )

        parser.add_argument(
            '--org-id',
            type=int,
            help='Update analytics for specific organization ID only',
        )

        parser.add_argument(
            '--org-slug',
            type=str,
            help='Update analytics for specific organization slug only',
        )

        parser.add_argument(
            '--force',
            action='store_true',
            help='Force update even if analytics already exist for the date',
        )

    def handle(self, *args, **options):
        date_str = options.get('date')
        org_id = options.get('org_id')
        org_slug = options.get('org_slug')
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

        # Filter organizations
        organizations = Organization.objects.filter(is_active=True)
        
        if org_id:
            organizations = organizations.filter(id=org_id)
            self.stdout.write(f'Updating analytics for organization ID: {org_id}')
        elif org_slug:
            organizations = organizations.filter(slug=org_slug)
            self.stdout.write(f'Updating analytics for organization slug: {org_slug}')

        if not organizations.exists():
            self.stdout.write(
                self.style.WARNING('No organizations found matching criteria')
            )
            return

        updated_count = 0
        skipped_count = 0

        try:
            for org in organizations:
                # Check if analytics already exist for this date
                if not force and AdminAnalytics.objects.filter(
                    organization=org, 
                    date=target_date
                ).exists():
                    self.stdout.write(
                        self.style.WARNING(
                            f'Analytics already exist for {org.name} on {target_date}, skipping'
                        )
                    )
                    skipped_count += 1
                    continue

                # Update analytics for this organization
                self.update_organization_analytics(org, target_date)
                updated_count += 1
                
                self.stdout.write(
                    self.style.SUCCESS(f'Updated analytics for {org.name}')
                )

            # Summary
            self.stdout.write(
                self.style.SUCCESS(
                    f'Analytics update completed. Updated: {updated_count}, Skipped: {skipped_count}'
                )
            )

        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error updating admin analytics: {str(e)}')
            )

    def update_organization_analytics(self, org, target_date):
        """Update analytics for a specific organization and date"""
        from admin_flow.models import (
            UserOrganization, User, Course, Task, TaskCompletion, 
            ContentGenerationJob
        )
        from datetime import timedelta

        analytics, created = AdminAnalytics.objects.get_or_create(
            organization=org,
            date=target_date,
            defaults={}
        )

        # User metrics
        total_users = UserOrganization.objects.filter(org=org).count()
        new_users_on_date = UserOrganization.objects.filter(
            org=org,
            created_at__date=target_date
        ).count()

        # Active users (logged in within last 30 days from target date)
        active_cutoff = timezone.datetime.combine(target_date, timezone.datetime.min.time()) - timedelta(days=30)
        active_users = User.objects.filter(
            userorganization__org=org,
            last_login__gte=active_cutoff
        ).distinct().count()

        # Content metrics
        total_courses = Course.objects.filter(org=org).count()
        new_courses_on_date = Course.objects.filter(
            org=org,
            created_at__date=target_date
        ).count()
        total_tasks = Task.objects.filter(org=org).count()

        # Engagement metrics
        completions_on_date = TaskCompletion.objects.filter(
            task__org=org,
            completed_at__date=target_date
        ).count()

        # Calculate completion rate
        total_completions = TaskCompletion.objects.filter(task__org=org).count()
        enrolled_users = User.objects.filter(
            userorganization__org=org,
            userorganization__role='learner'
        ).distinct().count()

        total_possible = total_tasks * enrolled_users
        completion_rate = (total_completions / total_possible * 100) if total_possible > 0 else 0

        # AI metrics
        ai_generations_on_date = ContentGenerationJob.objects.filter(
            organization=org,
            started_at__date=target_date,
            status=ContentGenerationJob.Status.COMPLETED
        ).count()

        # Update analytics
        analytics.total_users = total_users
        analytics.new_users = new_users_on_date
        analytics.active_users = active_users
        analytics.total_courses = total_courses
        analytics.new_courses = new_courses_on_date
        analytics.total_tasks = total_tasks
        analytics.total_sessions = completions_on_date  # Using completions as session proxy
        analytics.completion_rate = completion_rate
        analytics.content_generations = ai_generations_on_date
        
        # Placeholder metrics (implement based on your infrastructure)
        analytics.api_calls = 0
        analytics.storage_used_gb = 0.0
        analytics.error_count = 0
        analytics.ai_api_calls = 0
        analytics.ai_cost_usd = 0.0
        
        analytics.save() 