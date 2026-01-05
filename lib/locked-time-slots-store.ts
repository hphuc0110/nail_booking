const API_BASE_URL = "/api/locked-time-slots"

export interface LockedTimeSlot {
  date: string
  time: string
  reason?: string
  createdAt: string
}

// GET - Lấy tất cả các khung giờ bị khóa
export async function getLockedTimeSlots(date?: string): Promise<LockedTimeSlot[]> {
  try {
    const url = date ? `${API_BASE_URL}?date=${encodeURIComponent(date)}` : API_BASE_URL
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })
    
    if (!response.ok) {
      throw new Error("Failed to fetch locked time slots")
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error fetching locked time slots:", error)
    return []
  }
}

// POST - Thêm khung giờ bị khóa
export async function addLockedTimeSlot(date: string, time: string, reason?: string): Promise<LockedTimeSlot | null> {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ date, time, reason }),
    })
    
    if (!response.ok) {
      throw new Error("Failed to add locked time slot")
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error adding locked time slot:", error)
    return null
  }
}

// DELETE - Xóa khung giờ bị khóa
export async function removeLockedTimeSlot(date: string, time: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}?date=${encodeURIComponent(date)}&time=${encodeURIComponent(time)}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
    
    if (!response.ok) {
      throw new Error("Failed to remove locked time slot")
    }
    
    return true
  } catch (error) {
    console.error("Error removing locked time slot:", error)
    return false
  }
}

