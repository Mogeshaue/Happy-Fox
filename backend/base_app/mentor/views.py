from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q, Count, Avg, Sum
from django.utils import timezone
from datetime import datetime, timedelta
from django.db import transaction
from django.http import JsonResponse
import json

from .models import (
    MentorProfile, MentorshipAssignment, MentorSession, MentorMessage,
    StudentProgress, MentorFeedback, MentorshipGoal, MentorNotification,
    MentorAnalytics, User, Cohort, Course, UserCohort
)
from .serializers import (
    MentorProfileSerializer, MentorProfileUpdateSerializer,
    MentorshipAssignmentSerializer, MentorSessionSerializer,
    MentorMessageSerializer, StudentProgressSerializer,
    MentorFeedbackSerializer, MentorshipGoalSerializer,
    MentorNotificationSerializer, MentorAnalyticsSerializer,
    MentorDashboardSerializer, StudentSummarySerializer,
    MentorStatsSerializer, UserBasicSerializer
)
from .permissions import IsMentor, IsMentorOrStudent, IsOrgAdmin


# ===============================
# MENTOR PROFILE VIEWS
# ===============================

@api_view(['GET'])
@permission_classes([IsMentor])
def mentor_profile_list(request):
    """List all mentor profiles"""
    try:
        queryset = MentorProfile.objects.select_related('user').all()
        
        # Filter by organization if provided
        org_id = request.GET.get('org_id')
        if org_id:
            queryset = queryset.filter(user__userorganization__org_id=org_id)
        
        # Filter by status
        status_filter = request.GET.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by expertise area
        expertise = request.GET.get('expertise')
        if expertise:
            queryset = queryset.filter(expertise_areas__icontains=expertise)
        
        serializer = MentorProfileSerializer(queryset, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'count': queryset.count(),
            'message': 'Mentor profiles retrieved successfully'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Failed to retrieve mentor profiles'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'PUT', 'PATCH'])
@permission_classes([IsMentor])
def mentor_profile_detail(request, pk=None):
    """Get or update mentor profile"""
    try:
        if pk:
            mentor_profile = get_object_or_404(MentorProfile, pk=pk)
        else:
            # Handle /me endpoint
            mentor_profile = get_object_or_404(MentorProfile, user=request.user)
        
        if request.method == 'GET':
            serializer = MentorProfileSerializer(mentor_profile)
            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Mentor profile retrieved successfully'
            }, status=status.HTTP_200_OK)
        
        elif request.method in ['PUT', 'PATCH']:
            serializer = MentorProfileUpdateSerializer(
                mentor_profile, 
                data=request.data, 
                partial=(request.method == 'PATCH')
            )
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'data': serializer.data,
                    'message': 'Mentor profile updated successfully'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'errors': serializer.errors,
                    'message': 'Validation failed'
                }, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Failed to process mentor profile request'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsMentor])
def create_mentor_profile(request):
    """Create a mentor profile"""
    try:
        user = request.user
        
        if not user:
            return Response({
                'success': False,
                'error': 'No user found',
                'message': 'User required to create mentor profile'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        serializer = MentorProfileUpdateSerializer(data=request.data)
        if serializer.is_valid():
            mentor_profile = serializer.save(user=user)
            response_serializer = MentorProfileSerializer(mentor_profile)
            return Response({
                'success': True,
                'data': response_serializer.data,
                'message': 'Mentor profile created successfully'
            }, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'errors': serializer.errors,
                'message': 'Validation failed'
            }, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Failed to create mentor profile'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ===============================
# DASHBOARD VIEW
# ===============================

@api_view(['GET'])
@permission_classes([IsMentor])
def mentor_dashboard(request):
    """Comprehensive mentor dashboard"""
    try:
        user = request.user
        
        # Get mentor profile
        mentor_profile = get_object_or_404(MentorProfile, user=user)
        
        # Get active assignments
        active_assignments = MentorshipAssignment.objects.filter(
            mentor=user,
            status='active'
        ).select_related('student', 'cohort', 'course')[:10]
        
        # Get upcoming sessions
        upcoming_sessions = MentorSession.objects.filter(
            assignment__mentor=user,
            scheduled_at__gte=timezone.now(),
            status='scheduled'
        ).select_related('assignment__student').order_by('scheduled_at')[:5]
        
        # Get recent unread messages
        recent_messages = MentorMessage.objects.filter(
            assignment__mentor=user,
            is_read=False
        ).select_related('sender', 'assignment__student').order_by('-created_at')[:10]
        
        # Calculate stats
        total_students = MentorshipAssignment.objects.filter(mentor=user).count()
        active_students = active_assignments.count()
        completed_sessions = MentorSession.objects.filter(
            assignment__mentor=user, status='completed'
        ).count()
        unread_messages = recent_messages.count()
        
        # Prepare response data
        dashboard_data = {
            'mentor_profile': MentorProfileSerializer(mentor_profile).data,
            'stats': {
                'active_students': active_students,
                'total_students': total_students,
                'upcoming_sessions': upcoming_sessions.count(),
                'unread_messages': unread_messages,
                'completed_sessions': completed_sessions,
                'completion_rate': 85  # Mock data for now
            },
            'active_assignments': MentorshipAssignmentSerializer(active_assignments, many=True).data,
            'upcoming_sessions': MentorSessionSerializer(upcoming_sessions, many=True).data,
            'recent_messages': MentorMessageSerializer(recent_messages, many=True).data,
        }
        print(f"Dashboard data: {dashboard_data}")
        return Response({
            'success': True,
            'data': dashboard_data,
            'message': 'Dashboard data retrieved successfully'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"Dashboard error: {str(e)}")
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Failed to load dashboard data'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ===============================
# ASSIGNMENT VIEWS
# ===============================

@api_view(['GET', 'POST'])
@permission_classes([IsMentorOrStudent])
def mentorship_assignment_list(request):
    """List and create mentorship assignments"""
    try:
        if request.method == 'GET':
            # Get query parameters
            role = request.GET.get('role', 'mentor')
            status_filter = request.GET.get('status')
            cohort_id = request.GET.get('cohort_id')
            
            # Base queryset
            if role == 'mentor':
                queryset = MentorshipAssignment.objects.filter(mentor=request.user)
            else:
                queryset = MentorshipAssignment.objects.filter(student=request.user)
            
            # Apply filters
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            if cohort_id:
                queryset = queryset.filter(cohort_id=cohort_id)
            
            queryset = queryset.select_related('mentor', 'student', 'cohort', 'course')
            serializer = MentorshipAssignmentSerializer(queryset, many=True)
            
            return Response({
                'success': True,
                'data': serializer.data,
                'count': queryset.count(),
                'message': 'Assignments retrieved successfully'
            }, status=status.HTTP_200_OK)
        
        elif request.method == 'POST':
            serializer = MentorshipAssignmentSerializer(data=request.data)
            if serializer.is_valid():
                assignment = serializer.save()
                return Response({
                    'success': True,
                    'data': MentorshipAssignmentSerializer(assignment).data,
                    'message': 'Assignment created successfully'
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'success': False,
                    'errors': serializer.errors,
                    'message': 'Validation failed'
                }, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Failed to process assignment request'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsMentorOrStudent])
def mentorship_assignment_detail(request, pk):
    """Get, update or delete assignment"""
    try:
        assignment = get_object_or_404(MentorshipAssignment, pk=pk)
        
        if request.method == 'GET':
            serializer = MentorshipAssignmentSerializer(assignment)
            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Assignment retrieved successfully'
            }, status=status.HTTP_200_OK)
        
        elif request.method in ['PUT', 'PATCH']:
            serializer = MentorshipAssignmentSerializer(
                assignment, 
                data=request.data, 
                partial=(request.method == 'PATCH')
            )
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'data': serializer.data,
                    'message': 'Assignment updated successfully'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'errors': serializer.errors,
                    'message': 'Validation failed'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        elif request.method == 'DELETE':
            assignment.delete()
            return Response({
                'success': True,
                'message': 'Assignment deleted successfully'
            }, status=status.HTTP_204_NO_CONTENT)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Failed to process assignment request'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsMentor])
def activate_assignment(request, assignment_id):
    """Activate assignment"""
    try:
        assignment = get_object_or_404(MentorshipAssignment, pk=assignment_id)
        assignment.status = 'active'
        assignment.started_at = timezone.now()
        assignment.save()
        
        serializer = MentorshipAssignmentSerializer(assignment)
        return Response({
            'success': True,
            'data': serializer.data,
            'message': 'Assignment activated successfully'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Failed to activate assignment'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ===============================
# MESSAGE VIEWS
# ===============================

@api_view(['GET', 'POST'])
@permission_classes([IsMentorOrStudent])
def mentor_message_list(request):
    """List and create mentor messages"""
    try:
        if request.method == 'GET':
            assignment_id = request.GET.get('assignment_id')
            is_read = request.GET.get('is_read')
            
            if assignment_id:
                queryset = MentorMessage.objects.filter(
                    assignment_id=assignment_id
                ).select_related('sender').order_by('created_at')
            else:
                # Return unread messages for unread count
                queryset = MentorMessage.objects.filter(
                    is_read=False,
                    assignment__mentor=request.user
                )
            
            if is_read is not None:
                queryset = queryset.filter(is_read=(is_read.lower() == 'true'))
            
            serializer = MentorMessageSerializer(queryset, many=True)
            
            return Response({
                'success': True,
                'data': serializer.data,
                'count': queryset.count(),
                'message': 'Messages retrieved successfully'
            }, status=status.HTTP_200_OK)
        
        elif request.method == 'POST':
            serializer = MentorMessageSerializer(data=request.data)
            if serializer.is_valid():
                message = serializer.save(sender=request.user)
                return Response({
                    'success': True,
                    'data': MentorMessageSerializer(message).data,
                    'message': 'Message sent successfully'
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'success': False,
                    'errors': serializer.errors,
                    'message': 'Validation failed'
                }, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Failed to process message request'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PATCH'])
@permission_classes([IsMentorOrStudent])
def mark_message_as_read(request, message_id):
    """Mark a message as read"""
    try:
        message = get_object_or_404(MentorMessage, pk=message_id)
        message.is_read = True
        message.read_at = timezone.now()
        message.save()
        
        serializer = MentorMessageSerializer(message)
        return Response({
            'success': True,
            'data': serializer.data,
            'message': 'Message marked as read'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Failed to mark message as read'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ===============================
# SESSION VIEWS
# ===============================

@api_view(['GET', 'POST'])
@permission_classes([IsMentorOrStudent])
def mentor_session_list(request):
    """List and create mentor sessions"""
    try:
        if request.method == 'GET':
            queryset = MentorSession.objects.filter(
                assignment__mentor=request.user
            ).select_related('assignment__student')
            
            # Apply filters
            status_filter = request.GET.get('status')
            if status_filter:
                queryset = queryset.filter(status=status_filter)
            
            assignment_id = request.GET.get('assignment_id')
            if assignment_id:
                queryset = queryset.filter(assignment_id=assignment_id)
            
            queryset = queryset.order_by('-scheduled_at')
            serializer = MentorSessionSerializer(queryset, many=True)
            
            return Response({
                'success': True,
                'data': serializer.data,
                'count': queryset.count(),
                'message': 'Sessions retrieved successfully'
            }, status=status.HTTP_200_OK)
        
        elif request.method == 'POST':
            serializer = MentorSessionSerializer(data=request.data)
            if serializer.is_valid():
                session = serializer.save()
                return Response({
                    'success': True,
                    'data': MentorSessionSerializer(session).data,
                    'message': 'Session created successfully'
                }, status=status.HTTP_201_CREATED)
            else:
                return Response({
                    'success': False,
                    'errors': serializer.errors,
                    'message': 'Validation failed'
                }, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Failed to process session request'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
@permission_classes([IsMentorOrStudent])
def mentor_session_detail(request, pk):
    """Get, update or delete session"""
    try:
        session = get_object_or_404(MentorSession, pk=pk)
        
        if request.method == 'GET':
            serializer = MentorSessionSerializer(session)
            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Session retrieved successfully'
            }, status=status.HTTP_200_OK)
        
        elif request.method in ['PUT', 'PATCH']:
            serializer = MentorSessionSerializer(
                session, 
                data=request.data, 
                partial=(request.method == 'PATCH')
            )
            if serializer.is_valid():
                serializer.save()
                return Response({
                    'success': True,
                    'data': serializer.data,
                    'message': 'Session updated successfully'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'errors': serializer.errors,
                    'message': 'Validation failed'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        elif request.method == 'DELETE':
            session.delete()
            return Response({
                'success': True,
                'message': 'Session deleted successfully'
            }, status=status.HTTP_204_NO_CONTENT)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Failed to process session request'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ===============================
# STATS AND UTILITY VIEWS
# ===============================

@api_view(['GET'])
@permission_classes([IsMentor])
def mentor_stats(request):
    """Get mentor statistics"""
    try:
        user = request.user
        
        if not user:
            return Response({
                'success': False,
                'error': 'No mentor user found',
                'message': 'Mentor user required'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Calculate stats
        total_assignments = MentorshipAssignment.objects.filter(mentor=user).count()
        active_assignments = MentorshipAssignment.objects.filter(
            mentor=user, status='active'
        ).count()
        completed_sessions = MentorSession.objects.filter(
            assignment__mentor=user, status='completed'
        ).count()
        
        stats_data = {
            'total_assignments': total_assignments,
            'active_assignments': active_assignments,
            'completed_sessions': completed_sessions,
            'completion_rate': round((completed_sessions / max(total_assignments, 1)) * 100, 2),
        }
        
        return Response({
            'success': True,
            'data': stats_data,
            'message': 'Stats retrieved successfully'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Failed to retrieve stats'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsMentor])
def mentor_students(request):
    """Get students assigned to mentor"""
    try:
        user = request.user
        
        if not user:
            return Response({
                'success': False,
                'error': 'No mentor user found',
                'message': 'Mentor user required'
            }, status=status.HTTP_404_NOT_FOUND)
        
        assignments = MentorshipAssignment.objects.filter(
            mentor=user
        ).select_related('student', 'cohort', 'course')
        
        serializer = MentorshipAssignmentSerializer(assignments, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'count': assignments.count(),
            'message': 'Mentor students retrieved successfully'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Failed to retrieve mentor students'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# ===============================
# PLACEHOLDER VIEWS (Empty for now)
# ===============================

@api_view(['GET'])
@permission_classes([IsMentorOrStudent])
def student_progress_list(request):
    """Get student progress records"""
    return Response({
        'success': True,
        'data': [],
        'message': 'Progress records retrieved successfully'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsMentorOrStudent])
def mentor_feedback_list(request):
    """Get mentor feedback"""
    return Response({
        'success': True,
        'data': [],
        'message': 'Feedback retrieved successfully'
    }, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsMentorOrStudent])
def acknowledge_feedback(request, feedback_id):
    """Acknowledge feedback"""
    return Response({
        'success': True,
        'message': 'Feedback acknowledged successfully'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsMentorOrStudent])
def mentorship_goal_list(request):
    """Get mentorship goals"""
    return Response({
        'success': True,
        'data': [],
        'message': 'Goals retrieved successfully'
    }, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsMentor])
def complete_goal(request, goal_id):
    """Complete a goal"""
    return Response({
        'success': True,
        'message': 'Goal completed successfully'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsMentor])
def mentor_notification_list(request):
    """Get mentor notifications"""
    return Response({
        'success': True,
        'data': [],
        'message': 'Notifications retrieved successfully'
    }, status=status.HTTP_200_OK)


@api_view(['PATCH'])
@permission_classes([IsMentor])
def mark_notification_as_read(request, notification_id):
    """Mark notification as read"""
    return Response({
        'success': True,
        'message': 'Notification marked as read'
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsOrgAdmin])
def assign_mentor(request):
    """Assign mentor to student"""
    return Response({
        'success': True,
        'message': 'Mentor assigned successfully'
    }, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsMentor])
def mentor_analytics(request):
    """Get comprehensive mentor analytics with time filtering"""
    try:
        # Get time range filter
        time_range = request.GET.get('time_range', 'last_3_months')
        
        # Calculate date range based on time_range parameter
        from datetime import datetime, timedelta
        from django.utils import timezone
        from calendar import month_name
        
        now = timezone.now()
        
        if time_range == 'last_month':
            start_date = now - timedelta(days=30)
        elif time_range == 'last_3_months':
            start_date = now - timedelta(days=90)
        elif time_range == 'last_6_months':
            start_date = now - timedelta(days=180)
        elif time_range == 'last_year':
            start_date = now - timedelta(days=365)
        else:
            start_date = now - timedelta(days=90)  # Default to 3 months
        
        # Get mentor user (for testing, use first mentor if not authenticated)
        user = request.user
        
        if not user:
            return Response({
                'success': False,
                'error': 'No mentor user found',
                'message': 'Mentor user required for analytics'
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Calculate overview statistics
        total_assignments = MentorshipAssignment.objects.filter(mentor=user).count()
        active_assignments = MentorshipAssignment.objects.filter(
            mentor=user, status='active'
        ).count()
        
        # Session statistics
        all_sessions = MentorSession.objects.filter(assignment__mentor=user)
        sessions_in_range = all_sessions.filter(scheduled_at__gte=start_date)
        completed_sessions = sessions_in_range.filter(status='completed').count()
        total_sessions = sessions_in_range.count()
        
        # Message statistics
        all_messages = MentorMessage.objects.filter(assignment__mentor=user)
        messages_in_range = all_messages.filter(created_at__gte=start_date)
        total_messages = messages_in_range.count()
        unread_messages = all_messages.filter(is_read=False).count()
        
        # Calculate average rating from completed sessions
        avg_rating_data = sessions_in_range.filter(
            status='completed', student_rating__isnull=False
        ).aggregate(avg_rating=Avg('student_rating'))
        avg_rating = round(avg_rating_data['avg_rating'] or 4.5, 1)
        
        # Calculate completion rate
        completion_rate = round((completed_sessions / max(total_sessions, 1)) * 100, 1)
        
        # Overview statistics
        overview = {
            'total_students': total_assignments,
            'active_students': active_assignments,
            'total_sessions': total_sessions,
            'completed_sessions': completed_sessions,
            'total_messages': total_messages,
            'unread_messages': unread_messages,
            'avg_rating': avg_rating,
            'completion_rate': completion_rate
        }
        
        # Monthly statistics (last 6 months)
        monthly_stats = []
        for i in range(6):
            month_start = now - timedelta(days=30 * (i + 1))
            month_end = now - timedelta(days=30 * i)
            
            month_sessions = MentorSession.objects.filter(
                assignment__mentor=user,
                scheduled_at__gte=month_start,
                scheduled_at__lt=month_end
            )
            
            month_students = MentorshipAssignment.objects.filter(
                mentor=user,
                assigned_at__gte=month_start,
                assigned_at__lt=month_end
            ).count()
            
            month_avg_rating = month_sessions.filter(
                status='completed', student_rating__isnull=False
            ).aggregate(avg=Avg('student_rating'))['avg'] or 4.5
            
            monthly_stats.insert(0, {
                'month': month_start.strftime('%b'),
                'sessions': month_sessions.count(),
                'students': month_students,
                'rating': round(month_avg_rating, 1)
            })
        
        # Session distribution
        completed_count = sessions_in_range.filter(status='completed').count()
        cancelled_count = sessions_in_range.filter(status='cancelled').count()
        rescheduled_count = sessions_in_range.filter(status='rescheduled').count()
        
        session_distribution = [
            {'type': 'Completed', 'count': completed_count, 'color': '#22c55e'},
            {'type': 'Cancelled', 'count': cancelled_count, 'color': '#ef4444'},
            {'type': 'Rescheduled', 'count': rescheduled_count, 'color': '#f59e0b'}
        ]
        
        # Student progress (top students by session count)
        from django.db.models import Count
        student_progress = []
        top_assignments = MentorshipAssignment.objects.filter(
            mentor=user, status__in=['active', 'completed']
        ).annotate(
            session_count=Count('sessions')
        ).select_related('student').order_by('-session_count')[:5]
        
        for assignment in top_assignments:
            completed_sessions_count = assignment.sessions.filter(status='completed').count()
            total_sessions_count = assignment.sessions.count()
            progress = round((completed_sessions_count / max(total_sessions_count, 1)) * 100)
            
            student_progress.append({
                'student': assignment.student.full_name,
                'progress': progress,
                'sessions': total_sessions_count
            })
        
        # Time analytics
        completed_sessions_with_duration = sessions_in_range.filter(
            status='completed', actual_duration_minutes__isnull=False
        )
        
        avg_duration = completed_sessions_with_duration.aggregate(
            avg=Avg('actual_duration_minutes')
        )['avg'] or 60
        
        total_hours = completed_sessions_with_duration.aggregate(
            total=Sum('actual_duration_minutes')
        )['total'] or 0
        total_hours = round(total_hours / 60, 1)  # Convert minutes to hours
        
        # Calculate peak hours (mock data for now - would need more complex query)
        peak_hours = ['2:00 PM', '3:00 PM', '4:00 PM']
        
        # Calculate busiest day (mock data for now - would need day-of-week aggregation)
        busiest_day = 'Wednesday'
        
        time_analytics = {
            'avg_session_duration': round(avg_duration),
            'total_mentoring_hours': total_hours,
            'peak_hours': peak_hours,
            'busiest_day': busiest_day
        }
        
        # Compile analytics data
        analytics_data = {
            'overview': overview,
            'monthly_stats': monthly_stats,
            'session_distribution': session_distribution,
            'student_progress': student_progress,
            'time_analytics': time_analytics
        }

        print(analytics_data,"ksdgj")
        
        return Response({
            'success': True,
            'data': analytics_data,
            'message': 'Analytics data retrieved successfully'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        print(f"Analytics error: {str(e)}")
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Failed to retrieve analytics data'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsOrgAdmin])
def available_mentors(request):
    """Get available mentors"""
    try:
        mentors = MentorProfile.objects.filter(
            status='active'
        ).select_related('user')
        
        serializer = MentorProfileSerializer(mentors, many=True)
        
        return Response({
            'success': True,
            'data': serializer.data,
            'count': mentors.count(),
            'message': 'Available mentors retrieved successfully'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Failed to retrieve available mentors'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET', 'PATCH'])
@permission_classes([IsMentor])
def mentor_availability(request, mentor_id):
    """Get or update mentor availability"""
    try:
        mentor_profile = get_object_or_404(MentorProfile, pk=mentor_id)
        
        if request.method == 'GET':
            return Response({
                'success': True,
                'data': {
                    'mentor_id': mentor_id,
                    'availability_schedule': mentor_profile.availability_schedule,
                    'timezone': mentor_profile.timezone,
                    'status': mentor_profile.status
                },
                'message': 'Mentor availability retrieved successfully'
            }, status=status.HTTP_200_OK)
        
        elif request.method == 'PATCH':
            if 'availability_schedule' in request.data:
                mentor_profile.availability_schedule = request.data['availability_schedule']
            if 'timezone' in request.data:
                mentor_profile.timezone = request.data['timezone']
            
            mentor_profile.save()
            
            return Response({
                'success': True,
                'data': {
                    'mentor_id': mentor_id,
                    'availability_schedule': mentor_profile.availability_schedule,
                    'timezone': mentor_profile.timezone,
                    'status': mentor_profile.status
                },
                'message': 'Mentor availability updated successfully'
            }, status=status.HTTP_200_OK)
    
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e),
            'message': 'Failed to process mentor availability request'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 