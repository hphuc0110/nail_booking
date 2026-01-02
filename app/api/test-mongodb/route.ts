import { NextResponse } from 'next/server'
import { getDb } from '@/lib/mongodb'

// Test endpoint to check MongoDB connection
export async function GET() {
  try {
    console.log('Testing MongoDB connection...')
    const db = await getDb()
    console.log('Database connection successful')
    
    // Try to list collections
    const collections = await db.listCollections().toArray()
    console.log('Collections:', collections.map(c => c.name))
    
    // Try a simple operation
    const testResult = await db.collection('test').countDocuments()
    console.log('Test collection count:', testResult)
    
    return NextResponse.json({
      success: true,
      message: 'MongoDB connection successful',
      database: db.databaseName,
      collections: collections.map(c => c.name),
      testCount: testResult
    })
  } catch (error: any) {
    console.error('MongoDB connection test failed:', error)
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Unknown error',
        details: error?.toString(),
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    )
  }
}

