import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Modal, Portal, Text, List, useTheme, IconButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { PROMPT_CATEGORIES, PROMPT_KEYS } from '../constants/PromptLibrary';

interface PromptSelectorProps {
  visible: boolean;
  onDismiss: () => void;
  onSelect: (prompt: string) => void;
}

export default function PromptSelector({ visible, onDismiss, onSelect }: PromptSelectorProps) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modalContent,
          { backgroundColor: theme.colors.surface }
        ]}
      >
        <View style={[styles.header, { borderBottomColor: theme.colors.outlineVariant }]}>
          <Text variant="titleMedium" style={{ flex: 1, color: theme.colors.onSurface }}>
            {t('promptLibrary.title')}
          </Text>
          <IconButton icon="close" size={20} onPress={onDismiss} iconColor={theme.colors.onSurface} />
        </View>
        <ScrollView style={styles.scroll}>
          <List.AccordionGroup>
            {PROMPT_CATEGORIES.map((category) => (
              <List.Accordion
                key={category}
                title={t(`promptLibrary.categories.${category}`)}
                id={category}
                titleStyle={{ color: theme.colors.onSurface }}
                style={{ backgroundColor: theme.colors.surface }}
              >
                {PROMPT_KEYS[category].map((key) => (
                  <List.Item
                    key={key}
                    title={t(`promptLibrary.prompts.${category}.${key}`)}
                    titleNumberOfLines={3}
                    onPress={() => {
                      onSelect(t(`promptLibrary.prompts.${category}.${key}`));
                      onDismiss();
                    }}
                    style={[styles.item, { backgroundColor: theme.colors.surfaceVariant, borderBottomColor: theme.colors.outlineVariant }]}
                    titleStyle={{ fontSize: 13, color: theme.colors.onSurfaceVariant }}
                  />
                ))}
              </List.Accordion>
            ))}
          </List.AccordionGroup>
        </ScrollView>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContent: {
    margin: 20,
    borderRadius: 12,
    maxHeight: '80%',
    paddingBottom: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingRight: 8,
    borderBottomWidth: 1,
  },
  scroll: {
  },
  item: {
    paddingLeft: 20,
    borderBottomWidth: 1,
  },
});
