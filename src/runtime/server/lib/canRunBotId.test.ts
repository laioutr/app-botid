import { afterEach, describe, expect, it, vi } from 'vitest';
import { canRunBotId } from './canRunBotId';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('canRunBotId', () => {
  it('runs in development anywhere, where BotID answers "human" without a network call', () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('VERCEL', '');

    expect(canRunBotId()).toBe(true);
  });

  it('runs in production on Vercel', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL', '1');

    expect(canRunBotId()).toBe(true);
  });

  it('does not run in production off Vercel', () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('VERCEL', '');

    expect(canRunBotId()).toBe(false);
  });
});
