import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BASE_URL = 'https://jules.googleapis.com/v1alpha';
const ACCOUNTS_KEY = 'jules_accounts';
const ACTIVE_ACCOUNT_KEY = 'jules_active_account';
const LEGACY_API_KEY_KEY = 'jules_api_key';

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
  },
  deleteItem: async (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

// ── Types ──

export interface Account {
  id: string;
  name: string;
  apiKey: string;
}

// ── Account Management ──

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export async function getAccounts(): Promise<Account[]> {
  // Migration: check for legacy single key
  const legacy = await storage.getItem(LEGACY_API_KEY_KEY);
  const raw = await storage.getItem(ACCOUNTS_KEY);

  if (!raw && legacy) {
    // Migrate legacy single key to accounts
    const migrated: Account[] = [{ id: generateId(), name: 'Default', apiKey: legacy }];
    await saveAccounts(migrated);
    await setActiveAccountId(migrated[0].id);
    await storage.deleteItem(LEGACY_API_KEY_KEY);
    return migrated;
  }

  if (!raw) return [];
  try {
    return JSON.parse(raw) as Account[];
  } catch {
    return [];
  }
}

export async function saveAccounts(accounts: Account[]): Promise<void> {
  await storage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export async function getActiveAccountId(): Promise<string | null> {
  return await storage.getItem(ACTIVE_ACCOUNT_KEY);
}

export async function setActiveAccountId(id: string): Promise<void> {
  await storage.setItem(ACTIVE_ACCOUNT_KEY, id);
}

export async function getActiveAccount(): Promise<Account | null> {
  const accounts = await getAccounts();
  if (accounts.length === 0) return null;
  const activeId = await getActiveAccountId();
  return accounts.find(a => a.id === activeId) || accounts[0];
}

export async function addAccount(name: string, apiKey: string): Promise<Account> {
  const accounts = await getAccounts();
  const account: Account = { id: generateId(), name, apiKey };
  accounts.push(account);
  await saveAccounts(accounts);
  // Auto-activate if first account
  if (accounts.length === 1) {
    await setActiveAccountId(account.id);
  }
  return account;
}

export async function removeAccount(id: string): Promise<void> {
  let accounts = await getAccounts();
  accounts = accounts.filter(a => a.id !== id);
  await saveAccounts(accounts);
  // If removed was active, switch to first
  const activeId = await getActiveAccountId();
  if (activeId === id && accounts.length > 0) {
    await setActiveAccountId(accounts[0].id);
  }
}

export async function updateAccount(id: string, updates: Partial<Omit<Account, 'id'>>): Promise<void> {
  const accounts = await getAccounts();
  const idx = accounts.findIndex(a => a.id === id);
  if (idx !== -1) {
    accounts[idx] = { ...accounts[idx], ...updates };
    await saveAccounts(accounts);
  }
}

// ── Legacy compatibility ──

export const getApiKey = async () => {
  const account = await getActiveAccount();
  return account?.apiKey || null;
};

export const setApiKey = async (key: string) => {
  // Legacy: update active account or create one
  const account = await getActiveAccount();
  if (account) {
    await updateAccount(account.id, { apiKey: key });
  } else {
    await addAccount('Default', key);
  }
};

// ── Axios Client ──

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

client.interceptors.request.use(async (config) => {
  const account = await getActiveAccount();
  if (account) {
    config.headers['X-Goog-Api-Key'] = account.apiKey;
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
        githubRepoContext: { startingBranch: 'main' },
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
