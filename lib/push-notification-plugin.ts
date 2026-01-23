/**
 * Push Notification Plugin
 * 
 * This plugin automatically registers a service worker and subscribes to push notifications.
 * It runs in the background without any UI components.
 * 
 * Usage:
 * 1. Import the plugin in any page/component to auto-initialize:
 *    import "@/lib/push-notification-plugin"
 * 
 * 2. Send a notification from anywhere:
 *    import { sendPushNotification } from "@/lib/push-notification-plugin"
 *    await sendPushNotification("Your message here")
 * 
 * The plugin will:
 * - Automatically register the service worker
 * - Automatically subscribe to push notifications
 * - Periodically check and re-sync subscription status
 * - Handle service worker updates
 */

import { subscribeUser } from "@/app/action"
import urlBase64ToUint8Array from "@/utils/web-push-utils"

const SUBSCRIPTION_STORAGE_KEY = 'push_subscription_endpoint'

class PushNotificationPlugin {
    private checkInterval: NodeJS.Timeout | null = null
    private isInitialized = false
    private registration: ServiceWorkerRegistration | null = null

    /**
     * Initialize the push notification plugin
     * Automatically registers service worker and subscribes to push notifications
     */
    async init() {
        if (this.isInitialized) {
            return
        }

        // Check if browser supports push notifications
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
            console.warn('Push notifications are not supported in this browser')
            return
        }

        try {
            await this.registerServiceWorker()
            await this.autoSubscribe()

            // Set up periodic subscription check (every 5 minutes)
            this.checkInterval = setInterval(() => {
                this.checkSubscriptionStatus()
            }, 5 * 60 * 1000)

            this.isInitialized = true
            console.log('Push notification plugin initialized')
        } catch (error) {
            console.error('Failed to initialize push notification plugin:', error)
        }
    }

    /**
     * Register the service worker
     */
    private async registerServiceWorker() {
        try {
            this.registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/',
                updateViaCache: 'none',
            })

            // Wait for service worker to be ready
            await navigator.serviceWorker.ready

            // Handle service worker updates
            this.registration.addEventListener('updatefound', () => {
                const newWorker = this.registration?.installing
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'activated') {
                            // Service worker updated, re-check subscription
                            this.checkSubscriptionStatus()
                        }
                    })
                }
            })
        } catch (error) {
            console.error('Error registering service worker:', error)
            throw error
        }
    }

    /**
     * Automatically subscribe to push notifications
     */
    private async autoSubscribe() {
        try {
            if (!this.registration) {
                await navigator.serviceWorker.ready
                const registrations = await navigator.serviceWorker.getRegistrations()
                this.registration = registrations[0] || null
            }

            if (!this.registration) {
                throw new Error('Service worker registration not found')
            }

            // Check if already subscribed
            let sub = await this.registration.pushManager.getSubscription()

            if (!sub) {
                // Create new subscription
                const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
                if (!vapidPublicKey) {
                    throw new Error('NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set')
                }

                sub = await this.registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
                })

                // Save subscription to localStorage
                try {
                    localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, sub.endpoint)
                } catch (e) {
                    console.warn('Failed to save subscription to localStorage:', e)
                }
            } else {
                // Update localStorage with existing subscription
                try {
                    localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, sub.endpoint)
                } catch (e) {
                    console.warn('Failed to save subscription to localStorage:', e)
                }
            }

            // Sync with server
            const serializedSub = JSON.parse(JSON.stringify(sub))
            await subscribeUser(serializedSub).catch(err => {
                console.error('Failed to sync subscription with server:', err)
            })

            return sub
        } catch (error) {
            console.error('Error auto-subscribing to push notifications:', error)
            // Clear stale state on error
            try {
                localStorage.removeItem(SUBSCRIPTION_STORAGE_KEY)
            } catch (e) {
                // Ignore localStorage errors
            }
            throw error
        }
    }

    /**
     * Check subscription status and re-sync if needed
     */
    private async checkSubscriptionStatus() {
        try {
            const registration = await navigator.serviceWorker.ready
            const currentSub = await registration.pushManager.getSubscription()

            if (currentSub) {
                // Subscription exists in service worker
                const storedEndpoint = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY)

                if (!storedEndpoint || storedEndpoint !== currentSub.endpoint) {
                    // Subscription changed or was lost from storage, update it
                    try {
                        localStorage.setItem(SUBSCRIPTION_STORAGE_KEY, currentSub.endpoint)
                    } catch (e) {
                        console.warn('Failed to update subscription in localStorage:', e)
                    }

                    // Re-sync with server
                    const serializedSub = JSON.parse(JSON.stringify(currentSub))
                    await subscribeUser(serializedSub).catch(err => {
                        console.error('Failed to re-sync subscription with server:', err)
                    })
                }
            } else {
                // No subscription in service worker, try to re-subscribe
                const storedEndpoint = localStorage.getItem(SUBSCRIPTION_STORAGE_KEY)
                if (storedEndpoint) {
                    // We had a subscription but it's gone, try to re-subscribe
                    try {
                        await this.autoSubscribe()
                    } catch (err) {
                        console.error('Failed to re-subscribe:', err)
                        localStorage.removeItem(SUBSCRIPTION_STORAGE_KEY)
                    }
                }
            }
        } catch (error) {
            console.error('Error checking subscription status:', error)
        }
    }

    /**
     * Get current subscription
     */
    async getSubscription(): Promise<PushSubscription | null> {
        try {
            const registration = await navigator.serviceWorker.ready
            return await registration.pushManager.getSubscription()
        } catch (error) {
            console.error('Error getting subscription:', error)
            return null
        }
    }

    /**
     * Cleanup - stop checking and clear interval
     */
    cleanup() {
        if (this.checkInterval) {
            clearInterval(this.checkInterval)
            this.checkInterval = null
        }
        this.isInitialized = false
    }
}

// Create singleton instance
const pushNotificationPlugin = new PushNotificationPlugin()

// Auto-initialize when module is loaded (client-side only)
if (typeof window !== 'undefined') {
    // Initialize after a short delay to ensure page is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            pushNotificationPlugin.init()
        })
    } else {
        // DOM already loaded
        pushNotificationPlugin.init()
    }
}

/**
 * Send a push notification message
 * @param message - The message to send
 * @returns Promise with result of sending notification
 */
export async function sendPushNotification(message: string) {
    const { sendNotification } = await import('@/app/action')
    return await sendNotification(message)
}

/**
 * Get the push notification plugin instance
 */
export function getPushNotificationPlugin() {
    return pushNotificationPlugin
}

export default pushNotificationPlugin
