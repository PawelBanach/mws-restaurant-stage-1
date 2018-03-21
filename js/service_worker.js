document.addEventListener('DOMContentLoaded', (event) => {
  registerServiceWorker();
});

/**
 * Register service worker
 */
registerServiceWorker = () => {
  if (!navigator.serviceWorker) return;

  navigator.serviceWorker.register('/sw.js').then(function() {
    console.log('Serivce worker ready!')
  }).catch(function () {
    console.log('Failed to register service worker!')
  });
}