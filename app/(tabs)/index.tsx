import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, RefreshControl, StyleSheet, TouchableOpacity, View } from 'react-native';
import { ActivityIndicator, Menu, Searchbar, Snackbar, Text, TouchableRipple, useTheme } from 'react-native-paper';
import Colors from '../../constants/Colors';
import { JulesApi, Account, getAccounts, getActiveAccountId, setActiveAccountId } from '../../services/jules';

function StatusDot({ state }: { state?: string }) {
  const colorMap: Record<string, string> = {
    WORKING: Colors.jules.statusWorking,
    RUNNING: Colors.jules.statusWorking,
    WAITING_FOR_USER: Colors.jules.statusWaiting,
    NEEDS_CLARIFICATION: Colors.jules.statusWaiting,
    DONE: Colors.jules.statusDone,
    SUCCEEDED: Colors.jules.statusDone,
    COMPLETED: Colors.jules.statusDone,
    FAILED: Colors.jules.statusFailed,
    CANCELLED: Colors.jules.statusCancelled,
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

export default function SessionsScreen() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [accountMenuVisible, setAccountMenuVisible] = useState(false);
  const [accounts, setAccountsList] = useState<Account[]>([]);
  const [activeAccountId, setActiveAccId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const { t } = useTranslation();

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load accounts
      const accs = await getAccounts();
      setAccountsList(accs);
      const aid = await getActiveAccountId();
      setActiveAccId(aid);

      const [sessionsData, sourcesData] = await Promise.all([
        JulesApi.listSessions(),
        JulesApi.listSources()
      ]);
      setSessions(sessionsData.sessions || []);
      setSources(sourcesData.sources || []);
    } catch (e) {
      console.error(e);
      setError(t('errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchAccount = async (id: string) => {
    await setActiveAccountId(id);
    setActiveAccId(id);
    setAccountMenuVisible(false);
    loadData();
  };

  const getActiveAccountName = () => {
    const acc = accounts.find(a => a.id === activeAccountId);
    return acc?.name || accounts[0]?.name || t('noAccounts');
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
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

  const getSourceLabel = (sourceName: string) => {
    const source = sources.find(s => s.name === sourceName);
    return source ? `${source.githubRepo.owner}/${source.githubRepo.repo}` : sourceName;
  };

  const renderItem = ({ item }: { item: any }) => (
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
            {item.title || item.name}
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
        <MaterialCommunityIcons
          name="chevron-right"
          size={18}
          color={Colors.jules.textSecondary}
          style={{ flexShrink: 0 }}
        />
      </View>
    </TouchableRipple>
  );

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
          <Menu
            visible={accountMenuVisible}
            onDismiss={() => setAccountMenuVisible(false)}
            contentStyle={{ backgroundColor: theme.colors.surfaceVariant }}
            anchor={
              <TouchableOpacity
                onPress={() => setAccountMenuVisible(true)}
                style={[styles.filterButton, { borderColor: Colors.jules.primary + '66', backgroundColor: theme.colors.surface }]}
              >
                <MaterialCommunityIcons
                  name="account-key-outline"
                  size={14}
                  color={Colors.jules.primary}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.filterButtonText, { color: theme.colors.onSurface }]} numberOfLines={1}>
                  {getActiveAccountName()}
                </Text>
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={14}
                  color={Colors.jules.textSecondary}
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>
            }
          >
            {accounts.map(acc => {
              const isActive = acc.id === activeAccountId;
              return (
                <Menu.Item
                  key={acc.id}
                  onPress={() => handleSwitchAccount(acc.id)}
                  title={acc.name}
                  titleStyle={{ color: isActive ? Colors.jules.primary : theme.colors.onSurface }}
                  trailingIcon={isActive ? 'check' : undefined}
                />
              );
            })}
          </Menu>
        </View>
      )}

      {/* Repository filter */}
      {sources.length > 0 && (
        <View style={styles.filterContainer}>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            contentStyle={{ backgroundColor: theme.colors.surfaceVariant }}
            anchor={
              <TouchableOpacity
                onPress={() => setMenuVisible(true)}
                style={[styles.filterButton, { borderColor: Colors.jules.border, backgroundColor: theme.colors.surface }]}
              >
                <MaterialCommunityIcons
                  name="source-repository"
                  size={14}
                  color={Colors.jules.textSecondary}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.filterButtonText, { color: theme.colors.onSurface }]} numberOfLines={1}>
                  {selectedSource ? getSourceLabel(selectedSource) : t('allRepositories')}
                </Text>
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={14}
                  color={Colors.jules.textSecondary}
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>
            }
          >
            <Menu.Item
              onPress={() => {
                setSelectedSource(null);
                setMenuVisible(false);
              }}
              title={t('allRepositories')}
            />
            {sources.map(source => (
              <Menu.Item
                key={source.name}
                onPress={() => {
                  setSelectedSource(source.name);
                  setMenuVisible(false);
                }}
                title={`${source.githubRepo.owner}/${source.githubRepo.repo}`}
              />
            ))}
          </Menu>
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
              onRefresh={loadData}
              colors={[Colors.jules.primary]}
              tintColor={Colors.jules.primary}
            />
          }
          ListHeaderComponent={
            filteredSessions.length > 0 ? (
              <View style={[styles.listHeader, { borderBottomColor: Colors.jules.border }]}>
                <Text style={[styles.listHeaderText, { color: theme.colors.onSurfaceVariant }]}>
                  {t('recentSessions')}
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
