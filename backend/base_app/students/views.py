from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Student
from .serializers import StudentSerializer

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
