import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  parseEltariffTariffsResponse,
  toEltariffTariffsResponse,
} from '../src/eltariff.ts';
import type { PowerGridCompany } from '../src/tariff.ts';

const company: PowerGridCompany = {
  id: 'jamtkraft',
  name: 'Jämtkraft Elnät',
  highLoadMonths: [11, 12, 1, 2, 3],
  highLoadHours: { start: 7, end: 21 },
  highLoadWeekdays: true,
  coordinates: { lat: 63.1792, lng: 14.6357 },
};

test('exports an Eltariff GET /tariffs response', () => {
  const response = toEltariffTariffsResponse([company], new Date('2026-10-25T12:00:00Z'));
  const tariff = response.tariffs[0];

  assert.deepEqual(Object.keys(response), ['tariffs', 'calendarPatterns']);
  assert.deepEqual(Object.keys(tariff).sort(), [
    'companyName',
    'companyOrgNo',
    'description',
    'direction',
    'id',
    'name',
    'product',
    'published',
    'timeZone',
    'validPeriod',
  ].sort());
  assert.match(tariff.id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-8[0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.match(tariff.published, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  assert.equal(tariff.published, '2026-10-25T12:00:00.000Z');
  assert.deepEqual(tariff.validPeriod, {
    fromIncluding: '2026-10-25',
    toExcluding: '9999-12-31',
  });
  assert.equal(tariff.timeZone, 'Europe/Stockholm');
  assert.match(tariff.description, /High-load months: 11, 12, 1, 2, 3; hours: 07:00–21:00 weekdays/);
  assert.equal(response.calendarPatterns.length, 0);
});

test('parses the official Jämtkraft sample response, including its legacy fields', async () => {
  const sample = JSON.parse(
    await readFile(new URL('./fixtures/tariffs-response-jamtkraft.json', import.meta.url), 'utf8')
  );
  const response = parseEltariffTariffsResponse(sample);

  assert.equal(response.tariffs[0].companyName, 'Jämtkraft Elnät AB');
  assert.deepEqual(response.calendarPatterns, []);
});

test('rejects values that are not tariffs responses', () => {
  assert.throws(() => parseEltariffTariffsResponse({ tariffs: 'invalid' }), TypeError);
});
