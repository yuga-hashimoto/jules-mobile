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

// Source Types
export interface GitHubBranch {
  displayName: string;
}

export interface GitHubRepo {
  owner: string;
  repo: string;
  isPrivate: boolean;
  defaultBranch: GitHubBranch;
  branches: GitHubBranch[];
}

export interface Source {
  name: string;
  id: string;
  githubRepo: GitHubRepo;
}

export interface ListSourcesResponse {
  sources: Source[];
  nextPageToken?: string;
}

// Session Types
export type SessionState =
  | 'STATE_UNSPECIFIED'
  | 'QUEUED'
  | 'PLANNING'
  | 'AWAITING_PLAN_APPROVAL'
  | 'AWAITING_USER_FEEDBACK'
  | 'IN_PROGRESS'
  | 'PAUSED'
  | 'FAILED'
  | 'COMPLETED';

export type AutomationMode = 'AUTOMATION_MODE_UNSPECIFIED' | 'AUTO_CREATE_PR';

export interface SourceContext {
  source: string;
  githubRepoContext: {
    startingBranch: string;
  };
}

export interface PullRequest {
  url: string;
  title: string;
  description: string;
  branch?: string;
}

export interface SessionOutput {
  pullRequest?: PullRequest;
}

export interface Session {
  name: string;
  id: string;
  prompt: string;
  title?: string;
  state: SessionState;
  url: string;
  sourceContext: SourceContext;
  requirePlanApproval?: boolean;
  automationMode?: AutomationMode;
  outputs?: SessionOutput[];
  createTime: string;
  updateTime: string;
}

export interface ListSessionsResponse {
  sessions: Session[];
  nextPageToken?: string;
}

// Activity Types
export interface PlanStep {
  stepId: string;
  index: number;
  title: string;
  description?: string;
}

export interface Plan {
  id: string;
  steps: PlanStep[];
  createTime: string;
}

export interface GitPatch {
  baseCommitId?: string;
  unidiffPatch: string;
  suggestedCommitMessage?: string;
}

export interface ChangeSet {
  source: string;
  gitPatch?: GitPatch;
}

export interface Artifact {
  changeSet?: ChangeSet;
}

export interface ActivityEvent {
  planGenerated?: { plan: Plan };
  planApproved?: { planId: string };
  userMessaged?: { userMessage: string };
  agentMessaged?: { agentMessage?: string; message?: string };
  progressUpdated?: { title: string; details?: string };
  sessionCompleted?: {};
  sessionFailed?: { reason: string };
  codeGenerated?: any;
  statusChanged?: { status: string };
  message?: { text: string };
  originator?: 'user' | 'agent';
}

export interface Activity {
  name: string;
  id: string;
  actor: 'user' | 'agent' | 'system';
  description?: string;
  createTime: string;
  artifacts?: Artifact[];
  // Event types
  planGenerated?: { plan: Plan };
  planApproved?: { planId: string };
  userMessaged?: { userMessage: string };
  agentMessaged?: { agentMessage?: string; message?: string };
  progressUpdate?: { title: string; details?: string };
  sessionCompleted?: {};
  sessionFailed?: { reason: string };
}

export interface ListActivitiesResponse {
  activities: Activity[];
  nextPageToken?: string;
}

// Request Types
export interface CreateSessionRequest {
  prompt: string;
  title?: string;
  sourceContext: SourceContext;
  requirePlanApproval?: boolean;
  automationMode?: AutomationMode;
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

// ── Helper Functions ──

function extractSessionId(sessionId: string): string {
  return sessionId.startsWith('sessions/') ? sessionId.split('/')[1] : sessionId;
}

function extractActivityId(activityId: string): string {
  return activityId.startsWith('activities/') ? activityId.split('/')[1] : activityId;
}

// ── API Client ──

export const JulesApi = {
  // === Sources API ===

  /**
   * List all sources with pagination and optional filter
   */
  listSources: async (params?: {
    pageSize?: number;
    pageToken?: string;
    filter?: string;
  }): Promise<ListSourcesResponse> => {
    const res = await client.get('/sources', { params });
    return res.data;
  },

  /**
   * Get a single source by ID
   */
  getSource: async (sourceId: string): Promise<Source> => {
    const id = sourceId.startsWith('sources/') ? sourceId.split('/')[1] : sourceId;
    const res = await client.get(`/sources/${id}`);
    return res.data;
  },

  // === Sessions API ===

  /**
   * List all sessions with pagination
   */
  listSessions: async (params?: {
    pageSize?: number;
    pageToken?: string;
  }): Promise<ListSessionsResponse> => {
    const res = await client.get('/sessions', { params });
    return res.data;
  },

  /**
   * Get a single session by ID
   */
  getSession: async (sessionId: string): Promise<Session> => {
    const id = extractSessionId(sessionId);
    const res = await client.get(`/sessions/${id}`);
    return res.data;
  },

  /**
   * Create a new session
   */
  createSession: async (request: CreateSessionRequest): Promise<Session> => {
    const res = await client.post('/sessions', request);
    return res.data;
  },

  /**
   * Delete a session by ID
   */
  deleteSession: async (sessionId: string): Promise<void> => {
    const id = extractSessionId(sessionId);
    await client.delete(`/sessions/${id}`);
  },

  /**
   * Send a message to a session
   */
  sendMessage: async (sessionId: string, prompt: string): Promise<void> => {
    const id = extractSessionId(sessionId);
    const res = await client.post(`/sessions/${id}:sendMessage`, { prompt });
    return res.data;
  },

  /**
   * Approve the plan for a session
   */
  approvePlan: async (sessionId: string): Promise<void> => {
    const id = extractSessionId(sessionId);
    const res = await client.post(`/sessions/${id}:approvePlan`);
    return res.data;
  },

  // === Activities API ===

  /**
   * List activities for a session with pagination
   */
  listActivities: async (
    sessionId: string,
    params?: {
      pageSize?: number;
      pageToken?: string;
    }
  ): Promise<ListActivitiesResponse> => {
    const id = extractSessionId(sessionId);
    const res = await client.get(`/sessions/${id}/activities`, { params });
    return res.data;
  },

  /**
   * Get a single activity by ID
   */
  getActivity: async (sessionId: string, activityId: string): Promise<Activity> => {
    const sid = extractSessionId(sessionId);
    const aid = extractActivityId(activityId);
    const res = await client.get(`/sessions/${sid}/activities/${aid}`);
    return res.data;
  },
};

// ── Convenience Helpers ──

/**
 * Fetch all sessions with automatic pagination
 */
export async function fetchAllSessions(
  pageSize: number = 50
): Promise<Session[]> {
  const sessions: Session[] = [];
  let pageToken: string | undefined;

  do {
    const response = await JulesApi.listSessions({
      pageSize,
      pageToken,
    });
    sessions.push(...(response.sessions || []));
    pageToken = response.nextPageToken;
  } while (pageToken);

  return sessions;
}

/**
 * Fetch all activities for a session with automatic pagination
 */
export async function fetchAllActivities(
  sessionId: string,
  pageSize: number = 100
): Promise<Activity[]> {
  const activities: Activity[] = [];
  let pageToken: string | undefined;

  do {
    const response = await JulesApi.listActivities(sessionId, {
      pageSize,
      pageToken,
    });
    activities.push(...(response.activities || []));
    pageToken = response.nextPageToken;
  } while (pageToken);

  return activities;
}

/**
 * Fetch all sources with automatic pagination
 */
export async function fetchAllSources(
  pageSize: number = 50
): Promise<Source[]> {
  const sources: Source[] = [];
  let pageToken: string | undefined;

  do {
    const response = await JulesApi.listSources({
      pageSize,
      pageToken,
    });
    sources.push(...(response.sources || []));
    pageToken = response.nextPageToken;
  } while (pageToken);

  return sources;
}

/**
 * Create session with simplified parameters
 */
export async function createSessionSimple(
  prompt: string,
  source: string,
  options?: {
    title?: string;
    branch?: string;
    requirePlanApproval?: boolean;
    autoCreatePR?: boolean;
  }
): Promise<Session> {
  return JulesApi.createSession({
    prompt,
    title: options?.title,
    sourceContext: {
      source,
      githubRepoContext: {
        startingBranch: options?.branch || 'main',
      },
    },
    requirePlanApproval: options?.requirePlanApproval,
    automationMode: options?.autoCreatePR ? 'AUTO_CREATE_PR' : undefined,
  });
}
