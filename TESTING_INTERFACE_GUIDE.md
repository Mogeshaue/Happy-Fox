# 🦊 Happy Fox LMS - Simple Testing Interface

## Overview
This is a comprehensive testing interface built from scratch to test all backend functionalities for your Happy Fox LMS system. The interface provides role-based access to test Admin, Mentor, and Student features.

## Features

### 🏗️ **Architecture**
- **Single Page Application** with role-based dashboards
- **Clean, Simple UI** focused on functionality testing
- **Direct API Integration** with your Django backend
- **Real-time API Testing** with visual feedback

### 👑 **Admin Dashboard**
Tests the following backend endpoints and functionality:

#### **Organization Management** (`/admin-flow/api/`)
- Load organizations
- View organization details
- Organization statistics

#### **User Management** (`/admin-flow/api/users/`)
- List all users
- View user details
- User management operations

#### **Course Management** (`/api/admin/courses/`)
- Load courses
- Create test courses
- Course administration

#### **Cohort Management** (`/api/admin/cohorts/`)
- Load cohorts
- Create test cohorts (requires courses)
- Cohort management

#### **Team Management** (`/api/admin/teams/`)
- Load teams
- Create test teams (requires cohorts)
- Team administration

#### **Quick Actions**
- Admin dashboard data
- Analytics
- API connection testing

### 🎓 **Mentor Dashboard**
Tests the following mentor-specific functionality:

#### **Mentor Profiles** (`/mentor/api/mentor-profiles/`)
- Load mentor profiles
- Create test mentor profiles
- Profile management

#### **Mentorship Assignments** (`/mentor/api/assignments/`)
- View assignments
- Assignment management
- Assignment activation

#### **Mentor Sessions** (`/mentor/api/sessions/`)
- Load sessions
- Create test sessions
- Session management

#### **Messages** (`/mentor/api/messages/`)
- Load messages
- Message management

#### **Mentor Tools**
- Personal profile access
- Assignment tracking
- Session scheduling

### 📚 **Student Dashboard**
Tests the following student-specific functionality:

#### **Student Profiles** (`/student-flow/api/profile/`)
- Load student profiles
- Create test profiles
- Student registration

#### **Learning Progress** (`/student-flow/api/progress/`)
- View learning progress
- Dashboard statistics
- Progress tracking

#### **Course Enrollments** (`/student-flow/api/enrollments/`)
- Load enrollments
- Enrollment management
- Progress tracking

#### **Assignments** (`/student-flow/api/assignments/`)
- Load assignments
- Assignment submissions
- Grade tracking

#### **Study Groups** (`/student-flow/api/study-groups/`)
- Load study groups
- Group management
- Member tracking

#### **Learning Goals** (`/student-flow/api/goals/`)
- Load learning goals
- Create test goals
- Goal management

#### **Learning Resources** (`/student-flow/api/resources/`)
- Load resources
- Public resources
- Resource management

#### **Basic Student Operations** (`/api/student/`)
- Student registration
- Student listing
- Authentication testing

## 🚀 **How to Use**

### **1. Start Backend**
```bash
cd backend/base_app
python manage.py runserver
```

### **2. Start Frontend**
```bash
cd frontend
npm run dev
```

### **3. Access Interface**
Open http://localhost:5173 in your browser

### **4. Test Functionality**
1. **Select Role**: Click on Admin, Mentor, or Student buttons
2. **Load Data**: Click "Load" buttons to fetch data from backend
3. **Create Data**: Click "Create Test" buttons to add sample data
4. **Monitor Results**: Watch the message area for API responses

## 🔧 **API Configuration**

### **Backend Base URL**
```javascript
const API_BASE = 'http://localhost:8000';
```

### **CORS Settings** 
The backend is configured to allow frontend requests:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://127.0.0.1:5173",
]
CORS_ALLOW_ALL_ORIGINS = True  # For development
```

### **Permissions**
Currently set to `AllowAny` for testing:
```python
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ]
}
```

## 📊 **Testing Workflow**

### **Admin Testing Flow**
1. Load organizations → Create courses → Create cohorts → Create teams
2. Test user management and analytics
3. Verify all admin endpoints

### **Mentor Testing Flow**
1. Create mentor profile
2. Load assignments and sessions
3. Test mentor-specific tools
4. Verify mentor endpoints

### **Student Testing Flow**
1. Register student → Create profile
2. Test enrollments and assignments
3. Create learning goals
4. Test study groups and resources
5. Verify student endpoints

## 🎯 **Expected Outcomes**

### **Success Indicators**
- ✅ Green success messages for API calls
- 📊 Data displayed in cards
- 🔄 Smooth role switching
- 📝 Test data creation

### **Error Handling**
- ❌ Red error messages for failed calls
- 📋 Detailed error information
- 🔍 Network issue identification

## 🛠️ **Troubleshooting**

### **Common Issues**
1. **CORS Errors**: Check backend CORS settings
2. **404 Errors**: Verify URL endpoints in backend
3. **Permission Errors**: Check Django permissions
4. **Connection Errors**: Ensure backend is running on port 8000

### **Debug Tips**
1. Open browser dev tools to see network requests
2. Check Django console for backend errors
3. Verify database has proper migrations
4. Test individual endpoints in browser/Postman

## 📈 **Next Steps**

After testing with this interface, you can:
1. **Add Authentication**: Implement proper login system
2. **Add Validation**: Include form validation
3. **Enhance UI**: Add more sophisticated design
4. **Add Features**: Implement missing functionality
5. **Deploy**: Prepare for production deployment

This testing interface gives you a complete overview of your backend functionality and helps identify any issues before building the final production UI.
