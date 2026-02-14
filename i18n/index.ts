import * as Localization from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      sessions: 'Sessions',
      settings: 'Settings',
      apiKey: 'Jules API Key',
      save: 'Save',
      saved: 'Saved!',
      saveFailed: 'Save failed',
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
      allRepositories: 'All Repositories',
      noSessions: 'No sessions yet',
      errorLoading: 'Failed to load',
      working: 'Working',
      waitingForUser: 'Needs clarification',
      done: 'Done',
      failed: 'Failed',
      cancelled: 'Cancelled',
      openPR: 'Open PR',
      searchSessions: 'Search for repo or sessions',
      newSession: 'New session',
      describeTask: 'Describe the task for Jules...',
      sessionDetail: 'Session',
      recentSessions: 'Recent sessions',
      plan: 'Plan',
      progress: 'Progress',
      code: 'Code',
      codeGenerated: 'Generated code changes.',
      showLess: 'Show less',
      moreSteps: 'more steps',
      apiKeyHelp: 'Get your Jules API key from jules.google (Google AI Studio / Gemini API).',
      accounts: 'Accounts',
      addAccount: 'Add Account',
      deleteAccount: 'Delete',
      accountName: 'Account Name',
      noAccounts: 'No accounts yet. Add your first API key to get started.',
      confirmDelete: 'Delete this account?',
      editAccount: 'Edit Account',
      switchedAccount: 'Switched account',
      openCode: 'Open up the code for this screen:',
      changeText: 'Change any of the text, save the file, and your app will automatically update.',
      helpLink: "Tap here if your app doesn't automatically update after making changes",
      promptLibrary: {
        title: "Prompt Library",
        categories: {
          everyday: "Everyday Dev Tasks",
          debugging: "Debugging",
          documentation: "Documentation",
          testing: "Testing",
          package_management: "Package Management",
          ai_native: "AI-Native Tasks",
          context: "Context",
          fun: "Fun & Experimental",
          start_scratch: "Start from Scratch"
        },
        prompts: {
          everyday: {
            refactor: "// Refactor {a specific} file from {x} to {y}...",
            add_test: "// Add a test suite...",
            add_types: "// Add type hints to {a specific} Python function...",
            mock_data: "// Generate mock data for {a specific} schema...",
            convert_modules: "// Convert these commonJS modules to ES modules...",
            async_await: "// Turn this callback-based code into async/await...",
            data_class: "// Implement a data class for this dictionary structure..."
          },
          debugging: {
            fix_error: "// Help me fix {a specific} error...",
            profiling: "// Why is {this specific snippet of code} slow?",
            undefined_value: "// Trace why this value is undefined...",
            memory_leak: "// Diagnose this memory leak...",
            add_logging: "// Add logging to help debug this issue...",
            race_conditions: "// Find race conditions in this async code...",
            trace_execution: "// Add print statements to trace the execution flow of this Python script..."
          },
          documentation: {
            readme: "// Write a README for this project...",
            add_comments: "// Add comments to this code...",
            api_docs: "// Write API docs for this endpoint...",
            docstrings: "// Generate Sphinx-style docstrings for this Python module/class/function..."
          },
          testing: {
            integration_tests: "// Add integration tests for this API endpoint...",
            mock_fetch: "// Write a test that mocks fetch...",
            migrate_test_suite: "// Convert this test from Mocha to Jest...",
            property_based: "// Generate property-based tests for this function...",
            slow_network: "// Simulate slow network conditions in this test suite...",
            backward_compatibility: "// Write a test to ensure backward compatibility for this function...",
            mock_external_api: "// Write a Pytest fixture to mock this external API call..."
          },
          package_management: {
            upgrade_linter: "// Upgrade my linter and autofix breaking config changes...",
            changelog: "// Show me the changelog for React 19...",
            remove_dependencies: "// Which dependencies can I safely remove?",
            check_maintenance: "// Check if these packages are still maintained...",
            auto_updates: "// Set up Renovate or Dependabot for auto-updates..."
          },
          ai_native: {
            feature_ideas: "// Analyze this repo and generate 3 feature ideas...",
            tech_debt: "// Identify tech debt in this file...",
            find_duplicates: "// Find duplicate logic across files...",
            refactor_clusters: "// Cluster related functions and suggest refactors...",
            scope_issue: "// Help me scope this issue so Jules can solve it...",
            reusable_plugin: "// Convert this function into a reusable plugin/module...",
            parallel_processing: "// Refactor this Python function to be more amenable to parallel processing..."
          },
          context: {
            status_update: "// Write a status update based on recent commits...",
            summarize_changes: "// Summarize all changes in the last 7 days..."
          },
          fun: {
            confetti: "// Add a confetti animation when {a specific} action succeeds...",
            dev_joke: "// Inject a developer joke when {a specific} build finishes...",
            cli_game: "// Build a mini CLI game that runs in the terminal...",
            dark_mode_easter_egg: "// Add a dark mode Easter egg to this UI...",
            github_app: "// Turn this tool into a GitHub App..."
          },
          start_scratch: {
            repo_overview: "// What's going on in this repo?",
            init_express: "// Initialize a new Express app with CORS enabled...",
            monorepo_setup: "// Set up a monorepo using Turborepo and PNPM...",
            python_bootstrap: "// Bootstrap a Python project with Poetry and Pytest...",
            chrome_extension: "// Create a starter template for a Chrome extension...",
            web_scraper: "// I want to build a web scraper—start me off..."
          }
        }
      }
    },
  },
  ja: {
    translation: {
      sessions: 'セッション',
      settings: '設定',
      apiKey: 'Jules APIキー',
      save: '保存',
      saved: '保存しました',
      saveFailed: '保存に失敗しました',
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
      allRepositories: 'すべてのリポジトリ',
      noSessions: 'セッションはまだありません',
      errorLoading: '読み込みに失敗しました',
      working: '実行中',
      waitingForUser: '要確認',
      done: '完了',
      failed: '失敗',
      cancelled: 'キャンセル済み',
      openPR: 'PRを開く',
      searchSessions: 'リポジトリ・セッションを検索',
      newSession: '新しいセッション',
      describeTask: 'Julesへのタスクを入力...',
      sessionDetail: 'セッション',
      recentSessions: '最近のセッション',
      plan: 'プラン',
      progress: '進捗',
      code: 'コード',
      codeGenerated: 'コードの変更が生成されました。',
      showLess: '折りたたむ',
      moreSteps: 'ステップをさらに表示',
      apiKeyHelp: 'jules.google（Google AI Studio / Gemini API）からAPIキーを取得してください。',
      accounts: 'アカウント',
      addAccount: 'アカウント追加',
      deleteAccount: '削除',
      accountName: 'アカウント名',
      noAccounts: 'アカウントがありません。APIキーを追加してください。',
      confirmDelete: 'このアカウントを削除しますか？',
      editAccount: 'アカウント編集',
      switchedAccount: 'アカウントを切り替えました',
      openCode: 'この画面のコードを開く:',
      changeText: 'テキストを変更してファイルを保存すると、アプリが自動的に更新されます。',
      helpLink: '変更後にアプリが自動更新されない場合はここをタップ',
      promptLibrary: {
        title: "プロンプトライブラリ",
        categories: {
          everyday: "日常の開発タスク",
          debugging: "デバッグ",
          documentation: "ドキュメント作成",
          testing: "テスト",
          package_management: "パッケージ管理",
          ai_native: "AIネイティブなタスク",
          context: "コンテキスト",
          fun: "お楽しみ・実験的",
          start_scratch: "ゼロから始める"
        },
        prompts: {
          everyday: {
            refactor: "// {特定の}ファイルを{x}から{y}へリファクタリングして...",
            add_test: "// テストスイートを追加して...",
            add_types: "// {特定の}Python関数に型ヒントを追加して...",
            mock_data: "// {特定の}スキーマのモックデータを生成して...",
            convert_modules: "// これらのcommonJSモジュールをESモジュールに変換して...",
            async_await: "// このコールバックベースのコードをasync/awaitに変換して...",
            data_class: "// この辞書構造のデータクラスを実装して..."
          },
          debugging: {
            fix_error: "// {特定の}エラーの修正を手伝って...",
            profiling: "// なぜ{この特定のコードスニペット}は遅いのか？",
            undefined_value: "// この値がundefinedになる理由を追跡して...",
            memory_leak: "// このメモリリークを診断して...",
            add_logging: "// この問題をデバッグするためにログを追加して...",
            race_conditions: "// この非同期コードの競合状態を見つけて...",
            trace_execution: "// このPythonスクリプトの実行フローを追跡するためのprint文を追加して..."
          },
          documentation: {
            readme: "// このプロジェクトのREADMEを書いて...",
            add_comments: "// このコードにコメントを追加して...",
            api_docs: "// このエンドポイントのAPIドキュメントを書いて...",
            docstrings: "// このPythonモジュール/クラス/関数にSphinxスタイルのdocstringを生成して..."
          },
          testing: {
            integration_tests: "// このAPIエンドポイントの統合テストを追加して...",
            mock_fetch: "// fetchをモックするテストを書いて...",
            migrate_test_suite: "// このテストをMochaからJestに変換して...",
            property_based: "// この関数のプロパティベーステストを生成して...",
            slow_network: "// このテストスイートで低速なネットワーク状態をシミュレートして...",
            backward_compatibility: "// この関数の後方互換性を保証するテストを書いて...",
            mock_external_api: "// この外部API呼び出しをモックするPytestフィクスチャを書いて..."
          },
          package_management: {
            upgrade_linter: "// Linterをアップグレードして、設定の変更を自動修正して...",
            changelog: "// React 19の変更履歴を表示して...",
            remove_dependencies: "// どの依存関係を安全に削除できますか？",
            check_maintenance: "// これらのパッケージがまだメンテナンスされているか確認して...",
            auto_updates: "// 自動更新のためにRenovateまたはDependabotを設定して..."
          },
          ai_native: {
            feature_ideas: "// このリポジトリを分析して、3つの機能アイデアを生成して...",
            tech_debt: "// このファイルの技術的負債を特定して...",
            find_duplicates: "// ファイル間の重複ロジックを見つけて...",
            refactor_clusters: "// 関連する関数をクラスター化し、リファクタリングを提案して...",
            scope_issue: "// Julesが解決できるようにこの問題をスコープして...",
            reusable_plugin: "// この関数を再利用可能なプラグイン/モジュールに変換して...",
            parallel_processing: "// 並列処理に適するようにこのPython関数をリファクタリングして..."
          },
          context: {
            status_update: "// 最近のコミットに基づいてステータス更新を書いて...",
            summarize_changes: "// 過去7日間のすべての変更を要約して..."
          },
          fun: {
            confetti: "// {特定の}アクションが成功したときに紙吹雪のアニメーションを追加して...",
            dev_joke: "// {特定の}ビルドが完了したときに開発者向けのジョークを挿入して...",
            cli_game: "// ターミナルで実行できるミニCLIゲームを作成して...",
            dark_mode_easter_egg: "// このUIにダークモードのイースターエッグを追加して...",
            github_app: "// このツールをGitHub Appに変換して..."
          },
          start_scratch: {
            repo_overview: "// このリポジトリは何をしていますか？",
            init_express: "// CORSが有効な新しいExpressアプリを初期化して...",
            monorepo_setup: "// TurborepoとPNPMを使用してモノレポを設定して...",
            python_bootstrap: "// PoetryとPytestを使用してPythonプロジェクトをブートストラップして...",
            chrome_extension: "// Chrome拡張機能のスターターテンプレートを作成して...",
            web_scraper: "// ウェブスクレイパーを作りたいので、手始めに教えて..."
          }
        }
      }
    },
  },
  ko: {
    translation: {
      sessions: '세션',
      settings: '설정',
      apiKey: 'Jules API 키',
      save: '저장',
      saved: '저장됨',
      saveFailed: '저장 실패',
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
      allRepositories: '모든 저장소',
      noSessions: '세션 없음',
      errorLoading: '불러오기 실패',
      working: '작업 중',
      waitingForUser: '확인 필요',
      done: '완료',
      failed: '실패',
      cancelled: '취소됨',
      openPR: 'PR 열기',
      searchSessions: '저장소/세션 검색',
      newSession: '새 세션',
      describeTask: 'Jules에게 작업 설명...',
      sessionDetail: '세션',
      recentSessions: '최근 세션',
      plan: '계획',
      progress: '진행 상황',
      code: '코드',
      codeGenerated: '코드 변경 사항이 생성되었습니다.',
      showLess: '접기',
      moreSteps: '단계 더 보기',
      apiKeyHelp: 'jules.google(Google AI Studio / Gemini API)에서 API 키를 가져오세요.',
      accounts: '계정',
      addAccount: '계정 추가',
      deleteAccount: '삭제',
      accountName: '계정 이름',
      noAccounts: '계정이 없습니다. API 키를 추가하세요.',
      confirmDelete: '이 계정을 삭제하시겠습니까?',
      editAccount: '계정 편집',
      switchedAccount: '계정이 전환되었습니다',
      openCode: '이 화면의 코드를 엽니다:',
      changeText: '텍스트를 변경하고 파일을 저장하면 앱이 자동으로 업데이트됩니다.',
      helpLink: '변경 후 앱이 자동으로 업데이트되지 않으면 여기를 탭하세요',
      promptLibrary: {
        title: "프롬프트 라이브러리",
        categories: {
          everyday: "일상적인 개발 작업",
          debugging: "디버깅",
          documentation: "문서화",
          testing: "테스트",
          package_management: "패키지 관리",
          ai_native: "AI 네이티브 작업",
          context: "컨텍스트",
          fun: "재미 & 실험",
          start_scratch: "처음부터 시작하기"
        },
        prompts: {
          everyday: {
            refactor: "// {특정} 파일을 {x}에서 {y}로 리팩토링해줘...",
            add_test: "// 테스트 스위트를 추가해줘...",
            add_types: "// {특정} Python 함수에 타입 힌트를 추가해줘...",
            mock_data: "// {특정} 스키마에 대한 모의 데이터를 생성해줘...",
            convert_modules: "// 이 commonJS 모듈들을 ES 모듈로 변환해줘...",
            async_await: "// 이 콜백 기반 코드를 async/await로 바꿔줘...",
            data_class: "// 이 딕셔너리 구조에 대한 데이터 클래스를 구현해줘..."
          },
          debugging: {
            fix_error: "// {특정} 오류를 수정하도록 도와줘...",
            profiling: "// 왜 {이 특정 코드 조각}이 느린가?",
            undefined_value: "// 이 값이 왜 undefined인지 추적해줘...",
            memory_leak: "// 이 메모리 누수를 진단해줘...",
            add_logging: "// 이 문제를 디버그하기 위해 로깅을 추가해줘...",
            race_conditions: "// 이 비동기 코드에서 경쟁 조건을 찾아줘...",
            trace_execution: "// 이 Python 스크립트의 실행 흐름을 추적하기 위해 print 문을 추가해줘..."
          },
          documentation: {
            readme: "// 이 프로젝트의 README를 작성해줘...",
            add_comments: "// 이 코드에 주석을 추가해줘...",
            api_docs: "// 이 엔드포인트에 대한 API 문서를 작성해줘...",
            docstrings: "// 이 Python 모듈/클래스/함수에 대해 Sphinx 스타일의 docstring을 생성해줘..."
          },
          testing: {
            integration_tests: "// 이 API 엔드포인트에 대한 통합 테스트를 추가해줘...",
            mock_fetch: "// fetch를 모의(mock)하는 테스트를 작성해줘...",
            migrate_test_suite: "// 이 테스트를 Mocha에서 Jest로 변환해줘...",
            property_based: "// 이 함수에 대한 속성 기반 테스트를 생성해줘...",
            slow_network: "// 이 테스트 스위트에서 느린 네트워크 조건을 시뮬레이션해줘...",
            backward_compatibility: "// 이 함수에 대한 하위 호환성을 보장하는 테스트를 작성해줘...",
            mock_external_api: "// 이 외부 API 호출을 모의(mock)하는 Pytest 픽스처를 작성해줘..."
          },
          package_management: {
            upgrade_linter: "// 린터를 업그레이드하고 주요 구성 변경 사항을 자동으로 수정해줘...",
            changelog: "// React 19의 변경 로그를 보여줘...",
            remove_dependencies: "// 어떤 종속성을 안전하게 제거할 수 있어?",
            check_maintenance: "// 이 패키지들이 여전히 유지 관리되고 있는지 확인해줘...",
            auto_updates: "// 자동 업데이트를 위해 Renovate 또는 Dependabot을 설정해줘..."
          },
          ai_native: {
            feature_ideas: "// 이 저장소를 분석하고 3가지 기능 아이디어를 생성해줘...",
            tech_debt: "// 이 파일에서 기술적 부채를 식별해줘...",
            find_duplicates: "// 파일 전반에 걸친 중복 로직을 찾아줘...",
            refactor_clusters: "// 관련 함수를 클러스터링하고 리팩토링을 제안해줘...",
            scope_issue: "// Jules가 해결할 수 있도록 이 이슈의 범위를 지정해줘...",
            reusable_plugin: "// 이 함수를 재사용 가능한 플러그인/모듈로 변환해줘...",
            parallel_processing: "// 병렬 처리에 더 적합하도록 이 Python 함수를 리팩토링해줘..."
          },
          context: {
            status_update: "// 최근 커밋을 기반으로 상태 업데이트를 작성해줘...",
            summarize_changes: "// 지난 7일간의 모든 변경 사항을 요약해줘..."
          },
          fun: {
            confetti: "// {특정} 작업이 성공했을 때 색종이 애니메이션을 추가해줘...",
            dev_joke: "// {특정} 빌드가 완료되었을 때 개발자 농담을 넣어줘...",
            cli_game: "// 터미널에서 실행되는 미니 CLI 게임을 만들어줘...",
            dark_mode_easter_egg: "// 이 UI에 다크 모드 이스터 에그를 추가해줘...",
            github_app: "// 이 도구를 GitHub 앱으로 변환해줘..."
          },
          start_scratch: {
            repo_overview: "// 이 저장소는 무슨 일을 해?",
            init_express: "// CORS가 활성화된 새 Express 앱을 초기화해줘...",
            monorepo_setup: "// Turborepo와 PNPM을 사용하여 모노레포를 설정해줘...",
            python_bootstrap: "// Poetry와 Pytest로 Python 프로젝트를 부트스트랩해줘...",
            chrome_extension: "// Chrome 확장 프로그램용 스타터 템플릿을 만들어줘...",
            web_scraper: "// 웹 스크래퍼를 만들고 싶은데, 시작하는 법을 알려줘..."
          }
        }
      }
    },
  },
  zh: {
    translation: {
      sessions: '会话',
      settings: '设置',
      apiKey: 'Jules API 密钥',
      save: '保存',
      saved: '已保存',
      saveFailed: '保存失败',
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
      allRepositories: '所有仓库',
      noSessions: '暂无会话',
      errorLoading: '加载失败',
      working: '处理中',
      waitingForUser: '需要确认',
      done: '完成',
      failed: '失败',
      cancelled: '已取消',
      openPR: '查看 PR',
      searchSessions: '搜索仓库或会话',
      newSession: '新建会话',
      describeTask: '描述Jules的任务...',
      sessionDetail: '会话',
      recentSessions: '最近的会话',
      plan: '计划',
      progress: '进度',
      code: '代码',
      codeGenerated: '已生成代码更改。',
      showLess: '收起',
      moreSteps: '更多步骤',
      apiKeyHelp: '从 jules.google（Google AI Studio / Gemini API）获取您的 API 密钥。',
      accounts: '账户',
      addAccount: '添加账户',
      deleteAccount: '删除',
      accountName: '账户名称',
      noAccounts: '暂无账户。请添加您的API密钥。',
      confirmDelete: '确定删除此账户？',
      editAccount: '编辑账户',
      switchedAccount: '已切换账户',
      openCode: '打开此屏幕的代码：',
      changeText: '更改任何文本，保存文件，您的应用将自动更新。',
      helpLink: '如果更改后应用没有自动更新，请点击此处',
      promptLibrary: {
        title: "提示词库",
        categories: {
          everyday: "日常开发任务",
          debugging: "调试",
          documentation: "文档",
          testing: "测试",
          package_management: "包管理",
          ai_native: "AI 原生任务",
          context: "上下文",
          fun: "趣味 & 实验",
          start_scratch: "从零开始"
        },
        prompts: {
          everyday: {
            refactor: "// 将 {特定} 文件从 {x} 重构为 {y}...",
            add_test: "// 添加测试套件...",
            add_types: "// 为 {特定} Python 函数添加类型提示...",
            mock_data: "// 为 {特定} 模式生成模拟数据...",
            convert_modules: "// 将这些 commonJS 模块转换为 ES 模块...",
            async_await: "// 将此基于回调的代码转换为 async/await...",
            data_class: "// 为此字典结构实现数据类..."
          },
          debugging: {
            fix_error: "// 帮我修复 {特定} 错误...",
            profiling: "// 为什么 {这段特定代码} 很慢？",
            undefined_value: "// 追踪为什么此值为 undefined...",
            memory_leak: "// 诊断此内存泄漏...",
            add_logging: "// 添加日志以帮助调试此问题...",
            race_conditions: "// 查找此异步代码中的竞争条件...",
            trace_execution: "// 添加打印语句以跟踪此 Python 脚本的执行流程..."
          },
          documentation: {
            readme: "// 为此项目编写 README...",
            add_comments: "// 为此代码添加注释...",
            api_docs: "// 为此端点编写 API 文档...",
            docstrings: "// 为此 Python 模块/类/函数生成 Sphinx 风格的文档字符串..."
          },
          testing: {
            integration_tests: "// 为此 API 端点添加集成测试...",
            mock_fetch: "// 编写一个模拟 fetch 的测试...",
            migrate_test_suite: "// 将此测试从 Mocha 转换为 Jest...",
            property_based: "// 为此函数生成基于属性的测试...",
            slow_network: "// 在此测试套件中模拟慢速网络条件...",
            backward_compatibility: "// 编写测试以确保此函数的向后兼容性...",
            mock_external_api: "// 编写一个 Pytest fixture 来模拟此外部 API 调用..."
          },
          package_management: {
            upgrade_linter: "// 升级我的 linter 并自动修复破坏性的配置更改...",
            changelog: "// 显示 React 19 的变更日志...",
            remove_dependencies: "// 我可以安全地删除哪些依赖项？",
            check_maintenance: "// 检查这些包是否仍在维护...",
            auto_updates: "// 设置 Renovate 或 Dependabot 以进行自动更新..."
          },
          ai_native: {
            feature_ideas: "// 分析此仓库并生成 3 个功能创意...",
            tech_debt: "// 识别此文件中的技术债务...",
            find_duplicates: "// 查找跨文件的重复逻辑...",
            refactor_clusters: "// 对相关函数进行聚类并建议重构...",
            scope_issue: "// 帮我界定此问题的范围，以便 Jules 可以解决它...",
            reusable_plugin: "// 将此函数转换为可重用的插件/模块...",
            parallel_processing: "// 重构此 Python 函数以更适合并行处理..."
          },
          context: {
            status_update: "// 根据最近的提交编写状态更新...",
            summarize_changes: "// 总结过去 7 天的所有更改..."
          },
          fun: {
            confetti: "// 当 {特定} 操作成功时添加五彩纸屑动画...",
            dev_joke: "// 当 {特定} 构建完成时插入一个开发者笑话...",
            cli_game: "// 构建一个在终端中运行的迷你 CLI 游戏...",
            dark_mode_easter_egg: "// 在此 UI 中添加深色模式彩蛋...",
            github_app: "// 将此工具转换为 GitHub App..."
          },
          start_scratch: {
            repo_overview: "// 这个仓库是做什么的？",
            init_express: "// 初始化一个启用了 CORS 的新 Express 应用程序...",
            monorepo_setup: "// 使用 Turborepo 和 PNPM 设置 monorepo...",
            python_bootstrap: "// 使用 Poetry 和 Pytest 引导 Python 项目...",
            chrome_extension: "// 创建 Chrome 扩展程序的入门模板...",
            web_scraper: "// 我想构建一个网络爬虫——带我入门..."
          }
        }
      }
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
