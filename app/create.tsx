import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { TextInput, Button, useTheme, Text, Snackbar, Switch, HelperText } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { router, useLocalSearchParams } from 'expo-router';
import { JulesApi, createSessionSimple, type Source } from '../services/jules';
import Colors from '../constants/Colors';
import { DropdownSelector } from '../components/DropdownSelector';
import PromptSelector from '../components/PromptSelector';

export default function CreateSessionScreen() {
  const { prefetchedSources } = useLocalSearchParams<{ prefetchedSources?: string }>();
  
  // Form state
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [sources, setSources] = useState<Source[]>([]);
  const [selectedSource, setSelectedSource] = useState('');
  const [availableBranches, setAvailableBranches] = useState<string[]>(['main']);
  const [selectedBranch, setSelectedBranch] = useState('main');
  const [requirePlanApproval, setRequirePlanApproval] = useState(false);
  const [autoCreatePR, setAutoCreatePR] = useState(true);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [loadingSource, setLoadingSource] = useState(false);
  const [promptSelectorVisible, setPromptSelectorVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const theme = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    if (prefetchedSources) {
      try {
        const data = JSON.parse(prefetchedSources) as Source[];
        setSources(data);
        if (data.length > 0) {
          setSelectedSource(data[0].name);
          loadSourceDetails(data[0].name);
        }
      } catch {
        loadSources();
      }
    } else {
      loadSources();
    }
  }, []);

  // Load branches when source changes
  useEffect(() => {
    if (selectedSource) {
      loadSourceDetails(selectedSource);
    }
  }, [selectedSource]);

  const loadSources = async () => {
    try {
      const data = await JulesApi.listSources();
      setSources(data.sources || []);
      if (data.sources && data.sources.length > 0) {
        setSelectedSource(data.sources[0].name);
        loadSourceDetails(data.sources[0].name);
      }
    } catch (e) {
      console.error(e?.message || e);
      setError(t('errorLoading'));
    }
  };

  const loadSourceDetails = async (sourceName: string) => {
    if (!sourceName) return;
    setLoadingSource(true);
    try {
      const source = await JulesApi.getSource(sourceName);
      const branches = source.githubRepo?.branches?.map(b => b.displayName) || ['main'];
      setAvailableBranches(branches);
      // Set default branch
      const defaultBranch = source.githubRepo?.defaultBranch?.displayName || 'main';
      setSelectedBranch(defaultBranch);
    } catch (e) {
      console.error('Failed to load source details:', e);
      setAvailableBranches(['main']);
      setSelectedBranch('main');
    } finally {
      setLoadingSource(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedSource || !prompt) return;
    setLoading(true);
    try {
      await createSessionSimple(prompt, selectedSource, {
        title: title.trim() || undefined,
        branch: selectedBranch,
        requirePlanApproval,
        autoCreatePR,
      });
      router.back();
    } catch (e: any) {
      console.error(e?.message || e);
      setError(e?.response?.data?.error?.message || t('errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const sourceOptions = sources.map(source => ({
    label: `${source.githubRepo.owner}/${source.githubRepo.repo}`,
    value: source.name,
  }));

  const branchOptions = availableBranches.map(branch => ({
    label: branch,
    value: branch,
  }));

  const isFormValid = selectedSource && prompt.trim();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Source Selection */}
      <Text
        variant="titleSmall"
        style={styles.sectionLabel}
      >
        {t('source')}
      </Text>
      <DropdownSelector
        value={selectedSource}
        options={sourceOptions}
        onSelect={(val) => setSelectedSource(val || '')}
        placeholder={t('selectSource')}
        iconName="source-repository"
        style={{ marginBottom: 16 }}
      />

      {/* Branch Selection */}
      <Text
        variant="titleSmall"
        style={styles.sectionLabel}
      >
        {t('branch')}
      </Text>
      <DropdownSelector
        value={selectedBranch}
        options={branchOptions}
        onSelect={(val) => setSelectedBranch(val || 'main')}
        placeholder={t('selectBranch')}
        iconName="source-branch"
        style={{ marginBottom: 16 }}
        disabled={loadingSource || !selectedSource}
      />

      {/* Title Input */}
      <Text
        variant="titleSmall"
        style={styles.sectionLabel}
      >
        {t('title')} ({t('optional')})
      </Text>
      <TextInput
        mode="outlined"
        value={title}
        onChangeText={setTitle}
        placeholder={t('sessionTitlePlaceholder')}
        style={{ marginBottom: 16 }}
        outlineStyle={{ borderColor: Colors.jules.border, borderRadius: 10 }}
      />

      {/* Prompt Input */}
      <Text
        variant="titleSmall"
        style={styles.sectionLabel}
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
        style={{ marginBottom: 8 }}
        outlineStyle={{ borderColor: Colors.jules.border, borderRadius: 10 }}
        right={
          <TextInput.Icon
            icon="creation"
            onPress={() => setPromptSelectorVisible(true)}
            color={Colors.jules.primary}
          />
        }
      />
      <HelperText type="info" visible={true} style={{ marginBottom: 8 }}>
        {t('promptHelper')}
      </HelperText>

      {/* Options Section */}
      <View style={[styles.optionsCard, { backgroundColor: theme.colors.surfaceVariant }]}>
        <Text variant="titleSmall" style={[styles.optionsTitle, { color: theme.colors.onSurfaceVariant }]}>
          {t('options')}
        </Text>

        {/* Auto Create PR */}
        <View style={styles.optionRow}>
          <View style={styles.optionInfo}>
            <MaterialCommunityIcons name="source-pull" size={20} color={Colors.jules.primary} style={{ marginRight: 12 }} />
            <View>
              <Text style={[styles.optionLabel, { color: theme.colors.onSurface }]}>
                {t('autoCreatePR')}
              </Text>
              <Text style={[styles.optionDescription, { color: theme.colors.onSurfaceVariant }]}>
                {t('autoCreatePRDescription')}
              </Text>
            </View>
          </View>
          <Switch
            value={autoCreatePR}
            onValueChange={setAutoCreatePR}
            color={Colors.jules.primary}
          />
        </View>

        {/* Require Plan Approval */}
        <View style={styles.optionRow}>
          <View style={styles.optionInfo}>
            <MaterialCommunityIcons name="clipboard-check-outline" size={20} color={Colors.jules.primary} style={{ marginRight: 12 }} />
            <View>
              <Text style={[styles.optionLabel, { color: theme.colors.onSurface }]}>
                {t('requirePlanApproval')}
              </Text>
              <Text style={[styles.optionDescription, { color: theme.colors.onSurfaceVariant }]}>
                {t('requirePlanApprovalDescription')}
              </Text>
            </View>
          </View>
          <Switch
            value={requirePlanApproval}
            onValueChange={setRequirePlanApproval}
            color={Colors.jules.primary}
          />
        </View>
      </View>

      <PromptSelector
        visible={promptSelectorVisible}
        onDismiss={() => setPromptSelectorVisible(false)}
        onSelect={(text) => setPrompt(text)}
      />

      {/* Action Buttons */}
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
          disabled={loading || !isFormValid}
          buttonColor={Colors.jules.primary}
        >
          {t('create')}
        </Button>
      </View>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError(null)}
        duration={3000}
        style={{ backgroundColor: Colors.jules.statusFailed }}
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
  optionsCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  optionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  optionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 12,
    opacity: 0.7,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
});
