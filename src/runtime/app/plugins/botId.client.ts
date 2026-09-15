import { defineNuxtPlugin } from 'nuxt/app';
import { useBotProtection } from '#imports';
import { createBotIdAdapter } from '../createBotIdAdapter';

export default defineNuxtPlugin(() => {
  useBotProtection().setAdapter(createBotIdAdapter());
});
