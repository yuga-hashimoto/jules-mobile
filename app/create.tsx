import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { TextInput, Button, useTheme, Text, Snackbar, Menu } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { router, useLocalSearchParams } from 'expo-router';
import { JulesApi } from '../services/jules';
import Colors from '../constants/Colors';

export default function CreateSessionScreen() {
  const { prefetchedSources } = useLocalSearchParams<{ prefetchedSources?: string }>();
  const [prompt, setPrompt] = useState('');
  const [sources, setSources] = useState<any[]>([]);
  const [selectedSource, setSelectedSource] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    if (prefetchedSources) {
      try {
        const data = JSON.parse(prefetchedSources);
        setSources(data);
        if (data.length > 0) setSelectedSource(data[0].name);
      } catch {
        loadSources();
      }
    } else {
      loadSources();
    }
  }, []);

  const loadSources = async () => {
    try {
      const data = await JulesApi.listSources();
      setSources(data.sources || []);
      if (data.sources && data.sources.length > 0) {
        setSelectedSource(data.sources[0].name);
      }
    } catch (e) {
      console.error(e);
      setError(t('errorLoading'));
    }
  };

  const handleCreate = async () => {
    if (!selectedSource || !prompt) return;
    setLoading(true);
    try {
      await JulesApi.createSession(prompt, selectedSource);
      router.back();
    } catch (e) {
      console.error(e);
      setError(t('errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const getSelectedLabel = () => {
    const source = sources.find(s => s.name === selectedSource);
    return source ? `${source.githubRepo.owner}/${source.githubRepo.repo}` : t('sources');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <Text
        variant="titleSmall"
        style={styles.sectionLabel}
      >
        {t('sources')}
      </Text>

      {/* Dropdown selector */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        contentStyle={{ backgroundColor: theme.colors.surfaceVariant }}
        anchor={
          <TouchableOpacity
            onPress={() => setMenuVisible(true)}
            style={[styles.selector, { backgroundColor: theme.colors.surface, borderColor: Colors.jules.border }]}
          >
            <MaterialCommunityIcons
              name="source-repository"
              size={16}
              color={Colors.jules.textSecondary}
              style={{ marginRight: 10 }}
            />
            <Text
              style={[styles.selectorText, { color: selectedSource ? theme.colors.onSurface : theme.colors.onSurfaceVariant }]}
              numberOfLines={1}
            >
              {getSelectedLabel()}
            </Text>
            <MaterialCommunityIcons
              name={menuVisible ? 'chevron-up' : 'chevron-down'}
              size={18}
              color={Colors.jules.textSecondary}
            />
          </TouchableOpacity>
        }
      >
        {sources.map(source => {
          const label = `${source.githubRepo.owner}/${source.githubRepo.repo}`;
          const isSelected = source.name === selectedSource;
          return (
            <Menu.Item
              key={source.name}
              onPress={() => {
                setSelectedSource(source.name);
                setMenuVisible(false);
              }}
              title={label}
              titleStyle={{ color: isSelected ? Colors.jules.primary : theme.colors.onSurface }}
              trailingIcon={isSelected ? 'check' : undefined}
            />
          );
        })}
      </Menu>

      <Text
        variant="titleSmall"
        style={[styles.sectionLabel, { marginTop: 20 }]}
      >
        {t('prompt')}
      </Text>
      <TextInput
        mode="outlined"
        value={prompt}
        onChangeText={setPrompt}
        multiline
        numberOfLines={5}
        placeholder={t('describeTask')}
        style={{ marginBottom: 20 }}
        outlineStyle={{ borderColor: Colors.jules.border, borderRadius: 10 }}
      />

      <View style={styles.actions}>
        <Button
          onPress={() => router.back()}
          style={{ marginRight: 10 }}
          textColor={theme.colors.onSurfaceVariant}
        >
          {t('cancel')}
        </Button>
        <Button
          mode="contained"
          onPress={handleCreate}
          loading={loading}
          disabled={loading || !selectedSource || !prompt.trim()}
          buttonColor={Colors.jules.primary}
        >
          {t('create')}
        </Button>
      </View>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError(null)}
        duration={3000}
      >
        {error}
      </Snackbar>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  sectionLabel: {
    marginBottom: 8,
    color: '#8888a8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontSize: 11,
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 4,
  },
  selectorText: {
    flex: 1,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
});
