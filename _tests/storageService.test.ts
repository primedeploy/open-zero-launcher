import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkFirstLaunch, setFirstLaunchComplete } from '../src/services/storageService';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('storageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkFirstLaunch', () => {
    it('should return true if no value is stored', async () => {
      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await checkFirstLaunch();

      expect(result).toBe(true);
      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@open_fast_launcher:first_launch_complete');
    });

    it('should return true if value is not "true"', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('false');

      const result = await checkFirstLaunch();

      expect(result).toBe(true);
    });

    it('should return false if value is "true"', async () => {
      mockAsyncStorage.getItem.mockResolvedValue('true');

      const result = await checkFirstLaunch();

      expect(result).toBe(false);
    });

    it('should return true on error', async () => {
      mockAsyncStorage.getItem.mockRejectedValue(new Error('Storage error'));

      const result = await checkFirstLaunch();

      expect(result).toBe(true);
    });
  });

  describe('setFirstLaunchComplete', () => {
    it('should set the value to "true"', async () => {
      await setFirstLaunchComplete();

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('@open_fast_launcher:first_launch_complete', 'true');
    });

    it('should not throw on error', async () => {
      mockAsyncStorage.setItem.mockRejectedValue(new Error('Storage error'));

      await expect(setFirstLaunchComplete()).resolves.not.toThrow();
    });
  });
});