/** BotID's server check needs Vercel's request context in production; in development it answers without one. */
export const canRunBotId = () => process.env.NODE_ENV !== 'production' || Boolean(process.env.VERCEL);
