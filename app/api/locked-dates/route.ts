import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

interface LockedDate {
  date: string
  reason?: string
  createdAt: string
}

const COLLECTION_NAME = 'locked_dates'

// GET - Lấy tất cả các ngày bị khóa
export async function GET() {
  try {
    const db = await getDb()
    const lockedDates = await db.collection<LockedDate>(COLLECTION_NAME)
      .find({})
      .toArray()
    
    return NextResponse.json(lockedDates, { status: 200 })
  } catch (error) {
    console.error('Error fetching locked dates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch locked dates' },
      { status: 500 }
    )
  }
}

// POST - Thêm ngày bị khóa
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, reason } = body

    if (!date) {
      return NextResponse.json(
        { error: 'Date is required' },
        { status: 400 }
      )
    }

    const db = await getDb()
    
    // Kiểm tra xem ngày đã bị khóa chưa
    const existing = await db.collection<LockedDate>(COLLECTION_NAME)
      .findOne({ date })

    if (existing) {
      return NextResponse.json(
        { error: 'Date is already locked' },
        { status: 400 }
      )
    }

    const lockedDate: LockedDate = {
      date,
      reason: reason || '',
      createdAt: new Date().toISOString()
    }

    const result = await db.collection<LockedDate>(COLLECTION_NAME)
      .insertOne(lockedDate)

    return NextResponse.json(
      { ...lockedDate, _id: result.insertedId },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating locked date:', error)
    return NextResponse.json(
      { error: 'Failed to create locked date' },
      { status: 500 }
    )
  }
}

// DELETE - Xóa ngày bị khóa
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json(
        { error: 'Date parameter is required' },
        { status: 400 }
      )
    }

    const db = await getDb()
    const result = await db.collection<LockedDate>(COLLECTION_NAME)
      .deleteOne({ date })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Locked date not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { message: 'Locked date removed successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting locked date:', error)
    return NextResponse.json(
      { error: 'Failed to delete locked date' },
      { status: 500 }
    )
  }
}

