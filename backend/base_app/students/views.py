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

# ... existing code ...
@api_view(['POST'])
def google_auth(request):
    """Authenticate with Google, create/get Student, and return student info."""
    token = request.data.get('token')
    if not token:
        return Response({'error': 'No token provided'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        CLIENT_ID = '305743130332-tsr28ldgeeadlrgr7udg816o0ll8iean.apps.googleusercontent.com'
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
# ... existing code ...
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
