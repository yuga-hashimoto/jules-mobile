import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { TextInput, Button, useTheme, Text, Snackbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { router, useLocalSearchParams } from 'expo-router';
import { JulesApi } from '../services/jules';
import Colors from '../constants/Colors';
import { DropdownSelector } from '../components/DropdownSelector';

export default function CreateSessionScreen() {
  const { prefetchedSources } = useLocalSearchParams<{ prefetchedSources?: string }>();
  const [prompt, setPrompt] = useState('');
  const [sources, setSources] = useState<any[]>([]);
  const [selectedSource, setSelectedSource] = useState('');
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

  const sourceOptions = sources.map(source => ({
    label: `${source.githubRepo.owner}/${source.githubRepo.repo}`,
    value: source.name,
  }));

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
      <DropdownSelector
        value={selectedSource}
        options={sourceOptions}
        onSelect={(val) => setSelectedSource(val || '')}
        placeholder={t('sources')}
        iconName="source-repository"
        style={{ marginBottom: 4 }}
      />

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
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
});
