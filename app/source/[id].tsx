import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
  Linking,
} from 'react-native';
import { ActivityIndicator, Snackbar, Text, useTheme, IconButton, Chip } from 'react-native-paper';
import Colors from '../../constants/Colors';
import { JulesApi, type Source, type Session, type GitHubBranch } from '../../services/jules';

interface BranchItemProps {
  branch: GitHubBranch;
  isDefault: boolean;
  source: Source;
}

function BranchItem({ branch, isDefault, source }: BranchItemProps) {
  const theme = useTheme();
  const { t } = useTranslation();

  const handlePress = () => {
    // Navigate to create session with this branch pre-selected
    router.push({
      pathname: '/create',
      params: {
        prefetchedSources: JSON.stringify([source]),
        preselectedSource: source.name,
        preselectedBranch: branch.displayName,
      },
    });
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={[styles.branchRow, { borderBottomColor: Colors.jules.border }]}
    >
      <View style={styles.branchRowInner}>
        <MaterialCommunityIcons
          name="source-branch"
          size={18}
          color={isDefault ? Colors.jules.primary : Colors.jules.textSecondary}
          style={{ marginRight: 12 }}
        />
        <View style={styles.branchInfo}>
          <Text
            style={[
              styles.branchName,
              { color: theme.colors.onSurface },
              isDefault && { fontWeight: '600' },
            ]}
          >
            {branch.displayName}
          </Text>
          {isDefault && (
            <Chip
              style={[styles.defaultChip, { backgroundColor: Colors.jules.primary + '22' }]}
              textStyle={{ color: Colors.jules.primary, fontSize: 10 }}
            >
              {t('default')}
            </Chip>
          )}
        </View>
        <MaterialCommunityIcons
          name="arrow-right"
          size={18}
          color={Colors.jules.textSecondary}
        />
      </View>
    </TouchableOpacity>
  );
}

export default function SourceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [source, setSource] = useState<Source | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const theme = useTheme();
  const { t } = useTranslation();

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const sourceId = decodeURIComponent(id);
      const [sourceData, sessionsData] = await Promise.all([
        JulesApi.getSource(sourceId),
        JulesApi.listSessions({ pageSize: 20 }),
      ]);
      setSource(sourceData);
      // Filter sessions for this source
      const sourceSessions = (sessionsData.sessions || []).filter(
        s => s.sourceContext?.source === sourceId
      );
      setSessions(sourceSessions);
    } catch (e: any) {
      console.error(e?.message || e);
      setError(e?.response?.data?.error?.message || t('errorLoading'));
    }
  }, [id, t]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, [loadData]);

  const handleOpenGitHub = () => {
    if (source?.githubRepo) {
      const url = `https://github.com/${source.githubRepo.owner}/${source.githubRepo.repo}`;
      Linking.openURL(url);
    }
  };

  const handleCreateSession = () => {
    if (source) {
      router.push({
        pathname: '/create',
        params: { prefetchedSources: JSON.stringify([source]) },
      });
    }
  };

  const renderHeader = () => {
    if (!source) return null;

    return (
      <View style={styles.header}>
        {/* Source Card */}
        <View style={[styles.sourceCard, { backgroundColor: theme.colors.surfaceVariant }]}>
          <View style={styles.sourceHeader}>
            <View style={styles.sourceIcon}>
              <MaterialCommunityIcons name="github" size={32} color="#fff" />
            </View>
            <View style={styles.sourceInfo}>
              <Text
                variant="titleMedium"
                style={[styles.sourceName, { color: theme.colors.onSurface }]}
                numberOfLines={1}
              >
                {source.githubRepo.repo}
              </Text>
              <Text
                style={[styles.sourceOwner, { color: theme.colors.onSurfaceVariant }]}
              >
                {source.githubRepo.owner}
              </Text>
            </View>
            {source.githubRepo.isPrivate && (
              <Chip
                style={[styles.privateChip, { backgroundColor: Colors.jules.statusWaiting + '22' }]}
                textStyle={{ color: Colors.jules.statusWaiting, fontSize: 11 }}
                icon="lock"
              >
                {t('private')}
              </Chip>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              onPress={handleOpenGitHub}
              style={[styles.actionBtn, { backgroundColor: theme.colors.surface }]}
            >
              <MaterialCommunityIcons name="open-in-new" size={18} color={Colors.jules.primary} />
              <Text style={[styles.actionBtnText, { color: theme.colors.onSurface }]}>
                {t('openInGitHub')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCreateSession}
              style={[styles.actionBtn, { backgroundColor: Colors.jules.primary }]}
            >
              <MaterialCommunityIcons name="plus" size={18} color="#fff" />
              <Text style={[styles.actionBtnText, { color: '#fff' }]}>
                {t('newSession')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Branches Section */}
        <Text
          variant="titleSmall"
          style={[styles.sectionTitle, { color: theme.colors.onSurfaceVariant }]}
        >
          {t('branches')}
        </Text>
      </View>
    );
  };

  const renderEmptyBranches = () => {
    if (loading) return null;
    return (
      <View style={styles.empty}>
        <MaterialCommunityIcons
          name="source-branch"
          size={48}
          color={Colors.jules.primary}
          style={{ opacity: 0.35, marginBottom: 12 }}
        />
        <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
          {t('noBranches')}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator style={{ marginTop: 60 }} color={Colors.jules.primary} />
      </View>
    );
  }

  if (!source) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.empty}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={48}
            color={Colors.jules.statusFailed}
            style={{ marginBottom: 12 }}
          />
          <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
            {t('sourceNotFound')}
          </Text>
        </View>
      </View>
    );
  }

  const defaultBranch = source.githubRepo.defaultBranch?.displayName;
  const branches = source.githubRepo.branches || [];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={branches}
        renderItem={({ item }) => (
          <BranchItem
            branch={item}
            isDefault={item.displayName === defaultBranch}
            source={source}
          />
        )}
        keyExtractor={(item) => item.displayName}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.jules.primary]}
            tintColor={Colors.jules.primary}
          />
        }
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyBranches}
        contentContainerStyle={branches.length === 0 && styles.emptyListContent}
      />

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
  header: {
    padding: 16,
  },
  sourceCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  sourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sourceIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  sourceInfo: {
    flex: 1,
  },
  sourceName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 4,
  },
  sourceOwner: {
    fontSize: 14,
    opacity: 0.7,
  },
  privateChip: {
    height: 28,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  branchRow: {
    borderBottomWidth: 1,
    marginHorizontal: 16,
  },
  branchRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  branchInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  branchName: {
    fontSize: 15,
    marginRight: 8,
  },
  defaultChip: {
    height: 24,
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
  emptyListContent: {
    flexGrow: 1,
  },
});
