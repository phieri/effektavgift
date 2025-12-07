/*
 * Copyright (c) 2025, Philip Eriksson
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

// Types for power grid companies and their tariff rules
export interface PowerGridCompany {
  id: string;
  name: string;
  highLoadMonths: number[]; // Natural month numbers: 1 = January, 12 = December
  highLoadHours: { start: number; end: number }; // 24-hour format
  highLoadWeekdays: boolean; // Only weekdays (Monday-Friday, excludes Saturday and Sunday)
  effectiveDate?: Date; // Date when effektavgift becomes effective for this company (undefined = already in effect)
}

// Swedish power grid companies with their tariff rules
// Note: effectiveDate is only set for companies that haven't started effektavgift yet
// Companies without effectiveDate have already implemented effektavgift
// All companies are legally required to have effektavgift by January 1, 2027
export const powerGridCompanies: PowerGridCompany[] = [
  {
    id: 'ellevio',
    name: 'Ellevio',
    highLoadMonths: [11, 12, 1, 2, 3], // November to March
    highLoadHours: { start: 6, end: 22 },
    highLoadWeekdays: true,
    // Started January 1, 2025 - already in effect
  },
  {
    id: 'vattenfall',
    name: 'Vattenfall Eldistribution',
    highLoadMonths: [11, 12, 1, 2, 3], // November to March
    highLoadHours: { start: 6, end: 22 },
    highLoadWeekdays: true,
    effectiveDate: new Date(2026, 9, 1), // October 2026 (autumn 2026)
  },
  {
    id: 'eon',
    name: 'E.ON Energidistribution',
    highLoadMonths: [11, 12, 1, 2, 3], // November to March
    highLoadHours: { start: 6, end: 22 },
    highLoadWeekdays: true,
    effectiveDate: new Date(2027, 0, 1), // January 1, 2027 (legal deadline)
  },
  {
    id: 'falbygdens-energi',
    name: 'Falbygdens Energi',
    highLoadMonths: [11, 12, 1, 2, 3], // November to March
    highLoadHours: { start: 6, end: 22 },
    highLoadWeekdays: true,
    effectiveDate: new Date(2027, 0, 1), // January 1, 2027 (legal deadline)
  },
  {
    id: 'geab',
    name: 'Gotlands Energi (GEAB)',
    highLoadMonths: [11, 12, 1, 2, 3], // November to March
    highLoadHours: { start: 6, end: 22 },
    highLoadWeekdays: true,
    effectiveDate: new Date(2026, 0, 1), // January 1, 2026
  },
  {
    id: 'halmstads-energi',
    name: 'Halmstads Energi och Miljö',
    highLoadMonths: [11, 12, 1, 2, 3], // November to March
    highLoadHours: { start: 6, end: 22 },
    highLoadWeekdays: true,
    effectiveDate: new Date(2027, 0, 1), // January 1, 2027 (legal deadline)
  },
  {
    id: 'karlshamns-energi',
    name: 'Karlshamn Energi',
    highLoadMonths: [11, 12, 1, 2, 3], // November to March
    highLoadHours: { start: 6, end: 22 },
    highLoadWeekdays: true,
    effectiveDate: new Date(2027, 0, 1), // January 1, 2027 (legal deadline)
  },
  {
    id: 'skekraft',
    name: 'Skellefteå Kraft',
    highLoadMonths: [11, 12, 1, 2, 3], // November to March
    highLoadHours: { start: 6, end: 22 },
    highLoadWeekdays: true,
    effectiveDate: new Date(2027, 0, 1), // January 1, 2027 (legal deadline)
  },
  {
    id: 'goteborg-energi',
    name: 'Göteborg Energi Nät',
    highLoadMonths: [11, 12, 1, 2, 3], // November to March
    highLoadHours: { start: 6, end: 22 },
    highLoadWeekdays: true,
    // Already has optional time-based tariff available
  },
  {
    id: 'umea-energi',
    name: 'Umeå Energi Elnät',
    highLoadMonths: [11, 12, 1, 2, 3], // November to March
    highLoadHours: { start: 6, end: 22 },
    highLoadWeekdays: true,
    effectiveDate: new Date(2027, 0, 1), // January 1, 2027 (legal deadline)
  },
  {
    id: 'malarenergi',
    name: 'Mälarenergi Elnät',
    highLoadMonths: [11, 12, 1, 2, 3], // November to March
    highLoadHours: { start: 6, end: 22 },
    highLoadWeekdays: true,
    effectiveDate: new Date(2025, 8, 1), // September 2025
  },
  {
    id: 'eskilstuna-energi',
    name: 'Eskilstuna Energi och Miljö Elnät',
    highLoadMonths: [11, 12, 1, 2, 3], // November to March
    highLoadHours: { start: 6, end: 22 },
    highLoadWeekdays: true,
    effectiveDate: new Date(2027, 0, 1), // January 1, 2027 (legal deadline)
  },
  {
    id: 'kraftringen',
    name: 'Kraftringen Nät',
    highLoadMonths: [11, 12, 1, 2, 3], // November to March
    highLoadHours: { start: 6, end: 22 },
    highLoadWeekdays: true,
    effectiveDate: new Date(2027, 0, 1), // January 1, 2027 (legal deadline)
  },
  {
    id: 'fortum',
    name: 'Fortum Distribution',
    highLoadMonths: [11, 12, 1, 2, 3], // November to March
    highLoadHours: { start: 6, end: 22 },
    highLoadWeekdays: true,
    // Fortum sold to Ellevio - effektavgift already in effect
  },
  {
    id: 'jamtkraft',
    name: 'Jämtkraft Elnät',
    highLoadMonths: [11, 12, 1, 2, 3], // November to March
    highLoadHours: { start: 6, end: 22 },
    highLoadWeekdays: true,
    effectiveDate: new Date(2027, 0, 1), // January 1, 2027 (legal deadline)
  },
];

// Cache for Swedish holidays by year to avoid unnecessary recalculation
const holidayCache = new Map<number, Date[]>();

// Swedish red days (public holidays) - simplified list for common holidays
export const getSwedishHolidays = (year: number): Date[] => {
  // Return cached holidays if available for this year
  const cached = holidayCache.get(year);
  if (cached) {
    return cached;
  }
  const holidays: Date[] = [
    new Date(year, 1 - 1, 1),   // New Year's Day (January 1)
    new Date(year, 1 - 1, 6),   // Epiphany (January 6)
    new Date(year, 5 - 1, 1),   // May Day (May 1)
    new Date(year, 6 - 1, 6),   // National Day (June 6)
    new Date(year, 12 - 1, 24), // Christmas Eve (December 24)
    new Date(year, 12 - 1, 25), // Christmas Day (December 25)
    new Date(year, 12 - 1, 26), // Boxing Day (December 26)
    new Date(year, 12 - 1, 31), // New Year's Eve (December 31)
  ];
  
  // Easter and related holidays (simplified - using a common approximation)
  const easter = calculateEaster(year);
  holidays.push(new Date(easter.getTime() - 2 * 24 * 60 * 60 * 1000)); // Good Friday
  holidays.push(easter); // Easter Sunday
  holidays.push(new Date(easter.getTime() + 1 * 24 * 60 * 60 * 1000)); // Easter Monday
  holidays.push(new Date(easter.getTime() + 39 * 24 * 60 * 60 * 1000)); // Ascension Day
  holidays.push(new Date(easter.getTime() + 49 * 24 * 60 * 60 * 1000)); // Whit Sunday
  holidays.push(new Date(easter.getTime() + 50 * 24 * 60 * 60 * 1000)); // Whit Monday
  
  // Midsummer Eve and Day (Friday and Saturday between June 19-25)
  const midsummerEve = getMidsummerEve(year);
  holidays.push(midsummerEve);
  holidays.push(new Date(midsummerEve.getTime() + 24 * 60 * 60 * 1000));
  
  // All Saints' Day (Saturday between October 31 and November 6)
  const allSaintsDay = getAllSaintsDay(year);
  holidays.push(allSaintsDay);
  
  // Cache the holidays for this year
  holidayCache.set(year, holidays);
  
  return holidays;
};

// Calculate Easter using the Anonymous Gregorian algorithm
function calculateEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1; // 0-indexed
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  return new Date(year, month, day);
}

// Get Midsummer Eve (Friday between June 19-25)
function getMidsummerEve(year: number): Date {
  for (let day = 19; day <= 25; day++) {
    const date = new Date(year, 6 - 1, day); // June (month 6)
    if (date.getDay() === 5) { // Friday
      return date;
    }
  }
  return new Date(year, 6 - 1, 19); // Fallback
}

// Get All Saints' Day (Saturday between October 31 and November 6)
function getAllSaintsDay(year: number): Date {
  const oct31 = new Date(year, 10 - 1, 31); // October 31 (month 10)
  for (let i = 0; i <= 6; i++) {
    const date = new Date(oct31.getTime() + i * 24 * 60 * 60 * 1000);
    if (date.getDay() === 6) { // Saturday
      return date;
    }
  }
  return new Date(year, 11 - 1, 1); // Fallback to November 1 (month 11)
}

// Convert a Date object to Swedish time (Europe/Stockholm timezone)
// Returns a new Date object representing the same moment in time, but with
// getHours(), getDate(), etc. reflecting Swedish local time
function toSwedishTime(date: Date): Date {
  // Get the date/time components in Swedish timezone
  const swedishDateStr = date.toLocaleString('sv-SE', {
    timeZone: 'Europe/Stockholm',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
  
  // Parse the Swedish time string (format: "YYYY-MM-DD HH:mm:ss")
  // toLocaleString with sv-SE returns format like "2025-12-07 23:41:19"
  const parts = swedishDateStr.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
  if (!parts) {
    throw new Error(`Failed to parse Swedish time: ${swedishDateStr}`);
  }
  
  const [, year, month, day, hour, minute, second] = parts;
  
  // Create a new Date object using Swedish local time components
  // Note: new Date(year, month, day, ...) creates a date in the user's local timezone
  // but we want to interpret these numbers as if they were in the user's timezone
  // So we create a date that will have the same getHours(), getDate(), etc. as Swedish time
  return new Date(
    parseInt(year),
    parseInt(month) - 1, // Month is 0-indexed
    parseInt(day),
    parseInt(hour),
    parseInt(minute),
    parseInt(second)
  );
}

// Check if a date is a holiday
function isHoliday(date: Date, holidays: Date[]): boolean {
  return holidays.some(holiday => 
    holiday.getFullYear() === date.getFullYear() &&
    holiday.getMonth() === date.getMonth() &&
    holiday.getDate() === date.getDate()
  );
}

// Check if current time is high load period
export function isHighLoadPeriod(company: PowerGridCompany, now: Date = new Date()): boolean {
  // Convert to Swedish time (Europe/Stockholm) since all companies operate on Swedish time
  const swedishNow = toSwedishTime(now);
  
  const month = swedishNow.getMonth() + 1; // Convert to natural month number (1-12)
  const hour = swedishNow.getHours();
  const dayOfWeek = swedishNow.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
  
  // Check if it's in high load months
  if (!company.highLoadMonths.includes(month)) {
    return false;
  }
  
  // Check if it's in high load hours
  if (hour < company.highLoadHours.start || hour >= company.highLoadHours.end) {
    return false;
  }
  
  // Check if it's a weekday (Monday-Friday = 1-5, excludes Saturday = 6 and Sunday = 0)
  if (company.highLoadWeekdays && (dayOfWeek === 0 || dayOfWeek === 6)) {
    return false;
  }
  
  // Check if it's a holiday
  const holidays = getSwedishHolidays(swedishNow.getFullYear());
  if (isHoliday(swedishNow, holidays)) {
    return false;
  }
  
  return true;
}

export function getLoadStatus(company: PowerGridCompany): 'high' | 'low' {
  return isHighLoadPeriod(company) ? 'high' : 'low';
}

// Check if effektavgift is currently in effect for a company
export function isEffektavgiftInEffect(company: PowerGridCompany, now: Date = new Date()): boolean {
  if (!company.effectiveDate) {
    return true; // No effective date means it's already in effect
  }
  return now >= company.effectiveDate;
}

// Format effective date in Swedish (e.g., "oktober 2026")
export function formatEffectiveDate(date: Date): string {
  const months = [
    'januari', 'februari', 'mars', 'april', 'maj', 'juni',
    'juli', 'augusti', 'september', 'oktober', 'november', 'december'
  ];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
}

// Calculate the next time the tariff will change
export function getNextTariffChange(company: PowerGridCompany, now: Date = new Date()): Date {
  const currentlyHighLoad = isHighLoadPeriod(company, now);
  
  // Start from current time
  let nextChange = new Date(now);
  
  // Search for the next change within the next 14 days (to handle edge cases)
  for (let i = 0; i < 14 * 24 * 60; i++) {
    // Increment by 1 minute
    nextChange = new Date(nextChange.getTime() + 60 * 1000);
    
    // Note: isHighLoadPeriod internally calls getSwedishHolidays with the year from the date,
    // so holidays are automatically recalculated when crossing year boundaries
    const willBeHighLoad = isHighLoadPeriod(company, nextChange);
    
    // If status changes, we found the next change time
    if (willBeHighLoad !== currentlyHighLoad) {
      return nextChange;
    }
  }
  
  // If no change found within 14 days, return a date far in the future
  return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
}
