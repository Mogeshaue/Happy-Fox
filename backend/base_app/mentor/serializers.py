from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import (
    MentorProfile, MentorshipAssignment, MentorSession, MentorMessage,
    StudentProgress, MentorFeedback, MentorshipGoal, MentorNotification,
    MentorAnalytics, User, Cohort, Course
)


class UserBasicSerializer(serializers.ModelSerializer):
    """Basic user serializer for nested representations"""
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'middle_name', 'last_name', 'full_name', 'default_dp_color']


class CohortBasicSerializer(serializers.ModelSerializer):
    """Basic cohort serializer for nested representations"""
    
    class Meta:
        model = Cohort
        fields = ['id', 'name']


class CourseBasicSerializer(serializers.ModelSerializer):
    """Basic course serializer for nested representations"""
    
    class Meta:
        model = Course
        fields = ['id', 'name']


class MentorProfileSerializer(serializers.ModelSerializer):
    """Serializer for mentor profiles"""
    user = UserBasicSerializer(read_only=True)
    current_student_count = serializers.ReadOnlyField()
    can_accept_students = serializers.ReadOnlyField()
    
    class Meta:
        model = MentorProfile
        fields = [
            'id', 'user', 'bio', 'expertise_areas', 'experience_level',
            'max_students', 'current_student_count', 'can_accept_students',
            'hourly_rate', 'timezone', 'availability_schedule', 'status',
            'rating', 'total_reviews', 'created_at', 'updated_at'
        ]
        read_only_fields = ['rating', 'total_reviews', 'created_at', 'updated_at']


class MentorProfileUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating mentor profiles"""
    
    class Meta:
        model = MentorProfile
        fields = [
            'bio', 'expertise_areas', 'experience_level', 'max_students',
            'hourly_rate', 'timezone', 'availability_schedule', 'status'
        ]


class MentorshipAssignmentSerializer(serializers.ModelSerializer):
    """Serializer for mentorship assignments"""
    mentor = UserBasicSerializer(read_only=True)
    student = UserBasicSerializer(read_only=True)
    cohort = CohortBasicSerializer(read_only=True)
    course = CourseBasicSerializer(read_only=True)
    assigned_by = UserBasicSerializer(read_only=True)
    
    mentor_id = serializers.IntegerField(write_only=True)
    student_id = serializers.IntegerField(write_only=True)
    cohort_id = serializers.IntegerField(write_only=True)
    course_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = MentorshipAssignment
        fields = [
            'id', 'uuid', 'mentor', 'student', 'cohort', 'course', 'status', 'priority',
            'assigned_by', 'assigned_at', 'started_at', 'completed_at',
            'expected_duration_weeks', 'notes', 'student_goals',
            'mentor_id', 'student_id', 'cohort_id', 'course_id',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['uuid', 'assigned_at', 'started_at', 'completed_at', 'created_at', 'updated_at']

    def create(self, validated_data):
        # Remove the _id fields and get the actual objects
        mentor_id = validated_data.pop('mentor_id')
        student_id = validated_data.pop('student_id')
        cohort_id = validated_data.pop('cohort_id')
        course_id = validated_data.pop('course_id', None)
        
        validated_data['mentor_id'] = mentor_id
        validated_data['student_id'] = student_id
        validated_data['cohort_id'] = cohort_id
        if course_id:
            validated_data['course_id'] = course_id
        
        validated_data['assigned_by'] = self.context['request'].user
        return super().create(validated_data)


class MentorSessionSerializer(serializers.ModelSerializer):
    """Serializer for mentor sessions"""
    assignment = serializers.PrimaryKeyRelatedField(read_only=True)
    assignment_id = serializers.IntegerField(write_only=True)
    is_upcoming = serializers.ReadOnlyField()
    
    class Meta:
        model = MentorSession
        fields = [
            'id', 'uuid', 'assignment', 'assignment_id', 'title', 'description',
            'session_type', 'scheduled_at', 'duration_minutes', 'actual_duration_minutes',
            'status', 'meeting_link', 'meeting_notes', 'agenda', 'outcomes',
            'student_rating', 'mentor_rating', 'is_upcoming',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['uuid', 'created_at', 'updated_at']


class MentorMessageSerializer(serializers.ModelSerializer):
    """Serializer for mentor messages"""
    sender = UserBasicSerializer(read_only=True)
    assignment = serializers.PrimaryKeyRelatedField(read_only=True)
    assignment_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = MentorMessage
        fields = [
            'id', 'uuid', 'assignment', 'assignment_id', 'sender', 'message_type',
            'content', 'file_url', 'metadata', 'is_read', 'read_at', 'reply_to',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['uuid', 'sender', 'is_read', 'read_at', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        if 'sender' not in validated_data:
            validated_data['sender'] = self.context['request'].user
        return super().create(validated_data)


class StudentProgressSerializer(serializers.ModelSerializer):
    """Serializer for student progress tracking"""
    assignment = serializers.PrimaryKeyRelatedField(read_only=True)
    assignment_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = StudentProgress
        fields = [
            'id', 'assignment', 'assignment_id', 'date', 'tasks_completed',
            'time_spent_minutes', 'engagement_score', 'technical_skills_rating',
            'communication_skills_rating', 'problem_solving_rating',
            'mentor_notes', 'student_reflection', 'goals_achieved', 'challenges_faced',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class MentorFeedbackSerializer(serializers.ModelSerializer):
    """Serializer for mentor feedback"""
    assignment = serializers.PrimaryKeyRelatedField(read_only=True)
    assignment_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = MentorFeedback
        fields = [
            'id', 'uuid', 'assignment', 'assignment_id', 'feedback_type',
            'title', 'content', 'task_id', 'question_id', 'overall_score',
            'strengths', 'improvement_areas', 'action_items',
            'student_acknowledged', 'student_response',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['uuid', 'created_at', 'updated_at']


class MentorshipGoalSerializer(serializers.ModelSerializer):
    """Serializer for mentorship goals"""
    assignment = serializers.PrimaryKeyRelatedField(read_only=True)
    assignment_id = serializers.IntegerField(write_only=True)
    created_by = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = MentorshipGoal
        fields = [
            'id', 'uuid', 'assignment', 'assignment_id', 'title', 'description',
            'status', 'priority', 'target_date', 'completed_at',
            'success_criteria', 'milestones', 'created_by',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['uuid', 'completed_at', 'created_by', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class MentorNotificationSerializer(serializers.ModelSerializer):
    """Serializer for mentor notifications"""
    recipient = UserBasicSerializer(read_only=True)
    assignment = serializers.PrimaryKeyRelatedField(read_only=True)
    session = serializers.PrimaryKeyRelatedField(read_only=True)
    
    class Meta:
        model = MentorNotification
        fields = [
            'id', 'uuid', 'recipient', 'notification_type', 'title', 'message',
            'assignment', 'session', 'is_read', 'read_at', 'action_url', 'metadata',
            'created_at'
        ]
        read_only_fields = ['uuid', 'is_read', 'read_at', 'created_at']


class MentorAnalyticsSerializer(serializers.ModelSerializer):
    """Serializer for mentor analytics"""
    mentor = UserBasicSerializer(read_only=True)
    
    class Meta:
        model = MentorAnalytics
        fields = [
            'id', 'mentor', 'date', 'sessions_conducted', 'total_session_time_minutes',
            'average_session_rating', 'active_students', 'students_helped',
            'messages_sent', 'feedback_given', 'student_satisfaction',
            'goal_completion_rate', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


# Dashboard and summary serializers
class MentorDashboardSerializer(serializers.Serializer):
    """Serializer for mentor dashboard data"""
    mentor_profile = MentorProfileSerializer()
    active_assignments = MentorshipAssignmentSerializer(many=True)
    upcoming_sessions = MentorSessionSerializer(many=True)
    recent_messages = MentorMessageSerializer(many=True)
    pending_feedback = MentorFeedbackSerializer(many=True)
    notifications = MentorNotificationSerializer(many=True)
    
    # Summary statistics
    total_students = serializers.IntegerField()
    completed_sessions_this_week = serializers.IntegerField()
    average_rating = serializers.DecimalField(max_digits=3, decimal_places=2)
    unread_messages = serializers.IntegerField()


class StudentSummarySerializer(serializers.Serializer):
    """Serializer for student summary in mentor view"""
    student = UserBasicSerializer()
    assignment = MentorshipAssignmentSerializer()
    latest_progress = StudentProgressSerializer()
    total_sessions = serializers.IntegerField()
    last_session_date = serializers.DateTimeField()
    unread_messages = serializers.IntegerField()
    current_goals = MentorshipGoalSerializer(many=True)


class MentorStatsSerializer(serializers.Serializer):
    """Serializer for mentor statistics"""
    total_mentorship_hours = serializers.IntegerField()
    total_students_mentored = serializers.IntegerField()
    average_session_rating = serializers.DecimalField(max_digits=3, decimal_places=2)
    completion_rate = serializers.DecimalField(max_digits=5, decimal_places=2)
    expertise_areas = serializers.ListField(child=serializers.CharField())
    monthly_sessions = serializers.ListField(child=serializers.IntegerField())
    student_satisfaction_trend = serializers.ListField(child=serializers.DecimalField(max_digits=3, decimal_places=2)) 