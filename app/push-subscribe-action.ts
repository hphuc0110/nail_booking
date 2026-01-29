'use server'

import { getDb } from '@/lib/mongodb'

const SUBSCRIPTIONS_COLLECTION = 'push_subscriptions'

export async function subscribeUser(sub: PushSubscription) {
  try {
    const db = await getDb()
    const collection = db.collection(SUBSCRIPTIONS_COLLECTION)

    const subscriptionData = {
      endpoint: sub.endpoint,
      role: 'admin',
      keys: (sub as any).keys || null,
      subscription: JSON.parse(JSON.stringify(sub)),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await collection.updateOne(
      { endpoint: sub.endpoint },
      { $set: subscriptionData },
      { upsert: true }
    )

    return { success: true }
  } catch (error) {
    console.error('Error storing subscription:', error)
    return { success: false, error: 'Failed to store subscription' }
  }
}

export async function unsubscribeUser(endpoint?: string) {
  try {
    const db = await getDb()
    const collection = db.collection(SUBSCRIPTIONS_COLLECTION)

    if (endpoint) {
      const result = await collection.deleteOne({ endpoint })
      console.log(`Removed subscription: ${endpoint}`, result.deletedCount > 0 ? 'success' : 'not found')
    } else {
      const result = await collection.deleteMany({})
      console.log(`Removed all subscriptions: ${result.deletedCount} deleted`)
    }

    return { success: true }
  } catch (error) {
    console.error('Error removing subscription:', error)
    return { success: false, error: 'Failed to remove subscription' }
  }
}
