import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { getApiKey, setApiKey } from '../../services/jules';

export default function SettingsScreen() {
  const [apiKey, setApiKeyState] = useState('');
  const [loading, setLoading] = useState(false);
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
    await setApiKey(apiKey);
    setLoading(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineMedium" style={{ marginBottom: 20, color: theme.colors.onBackground }}>
        {t('settings')}
      </Text>
      
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
      
      <Text variant="bodySmall" style={{ marginTop: 20, color: theme.colors.secondary }}>
        Get your API key from Google Cloud Console.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
});
