import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  KeyboardAvoidingView,
  LayoutAnimation,
  Linking,
  Platform,
  StyleSheet,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { ActivityIndicator, Snackbar, Text, TextInput, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Markdown from 'react-native-markdown-display';
import * as Clipboard from 'expo-clipboard';
import Colors from '../../constants/Colors';
import { JulesApi } from '../../services/jules';
import PromptSelector from '../../components/PromptSelector';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const DONE_STATES = new Set(['DONE', 'SUCCEEDED', 'COMPLETED']);

function StatusDot({ state }: { state?: string }) {
  const colorMap: Record<string, string> = {
    WORKING: Colors.jules.statusWorking,
    RUNNING: Colors.jules.statusWorking,
    WAITING_FOR_USER: Colors.jules.statusWaiting,
    NEEDS_CLARIFICATION: Colors.jules.statusWaiting,
    DONE: Colors.jules.statusDone,
    SUCCEEDED: Colors.jules.statusDone,
    COMPLETED: Colors.jules.statusDone,
    FAILED: Colors.jules.statusFailed,
    CANCELLED: Colors.jules.statusCancelled,
  };
  const color = (state && colorMap[state]) || Colors.jules.textSecondary;
  return (
    <View
      accessibilityLabel={state || 'Status'}
      accessibilityRole="image"
      style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: color, marginRight: 8, flexShrink: 0 }}
    />
  );
}

// Individual expandable step row inside PlanCard
function PlanStep({
  step,
  index,
  expanded,
  onToggle,
}: {
  step: any;
  index: number;
  expanded: boolean;
  onToggle: () => void;
}) {
  const hasDesc = !!step.description;
  return (
    <TouchableOpacity
      onPress={hasDesc ? onToggle : undefined}
      activeOpacity={hasDesc ? 0.7 : 1}
      style={styles.stepRow}
    >
      <View style={styles.stepNumberCircle}>
        <Text style={styles.stepNumber}>{index + 1}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.stepTitleRow}>
          <Text style={styles.stepTitle} numberOfLines={expanded ? undefined : 2}>
            {step.title}
          </Text>
          {hasDesc && (
            <MaterialCommunityIcons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={Colors.jules.textSecondary}
              style={{ marginLeft: 4, flexShrink: 0 }}
            />
          )}
        </View>
        {expanded && step.description ? (
          <Text style={styles.stepDesc}>{step.description}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

function PlanCard({
  item,
  expandedSteps,
  onToggleStep,
  onToggleAll,
  showAll,
  onApprove,
  t,
}: {
  item: any;
  expandedSteps: Record<number, boolean>;
  onToggleStep: (i: number) => void;
  onToggleAll: () => void;
  showAll: boolean;
  onApprove: () => void;
  t: (k: string) => string;
}) {
  const steps: any[] = item.planGenerated.plan.steps || [];
  const PREVIEW = 2;
  const visible = showAll ? steps : steps.slice(0, PREVIEW);
  const hasMore = steps.length > PREVIEW;
  const [approving, setApproving] = useState(false);

  const handleApprove = async () => {
    if (approving) return;
    setApproving(true);
    try {
      await onApprove();
    } finally {
      setApproving(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardLabelRow}>
        <MaterialCommunityIcons name="format-list-numbered" size={14} color={Colors.jules.primary} style={{ marginRight: 5 }} />
        <Text style={[styles.cardLabel, { color: Colors.jules.primary }]}>{t('plan')}</Text>
      </View>
      <View style={styles.stepList}>
        {visible.map((step: any, i: number) => (
          <PlanStep
            key={i}
            step={step}
            index={i}
            expanded={!!expandedSteps[i]}
            onToggle={() => onToggleStep(i)}
          />
        ))}
      </View>
      {hasMore && (
        <TouchableOpacity onPress={onToggleAll} style={styles.showMoreBtn} activeOpacity={0.7}>
          <Text style={styles.showMoreText}>
            {showAll ? t('showLess') : `+${steps.length - PREVIEW} ${t('moreSteps')}`}
          </Text>
          <MaterialCommunityIcons
            name={showAll ? 'chevron-up' : 'chevron-down'}
            size={14}
            color={Colors.jules.primary}
          />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        onPress={handleApprove}
        style={[styles.approveBtn, approving && { opacity: 0.7 }]}
        activeOpacity={0.8}
        disabled={approving}
      >
        {approving ? (
          <ActivityIndicator size="small" color="#fff" style={{ marginRight: 6 }} />
        ) : (
          <MaterialCommunityIcons name="check" size={15} color="#fff" style={{ marginRight: 6 }} />
        )}
        <Text style={styles.approveBtnText}>{approving ? t('working') : t('approvePlan')}</Text>
      </TouchableOpacity>
    </View>
  );
}

function ProgressCard({ item }: { item: any }) {
  const { title, description } = item.progressUpdated ?? {};
  const [open, setOpen] = useState(false);
  const hasDesc = !!description;
  if (!title) return null;

  return (
    <TouchableOpacity
      onPress={hasDesc ? () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setOpen(v => !v);
      } : undefined}
      activeOpacity={hasDesc ? 0.7 : 1}
      style={styles.progressCard}
    >
      <View style={styles.progressRow}>
        <View style={styles.progressDot} />
        <Text style={styles.progressTitle} numberOfLines={open ? undefined : 1}>{title}</Text>
        {hasDesc && (
          <MaterialCommunityIcons
            name={open ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={Colors.jules.textSecondary}
            style={{ marginLeft: 4, flexShrink: 0 }}
          />
        )}
      </View>
      {open && description ? (
        <Text style={styles.progressDesc}>{description}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

// Resolve file list from whatever shape codeGenerated has
function resolveCodeFiles(codeGenerated: any): Array<{ path: string; status: 'created' | 'edited' | 'deleted' }> {
  if (!codeGenerated) return [];

  // Array of files with path/status
  if (Array.isArray(codeGenerated.files)) {
    return codeGenerated.files.map((f: any) => ({
      path: f.path || f.name || 'file',
      status: f.status === 'created' || f.isNew ? 'created'
            : f.status === 'deleted' || f.isDeleted ? 'deleted'
            : 'edited',
    }));
  }

  // changeSet with gitPatch (same shape as artifacts)
  if (codeGenerated.changeSet?.gitPatch?.unidiffPatch) {
    return parseFilesFromPatch(codeGenerated.changeSet.gitPatch.unidiffPatch);
  }

  // Single filePath string
  if (codeGenerated.filePath) {
    return [{ path: codeGenerated.filePath, status: 'edited' }];
  }

  return [];
}

function fileIcon(status: 'created' | 'edited' | 'deleted') {
  if (status === 'created') return { name: 'file-plus-outline' as const, color: Colors.jules.statusDone };
  if (status === 'deleted') return { name: 'file-remove-outline' as const, color: Colors.jules.statusFailed };
  return { name: 'file-edit-outline' as const, color: Colors.jules.tertiary };
}

function basename(p: string) {
  return p.split('/').pop() || p;
}

function CodeChangeCard({ item }: { item: any }) {
  const [expanded, setExpanded] = useState(false);
  const files = resolveCodeFiles(item.codeGenerated);

  // Header summary: "Updated foo.ts" or "Updated foo.ts bar.kt and 1 more"
  const INLINE = 2;
  const inlineFiles = files.slice(0, INLINE);
  const extra = files.length - INLINE;

  const headerContent = files.length === 0 ? (
    <Text style={styles.codeDiffTitle}>Code updated</Text>
  ) : (
    <Text style={styles.codeDiffTitle} numberOfLines={1}>
      {'Updated '}
      {inlineFiles.map((f, i) => (
        <Text key={i} style={styles.codeDiffFileName}>{basename(f.path)}{i < inlineFiles.length - 1 ? '  ' : ''}</Text>
      ))}
      {extra > 0 && <Text style={styles.codeDiffExtra}>{` and ${extra} more`}</Text>}
    </Text>
  );

  if (files.length === 0) {
    return (
      <View style={styles.codeDiffCard}>
        <View style={styles.codeDiffHeaderRow}>
          <MaterialCommunityIcons name="file-edit-outline" size={14} color={Colors.jules.tertiary} style={{ marginRight: 6, flexShrink: 0 }} />
          {headerContent}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.codeDiffCard}>
      <TouchableOpacity
        onPress={() => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setExpanded(v => !v);
        }}
        style={styles.codeDiffHeaderRow}
        activeOpacity={0.7}
      >
        <MaterialCommunityIcons
          name={files.length === 1 ? fileIcon(files[0].status).name : 'file-multiple-outline'}
          size={14}
          color={files.length === 1 ? fileIcon(files[0].status).color : Colors.jules.textSecondary}
          style={{ marginRight: 6, flexShrink: 0 }}
        />
        {headerContent}
        <MaterialCommunityIcons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={15}
          color={Colors.jules.textSecondary}
          style={{ marginLeft: 4, flexShrink: 0 }}
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.codeDiffFileList}>
          {files.map((f, i) => {
            const icon = fileIcon(f.status);
            return (
              <View key={i} style={styles.codeDiffFileRow}>
                <MaterialCommunityIcons name={icon.name} size={14} color={icon.color} style={{ marginRight: 8, flexShrink: 0 }} />
                <Text style={styles.codeDiffFilePath} numberOfLines={1}>{f.path}</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

function StatusPill({ text, color }: { text: string; color?: string }) {
  const c = color || Colors.jules.primary;
  return (
    <View style={styles.statusPillWrap}>
      <View style={[styles.statusPill, { backgroundColor: c + '22', borderColor: c + '44' }]}>
        <Text style={[styles.statusPillText, { color: c }]}>{text}</Text>
      </View>
    </View>
  );
}

// Parse changed files from a unified diff string
function parseFilesFromPatch(patch: string): Array<{ path: string; status: 'created' | 'edited' | 'deleted' }> {
  const files: Array<{ path: string; status: 'created' | 'edited' | 'deleted' }> = [];
  let current: { path: string; status: 'created' | 'edited' | 'deleted' } | null = null;
  for (const line of patch.split('\n')) {
    if (line.startsWith('diff --git ')) {
      const m = line.match(/diff --git a\/.+ b\/(.+)/);
      if (m) {
        current = { path: m[1], status: 'edited' };
        files.push(current);
      }
    } else if (line.startsWith('new file mode') && current) {
      current.status = 'created';
    } else if (line.startsWith('deleted file mode') && current) {
      current.status = 'deleted';
    }
  }
  return files;
}

function ArtifactsCard({ item }: { item: any }) {
  const [expanded, setExpanded] = useState(false);
  const artifacts: any[] = item.artifacts || [];
  const allFiles: Array<{ path: string; status: 'created' | 'edited' | 'deleted' }> = [];
  let commitMsg = '';

  for (const artifact of artifacts) {
    const patch = artifact.changeSet?.gitPatch;
    if (patch?.unidiffPatch) {
      const parsed = parseFilesFromPatch(patch.unidiffPatch);
      allFiles.push(...parsed);
    }
    if (!commitMsg && patch?.suggestedCommitMessage) {
      commitMsg = patch.suggestedCommitMessage.split('\n\n')[0].trim();
    }
  }

  if (allFiles.length === 0 && !commitMsg) return null;

  const PREVIEW = 3;
  const visible = expanded ? allFiles : allFiles.slice(0, PREVIEW);
  const hasMore = allFiles.length > PREVIEW;

  return (
    <View style={styles.card}>
      {/* Commit message */}
      {commitMsg ? (
        <View style={styles.commitMsgRow}>
          <MaterialCommunityIcons name="source-commit" size={14} color={Colors.jules.primary} style={{ marginRight: 6, flexShrink: 0 }} />
          <Text style={styles.commitMsg} numberOfLines={2}>{commitMsg}</Text>
        </View>
      ) : null}

      {/* File list */}
      {allFiles.length > 0 && (
        <>
          <View style={styles.filesHeader}>
            <MaterialCommunityIcons name="file-multiple-outline" size={13} color={Colors.jules.textSecondary} style={{ marginRight: 5 }} />
            <Text style={styles.filesHeaderText}>{allFiles.length} file{allFiles.length !== 1 ? 's' : ''} changed</Text>
          </View>
          {visible.map((f, i) => (
            <View key={i} style={styles.fileRow}>
              <MaterialCommunityIcons
                name={f.status === 'deleted' ? 'file-remove-outline' : f.status === 'created' ? 'file-plus-outline' : 'file-edit-outline'}
                size={14}
                color={f.status === 'deleted' ? Colors.jules.statusFailed : f.status === 'created' ? Colors.jules.statusDone : Colors.jules.tertiary}
                style={{ marginRight: 8, flexShrink: 0 }}
              />
              <Text style={styles.fileName} numberOfLines={1}>{f.path}</Text>
            </View>
          ))}
          {hasMore && (
            <TouchableOpacity
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setExpanded(v => !v);
              }}
              style={styles.showMoreBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.showMoreText}>
                {expanded ? 'Show less' : `+${allFiles.length - PREVIEW} more files`}
              </Text>
              <MaterialCommunityIcons
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={Colors.jules.primary}
              />
            </TouchableOpacity>
          )}
        </>
      )}
    </View>
  );
}

function formatTime(timestamp?: string) {
  if (!timestamp) return '';
  try {
    const date = new Date(timestamp);
    // Simple readable format: YYYY/MM/DD HH:mm
    return date.toLocaleString();
  } catch (e) {
    return '';
  }
}

function AgentMessageCard({ text, timestamp }: { text: string; timestamp?: string }) {
  const theme = useTheme();
  // Markdown styles
  const markdownStyles = {
    body: {
      color: theme.colors.onSurface,
      fontSize: 14,
      lineHeight: 20,
    },
    link: { color: Colors.jules.primary },
    code_inline: { backgroundColor: theme.colors.surfaceVariant, color: theme.colors.primary },
    fence: { backgroundColor: theme.colors.surfaceVariant, color: theme.colors.onSurface },
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(text);
  };

  return (
    <View style={styles.agentBubble}>
      <Markdown style={markdownStyles}>
        {text}
      </Markdown>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4, alignItems: 'center' }}>
        {timestamp && (
          <Text style={{ fontSize: 10, color: Colors.jules.textSecondary, marginRight: 8, opacity: 0.8 }}>
            {formatTime(timestamp)}
          </Text>
        )}
        <TouchableOpacity onPress={handleCopy} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <MaterialCommunityIcons name="content-copy" size={14} color={Colors.jules.textSecondary} style={{ opacity: 0.6 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function UserMessageCard({ text, timestamp }: { text: string; timestamp?: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.userBubble, { backgroundColor: theme.colors.primaryContainer }]}>
      <Text selectable style={{ color: theme.colors.onPrimaryContainer, lineHeight: 20, fontSize: 14 }}>
        {text}
      </Text>
      {timestamp && (
        <Text style={{ fontSize: 10, color: theme.colors.onPrimaryContainer, marginTop: 4, alignSelf: 'flex-end', opacity: 0.7 }}>
          {formatTime(timestamp)}
        </Text>
      )}
    </View>
  );
}

export default function SessionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [session, setSession] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [promptSelectorVisible, setPromptSelectorVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Per-item state maps
  const [planStepExpanded, setPlanStepExpanded] = useState<Record<string, Record<number, boolean>>>({});
  const [planShowAll, setPlanShowAll] = useState<Record<string, boolean>>({});
  const flatListRef = useRef<FlatList>(null);
  const prevActivitiesLength = useRef(0);
  const theme = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadSessionMeta();
    loadActivities();
    const interval = setInterval(loadActivities, 5000);
    return () => clearInterval(interval);
  }, [id]);

  // Scroll to end only when new activities are added (not on expand/collapse)
  useEffect(() => {
    if (activities.length > prevActivitiesLength.current) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
    prevActivitiesLength.current = activities.length;
  }, [activities]);

  const loadSessionMeta = async () => {
    if (!id) return;
    try {
      const data = await JulesApi.getSession(decodeURIComponent(id as string));
      setSession(data);
    } catch (e) {
      console.error(e?.message || e);
    }
  };

  const loadActivities = async () => {
    if (!id) return;
    try {
      const data = await JulesApi.listActivities(decodeURIComponent(id as string));
      setActivities(data.activities || []);
    } catch (e) {
      console.error(e?.message || e);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || !id) return;
    const text = inputText;
    setInputText('');
    setLoading(true);
    try {
      await JulesApi.sendMessage(decodeURIComponent(id as string), text);
      await loadActivities();
    } catch (e) {
      console.error(e?.message || e);
      setError(t('errorLoading'));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (_planId: string) => {
    if (!id) return;
    try {
      await JulesApi.approvePlan(decodeURIComponent(id as string));
      await loadActivities();
      await loadSessionMeta();
    } catch (e) {
      console.error(e?.message || e);
      setError(t('errorLoading'));
    }
  };

  const togglePlanStep = (itemName: string, stepIndex: number) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPlanStepExpanded(prev => ({
      ...prev,
      [itemName]: { ...(prev[itemName] || {}), [stepIndex]: !((prev[itemName] || {})[stepIndex]) },
    }));
  };

  const togglePlanAll = (itemName: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPlanShowAll(prev => ({ ...prev, [itemName]: !prev[itemName] }));
  };

  const renderItem = ({ item }: { item: any }) => {
    if (item.planGenerated) {
      return (
        <PlanCard
          item={item}
          expandedSteps={planStepExpanded[item.name] || {}}
          onToggleStep={(i) => togglePlanStep(item.name, i)}
          onToggleAll={() => togglePlanAll(item.name)}
          showAll={!!planShowAll[item.name]}
          onApprove={() => handleApprove(item.planGenerated.plan.id)}
          t={t}
        />
      );
    }

    if (item.planApproved) {
      return <StatusPill text="Plan approved ✓" color={Colors.jules.statusDone} />;
    }

    if (item.sessionCompleted) {
      return (
        <View>
          {item.artifacts?.length > 0 && <ArtifactsCard item={item} />}
          <StatusPill text="Session completed" color={Colors.jules.statusDone} />
        </View>
      );
    }

    if (item.progressUpdated) {
      const { title } = item.progressUpdated ?? {};
      const hasArtifacts = (item.artifacts?.length ?? 0) > 0;
      if (!title && !hasArtifacts) return null;
      return (
        <View>
          {!!title && <ProgressCard item={item} />}
          {hasArtifacts && <ArtifactsCard item={item} />}
        </View>
      );
    }

    if (item.codeGenerated) {
      return <CodeChangeCard item={item} />;
    }

    if (item.statusChanged) {
      return <StatusPill text={item.statusChanged.status} />;
    }

    if (item.agentMessaged) {
      const text = item.agentMessaged.agentMessage || item.agentMessaged.message || '';
      return <AgentMessageCard text={text} timestamp={item.createTime} />;
    }

    if (item.userMessaged) {
      return <UserMessageCard text={item.userMessaged.userMessage || ''} timestamp={item.createTime} />;
    }

    if (item.message) {
      const text = item.message.text || '';
      if (item.originator === 'user') {
        return <UserMessageCard text={text} timestamp={item.createTime || item.message.created_at} />;
      }
      return <AgentMessageCard text={text} timestamp={item.createTime || item.message.created_at} />;
    }

    return null;
  };

  const isDone = session && DONE_STATES.has(session.state);
  const hasPR = !!session?.pullRequest?.url;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      {/* Session header */}
      {session && (
        <View style={[styles.sessionHeader, { backgroundColor: theme.colors.surface, borderBottomColor: Colors.jules.border }]}>
          <View style={styles.sessionHeaderRow}>
            <StatusDot state={session.state} />
            <Text
              variant="titleSmall"
              style={{ color: theme.colors.onSurface, flex: 1 }}
              numberOfLines={1}
            >
              {session.title || t('sessionDetail')}
            </Text>
            {isDone && hasPR && (
              <TouchableOpacity
                onPress={() => Linking.openURL(session.pullRequest.url)}
                style={styles.viewPRBtn}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="source-pull" size={13} color="#fff" style={{ marginRight: 4 }} />
                <Text style={styles.viewPRText}>{t('openPR')}</Text>
              </TouchableOpacity>
            )}
          </View>
          {/* Branch name when PR exists */}
          {session.pullRequest?.branch && (
            <View style={styles.branchRow}>
              <MaterialCommunityIcons name="source-branch" size={12} color={Colors.jules.textSecondary} style={{ marginRight: 4 }} />
              <Text style={styles.branchName} numberOfLines={1}>{session.pullRequest.branch}</Text>
            </View>
          )}
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={activities}
        renderItem={renderItem}
        keyExtractor={item => item.name}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyActivities}>
            <ActivityIndicator size="small" color={Colors.jules.primary} />
          </View>
        }
      />

      <View style={[styles.inputContainer, { backgroundColor: theme.colors.surface, borderTopColor: Colors.jules.border, paddingBottom: Math.max(insets.bottom, 10) }]}>
        <TextInput
          mode="outlined"
          value={inputText}
          onChangeText={setInputText}
          placeholder={t('sendMessage')}
          style={styles.input}
          outlineStyle={{ borderColor: Colors.jules.border, borderRadius: 10 }}
          left={
            <TextInput.Icon
              icon="creation"
              onPress={() => setPromptSelectorVisible(true)}
              color={Colors.jules.primary}
            />
          }
          right={
            <TextInput.Icon
              icon="send"
              onPress={handleSend}
              disabled={loading || !inputText.trim()}
              color={inputText.trim() ? Colors.jules.primary : Colors.jules.textSecondary}
              accessibilityLabel={t('sendMessage')}
            />
          }
        />
      </View>

      <PromptSelector
        visible={promptSelectorVisible}
        onDismiss={() => setPromptSelectorVisible(false)}
        onSelect={(text) => setInputText(text)}
      />

      <Snackbar visible={!!error} onDismiss={() => setError(null)} duration={3000}>
        {error}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  sessionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  sessionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewPRBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.jules.statusDone,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginLeft: 8,
    flexShrink: 0,
  },
  viewPRText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  branchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 17,
  },
  branchName: {
    fontSize: 12,
    color: Colors.jules.textSecondary,
    flex: 1,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  listContent: {
    padding: 14,
    paddingBottom: 20,
  },

  // Generic card (Plan, CodeChange)
  card: {
    backgroundColor: Colors.jules.surfaceVariant,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.jules.border,
    padding: 12,
    marginBottom: 8,
  },
  cardLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },

  // Plan steps
  stepList: { marginBottom: 4 },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.jules.border,
  },
  stepNumberCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.jules.primary + '22',
    borderWidth: 1,
    borderColor: Colors.jules.primary + '55',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
    flexShrink: 0,
  },
  stepNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.jules.primary,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepTitle: {
    flex: 1,
    fontSize: 14,
    color: Colors.jules.text,
    lineHeight: 20,
  },
  stepDesc: {
    fontSize: 13,
    color: Colors.jules.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  showMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.jules.border,
  },
  showMoreText: {
    fontSize: 13,
    color: Colors.jules.primary,
    marginRight: 4,
  },
  approveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.jules.primary,
    borderRadius: 8,
    paddingVertical: 9,
    marginTop: 10,
  },
  approveBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Progress card
  progressCard: {
    paddingVertical: 6,
    paddingHorizontal: 4,
    marginBottom: 4,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.jules.textSecondary,
    marginRight: 10,
    flexShrink: 0,
  },
  progressTitle: {
    flex: 1,
    fontSize: 13,
    color: Colors.jules.textSecondary,
    lineHeight: 18,
  },
  progressDesc: {
    fontSize: 12,
    color: Colors.jules.textSecondary,
    lineHeight: 17,
    marginTop: 4,
    marginLeft: 17,
    opacity: 0.8,
  },

  // Code diff card (Jules-style "Updated [filename]")
  codeDiffCard: {
    backgroundColor: Colors.jules.surfaceVariant,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.jules.border,
    marginBottom: 6,
    overflow: 'hidden',
  },
  codeDiffHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  codeDiffTitle: {
    flex: 1,
    fontSize: 13,
    color: Colors.jules.textSecondary,
  },
  codeDiffFileName: {
    fontSize: 13,
    color: Colors.jules.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  codeDiffExtra: {
    fontSize: 13,
    color: Colors.jules.textSecondary,
  },
  codeDiffFileList: {
    borderTopWidth: 1,
    borderTopColor: Colors.jules.border,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  codeDiffFileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  codeDiffFilePath: {
    flex: 1,
    fontSize: 12,
    color: Colors.jules.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  // Legacy code card (fallback)
  codeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    marginBottom: 4,
  },
  codeCardText: {
    fontSize: 13,
    color: Colors.jules.textSecondary,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: Colors.jules.border,
  },
  fileName: {
    flex: 1,
    fontSize: 13,
    color: Colors.jules.text,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },

  // Artifacts card
  commitMsgRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  commitMsg: {
    flex: 1,
    fontSize: 13,
    color: Colors.jules.text,
    lineHeight: 18,
    fontWeight: '500',
  },
  filesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  filesHeaderText: {
    fontSize: 11,
    color: Colors.jules.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },

  // Status pill
  statusPillWrap: {
    alignItems: 'center',
    marginVertical: 6,
  },
  statusPill: {
    backgroundColor: Colors.jules.primary + '22',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Colors.jules.primary + '44',
  },
  statusPillText: {
    fontSize: 13,
    color: Colors.jules.primary,
    fontWeight: '500',
  },

  // Agent message bubble
  agentBubble: {
    backgroundColor: Colors.jules.surfaceVariant,
    borderRadius: 12,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.jules.border,
    padding: 12,
    marginBottom: 8,
    maxWidth: '85%',
    alignSelf: 'flex-start',
  },
  agentBubbleText: {
    fontSize: 14,
    color: Colors.jules.text,
    lineHeight: 20,
  },

  // User message bubble
  userBubble: {
    maxWidth: '82%',
    padding: 12,
    borderRadius: 14,
    borderBottomRightRadius: 4,
    marginBottom: 8,
    alignSelf: 'flex-end',
  },

  inputContainer: {
    padding: 10,
    borderTopWidth: 1,
  },
  input: { backgroundColor: 'transparent' },
  emptyActivities: { padding: 40, alignItems: 'center' },
});
