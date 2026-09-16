import { defineNitroPlugin, setBotProtectionVerifier } from '#imports';
import { canRunBotId } from '../lib/canRunBotId';
import { verifyWithBotId } from '../lib/verifyWithBotId';

export default defineNitroPlugin(() => {
  // Registering nothing makes frontend-core reject the protected actions, which is visible. Registering
  // a check that always throws would pass them all under the default "open" policy, which is not.
  if (!canRunBotId()) {
    console.warn(
      '[@laioutr/app-botid] BotID runs only on Vercel, and this production server is not on Vercel. No verifier is registered, so every protected action is rejected.'
    );
    return;
  }

  setBotProtectionVerifier({ name: 'botid', verify: () => verifyWithBotId() });
});
