import type { NuxtOptions } from '@nuxt/schema';

const BOT_PROTECTION_ORIGIN = 'https://api.vercel.com/bot-protection/';

interface VercelRewrite {
  src: string;
  dest: string;
  headers?: Record<string, string>;
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Vercel edge rewrites for the route rules `botid/nuxt` installs.
 *
 * `botid/nuxt` serves BotID's challenge script through Nuxt `proxy` route rules. Nitro's Vercel preset
 * writes no Vercel route for a `proxy` rule, so on Vercel the function fetches the challenge, the
 * challenge is issued to the function instead of the visitor, and BotID classifies every real browser
 * as a bot. Vercel runs these rewrites at the edge instead. The route rules stay installed: they serve
 * the paths in `nuxi dev`, and on Vercel these routes match first.
 *
 * Derived from the rules rather than hardcoding BotID's paths, so a `botid` upgrade that moves them
 * cannot leave these behind. The exact challenge path comes before the wildcard: Vercel takes the
 * first matching route.
 */
export const botIdVercelRoutes = (routeRules: NuxtOptions['routeRules']) => {
  const exact: VercelRewrite[] = [];
  const wildcard: VercelRewrite[] = [];

  for (const [path, rule] of Object.entries(routeRules ?? {})) {
    const target = typeof rule.proxy === 'string' ? rule.proxy : rule.proxy?.to;
    if (!target?.startsWith(BOT_PROTECTION_ORIGIN)) continue;

    const headers = rule.headers ? { headers: rule.headers } : {};

    if (path.endsWith('/**') && target.endsWith('/**')) {
      wildcard.push({ src: `^${escapeRegExp(path.slice(0, -3))}/(.*)$`, dest: `${target.slice(0, -3)}/$1`, ...headers });
    } else {
      exact.push({ src: `^${escapeRegExp(path)}$`, dest: target, ...headers });
    }
  }

  return [...exact, ...wildcard];
};
