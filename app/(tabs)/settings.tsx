import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Snackbar, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { getApiKey, setApiKey } from '../../services/jules';

export default function SettingsScreen() {
  const [apiKey, setApiKeyState] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');
  const theme = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    loadKey();
  }, []);

  const loadKey = async () => {
    const key = await getApiKey();
    if (key) setApiKeyState(key);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await setApiKey(apiKey);
      setSnackMessage(t('saved'));
    } catch {
      setSnackMessage(t('saveFailed'));
    } finally {
      setLoading(false);
      setSnackVisible(true);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <TextInput
        label={t('apiKey')}
        value={apiKey}
        onChangeText={setApiKeyState}
        mode="outlined"
        secureTextEntry
        style={{ marginBottom: 20 }}
      />

      <Button mode="contained" onPress={handleSave} loading={loading}>
        {t('save')}
      </Button>

      <Text variant="bodySmall" style={{ marginTop: 20, color: theme.colors.onSurfaceVariant }}>
        {t('apiKeyHelp')}
      </Text>

      <Snackbar
        visible={snackVisible}
        onDismiss={() => setSnackVisible(false)}
        duration={2500}
        action={{ label: 'OK', onPress: () => setSnackVisible(false) }}
      >
        {snackMessage}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
