#!/usr/bin/env python3
"""
Simple Sample Data Creation Script for Student Flow System

This script creates basic sample data to test the student models.
"""

import os
import sys
import django
from datetime import datetime, timedelta, date
from decimal import Decimal

# Set up Django
sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'base_app.settings')
django.setup()

from django.contrib.auth.models import User
from django.utils import timezone

def main():
    print("🎓 Creating Simple Sample Data...")
    print("=" * 50)
    
    try:
        # First, let's check what tables exist
        from django.db import connection
        cursor = connection.cursor()
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        print("📋 Available tables:")
        for table in tables:
            print(f"  - {table[0]}")
        
        # Create a simple user first
        print("\n👤 Creating sample user...")
        user, created = User.objects.get_or_create(
            username='john_doe',
            defaults={
                'email': 'john.doe@example.com',
                'first_name': 'John',
                'last_name': 'Doe',
                'is_active': True
            }
        )
        
        if created:
            user.set_password('password123')
            user.save()
            print(f"✅ Created user: {user.username}")
        else:
            print(f"✅ User already exists: {user.username}")
        
        # Now try to check if student models tables exist
        try:
            from students.models import StudentProfile
            print("\n📚 Checking StudentProfile model...")
            
            # Try to create a StudentProfile
            student_profile, created = StudentProfile.objects.get_or_create(
                user=user,
                defaults={
                    'bio': 'Sample student profile for testing',
                    'learning_style': 'visual',
                    'preferred_difficulty': 'beginner',
                    'study_hours_per_week': 15,
                    'career_goals': 'Become a full-stack developer',
                    'status': 'active'
                }
            )
            
            if created:
                print(f"✅ Created StudentProfile for: {user.username}")
            else:
                print(f"✅ StudentProfile already exists for: {user.username}")
                
            print(f"   - Learning Style: {student_profile.learning_style}")
            print(f"   - Study Hours/Week: {student_profile.study_hours_per_week}")
            print(f"   - Status: {student_profile.status}")
            
        except Exception as e:
            print(f"❌ Error creating StudentProfile: {e}")
            return
        
        print("\n✅ Simple sample data creation completed successfully!")
        print("\n📊 Summary:")
        print(f"   - Users: {User.objects.count()}")
        print(f"   - Student Profiles: {StudentProfile.objects.count()}")
        
    except Exception as e:
        print(f"❌ Sample data creation failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()
