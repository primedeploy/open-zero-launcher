import { formatTime, formatPeriod, formatDate } from '../src/controllers/useClock';

describe('Clock utilities', () => {
  describe('formatTime', () => {
    it('should format time correctly for AM', () => {
      const date = new Date('2023-01-01T09:05:00');
      expect(formatTime(date)).toBe('9:05');
    });

    it('should format time correctly for PM', () => {
      const date = new Date('2023-01-01T15:30:00');
      expect(formatTime(date)).toBe('3:30');
    });

    it('should format time correctly for 12 AM', () => {
      const date = new Date('2023-01-01T00:00:00');
      expect(formatTime(date)).toBe('12:00');
    });

    it('should format time correctly for 12 PM', () => {
      const date = new Date('2023-01-01T12:00:00');
      expect(formatTime(date)).toBe('12:00');
    });

    it('should pad minutes with zero', () => {
      const date = new Date('2023-01-01T09:05:00');
      expect(formatTime(date)).toBe('9:05');
    });
  });

  describe('formatPeriod', () => {
    it('should return AM for morning', () => {
      const date = new Date('2023-01-01T09:00:00');
      expect(formatPeriod(date)).toBe('AM');
    });

    it('should return PM for afternoon', () => {
      const date = new Date('2023-01-01T15:00:00');
      expect(formatPeriod(date)).toBe('PM');
    });

    it('should return AM for midnight', () => {
      const date = new Date('2023-01-01T00:00:00');
      expect(formatPeriod(date)).toBe('AM');
    });

    it('should return PM for noon', () => {
      const date = new Date('2023-01-01T12:00:00');
      expect(formatPeriod(date)).toBe('PM');
    });
  });

  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2023-01-01T12:00:00');
      expect(formatDate(date)).toBe('Sunday, January 1');
    });
  });
});