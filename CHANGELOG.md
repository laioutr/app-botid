# @laioutr/app-botid

## 0.1.0
### Minor Changes

- fb3c47e: Initial release. Makes Vercel BotID the bot-protection provider for the actions a project lists under `config.botProtection.actions`. It uses BotID's Basic check level, and BotID's script loads on the first protected request, not on page load.
  
  It works only on storefronts hosted on Vercel: on any other production host no check is registered, and every protected action is rejected. Leave Deep Analysis off in the Vercel dashboard, because it overrides the check level this app sets.
