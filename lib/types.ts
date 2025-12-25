// Types for the nail salon booking system

export interface Service {
  id: string
  name: string
  nameVi: string
  nameDe: string // Added German name
  price: number
  priceFrom?: boolean // For "ab" prices
  duration: number // in minutes
  category: string
  categoryVi: string
  categoryDe: string // Added German category
}

export interface ServiceCategory {
  id: string
  name: string
  nameVi: string
  nameDe: string // Added German name
  services: Service[]
}

export interface Booking {
  id: string
  customerName: string
  customerPhone: string
  customerEmail: string
  services: Service[]
  date: string
  time: string
  notes: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  createdAt: string
  totalPrice: number
  totalDuration: number
}

export interface BusinessHours {
  day: string
  dayVi: string
  dayDe: string // Added German day
  open: string
  close: string
  closed: boolean
}
