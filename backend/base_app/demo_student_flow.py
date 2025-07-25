#!/usr/bin/env python3
"""
Student Flow Demo Script

This script demonstrates the complete student journey through the learning system,
from invitation to course completion.
"""

import os
import django
import sys

# Set up Django
sys.path.append('.')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'base_app.settings')
django.setup()

from students.models import Student, Course, Cohort, Team, Invitation
from students.models import (
    StudentProfile, StudentEnrollment, LearningSession, 
    AssignmentSubmission, StudentAnalytics, StudyGroup
)
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import datetime, timedelta
import json


def print_section(title):
    """Print a formatted section header"""
    print(f"\n{'='*60}")
    print(f" {title}")
    print(f"{'='*60}")


def print_subsection(title):
    """Print a formatted subsection header"""
    print(f"\n{'-'*40}")
    print(f" {title}")
    print(f"{'-'*40}")


def demo_basic_student_structure():
    """Demonstrate the basic student app structure"""
    print_section("BASIC STUDENT STRUCTURE (students app)")
    
    # Show students
    print_subsection("Students")
    students = Student.objects.all()[:5]
    for student in students:
        print(f"👤 {student.email}")
        print(f"   Name: {student.first_name} {student.last_name}")
        print(f"   Created: {student.created_at.date()}")
    
    # Show courses (basic)
    print_subsection("Basic Courses")
    courses = Course.objects.all()
    for course in courses:
        print(f"📚 {course.name}")
        print(f"   Description: {course.description}")
        print(f"   Created: {course.created_at.date()}")
    
    # Show cohorts
    print_subsection("Cohorts")
    cohorts = Cohort.objects.all()
    for cohort in cohorts:
        print(f"🎓 {cohort.name}")
        print(f"   Course: {cohort.course.name}")
        print(f"   Duration: {cohort.start_date} to {cohort.end_date}")
        
        # Show teams in cohort
        teams = Team.objects.filter(cohort=cohort)
        if teams:
            print(f"   Teams:")
            for team in teams:
                print(f"     • {team.name}")
    
    # Show invitations
    print_subsection("Team Invitations")
    invitations = Invitation.objects.all()[:5]
    for invitation in invitations:
        status = "✅ Accepted" if invitation.accepted else "⏳ Pending"
        print(f"📧 {invitation.email} → {invitation.team.name}")
        print(f"   Status: {status}")
        print(f"   Invited by: {invitation.invited_by.username}")
        print(f"   Date: {invitation.created_at.date()}")


def demo_student_profiles():
    """Demonstrate advanced student profiles"""
    print_section("STUDENT PROFILES & PREFERENCES")
    
    try:
        profiles = StudentProfile.objects.all()[:3]
        for profile in profiles:
            print(f"\n🎯 {profile.user.first_name} {profile.user.last_name}")
            print(f"   Learning Style: {profile.learning_style}")
            print(f"   Preferred Difficulty: {profile.preferred_difficulty}")
            print(f"   Study Hours/Week: {profile.study_hours_per_week}")
            print(f"   Status: {profile.status}")
            print(f"   Overall Grade: {profile.overall_grade}%")
            print(f"   Streak Days: {profile.streak_days}")
            print(f"   Completed Courses: {profile.completed_courses}")
            
            if profile.learning_objectives:
                print(f"   Learning Goals: {', '.join(profile.learning_objectives)}")
            if profile.career_goals:
                print(f"   Career Goals: {profile.career_goals}")
    except Exception as e:
        print("ℹ️  No StudentProfile data available (student_flow models not populated)")
        print(f"   Error: {e}")


def demo_student_enrollments():
    """Demonstrate student enrollments and progress"""
    print_section("STUDENT ENROLLMENTS & PROGRESS")
    
    try:
        enrollments = StudentEnrollment.objects.all()[:5]
        for enrollment in enrollments:
            print(f"\n📈 {enrollment.student.first_name} {enrollment.student.last_name}")
            print(f"   Course: {enrollment.course.name}")
            print(f"   Cohort: {enrollment.cohort.name}")
            print(f"   Status: {enrollment.status}")
            print(f"   Progress: {enrollment.progress_percentage}%")
            
            if enrollment.grade:
                print(f"   Grade: {enrollment.grade}%")
            
            print(f"   Enrolled: {enrollment.enrolled_at.date()}")
            
            if enrollment.expected_completion_date:
                print(f"   Expected Completion: {enrollment.expected_completion_date}")
                if enrollment.is_overdue:
                    print(f"   ⚠️  OVERDUE!")
            
            if enrollment.certificate_issued:
                print(f"   🏆 Certificate Issued!")
                
    except Exception as e:
        print("ℹ️  No StudentEnrollment data available")
        print(f"   Error: {e}")


def demo_learning_sessions():
    """Demonstrate learning session tracking"""
    print_section("LEARNING SESSIONS & ENGAGEMENT")
    
    try:
        sessions = LearningSession.objects.all().order_by('-started_at')[:5]
        for session in sessions:
            print(f"\n⏱️  Session: {session.session_type}")
            print(f"   Student: {session.student.first_name} {session.student.last_name}")
            print(f"   Course: {session.course.name if session.course else 'N/A'}")
            print(f"   Task: {session.task.title if session.task else 'N/A'}")
            print(f"   Status: {session.status}")
            print(f"   Duration: {session.total_duration_minutes} minutes")
            print(f"   Started: {session.started_at}")
            
            if session.status == 'completed':
                print(f"   Tasks Completed: {session.tasks_completed}")
                print(f"   Questions Answered: {session.questions_answered}")
                print(f"   Accuracy: {session.accuracy_rate:.1f}%")
                print(f"   Points Earned: {session.points_earned}")
                
                if session.satisfaction_rating:
                    stars = "⭐" * session.satisfaction_rating
                    print(f"   Satisfaction: {stars} ({session.satisfaction_rating}/5)")
                    
    except Exception as e:
        print("ℹ️  No LearningSession data available")
        print(f"   Error: {e}")


def demo_assignments():
    """Demonstrate assignment submission workflow"""
    print_section("ASSIGNMENT SUBMISSIONS & GRADING")
    
    try:
        submissions = AssignmentSubmission.objects.all().order_by('-submitted_at')[:3]
        for submission in submissions:
            print(f"\n📝 Assignment: {submission.task.title}")
            print(f"   Student: {submission.student.first_name} {submission.student.last_name}")
            print(f"   Course: {submission.course.name}")
            print(f"   Status: {submission.status}")
            print(f"   Version: {submission.version}")
            print(f"   Submitted: {submission.submitted_at}")
            
            if submission.grade:
                print(f"   Grade: {submission.grade}%")
                
            if submission.graded_at:
                print(f"   Graded: {submission.graded_at}")
                
            if submission.instructor_feedback:
                print(f"   Feedback: {submission.instructor_feedback}")
                
            # Show file attachments
            if submission.file_urls:
                print(f"   Files: {len(submission.file_urls)} attachment(s)")
                
    except Exception as e:
        print("ℹ️  No AssignmentSubmission data available")
        print(f"   Error: {e}")


def demo_study_groups():
    """Demonstrate collaborative learning features"""
    print_section("COLLABORATIVE LEARNING & STUDY GROUPS")
    
    try:
        study_groups = StudyGroup.objects.all()[:3]
        for group in study_groups:
            print(f"\n👥 Study Group: {group.name}")
            print(f"   Course: {group.course.name}")
            print(f"   Type: {group.group_type}")
            print(f"   Status: {group.status}")
            print(f"   Max Members: {group.max_members}")
            print(f"   Created: {group.created_at.date()}")
            
            # Show members
            memberships = group.studygroupmembership_set.all()[:5]
            if memberships:
                print(f"   Members:")
                for membership in memberships:
                    role_icon = "👑" if membership.role == "moderator" else "👤"
                    print(f"     {role_icon} {membership.student.first_name} {membership.student.last_name} ({membership.role})")
                    
    except Exception as e:
        print("ℹ️  No StudyGroup data available")
        print(f"   Error: {e}")


def demo_student_analytics():
    """Demonstrate student analytics and insights"""
    print_section("STUDENT ANALYTICS & INSIGHTS")
    
    try:
        analytics = StudentAnalytics.objects.all().order_by('-date')[:5]
        for analytic in analytics:
            print(f"\n📊 Analytics for {analytic.student.first_name} {analytic.student.last_name}")
            print(f"   Date: {analytic.date}")
            print(f"   Study Time: {analytic.study_time_minutes} minutes")
            print(f"   Tasks Completed: {analytic.tasks_completed}")
            print(f"   Quiz Score Average: {analytic.quiz_score_average}%")
            print(f"   Login Count: {analytic.login_count}")
            print(f"   Page Views: {analytic.page_views}")
            
            if analytic.achievements_earned:
                print(f"   🏆 Achievements: {', '.join(analytic.achievements_earned)}")
                
    except Exception as e:
        print("ℹ️  No StudentAnalytics data available")
        print(f"   Error: {e}")


def demo_student_journey():
    """Demonstrate a complete student journey"""
    print_section("COMPLETE STUDENT JOURNEY EXAMPLE")
    
    print("📋 Student Journey Stages:")
    print()
    print("1. 📧 INVITATION STAGE")
    print("   • Admin creates team and sends invitation")
    print("   • Student receives email invitation")
    print("   • Student clicks link and creates account")
    print()
    print("2. 👤 PROFILE SETUP")
    print("   • Student completes profile with learning preferences")
    print("   • System creates StudentProfile with initial settings")
    print("   • Learning style and goals are captured")
    print()
    print("3. 📚 COURSE ENROLLMENT")
    print("   • Student is automatically enrolled in cohort courses")
    print("   • StudentEnrollment records track progress")
    print("   • Course materials become accessible")
    print()
    print("4. 🎯 ACTIVE LEARNING")
    print("   • Student starts learning sessions")
    print("   • Task completions are tracked")
    print("   • Real-time progress updates")
    print("   • Engagement analytics collected")
    print()
    print("5. 📝 ASSIGNMENTS & ASSESSMENTS")
    print("   • Student submits assignments")
    print("   • Instructors review and grade")
    print("   • Feedback provided for improvement")
    print()
    print("6. 👥 COLLABORATIVE LEARNING")
    print("   • Student joins study groups")
    print("   • Participates in team projects")
    print("   • Peer learning and support")
    print()
    print("7. 📈 PROGRESS TRACKING")
    print("   • Daily analytics capture engagement")
    print("   • Streak tracking encourages consistency")
    print("   • Performance metrics guide improvements")
    print()
    print("8. 🏆 COMPLETION & CERTIFICATION")
    print("   • Course completion triggers certification")
    print("   • Final grades calculated and stored")
    print("   • Achievement badges awarded")
    print("   • Graduation pathway activated")


def main():
    """Run all student flow demonstrations"""
    print("🎓 Student Flow System Demonstration")
    print("This script shows how students progress through the learning system.")
    
    try:
        demo_basic_student_structure()
        demo_student_profiles()
        demo_student_enrollments()
        demo_learning_sessions()
        demo_assignments()
        demo_study_groups()
        demo_student_analytics()
        demo_student_journey()
        
        print_section("DEMO COMPLETED")
        print("✅ Student flow demonstration completed successfully!")
        print()
        print("📚 Key Insights:")
        print("• Two-tier system: Basic (students) + Advanced (student_flow)")
        print("• Complete student lifecycle from invitation to graduation")
        print("• Comprehensive progress and engagement tracking")
        print("• Collaborative learning with teams and study groups")
        print("• Real-time analytics and personalized learning paths")
        print("• Integration with admin_flow for management oversight")
        print()
        print("🔗 Next Steps:")
        print("1. Review the STUDENT_FLOW_EXPLANATION.md documentation")
        print("2. Explore the Django admin interface")
        print("3. Check the API endpoints for frontend integration")
        print("4. Consider implementing the advanced features")
        
    except Exception as e:
        print(f"❌ Error during demo: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
