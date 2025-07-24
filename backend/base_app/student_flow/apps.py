from django.apps import AppConfig


class StudentFlowConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'student_flow'
    verbose_name = 'Student Flow'

    def ready(self):
        import student_flow.signals 