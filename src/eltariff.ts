export interface ParsedEltariffTariffsResponse {
  tariffs: Record<string, unknown>[];
  calendarPatterns: Record<string, unknown>[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function parseEltariffTariffsResponse(value: unknown): ParsedEltariffTariffsResponse {
  if (!isRecord(value) || !('tariffs' in value)) {
    throw new TypeError('Expected an Eltariff tariffs response');
  }

  const calendarPatterns = value.calendarPatterns ?? [];
  if (
    !Array.isArray(value.tariffs) ||
    !value.tariffs.every((tariff) =>
      isRecord(tariff) &&
      typeof tariff.id === 'string' &&
      typeof tariff.name === 'string' &&
      typeof tariff.companyName === 'string'
    ) ||
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
