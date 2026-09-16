import { SpanKind, SpanStatusCode, trace } from '@opentelemetry/api';
import { checkBotId } from 'botid/server';
import type { BotProtectionVerdict } from '#frontend/bot-protection';

export const verifyWithBotId = (): Promise<BotProtectionVerdict> =>
  trace
    .getTracer('@laioutr/app-botid')
    .startActiveSpan('botid.check', { kind: SpanKind.CLIENT }, async (span): Promise<BotProtectionVerdict> => {
      try {
        const result = await checkBotId({ advancedOptions: { checkLevel: 'basic' } });
        if (result.isHuman) return { status: 'valid' };
        if (result.isVerifiedBot) return { status: 'invalid', reason: 'verified-bot' };
        return { status: 'invalid', reason: 'bot' };
      } catch {
        span.setAttribute('error.type', 'vendor-error');
        span.setStatus({ code: SpanStatusCode.ERROR });
        return { status: 'unavailable', reason: 'vendor-error' };
      } finally {
        span.end();
      }
    });
