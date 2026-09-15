import { initBotId } from 'botid/client/core';
import type { BotProtectionAdapter } from '#frontend/bot-protection';

export const createBotIdAdapter = (): BotProtectionAdapter => ({
  name: 'botid',
  setup({ targets }) {
    // Wraps fetch and XHR and loads nothing yet: BotID fetches its challenge on the first matching request.
    initBotId({ protect: targets.map(({ path, method }) => ({ path, method, advancedOptions: { checkLevel: 'basic' as const } })) });
  },
  // BotID's own fetch wrapper adds its headers to the matching request.
  prepare: async () => ({}),
});
