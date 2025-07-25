from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'admin_flow'

# Router for ViewSets
router = DefaultRouter()
router.register(r'courses', views.CourseManagementView, basename='course')
router.register(r'tasks', views.TaskManagementView, basename='task')
router.register(r'notifications', views.AdminNotificationView, basename='notification')
router.register(r'system-config', views.SystemConfigurationView, basename='system-config')

urlpatterns = [
    # Include router URLs
    path('api/', include(router.urls)),

    # Dashboard URLs
    path('api/dashboard/', views.AdminDashboardView.as_view(), name='admin-dashboard'),

    # Organization Management URLs
    path('api/organizations/', views.OrganizationManagementView.as_view(), name='organization-list'),
    path('api/organizations/<int:pk>/', views.OrganizationDetailView.as_view(), name='organization-detail'),
    path('api/organizations/<int:org_id>/stats/', views.OrganizationStatsView.as_view(), name='organization-stats'),

    # User Management URLs
    path('api/users/', views.UserManagementView.as_view(), name='user-list'),
    path('api/users/<int:pk>/', views.UserDetailView.as_view(), name='user-detail'),

    # Content Management URLs
    path('api/content/', views.ContentManagementView.as_view(), name='content-overview'),

    # Analytics URLs
    path('api/analytics/', views.AnalyticsView.as_view(), name='analytics'),

    # Bulk Operations URLs
    path('api/bulk/import-users/', views.BulkUserImportView.as_view(), name='bulk-import-users'),
    path('api/bulk/enrollment/', views.BulkEnrollmentView.as_view(), name='bulk-enrollment'),
    path('api/bulk/export/', views.DataExportView.as_view(), name='data-export'),

    # Content Generation URLs
    path('api/generate/', views.ContentGenerationView.as_view(), name='content-generation'),
    path('api/generate/<uuid:job_id>/status/', views.ContentGenerationStatusView.as_view(), name='generation-status'),

    # Notification Management URLs
    path('api/notifications/mark-all-read/', views.mark_all_notifications_read, name='mark-all-notifications-read'),

    # Admin Actions Log URLs
    path('api/actions/', views.AdminActionView.as_view(), name='admin-actions'),
] 