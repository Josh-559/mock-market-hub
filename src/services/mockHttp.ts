// Mock HTTP service that simulates API latency
const MOCK_LATENCY_MIN = 100;
const MOCK_LATENCY_MAX = 300;

function getRandomLatency(): number {
  return Math.floor(Math.random() * (MOCK_LATENCY_MAX - MOCK_LATENCY_MIN + 1)) + MOCK_LATENCY_MIN;
}

export async function mockFetch<T>(data: T, options?: { delay?: number; shouldFail?: boolean }): Promise<T> {
  const delay = options?.delay ?? getRandomLatency();
  
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (options?.shouldFail) {
        reject(new Error('Mock API Error'));
      } else {
        resolve(data);
      }
    }, delay);
  });
}

export async function mockPost<T, R>(data: T, response: R, options?: { delay?: number }): Promise<R> {
  const delay = options?.delay ?? getRandomLatency();
  
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('[Mock API] POST request:', data);
      resolve(response);
    }, delay);
  });
}
