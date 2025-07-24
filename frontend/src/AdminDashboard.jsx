import React, { useState, useEffect } from 'react';
import { useAdminData } from './hooks/useAdminData';
import { adminService } from './services/AdminService';
import { AdminForm, DataTable } from './components/admin/AdminComponents';
import { ErrorDisplay, LoadingSpinner } from './components/common/CommonComponents';
import './AdminDashboard.css';

// Admin Dashboard - Following Single Responsibility Principle
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const { data, loading, error, createItem, deleteItem, fetchAllData } = useAdminData(adminService);

  useEffect(() => {
    fetchAllData();
  }, []);

  // Configuration objects following Open/Closed Principle
  const tabConfig = {
    courses: {
      label: 'Courses',
      formFields: [
        { name: 'name', placeholder: 'Course Name', required: true },
        { name: 'description', type: 'textarea', placeholder: 'Course Description', required: true }
      ],
      columns: [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'description', label: 'Description' },
        { 
          key: 'created_at', 
          label: 'Created',
          render: (item) => new Date(item.created_at).toLocaleDateString()
        }
      ]
    },
    cohorts: {
      label: 'Cohorts',
      formFields: [
        { name: 'name', placeholder: 'Cohort Name', required: true },
        { 
          name: 'course', 
          type: 'select', 
          placeholder: 'Select Course',
          required: true,
          options: data.courses.map(course => ({ value: course.id, label: course.name }))
        },
        { name: 'start_date', type: 'date', placeholder: 'Start Date', required: true },
        { name: 'end_date', type: 'date', placeholder: 'End Date', required: true }
      ],
      columns: [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { 
          key: 'course', 
          label: 'Course',
          render: (item) => {
            const course = data.courses.find(c => c.id === item.course);
            return course ? course.name : `Course ${item.course}`;
          }
        },
        { key: 'start_date', label: 'Start Date' },
        { key: 'end_date', label: 'End Date' }
      ]
    },
    teams: {
      label: 'Teams',
      formFields: [
        { name: 'name', placeholder: 'Team Name', required: true },
        { 
          name: 'cohort', 
          type: 'select', 
          placeholder: 'Select Cohort',
          required: true,
          options: data.cohorts.map(cohort => ({ value: cohort.id, label: cohort.name }))
        }
      ],
      columns: [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { 
          key: 'cohort', 
          label: 'Cohort',
          render: (item) => {
            const cohort = data.cohorts.find(c => c.id === item.cohort);
            return cohort ? cohort.name : `Cohort ${item.cohort}`;
          }
        }
      ]
    },
    invitations: {
      label: 'Invitations',
      formFields: [
        { name: 'email', type: 'email', placeholder: 'Email Address', required: true },
        { 
          name: 'team', 
          type: 'select', 
          placeholder: 'Select Team',
          required: true,
          options: data.teams.map(team => ({ value: team.id, label: team.name }))
        }
      ],
      columns: [
        { key: 'id', label: 'ID' },
        { key: 'email', label: 'Email' },
        { 
          key: 'team', 
          label: 'Team',
          render: (item) => {
            const team = data.teams.find(t => t.id === item.team);
            return team ? team.name : `Team ${item.team}`;
          }
        },
        { 
          key: 'accepted', 
          label: 'Status',
          render: (item) => (
            <span style={{
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              backgroundColor: item.accepted ? '#d4edda' : '#fff3cd',
              color: item.accepted ? '#155724' : '#856404',
              border: `1px solid ${item.accepted ? '#c3e6cb' : '#ffeaa7'}`
            }}>
              {item.accepted ? 'Accepted' : 'Pending'}
            </span>
          )
        },
        { 
          key: 'created_at', 
          label: 'Created',
          render: (item) => new Date(item.created_at).toLocaleDateString()
        }
      ]
    }
  };

  const currentConfig = tabConfig[activeTab];

  const handleCreate = async (formData) => {
    // Add default values for invitations
    if (activeTab === 'invitations') {
      formData.invited_by = 3; // Using test user ID
    }
    await createItem(activeTab, formData);
  };

  const handleDelete = async (id) => {
    await deleteItem(activeTab, id);
  };

  return (
    <div className="admin-dashboard">
      <h1>LMS Admin Dashboard</h1>
      
      <ErrorDisplay error={error} />

      <nav className="admin-nav">
        {Object.entries(tabConfig).map(([key, config]) => (
          <button 
            key={key}
            className={activeTab === key ? 'active' : ''} 
            onClick={() => setActiveTab(key)}
          >
            {config.label} ({data[key]?.length || 0})
          </button>
        ))}
      </nav>

      {loading && <LoadingSpinner />}

      <div className="tab-content">
        <h2>{currentConfig.label} Management</h2>
        
        <div className="form-section">
          <h3>Create New {currentConfig.label.slice(0, -1)}</h3>
          <div className="form-group">
            <AdminForm
              fields={currentConfig.formFields}
              onSubmit={handleCreate}
              submitLabel={`Create ${currentConfig.label.slice(0, -1)}`}
              loading={loading}
            />
          </div>
        </div>

        <div className="list-section">
          <h3>Existing {currentConfig.label}</h3>
          <DataTable
            columns={currentConfig.columns}
            data={data[activeTab]}
            onDelete={handleDelete}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
