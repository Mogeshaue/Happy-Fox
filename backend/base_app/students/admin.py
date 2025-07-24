from django.contrib import admin
from .models import Student, Course, Cohort, Team, Invitation

@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ('email', 'first_name', 'last_name', 'created_at', 'updated_at')
    search_fields = ('email', 'first_name', 'last_name')
    list_filter = ('created_at', 'updated_at')
    readonly_fields = ('created_at', 'updated_at')
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('email', 'first_name', 'middle_name', 'last_name')
        }),
        ('Profile Settings', {
            'fields': ('default_dp_color',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related()

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('name', 'description', 'created_at')
    search_fields = ('name',)
    list_filter = ('created_at',)
    ordering = ('-created_at',)

@admin.register(Cohort)
class CohortAdmin(admin.ModelAdmin):
    list_display = ('name', 'course', 'start_date', 'end_date')
    search_fields = ('name', 'course__name')
    list_filter = ('course', 'start_date', 'end_date')
    ordering = ('-start_date',)

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ('name', 'cohort')
    search_fields = ('name', 'cohort__name')
    list_filter = ('cohort',)
    ordering = ('name',)

@admin.register(Invitation)
class InvitationAdmin(admin.ModelAdmin):
    list_display = ('email', 'team', 'invited_by', 'accepted', 'created_at')
    search_fields = ('email', 'team__name', 'invited_by__username')
    list_filter = ('accepted', 'created_at', 'team')
    ordering = ('-created_at',)
