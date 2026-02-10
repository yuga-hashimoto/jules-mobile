import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BASE_URL = 'https://jules.googleapis.com/v1alpha';
const API_KEY_KEY = 'jules_api_key';

// Web compatibility wrapper for storage
const storage = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  }
};

export const getApiKey = async () => {
  return await storage.getItem(API_KEY_KEY);
};

export const setApiKey = async (key: string) => {
  await storage.setItem(API_KEY_KEY, key);
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
    const id = sessionId.startsWith('sessions/') ? sessionId.split('/')[1] : sessionId;
    const res = await client.get(`/sessions/${id}`);
    return res.data;
  },
  listActivities: async (sessionId: string, pageSize = 100) => {
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
