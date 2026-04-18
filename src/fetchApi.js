import server from './environment';

const fetchApi = async (endpoint, options = {}) => {
  const url = `${server}${endpoint}`;
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };

  if (token) headers['Authorization'] = `Bearer ${token}`;

  try {
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      localStorage.clear();
      if (window.location.pathname !== '/auth') window.location.href = '/auth';
    }
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Error');
    return data;
  } catch (error) {
    throw error;
  }
};

export default fetchApi;