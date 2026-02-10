// URL trang admin: luôn lấy từ origin của site (nơi SW chạy) để tránh 404
function getAdminUrl() {
  var origin = self.location.origin
  return origin + '/admin'
}

self.addEventListener('push', function (event) {
  if (event.data) {
    var data = event.data.json()
    var adminUrl = getAdminUrl()
    var options = {
      body: data.body,
      icon: data.icon || '/icon.png',
      badge: '/badge.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2',
        url: adminUrl,
      },
    }
    event.waitUntil(self.registration.showNotification(data.title, options))
  }git 
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  var urlToOpen = getAdminUrl()

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      // Nếu đã có tab/window mở → focus và chuyển sang /admin
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i]
        if (client.url.indexOf(self.location.origin) === 0 && 'focus' in client) {
          client.navigate(urlToOpen)
          return client.focus()
        }
      }
      // Chưa có tab nào → mở tab mới đúng URL admin
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen)
      }
    })
  )
})
