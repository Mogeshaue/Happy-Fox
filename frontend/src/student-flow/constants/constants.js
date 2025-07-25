/**
 * Student Flow Constants
 * Single Responsibility: Define student flow configuration
 * Open/Closed: Extensible for new student flow features
 */

export const STUDENT_FLOW_ROUTES = {
  DASHBOARD: '/student-flow/dashboard',
  PROGRESS: '/student-flow/progress',
  ASSIGNMENTS: '/student-flow/assignments',
  STUDY_GROUPS: '/student-flow/study-groups'
};

export const NAVIGATION_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: STUDENT_FLOW_ROUTES.DASHBOARD,
    icon: 'LayoutDashboard',
    description: 'Your learning overview and progress'
  },
  {
    id: 'progress',
    label: 'Learning Progress',
    path: STUDENT_FLOW_ROUTES.PROGRESS,
    icon: 'TrendingUp',
    description: 'Track your learning journey and achievements'
  },
  {
    id: 'assignments',
    label: 'Assignments',
    path: STUDENT_FLOW_ROUTES.ASSIGNMENTS,
    icon: 'FileText',
    description: 'Manage and submit your assignments'
  },
  {
    id: 'study-groups',
    label: 'Study Groups',
    path: STUDENT_FLOW_ROUTES.STUDY_GROUPS,
    icon: 'Users',
    description: 'Collaborate with peers in study groups'
  }
];

export const ASSIGNMENT_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  SUBMITTED: 'submitted',
  GRADED: 'graded',
  LATE: 'late',
  EXTENSION_REQUESTED: 'extension_requested'
};

export const ASSIGNMENT_STATUS_LABELS = {
  [ASSIGNMENT_STATUS.NOT_STARTED]: 'Not Started',
  [ASSIGNMENT_STATUS.IN_PROGRESS]: 'In Progress',
  [ASSIGNMENT_STATUS.SUBMITTED]: 'Submitted',
  [ASSIGNMENT_STATUS.GRADED]: 'Graded',
  [ASSIGNMENT_STATUS.LATE]: 'Late',
  [ASSIGNMENT_STATUS.EXTENSION_REQUESTED]: 'Extension Requested'
};

export const ASSIGNMENT_STATUS_COLORS = {
  [ASSIGNMENT_STATUS.NOT_STARTED]: 'bg-gray-100 text-gray-800',
  [ASSIGNMENT_STATUS.IN_PROGRESS]: 'bg-blue-100 text-blue-800',
  [ASSIGNMENT_STATUS.SUBMITTED]: 'bg-green-100 text-green-800',
  [ASSIGNMENT_STATUS.GRADED]: 'bg-purple-100 text-purple-800',
  [ASSIGNMENT_STATUS.LATE]: 'bg-red-100 text-red-800',
  [ASSIGNMENT_STATUS.EXTENSION_REQUESTED]: 'bg-yellow-100 text-yellow-800'
};

export const STUDY_GROUP_ROLES = {
  MEMBER: 'member',
  MODERATOR: 'moderator',
  CREATOR: 'creator'
};

export const STUDY_GROUP_ROLE_LABELS = {
  [STUDY_GROUP_ROLES.MEMBER]: 'Member',
  [STUDY_GROUP_ROLES.MODERATOR]: 'Moderator',
  [STUDY_GROUP_ROLES.CREATOR]: 'Creator'
};

export const SKILL_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert'
};

export const SKILL_LEVEL_LABELS = {
  [SKILL_LEVELS.BEGINNER]: 'Beginner',
  [SKILL_LEVELS.INTERMEDIATE]: 'Intermediate',
  [SKILL_LEVELS.ADVANCED]: 'Advanced',
  [SKILL_LEVELS.EXPERT]: 'Expert'
};

export const SKILL_LEVEL_COLORS = {
  [SKILL_LEVELS.BEGINNER]: 'bg-green-100 text-green-800',
  [SKILL_LEVELS.INTERMEDIATE]: 'bg-blue-100 text-blue-800',
  [SKILL_LEVELS.ADVANCED]: 'bg-purple-100 text-purple-800',
  [SKILL_LEVELS.EXPERT]: 'bg-yellow-100 text-yellow-800'
};

export const PROGRESS_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  ON_HOLD: 'on_hold'
};

export const PROGRESS_STATUS_LABELS = {
  [PROGRESS_STATUS.NOT_STARTED]: 'Not Started',
  [PROGRESS_STATUS.IN_PROGRESS]: 'In Progress',
  [PROGRESS_STATUS.COMPLETED]: 'Completed',
  [PROGRESS_STATUS.ON_HOLD]: 'On Hold'
};

export const RECOMMENDATION_TYPES = {
  COURSE: 'course',
  PRACTICE: 'practice',
  REVIEW: 'review',
  PROJECT: 'project',
  SKILL: 'skill'
};

export const RECOMMENDATION_TYPE_LABELS = {
  [RECOMMENDATION_TYPES.COURSE]: 'Course',
  [RECOMMENDATION_TYPES.PRACTICE]: 'Practice',
  [RECOMMENDATION_TYPES.REVIEW]: 'Review',
  [RECOMMENDATION_TYPES.PROJECT]: 'Project',
  [RECOMMENDATION_TYPES.SKILL]: 'Skill'
};

export const STUDENT_FLOW_STYLES = {
  CARD: 'bg-white rounded-lg shadow-sm border border-gray-200 p-6',
  CARD_HOVER: 'bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200',
  BUTTON_PRIMARY: 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200',
  BUTTON_SECONDARY: 'bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-medium transition-colors duration-200',
  BUTTON_SUCCESS: 'bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200',
  BUTTON_WARNING: 'bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200',
  BUTTON_DANGER: 'bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200',
  BADGE: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
  INPUT: 'block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500',
  PROGRESS_BAR: 'w-full bg-gray-200 rounded-full h-2.5',
  PROGRESS_FILL: 'bg-blue-600 h-2.5 rounded-full transition-all duration-300'
};

export default {
  STUDENT_FLOW_ROUTES,
  NAVIGATION_ITEMS,
  ASSIGNMENT_STATUS,
  ASSIGNMENT_STATUS_LABELS,
  ASSIGNMENT_STATUS_COLORS,
  STUDY_GROUP_ROLES,
  STUDY_GROUP_ROLE_LABELS,
  SKILL_LEVELS,
  SKILL_LEVEL_LABELS,
  SKILL_LEVEL_COLORS,
  PROGRESS_STATUS,
  PROGRESS_STATUS_LABELS,
  RECOMMENDATION_TYPES,
  RECOMMENDATION_TYPE_LABELS,
  STUDENT_FLOW_STYLES
};
