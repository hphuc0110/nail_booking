

import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    "name": "Nail Booking",
    "short_name": "Nail Booking",
    "start_url": "/",
    "display": "standalone",
    "theme_color": "#000000",
    "background_color": "#000000",
    "description": "Nail Booking",
    "icons": [
      {
        "src": "icons/android-launchericon-48-48.png",
        "sizes": "32x32",
        "type": "image/png"
      },
      {
        "src": "icons/android-launchericon-72-72.png",
        "sizes": "64x64",
        "type": "image/png"
      },
      {
        "src": "icons/android-launchericon-96-96.png",
        "sizes": "96x96",
        "type": "image/png"
      },
      {
        "src": "icons/android-launchericon-144-144.png",
        "sizes": "128x128",
        "type": "image/png"
      },
      {
        "src": "icons/android-launchericon-192-192.png",
        "sizes": "168x168",
        "type": "image/png"
      },
      {
        "src": "icons/android-launchericon-512-512.png",
        "sizes": "192x192",
        "type": "image/png"
      },
    ],
    "related_applications": []
  }
}