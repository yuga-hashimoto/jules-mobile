import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, useTheme, List, RadioButton, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { JulesApi } from '../services/jules';

export default function CreateSessionScreen() {
  const [prompt, setPrompt] = useState('');
  const [sources, setSources] = useState<any[]>([]);
  const [selectedSource, setSelectedSource] = useState('');
  const [loading, setLoading] = useState(false);
  const theme = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    loadSources();
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="titleMedium" style={{ marginVertical: 10, color: theme.colors.onBackground }}>
        {t('sources')}
      </Text>
      <RadioButton.Group onValueChange={value => setSelectedSource(value)} value={selectedSource}>
        {sources.map(source => (
          <RadioButton.Item 
            key={source.name} 
            label={`${source.githubRepo.owner}/${source.githubRepo.repo}`} 
            value={source.name} 
          />
        ))}
      </RadioButton.Group>

      <Text variant="titleMedium" style={{ marginVertical: 10, color: theme.colors.onBackground }}>
        {t('prompt')}
      </Text>
      <TextInput
        mode="outlined"
        value={prompt}
        onChangeText={setPrompt}
        multiline
        numberOfLines={4}
        placeholder="Describe your task..."
        style={{ marginBottom: 20 }}
      />

      <View style={styles.actions}>
        <Button onPress={() => router.back()} style={{ marginRight: 10 }}>
          {t('cancel')}
        </Button>
        <Button mode="contained" onPress={handleCreate} loading={loading} disabled={loading || !selectedSource}>
          {t('create')}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
    marginBottom: 40,
  },
});
