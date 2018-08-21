document.addEventListener('DOMContentLoaded', (event) => {
  registerServiceWorker();
});

/**
 * Register service worker
 */
registerServiceWorker = () => {
  if (!navigator.serviceWorker) {
    console.log('Service workers are not supported');
    return;
  }

  navigator.serviceWorker.register('/sw.js', { scope: '/' }).then(function() {
    console.log('Serivce worker ready!')
  }).catch(function () {
    console.log('Failed to register service worker!')
  });
};