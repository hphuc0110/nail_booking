import type { Booking } from "./types"

const STORAGE_KEY = "mia-nails-bookings"

export function getBookings(): Booking[] {
  if (typeof window === "undefined") return []
  const data = localStorage.getItem(STORAGE_KEY)
  return data ? JSON.parse(data) : []
}

export function saveBooking(booking: Booking): void {
  const bookings = getBookings()
  bookings.push(booking)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings))
}

export function updateBooking(id: string, updates: Partial<Booking>): void {
  const bookings = getBookings()
  const index = bookings.findIndex((b) => b.id === id)
  if (index !== -1) {
    bookings[index] = { ...bookings[index], ...updates }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings))
  }
}

export function deleteBooking(id: string): void {
  const bookings = getBookings()
  const filtered = bookings.filter((b) => b.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}

export function getBookingById(id: string): Booking | undefined {
  const bookings = getBookings()
  return bookings.find((b) => b.id === id)
}

export function generateId(): string {
  return `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
