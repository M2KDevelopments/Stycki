const dev = process.env.NODE_ENV !== 'production';
export const API_URL = !dev ? 'https://stickynotespro.m2kdevelopments.com' : "http://localhost:3000";