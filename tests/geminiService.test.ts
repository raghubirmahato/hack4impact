import { describe, it, expect } from 'vitest';
import { analyzeSymptoms, generateHealthTip } from '../services/geminiService';

describe('GeminiService Safe Fallbacks', () => {
  it('should handle unconfigured API key gracefully in analyzeSymptoms', async () => {
    const response = await analyzeSymptoms([{ id: '1', role: 'user', text: 'Headache', timestamp: '12:00' }]);
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  });

  it('should handle unconfigured API key gracefully in generateHealthTip', async () => {
    const response = await generateHealthTip('Hydration');
    expect(typeof response).toBe('string');
    expect(response.length).toBeGreaterThan(0);
  });
});
