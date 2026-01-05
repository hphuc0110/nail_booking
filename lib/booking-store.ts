import type { Booking } from "./types"

const API_BASE_URL = "/api/bookings"

// GET - Lấy tất cả bookings từ MongoDB
export async function getBookings(): Promise<Booking[]> {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })
    
    if (!response.ok) {
      throw new Error("Failed to fetch bookings")
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return []
  }
}

// POST - Lưu booking mới vào MongoDB
export async function saveBooking(booking: Booking): Promise<Booking | null> {
  try {
    console.log('Saving booking:', booking)
    
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(booking),
    })
    
    let responseData: any = {}
    try {
      responseData = await response.json()
    } catch (e) {
      console.error("Failed to parse response JSON:", e)
    }
    
    if (!response.ok) {
      const errorMessage = responseData.message || responseData.error || responseData.details || responseData.name || `HTTP ${response.status}: ${response.statusText}`
      const fullError = responseData.stack ? `${errorMessage}\n\nStack: ${responseData.stack}` : errorMessage
      
      console.error("Failed to save booking:", {
        status: response.status,
        statusText: response.statusText,
        error: errorMessage,
        name: responseData.name,
        details: responseData.details,
        fullResponse: responseData
      })
      throw new Error(fullError)
    }
    
    console.log('Booking saved successfully:', responseData)
    return responseData
  } catch (error: any) {
    console.error("Error saving booking:", error)
    throw error // Re-throw để component có thể xử lý
  }
}

// PUT - Cập nhật booking trong MongoDB
export async function updateBooking(id: string, updates: Partial<Booking>): Promise<Booking | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updates),
    })
    
    if (!response.ok) {
      throw new Error("Failed to update booking")
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error updating booking:", error)
    return null
  }
}

// DELETE - Xóa booking từ MongoDB
export async function deleteBooking(id: string): Promise<boolean> {
  try {
    console.log('Deleting booking with ID:', id)
    
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
    
    let responseData: any = {}
    try {
      responseData = await response.json()
    } catch (e) {
      console.error("Failed to parse response JSON:", e)
    }
    
    if (!response.ok) {
      const errorMessage = responseData.message || responseData.error || `HTTP ${response.status}: ${response.statusText}`
      console.error("Failed to delete booking:", {
        status: response.status,
        statusText: response.statusText,
        error: errorMessage,
        details: responseData
      })
      throw new Error(errorMessage)
    }
    
    console.log('Booking deleted successfully')
    return true
  } catch (error: any) {
    console.error("Error deleting booking:", error)
    throw error // Re-throw để component có thể xử lý
  }
}

// GET - Lấy booking theo ID từ MongoDB
export async function getBookingById(id: string): Promise<Booking | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })
    
    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error("Failed to fetch booking")
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error fetching booking:", error)
    return null
  }
}

/**
 * Generate a short booking ID (e.g., BK-A1B2)
 */
export function generateId(): string {
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase() // 4 random chars
  return `BK-${randomStr}`
}

// GET - Kiểm tra khả dụng của khung giờ
export async function checkTimeSlotAvailability(date: string, time: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/bookings/check-availability?date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })
    
    if (!response.ok) {
      return false
    }
    
    const data = await response.json()
    return data.available !== false
  } catch (error) {
    console.error("Error checking time slot availability:", error)
    return false
  }
}

// GET - Lấy số lượng booking theo từng khung giờ trong ngày
export async function getTimeSlotCounts(date: string): Promise<Record<string, number>> {
  try {
    const response = await fetch(`/api/bookings/check-availability?date=${encodeURIComponent(date)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })
    
    if (!response.ok) {
      return {}
    }
    
    const data = await response.json()
    return data.timeSlotCounts || {}
  } catch (error) {
    console.error("Error fetching time slot counts:", error)
    return {}
  }
}

// GET - Lấy số lượng booking cho một khung giờ cụ thể
export async function getTimeSlotBookingCount(date: string, time: string): Promise<number> {
  try {
    const response = await fetch(`/api/bookings/check-availability?date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })
    
    if (!response.ok) {
      return 0
    }
    
    const data = await response.json()
    return data.bookingCount || 0
  } catch (error) {
    console.error("Error fetching time slot booking count:", error)
    return 0
  }
}
