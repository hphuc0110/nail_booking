// Utility functions for GMT+1 (UTC+1 / CET) timezone handling
// All functions treat dates and times as if they are in GMT+1 timezone (Europe/Berlin)

const TIMEZONE = 'Europe/Berlin' // GMT+1 timezone (CET/CEST)

/**
 * Get current date/time components in GMT+1
 */
function getGMT1Components(date: Date = new Date()): { year: number; month: number; day: number; hours: number; minutes: number; seconds: number } {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
  
  const parts = formatter.formatToParts(date)
  const getPart = (type: string) => {
    const part = parts.find(p => p.type === type)
    return part ? parseInt(part.value) : 0
  }
  
  return {
    year: getPart('year'),
    month: getPart('month'),
    day: getPart('day'),
    hours: getPart('hour'),
    minutes: getPart('minute'),
    seconds: getPart('second')
  }
}

/**
 * Get current date/time in GMT+1
 */
export function getNowGMT1(): Date {
  const now = new Date()
  const components = getGMT1Components(now)
  // Create a date object representing the GMT+1 time
  // We create it as UTC and then adjust
  return new Date(Date.UTC(components.year, components.month - 1, components.day, components.hours, components.minutes, components.seconds))
}

/**
 * Get today's date string (YYYY-MM-DD) in GMT+1
 */
export function getTodayGMT1(): string {
  const components = getGMT1Components()
  return `${components.year}-${String(components.month).padStart(2, '0')}-${String(components.day).padStart(2, '0')}`
}

/**
 * Format date to YYYY-MM-DD string in GMT+1
 * This function treats the input date as a moment in time and converts it to GMT+1
 * For Calendar component dates (which are typically at local midnight), this will
 * format them correctly in GMT+1 timezone
 */
export function formatDateGMT1(date: Date): string {
  // Use Intl to format the date in GMT+1 timezone
  // This ensures we get the correct date regardless of the input date's timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
  
  const parts = formatter.formatToParts(date)
  const getPart = (type: string) => {
    const part = parts.find(p => p.type === type)
    return part ? part.value : '0'
  }
  
  const year = getPart('year')
  const month = getPart('month')
  const day = getPart('day')
  
  return `${year}-${month}-${day}`
}

/**
 * Format a Calendar date object to YYYY-MM-DD string
 * Calendar components create dates representing a calendar date (year, month, day)
 * We extract the date components directly and treat them as GMT+1 date
 * This ensures that when user clicks on "January 5" in the calendar,
 * we get "2026-01-05" regardless of the browser's timezone
 */
export function formatCalendarDateGMT1(date: Date): string {
  // Calendar creates dates at local midnight representing a specific calendar date
  // We extract the year, month, day components directly
  // These represent the calendar date the user selected, which we treat as GMT+1
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/**
 * Create a date from YYYY-MM-DD string, treating it as GMT+1
 * The date string is interpreted as midnight (00:00) in GMT+1
 */
export function parseDateGMT1(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  // Create date string with explicit GMT+1 timezone offset
  const dateTimeString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00+01:00`
  return new Date(dateTimeString)
}

/**
 * Check if a date is today in GMT+1
 */
export function isTodayGMT1(date: Date): boolean {
  const todayStr = getTodayGMT1()
  const dateStr = formatDateGMT1(date)
  return todayStr === dateStr
}

/**
 * Check if a date is in the past in GMT+1
 * Only returns true if the date is BEFORE today (not today itself)
 */
export function isPastGMT1(date: Date): boolean {
  const todayStr = getTodayGMT1()
  const dateStr = formatDateGMT1(date)
  // Only disable if date is strictly before today (not today)
  return dateStr < todayStr
}

/**
 * Check if a date string (YYYY-MM-DD) is Sunday in GMT+1.
 * Used to block booking on Sundays.
 */
export function isSundayGMT1(dateStr: string): boolean {
  const dateAtNoonGMT1 = new Date(dateStr + 'T12:00:00+01:00')
  return dateAtNoonGMT1.getUTCDay() === 0
}

/**
 * Get time string (HH:MM) from a date in GMT+1
 */
export function getTimeGMT1(date: Date): string {
  const components = getGMT1Components(date)
  return `${String(components.hours).padStart(2, '0')}:${String(components.minutes).padStart(2, '0')}`
}

/**
 * Check if a time slot has passed today in GMT+1
 */
export function isTimeSlotPassedGMT1(time: string, selectedDate?: Date): boolean {
  if (!selectedDate || !isTodayGMT1(selectedDate)) {
    return false
  }
  
  const nowComponents = getGMT1Components()
  const [hours, minutes] = time.split(':').map(Number)
  
  // Compare time components in GMT+1
  if (nowComponents.hours > hours) return true
  if (nowComponents.hours === hours && nowComponents.minutes > minutes) return true
  return false
}

/**
 * Create a date object for a specific date and time in GMT+1
 */
export function createDateTimeGMT1(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  const [hours, minutes] = timeStr.split(':').map(Number)
  
  // Create date string with explicit GMT+1 timezone offset
  const dateTimeString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00+01:00`
  return new Date(dateTimeString)
}

