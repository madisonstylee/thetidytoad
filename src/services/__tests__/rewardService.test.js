import { 
  dispenseSpecialReward, 
  approveRewardRedemption, 
  getRewardBankByChildId 
} from '../rewardService';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../firebase';

// Suppress console.error during tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

// Mock Firebase modules
jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  doc: jest.fn(),
  serverTimestamp: jest.fn(() => new Date())
}));

jest.mock('../firebase', () => ({
  db: {}
}));

jest.mock('../notificationService', () => ({
  createNotification: jest.fn()
}));

describe('Reward Service', () => {
  const mockChildId = 'child123';
  const mockRewardId = 'reward456';

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('dispenseSpecialReward', () => {
    it('should successfully dispense a special reward when reward is available', async () => {
      // Mock Firestore query and document
      const mockRewardBank = {
        childId: mockChildId,
        specialRewards: [
          {
            id: mockRewardId,
            title: 'Test Special Reward',
            status: 'available'
          }
        ]
      };

      // Setup mock implementations
      collection.mockReturnValue('rewardBanksCollection');
      query.mockReturnValue('rewardBanksQuery');
      where.mockReturnValue('rewardBanksQueryWithFilter');
      getDocs.mockResolvedValue({
        empty: false,
        docs: [
          {
            data: () => mockRewardBank,
            id: 'rewardBankDocId'
          }
        ]
      });
      updateDoc.mockResolvedValue(true);

      // Execute the function
      const result = await dispenseSpecialReward(mockChildId, mockRewardId);

      // Assertions
      expect(result).toBe(true);
      expect(collection).toHaveBeenCalledWith(db, 'rewardBanks');
      expect(query).toHaveBeenCalled();
      expect(where).toHaveBeenCalledWith('childId', '==', mockChildId);
      expect(updateDoc).toHaveBeenCalled();
    });

    it('should throw an error when reward is not available', async () => {
      // Mock Firestore query and document with unavailable reward
      const mockRewardBank = {
        childId: mockChildId,
        specialRewards: [
          {
            id: mockRewardId,
            title: 'Test Special Reward',
            status: 'redeemed'
          }
        ]
      };

      // Setup mock implementations
      collection.mockReturnValue('rewardBanksCollection');
      query.mockReturnValue('rewardBanksQuery');
      where.mockReturnValue('rewardBanksQueryWithFilter');
      getDocs.mockResolvedValue({
        empty: false,
        docs: [
          {
            data: () => mockRewardBank,
            id: 'rewardBankDocId'
          }
        ]
      });

      // Execute the function and expect an error
      await expect(dispenseSpecialReward(mockChildId, mockRewardId))
        .rejects
        .toThrow('Special reward is not available');
    });
  });

  describe('approveRewardRedemption', () => {
    it('should successfully approve a special reward in pending_redemption status', async () => {
      // Mock Firestore query and document
      const mockRewardBank = {
        childId: mockChildId,
        specialRewards: [
          {
            id: mockRewardId,
            title: 'Test Special Reward',
            status: 'pending_redemption'
          }
        ]
      };

      // Setup mock implementations
      collection.mockReturnValue('rewardBanksCollection');
      query.mockReturnValue('rewardBanksQuery');
      where.mockReturnValue('rewardBanksQueryWithFilter');
      getDocs.mockResolvedValue({
        empty: false,
        docs: [
          {
            data: () => mockRewardBank,
            id: 'rewardBankDocId'
          }
        ]
      });
      updateDoc.mockResolvedValue(true);

      // Execute the function
      const result = await approveRewardRedemption(mockChildId, mockRewardId, 'special');

      // Assertions
      expect(result).toBe(true);
      expect(collection).toHaveBeenCalledWith(db, 'rewardBanks');
      expect(query).toHaveBeenCalled();
      expect(where).toHaveBeenCalledWith('childId', '==', mockChildId);
      expect(updateDoc).toHaveBeenCalled();
    });

    it('should throw an error when special reward is not in pending_redemption status', async () => {
      // Mock Firestore query and document with unavailable reward
      const mockRewardBank = {
        childId: mockChildId,
        specialRewards: [
          {
            id: mockRewardId,
            title: 'Test Special Reward',
            status: 'available'
          }
        ]
      };

      // Setup mock implementations
      collection.mockReturnValue('rewardBanksCollection');
      query.mockReturnValue('rewardBanksQuery');
      where.mockReturnValue('rewardBanksQueryWithFilter');
      getDocs.mockResolvedValue({
        empty: false,
        docs: [
          {
            data: () => mockRewardBank,
            id: 'rewardBankDocId'
          }
        ]
      });

      // Execute the function and expect an error
      await expect(approveRewardRedemption(mockChildId, mockRewardId, 'special'))
        .rejects
        .toThrow('Special reward is not pending redemption');
    });
  });
});
