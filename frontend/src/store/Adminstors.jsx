import { create } from "zustand";
import { axiosInstance } from "../api/Axios";

const useCourseStore = create((set) => ({
  // --- Courses ---
  courses: [],
  loadingCourses: false,
  errorCourses: null,

  fetchCourses: async () => {
    set({ loadingCourses: true, errorCourses: null });
    try {
      const res = await axiosInstance.get("/admin/courses/");
      set({ courses: res.data, loadingCourses: false });
    } catch (error) {
      set({ errorCourses: error.message, loadingCourses: false });
    }
  },

  addCourse: async (name, description = "") => {
    set({ errorCourses: null });
    try {
      const res = await axiosInstance.post("/admin/courses/", { name, description });
      set((state) => ({ courses: [...state.courses, res.data] }));
    } catch (error) {
      set({ errorCourses: error.message });
    }
  },

  updateCourse: async (id, data) => {
    set({ errorCourses: null });
    try {
      const res = await axiosInstance.put(`/admin/courses/${id}/`, data);
      set((state) => ({
        courses: state.courses.map((c) => (c.id === id ? res.data : c)),
      }));
    } catch (error) {
      set({ errorCourses: error.message });
    }
  },

  deleteCourse: async (id) => {
    set({ errorCourses: null });
    try {
      await axiosInstance.delete(`/admin/courses/${id}/`);
      set((state) => ({ courses: state.courses.filter((c) => c.id !== id) }));
    } catch (error) {
      set({ errorCourses: error.message });
    }
  },

  // --- Cohorts ---
  cohorts: [],
  loadingCohorts: false,
  errorCohorts: null,

  fetchCohorts: async () => {
    set({ loadingCohorts: true, errorCohorts: null });
    try {
      const res = await axiosInstance.get("/admin/cohorts/");
      set({ cohorts: res.data, loadingCohorts: false });
    } catch (error) {
      set({ errorCohorts: error.message, loadingCohorts: false });
    }
  },

  addCohort: async (name, course, start_date, end_date) => {
    set({ errorCohorts: null });
    try {
      const res = await axiosInstance.post("/admin/cohorts/", { name, course, start_date, end_date });
      set((state) => ({ cohorts: [...state.cohorts, res.data] }));
    } catch (error) {
      set({ errorCohorts: error.message });
    }
  },

  updateCohort: async (id, data) => {
    set({ errorCohorts: null });
    try {
      const res = await axiosInstance.put(`/admin/cohorts/${id}/`, data);
      set((state) => ({
        cohorts: state.cohorts.map((c) => (c.id === id ? res.data : c)),
      }));
    } catch (error) {
      set({ errorCohorts: error.message });
    }
  },

  deleteCohort: async (id) => {
    set({ errorCohorts: null });
    try {
      await axiosInstance.delete(`/admin/cohorts/${id}/`);
      set((state) => ({ cohorts: state.cohorts.filter((c) => c.id !== id) }));
    } catch (error) {
      set({ errorCohorts: error.message });
    }
  },

  // --- Teams ---
  teams: [],
  loadingTeams: false,
  errorTeams: null,

  fetchTeams: async () => {
    set({ loadingTeams: true, errorTeams: null });
    try {
      const res = await axiosInstance.get("/admin/teams/");
      set({ teams: res.data, loadingTeams: false });
    } catch (error) {
      set({ errorTeams: error.message, loadingTeams: false });
    }
  },

  addTeam: async (name, cohort) => {
    set({ errorTeams: null });
    try {
      const res = await axiosInstance.post("/admin/teams/", { name, cohort });
      set((state) => ({ teams: [...state.teams, res.data] }));
    } catch (error) {
      set({ errorTeams: error.message });
    }
  },

  updateTeam: async (id, data) => {
    set({ errorTeams: null });
    try {
      const res = await axiosInstance.put(`/admin/teams/${id}/`, data);
      set((state) => ({
        teams: state.teams.map((t) => (t.id === id ? res.data : t)),
      }));
    } catch (error) {
      set({ errorTeams: error.message });
    }
  },

  deleteTeam: async (id) => {
    set({ errorTeams: null });
    try {
      await axiosInstance.delete(`/admin/teams/${id}/`);
      set((state) => ({ teams: state.teams.filter((t) => t.id !== id) }));
    } catch (error) {
      set({ errorTeams: error.message });
    }
  },

  // --- Students (local only for now) ---
  students: [],
  addStudent: (student) =>
    set((state) => ({
      students: [...state.students, { id: Date.now(), ...student }],
    })),

  removeStudent: (id) =>
    set((state) => ({
      students: state.students.filter((student) => student.id !== id),
    })),

  // --- Mentors (local only for now) ---
  mentors: [],
  addMentor: (mentor) =>
    set((state) => ({
      mentors: [...state.mentors, { id: Date.now(), ...mentor }],
    })),

  removeMentor: (id) =>
    set((state) => ({
      mentors: state.mentors.filter((mentor) => mentor.id !== id),
    })),

  // --- Invitations ---
  invitations: [],
  loadingInvitations: false,
  errorInvitations: null,

  fetchInvitations: async () => {
    set({ loadingInvitations: true, errorInvitations: null });
    try {
      const res = await axiosInstance.get("/admin/invitations/");
      set({ invitations: res.data, loadingInvitations: false });
    } catch (error) {
      set({ errorInvitations: error.message, loadingInvitations: false });
    }
  },

  addInvitation: async (email, team) => {
    set({ errorInvitations: null });
    try {
      const res = await axiosInstance.post("/admin/invitations/", { email, team });
      set((state) => ({ invitations: [...state.invitations, res.data] }));
    } catch (error) {
      set({ errorInvitations: error.message });
    }
  },

  updateInvitation: async (id, data) => {
    set({ errorInvitations: null });
    try {
      const res = await axiosInstance.put(`/admin/invitations/${id}/`, data);
      set((state) => ({
        invitations: state.invitations.map((i) => (i.id === id ? res.data : i)),
      }));
    } catch (error) {
      set({ errorInvitations: error.message });
    }
  },

  deleteInvitation: async (id) => {
    set({ errorInvitations: null });
    try {
      await axiosInstance.delete(`/admin/invitations/${id}/`);
      set((state) => ({ invitations: state.invitations.filter((i) => i.id !== id) }));
    } catch (error) {
      set({ errorInvitations: error.message });
    }
  },

  // --- Auth User ---
  authUser: null,
  setAuthUser: (user) => set(() => ({ authUser: user })),

  // --- Auth User ---
  authUser: null,
  setAuthUser: (user) => set(() => ({ authUser: user })),
}));

export default useCourseStore;
