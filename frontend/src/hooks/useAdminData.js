import { useState, useEffect } from 'react';

// Custom hook for admin data management - Single Responsibility
export const useAdminData = (adminService) => {
  const [data, setData] = useState({
    courses: [],
    cohorts: [],
    teams: [],
    invitations: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async (type) => {
    setLoading(true);
    setError('');
    
    try {
      let result;
      switch (type) {
        case 'courses':
          result = await adminService.getCourses();
          break;
        case 'cohorts':
          result = await adminService.getCohorts();
          break;
        case 'teams':
          result = await adminService.getTeams();
          break;
        case 'invitations':
          result = await adminService.getInvitations();
          break;
        default:
          throw new Error(`Unknown data type: ${type}`);
      }
      
      setData(prev => ({
        ...prev,
        [type]: Array.isArray(result) ? result : []
      }));
    } catch (error) {
      setError(`Failed to fetch ${type}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (type, itemData) => {
    setLoading(true);
    setError('');
    
    try {
      let createFunction;
      switch (type) {
        case 'courses':
          createFunction = adminService.createCourse.bind(adminService);
          break;
        case 'cohorts':
          createFunction = adminService.createCohort.bind(adminService);
          break;
        case 'teams':
          createFunction = adminService.createTeam.bind(adminService);
          break;
        case 'invitations':
          createFunction = adminService.createInvitation.bind(adminService);
          break;
        default:
          throw new Error(`Unknown data type: ${type}`);
      }
      
      await createFunction(itemData);
      await fetchData(type); // Refresh data
    } catch (error) {
      setError(`Failed to create ${type}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteItem = async (type, id) => {
    setLoading(true);
    setError('');
    
    try {
      let deleteFunction;
      switch (type) {
        case 'courses':
          deleteFunction = adminService.deleteCourse.bind(adminService);
          break;
        case 'cohorts':
          deleteFunction = adminService.deleteCohort.bind(adminService);
          break;
        case 'teams':
          deleteFunction = adminService.deleteTeam.bind(adminService);
          break;
        case 'invitations':
          deleteFunction = adminService.deleteInvitation.bind(adminService);
          break;
        default:
          throw new Error(`Unknown data type: ${type}`);
      }
      
      await deleteFunction(id);
      await fetchData(type); // Refresh data
    } catch (error) {
      setError(`Failed to delete ${type}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllData = async () => {
    await Promise.all([
      fetchData('courses'),
      fetchData('cohorts'),
      fetchData('teams'),
      fetchData('invitations')
    ]);
  };

  return {
    data,
    loading,
    error,
    fetchData,
    createItem,
    deleteItem,
    fetchAllData
  };
};
