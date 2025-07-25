# Sample Data Generation Guide

## Overview
This guide explains how to generate sample data for the Happy Fox LMS backend to test all the API endpoints and functionality.

## Available Commands

### 1. Quick Test Data (`create_test_data`)
Creates minimal test data for immediate testing:
- 1 test organization
- 1 super admin user (`admin@test.com`)
- 10 regular test users
- 1 test cohort
- 1 test course
- 3 sample tasks

**Usage:**
```bash
python manage.py create_test_data
```

### 2. Comprehensive Sample Data (`generate_sample_data`)
Creates realistic sample data for full testing:
- Multiple organizations
- Users with different roles
- Admin profiles
- Cohorts with enrollments
- Courses with tasks
- Task completions
- Admin actions log
- Notifications
- Analytics data
- System configurations

**Usage:**
```bash
# Default: 50 users, 3 organizations, 10 courses
python manage.py generate_sample_data

# Custom amounts
python manage.py generate_sample_data --users 30 --organizations 2 --courses 8

# Clear existing data first
python manage.py generate_sample_data --clear --users 20
```

**Available Options:**
- `--users`: Number of users to create (default: 50)
- `--organizations`: Number of organizations to create (default: 3)
- `--courses`: Number of courses to create (default: 10)
- `--clear`: Clear existing data before generating new data

### 3. Testing Commands
Additional commands for testing and validation:

**Field Compatibility Test:**
```bash
python manage.py test_fields
```

**Database Status Check:**
```bash
python manage.py check_data
```

## Generated Data Structure

### Organizations
- **TechEdu Institute**: Premium organization with advanced features
- **Future Skills Academy**: Basic organization with standard features
- **Innovation University**: Enterprise organization with full features

### Users
- **Super Admin**: `admin@test.com` (created by quick test data)
- **Organization Admins**: Users with admin roles in specific organizations
- **Regular Users**: Students and mentors enrolled in various cohorts

### Sample Courses
- Introduction to Python Programming (Beginner, 8 weeks)
- Web Development with React (Intermediate, 12 weeks)
- Data Science Fundamentals (Beginner, 10 weeks)
- Advanced Machine Learning (Advanced, 16 weeks)
- Database Design and SQL (Intermediate, 6 weeks)

### Task Types
- **Learning Materials**: Instructional content
- **Quizzes**: Multiple choice and text questions
- **Assignments**: Coding and project tasks
- **Projects**: Capstone and final projects

## Running the Full Setup

### Option 1: Using Batch Files (Windows)
1. **Backend**: Double-click `backend/run_backend.bat`
2. **Frontend**: Double-click `frontend/run_frontend.bat`

### Option 2: Manual Commands

**Backend Setup:**
```bash
# Navigate to backend directory
cd backend/base_app

# Activate virtual environment (if not activated)
.venv/Scripts/activate  # Windows
source .venv/bin/activate  # macOS/Linux

# Run migrations
python manage.py migrate

# Generate sample data
python manage.py create_test_data
python manage.py generate_sample_data --users 30 --organizations 2 --courses 8

# Start server
python manage.py runserver
```

**Frontend Setup:**
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Testing the Generated Data

### Admin Dashboard
1. Visit the React frontend (usually http://localhost:5173)
2. Click "API Test" tab to verify backend connectivity
3. Test admin functions with the generated admin users

### API Endpoints
With sample data loaded, you can test:

- **Organizations**: `/api/admin/organizations/`
- **Users**: `/api/admin/users/`
- **Courses**: `/api/admin/courses/`
- **Tasks**: `/api/admin/tasks/`
- **Analytics**: `/api/admin/analytics/`
- **Bulk Operations**: `/api/admin/bulk/`

### Sample Login Credentials
- **Super Admin**: `admin@test.com`
- **Test Users**: `user1@test.com`, `user2@test.com`, etc.
- **Sample Org Users**: `john.smith0@example.com`, `jane.johnson1@example.com`, etc.

## Data Relationships

The generated sample data creates realistic relationships:
- Users are enrolled in cohorts
- Courses are assigned to cohorts
- Tasks are part of courses
- Users have completion records for tasks
- Admin actions are logged
- Analytics data tracks usage patterns

## Clearing Data

To start fresh:
```bash
python manage.py generate_sample_data --clear
```

This will remove all existing data before generating new sample data.

## Troubleshooting

### Fixed Issues ✅
- **FieldError: Cannot resolve keyword 'last_login'**: Fixed by updating signals and views to use `last_accessed` field from UserOrganization model instead of non-existent `last_login` field
- **TypeError: AdminProfile() got unexpected keyword arguments**: Fixed by removing `login_attempts` field and correcting `permissions` field format to use list instead of dict
- **Question model field mismatches**: Fixed by updating field names to match actual model (using `title`, `content`, `position` instead of `question_text`, `ordering`)

### Common Issues
1. **Migration errors**: Run `python manage.py migrate` first
2. **Permission errors**: Ensure virtual environment is activated
3. **Data conflicts**: Use `--clear` flag to start fresh
4. **Field errors**: The system uses `last_accessed` instead of `last_login` for activity tracking

### Database Reset
If you need to completely reset the database:
```bash
# Delete database file
rm db.sqlite3

# Recreate database
python manage.py migrate

# Generate fresh sample data
python manage.py create_test_data
```

## Next Steps

After generating sample data:
1. Start both backend and frontend servers
2. Test the API endpoints using the React testing interface
3. Verify data relationships and functionality
4. Use the admin interface to manage the generated data

The sample data provides a comprehensive foundation for testing all aspects of the Happy Fox LMS platform.
