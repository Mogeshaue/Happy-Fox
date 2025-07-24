from django.apps import AppConfig


class AdminFlowConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'admin_flow'
    verbose_name = 'Admin Flow'

    def ready(self):
        import admin_flow.signals 