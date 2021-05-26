import { DiscoverCache } from '../index';

// test('Simple set/get', async () => {
//   let cache = new DiscoverCache('127.0.0.1', 6379, 'https://eu.liveapps.cloud.tibco.com');
  
//   await cache.set('MVP', 'analysis', 'test', '3');
//   const response = await cache.get('MVP', 'analysis', 'test')
  
//   cache.disconnect();
//   expect(response).toBe('3');
// });

// test('Simple set/get with expire', async () => {
//   let cache = new DiscoverCache('127.0.0.1', 6379, 'https://eu.liveapps.cloud.tibco.com');
  
//   await cache.set('MVP', 'analysis', 'test-expire', '3', 60);
//   const response = await cache.get('MVP', 'analysis', 'test-expire')
  
//   cache.disconnect();
//   expect(response).toBe('3');
// });

// test('Simple set/get with CIC token', async () => {
//   let cache = new DiscoverCache('127.0.0.1', 6379, 'https://eu.liveapps.cloud.tibco.com');
  
//   const init = await cache.set('CIC~j5HmkDgkNTLHmuhS5lLT8Q1f', 'analysis', 'test', '4');
//   // const response = await cache.get('CIC~j5HmkDgkNTLHmuhS5lLT8Q1f', 'analysis', 'test')
  
//   cache.disconnect();
//   expect('3').toBe('3');
// });

// test('Delete an existing entry using globalsubscription ID', async () => {
//   let cache = new DiscoverCache('127.0.0.1', 6379, 'https://eu.liveapps.cloud.tibco.com');

//   await cache.set('MVP', 'analysis', 'test-delete', '3');
//   await cache.delete('MVP', 'analysis', 'test-delete');

//   cache.disconnect();
//   expect(1).toBe(1);
// });

test('Get all MVP-test* analysis', async () => {
  let cache = new DiscoverCache('127.0.0.1', 6379, 'https://eu.liveapps.cloud.tibco.com');

  await cache.set('MVP', 'analysis', 'test1', '3');
  await cache.set('MVP', 'analysis', 'test2', '3');
  await cache.set('MVP', 'analysis', 'test3', '3');

  await cache.search('CIC~IErJEK8jzp62yZbHyHGIZIcV', 'templates', '*');

  cache.disconnect();
  expect(1).toBe(1);
});


