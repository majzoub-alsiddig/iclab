'use client';

import { useEffect } from 'react';

export default function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(
          (registration) => {
            console.log('Service Worker registered: ', registration);
            
            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              console.log('New service worker found:', newWorker);
            });
          },
          (err) => {
            console.log('Service Worker registration failed: ', err);
          }
        );
      });

      // Listen for offline/online events
      window.addEventListener('online', () => {
        console.log('App is online');
        // You can trigger a sync here
      });

      window.addEventListener('offline', () => {
        console.log('App is offline');
      });
    }
  }, []);

  return null;
}