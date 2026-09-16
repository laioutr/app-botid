import botIdModule from 'botid/nuxt';
import { describe, expect, it } from 'vitest';
import { botIdVercelRoutes } from './botIdVercelRoutes';

const PREFIX = '/149e9513-01fa-4fb0-aad4-566afd725d1b/2d206a39-8ed7-437e-a3be-862e0f06eea3';

/** The route rules `botid/nuxt` itself writes — the real module, not a copy of its output. */
const botIdRouteRules = () => {
  const nuxt = { options: {} as { routeRules?: Record<string, any> } };
  (botIdModule as unknown as (options: object, nuxt: object) => void)({}, nuxt);
  return nuxt.options.routeRules!;
};

/** Vercel's routing, as far as these routes use it: first matching `src` wins, `$1` is the capture. */
const resolve = (routes: { src: string; dest: string }[], path: string) => {
  for (const route of routes) {
    const match = new RegExp(route.src).exec(path);
    if (match) return route.dest.replace('$1', match[1] ?? '');
  }
  return undefined;
};

describe('botIdVercelRoutes', () => {
  it('sends the challenge script to the challenge endpoint', () => {
    expect(resolve(botIdVercelRoutes(botIdRouteRules()), `${PREFIX}/a-4-a/c.js`)).toBe(
      'https://api.vercel.com/bot-protection/v1/challenge'
    );
  });

  it('sends everything else under the prefix to the proxy, keeping the rest of the path', () => {
    expect(resolve(botIdVercelRoutes(botIdRouteRules()), `${PREFIX}/p.js`)).toBe('https://api.vercel.com/bot-protection/v1/proxy/p.js');
  });

  it('matches the challenge path literally, not as a pattern', () => {
    expect(resolve(botIdVercelRoutes(botIdRouteRules()), `${PREFIX}/a-4-a/cXjs`)).toBe(
      'https://api.vercel.com/bot-protection/v1/proxy/a-4-a/cXjs'
    );
  });

  it('puts the challenge before the wildcard whatever order the rules come in', () => {
    const reversed = Object.fromEntries(Object.entries(botIdRouteRules()).reverse());

    expect(resolve(botIdVercelRoutes(reversed), `${PREFIX}/a-4-a/c.js`)).toBe('https://api.vercel.com/bot-protection/v1/challenge');
  });

  it('keeps the frame header the proxy rule carries', () => {
    const wildcard = botIdVercelRoutes(botIdRouteRules()).find((route) => route.dest.endsWith('/$1'));

    expect(wildcard?.headers).toEqual({ 'X-Frame-Options': 'SAMEORIGIN' });
  });

  it('leaves every other route rule to Nitro', () => {
    const routes = botIdVercelRoutes({
      ...botIdRouteRules(),
      '/': { isr: { expiration: 60 } },
      '/legacy/**': { proxy: 'https://example.com/legacy/**' },
    });

    expect(resolve(routes, '/')).toBeUndefined();
    expect(resolve(routes, '/legacy/page')).toBeUndefined();
  });
});
