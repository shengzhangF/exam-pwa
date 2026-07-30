const CACHE = 'exammaster-v17';

// 此版本用于彻底清除旧 Service Worker 和缓存的死锁问题
// 激活后删除所有缓存并注销自己，让页面重新从网络加载最新代码

self.addEventListener('install', () => {
  // 不调用 skipWaiting，让新 SW 等待直到旧 SW 释放
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
  // 不调用 clients.claim，避免强制接管当前页面
});

// 不做任何拦截，所有请求直接走网络
self.addEventListener('fetch', () => {});
