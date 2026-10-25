import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { parseEltariffTariffsResponse } from '../src/eltariff.ts';

test('parses the official Jämtkraft sample response, including its legacy fields', async () => {
  const sample = JSON.parse(
    await readFile(new URL('./fixtures/tariffs-response-jamtkraft.json', import.meta.url), 'utf8')
  );
  const response = parseEltariffTariffsResponse(sample);

  assert.equal(response.tariffs[0].companyName, 'Jämtkraft Elnät AB');
  assert.deepEqual(response.calendarPatterns, []);
  assert.equal(response.tariffs[0].lastUpdated, '2024-11-25T11:40:00.7219459+00:00');
  assert.equal(response.tariffs[0].validPeriod, null);
  assert.ok('powerPrice' in response.tariffs[0]);
});

test('parses current responses with calendar patterns', () => {
  const response = parseEltariffTariffsResponse({
    tariffs: [{ id: 'example', name: 'Example', companyName: 'Example AB' }],
    calendarPatterns: [{ reference: 'weekdays', frequency: 'P1W', days: [1, 2, 3, 4, 5] }],
  });

  assert.equal(response.calendarPatterns[0].reference, 'weekdays');
});

test('rejects values that are not tariffs responses', () => {
  assert.throws(() => parseEltariffTariffsResponse({ tariffs: 'invalid' }), TypeError);
  assert.throws(
    () => parseEltariffTariffsResponse({ tariffs: [{ id: 'missing-name' }] }),
    TypeError
  );
});
