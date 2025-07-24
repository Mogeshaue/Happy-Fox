import { create } from "zustand";
import { nanoid } from "nanoid";

const useCourseStore = create((set) => ({
  // --- Courses ---
  courses: [],
  addCourse: (name) =>
    set((state) => ({
      courses: [
        ...state.courses,
        { id: nanoid(), name, modules: [] },
      ],
    })),

  addModule: (courseId, moduleName) =>
    set((state) => ({
      courses: state.courses.map((course) =>
        course.id === courseId
          ? {
              ...course,
              modules: [...course.modules, { id: nanoid(), name: moduleName }],
            }
          : course
      ),
    })),

  // --- Students ---
  students: [],
  addStudent: (student) =>
    set((state) => ({
      students: [...state.students, { id: Date.now(), ...student }],
    })),

  removeStudent: (id) =>
    set((state) => ({
      students: state.students.filter((student) => student.id !== id),
    })),

  // --- Mentors ---
  mentors: [],
  addMentor: (mentor) =>
    set((state) => ({
      mentors: [...state.mentors, { id: Date.now(), ...mentor }],
    })),

  removeMentor: (id) =>
    set((state) => ({
      mentors: state.mentors.filter((mentor) => mentor.id !== id),
    })),
}));

export default useCourseStore;
