import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import type { Booking } from '@/lib/types'

// GET - Kiểm tra khả dụng của khung giờ
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const time = searchParams.get('time')

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      )
    }

    const db = await getDb()
    
    // Kiểm tra nếu có booking nào đã đặt cho ngày và giờ này
    const query: any = { date }
    if (time) {
      query.time = time
    }

    const existingBookings = await db.collection<Booking>('bookings')
      .find(query)
      .toArray()

    // Nếu có time, trả về số lượng booking trong khung giờ đó
    if (time) {
      const activeBookings = existingBookings.filter(b => b.status !== 'cancelled')
      const bookingCount = activeBookings.length
      
      // Kiểm tra xem khung giờ có bị khóa không
      const lockedTimeSlot = await db.collection('locked_time_slots').findOne({
        date,
        time
      })
      
      return NextResponse.json({ 
        bookingCount,
        isLocked: !!lockedTimeSlot,
        available: !lockedTimeSlot
      }, { status: 200 })
    }

    // Nếu không có time, trả về số lượng booking theo từng khung giờ trong ngày
    const activeBookings = existingBookings.filter(b => b.status !== 'cancelled')
    const timeSlotCounts: Record<string, number> = {}
    
    activeBookings.forEach(booking => {
      if (!timeSlotCounts[booking.time]) {
        timeSlotCounts[booking.time] = 0
      }
      timeSlotCounts[booking.time]++
    })

    return NextResponse.json({ 
      timeSlotCounts,
      totalBookings: activeBookings.length
    }, { status: 200 })
  } catch (error) {
    console.error('Error checking availability:', error)
    return NextResponse.json(
      { error: 'Failed to check availability' },
      { status: 500 }
    )
  }
}

