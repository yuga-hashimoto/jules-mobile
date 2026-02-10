import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'https://jules.googleapis.com/v1alpha';
const API_KEY_KEY = 'jules_api_key';

export const getApiKey = async () => {
  return await SecureStore.getItemAsync(API_KEY_KEY);
};

export const setApiKey = async (key: string) => {
  await SecureStore.setItemAsync(API_KEY_KEY, key);
};

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(async (config) => {
  const key = await getApiKey();
  if (key) {
    config.headers['X-Goog-Api-Key'] = key;
  }
  return config;
});

export const JulesApi = {
  listSources: async () => {
    const res = await client.get('/sources');
    return res.data;
  },
  listSessions: async (pageSize = 20) => {
    const res = await client.get('/sessions', { params: { pageSize } });
    return res.data;
  },
  createSession: async (prompt: string, source: string, automationMode = 'AUTO_CREATE_PR') => {
    const res = await client.post('/sessions', {
      prompt,
      sourceContext: { 
        source,
        githubRepoContext: { startingBranch: 'main' } // Default
      },
      automationMode,
    });
    return res.data;
  },
  getSession: async (sessionId: string) => {
    const res = await client.get(`/sessions/${sessionId}`);
    return res.data;
  },
  listActivities: async (sessionId: string, pageSize = 50) => {
    // Session ID might be full path "sessions/..." or just ID. API expects path in URL.
    // If input is just ID, prepend sessions/
    const id = sessionId.startsWith('sessions/') ? sessionId.split('/')[1] : sessionId;
    const res = await client.get(`/sessions/${id}/activities`, { params: { pageSize } });
    return res.data;
  },
  sendMessage: async (sessionId: string, prompt: string) => {
    const id = sessionId.startsWith('sessions/') ? sessionId.split('/')[1] : sessionId;
    const res = await client.post(`/sessions/${id}:sendMessage`, { prompt });
    return res.data;
  },
  approvePlan: async (sessionId: string) => {
    const id = sessionId.startsWith('sessions/') ? sessionId.split('/')[1] : sessionId;
    const res = await client.post(`/sessions/${id}:approvePlan`);
    return res.data;
  },
};
