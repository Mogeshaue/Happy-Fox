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
