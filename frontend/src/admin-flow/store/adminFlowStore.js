/**
 * Admin Flow Store - State management using Zustand
 * Single Responsibility: Manage admin flow application state
 * Following the mentor store pattern
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import AdminFlowAPI from '../services/AdminFlowAPI.js';

const useAdminFlowStore = create(
  devtools(
    (set, get) => ({
      // State
      dashboardData: null,
      organizations: [],
      users: [],
      notifications: [],
      systemConfig: null,
      analytics: null,
      currentOrganization: null,
      isLoading: false,
      isInitialized: false,
      error: null,

      // Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setInitialized: (initialized) => set({ isInitialized: initialized }),

      // Dashboard Actions
      fetchDashboardData: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await AdminFlowAPI.getDashboardData();
          set({ 
            dashboardData: data.dashboard,
            analytics: data.analytics,
            notifications: data.notifications,
            isLoading: false 
          });
          return data;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Organization Actions
      fetchOrganizations: async () => {
        set({ isLoading: true, error: null });
        try {
          const organizations = await AdminFlowAPI.organizations.getOrganizations();
          set({ organizations, isLoading: false });
          return organizations;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      createOrganization: async (orgData) => {
        set({ isLoading: true, error: null });
        try {
          const newOrg = await AdminFlowAPI.organizations.createOrganization(orgData);
          const currentOrgs = get().organizations;
          set({ 
            organizations: [...currentOrgs, newOrg],
            isLoading: false 
          });
          return newOrg;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      updateOrganization: async (id, orgData) => {
        set({ isLoading: true, error: null });
        try {
          const updatedOrg = await AdminFlowAPI.organizations.updateOrganization(id, orgData);
          const currentOrgs = get().organizations;
          const updatedOrgs = currentOrgs.map(org => 
            org.id === id ? updatedOrg : org
          );
          set({ 
            organizations: updatedOrgs,
            isLoading: false 
          });
          return updatedOrg;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      deleteOrganization: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await AdminFlowAPI.organizations.deleteOrganization(id);
          const currentOrgs = get().organizations;
          const filteredOrgs = currentOrgs.filter(org => org.id !== id);
          set({ 
            organizations: filteredOrgs,
            isLoading: false 
          });
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // User Actions
      fetchUsers: async (params = {}) => {
        set({ isLoading: true, error: null });
        try {
          const users = await AdminFlowAPI.users.getUsers(params);
          set({ users, isLoading: false });
          return users;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      createUser: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const newUser = await AdminFlowAPI.users.createUser(userData);
          const currentUsers = get().users;
          set({ 
            users: [...currentUsers, newUser],
            isLoading: false 
          });
          return newUser;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      updateUser: async (id, userData) => {
        set({ isLoading: true, error: null });
        try {
          const updatedUser = await AdminFlowAPI.users.updateUser(id, userData);
          const currentUsers = get().users;
          const updatedUsers = currentUsers.map(user => 
            user.id === id ? updatedUser : user
          );
          set({ 
            users: updatedUsers,
            isLoading: false 
          });
          return updatedUser;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      deleteUser: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await AdminFlowAPI.users.deleteUser(id);
          const currentUsers = get().users;
          const filteredUsers = currentUsers.filter(user => user.id !== id);
          set({ 
            users: filteredUsers,
            isLoading: false 
          });
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Notifications Actions
      fetchNotifications: async () => {
        try {
          const notifications = await AdminFlowAPI.system.getNotifications();
          set({ notifications });
          return notifications;
        } catch (error) {
          console.error('Failed to fetch notifications:', error);
          set({ error: error.message });
          throw error;
        }
      },

      markAllNotificationsRead: async () => {
        try {
          await AdminFlowAPI.system.markAllNotificationsRead();
          // Update local state to mark all as read
          const currentNotifications = get().notifications;
          const updatedNotifications = currentNotifications.map(notif => ({
            ...notif,
            is_read: true
          }));
          set({ notifications: updatedNotifications });
        } catch (error) {
          console.error('Failed to mark notifications as read:', error);
          throw error;
        }
      },

      // System Configuration Actions
      fetchSystemConfig: async () => {
        set({ isLoading: true, error: null });
        try {
          const config = await AdminFlowAPI.system.getConfiguration();
          set({ systemConfig: config, isLoading: false });
          return config;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      updateSystemConfig: async (configData) => {
        set({ isLoading: true, error: null });
        try {
          const updatedConfig = await AdminFlowAPI.system.updateConfiguration(configData);
          set({ systemConfig: updatedConfig, isLoading: false });
          return updatedConfig;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // Clear state
      clearState: () => set({
        dashboardData: null,
        organizations: [],
        users: [],
        notifications: [],
        systemConfig: null,
        analytics: null,
        currentOrganization: null,
        isLoading: false,
        isInitialized: false,
        error: null,
      }),
    }),
    {
      name: 'admin-flow-store', // Name for devtools
    }
  )
);

export default useAdminFlowStore;
