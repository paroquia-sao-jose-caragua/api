import { isbot } from 'isbot';
import { ulid } from 'serverless-crypto-utils/id-generation';
import type { SiteVisitDeviceType } from '@/entities/site-visit';
import type { SiteVisitsDAF } from '@/services/database/site-visits-daf';

export interface RegisterSiteVisitRequest {
  ip: string;
  userAgent: string;
  entryPath?: string;
  salt?: string;
  now?: Date;
}

export interface RegisterSiteVisitResponse {
  registered: boolean;
  ignoredAsBot: boolean;
  visitDate: string;
}

export function getSaoPauloDateString(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const year = parts.find((p) => p.type === 'year')?.value ?? '1970';
  const month = parts.find((p) => p.type === 'month')?.value ?? '01';
  const day = parts.find((p) => p.type === 'day')?.value ?? '01';

  return `${year}-${month}-${day}`;
}

function detectDeviceType(userAgent: string): SiteVisitDeviceType {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|playbook|silk|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android.*mobi|blackberry|iemobile|opera mini/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

function normalizeEntryPath(rawPath?: string): string {
  if (!rawPath || typeof rawPath !== 'string') return '/';
  const cleaned = rawPath.split('?')[0].split('#')[0].trim();
  if (!cleaned || !cleaned.startsWith('/')) return '/';
  if (cleaned.length > 1 && cleaned.endsWith('/')) {
    return cleaned.slice(0, -1).slice(0, 120);
  }
  return cleaned.slice(0, 120);
}

async function computeVisitorHash(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export class RegisterSiteVisitUseCase {
  constructor(private siteVisitsDaf: SiteVisitsDAF) {}

  async execute(
    request: RegisterSiteVisitRequest,
  ): Promise<RegisterSiteVisitResponse> {
    const now = request.now ?? new Date();
    const visitDate = getSaoPauloDateString(now);
    const userAgent = (request.userAgent || '').trim();

    if (!userAgent || isbot(userAgent)) {
      return {
        registered: false,
        ignoredAsBot: true,
        visitDate,
      };
    }

    const ip = (request.ip || 'unknown').trim();
    const salt = request.salt || 'paroquia-sao-jose-visits';
    const visitorHash = await computeVisitorHash(
      `${ip}|${userAgent}|${visitDate}|${salt}`,
    );

    const deviceType = detectDeviceType(userAgent);
    const entryPath = normalizeEntryPath(request.entryPath);
    const visitedAt = now.toISOString();
    const sessionWindowStart = new Date(
      now.getTime() - 15 * 60 * 1000,
    ).toISOString();

    const { inserted } = await this.siteVisitsDaf.registerVisit({
      id: ulid(),
      visitDate,
      visitorHash,
      deviceType,
      entryPath,
      visitedAt,
      sessionWindowStart,
    });

    return {
      registered: inserted,
      ignoredAsBot: false,
      visitDate,
    };
  }
}
