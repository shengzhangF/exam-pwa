const CACHE = 'exammaster-v17';

// 此版本用于彻底清除旧 Service Worker 和缓存的死锁问题
// 激活后删除所有缓存并注销自己，让页面重新从网络加载最新代码

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => {
      console.log('[SW] 已清空旧缓存，准备注销');
      return self.registration.unregister();
    })
  );
  self.clients.claim();
});

// 不做任何拦截，所有请求直接走网络
self.addEventListener('fetch', () => {});
