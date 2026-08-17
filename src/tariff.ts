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

// Time constants to avoid magic numbers in calculations
export const MS_PER_MINUTE = 60 * 1000;
export const MS_PER_HOUR = 60 * MS_PER_MINUTE;
export const MS_PER_DAY = 24 * MS_PER_HOUR;

// Easter-relative holiday offsets (in days from Easter Sunday)
const EASTER_OFFSETS = {
  GOOD_FRIDAY: -2,
  EASTER_MONDAY: 1,
  ASCENSION_DAY: 39,
  WHIT_SUNDAY: 49,
  WHIT_MONDAY: 50,
} as const;

// Maximum number of days to search ahead for next tariff change
export const MAX_LOOKAHEAD_DAYS = 14;

export type LoadStatus = 'high' | 'low';

export interface Coordinates {
  lat: number;
  lng: number;
}

// Types for power grid companies and their tariff rules
export interface PowerGridCompany {
  id: string;
  name: string;
  highLoadMonths: number[]; // Natural month numbers: 1 = January, 12 = December
  highLoadHours: { start: number; end: number }; // 24-hour format
  highLoadWeekdays: boolean; // Only weekdays (Monday-Friday, excludes Saturday and Sunday)
  effectiveDate?: string; // Optional ISO date when the tariff starts to apply
  coordinates: Coordinates; // Coordinates of company HQ
}

// Utility function to parse company JSON data
export const parseCompanyData = (companyJson: PowerGridCompany): PowerGridCompany => ({
  ...companyJson,
});

// Utility function to parse multiple companies
export const parseCompaniesData = (companiesJson: PowerGridCompany[]): PowerGridCompany[] =>
  companiesJson.map(parseCompanyData);

// Cache for Swedish holidays by year to avoid unnecessary recalculation
const holidayCache = new Map<number, readonly Date[]>();

// Swedish red days (public holidays) - simplified list for common holidays
export const getSwedishHolidays = (year: number): readonly Date[] => {
  const cached = holidayCache.get(year);
  if (cached) {
    return cached;
  }

  const baseHolidays = [
    new Date(year, 0, 1),   // New Year's Day (January 1)
    new Date(year, 0, 6),   // Epiphany (January 6)
    new Date(year, 4, 1),   // May Day (May 1)
    new Date(year, 5, 6),   // National Day (June 6)
    new Date(year, 11, 24), // Christmas Eve (December 24)
    new Date(year, 11, 25), // Christmas Day (December 25)
    new Date(year, 11, 26), // Boxing Day (December 26)
    new Date(year, 11, 31), // New Year's Eve (December 31)
  ];

  const easter = calculateEaster(year);
  const easterRelatedHolidays = [
    new Date(easter.getTime() + EASTER_OFFSETS.GOOD_FRIDAY * MS_PER_DAY),
    easter,
    new Date(easter.getTime() + EASTER_OFFSETS.EASTER_MONDAY * MS_PER_DAY),
    new Date(easter.getTime() + EASTER_OFFSETS.ASCENSION_DAY * MS_PER_DAY),
    new Date(easter.getTime() + EASTER_OFFSETS.WHIT_SUNDAY * MS_PER_DAY),
    new Date(easter.getTime() + EASTER_OFFSETS.WHIT_MONDAY * MS_PER_DAY),
  ];

  const midsummerEve = getMidsummerEve(year);
  const midsummerHolidays = [
    midsummerEve,
    new Date(midsummerEve.getTime() + MS_PER_DAY),
  ];

  const allSaintsDay = getAllSaintsDay(year);
  const holidays = [...baseHolidays, ...easterRelatedHolidays, ...midsummerHolidays, allSaintsDay];

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
    const date = new Date(oct31.getTime() + i * MS_PER_DAY);
    if (date.getDay() === 6) { // Saturday
      return date;
    }
  }
  return new Date(year, 11 - 1, 1); // Fallback to November 1 (month 11)
}

// Convert a Date object to Swedish time (Europe/Stockholm timezone)
// Returns a new Date object where getHours(), getDate(), getMonth(), etc.
// return Swedish local time values instead of the user's local time values.
// 
// Note: This does NOT preserve the same moment in time - it creates a different
// Date object that happens to have the same local time components as Swedish time.
// This is intentional because we need Swedish time values for comparisons.
// 
// Example: If it's 14:00 Swedish time and user is in New York (UTC-5):
// - Input: Date representing 14:00 Swedish = 08:00 NY = 13:00 UTC
// - Output: Date where getHours() returns 14 (Swedish hour)
// - The output represents 14:00 in the user's local timezone, not the same moment
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
  
  // Create a Date object in the user's local timezone using the Swedish time components.
  // This means the Date will represent a different moment in time than the input,
  // but calling getHours(), getDate(), etc. will return the Swedish time values.
  // This is exactly what we need for comparing against Swedish business rules.
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
const isSameCalendarDay = (left: Date, right: Date): boolean =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

function isHoliday(date: Date, holidays: readonly Date[]): boolean {
  return holidays.some((holiday) => isSameCalendarDay(holiday, date));
}

// Check if current time is high load period
export function isHighLoadPeriod(company: PowerGridCompany, now: Date = new Date()): boolean {
  // Convert to Swedish time (Europe/Stockholm) since all companies operate on Swedish time
  const swedishNow = toSwedishTime(now);

  const month = swedishNow.getMonth() + 1; // Convert to natural month number (1-12)
  const hour = swedishNow.getHours();
  const dayOfWeek = swedishNow.getDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday

  if (!company.highLoadMonths.includes(month)) {
    return false;
  }

  if (hour < company.highLoadHours.start || hour >= company.highLoadHours.end) {
    return false;
  }

  if (company.highLoadWeekdays && (dayOfWeek === 0 || dayOfWeek === 6)) {
    return false;
  }

  const holidays = getSwedishHolidays(swedishNow.getFullYear());
  return !isHoliday(swedishNow, holidays);
}

export function getLoadStatus(company: PowerGridCompany): LoadStatus {
  return isHighLoadPeriod(company) ? 'high' : 'low';
}

export function isCompanyActive(company: PowerGridCompany, now: Date = new Date()): boolean {
  if (!company.effectiveDate) {
    return true;
  }

  const effectiveDate = new Date(company.effectiveDate);
  return !Number.isNaN(effectiveDate.getTime()) && effectiveDate <= now;
}

// Calculate the next time the tariff will change
export function getNextTariffChange(company: PowerGridCompany, now: Date = new Date()): Date {
  const currentlyHighLoad = isHighLoadPeriod(company, now);

  let nextChange = new Date(now);

  for (let i = 0; i < MAX_LOOKAHEAD_DAYS * 24; i++) {
    nextChange = new Date(nextChange.getTime() + MS_PER_HOUR);

    // Note: isHighLoadPeriod internally calls getSwedishHolidays with the year from the date,
    // so holidays are automatically recalculated when crossing year boundaries.
    const willBeHighLoad = isHighLoadPeriod(company, nextChange);

    if (willBeHighLoad !== currentlyHighLoad) {
      let exactChange = new Date(nextChange.getTime() - MS_PER_HOUR);

      for (let minute = 0; minute < 60; minute++) {
        exactChange = new Date(exactChange.getTime() + MS_PER_MINUTE);
        const exactWillBeHighLoad = isHighLoadPeriod(company, exactChange);

        if (exactWillBeHighLoad !== currentlyHighLoad) {
          return exactChange;
        }
      }

      return nextChange;
    }
  }

  return new Date(now.getTime() + (MAX_LOOKAHEAD_DAYS + 1) * MS_PER_DAY);
}

// Calculate distance between two coordinates using Haversine formula
// Returns distance in kilometers
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
