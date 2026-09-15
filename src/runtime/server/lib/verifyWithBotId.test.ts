import { checkBotId } from 'botid/server';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { verifyWithBotId } from './verifyWithBotId';

vi.mock('botid/server', () => ({ checkBotId: vi.fn() }));

const result = (overrides: Partial<{ isHuman: boolean; isBot: boolean; isVerifiedBot: boolean }>) => ({
  isHuman: false,
  isBot: false,
  isVerifiedBot: false,
  bypassed: false,
  ...overrides,
});

afterEach(() => {
  vi.mocked(checkBotId).mockReset();
});

describe('verifyWithBotId', () => {
  it('asks BotID at the basic check level', async () => {
    vi.mocked(checkBotId).mockResolvedValue(result({ isHuman: true }) as any);

    await verifyWithBotId();

    expect(checkBotId).toHaveBeenCalledWith({ advancedOptions: { checkLevel: 'basic' } });
  });

  it('accepts a human', async () => {
    vi.mocked(checkBotId).mockResolvedValue(result({ isHuman: true }) as any);

    await expect(verifyWithBotId()).resolves.toEqual({ status: 'valid' });
  });

  it('rejects a verified bot, which has no reason to submit a form', async () => {
    vi.mocked(checkBotId).mockResolvedValue(result({ isVerifiedBot: true }) as any);

    await expect(verifyWithBotId()).resolves.toEqual({ status: 'invalid', reason: 'verified-bot' });
  });

  it('rejects anything that is not a human', async () => {
    vi.mocked(checkBotId).mockResolvedValue(result({ isBot: true }) as any);
    await expect(verifyWithBotId()).resolves.toEqual({ status: 'invalid', reason: 'bot' });

    vi.mocked(checkBotId).mockResolvedValue(result({}) as any);
    await expect(verifyWithBotId()).resolves.toEqual({ status: 'invalid', reason: 'bot' });
  });

  it('reports BotID failing to answer as unavailable', async () => {
    vi.mocked(checkBotId).mockRejectedValue(new Error("The 'x-vercel-oidc-token' header is missing from the request."));

    await expect(verifyWithBotId()).resolves.toEqual({ status: 'unavailable', reason: 'vendor-error' });
  });
});
