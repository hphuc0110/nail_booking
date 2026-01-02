import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'
import type { Booking } from '@/lib/types'

// GET - Lấy tất cả bookings
export async function GET() {
  try {
    const db = await getDb()
    const bookings = await db.collection<Booking>('bookings').find({}).toArray()
    
    return NextResponse.json(bookings, { status: 200 })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

// POST - Tạo booking mới
export async function POST(request: NextRequest) {
  try {
    console.log('=== POST /api/bookings - Starting ===')
    
    const booking: Booking = await request.json()
    console.log('Received booking data:', JSON.stringify(booking, null, 2))
    
    // Validate required fields
    if (!booking.id || !booking.customerName || !booking.customerPhone || !booking.customerEmail) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          message: 'Booking must have id, customerName, customerPhone, and customerEmail'
        },
        { status: 400 }
      )
    }
    
    console.log('Attempting to connect to database...')
    const db = await getDb()
    console.log('Database connected successfully')
    
    console.log('Attempting to insert booking...')
    const result = await db.collection<Booking>('bookings').insertOne(booking)
    console.log('Insert result:', result)
    
    if (result.insertedId) {
      console.log('Booking inserted successfully with ID:', result.insertedId)
      return NextResponse.json(
        { ...booking, _id: result.insertedId },
        { status: 201 }
      )
    }
    
    console.error('Insert failed - no inserted ID returned')
    return NextResponse.json(
      { error: 'Failed to create booking', details: 'No inserted ID returned' },
      { status: 500 }
    )
  } catch (error: any) {
    console.error('=== ERROR in POST /api/bookings ===')
    console.error('Error type:', error?.constructor?.name)
    console.error('Error message:', error?.message)
    console.error('Error stack:', error?.stack)
    console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    
    const errorMessage = error?.message || 'Unknown error'
    const errorDetails = error?.toString() || 'No details available'
    const errorName = error?.name || 'Error'
    
    return NextResponse.json(
      { 
        error: 'Failed to create booking',
        message: errorMessage,
        name: errorName,
        details: errorDetails,
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}



