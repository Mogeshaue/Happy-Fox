from rest_framework import permissions
from .models import MentorProfile, UserCohort


class IsMentor(permissions.BasePermission):
    """
    Custom permission to only allow mentors to access mentor-specific views.
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Check if user has a mentor profile
        try:
            mentor_profile = MentorProfile.objects.get(user=request.user)
            return mentor_profile.status == MentorProfile.Status.ACTIVE
        except MentorProfile.DoesNotExist:
            return False
    
    def has_object_permission(self, request, view, obj):
        # For mentor-specific objects, ensure the user is the mentor
        if hasattr(obj, 'mentor'):
            return obj.mentor == request.user
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return True


class IsMentorOrStudent(permissions.BasePermission):
    """
    Custom permission to allow both mentors and students to access certain views.
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Check if user is a mentor
        try:
            mentor_profile = MentorProfile.objects.get(user=request.user)
            if mentor_profile.status == MentorProfile.Status.ACTIVE:
                return True
        except MentorProfile.DoesNotExist:
            pass
        
        # Check if user is a student (has learner role in any cohort)
        try:
            user_cohort = UserCohort.objects.filter(
                user=request.user, 
                role='learner'
            ).exists()
            return user_cohort
        except:
            return False
    
    def has_object_permission(self, request, view, obj):
        # For assignment-related objects, check if user is mentor or student
        if hasattr(obj, 'assignment'):
            return (obj.assignment.mentor == request.user or 
                   obj.assignment.student == request.user)
        if hasattr(obj, 'mentor') and hasattr(obj, 'student'):
            return (obj.mentor == request.user or obj.student == request.user)
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return True


class IsOrgAdmin(permissions.BasePermission):
    """
    Custom permission to only allow organization admins to access admin views.
    """
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Check if user has admin role in any organization
        try:
            from .models import UserOrganization
            admin_role = UserOrganization.objects.filter(
                user=request.user,
                role='admin'
            ).exists()
            return admin_role
        except:
            return False
    
    def has_object_permission(self, request, view, obj):
        # Ensure admin can only access objects from their organization
        if hasattr(obj, 'org'):
            try:
                from .models import UserOrganization
                return UserOrganization.objects.filter(
                    user=request.user,
                    org=obj.org,
                    role='admin'
                ).exists()
            except:
                return False
        return True 