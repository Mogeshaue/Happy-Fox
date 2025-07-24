
from django.db import models

class Student(models.Model):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=255, blank=True, null=True)
    middle_name = models.CharField(max_length=255, blank=True, null=True)
    last_name = models.CharField(max_length=255, blank=True, null=True)
    default_dp_color = models.CharField(max_length=50, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.email
    
    @property
    def full_name(self):
        """Return full name combining first, middle, and last names"""
        names = [self.first_name, self.middle_name, self.last_name]
        return ' '.join(filter(None, names)) or self.email