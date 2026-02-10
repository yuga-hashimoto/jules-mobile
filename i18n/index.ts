import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

const resources = {
  en: {
    translation: {
      sessions: 'Sessions',
      settings: 'Settings',
      apiKey: 'Jules API Key',
      save: 'Save',
      createSession: 'New Session',
      prompt: 'Prompt',
      repo: 'Repository (owner/name)',
      create: 'Create',
      cancel: 'Cancel',
      language: 'Language',
      theme: 'Theme',
      activities: 'Activities',
      sendMessage: 'Send a message...',
      approvePlan: 'Approve Plan',
      status: 'Status',
      sources: 'Sources',
    },
  },
  ja: {
    translation: {
      sessions: 'セッション',
      settings: '設定',
      apiKey: 'Jules APIキー',
      save: '保存',
      createSession: '新規セッション',
      prompt: 'プロンプト',
      repo: 'リポジトリ (owner/name)',
      create: '作成',
      cancel: 'キャンセル',
      language: '言語',
      theme: 'テーマ',
      activities: 'アクティビティ',
      sendMessage: 'メッセージを送信...',
      approvePlan: '計画を承認',
      status: 'ステータス',
      sources: 'ソース',
    },
  },
  ko: {
    translation: {
      sessions: '세션',
      settings: '설정',
      apiKey: 'Jules API 키',
      save: '저장',
      createSession: '새 세션',
      prompt: '프롬프트',
      repo: '저장소 (owner/name)',
      create: '만들기',
      cancel: '취소',
      language: '언어',
      theme: '테마',
      activities: '활동',
      sendMessage: '메시지 보내기...',
      approvePlan: '계획 승인',
      status: '상태',
      sources: '소스',
    },
  },
  zh: {
    translation: {
      sessions: '会话',
      settings: '设置',
      apiKey: 'Jules API 密钥',
      save: '保存',
      createSession: '新会话',
      prompt: '提示词',
      repo: '仓库 (owner/name)',
      create: '创建',
      cancel: '取消',
      language: '语言',
      theme: '主题',
      activities: '活动',
      sendMessage: '发送消息...',
      approvePlan: '批准计划',
      status: '状态',
      sources: '来源',
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: Localization.getLocales()[0].languageCode ?? 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
