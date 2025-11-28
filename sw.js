// Simple service worker for GitHub Pages compatibility
const CACHE_NAME = 'buffon-needle-v1';

self.addEventListener('install', event => {
  console.log('Service worker installing...');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('Service worker activating...');
});

self.addEventListener('fetch', event => {
  // Simple pass-through for GitHub Pages
  event.respondWith(fetch(event.request));
});