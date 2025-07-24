from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse
import json

@api_view(['GET'])
def hello_world(request):
    """Simple API endpoint that returns a greeting message"""
    return Response({
        'message': 'Hello from Django backend!',
        'status': 'success',
        'timestamp': '2025-07-24'
    })

@api_view(['POST'])
def google_auth(request):
    token = request.data.get('token')
    if not token:
        return Response({'error': 'No token provided'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        # Specify the CLIENT_ID of the app that accesses the backend
        CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'
        idinfo = id_token.verify_oauth2_token(token, google_requests.Request(), CLIENT_ID)
        # idinfo contains user info (sub, email, name, etc.)
        # Here you can create or get your user, and return a session/token as needed
        return Response({'message': 'Google authentication successful', 'user': idinfo})
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def echo_message(request):
    """API endpoint that echoes back the message sent from frontend"""
    try:
        message = request.data.get('message', 'No message provided')
        return Response({
            'original_message': message,
            'echo': f"Echo: {message}",
            'status': 'success'
        })
    except Exception as e:
        return Response({
            'error': str(e),
            'status': 'error'
        }, status=400)

@api_view(['GET'])
def get_data(request):
    """API endpoint that returns some sample data"""
    sample_data = [
        {'id': 1, 'name': 'Item 1', 'description': 'First sample item'},
        {'id': 2, 'name': 'Item 2', 'description': 'Second sample item'},
        {'id': 3, 'name': 'Item 3', 'description': 'Third sample item'},
    ]
    return Response({
        'data': sample_data,
        'count': len(sample_data),
        'status': 'success'
    })
