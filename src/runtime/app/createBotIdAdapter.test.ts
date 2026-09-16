import { initBotId } from 'botid/client/core';
import { describe, expect, it, vi } from 'vitest';
import { createBotIdAdapter } from './createBotIdAdapter';

vi.mock('botid/client/core', () => ({ initBotId: vi.fn() }));

describe('createBotIdAdapter', () => {
  it('protects every target at the basic check level only', () => {
    createBotIdAdapter().setup!({
      targets: [
        { action: 'newsletter/subscribe', method: 'POST', path: '/api/orchestr/action/newsletter/subscribe' },
        { action: 'app-example/start', method: 'POST', path: '/api/app-example/start' },
      ],
    });

    expect(initBotId).toHaveBeenCalledWith({
      protect: [
        { path: '/api/orchestr/action/newsletter/subscribe', method: 'POST', advancedOptions: { checkLevel: 'basic' } },
        { path: '/api/app-example/start', method: 'POST', advancedOptions: { checkLevel: 'basic' } },
      ],
    });
  });

  it('adds no headers itself, because BotID wraps fetch', async () => {
    await expect(createBotIdAdapter().prepare({ action: 'newsletter/subscribe' })).resolves.toEqual({});
  });
});
