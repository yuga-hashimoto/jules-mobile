import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator as RNActivityIndicator,
} from 'react-native';
import { ActivityIndicator, Searchbar, Snackbar, Text, TouchableRipple, useTheme, IconButton, Menu } from 'react-native-paper';
import Colors from '../../constants/Colors';
import { JulesApi, Account, getAccounts, getActiveAccountId, setActiveAccountId, type Session } from '../../services/jules';
import { DropdownSelector } from '../../components/DropdownSelector';

function StatusDot({ state }: { state?: string }) {
  const colorMap: Record<string, string> = {
    QUEUED: Colors.jules.textSecondary,
    PLANNING: Colors.jules.statusWorking,
    AWAITING_PLAN_APPROVAL: Colors.jules.statusWaiting,
    AWAITING_USER_FEEDBACK: Colors.jules.statusWaiting,
    IN_PROGRESS: Colors.jules.statusWorking,
    PAUSED: Colors.jules.statusWaiting,
    COMPLETED: Colors.jules.statusDone,
    DONE: Colors.jules.statusDone,
    SUCCEEDED: Colors.jules.statusDone,
    FAILED: Colors.jules.statusFailed,
    CANCELLED: Colors.jules.statusCancelled,
    STATE_UNSPECIFIED: Colors.jules.textSecondary,
    WORKING: Colors.jules.statusWorking,
    RUNNING: Colors.jules.statusWorking,
    WAITING_FOR_USER: Colors.jules.statusWaiting,
    NEEDS_CLARIFICATION: Colors.jules.statusWaiting,
  };
  const color = (state && colorMap[state]) || Colors.jules.textSecondary;
  return (
    <View
      style={{
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: color,
        marginRight: 10,
        marginTop: 5,
        flexShrink: 0,
      }}
    />
  );
}

interface SessionItemProps {
  item: Session;
  onDelete: (session: Session) => void;
}

function SessionItem({ item, onDelete }: SessionItemProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [menuVisible, setMenuVisible] = useState(false);

  const showDeleteConfirm = () => {
    setMenuVisible(false);
    Alert.alert(
      t('deleteSession'),
      t('deleteSessionConfirm', { title: item.title || item.id }),
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('delete'),
          style: 'destructive',
          onPress: () => onDelete(item),
        },
      ]
    );
  };

  return (
    <TouchableRipple
      onPress={() => router.push(`/session/${encodeURIComponent(item.name)}`)}
      rippleColor="rgba(113, 92, 215, 0.12)"
      style={[styles.sessionRow, { borderBottomColor: Colors.jules.border }]}
    >
      <View style={styles.sessionRowInner}>
        <StatusDot state={item.state} />
        <View style={styles.sessionTextContainer}>
          <Text
            numberOfLines={1}
            style={[styles.sessionTitle, { color: theme.colors.onSurface }]}
          >
            {item.title || item.id}
          </Text>
          {item.prompt ? (
            <Text
              numberOfLines={1}
              style={[styles.sessionSubtitle, { color: theme.colors.onSurfaceVariant }]}
            >
              {item.prompt}
            </Text>
          ) : null}
        </View>
        
        {/* Menu Button */}
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <IconButton
              icon="dots-vertical"
              size={20}
              iconColor={Colors.jules.textSecondary}
              onPress={() => setMenuVisible(true)}
              style={{ margin: 0 }}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              router.push(`/session/${encodeURIComponent(item.name)}`);
            }}
            title={t('viewDetails')}
            leadingIcon="eye"
          />
          <Menu.Item
            onPress={showDeleteConfirm}
            title={t('delete')}
            leadingIcon="delete"
            titleStyle={{ color: Colors.jules.statusFailed }}
          />
        </Menu>

        <MaterialCommunityIcons
          name="chevron-right"
          size={18}
          color={Colors.jules.textSecondary}
          style={{ flexShrink: 0 }}
        />
      </View>
    </TouchableRipple>
  );
}

export default function SessionsScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [accounts, setAccountsList] = useState<Account[]>([]);
  const [activeAccountId, setActiveAccId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const pageTokenRef = useRef<string | undefined>(undefined);
  const hasMoreRef = useRef(true);

  const { t } = useTranslation();
  const theme = useTheme();

  const loadData = async (isRefresh = false) => {
    if (loading || loadingMore) return;
    
    if (isRefresh) {
      setLoading(true);
      pageTokenRef.current = undefined;
      hasMoreRef.current = true;
    }

    setError(null);
    try {
      // Load accounts on refresh
      if (isRefresh) {
        const accs = await getAccounts();
        setAccountsList(accs);
        const aid = await getActiveAccountId();
        setActiveAccId(aid);

        const sourcesData = await JulesApi.listSources();
        setSources(sourcesData.sources || []);
      }

      // Load sessions with pagination
      const response = await JulesApi.listSessions({
        pageSize: 20,
        pageToken: isRefresh ? undefined : pageTokenRef.current,
      });

      const newSessions = response.sessions || [];
      if (isRefresh) {
        setSessions(newSessions);
      } else {
        setSessions(prev => [...prev, ...newSessions]);
      }

      pageTokenRef.current = response.nextPageToken;
      hasMoreRef.current = !!response.nextPageToken;
    } catch (e) {
      console.error(e?.message || e);
      setError(t('errorLoading'));
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMoreRef.current) return;
    setLoadingMore(true);
    await loadData(false);
  };

  const handleDeleteSession = async (session: Session) => {
    try {
      await JulesApi.deleteSession(session.name);
      setSessions(prev => prev.filter(s => s.name !== session.name));
    } catch (e: any) {
      console.error('Failed to delete session:', e);
      setError(e?.response?.data?.error?.message || t('deleteFailed'));
    }
  };

  const handleSwitchAccount = async (id: string) => {
    await setActiveAccountId(id);
    setActiveAccId(id);
    loadData(true);
  };

  useFocusEffect(
    useCallback(() => {
      loadData(true);
    }, [])
  );

  const filteredSessions = useMemo(() => {
    let filtered = sessions;
    if (selectedSource) {
      filtered = filtered.filter(s => s.sourceContext?.source === selectedSource);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(s =>
        (s.title || s.name || '').toLowerCase().includes(q) ||
        (s.prompt || '').toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [sessions, selectedSource, searchQuery]);

  const renderItem = ({ item }: { item: Session }) => (
    <SessionItem item={item} onDelete={handleDeleteSession} />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <RNActivityIndicator size="small" color={Colors.jules.primary} />
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Quick create input — taps into create screen */}
      <TouchableRipple
        onPress={() => router.push({ pathname: '/create', params: { prefetchedSources: JSON.stringify(sources) } })}
        rippleColor="rgba(113, 92, 215, 0.15)"
        style={[styles.quickCreate, { backgroundColor: theme.colors.surfaceVariant, borderColor: Colors.jules.border }]}
      >
        <View style={styles.quickCreateInner}>
          <Text style={[styles.quickCreateText, { color: theme.colors.onSurfaceVariant }]}>
            {t('describeTask')}
          </Text>
          <View style={[styles.quickCreateArrow, { backgroundColor: Colors.jules.primary }]}>
            <MaterialCommunityIcons name="arrow-right" size={16} color="#fff" />
          </View>
        </View>
      </TouchableRipple>

      {/* Search bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder={t('searchSessions')}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
          inputStyle={{ color: theme.colors.onSurface, fontSize: 14 }}
          iconColor={Colors.jules.textSecondary}
          placeholderTextColor={Colors.jules.textSecondary}
        />
      </View>

      {/* Account selector */}
      {accounts.length > 1 && (
        <View style={styles.filterContainer}>
          <DropdownSelector
            value={activeAccountId}
            options={accounts.map(acc => ({ label: acc.name, value: acc.id }))}
            onSelect={(id) => id && handleSwitchAccount(id)}
            placeholder={t('noAccounts')}
            iconName="account-key-outline"
            style={[styles.filterButton, { borderColor: Colors.jules.primary + '66' }]}
            textStyle={styles.filterButtonText}
            iconSize={14}
            chevronSize={14}
          />
        </View>
      )}

      {/* Repository filter */}
      {sources.length > 0 && (
        <View style={styles.filterContainer}>
          <DropdownSelector
            value={selectedSource}
            options={[
              { label: t('allRepositories'), value: null },
              ...sources.map(source => ({
                label: `${source.githubRepo.owner}/${source.githubRepo.repo}`,
                value: source.name,
              })),
            ]}
            onSelect={setSelectedSource}
            placeholder={t('allRepositories')}
            iconName="source-repository"
            style={styles.filterButton}
            textStyle={styles.filterButtonText}
            iconSize={14}
            chevronSize={14}
            showCheckmark={false}
          />
        </View>
      )}

      {/* Sessions list */}
      {loading && sessions.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.jules.primary} />
      ) : (
        <FlatList
          data={filteredSessions}
          renderItem={renderItem}
          keyExtractor={item => item.name}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => loadData(true)}
              colors={[Colors.jules.primary]}
              tintColor={Colors.jules.primary}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListHeaderComponent={
            filteredSessions.length > 0 ? (
              <View style={[styles.listHeader, { borderBottomColor: Colors.jules.border }]}>
                <Text style={[styles.listHeaderText, { color: theme.colors.onSurfaceVariant }]}>
                  {t('recentSessions')} ({filteredSessions.length})
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons
                name="robot-outline"
                size={56}
                color={Colors.jules.primary}
                style={{ opacity: 0.35, marginBottom: 16 }}
              />
              <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
                {t('noSessions')}
              </Text>
            </View>
          }
        />
      )}

      <Snackbar
        visible={!!error}
        onDismiss={() => setError(null)}
        duration={3000}
        style={{ backgroundColor: Colors.jules.statusFailed }}
      >
        {error}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  quickCreate: {
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  quickCreateInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    paddingHorizontal: 16,
  },
  quickCreateText: {
    flex: 1,
    fontSize: 14,
  },
  quickCreateArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  searchBar: {
    borderRadius: 10,
    elevation: 0,
    height: 42,
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    maxWidth: 220,
  },
  filterButtonText: {
    fontSize: 13,
    flex: 1,
  },
  listHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  listHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sessionRow: {
    borderBottomWidth: 1,
  },
  sessionRowInner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  sessionTextContainer: {
    flex: 1,
    marginRight: 8,
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  sessionSubtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  empty: {
    paddingTop: 60,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});
