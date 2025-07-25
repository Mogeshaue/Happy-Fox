from rest_framework import permissions
from django.db.models import Q
from .models import (
    StudentProfile, StudentEnrollment, StudyGroup, StudyGroupMembership,
    LearningSession, AssignmentSubmission, UserCohort, UserOrganization
)


class IsStudent(permissions.BasePermission):
    """
    Permission to check if user is a student (has student profile or learner role)
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Check if user has student profile
        if hasattr(request.user, 'student_profile'):
            return request.user.student_profile.status == 'active'
        
        # Check if user has learner role in any cohort
        return UserCohort.objects.filter(
            user=request.user, 
            role='learner',
            status='active'
        ).exists()


class IsStudentOwner(permissions.BasePermission):
    """
    Permission to check if the student owns the object
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        # Check if the object belongs to the requesting student
        if hasattr(obj, 'student'):
            return obj.student == request.user
        elif hasattr(obj, 'user'):
            return obj.user == request.user
        
        return False


class IsStudentOrReadOnly(permissions.BasePermission):
    """
    Permission that allows read access to all, but write access only to students
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        
        if not request.user.is_authenticated:
            return False
        
        # Check if user is a student
        return (hasattr(request.user, 'student_profile') or 
                UserCohort.objects.filter(
                    user=request.user, 
                    role='learner'
                ).exists())


class CanAccessEnrollment(permissions.BasePermission):
    """
    Permission to check if user can access enrollment information
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        user = request.user
        
        # Student can access their own enrollment
        if obj.student == user:
            return True
        
        # Mentors can access their students' enrollments
        if UserCohort.objects.filter(
            user=user,
            cohort=obj.cohort,
            role='mentor'
        ).exists():
            return True
        
        # Organization admins can access enrollments in their org
        if UserOrganization.objects.filter(
            user=user,
            org=obj.course.org,
            role__in=['admin', 'owner']
        ).exists():
            return True
        
        return False


class CanAccessStudyGroup(permissions.BasePermission):
    """
    Permission to check if user can access study group
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        user = request.user
        
        # Group creator and moderators have full access
        if obj.creator == user or user in obj.moderators.all():
            return True
        
        # Active members can access
        if obj.memberships.filter(
            student=user,
            status='active'
        ).exists():
            return True
        
        # For open groups, allow read access
        if request.method in permissions.SAFE_METHODS and obj.join_policy == 'open':
            return True
        
        # Organization admins can access groups in their org
        if UserOrganization.objects.filter(
            user=user,
            org=obj.organization,
            role__in=['admin', 'owner']
        ).exists():
            return True
        
        return False


class CanJoinStudyGroup(permissions.BasePermission):
    """
    Permission to check if user can join a study group
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        user = request.user
        
        # Check if user is already a member
        if obj.memberships.filter(student=user).exists():
            return False
        
        # Check if group is full
        if obj.is_full:
            return False
        
        # Check if user is in the same organization
        if not UserOrganization.objects.filter(
            user=user,
            org=obj.organization
        ).exists():
            return False
        
        # Check if group has course/cohort restrictions
        if obj.course:
            # User must be enrolled in the course
            if not StudentEnrollment.objects.filter(
                student=user,
                course=obj.course,
                status__in=['enrolled', 'in_progress']
            ).exists():
                return False
        
        if obj.cohort:
            # User must be in the cohort
            if not UserCohort.objects.filter(
                user=user,
                cohort=obj.cohort,
                role='learner'
            ).exists():
                return False
        
        return True


class CanModerateStudyGroup(permissions.BasePermission):
    """
    Permission to check if user can moderate study group
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        user = request.user
        
        # Group creator and moderators can moderate
        if obj.creator == user or user in obj.moderators.all():
            return True
        
        # Organization admins can moderate groups in their org
        if UserOrganization.objects.filter(
            user=user,
            org=obj.organization,
            role__in=['admin', 'owner']
        ).exists():
            return True
        
        return False


class CanViewStudentProgress(permissions.BasePermission):
    """
    Permission to check if user can view student progress
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        user = request.user
        
        # Student can view their own progress
        if hasattr(obj, 'student') and obj.student == user:
            return True
        elif hasattr(obj, 'user') and obj.user == user:
            return True
        
        # Mentors can view their students' progress
        student = getattr(obj, 'student', getattr(obj, 'user', None))
        if student:
            # Check if user is a mentor for this student
            from mentor_flow.models import MentorshipAssignment
            if MentorshipAssignment.objects.filter(
                mentor=user,
                student=student,
                status='active'
            ).exists():
                return True
        
        # Organization admins can view progress in their org
        org = None
        if hasattr(obj, 'course') and obj.course:
            org = obj.course.org
        elif hasattr(obj, 'organization'):
            org = obj.organization
        
        if org and UserOrganization.objects.filter(
            user=user,
            org=org,
            role__in=['admin', 'owner']
        ).exists():
            return True
        
        return False


class CanSubmitAssignment(permissions.BasePermission):
    """
    Permission to check if user can submit assignment
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Only students can submit assignments
        return (hasattr(request.user, 'student_profile') or 
                UserCohort.objects.filter(
                    user=request.user, 
                    role='learner'
                ).exists())

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        # Student can only access their own submissions
        if obj.student == request.user:
            return True
        
        # Check if this is for creating a new submission
        if not hasattr(obj, 'id'):
            return True
        
        return False


class CanGradeAssignment(permissions.BasePermission):
    """
    Permission to check if user can grade assignments
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        user = request.user
        
        # Organization admins can grade
        if UserOrganization.objects.filter(
            user=user,
            org=obj.course.org,
            role__in=['admin', 'owner']
        ).exists():
            return True
        
        # Mentors can grade their students' assignments
        from mentor_flow.models import MentorshipAssignment
        if MentorshipAssignment.objects.filter(
            mentor=user,
            student=obj.student,
            status='active'
        ).exists():
            return True
        
        # Course instructors can grade (if they have mentor role in cohort)
        if UserCohort.objects.filter(
            user=user,
            cohort__coursecohort__course=obj.course,
            role='mentor'
        ).exists():
            return True
        
        return False


class CanAccessLearningResource(permissions.BasePermission):
    """
    Permission to check if user can access learning resources
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        user = request.user
        
        # Student can access their own resources
        if obj.student == user:
            return True
        
        # Public resources can be viewed by students in same context
        if obj.is_public:
            # Same organization
            if obj.course and StudentEnrollment.objects.filter(
                student=user,
                course=obj.course
            ).exists():
                return True
            
            # Same study group
            if StudyGroupMembership.objects.filter(
                student=user,
                study_group__course=obj.course,
                status='active'
            ).exists():
                return True
        
        # Organization admins can access resources in their org
        if obj.course and UserOrganization.objects.filter(
            user=user,
            org=obj.course.org,
            role__in=['admin', 'owner']
        ).exists():
            return True
        
        return False


class CanManageGoals(permissions.BasePermission):
    """
    Permission to check if user can manage learning goals
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        user = request.user
        
        # Student can manage their own goals
        if obj.student == user:
            return True
        
        # Mentors can view and comment on their students' goals
        from mentor_flow.models import MentorshipAssignment
        if MentorshipAssignment.objects.filter(
            mentor=user,
            student=obj.student,
            status='active'
        ).exists():
            # Mentors can view but not modify goals
            return request.method in permissions.SAFE_METHODS
        
        return False


class CanAccessNotifications(permissions.BasePermission):
    """
    Permission to check if user can access notifications
    """
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        # Users can only access their own notifications
        return obj.recipient == request.user


class CanAccessAnalytics(permissions.BasePermission):
    """
    Permission to check if user can access analytics
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        user = request.user
        
        # Student can access their own analytics
        if obj.student == user:
            return True
        
        # Mentors can access their students' analytics
        from mentor_flow.models import MentorshipAssignment
        if MentorshipAssignment.objects.filter(
            mentor=user,
            student=obj.student,
            status='active'
        ).exists():
            return True
        
        # Organization admins can access analytics for students in their org
        if UserOrganization.objects.filter(
            user=user,
            role__in=['admin', 'owner']
        ).exists():
            # Check if student is in any of the admin's organizations
            student_orgs = UserOrganization.objects.filter(
                user=obj.student
            ).values_list('org_id', flat=True)
            
            admin_orgs = UserOrganization.objects.filter(
                user=user,
                role__in=['admin', 'owner']
            ).values_list('org_id', flat=True)
            
            return bool(set(student_orgs).intersection(set(admin_orgs)))
        
        return False


class StudentInSameOrganization(permissions.BasePermission):
    """
    Check if student is in the same organization as the requested resource
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        user_orgs = UserOrganization.objects.filter(
            user=request.user
        ).values_list('org_id', flat=True)
        
        obj_org = None
        if hasattr(obj, 'organization'):
            obj_org = obj.organization.id
        elif hasattr(obj, 'course') and obj.course:
            obj_org = obj.course.org.id
        elif hasattr(obj, 'org'):
            obj_org = obj.org.id
        
        return obj_org in user_orgs if obj_org else False


class StudentInSameCohort(permissions.BasePermission):
    """
    Check if student is in the same cohort as the requested resource
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        user_cohorts = UserCohort.objects.filter(
            user=request.user,
            role='learner'
        ).values_list('cohort_id', flat=True)
        
        obj_cohort = None
        if hasattr(obj, 'cohort'):
            obj_cohort = obj.cohort.id
        elif hasattr(obj, 'course') and obj.course:
            # Get cohorts for this course
            course_cohorts = obj.course.coursecohort_set.values_list('cohort_id', flat=True)
            return bool(set(user_cohorts).intersection(set(course_cohorts)))
        
        return obj_cohort in user_cohorts if obj_cohort else False


# Compound permissions for complex scenarios
class StudentOrMentor(permissions.BasePermission):
    """
    Permission that allows access to students or mentors
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        user = request.user
        
        # Check if user is a student
        if (hasattr(user, 'student_profile') or 
            UserCohort.objects.filter(user=user, role='learner').exists()):
            return True
        
        # Check if user is a mentor
        if UserCohort.objects.filter(user=user, role='mentor').exists():
            return True
        
        return False


class StudentOrAdminReadOnly(permissions.BasePermission):
    """
    Full access for students to their own data, read-only for admins
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        user = request.user
        
        # Student has full access to their own data
        student = getattr(obj, 'student', getattr(obj, 'user', None))
        if student == user:
            return True
        
        # Admins have read-only access
        if request.method in permissions.SAFE_METHODS:
            return UserOrganization.objects.filter(
                user=user,
                role__in=['admin', 'owner']
            ).exists()
        
        return False


class EnrolledStudentOnly(permissions.BasePermission):
    """
    Permission for students enrolled in specific courses
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Check if user is a student
        return (hasattr(request.user, 'student_profile') or 
                UserCohort.objects.filter(
                    user=request.user, 
                    role='learner'
                ).exists())

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        user = request.user
        course = None
        
        # Extract course from object
        if hasattr(obj, 'course'):
            course = obj.course
        elif hasattr(obj, 'task') and obj.task:
            # Get course from task (via CourseTask relationship)
            from .models import CourseTask
            course_task = CourseTask.objects.filter(task=obj.task).first()
            if course_task:
                course = course_task.course
        
        if not course:
            return False
        
        # Check if user is enrolled in the course
        return StudentEnrollment.objects.filter(
            student=user,
            course=course,
            status__in=['enrolled', 'in_progress']
        ).exists()


class ActiveStudentOnly(permissions.BasePermission):
    """
    Permission for active students only
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Check if user has active student profile
        try:
            profile = request.user.student_profile
            return profile.status == 'active'
        except:
            # Fallback to checking active learner role
            return UserCohort.objects.filter(
                user=request.user,
                role='learner',
                status='active'
            ).exists() 