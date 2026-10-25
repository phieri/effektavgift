import type { PowerGridCompany } from './tariff.ts';

export interface EltariffTariff {
  id: string;
  name: string;
  description: string;
  published: string;
  validPeriod: {
    fromIncluding: string;
    toExcluding: string;
  };
  timeZone: 'Europe/Stockholm';
  companyName: string;
  companyOrgNo: string;
  product: string;
  direction: 'consumption';
}

export interface EltariffTariffsResponse {
  tariffs: EltariffTariff[];
  calendarPatterns: Record<string, unknown>[];
}

export interface ParsedEltariffTariffsResponse {
  tariffs: Record<string, unknown>[];
  calendarPatterns: Record<string, unknown>[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toTariffId(companyId: string): string {
  let hash = 2166136261;
  for (const character of companyId) {
    hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  }
  return `00000000-0000-4000-8000-${(hash >>> 0).toString(16).padStart(12, '0')}`;
}

function describeSchedule(company: PowerGridCompany): string {
  const hours = `${String(company.highLoadHours.start).padStart(2, '0')}:00–${String(company.highLoadHours.end).padStart(2, '0')}:00`;
  const weekdays = company.highLoadWeekdays ? ' weekdays' : '';
  return `High-load months: ${company.highLoadMonths.join(', ')}; hours: ${hours}${weekdays}. Swedish public holidays are excluded. Tariff prices are not provided.`;
}

export function toEltariffTariffsResponse(
  companies: PowerGridCompany[],
  published: Date = new Date()
): EltariffTariffsResponse {
  const publishedDate = published.toISOString();
  return {
    tariffs: companies.map((company) => ({
      id: toTariffId(company.id),
      name: `${company.name} effektavgift`,
      description: describeSchedule(company),
      published: publishedDate,
      validPeriod: {
        fromIncluding: company.effectiveDate ?? publishedDate.slice(0, 10),
        toExcluding: '9999-12-31',
      },
      timeZone: 'Europe/Stockholm',
      companyName: company.name,
      companyOrgNo: 'Not provided in effektavgift data',
      product: company.id,
      direction: 'consumption',
    })),
    calendarPatterns: [],
  };
}

export function parseEltariffTariffsResponse(value: unknown): ParsedEltariffTariffsResponse {
  if (!isRecord(value) || !('tariffs' in value)) {
    throw new TypeError('Expected an Eltariff tariffs response');
  }

  const calendarPatterns = value.calendarPatterns ?? [];
  if (
    !Array.isArray(value.tariffs) ||
    !value.tariffs.every(isRecord) ||
    !Array.isArray(calendarPatterns) ||
    !calendarPatterns.every(isRecord)
  ) {
    throw new TypeError('Invalid Eltariff tariffs response');
  }

  return {
    tariffs: value.tariffs,
    calendarPatterns,
  };
}
