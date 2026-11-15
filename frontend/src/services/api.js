import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 300000, // RSS collection and AI generation can take several minutes
});

export async function getHealth() {
  const { data } = await api.get('/health');
  return data;
}

export async function getSources() {
  const { data } = await api.get('/sources');
  return data;
}

export async function createSource(source) {
  const { data } = await api.post('/sources', source);
  return data;
}
export async function toggleSource(id) {
  const { data } = await api.patch(`/sources/${id}/toggle`);
  return data;
}

export async function getBriefings(limit = 10) {
  const { data } = await api.get('/briefings', { params: { limit } });
  return data;
}

export async function getBriefing(id) {
  const { data } = await api.get(`/briefings/${id}`);
  return data;
}

export async function runPipeline(options = {}) {
  const { data } = await api.post('/run', options);
  return data;
}

export async function postBriefing(id) {
  const { data } = await api.post(`/briefings/${id}/post`);
  return data;
}
