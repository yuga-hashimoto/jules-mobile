import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { TextInput, Button, Snackbar, Text, useTheme, IconButton, Dialog, Portal, TouchableRipple } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from 'expo-router';
import {
  Account,
  getAccounts,
  addAccount,
  removeAccount,
  updateAccount,
  getActiveAccountId,
  setActiveAccountId,
} from '../../services/jules';
import Colors from '../../constants/Colors';

export default function SettingsScreen() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [snackVisible, setSnackVisible] = useState(false);
  const [snackMessage, setSnackMessage] = useState('');

  // Add dialog
  const [addVisible, setAddVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newKey, setNewKey] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // Edit dialog
  const [editVisible, setEditVisible] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [editName, setEditName] = useState('');
  const [editKey, setEditKey] = useState('');

  const theme = useTheme();
  const { t } = useTranslation();

  const loadAccounts = async () => {
    const accs = await getAccounts();
    setAccounts(accs);
    const aid = await getActiveAccountId();
    setActiveId(aid);
  };

  useFocusEffect(
    useCallback(() => {
      loadAccounts();
    }, [])
  );

  const handleAdd = async () => {
    if (!newName.trim() || !newKey.trim()) return;
    setAddLoading(true);
    try {
      await addAccount(newName.trim(), newKey.trim());
      setNewName('');
      setNewKey('');
      setAddVisible(false);
      await loadAccounts();
      setSnackMessage(t('saved'));
      setSnackVisible(true);
    } catch {
      setSnackMessage(t('saveFailed'));
      setSnackVisible(true);
    } finally {
      setAddLoading(false);
    }
  };

  const handleDelete = (account: Account) => {
    Alert.alert(
      t('confirmDelete'),
      account.name,
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('deleteAccount'),
          style: 'destructive',
          onPress: async () => {
            await removeAccount(account.id);
            await loadAccounts();
            setSnackMessage(t('saved'));
            setSnackVisible(true);
          },
        },
      ]
    );
  };

  const handleActivate = async (id: string) => {
    await setActiveAccountId(id);
    setActiveId(id);
    setSnackMessage(t('switchedAccount'));
    setSnackVisible(true);
  };

  const handleEditOpen = (account: Account) => {
    setEditAccount(account);
    setEditName(account.name);
    setEditKey(account.apiKey);
    setEditVisible(true);
  };

  const handleEditSave = async () => {
    if (!editAccount || !editName.trim() || !editKey.trim()) return;
    await updateAccount(editAccount.id, { name: editName.trim(), apiKey: editKey.trim() });
    setEditVisible(false);
    setEditAccount(null);
    await loadAccounts();
    setSnackMessage(t('saved'));
    setSnackVisible(true);
  };

  const maskKey = (key: string) => {
    if (key.length <= 8) return '••••••••';
    return key.slice(0, 4) + '••••' + key.slice(-4);
  };

  const renderAccount = ({ item }: { item: Account }) => {
    const isActive = item.id === activeId;
    return (
      <TouchableRipple
        onPress={() => handleActivate(item.id)}
        rippleColor="rgba(113, 92, 215, 0.12)"
        style={[
          styles.accountRow,
          {
            borderColor: isActive ? Colors.jules.primary : Colors.jules.border,
            backgroundColor: isActive ? Colors.jules.primary + '11' : theme.colors.surface,
          },
        ]}
      >
        <View style={styles.accountRowInner}>
          <View style={styles.accountRadio}>
            {isActive ? (
              <MaterialCommunityIcons name="radiobox-marked" size={22} color={Colors.jules.primary} />
            ) : (
              <MaterialCommunityIcons name="radiobox-blank" size={22} color={Colors.jules.textSecondary} />
            )}
          </View>
          <View style={styles.accountInfo}>
            <Text style={[styles.accountName, { color: theme.colors.onSurface }]} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={[styles.accountKey, { color: Colors.jules.textSecondary }]} numberOfLines={1}>
              {maskKey(item.apiKey)}
            </Text>
          </View>
          <IconButton
            icon="pencil-outline"
            size={18}
            iconColor={Colors.jules.textSecondary}
            onPress={() => handleEditOpen(item)}
            style={{ margin: 0 }}
          />
          <IconButton
            icon="delete-outline"
            size={18}
            iconColor={Colors.jules.statusFailed}
            onPress={() => handleDelete(item)}
            style={{ margin: 0 }}
          />
        </View>
      </TouchableRipple>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text variant="titleMedium" style={{ color: theme.colors.onSurface, flex: 1 }}>
          {t('accounts')}
        </Text>
        <Button
          mode="contained"
          onPress={() => setAddVisible(true)}
          icon="plus"
          buttonColor={Colors.jules.primary}
          compact
        >
          {t('addAccount')}
        </Button>
      </View>

      {/* Account list */}
      {accounts.length === 0 ? (
        <View style={styles.empty}>
          <MaterialCommunityIcons
            name="account-key-outline"
            size={48}
            color={Colors.jules.primary}
            style={{ opacity: 0.35, marginBottom: 12 }}
          />
          <Text style={{ color: Colors.jules.textSecondary, textAlign: 'center' }}>
            {t('noAccounts')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={accounts}
          renderItem={renderAccount}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <Text variant="bodySmall" style={{ padding: 20, paddingTop: 8, color: Colors.jules.textSecondary }}>
        {t('apiKeyHelp')}
      </Text>

      {/* Add Account Dialog */}
      <Portal>
        <Dialog
          visible={addVisible}
          onDismiss={() => setAddVisible(false)}
          style={{ backgroundColor: Colors.jules.surface }}
        >
          <Dialog.Title style={{ color: theme.colors.onSurface }}>{t('addAccount')}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label={t('accountName')}
              value={newName}
              onChangeText={setNewName}
              mode="outlined"
              style={{ marginBottom: 12 }}
              placeholder="e.g. Personal, Work"
              outlineStyle={{ borderColor: Colors.jules.border }}
            />
            <TextInput
              label={t('apiKey')}
              value={newKey}
              onChangeText={setNewKey}
              mode="outlined"
              secureTextEntry
              outlineStyle={{ borderColor: Colors.jules.border }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setAddVisible(false)} textColor={Colors.jules.textSecondary}>
              {t('cancel')}
            </Button>
            <Button
              onPress={handleAdd}
              loading={addLoading}
              disabled={!newName.trim() || !newKey.trim()}
              buttonColor={Colors.jules.primary}
              mode="contained"
            >
              {t('save')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Edit Account Dialog */}
      <Portal>
        <Dialog
          visible={editVisible}
          onDismiss={() => setEditVisible(false)}
          style={{ backgroundColor: Colors.jules.surface }}
        >
          <Dialog.Title style={{ color: theme.colors.onSurface }}>{t('editAccount')}</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label={t('accountName')}
              value={editName}
              onChangeText={setEditName}
              mode="outlined"
              style={{ marginBottom: 12 }}
              outlineStyle={{ borderColor: Colors.jules.border }}
            />
            <TextInput
              label={t('apiKey')}
              value={editKey}
              onChangeText={setEditKey}
              mode="outlined"
              secureTextEntry
              outlineStyle={{ borderColor: Colors.jules.border }}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setEditVisible(false)} textColor={Colors.jules.textSecondary}>
              {t('cancel')}
            </Button>
            <Button
              onPress={handleEditSave}
              disabled={!editName.trim() || !editKey.trim()}
              buttonColor={Colors.jules.primary}
              mode="contained"
            >
              {t('save')}
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  empty: {
    paddingTop: 60,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  accountRow: {
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  accountRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingLeft: 12,
    paddingRight: 4,
  },
  accountRadio: {
    marginRight: 10,
  },
  accountInfo: {
    flex: 1,
    marginRight: 4,
  },
  accountName: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 20,
  },
  accountKey: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: 'monospace',
  },
});
