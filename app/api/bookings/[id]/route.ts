import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import type { Booking } from '@/lib/types'

// GET - Lấy booking theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = await getDb()
    const booking = await db.collection<Booking>('bookings').findOne({
      id: id
    })
    
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(booking, { status: 200 })
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

// PUT - Cập nhật booking
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updates: Partial<Booking> = await request.json()
    
    const db = await getDb()
    const result = await db.collection<Booking>('bookings').updateOne(
      { id: id },
      { $set: updates }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }
    
    const updatedBooking = await db.collection<Booking>('bookings').findOne({
      id: id
    })
    
    return NextResponse.json(updatedBooking, { status: 200 })
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

// DELETE - Xóa booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('Deleting booking with ID:', id)
    
    const db = await getDb()
    const result = await db.collection<Booking>('bookings').deleteOne({
      id: id
    })
    
    console.log('Delete result:', result)
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { message: 'Booking deleted successfully' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Error deleting booking:', error)
    console.error('Error stack:', error?.stack)
    return NextResponse.json(
      { 
        error: 'Failed to delete booking',
        message: error?.message || 'Unknown error',
        details: error?.toString()
      },
      { status: 500 }
    )
  }
}

