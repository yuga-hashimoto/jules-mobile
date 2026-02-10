import React, { useCallback, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { List, FAB, useTheme, Text, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { router, useFocusEffect } from 'expo-router';
import { JulesApi } from '../../services/jules';

export default function SessionsScreen() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const { t } = useTranslation();

  const loadSessions = async () => {
    setLoading(true);
    try {
      const data = await JulesApi.listSessions();
      setSessions(data.sessions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [])
  );

  const renderItem = ({ item }: { item: any }) => (
    <List.Item
      title={item.title || item.name}
      description={item.prompt}
      left={props => <List.Icon {...props} icon="console" />}
      onPress={() => router.push(`/session/${encodeURIComponent(item.name)}`)}
      style={{ backgroundColor: theme.colors.surface, marginBottom: 1 }}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {loading && sessions.length === 0 ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={sessions}
          renderItem={renderItem}
          keyExtractor={item => item.name}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadSessions} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text>No sessions found.</Text>
            </View>
          }
        />
      )}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primaryContainer }]}
        onPress={() => router.push('/create')}
        color={theme.colors.onPrimaryContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  empty: {
    padding: 20,
    alignItems: 'center',
  },
});
