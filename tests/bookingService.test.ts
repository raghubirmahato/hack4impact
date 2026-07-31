import { describe, it, expect, beforeEach } from 'vitest';
import { bookingService } from '../services/clientBookingService';
import { STORAGE_KEYS } from '../constants/storage';

describe('ClientBookingService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should generate time slots correctly', () => {
    const slots = bookingService.generateTimeSlots(9, 12, 30);
    expect(slots).toEqual(['09:00', '09:30', '10:00', '10:30', '11:00', '11:30']);
  });

  it('should fetch doctors list without crashing', async () => {
    const doctors = await bookingService.getAllDoctors();
    expect(Array.isArray(doctors)).toBe(true);
  });
});
