import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, IconButton, Card, Text, useTheme, ActivityIndicator, Chip } from 'react-native-paper';
import { useLocalSearchParams } from 'expo-router';
import { JulesApi } from '../../services/jules';
import { useTranslation } from 'react-i18next';

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activities, setActivities] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const theme = useTheme();
  const { t } = useTranslation();

  // Polling for updates
  useEffect(() => {
    loadActivities();
    const interval = setInterval(loadActivities, 5000);
    return () => clearInterval(interval);
  }, [id]);

  const loadActivities = async () => {
    if (!id) return;
    try {
      const data = await JulesApi.listActivities(id);
      // Reverse to show latest at bottom if needed, but API returns chronological.
      // We'll keep API order and list rendering handles it.
      setActivities(data.activities || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !id) return;
    const text = inputText;
    setInputText('');
    setLoading(true);
    try {
      await JulesApi.sendMessage(id, text);
      await loadActivities();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (planId: string) => {
    if (!id) return;
    try {
      await JulesApi.approvePlan(id); // API automatically approves latest pending plan
      await loadActivities();
    } catch (e) {
      console.error(e);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isAgent = item.originator === 'agent';
    
    // Determine content based on activity type
    let content = '';
    let type = '';

    if (item.planGenerated) {
      type = 'Plan';
      content = item.planGenerated.plan.steps.map((s: any) => `- ${s.title}`).join('\n');
    } else if (item.progressUpdated) {
      type = 'Progress';
      content = `${item.progressUpdated.title}\n${item.progressUpdated.description || ''}`;
    } else if (item.codeGenerated) {
      type = 'Code';
      content = 'Generated code changes.';
    } else if (item.message) {
      content = item.message.text || ''; // Depending on actual API response structure for messages
    } else {
      // Fallback for other types
      content = JSON.stringify(item, null, 2);
    }

    return (
      <View style={[
        styles.messageContainer, 
        isAgent ? styles.agentMessage : styles.userMessage,
        { backgroundColor: isAgent ? theme.colors.surfaceVariant : theme.colors.primaryContainer }
      ]}>
        {type ? <Text variant="labelSmall" style={{marginBottom: 4, color: theme.colors.onSurfaceVariant}}>{type}</Text> : null}
        <Text style={{ color: isAgent ? theme.colors.onSurfaceVariant : theme.colors.onPrimaryContainer }}>
          {content}
        </Text>
        
        {item.planGenerated && (
           <Chip icon="check" onPress={() => handleApprove(item.planGenerated.plan.id)} style={{marginTop: 8}}>
             {t('approvePlan')}
           </Chip>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.colors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      keyboardVerticalOffset={100}
    >
      <FlatList
        ref={flatListRef}
        data={activities}
        renderItem={renderItem}
        keyExtractor={item => item.name}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />
      
      <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface }]}>
        <TextInput
          mode="outlined"
          value={inputText}
          onChangeText={setInputText}
          placeholder={t('sendMessage')}
          style={styles.input}
          right={<TextInput.Icon icon="send" onPress={handleSend} disabled={loading} />}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
  },
  agentMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
  },
  userMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  inputContainer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  input: {
    backgroundColor: 'transparent',
  },
});
