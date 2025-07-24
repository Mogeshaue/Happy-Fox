from rest_framework import serializers
from .models import Student

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ['id', 'email', 'first_name', 'middle_name', 'last_name', 'default_dp_color', 'created_at', 'updated_at']
