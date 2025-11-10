// Types for power grid companies and their tariff rules
export interface PowerGridCompany {
  id: string;
  name: string;
  highLoadMonths: number[]; // 0 = January, 11 = December
  highLoadHours: { start: number; end: number }; // 24-hour format
  highLoadWeekdays: boolean; // Only weekdays
}

// Swedish power grid companies with their tariff rules
export const powerGridCompanies: PowerGridCompany[] = [
  {
    id: 'ellevio',
    name: 'Ellevio',
    highLoadMonths: [10, 0, 1, 2], // November to March (Nov=10, Dec=0, Jan=0, Feb=1, Mar=2)
    highLoadHours: { start: 7, end: 21 },
    highLoadWeekdays: true,
  },
  {
    id: 'vattenfall',
    name: 'Vattenfall Eldistribution',
    highLoadMonths: [10, 0, 1, 2], // November to March
    highLoadHours: { start: 7, end: 21 },
    highLoadWeekdays: true,
  },
  {
    id: 'eon',
    name: 'E.ON Energidistribution',
    highLoadMonths: [10, 0, 1, 2], // November to March
    highLoadHours: { start: 7, end: 21 },
    highLoadWeekdays: true,
  },
  {
    id: 'falbygdens-energi',
    name: 'Falbygdens Energi',
    highLoadMonths: [10, 0, 1, 2], // November to March
    highLoadHours: { start: 7, end: 21 },
    highLoadWeekdays: true,
  },
  {
    id: 'gotlands-energi',
    name: 'Gotlands Energi (GEAB)',
    highLoadMonths: [10, 0, 1, 2], // November to March
    highLoadHours: { start: 7, end: 21 },
    highLoadWeekdays: true,
  },
  {
    id: 'halmstads-energi',
    name: 'Halmstads Energi och Miljö',
    highLoadMonths: [10, 0, 1, 2], // November to March
    highLoadHours: { start: 7, end: 21 },
    highLoadWeekdays: true,
  },
  {
    id: 'karlshamns-energi',
    name: 'Karlshamn Energi',
    highLoadMonths: [10, 0, 1, 2], // November to March
    highLoadHours: { start: 7, end: 21 },
    highLoadWeekdays: true,
  },
  {
    id: 'skelleftea-kraft',
    name: 'Skellefteå Kraft',
    highLoadMonths: [10, 0, 1, 2], // November to March
    highLoadHours: { start: 7, end: 21 },
    highLoadWeekdays: true,
  },
];

// Swedish red days (public holidays) - simplified list for common holidays
export const getSwedishHolidays = (year: number): Date[] => {
  const holidays: Date[] = [
    new Date(year, 0, 1),   // New Year's Day
    new Date(year, 0, 6),   // Epiphany
    new Date(year, 4, 1),   // May Day
    new Date(year, 5, 6),   // National Day
    new Date(year, 11, 24), // Christmas Eve
    new Date(year, 11, 25), // Christmas Day
    new Date(year, 11, 26), // Boxing Day
    new Date(year, 11, 31), // New Year's Eve
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
    const date = new Date(year, 5, day); // June
    if (date.getDay() === 5) { // Friday
      return date;
    }
  }
  return new Date(year, 5, 19); // Fallback
}

// Get All Saints' Day (Saturday between October 31 and November 6)
function getAllSaintsDay(year: number): Date {
  const oct31 = new Date(year, 9, 31); // October 31
  for (let i = 0; i <= 6; i++) {
    const date = new Date(oct31.getTime() + i * 24 * 60 * 60 * 1000);
    if (date.getDay() === 6) { // Saturday
      return date;
    }
  }
  return new Date(year, 10, 1); // Fallback
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
  const month = now.getMonth();
  const hour = now.getHours();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Check if it's in high load months
  if (!company.highLoadMonths.includes(month)) {
    return false;
  }
  
  // Check if it's in high load hours
  if (hour < company.highLoadHours.start || hour >= company.highLoadHours.end) {
    return false;
  }
  
  // Check if it's a weekday (Monday-Friday)
  if (company.highLoadWeekdays && (dayOfWeek === 0 || dayOfWeek === 6)) {
    return false;
  }
  
  // Check if it's a holiday
  const holidays = getSwedishHolidays(now.getFullYear());
  if (isHoliday(now, holidays)) {
    return false;
  }
  
  return true;
}

export function getLoadStatus(company: PowerGridCompany): 'high' | 'low' {
  return isHighLoadPeriod(company) ? 'high' : 'low';
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
    
    const willBeHighLoad = isHighLoadPeriod(company, nextChange);
    
    // If status changes, we found the next change time
    if (willBeHighLoad !== currentlyHighLoad) {
      return nextChange;
    }
  }
  
  // If no change found within 14 days, return a date far in the future
  return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
}
