from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = 'student'

# Router for ViewSets (if any)
router = DefaultRouter()

urlpatterns = [
    # Include router URLs
    path('api/', include(router.urls)),
    
    # Student Profile URLs
    path('api/profile/', views.StudentProfileView.as_view(), name='student-profile'),
    path('api/profile/create/', views.CreateStudentProfileView.as_view(), name='create-student-profile'),
    
    # Dashboard URLs
    path('api/dashboard/', views.StudentDashboardView.as_view(), name='student-dashboard'),
    path('api/progress/', views.StudentProgressView.as_view(), name='student-progress'),
    path('api/stats/', views.StudentStatsView.as_view(), name='student-stats'),
    
    # Enrollment URLs
    path('api/enrollments/', views.StudentEnrollmentListView.as_view(), name='enrollment-list'),
    path('api/enrollments/<int:pk>/', views.StudentEnrollmentDetailView.as_view(), name='enrollment-detail'),
    
    # Learning Session URLs
    path('api/sessions/', views.LearningSessionListView.as_view(), name='session-list'),
    path('api/sessions/<int:pk>/', views.LearningSessionDetailView.as_view(), name='session-detail'),
    path('api/sessions/<uuid:session_id>/end/', views.EndLearningSessionView.as_view(), name='end-session'),
    
    # Assignment Submission URLs
    path('api/assignments/', views.AssignmentSubmissionListView.as_view(), name='assignment-list'),
    path('api/assignments/<int:pk>/', views.AssignmentSubmissionDetailView.as_view(), name='assignment-detail'),
    path('api/assignments/<uuid:submission_id>/submit/', views.SubmitAssignmentView.as_view(), name='submit-assignment'),
    
    # Study Group URLs
    path('api/study-groups/', views.StudyGroupListView.as_view(), name='study-group-list'),
    path('api/study-groups/<uuid:pk>/', views.StudyGroupDetailView.as_view(), name='study-group-detail'),
    path('api/study-groups/<uuid:group_id>/join/', views.JoinStudyGroupView.as_view(), name='join-study-group'),
    path('api/study-groups/<uuid:group_id>/leave/', views.LeaveStudyGroupView.as_view(), name='leave-study-group'),
    path('api/study-groups/<uuid:group_id>/members/', views.StudyGroupMembersView.as_view(), name='study-group-members'),
    
    # Learning Resource URLs
    path('api/resources/', views.LearningResourceListView.as_view(), name='resource-list'),
    path('api/resources/<uuid:pk>/', views.LearningResourceDetailView.as_view(), name='resource-detail'),
    path('api/resources/public/', views.PublicLearningResourcesView.as_view(), name='public-resources'),
    
    # Learning Goal URLs
    path('api/goals/', views.LearningGoalListView.as_view(), name='goal-list'),
    path('api/goals/<uuid:pk>/', views.LearningGoalDetailView.as_view(), name='goal-detail'),
    path('api/goals/<uuid:goal_id>/complete/', views.CompleteGoalView.as_view(), name='complete-goal'),
    
    # Quiz Attempt URLs
    path('api/quiz-attempts/', views.QuizAttemptListView.as_view(), name='quiz-attempt-list'),
    path('api/quiz-attempts/<uuid:pk>/', views.QuizAttemptDetailView.as_view(), name='quiz-attempt-detail'),
    path('api/quiz-attempts/<uuid:attempt_id>/complete/', views.CompleteQuizAttemptView.as_view(), name='complete-quiz'),
    
    # Notification URLs
    path('api/notifications/', views.StudentNotificationListView.as_view(), name='notification-list'),
    path('api/notifications/<uuid:notification_id>/read/', views.MarkNotificationAsReadView.as_view(), name='mark-notification-read'),
    path('api/notifications/mark-all-read/', views.mark_all_notifications_read, name='mark-all-notifications-read'),
    
    # Analytics URLs
    path('api/analytics/', views.StudentAnalyticsView.as_view(), name='student-analytics'),
    
    # Achievement URLs
    path('api/achievements/', views.StudentAchievementListView.as_view(), name='achievement-list'),
    
    # Task Completion URLs
    path('api/completions/', views.TaskCompletionListView.as_view(), name='completion-list'),
    
    # Utility URLs
    path('api/available-courses/', views.available_courses, name='available-courses'),
    path('api/calendar/', views.student_calendar, name='student-calendar'),
] 