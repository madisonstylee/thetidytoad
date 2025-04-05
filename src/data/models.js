/**
 * Data models for the application
 * These models define the structure of the data stored in Firestore
 */

/**
 * User model
 * Represents a user in the system (parent or child)
 */
export const UserModel = {
  id: '', // Firebase Auth UID
  email: '', // Email address (for parents only)
  firstName: '', // First name
  lastName: '', // Last name
  role: '', // 'parent' or 'child'
  familyId: '', // Reference to the family document
  profilePicture: '', // URL to profile picture
  createdAt: null, // Timestamp
  updatedAt: null, // Timestamp
};

/**
 * Child model
 * Extends the user model with child-specific fields
 */
export const ChildModel = {
  ...UserModel,
  role: 'child',
  username: '', // Username for login
  parentId: '', // Reference to the parent user
};

/**
 * Parent model
 * Extends the user model with parent-specific fields
 */
export const ParentModel = {
  ...UserModel,
  role: 'parent',
  isMainParent: false, // Whether this is the main parent account
};

/**
 * Family model
 * Represents a family in the system
 */
export const FamilyModel = {
  id: '', // Firestore document ID
  name: '', // Family name
  mainParentId: '', // Reference to the main parent user
  createdAt: null, // Timestamp
  updatedAt: null, // Timestamp
};

/**
 * Task model
 * Represents a task assigned to a child
 */
export const TaskModel = {
  id: '', // Firestore document ID
  title: '', // Task title
  description: '', // Task description
  assignedTo: '', // Reference to the child user
  status: '', // 'pending', 'completed', 'approved'
  dueDate: null, // Due date (optional)
  recurrence: '', // 'none', 'daily', 'weekly', 'monthly'
  reward: {
    type: '', // 'money', 'points', 'special'
    value: 0, // Amount (for money or points)
    description: '', // Description (for special rewards)
  },
  completedAt: null, // Timestamp when task was completed
  approvedAt: null, // Timestamp when task was approved
  createdBy: '', // Reference to the parent user
  createdAt: null, // Timestamp
  updatedAt: null, // Timestamp
};

/**
 * Reward Bank model
 * Represents a child's reward bank (Ribbit Reserve)
 */
export const RewardBankModel = {
  id: '', // Firestore document ID
  childId: '', // Reference to the child user
  money: {
    balance: 0, // Current balance
    interestRate: 0, // Interest rate (decimal, e.g., 0.05 for 5%)
    lastInterestApplied: null, // Timestamp when interest was last applied
  },
  points: {
    balance: 0, // Current balance
  },
  specialRewards: [], // Array of special rewards
  createdAt: null, // Timestamp
  updatedAt: null, // Timestamp
};

/**
 * Special Reward model
 * Represents a special reward in a child's reward bank
 */
export const SpecialRewardModel = {
  id: '', // Unique ID
  title: '', // Reward title
  description: '', // Reward description
  status: '', // 'available', 'pending_redemption', 'redeemed'
  createdAt: null, // Timestamp
  redeemedAt: null, // Timestamp when reward was redeemed
};

/**
 * Notification model
 * Represents a notification for a user
 */
export const NotificationModel = {
  id: '', // Firestore document ID
  userId: '', // Reference to the user
  title: '', // Notification title
  message: '', // Notification message
  type: '', // 'task_completed', 'task_approved', 'reward_redeemed', etc.
  read: false, // Whether the notification has been read
  relatedId: '', // Reference to related document (task, reward, etc.)
  createdAt: null, // Timestamp
};

/**
 * Create a new user object
 * @param {Object} data - User data
 * @returns {Object} - New user object
 */
export const createUser = (data) => {
  return {
    ...UserModel,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

/**
 * Create a new child user object
 * @param {Object} data - Child user data
 * @returns {Object} - New child user object
 */
export const createChild = (data) => {
  return {
    ...ChildModel,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

/**
 * Create a new parent user object
 * @param {Object} data - Parent user data
 * @returns {Object} - New parent user object
 */
export const createParent = (data) => {
  return {
    ...ParentModel,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

/**
 * Create a new family object
 * @param {Object} data - Family data
 * @returns {Object} - New family object
 */
export const createFamily = (data) => {
  return {
    ...FamilyModel,
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

/**
 * Create a new task object
 * @param {Object} data - Task data
 * @returns {Object} - New task object
 */
export const createTask = (data) => {
  return {
    ...TaskModel,
    ...data,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

/**
 * Create a new reward bank object
 * @param {Object} data - Reward bank data
 * @returns {Object} - New reward bank object
 */
export const createRewardBank = (data) => {
  return {
    ...RewardBankModel,
    ...data,
    money: {
      ...RewardBankModel.money,
      ...(data.money || {}),
    },
    points: {
      ...RewardBankModel.points,
      ...(data.points || {}),
    },
    specialRewards: data.specialRewards || [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

/**
 * Create a new special reward object
 * @param {Object} data - Special reward data
 * @returns {Object} - New special reward object
 */
export const createSpecialReward = (data) => {
  return {
    ...SpecialRewardModel,
    ...data,
    status: 'available',
    createdAt: new Date(),
  };
};

/**
 * Create a new notification object
 * @param {Object} data - Notification data
 * @returns {Object} - New notification object
 */
export const createNotification = (data) => {
  return {
    ...NotificationModel,
    ...data,
    read: false,
    createdAt: new Date(),
  };
};
