from rest_framework import permissions
from django.db.models import Q
from .models import AdminProfile, UserOrganization, Organization


class IsAdminUser(permissions.BasePermission):
    """
    Permission to check if user is an admin (has AdminProfile)
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        return hasattr(request.user, 'admin_profile') and request.user.admin_profile.is_active


class IsSuperAdmin(permissions.BasePermission):
    """
    Permission for super admin access only
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        try:
            profile = request.user.admin_profile
            return profile.is_active and profile.role == AdminProfile.Role.SUPER_ADMIN
        except AttributeError:
            return False


class IsOrgAdmin(permissions.BasePermission):
    """
    Permission to check if user is an organization admin
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Check if user has admin or owner role in any organization
        return UserOrganization.objects.filter(
            user=request.user, 
            role__in=['admin', 'owner']
        ).exists()

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        # For Organization objects
        if isinstance(obj, Organization):
            return UserOrganization.objects.filter(
                user=request.user,
                org=obj,
                role__in=['admin', 'owner']
            ).exists()
        
        # For objects with organization relationship
        if hasattr(obj, 'organization'):
            return UserOrganization.objects.filter(
                user=request.user,
                org=obj.organization,
                role__in=['admin', 'owner']
            ).exists()
        
        # For objects with org field
        if hasattr(obj, 'org'):
            return UserOrganization.objects.filter(
                user=request.user,
                org=obj.org,
                role__in=['admin', 'owner']
            ).exists()
        
        return False


class IsContentAdmin(permissions.BasePermission):
    """
    Permission for content management operations
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        try:
            profile = request.user.admin_profile
            return (profile.is_active and 
                   profile.role in [AdminProfile.Role.SUPER_ADMIN, 
                                  AdminProfile.Role.CONTENT_ADMIN,
                                  AdminProfile.Role.ORG_ADMIN])
        except AttributeError:
            # Fallback to org admin check
            return self._is_org_admin(request.user)
    
    def _is_org_admin(self, user):
        return UserOrganization.objects.filter(
            user=user, 
            role__in=['admin', 'owner']
        ).exists()


class IsSupportAdmin(permissions.BasePermission):
    """
    Permission for support operations
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        try:
            profile = request.user.admin_profile
            return (profile.is_active and 
                   profile.role in [AdminProfile.Role.SUPER_ADMIN, 
                                  AdminProfile.Role.SUPPORT_ADMIN])
        except AttributeError:
            return False


class CanManageOrganization(permissions.BasePermission):
    """
    Permission to manage specific organization
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        user = request.user
        
        # Super admin can manage all organizations
        try:
            if (hasattr(user, 'admin_profile') and 
                user.admin_profile.role == AdminProfile.Role.SUPER_ADMIN):
                return True
        except AttributeError:
            pass
        
        # Organization must be in the admin's managed organizations
        if hasattr(user, 'admin_profile'):
            if obj in user.admin_profile.organizations.all():
                return True
        
        # Or user must be admin/owner of the organization
        return UserOrganization.objects.filter(
            user=user,
            org=obj,
            role__in=['admin', 'owner']
        ).exists()


class CanManageUsers(permissions.BasePermission):
    """
    Permission to manage users within organizations
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Super admin can manage all users
        try:
            if (hasattr(request.user, 'admin_profile') and 
                request.user.admin_profile.role == AdminProfile.Role.SUPER_ADMIN):
                return True
        except AttributeError:
            pass
        
        # Org admin can manage users in their organizations
        return UserOrganization.objects.filter(
            user=request.user, 
            role__in=['admin', 'owner']
        ).exists()

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        user = request.user
        
        # Super admin can manage all users
        try:
            if (hasattr(user, 'admin_profile') and 
                user.admin_profile.role == AdminProfile.Role.SUPER_ADMIN):
                return True
        except AttributeError:
            pass
        
        # Can manage users in same organizations
        user_orgs = set(UserOrganization.objects.filter(
            user=user, 
            role__in=['admin', 'owner']
        ).values_list('org_id', flat=True))
        
        target_user_orgs = set(UserOrganization.objects.filter(
            user=obj
        ).values_list('org_id', flat=True))
        
        return bool(user_orgs.intersection(target_user_orgs))


class CanManageContent(permissions.BasePermission):
    """
    Permission to manage content (courses, tasks, etc.)
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        try:
            profile = request.user.admin_profile
            return (profile.is_active and 
                   profile.role in [AdminProfile.Role.SUPER_ADMIN, 
                                  AdminProfile.Role.CONTENT_ADMIN,
                                  AdminProfile.Role.ORG_ADMIN])
        except AttributeError:
            # Fallback for org admins without admin profile
            return UserOrganization.objects.filter(
                user=request.user, 
                role__in=['admin', 'owner']
            ).exists()

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        user = request.user
        
        # Super admin can manage all content
        try:
            if (hasattr(user, 'admin_profile') and 
                user.admin_profile.role == AdminProfile.Role.SUPER_ADMIN):
                return True
        except AttributeError:
            pass
        
        # Content must belong to admin's organization
        org_field = None
        if hasattr(obj, 'organization'):
            org_field = obj.organization
        elif hasattr(obj, 'org'):
            org_field = obj.org
        
        if org_field:
            return UserOrganization.objects.filter(
                user=user,
                org=org_field,
                role__in=['admin', 'owner']
            ).exists()
        
        return False


class CanViewAnalytics(permissions.BasePermission):
    """
    Permission to view analytics data
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # All admin types can view analytics
        try:
            return hasattr(request.user, 'admin_profile') and request.user.admin_profile.is_active
        except AttributeError:
            # Fallback for org admins
            return UserOrganization.objects.filter(
                user=request.user, 
                role__in=['admin', 'owner']
            ).exists()

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        user = request.user
        
        # Super admin can view all analytics
        try:
            if (hasattr(user, 'admin_profile') and 
                user.admin_profile.role == AdminProfile.Role.SUPER_ADMIN):
                return True
        except AttributeError:
            pass
        
        # Analytics must be for admin's organization
        if hasattr(obj, 'organization'):
            return UserOrganization.objects.filter(
                user=user,
                org=obj.organization,
                role__in=['admin', 'owner']
            ).exists()
        
        return False


class CanPerformBulkOperations(permissions.BasePermission):
    """
    Permission for bulk operations
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        try:
            profile = request.user.admin_profile
            return (profile.is_active and 
                   profile.role in [AdminProfile.Role.SUPER_ADMIN, 
                                  AdminProfile.Role.ORG_ADMIN])
        except AttributeError:
            # Fallback for org admins
            return UserOrganization.objects.filter(
                user=request.user, 
                role__in=['admin', 'owner']
            ).exists()


class CanManageSystemConfig(permissions.BasePermission):
    """
    Permission to manage system configuration
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        try:
            profile = request.user.admin_profile
            return (profile.is_active and 
                   profile.role == AdminProfile.Role.SUPER_ADMIN)
        except AttributeError:
            return False

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        user = request.user
        
        # Super admin can manage all configs
        try:
            if (hasattr(user, 'admin_profile') and 
                user.admin_profile.role == AdminProfile.Role.SUPER_ADMIN):
                return True
        except AttributeError:
            pass
        
        # Org-specific configs can be managed by org admins
        if hasattr(obj, 'organization') and obj.organization:
            return UserOrganization.objects.filter(
                user=user,
                org=obj.organization,
                role__in=['admin', 'owner']
            ).exists()
        
        return False


class CanGenerateContent(permissions.BasePermission):
    """
    Permission for AI content generation
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        try:
            profile = request.user.admin_profile
            return (profile.is_active and 
                   profile.role in [AdminProfile.Role.SUPER_ADMIN, 
                                  AdminProfile.Role.CONTENT_ADMIN,
                                  AdminProfile.Role.ORG_ADMIN])
        except AttributeError:
            # Fallback for org admins
            return UserOrganization.objects.filter(
                user=request.user, 
                role__in=['admin', 'owner']
            ).exists()


class CanManageNotifications(permissions.BasePermission):
    """
    Permission to manage admin notifications
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        
        # Users can manage their own notifications
        if obj.recipient == request.user:
            return True
        
        # Super admin can manage all notifications
        try:
            if (hasattr(request.user, 'admin_profile') and 
                request.user.admin_profile.role == AdminProfile.Role.SUPER_ADMIN):
                return True
        except AttributeError:
            pass
        
        return False


# Compound permissions for complex scenarios
class AdminOrOrgOwner(permissions.BasePermission):
    """
    Permission that allows access to admins or organization owners
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        user = request.user
        
        # Check if user has admin profile
        try:
            if hasattr(user, 'admin_profile') and user.admin_profile.is_active:
                return True
        except AttributeError:
            pass
        
        # Check if user is org owner
        return UserOrganization.objects.filter(
            user=user, 
            role='owner'
        ).exists()


class ReadOnlyForNonAdmins(permissions.BasePermission):
    """
    Read-only permission for non-admin users, full access for admins
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Full access for admins
        try:
            if hasattr(request.user, 'admin_profile') and request.user.admin_profile.is_active:
                return True
        except AttributeError:
            pass
        
        # Read-only for others
        return request.method in permissions.SAFE_METHODS


class OrganizationScopedPermission(permissions.BasePermission):
    """
    Base permission class for organization-scoped resources
    """
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # Super admin has access to everything
        try:
            if (hasattr(request.user, 'admin_profile') and 
                request.user.admin_profile.role == AdminProfile.Role.SUPER_ADMIN):
                return True
        except AttributeError:
            pass
        
        # Must be admin in at least one organization
        return UserOrganization.objects.filter(
            user=request.user, 
            role__in=['admin', 'owner']
        ).exists()

    def get_user_organizations(self, user):
        """Get organizations where user has admin privileges"""
        try:
            if (hasattr(user, 'admin_profile') and 
                user.admin_profile.role == AdminProfile.Role.SUPER_ADMIN):
                return Organization.objects.all()
        except AttributeError:
            pass
        
        return Organization.objects.filter(
            userorganization__user=user,
            userorganization__role__in=['admin', 'owner']
        )


class HasSpecificPermission(permissions.BasePermission):
    """
    Check for specific permissions in admin profile
    """
    def __init__(self, required_permission):
        self.required_permission = required_permission

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        try:
            profile = request.user.admin_profile
            if not profile.is_active:
                return False
            
            # Super admin has all permissions
            if profile.role == AdminProfile.Role.SUPER_ADMIN:
                return True
            
            # Check specific permission
            return self.required_permission in profile.permissions
        except AttributeError:
            return False 