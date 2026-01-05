import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

interface LockedTimeSlot {
  date: string
  time: string
  reason?: string
  createdAt: string
}

const COLLECTION_NAME = 'locked_time_slots'

// GET - Lấy tất cả các khung giờ bị khóa
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    const db = await getDb()
    const query: any = {}
    if (date) {
      query.date = date
    }
    
    const lockedTimeSlots = await db.collection<LockedTimeSlot>(COLLECTION_NAME)
      .find(query)
      .toArray()
    
    return NextResponse.json(lockedTimeSlots, { status: 200 })
  } catch (error) {
    console.error('Error fetching locked time slots:', error)
    return NextResponse.json(
      { error: 'Failed to fetch locked time slots' },
      { status: 500 }
    )
  }
}

// POST - Thêm khung giờ bị khóa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, time, reason } = body

    if (!date || !time) {
      return NextResponse.json(
        { error: 'Date and time are required' },
        { status: 400 }
      )
    }

    const db = await getDb()
    
    // Kiểm tra xem khung giờ đã bị khóa chưa
    const existing = await db.collection<LockedTimeSlot>(COLLECTION_NAME)
      .findOne({ date, time })

    if (existing) {
      return NextResponse.json(
        { error: 'Time slot is already locked' },
        { status: 400 }
      )
    }

    const lockedTimeSlot: LockedTimeSlot = {
      date,
      time,
      reason: reason || '',
      createdAt: new Date().toISOString()
    }

    const result = await db.collection<LockedTimeSlot>(COLLECTION_NAME)
      .insertOne(lockedTimeSlot)

    return NextResponse.json(
      { ...lockedTimeSlot, _id: result.insertedId },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating locked time slot:', error)
    return NextResponse.json(
      { error: 'Failed to create locked time slot' },
      { status: 500 }
    )
  }
}

// DELETE - Xóa khung giờ bị khóa
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const time = searchParams.get('time')

    if (!date || !time) {
      return NextResponse.json(
        { error: 'Date and time parameters are required' },
        { status: 400 }
      )
    }

    const db = await getDb()
    const result = await db.collection<LockedTimeSlot>(COLLECTION_NAME)
      .deleteOne({ date, time })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Locked time slot not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: 'Locked time slot removed successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting locked time slot:', error)
    return NextResponse.json(
      { error: 'Failed to delete locked time slot' },
      { status: 500 }
    )
  }
}

