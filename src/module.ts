import { addPlugin, addServerPlugin, createResolver, defineNuxtModule, installModule, useLogger } from '@nuxt/kit';
import botIdModule from 'botid/nuxt';
import { defu } from 'defu';
import { botIdVercelRoutes } from './module/botIdVercelRoutes';
import type { NuxtModule } from '@nuxt/schema';
import { name as pkgName, version as pkgVersion } from '../package.json';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ModuleOptions {}

const module: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: pkgName,
    version: pkgVersion,
    configKey: pkgName,
  },
  async setup(_options, nuxt) {
    const logger = useLogger(pkgName);
    const { resolve } = createResolver(import.meta.url);
    const resolveRuntimeModule = (path: string) => resolve('./runtime', path);

    nuxt.options.build.transpile.push(resolve('./runtime'));

    // frontend-core reads this to warn when protected actions have no provider. Either module may run first.
    (nuxt.options.runtimeConfig as any).laioutr = defu(
      { botProtection: { provider: 'botid' } },
      (nuxt.options.runtimeConfig as any).laioutr
    );

    if (nuxt.options._prepare) {
      await installModule('@laioutr-core/frontend-core');
      return;
    }

    // Installed from the imported function: by name it would resolve from the project's node_modules,
    // where `botid` is only a transitive dependency.
    await installModule(botIdModule);

    nuxt.options.nitro.vercel ??= {};
    nuxt.options.nitro.vercel.config ??= {};
    nuxt.options.nitro.vercel.config.routes = [
      ...botIdVercelRoutes(nuxt.options.routeRules ?? {}),
      ...(nuxt.options.nitro.vercel.config.routes ?? []),
    ];

    nuxt.hook('nitro:init', (nitro) => {
      if (!nuxt.options.dev && !String(nitro.options.preset).startsWith('vercel')) {
        logger.warn(
          `BotID runs only on Vercel, but this build targets "${nitro.options.preset}". Every protected action will be rejected at runtime.`
        );
      }
    });

    addPlugin({ src: resolveRuntimeModule('app/plugins/botId.client'), mode: 'client' });
    addServerPlugin(resolveRuntimeModule('server/plugins/botIdVerifier'));
  },
});

export default module;
