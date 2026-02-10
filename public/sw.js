self.addEventListener('push', function (event) {
    if (event.data) {
        const data = event.data.json()
        const options = {
            body: data.body,
            icon: data.icon || '/icon.png',
            badge: '/badge.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: '2',
                url: data.data?.url || (self.location.origin + '/admin'),
            },
        }
        event.waitUntil(self.registration.showNotification(data.title, options))
    }
})

self.addEventListener('notificationclick', function (event) {
    console.log('Notification click received.')
    event.notification.close()
    // Mở trang admin của site hiện tại (tránh 404)
    var path = event.notification.data?.url || '/admin'
    var urlToOpen = path.startsWith('http') ? path : (self.location.origin + (path.startsWith('/') ? path : '/' + path))
    event.waitUntil(clients.openWindow(urlToOpen))
})