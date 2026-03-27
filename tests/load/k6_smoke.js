import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.K6_BASE_URL || 'http://localhost:8000';
const LOGIN_EMAIL = __ENV.K6_LOGIN_EMAIL || '';
const LOGIN_PASSWORD = __ENV.K6_LOGIN_PASSWORD || '';

export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
};

function login() {
  if (!LOGIN_EMAIL || !LOGIN_PASSWORD) {
    throw new Error('K6_LOGIN_EMAIL and K6_LOGIN_PASSWORD must be set');
  }

  const url = `${BASE_URL}/api/v1/auth/login`;
  const payload = JSON.stringify({
    email: LOGIN_EMAIL,
    password: LOGIN_PASSWORD,
  });

  const res = http.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'login status is 200': (r) => r.status === 200,
    'login returned access token': (r) => !!(r.json('access_token')),
  });

  const token = res.json('access_token');
  return token;
}

export default function () {
  // Scenario 1: health readiness check
  const healthRes = http.get(`${BASE_URL}/health/ready`);
  check(healthRes, {
    'health/ready status is 200': (r) => r.status === 200,
  });

  // Scenario 2: login with test credentials
  const token = login();

  // Scenario 3: authenticated inventory read
  const invRes = http.get(`${BASE_URL}/api/v1/inventory`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  check(invRes, {
    'inventory status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
