from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Student
from .serializers import StudentSerializer
import requests
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
import json
import logging
from rest_framework import viewsets, permissions
from .models import Course, Cohort, Team, Invitation
from .serializers import CourseSerializer, CohortSerializer, TeamSerializer, InvitationSerializer

# Set up logging
logger = logging.getLogger(__name__)

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        # Temporarily allow all requests for testing - REMOVE IN PRODUCTION
        return True
        # return request.user and request.user.is_staff

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all().order_by('-created_at')
    serializer_class = CourseSerializer
    permission_classes = [IsAdminUser]

class CohortViewSet(viewsets.ModelViewSet):
    queryset = Cohort.objects.all().order_by('-start_date')
    serializer_class = CohortSerializer
    permission_classes = [IsAdminUser]

class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all().order_by('name')
    serializer_class = TeamSerializer
    permission_classes = [IsAdminUser]

class InvitationViewSet(viewsets.ModelViewSet):
    queryset = Invitation.objects.all().order_by('-created_at')
    serializer_class = InvitationSerializer
    permission_classes = [IsAdminUser]

@api_view(['POST'])
def register_student(request):
    """Register a new student or return existing if email exists."""
    serializer = StudentSerializer(data=request.data)
    if serializer.is_valid():
        student, created = Student.objects.get_or_create(
            email=serializer.validated_data['email'],
            defaults={
                'first_name': serializer.validated_data.get('first_name'),
                'middle_name': serializer.validated_data.get('middle_name'),
                'last_name': serializer.validated_data.get('last_name'),
                'default_dp_color': serializer.validated_data.get('default_dp_color'),
            }
        )
        return Response(StudentSerializer(student).data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_student(request):
    """Get student by email (query param)."""
    email = request.query_params.get('email')
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        student = Student.objects.get(email=email)
        return Response(StudentSerializer(student).data)
    except Student.DoesNotExist:
        return Response({'error': 'Student not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def google_auth(request):
    """Original Google authentication - for backward compatibility"""
    token = request.data.get('token')
    if not token:
        return Response({'error': 'No token provided'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        # Google Client ID - Update this if you create a new OAuth Client ID
        CLIENT_ID = "305743130332-tsr28ldgeeadlrgr7udg816o0ll8iean.apps.googleusercontent.com"
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), CLIENT_ID)
        email = idinfo.get('email')
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')
        if not email:
            return Response({'error': 'Google account did not return an email'}, status=status.HTTP_400_BAD_REQUEST)
        # Create or get the student
        student, created = Student.objects.get_or_create(
            email=email,
            defaults={
                'first_name': first_name,
                'last_name': last_name,
                'default_dp_color': '#4285f4',  # Google blue
            }
        )
        # If student exists but name info is missing, update it
        if not created and (not student.first_name or not student.last_name):
            student.first_name = first_name or student.first_name
            student.last_name = last_name or student.last_name
            student.save()
        return Response({
            'student': StudentSerializer(student).data,
            'created': created,
            'message': 'Google authentication successful'
        }, status=status.HTTP_200_OK)
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Google auth error: {str(e)}")
        return Response({'error': f'Google auth failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def enhanced_google_auth(request):
    """Enhanced Google authentication with role detection"""
    token = request.data.get('token')
    if not token:
        return Response({'error': 'No token provided'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Google Client ID - Update this if you create a new OAuth Client ID
        CLIENT_ID = "305743130332-tsr28ldgeeadlrgr7udg816o0ll8iean.apps.googleusercontent.com"
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), CLIENT_ID)
        email = idinfo.get('email')
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')
        
        if not email:
            return Response({'error': 'Google account did not return an email'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create or get the student/user
        user, created = Student.objects.get_or_create(
            email=email,
            defaults={
                'first_name': first_name,
                'last_name': last_name,
                'default_dp_color': '#4285f4',  # Google blue
            }
        )
        
        # If user exists but name info is missing, update it
        if not created and (not user.first_name or not user.last_name):
            user.first_name = first_name or user.first_name
            user.last_name = last_name or user.last_name
            user.save()
        
        # Determine user roles
        roles = []
        role_details = {}
        
        # Check if user is admin
        from mentor.models import UserOrganization
        admin_orgs = UserOrganization.objects.filter(user=user, role='admin')
        if admin_orgs.exists():
            roles.append('admin')
            role_details['admin'] = {
                'organizations': [{'id': org.org.id, 'name': org.org.name, 'slug': org.org.slug} 
                                for org in admin_orgs]
            }
        
        # Check if user is mentor
        from mentor.models import MentorProfile, UserCohort
        try:
            mentor_profile = MentorProfile.objects.get(user=user)
            if mentor_profile.status == MentorProfile.Status.ACTIVE:
                roles.append('mentor')
                role_details['mentor'] = {
                    'profile_id': mentor_profile.id,
                    'experience_level': mentor_profile.experience_level,
                    'status': mentor_profile.status,
                    'max_students': mentor_profile.max_students,
                    'current_students': mentor_profile.current_student_count,
                    'rating': float(mentor_profile.rating)
                }
        except MentorProfile.DoesNotExist:
            pass
        
        # Also check mentor role in cohorts
        mentor_cohorts = UserCohort.objects.filter(user=user, role='mentor')
        if mentor_cohorts.exists() and 'mentor' not in roles:
            roles.append('mentor')
            if 'mentor' not in role_details:
                role_details['mentor'] = {}
            role_details['mentor']['cohorts'] = [
                {'id': uc.cohort.id, 'name': uc.cohort.name, 'org': uc.cohort.org.name}
                for uc in mentor_cohorts
            ]
        
        # Check if user is student/learner
        student_cohorts = UserCohort.objects.filter(user=user, role='learner')
        if student_cohorts.exists() or not roles:  # Default to student if no other roles
            roles.append('student')
            role_details['student'] = {
                'cohorts': [
                    {'id': uc.cohort.id, 'name': uc.cohort.name, 'org': uc.cohort.org.name}
                    for uc in student_cohorts
                ] if student_cohorts.exists() else []
            }
        
        # Determine primary role (first role in hierarchy: admin > mentor > student)
        primary_role = roles[0] if roles else 'student'
        
        # Serialize user data
        user_data = StudentSerializer(user).data
        
        return Response({
            'success': True,
            'user': user_data,
            'roles': roles,
            'primary_role': primary_role,
            'role_details': role_details,
            'created': created,
            'message': 'Google authentication successful'
        }, status=status.HTTP_200_OK)
        
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        logger.error(f"Enhanced Google auth error: {str(e)}")
        return Response({'error': f'Google auth failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def dev_auth_bypass(request):
    """Development authentication bypass for testing roles - REMOVE IN PRODUCTION"""
    email = request.data.get('email')
    role = request.data.get('role', 'student')
    first_name = request.data.get('first_name', 'Test')
    last_name = request.data.get('last_name', 'User')
    
    if not email:
        return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Create or get the user
        user, created = Student.objects.get_or_create(
            email=email,
            defaults={
                'first_name': first_name,
                'last_name': last_name,
                'default_dp_color': '#28a745',  # Green for dev users
            }
        )
        
        # Set up roles based on request
        roles = []
        role_details = {}
        
        if role == 'admin' or 'admin' in role:
            # Create admin role
            from mentor.models import Organization, UserOrganization
            org, _ = Organization.objects.get_or_create(
                slug='test-org',
                defaults={'name': 'Test Organization'}
            )
            UserOrganization.objects.get_or_create(
                user=user, org=org, defaults={'role': 'admin'}
            )
            roles.append('admin')
            role_details['admin'] = {
                'organizations': [{'id': org.id, 'name': org.name, 'slug': org.slug}]
            }
        
        if role == 'mentor' or 'mentor' in role:
            # Create mentor profile and role
            from mentor.models import MentorProfile, Cohort, UserCohort, Organization
            
            org, _ = Organization.objects.get_or_create(
                slug='test-org',
                defaults={'name': 'Test Organization'}
            )
            
            cohort, _ = Cohort.objects.get_or_create(
                name='Test Cohort',
                defaults={'org': org}
            )
            
            # Create mentor profile
            mentor_profile, _ = MentorProfile.objects.get_or_create(
                user=user,
                defaults={
                    'experience_level': 'senior',
                    'max_students': 10,
                    'status': 'active',
                    'bio': 'Test mentor created for development'
                }
            )
            
            # Add mentor to cohort
            UserCohort.objects.get_or_create(
                user=user, cohort=cohort, defaults={'role': 'mentor'}
            )
            
            roles.append('mentor')
            role_details['mentor'] = {
                'profile_id': mentor_profile.id,
                'experience_level': mentor_profile.experience_level,
                'status': mentor_profile.status,
                'max_students': mentor_profile.max_students,
                'current_students': 0,
                'rating': float(mentor_profile.rating)
            }
        
        if role == 'student' or 'student' in role or not roles:
            # Create student role
            from mentor.models import Cohort, UserCohort, Organization
            
            org, _ = Organization.objects.get_or_create(
                slug='test-org',
                defaults={'name': 'Test Organization'}
            )
            
            cohort, _ = Cohort.objects.get_or_create(
                name='Test Student Cohort',
                defaults={'org': org}
            )
            
            UserCohort.objects.get_or_create(
                user=user, cohort=cohort, defaults={'role': 'learner'}
            )
            
            roles.append('student')
            role_details['student'] = {
                'cohorts': [{'id': cohort.id, 'name': cohort.name, 'org': org.name}]
            }
        
        # Determine primary role
        primary_role = roles[0] if roles else 'student'
        
        # Serialize user data
        user_data = StudentSerializer(user).data
        
        return Response({
            'success': True,
            'user': user_data,
            'roles': roles,
            'primary_role': primary_role,
            'role_details': role_details,
            'created': created,
            'dev_mode': True,
            'message': f'Development authentication successful as {primary_role}'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Dev auth error: {str(e)}")
        return Response({'error': f'Dev auth failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def test_student_login(request):
    """Test endpoint to simulate Google OAuth without popup - for development/testing only."""
    try:
        # Get user data from request (simulating what Google would provide)
        email = request.data.get('email')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        
        if not email:
            return Response({'error': 'Email is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Validate email format
        if '@' not in email or '.' not in email:
            return Response({'error': 'Invalid email format'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create or get the student (same logic as Google OAuth)
        student, created = Student.objects.get_or_create(
            email=email,
            defaults={
                'first_name': first_name,
                'last_name': last_name,
                'default_dp_color': '#28a745'  # Green color for test users
            }
        )
        
        # If student exists but name info is missing, update it
        if not created and (not student.first_name or not student.last_name):
            student.first_name = first_name or student.first_name
            student.last_name = last_name or student.last_name
            student.save()
        
        logger.info(f"Test login - Student {'created' if created else 'retrieved'}: {email}")
        
        return Response({
            'student': StudentSerializer(student).data,
            'created': created,
            'message': 'Test login successful',
            'note': 'This is a test endpoint - use Google OAuth in production'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Test login error: {str(e)}")
        return Response({'error': f'Test login failed: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def list_students(request):
    """List all students with pagination support."""
    try:
        students = Student.objects.all().order_by('-created_at')
        
        # Simple pagination
        page_size = int(request.query_params.get('page_size', 10))
        page = int(request.query_params.get('page', 1))
        
        start = (page - 1) * page_size
        end = start + page_size
        
        paginated_students = students[start:end]
        total_count = students.count()
        
        return Response({
            'students': StudentSerializer(paginated_students, many=True).data,
            'total_count': total_count,
            'page': page,
            'page_size': page_size,
            'has_next': end < total_count,
            'has_previous': page > 1
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"List students error: {str(e)}")
        return Response({'error': f'Failed to list students: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
