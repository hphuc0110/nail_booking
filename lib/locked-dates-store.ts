const API_BASE_URL = "/api/locked-dates"

export interface LockedDate {
  date: string
  reason?: string
  createdAt: string
}

// GET - Lấy tất cả các ngày bị khóa
export async function getLockedDates(): Promise<LockedDate[]> {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })
    
    if (!response.ok) {
      throw new Error("Failed to fetch locked dates")
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error fetching locked dates:", error)
    return []
  }
}

// POST - Thêm ngày bị khóa
export async function addLockedDate(date: string, reason?: string): Promise<LockedDate | null> {
  try {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ date, reason }),
    })
    
    if (!response.ok) {
      throw new Error("Failed to add locked date")
    }
    
    return await response.json()
  } catch (error) {
    console.error("Error adding locked date:", error)
    return null
  }
}

// DELETE - Xóa ngày bị khóa
export async function removeLockedDate(date: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}?date=${encodeURIComponent(date)}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
    
    if (!response.ok) {
      throw new Error("Failed to remove locked date")
    }
    
    return true
  } catch (error) {
    console.error("Error removing locked date:", error)
    return false
  }
}

