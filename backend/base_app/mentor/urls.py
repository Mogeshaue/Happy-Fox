from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'mentor_flow'

# Router for ViewSets (if any)
router = DefaultRouter()

urlpatterns = [
    # Include router URLs
    path('api/', include(router.urls)),
    
    # Mentor Profile URLs
    path('api/mentor-profiles/', views.mentor_profile_list, name='mentor-profile-list'),
    path('api/mentor-profiles/<int:pk>/', views.mentor_profile_detail, name='mentor-profile-detail'),
    path('api/mentor-profiles/create/', views.create_mentor_profile, name='mentor-profile-create'),
    path('api/mentor-profiles/me/', views.mentor_profile_detail, name='my-mentor-profile'),
    
    # Mentorship Assignment URLs
    path('api/assignments/', views.mentorship_assignment_list, name='assignment-list'),
    path('api/assignments/<int:pk>/', views.mentorship_assignment_detail, name='assignment-detail'),
    path('api/assignments/<int:assignment_id>/activate/', views.activate_assignment, name='assignment-activate'),
    
    # Session URLs
    path('api/sessions/', views.mentor_session_list, name='session-list'),
    path('api/sessions/<int:pk>/', views.mentor_session_detail, name='session-detail'),
    
    # Message URLs
    path('api/messages/', views.mentor_message_list, name='message-list'),
    path('api/messages/<int:message_id>/read/', views.mark_message_as_read, name='message-mark-read'),
    
    # Progress URLs
    path('api/progress/', views.student_progress_list, name='progress-list'),
    
    # Feedback URLs
    path('api/feedback/', views.mentor_feedback_list, name='feedback-list'),
    path('api/feedback/<int:feedback_id>/acknowledge/', views.acknowledge_feedback, name='feedback-acknowledge'),
    
    # Goals URLs
    path('api/goals/', views.mentorship_goal_list, name='goal-list'),
    path('api/goals/<int:goal_id>/complete/', views.complete_goal, name='goal-complete'),
    
    # Notification URLs
    path('api/notifications/', views.mentor_notification_list, name='notification-list'),
    path('api/notifications/<int:notification_id>/read/', views.mark_notification_as_read, name='notification-mark-read'),
    
    # Dashboard URLs
    path('api/dashboard/', views.mentor_dashboard, name='mentor-dashboard'),
    path('api/mentor/students/', views.mentor_students, name='mentor-students'),
    path('api/mentor/stats/', views.mentor_stats, name='mentor-stats'),
    
    # Analytics URLs
    path('api/analytics/', views.mentor_analytics, name='mentor-analytics'),
    
    # Admin URLs
    path('api/admin/assign-mentor/', views.assign_mentor, name='admin-assign-mentor'),
    
    # Utility URLs
    path('api/available-mentors/', views.available_mentors, name='available-mentors'),
    path('api/mentor/<int:mentor_id>/availability/', views.mentor_availability, name='mentor-availability'),
] 