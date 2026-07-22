// sidepanel.js - Image Chatter image-analysis and generation UI

const STORAGE_KEYS = {
  selectedApiKey: "selectedApiKey",
  selectedModel: "selectedModel",
  selectedGenerationModel: "selectedGenerationModel",
  workspaceMode: "workspaceMode",
  language: "language",
  messages: "messages",
  pageContent: "pageContent",
  savedPrompts: "savedPrompts",
  imageSavedPrompts: "imageSavedPrompts",
  panelMode: "panelMode",
  verifiedModels: "verifiedModels"
};

// Special sentinel value used as a model-selector option that triggers
// verification of all candidate models instead of selecting a model.
const VERIFY_MODELS_ACTION = "__verify_models__";

const DEFAULT_MODEL = "o4-mini";
const DEFAULT_GENERATION_MODELS = ["gpt-image-1.5", "gpt-image-2"];
const DEFAULT_GENERATION_MODEL = "gpt-image-2";
const RUNTIME_MESSAGE_TIMEOUT_MS = 30000;
const VISION_RUNTIME_MESSAGE_TIMEOUT_MS = 300000;
const MAX_CHAT_IMAGE_BYTES = 20 * 1024 * 1024;
const MAX_CHAT_IMAGES = 10;
const MAX_REFERENCE_IMAGES = 10;
const DEFAULT_CHAT_ANALYSIS_MODE = "combined";
const PER_IMAGE_CONCURRENCY = 2;
const CHAT_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);
const REFERENCE_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const REFERENCE_REORDER_MIME = "application/x-image-chatter-reference";
const ALLOWED_ANTHROPIC_MODEL_PREFIXES = [];

const TRANSLATIONS = {
  "zh-TW": {
    "mode-chat": "對話",
    "mode-image": "圖片",
    "image-size": "尺寸",
    "image-quality": "品質",
    "image-format": "格式",
    "image-add-reference": "參考圖",
    "image-remove-reference": "移除參考圖",
    "image-empty": "圖片預覽",
    "image-generating": "正在生成圖片...",
    "image-cancel": "取消",
    "image-download": "下載",
    "image-prompt-placeholder": "描述要生成的圖片...",
    "image-generate": "生成",
    "image-no-references": "尚未加入參考圖",
    "image-new-tab-label": "圖片 {number}",
    "new-tab": "新增分頁",
    "tab-scroll-left": "向左捲動分頁",
    "tab-scroll-right": "向右捲動分頁",
    "image-compose-expand": "展開生成設定與參考圖",
    "image-compose-collapse": "收合生成設定與參考圖",
    "status-reference-attached": "已加入參考圖",
    "error-reference-type": "參考圖只支援 PNG、JPEG 或 WebP",
    "error-reference-count": "每個生成分頁最多只能加入 {max} 張參考圖",
    "image-retry": "API 過載，{seconds} 秒後重試（第 {attempt}/{total} 次）...",
    "status-image-ready": "圖片已生成",
    "status-image-cancelled": "已取消圖片生成",
    "error-image-key": "圖片生成功能目前只支援 GNAI Key",
    "error-image-prompt": "請輸入圖片描述",
    "error-image": "圖片生成失敗：",
    clear: "清除",
    "load-page": "載入網頁",
    "load-clipboard": "載入剪貼簿",
    "status-ready": "準備就緒",
    "status-loading-page": "載入網頁中...",
    "status-loading-clipboard": "載入剪貼簿中...",
    "status-page-loaded": "網頁已載入",
    "status-clipboard-loaded": "剪貼簿已載入",
    "status-loading-models": "載入模型中...",
    "status-models-loaded": "已載入 {count} 個模型",
    "verify-models": "🔍 驗證支援模型…",
    "status-fetching-model-docs": "正在讀取 GNAI 模型文件...",
    "status-verifying-models": "驗證模型中，請稍候...",
    "status-verify-done": "驗證完成：{ok} 個可用、{fail} 個不可用",
    "error-verify-models": "模型驗證失敗：",
    "model-discovery-title": "GNAI 模型驗證",
    "model-discovery-source": "模型來源文件 ↗",
    "model-discovery-found": "從文件取得 {count} 個候選模型，正在逐一驗證。",
    "model-discovery-done": "驗證完成：{ok} 個可用、{fail} 個不可用。",
    "model-discovery-error": "無法完成模型驗證：{error}",
    "model-status-pending": "待驗證",
    "model-status-available": "可用",
    "model-status-unavailable": "不可用",
    "status-sending": "發送中...",
    "status-error": "發生錯誤",
    send: "發送",
    "empty-title": "開始對話",
    "empty-text": "可以直接開始對話，或是點擊「載入網頁」或「載入剪貼簿」來載入內容後提問。",
    "input-placeholder": "輸入您的問題...",
    "attach-chat-image": "加入圖片",
    "remove-chat-image": "移除圖片",
    "open-image-tab": "在新分頁開啟圖片",
    "analysis-mode": "圖片分析方式",
    "analysis-combined": "綜合分析",
    "analysis-per-image": "逐張分析",
    "attachment-count": "已加入 {count}/{max} 張圖片",
    "attachment-expand": "展開圖片附件",
    "attachment-collapse": "收合圖片附件",
    "error-image-count": "一次最多只能加入 {max} 張圖片",
    "batch-results": "逐張分析結果",
    "batch-progress": "已完成 {done}/{total}",
    "batch-cancel": "取消全部",
    "batch-retry": "重試",
    "batch-follow-up": "針對這張追問",
    "batch-compare-all": "比較全部圖片",
    "batch-status-pending": "等待中",
    "batch-status-analyzing": "分析中",
    "batch-status-completed": "已完成",
    "batch-status-failed": "失敗",
    "batch-status-cancelled": "已取消",
    "batch-interrupted": "分析因 extension 重新載入而中斷，請重試",
    "context-single": "目前正在詢問：{name}",
    "context-all": "目前正在比較全部圖片",
    "vision-model": "圖片問答 · o4-mini",
    "status-image-attached": "已加入圖片，將使用 o4-mini",
    "status-vision-sending": "正在分析圖片...",
    "system-page-loaded": "已載入網頁內容",
    "system-clipboard-loaded": "已載入剪貼簿內容",
    "quick-question-title": "快速提問",
    "quick-question-help": "說明",
    "qq-help-intro": "點選下方按鈕，即可用預設提示詞分析已載入的 sighting 或文件：",
    "template-concise": "簡潔摘要",
    "template-keydata": "關鍵數據",
    "template-rootcause": "根因分析",
    "template-risk": "影響與風險",
    "template-action": "後續行動",
    "template-quiz": "出題考我",
    "qq-desc-concise": "用條列快速摘要重點",
    "qq-desc-keydata": "抽出關鍵規格、參數與數據",
    "qq-desc-rootcause": "分析問題的根本原因",
    "qq-desc-risk": "找出影響範圍與潛在風險",
    "qq-desc-action": "整理後續行動與負責事項",
    "qq-desc-quiz": "出題測驗，幫助我真正理解",
    "saved-prompts": "常用提示詞",
    "saved-prompts-title": "常用提示詞管理",
    "manage-prompts": "管理",
    "add-prompt": "新增提示詞",
    "empty-prompts": "還沒有常用提示詞，請在下方新增",
    "empty-saved-prompts": "點擊「管理」來新增常用提示詞",
    "new-prompt-placeholder": "輸入新的常用提示詞...",
    "error-api-key-prefix": "API key 格式無效，請輸入 pak_ 開頭（ExpertGPT）或 GNAI Key",
    "error-no-tab": "找不到當前分頁",
    "error-load-page": "載入網頁失敗：",
    "error-load-clipboard": "載入剪貼簿失敗：",
    "error-clipboard-empty": "剪貼簿是空的",
    "error-empty-message": "請輸入問題",
    "error-vision-key": "圖片問答功能目前只支援 GNAI Key",
    "error-chat-image-type": "圖片格式必須是 PNG、JPEG、WebP 或 GIF",
    "error-chat-image-size": "圖片大小不可超過 20 MB",
    "error-send": "發送失敗：",
    "error-model-restricted": "此模型目前受限，請改用可用模型（例如 claude-haiku-4-5）。",
    "error-load-models": "載入模型失敗：",
    "error-init": "初始化失敗：",
    "lang-set": "語言已切換：{lang}",
    "apikey-modal-title": "設定 API Key",
    "apikey-modal-hint": "請輸入 GNAI API Key",
    "apikey-get-gnai": "取得 GNAI API Key ↗",
    "apikey-cancel": "取消",
    "apikey-confirm": "確認",
    "apikey-updated": "API key 已更新",
    "apikey-required": "請先設定 API key",
    "model-restricted-tag": "受限",
    "panel-mode-to-popup": "切換至彈窗",
    "panel-mode-to-sidepanel": "切換至側欄",
    "panel-mode-disabled-generating": "圖片生成期間無法切換顯示模式，請等待生成完成或先取消生成。",
    "panel-mode-switched-popup": "已切換至彈窗模式，下次點擊圖示將開啟彈窗",
    "panel-mode-switched-sidepanel": "已切換至側欄模式",
    "save-session": "💾 儲存對話",
    "status-session-saved": "對話已儲存",
    "status-session-empty": "沒有對話可儲存",
    "confirm-save-before-clear": "對話尚未儲存，是否要先儲存？",
    "system-youtube-transcript-loaded": "已載入 YouTube 字幕",
    "status-youtube-transcript-loaded": "YouTube 字幕已載入",
    "status-youtube-no-transcript": "此影片未提供字幕，已改載入頁面文字",
    "transcript-show": "▶ 顯示字幕",
    "transcript-hide": "▼ 隱藏字幕",
    "dialog-yes": "是",
    "dialog-no": "否",
    "dialog-cancel": "取消",
    "clipboard-tab-label": "剪貼簿內容",
    "empty-tab-label": "empty",
    "new-tab-label": "新對話 {number}",
    "tab-rename-hint": "雙擊可重新命名"
  },
  "zh-CN": {
    "mode-chat": "对话",
    "mode-image": "图片",
    "image-size": "尺寸",
    "image-quality": "质量",
    "image-format": "格式",
    "image-add-reference": "参考图",
    "image-remove-reference": "移除参考图",
    "image-empty": "图片预览",
    "image-generating": "正在生成图片...",
    "image-cancel": "取消",
    "image-download": "下载",
    "image-prompt-placeholder": "描述要生成的图片...",
    "image-generate": "生成",
    "image-no-references": "尚未加入参考图",
    "image-new-tab-label": "图片 {number}",
    "new-tab": "新建标签页",
    "tab-scroll-left": "向左滚动标签页",
    "tab-scroll-right": "向右滚动标签页",
    "image-compose-expand": "展开生成设置与参考图",
    "image-compose-collapse": "收合生成设置与参考图",
    "status-reference-attached": "已加入参考图",
    "error-reference-type": "参考图只支持 PNG、JPEG 或 WebP",
    "error-reference-count": "每个生成标签页最多只能加入 {max} 张参考图",
    "image-retry": "API 过载，{seconds} 秒后重试（第 {attempt}/{total} 次）...",
    "status-image-ready": "图片已生成",
    "status-image-cancelled": "已取消图片生成",
    "error-image-key": "图片生成功能目前只支持 GNAI Key",
    "error-image-prompt": "请输入图片描述",
    "error-image": "图片生成失败：",
    clear: "清除",
    "load-page": "载入网页",
    "load-clipboard": "载入剪贴板",
    "status-ready": "准备就绪",
    "status-loading-page": "载入网页中...",
    "status-loading-clipboard": "载入剪贴板中...",
    "status-page-loaded": "网页已载入",
    "status-clipboard-loaded": "剪贴板已载入",
    "status-loading-models": "载入模型中...",
    "status-models-loaded": "已载入 {count} 个模型",
    "verify-models": "🔍 验证支持模型…",
    "status-fetching-model-docs": "正在读取 GNAI 模型文档...",
    "status-verifying-models": "验证模型中，请稍候...",
    "status-verify-done": "验证完成：{ok} 个可用、{fail} 个不可用",
    "error-verify-models": "模型验证失败：",
    "model-discovery-title": "GNAI 模型验证",
    "model-discovery-source": "模型来源文档 ↗",
    "model-discovery-found": "从文档取得 {count} 个候选模型，正在逐一验证。",
    "model-discovery-done": "验证完成：{ok} 个可用、{fail} 个不可用。",
    "model-discovery-error": "无法完成模型验证：{error}",
    "model-status-pending": "待验证",
    "model-status-available": "可用",
    "model-status-unavailable": "不可用",
    "status-sending": "发送中...",
    "status-error": "发生错误",
    send: "发送",
    "empty-title": "开始对话",
    "empty-text": "可以直接开始对话，或是点击「载入网页」或「载入剪贴板」来载入内容后提问。",
    "input-placeholder": "输入您的问题...",
    "attach-chat-image": "加入图片",
    "remove-chat-image": "移除图片",
    "open-image-tab": "在新标签页打开图片",
    "analysis-mode": "图片分析方式",
    "analysis-combined": "综合分析",
    "analysis-per-image": "逐张分析",
    "attachment-count": "已加入 {count}/{max} 张图片",
    "attachment-expand": "展开图片附件",
    "attachment-collapse": "收合图片附件",
    "error-image-count": "一次最多只能加入 {max} 张图片",
    "batch-results": "逐张分析结果",
    "batch-progress": "已完成 {done}/{total}",
    "batch-cancel": "取消全部",
    "batch-retry": "重试",
    "batch-follow-up": "针对这张追问",
    "batch-compare-all": "比较全部图片",
    "batch-status-pending": "等待中",
    "batch-status-analyzing": "分析中",
    "batch-status-completed": "已完成",
    "batch-status-failed": "失败",
    "batch-status-cancelled": "已取消",
    "batch-interrupted": "分析因 extension 重新加载而中断，请重试",
    "context-single": "当前正在询问：{name}",
    "context-all": "当前正在比较全部图片",
    "vision-model": "图片问答 · o4-mini",
    "status-image-attached": "已加入图片，将使用 o4-mini",
    "status-vision-sending": "正在分析图片...",
    "system-page-loaded": "已载入网页内容",
    "system-clipboard-loaded": "已载入剪贴板内容",
    "quick-question-title": "快速提问",
    "quick-question-help": "说明",
    "qq-help-intro": "点选下方按钮，即可用预设提示词分析已载入的 sighting 或文件：",
    "template-concise": "简洁摘要",
    "template-keydata": "关键数据",
    "template-rootcause": "根因分析",
    "template-risk": "影响与风险",
    "template-action": "后续行动",
    "template-quiz": "出题考我",
    "qq-desc-concise": "用条列快速摘要重点",
    "qq-desc-keydata": "抽出关键规格、参数与数据",
    "qq-desc-rootcause": "分析问题的根本原因",
    "qq-desc-risk": "找出影响范围与潜在风险",
    "qq-desc-action": "整理后续行动与负责事项",
    "qq-desc-quiz": "出题测验，帮助我真正理解",
    "saved-prompts": "常用提示词",
    "saved-prompts-title": "常用提示词管理",
    "manage-prompts": "管理",
    "add-prompt": "新增提示词",
    "empty-prompts": "还没有常用提示词，请在下方新增",
    "empty-saved-prompts": "点击「管理」来新增常用提示词",
    "new-prompt-placeholder": "输入新的常用提示词...",
    "error-api-key-prefix": "API key 格式无效，请输入 pak_ 开头（ExpertGPT）或 GNAI Key",
    "error-no-tab": "找不到当前标签页",
    "error-load-page": "载入网页失败：",
    "error-load-clipboard": "载入剪贴板失败：",
    "error-clipboard-empty": "剪贴板是空的",
    "error-empty-message": "请输入问题",
    "error-vision-key": "图片问答功能目前只支持 GNAI Key",
    "error-chat-image-type": "图片格式必须是 PNG、JPEG、WebP 或 GIF",
    "error-chat-image-size": "图片大小不可超过 20 MB",
    "error-send": "发送失败：",
    "error-model-restricted": "此模型目前受限，请改用可用模型（例如 claude-haiku-4-5）。",
    "error-load-models": "载入模型失败：",
    "error-init": "初始化失败：",
    "lang-set": "语言已切换：{lang}",
    "apikey-modal-title": "设置 API Key",
    "apikey-modal-hint": "请输入 GNAI API Key",
    "apikey-get-gnai": "获取 GNAI API Key ↗",
    "apikey-cancel": "取消",
    "apikey-confirm": "确认",
    "apikey-updated": "API key 已更新",
    "apikey-required": "请先设置 API key",
    "model-restricted-tag": "受限",
    "panel-mode-to-popup": "切换至弹窗",
    "panel-mode-to-sidepanel": "切换至侧栏",
    "panel-mode-disabled-generating": "图片生成期间无法切换显示模式，请等待生成完成或先取消生成。",
    "panel-mode-switched-popup": "已切换至弹窗模式，下次点击图标将开启弹窗",
    "panel-mode-switched-sidepanel": "已切换至侧栏模式",
    "save-session": "💾 储存对话",
    "status-session-saved": "对话已保存",
    "status-session-empty": "没有对话可储存",
    "confirm-save-before-clear": "对话尚未保存，是否要先保存？",
    "system-youtube-transcript-loaded": "已载入 YouTube 字幕",
    "status-youtube-transcript-loaded": "YouTube 字幕已载入",
    "status-youtube-no-transcript": "此影片未提供字幕，已改载入页面文字",
    "transcript-show": "▶ 显示字幕",
    "transcript-hide": "▼ 隐藏字幕",
    "dialog-yes": "是",
    "dialog-no": "否",
    "dialog-cancel": "取消",
    "clipboard-tab-label": "剪贴板内容",
    "empty-tab-label": "empty",
    "new-tab-label": "新对话 {number}",
    "tab-rename-hint": "双击可重新命名",
    "copy": "复制",
    "copied": "已复制"
  },
  en: {
    "mode-chat": "Chat",
    "mode-image": "Image",
    "image-size": "Size",
    "image-quality": "Quality",
    "image-format": "Format",
    "image-add-reference": "References",
    "image-remove-reference": "Remove reference",
    "image-empty": "Image preview",
    "image-generating": "Generating image...",
    "image-cancel": "Cancel",
    "image-download": "Download",
    "image-prompt-placeholder": "Describe the image...",
    "image-generate": "Generate",
    "image-no-references": "No reference images",
    "image-new-tab-label": "Image {number}",
    "new-tab": "New tab",
    "tab-scroll-left": "Scroll tabs left",
    "tab-scroll-right": "Scroll tabs right",
    "image-compose-expand": "Expand generation settings and references",
    "image-compose-collapse": "Collapse generation settings and references",
    "status-reference-attached": "Reference image attached",
    "error-reference-type": "Reference images must be PNG, JPEG, or WebP",
    "error-reference-count": "Each generation tab can contain up to {max} reference images",
    "image-retry": "API overloaded. Retrying in {seconds}s (attempt {attempt}/{total})...",
    "status-image-ready": "Image generated",
    "status-image-cancelled": "Image generation cancelled",
    "error-image-key": "Image generation currently requires a GNAI key",
    "error-image-prompt": "Enter an image prompt",
    "error-image": "Image generation failed: ",
    clear: "Clear",
    "load-page": "Load Page",
    "load-clipboard": "Load Clipboard",
    "status-ready": "Ready",
    "status-loading-page": "Loading page...",
    "status-loading-clipboard": "Loading clipboard...",
    "status-page-loaded": "Page loaded",
    "status-clipboard-loaded": "Clipboard loaded",
    "status-loading-models": "Loading models...",
    "status-models-loaded": "Loaded {count} models",
    "verify-models": "🔍 Verify models…",
    "status-fetching-model-docs": "Reading the GNAI model documentation...",
    "status-verifying-models": "Verifying models, please wait...",
    "status-verify-done": "Verified: {ok} available, {fail} unavailable",
    "error-verify-models": "Model verification failed: ",
    "model-discovery-title": "GNAI model verification",
    "model-discovery-source": "Model source documentation ↗",
    "model-discovery-found": "Found {count} candidate models in the documentation. Verifying each model.",
    "model-discovery-done": "Verification complete: {ok} available, {fail} unavailable.",
    "model-discovery-error": "Unable to complete model verification: {error}",
    "model-status-pending": "Pending",
    "model-status-available": "Available",
    "model-status-unavailable": "Unavailable",
    "status-sending": "Sending...",
    "status-error": "Error occurred",
    send: "Send",
    "empty-title": "Start Conversation",
    "empty-text": "You can start chatting directly, or click \"Load Page\" or \"Load Clipboard\" to load content first.",
    "input-placeholder": "Type your question...",
    "attach-chat-image": "Attach image",
    "remove-chat-image": "Remove image",
    "open-image-tab": "Open image in tab",
    "analysis-mode": "Image analysis mode",
    "analysis-combined": "Combined",
    "analysis-per-image": "Per image",
    "attachment-count": "{count}/{max} images attached",
    "attachment-expand": "Expand image attachments",
    "attachment-collapse": "Collapse image attachments",
    "error-image-count": "You can attach up to {max} images at a time",
    "batch-results": "Per-image results",
    "batch-progress": "Completed {done}/{total}",
    "batch-cancel": "Cancel all",
    "batch-retry": "Retry",
    "batch-follow-up": "Follow up on this image",
    "batch-compare-all": "Compare all images",
    "batch-status-pending": "Pending",
    "batch-status-analyzing": "Analyzing",
    "batch-status-completed": "Completed",
    "batch-status-failed": "Failed",
    "batch-status-cancelled": "Cancelled",
    "batch-interrupted": "Analysis was interrupted by an extension reload. Please retry.",
    "context-single": "Current context: {name}",
    "context-all": "Current context: all images",
    "vision-model": "Image Q&A · o4-mini",
    "status-image-attached": "Image attached; o4-mini will be used",
    "status-vision-sending": "Analyzing image...",
    "system-page-loaded": "Page content loaded",
    "system-clipboard-loaded": "Clipboard content loaded",
    "quick-question-title": "Quick Questions",
    "quick-question-help": "Help",
    "qq-help-intro": "Click a button to analyze the loaded sighting or document with a preset prompt:",
    "template-concise": "Concise Summary",
    "template-keydata": "Key Data",
    "template-rootcause": "Root Cause",
    "template-risk": "Impact & Risk",
    "template-action": "Action Items",
    "template-quiz": "Quiz Me",
    "qq-desc-concise": "Quick bullet-point summary of key points",
    "qq-desc-keydata": "Extract key specs, parameters and data",
    "qq-desc-rootcause": "Analyze the underlying root cause",
    "qq-desc-risk": "Identify impact scope and potential risks",
    "qq-desc-action": "Summarize follow-up actions and owners",
    "qq-desc-quiz": "Quiz me to reinforce understanding",
    "saved-prompts": "Saved Prompts",
    "saved-prompts-title": "Saved Prompts Manager",
    "manage-prompts": "Manage",
    "add-prompt": "Add Prompt",
    "empty-prompts": "No saved prompts yet, add one below",
    "empty-saved-prompts": "Click \"Manage\" to add saved prompts",
    "new-prompt-placeholder": "Enter new prompt...",
    "error-api-key-prefix": "Invalid API key. Enter pak_ key (ExpertGPT) or a GNAI key",
    "error-no-tab": "Cannot find current tab",
    "error-load-page": "Failed to load page: ",
    "error-load-clipboard": "Failed to load clipboard: ",
    "error-clipboard-empty": "Clipboard is empty",
    "error-empty-message": "Please enter a message",
    "error-vision-key": "Image Q&A currently requires a GNAI key",
    "error-chat-image-type": "Image must be PNG, JPEG, WebP, or GIF",
    "error-chat-image-size": "Image must not exceed 20 MB",
    "error-send": "Failed to send: ",
    "error-model-restricted": "This model is currently restricted. Please select an available model (for example, claude-haiku-4-5).",
    "error-load-models": "Failed to load models: ",
    "error-init": "Initialization failed: ",
    "lang-set": "Language set: {lang}",
    "apikey-modal-title": "Set API Key",
    "apikey-modal-hint": "Enter a GNAI API key",
    "apikey-get-gnai": "Get a GNAI API Key ↗",
    "apikey-cancel": "Cancel",
    "apikey-confirm": "Confirm",
    "apikey-updated": "API key updated",
    "apikey-required": "Please set your API key first",
    "model-restricted-tag": "Restricted",
    "panel-mode-to-popup": "Switch to Popup",
    "panel-mode-to-sidepanel": "Switch to Side Panel",
    "panel-mode-disabled-generating": "Display mode cannot be switched while an image is being generated. Wait for it to finish or cancel generation first.",
    "panel-mode-switched-popup": "Switched to popup mode. Next click on the icon will open a popup.",
    "panel-mode-switched-sidepanel": "Switched to side panel mode.",
    "save-session": "💾 Save Session",
    "status-session-saved": "Session saved",
    "status-session-empty": "No conversation to save",
    "confirm-save-before-clear": "Session not saved. Save before clearing?",
    "system-youtube-transcript-loaded": "YouTube transcript loaded",
    "status-youtube-transcript-loaded": "YouTube transcript loaded",
    "status-youtube-no-transcript": "No transcript available; loaded page text instead",
    "transcript-show": "▶ Show Transcript",
    "transcript-hide": "▼ Hide Transcript",
    "dialog-yes": "Yes",
    "dialog-no": "No",
    "dialog-cancel": "Cancel",
    "clipboard-tab-label": "Clipboard",
    "empty-tab-label": "empty",
    "new-tab-label": "New chat {number}",
    "tab-rename-hint": "Double-click to rename",
    "copy": "Copy",
    "copied": "Copied"
  }
};

const IMAGE_TRANSLATIONS = {
  "zh-TW": {
    "mode-chat": "解析", "mode-image": "生成", "load-page": "載入圖片", "load-clipboard": "載入剪貼簿圖片",
    "save-tooltip": "儲存", "mode-chat-tooltip": "解析", "mode-image-tooltip": "生成",
    "empty-title": "載入圖片開始解析", "empty-text": "請使用輸入區的圖片按鈕選擇圖片，再以快速提問分析圖表或投影片。",
    "input-placeholder": "輸入關於圖片的問題...", "vision-model": "圖片解析 · 已選模型",
    "quick-question-title": "圖表與投影片快速解析", "template-concise": "摘要內容", "template-keydata": "擷取數據",
    "template-rootcause": "分析趨勢", "template-risk": "取得洞察", "template-action": "行動建議", "template-quiz": "翻譯內容",
    "qq-desc-concise": "摘要畫面中的主題、結論與重點", "qq-desc-keydata": "擷取圖表數值、標籤、單位與比較結果",
    "qq-desc-rootcause": "說明趨勢、轉折、異常與可能關聯", "qq-desc-risk": "提出有依據的商業或技術洞察",
    "qq-desc-action": "將投影片結論整理成後續行動", "qq-desc-quiz": "辨識文字並翻譯成繁體中文",
    "qq-help-intro": "以下功能會直接分析目前載入的圖片。", "status-loading-clipboard": "正在讀取剪貼簿圖片...",
    "status-clipboard-loaded": "剪貼簿圖片已載入", "status-image-attached": "圖片已載入",
    "error-clipboard-empty": "剪貼簿中沒有支援的圖片", "error-load-clipboard": "載入剪貼簿圖片失敗：",
    "status-loading-dropped-image": "正在載入拖曳圖片...", "error-drop-image": "載入拖曳圖片失敗：",
    "error-api-key-prefix": "請輸入 GNAI API Key；不支援 ExpertGPT pak_ Key", "apikey-modal-hint": "請輸入 GNAI API Key",
    "verify-models": "驗證圖片解析／生成模型...", "status-verifying-models": "正在驗證圖片解析與生成能力...",
    "model-discovery-progress": "已驗證 {done}/{count} 個模型。",
    "model-status-analysis": "可解析圖片", "model-status-generation": "可生成圖片", "model-status-unavailable": "不支援圖片",
    "model-discovery-done": "驗證完成：{ok} 個支援圖片，{fail} 個不支援。", "status-verify-done": "圖片模型驗證完成：{ok} 個支援，{fail} 個不支援",
    "error-empty-message": "請輸入圖片相關問題", "error-no-analysis-image": "請先載入一張圖片", "error-image-key": "圖片功能只支援 GNAI Key",
    "image-quick-title": "快速生成", "image-template-title": "生成模板", "image-quick-help": "快速生成會直接填入提示詞；生成模板會先請你填寫主題與需求。套用後仍可繼續編輯。",
    "image-empty-title": "開始生成圖片", "image-empty-text": "在下方輸入圖片描述；也可以先加入參考圖，再使用快速生成或生成模板。",
    "image-reference-required": "請先加入參考圖；鎖定的功能需要參考圖才能使用。", "image-reference-required-tooltip": "需要先加入參考圖",
    "image-quick-synthesize": "綜整參考圖", "image-quick-beautify": "自動美化構圖", "image-quick-variation": "產生創意變體", "image-quick-intel-dataviz": "產生 Intel 風格的圖表",
    "image-intel-dataviz-instruction": "請參考 intel-style.png，把使用者輸入的參考圖改成 Intel 風格的圖表。",
    "image-quick-scene": "保持主體換場景", "image-quick-style": "套用指定風格", "image-quick-poster": "角色／商品海報", "image-quick-silhouette": "史詩剪影海報",
    "image-saved-prompts": "生成常用提示詞", "image-saved-prompts-title": "生成常用提示詞管理",
    "image-template-hint": "填寫以下內容後，系統會組合成可繼續編輯的圖片提示詞。", "image-template-apply": "套用提示詞",
    "image-field-subject": "主題／角色／商品", "image-field-theme": "海報主題", "image-field-character": "主角／角色", "image-field-elements": "敘事元素",
    "image-field-scene": "新場景", "image-field-action": "動作／狀態", "image-field-style": "視覺風格", "image-field-mood": "氛圍",
    "image-field-headline": "海報標題", "image-field-selling-points": "賣點／關鍵文字"
  },
  "zh-CN": {
    "mode-chat": "解析", "mode-image": "生成", "load-page": "载入图片", "load-clipboard": "载入剪贴板图片",
    "save-tooltip": "保存", "mode-chat-tooltip": "解析", "mode-image-tooltip": "生成",
    "empty-title": "载入图片开始解析", "empty-text": "请使用输入区的图片按钮选择图片，再以快速提问分析图表或幻灯片。",
    "input-placeholder": "输入关于图片的问题...", "vision-model": "图片解析 · 已选模型",
    "quick-question-title": "图表与幻灯片快速解析", "template-concise": "摘要内容", "template-keydata": "提取数据",
    "template-rootcause": "分析趋势", "template-risk": "取得洞察", "template-action": "行动建议", "template-quiz": "翻译内容",
    "status-loading-clipboard": "正在读取剪贴板图片...", "status-clipboard-loaded": "剪贴板图片已载入",
    "error-clipboard-empty": "剪贴板中没有支持的图片", "error-load-clipboard": "载入剪贴板图片失败：",
    "status-loading-dropped-image": "正在载入拖放图片...", "error-drop-image": "载入拖放图片失败：",
    "error-api-key-prefix": "请输入 GNAI API Key；不支持 ExpertGPT pak_ Key", "apikey-modal-hint": "请输入 GNAI API Key",
    "model-discovery-progress": "已验证 {done}/{count} 个模型。",
    "verify-models": "验证图片解析／生成模型...", "model-status-analysis": "可解析图片", "model-status-generation": "可生成图片",
    "model-status-unavailable": "不支持图片", "error-no-analysis-image": "请先载入一张图片",
    "image-quick-title": "快速生成", "image-template-title": "生成模板", "image-quick-help": "快速生成会直接填入提示词；生成模板会先请你填写主题与需求。应用后仍可继续编辑。",
    "image-empty-title": "开始生成图片", "image-empty-text": "在下方输入图片描述；也可以先加入参考图，再使用快速生成或生成模板。",
    "image-reference-required": "请先加入参考图；锁定的功能需要参考图才能使用。", "image-reference-required-tooltip": "需要先加入参考图",
    "image-quick-synthesize": "综合参考图", "image-quick-beautify": "自动美化构图", "image-quick-variation": "生成创意变体", "image-quick-intel-dataviz": "生成 Intel 风格图表",
    "image-intel-dataviz-instruction": "请参考 intel-style.png，将用户输入的参考图改成 Intel 风格的图表。",
    "image-quick-scene": "保持主体换场景", "image-quick-style": "应用指定风格", "image-quick-poster": "角色／商品海报", "image-quick-silhouette": "史诗剪影海报",
    "image-saved-prompts": "生成常用提示词", "image-saved-prompts-title": "生成常用提示词管理",
    "image-template-hint": "填写以下内容后，系统会组合成可继续编辑的图片提示词。", "image-template-apply": "应用提示词",
    "image-field-subject": "主题／角色／商品", "image-field-theme": "海报主题", "image-field-character": "主角／角色", "image-field-elements": "叙事元素",
    "image-field-scene": "新场景", "image-field-action": "动作／状态", "image-field-style": "视觉风格", "image-field-mood": "氛围",
    "image-field-headline": "海报标题", "image-field-selling-points": "卖点／关键文字"
  },
  en: {
    "mode-chat": "Analyze", "mode-image": "Generate", "load-page": "Load image", "load-clipboard": "Load clipboard image",
    "save-tooltip": "Save", "mode-chat-tooltip": "Analyze", "mode-image-tooltip": "Generate",
    "empty-title": "Load an image to analyze", "empty-text": "Use the image button in the composer, then analyze a chart or slide.",
    "input-placeholder": "Ask a question about the image...", "vision-model": "Image analysis · selected model",
    "quick-question-title": "Chart and slide analysis", "template-concise": "Summarize", "template-keydata": "Extract data",
    "template-rootcause": "Analyze trends", "template-risk": "Get insights", "template-action": "Action items", "template-quiz": "Translate",
    "status-loading-clipboard": "Reading clipboard image...", "status-clipboard-loaded": "Clipboard image loaded",
    "error-clipboard-empty": "The clipboard has no supported image", "error-load-clipboard": "Failed to load clipboard image: ",
    "status-loading-dropped-image": "Loading dropped image...", "error-drop-image": "Failed to load dropped image: ",
    "error-api-key-prefix": "Enter a GNAI API key; ExpertGPT pak_ keys are not supported", "apikey-modal-hint": "Enter a GNAI API key",
    "model-discovery-progress": "Verified {done}/{count} models.",
    "verify-models": "Verify image analysis/generation models...", "model-status-analysis": "Can analyze images", "model-status-generation": "Can generate images",
    "model-status-unavailable": "No image support", "error-no-analysis-image": "Load an image first",
    "image-quick-title": "Quick generation", "image-template-title": "Generation templates", "image-quick-help": "Quick generation inserts a prompt immediately. Generation templates ask for your subject and requirements first. You can edit the result before generating.",
    "image-empty-title": "Start generating an image", "image-empty-text": "Describe an image below, or add a reference image and use Quick generation or a Generation template.",
    "image-reference-required": "Add a reference image first. Locked features require a reference image.", "image-reference-required-tooltip": "Add a reference image first",
    "image-quick-synthesize": "Synthesize references", "image-quick-beautify": "Polish composition", "image-quick-variation": "Create a variation", "image-quick-intel-dataviz": "Create an Intel-style chart",
    "image-intel-dataviz-instruction": "Use intel-style.png as the visual reference and transform the user-provided reference images into an Intel-style chart.",
    "image-quick-scene": "Keep subject, change scene", "image-quick-style": "Apply a visual style", "image-quick-poster": "Character / product poster", "image-quick-silhouette": "Epic silhouette poster",
    "image-saved-prompts": "Saved generation prompts", "image-saved-prompts-title": "Manage generation prompts",
    "image-template-hint": "Complete these fields to build an image prompt that you can continue editing.", "image-template-apply": "Apply prompt",
    "image-field-subject": "Subject / character / product", "image-field-theme": "Poster theme", "image-field-character": "Main character", "image-field-elements": "Narrative elements",
    "image-field-scene": "New scene", "image-field-action": "Action / state", "image-field-style": "Visual style", "image-field-mood": "Mood",
    "image-field-headline": "Poster headline", "image-field-selling-points": "Selling points / key text"
  }
};
Object.entries(IMAGE_TRANSLATIONS).forEach(([language, values]) => Object.assign(TRANSLATIONS[language], values));

const UI = {
  headerTitle: document.getElementById("headerTitle"),
  panelModeBtn: document.getElementById("panelModeBtn"),
  clearBtn: document.getElementById("clearBtn"),
  saveSessionBtn: document.getElementById("saveSessionBtn"),
  languageSelect: document.getElementById("languageSelect"),
  statusIndicator: document.getElementById("statusIndicator"),
  statusText: document.getElementById("statusText"),
  budgetText: document.getElementById("budgetText"),
  messagesContainer: document.getElementById("messagesContainer"),
  messageInput: document.getElementById("messageInput"),
  sendBtn: document.getElementById("sendBtn"),
  attachChatImageBtn: document.getElementById("attachChatImageBtn"),
  chatImageInput: document.getElementById("chatImageInput"),
  chatAttachment: document.getElementById("chatAttachment"),
  chatAttachmentSummary: document.getElementById("chatAttachmentSummary"),
  chatAttachmentToggle: document.getElementById("chatAttachmentToggle"),
  chatAttachmentList: document.getElementById("chatAttachmentList"),
  chatAnalysisMode: document.getElementById("chatAnalysisMode"),
  combinedAnalysisBtn: document.getElementById("combinedAnalysisBtn"),
  perImageAnalysisBtn: document.getElementById("perImageAnalysisBtn"),
  chatModeBtn: document.getElementById("chatModeBtn"),
  imageModeBtn: document.getElementById("imageModeBtn"),
  chatPanel: document.getElementById("chatPanel"),
  imagePanel: document.getElementById("imagePanel"),
  imageTabBar: document.getElementById("imageTabBar"),
  imagePromptTools: document.getElementById("imagePromptTools"),
  imageCompose: document.querySelector(".image-compose"),
  imageComposeToggle: document.getElementById("imageComposeToggle"),
  imageStage: document.getElementById("imageStage"),
  imageSize: document.getElementById("imageSize"),
  imageQuality: document.getElementById("imageQuality"),
  imageFormat: document.getElementById("imageFormat"),
  addReferenceBtn: document.getElementById("addReferenceBtn"),
  referenceInput: document.getElementById("referenceInput"),
  referenceList: document.getElementById("referenceList"),
  imageEmpty: document.getElementById("imageEmpty"),
  imageProgress: document.getElementById("imageProgress"),
  imageProgressText: document.getElementById("imageProgressText"),
  cancelImageBtn: document.getElementById("cancelImageBtn"),
  imageResult: document.getElementById("imageResult"),
  imagePrompt: document.getElementById("imagePrompt"),
  generateImageBtn: document.getElementById("generateImageBtn"),
  modelSelect: document.getElementById("modelSelect"),
  imageModelSelect: document.getElementById("imageModelSelect"),
  modelDiscoveryModal: document.getElementById("modelDiscoveryModal"),
  closeModelDiscoveryModal: document.getElementById("closeModelDiscoveryModal"),
  modelDiscoverySummary: document.getElementById("modelDiscoverySummary"),
  modelDiscoveryList: document.getElementById("modelDiscoveryList"),
  savedPromptsModal: document.getElementById("savedPromptsModal"),
  savedPromptsList: document.getElementById("savedPromptsList"),
  closeSavedPromptsModal: document.getElementById("closeSavedPromptsModal"),
  newPromptInput: document.getElementById("newPromptInput"),
  addPromptBtn: document.getElementById("addPromptBtn"),
  savedPromptsModalTitle: document.querySelector("#savedPromptsModal .modal-header h3"),
  imageTemplateModal: document.getElementById("imageTemplateModal"),
  imageTemplateTitle: document.getElementById("imageTemplateTitle"),
  imageTemplateHint: document.getElementById("imageTemplateHint"),
  imageTemplateForm: document.getElementById("imageTemplateForm"),
  imageTemplateFields: document.getElementById("imageTemplateFields"),
  closeImageTemplateModal: document.getElementById("closeImageTemplateModal"),
  cancelImageTemplateBtn: document.getElementById("cancelImageTemplateBtn"),
  applyImageTemplateBtn: document.getElementById("applyImageTemplateBtn"),
  apiKeyModal: document.getElementById("apiKeyModal"),
  apiKeyInput: document.getElementById("apiKeyInput"),
  apiKeyConfirmBtn: document.getElementById("apiKeyConfirmBtn"),
  apiKeyCancelBtn: document.getElementById("apiKeyCancelBtn"),
  closeApiKeyModal: document.getElementById("closeApiKeyModal"),
  confirmSaveModal: document.getElementById("confirmSaveModal"),
  confirmSaveYesBtn: document.getElementById("confirmSaveYesBtn"),
  confirmSaveNoBtn: document.getElementById("confirmSaveNoBtn"),
  confirmSaveCancelBtn: document.getElementById("confirmSaveCancelBtn")
};

// When running as a popup window, background embeds the source browser windowId
// in the URL (?srcWindowId=N) so we can call sidePanel.open() synchronously
// inside the user-gesture handler (before any await breaks the gesture context).
const POPUP_SRC_WINDOW_ID = (() => {
  const id = parseInt(new URLSearchParams(window.location.search).get("srcWindowId"), 10);
  return isNaN(id) ? null : id;
})();

let tabs = [
  { id: 0, messages: [], pageContent: null, selectedModel: DEFAULT_MODEL, sessionSaved: false }
];

let state = {
  currentLanguage: "zh-TW",
  selectedApiKey: "",
  selectedModel: DEFAULT_MODEL,
  openaiModels: [],
  anthropicModels: [],
  models: [],
  modelQuotas: {},
  verifiedModels: null,
  generationModels: [...DEFAULT_GENERATION_MODELS],
  selectedGenerationModel: DEFAULT_GENERATION_MODEL,
  messages: [],
  pageContent: null,
  savedPrompts: [],
  imageSavedPrompts: [],
  panelMode: "sidepanel",
  sessionSaved: false,
  activeTabId: 0,
  nextTabId: 1,
  activeImageTabId: 0,
  nextImageTabId: 1,
};

function createImageTab(id, saved = {}) {
  return {
    id,
    prompt: typeof saved.prompt === "string" ? saved.prompt : "",
    size: saved.size || "1024x1024",
    quality: saved.quality || "medium",
    format: saved.format || "png",
    composeCollapsed: Boolean(saved.composeCollapsed),
    customLabel: saved.customLabel || null,
    autoLabel: saved.autoLabel || null,
    savedReferenceIds: Array.isArray(saved.referenceIds) ? saved.referenceIds.filter(Boolean) : [],
    references: [],
    turns: Array.isArray(saved.turns) ? saved.turns.map((turn) => ({
      id: turn.id || createChatImageId(),
      prompt: typeof turn.prompt === "string" ? turn.prompt : "",
      referenceIds: Array.isArray(turn.referenceIds) ? turn.referenceIds.filter(Boolean) : [],
      resultId: turn.resultId || null,
      size: turn.size || "1024x1024",
      quality: turn.quality || "medium",
      format: turn.format || "png",
      mimeType: turn.mimeType || (turn.format === "jpeg" ? "image/jpeg" : "image/png"),
      revisedPrompt: turn.revisedPrompt || "",
      result: null
    })) : [],
    controller: null,
    busy: false,
    progressText: ""
  };
}

let imageTabs = [createImageTab(0)];

const imageState = {
  mode: "chat"
};

function getActiveImageTab() {
  return imageTabs.find((tab) => tab.id === state.activeImageTabId) || imageTabs[0] || null;
}

for (const property of ["references", "turns", "controller", "busy"]) {
  Object.defineProperty(imageState, property, {
    get() { return getActiveImageTab()?.[property] ?? (["references", "turns"].includes(property) ? [] : property === "busy" ? false : null); },
    set(value) {
      const tab = getActiveImageTab();
      if (tab) tab[property] = value;
    }
  });
}
const modeAnimationTimers = new WeakMap();
const batchRuns = new Map();
let imagePromptSaveTimer = 0;

function setupTooltips() {
  const tooltip = document.createElement("div");
  tooltip.id = "appTooltip";
  tooltip.className = "app-tooltip";
  tooltip.setAttribute("role", "tooltip");
  document.body.appendChild(tooltip);

  const VIEWPORT_GAP = 8;
  const TARGET_GAP = 10;
  // Leave enough room below the pointer hotspot for enlarged OS cursors.
  const POINTER_CLEARANCE = 64;
  const SHOW_DELAY_MS = 280;
  let activeTarget = null;
  let activeKeepClearOfPointer = false;
  let showTimer = 0;
  let positionFrame = 0;
  let pointer = null;
  let describedByBeforeTooltip = null;

  function importTitle(element) {
    if (!(element instanceof Element) || !element.hasAttribute("title")) return;
    const text = element.getAttribute("title") || "";
    if (text) element.dataset.tooltip = text;
    else delete element.dataset.tooltip;
    element.removeAttribute("title");
  }

  function importTitles(root) {
    if (!(root instanceof Element)) return;
    importTitle(root);
    root.querySelectorAll("[title]").forEach(importTitle);
  }

  function positionTooltip(target, keepClearOfPointer) {
    const targetRect = target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const maxLeft = Math.max(VIEWPORT_GAP, window.innerWidth - tooltipRect.width - VIEWPORT_GAP);
    const centeredLeft = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
    let left = Math.min(Math.max(centeredLeft, VIEWPORT_GAP), maxLeft);
    let top = targetRect.top - tooltipRect.height - TARGET_GAP;

    if (top < VIEWPORT_GAP) {
      const pointerSafeTop = keepClearOfPointer && pointer
        ? pointer.y + POINTER_CLEARANCE
        : targetRect.bottom + TARGET_GAP;
      const belowTop = Math.max(targetRect.bottom + TARGET_GAP, pointerSafeTop);

      if (belowTop + tooltipRect.height <= window.innerHeight - VIEWPORT_GAP) {
        top = belowTop;
      } else {
        const centeredTop = Math.min(
          Math.max(targetRect.top + (targetRect.height - tooltipRect.height) / 2, VIEWPORT_GAP),
          Math.max(VIEWPORT_GAP, window.innerHeight - tooltipRect.height - VIEWPORT_GAP)
        );
        const leftOfTarget = targetRect.left - tooltipRect.width - TARGET_GAP;
        const rightOfTarget = targetRect.right + TARGET_GAP;

        if (leftOfTarget >= VIEWPORT_GAP) {
          left = leftOfTarget;
          top = centeredTop;
        } else if (rightOfTarget + tooltipRect.width <= window.innerWidth - VIEWPORT_GAP) {
          left = rightOfTarget;
          top = centeredTop;
        } else {
          top = Math.min(
            Math.max(belowTop, VIEWPORT_GAP),
            Math.max(VIEWPORT_GAP, window.innerHeight - tooltipRect.height - VIEWPORT_GAP)
          );
        }
      }
    }

    tooltip.style.left = `${Math.round(left)}px`;
    tooltip.style.top = `${Math.round(top)}px`;
  }

  function hideTooltip(target = activeTarget) {
    clearTimeout(showTimer);
    showTimer = 0;
    tooltip.classList.remove("is-visible");
    if (target && target === activeTarget) {
      if (describedByBeforeTooltip === null) target.removeAttribute("aria-describedby");
      else target.setAttribute("aria-describedby", describedByBeforeTooltip);
      activeTarget = null;
      activeKeepClearOfPointer = false;
      describedByBeforeTooltip = null;
    }
  }

  function showTooltip(target, keepClearOfPointer) {
    const text = target?.dataset.tooltip?.trim();
    if (!text) return;
    if (activeTarget && activeTarget !== target) hideTooltip();
    if (activeTarget === target) {
      activeKeepClearOfPointer = keepClearOfPointer;
      tooltip.textContent = text;
      positionTooltip(target, keepClearOfPointer);
      tooltip.classList.add("is-visible");
      return;
    }
    activeTarget = target;
    activeKeepClearOfPointer = keepClearOfPointer;
    tooltip.textContent = text;
    describedByBeforeTooltip = target.getAttribute("aria-describedby");
    const describedBy = describedByBeforeTooltip
      ? `${describedByBeforeTooltip} ${tooltip.id}`
      : tooltip.id;
    target.setAttribute("aria-describedby", describedBy);
    positionTooltip(target, keepClearOfPointer);
    tooltip.classList.add("is-visible");
  }

  function queueTooltip(target, keepClearOfPointer) {
    clearTimeout(showTimer);
    showTimer = window.setTimeout(() => showTooltip(target, keepClearOfPointer), SHOW_DELAY_MS);
  }

  importTitles(document.body);
  new MutationObserver((mutations) => {
    let activeTitleChanged = false;
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes") {
        activeTitleChanged ||= mutation.target === activeTarget;
        importTitle(mutation.target);
      } else {
        mutation.addedNodes.forEach(importTitles);
      }
    });

    // Only refresh a visible tooltip when that target's title changed. Updating
    // on every child mutation would observe tooltip.textContent itself and
    // create a self-triggering MutationObserver loop.
    if (activeTarget && activeTitleChanged) {
      const text = activeTarget.dataset.tooltip?.trim();
      if (!text) hideTooltip();
      else {
        if (tooltip.textContent !== text) tooltip.textContent = text;
        positionTooltip(activeTarget, activeKeepClearOfPointer);
      }
    }
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["title"] });

  document.addEventListener("pointerover", (event) => {
    const target = event.target.closest?.("[data-tooltip]");
    if (!target || target.contains(event.relatedTarget)) return;
    pointer = { x: event.clientX, y: event.clientY };
    queueTooltip(target, true);
  });
  document.addEventListener("pointermove", (event) => {
    pointer = { x: event.clientX, y: event.clientY };
    if (activeTarget?.matches(":hover") && !positionFrame) {
      positionFrame = requestAnimationFrame(() => {
        positionFrame = 0;
        if (activeTarget?.matches(":hover")) positionTooltip(activeTarget, true);
      });
    }
  });
  document.addEventListener("pointerout", (event) => {
    const target = event.target.closest?.("[data-tooltip]");
    if (!target || target.contains(event.relatedTarget)) return;
    if (activeTarget === target || !activeTarget) hideTooltip(target);
  });
  document.addEventListener("focusin", (event) => {
    const target = event.target.closest?.("[data-tooltip]");
    if (target) queueTooltip(target, false);
  });
  document.addEventListener("focusout", (event) => {
    const target = event.target.closest?.("[data-tooltip]");
    if (target && !target.contains(event.relatedTarget)) hideTooltip(target);
  });
  window.addEventListener("resize", () => activeTarget && positionTooltip(activeTarget, activeKeepClearOfPointer));
  document.addEventListener("scroll", () => activeTarget && positionTooltip(activeTarget, activeKeepClearOfPointer), true);
}

// Persisting Base64 strings in chrome.storage.local would make tab/session
// storage grow very quickly. The lightweight message metadata stays there while image data
// is kept in IndexedDB so multi-image conversations survive panel reloads.
const chatImagesByTab = new Map();
const chatImageAssets = new Map();
const CHAT_IMAGE_DB_NAME = "image-chatter-assets";
const CHAT_IMAGE_STORE_NAME = "chat-images";
let chatImageDbPromise = null;

function openChatImageDb() {
  if (!chatImageDbPromise) {
    chatImageDbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(CHAT_IMAGE_DB_NAME, 1);
      request.addEventListener("upgradeneeded", () => {
        if (!request.result.objectStoreNames.contains(CHAT_IMAGE_STORE_NAME)) {
          request.result.createObjectStore(CHAT_IMAGE_STORE_NAME, { keyPath: "id" });
        }
      });
      request.addEventListener("success", () => resolve(request.result), { once: true });
      request.addEventListener("error", () => reject(request.error || new Error("Unable to open image storage")), { once: true });
    });
  }
  return chatImageDbPromise;
}

async function storeChatImageAsset(image) {
  chatImageAssets.set(image.id, image);
  try {
    const db = await openChatImageDb();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(CHAT_IMAGE_STORE_NAME, "readwrite");
      transaction.objectStore(CHAT_IMAGE_STORE_NAME).put(image);
      transaction.addEventListener("complete", resolve, { once: true });
      transaction.addEventListener("error", () => reject(transaction.error), { once: true });
      transaction.addEventListener("abort", () => reject(transaction.error), { once: true });
    });
  } catch (error) {
    console.warn("[Image Chatter] Unable to persist chat image:", error);
  }
}

async function loadChatImageAsset(id) {
  if (!id) return null;
  if (chatImageAssets.has(id)) return chatImageAssets.get(id);
  try {
    const db = await openChatImageDb();
    const image = await new Promise((resolve, reject) => {
      const request = db.transaction(CHAT_IMAGE_STORE_NAME, "readonly")
        .objectStore(CHAT_IMAGE_STORE_NAME).get(id);
      request.addEventListener("success", () => resolve(request.result || null), { once: true });
      request.addEventListener("error", () => reject(request.error), { once: true });
    });
    if (image) chatImageAssets.set(id, image);
    return image;
  } catch (error) {
    console.warn("[Image Chatter] Unable to restore chat image:", error);
    return null;
  }
}

async function deleteChatImageAsset(id) {
  if (!id) return;
  chatImageAssets.delete(id);
  try {
    const db = await openChatImageDb();
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(CHAT_IMAGE_STORE_NAME, "readwrite");
      transaction.objectStore(CHAT_IMAGE_STORE_NAME).delete(id);
      transaction.addEventListener("complete", resolve, { once: true });
      transaction.addEventListener("error", () => reject(transaction.error), { once: true });
      transaction.addEventListener("abort", () => reject(transaction.error), { once: true });
    });
  } catch (error) {
    console.warn("[Image Chatter] Unable to remove stored chat image:", error);
  }
}

function createChatImageId() {
  return globalThis.crypto?.randomUUID?.()
    || `chat-image-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeAnalysisMode(mode) {
  return mode === "per-image" ? "per-image" : DEFAULT_CHAT_ANALYSIS_MODE;
}

function createChatImageGroup(images = [], analysisMode = DEFAULT_CHAT_ANALYSIS_MODE) {
  return {
    images: [...images],
    analysisMode: normalizeAnalysisMode(analysisMode),
    contextStartIndex: null,
    batchId: null,
    initialPrompt: "",
    initialMode: null,
    focusImageId: null,
    scopeStartIndex: null,
    collapsed: false
  };
}

function collectMessageImageIds(message) {
  const ids = [];
  if (message?.imageId) ids.push(message.imageId);
  if (Array.isArray(message?.imageIds)) ids.push(...message.imageIds);
  if (Array.isArray(message?.results)) {
    message.results.forEach((result) => {
      if (result?.imageId) ids.push(result.imageId);
    });
  }
  return [...new Set(ids.filter(Boolean))];
}

function serializeChatImageGroup(group) {
  if (!group?.images?.length) return null;
  return {
    imageIds: group.images.map((image) => image.id),
    analysisMode: normalizeAnalysisMode(group.analysisMode),
    contextStartIndex: Number.isInteger(group.contextStartIndex) ? group.contextStartIndex : null,
    batchId: group.batchId || null,
    initialPrompt: group.initialPrompt || "",
    initialMode: group.initialMode || null,
    focusImageId: group.focusImageId || null,
    scopeStartIndex: Number.isInteger(group.scopeStartIndex) ? group.scopeStartIndex : null,
    collapsed: Boolean(group.collapsed)
  };
}

function inferChatImageGroupFromMessages(messages) {
  const list = Array.isArray(messages) ? messages : [];
  let userIndex = -1;
  for (let index = list.length - 1; index >= 0; index--) {
    if (list[index]?.role === "user" && collectMessageImageIds(list[index]).length) {
      userIndex = index;
      break;
    }
  }
  if (userIndex < 0) return null;

  const userMessage = list[userIndex];
  const images = collectMessageImageIds(userMessage)
    .map((id) => chatImageAssets.get(id))
    .filter(Boolean);
  if (!images.length) return null;

  const mode = userMessage.analysisMode === "per-image" ? "per-image" : "combined";
  const group = createChatImageGroup(images, mode);
  group.contextStartIndex = userIndex;
  group.initialPrompt = userMessage.content || "";
  group.initialMode = mode;
  group.batchId = userMessage.batchId || null;
  if (group.batchId) {
    const resultIndex = list.findIndex((message, index) => (
      index > userIndex
      && message.batchId === group.batchId
      && message.analysisMode === "per-image-results"
    ));
    group.scopeStartIndex = resultIndex >= 0 ? resultIndex + 1 : userIndex + 1;
  } else {
    group.scopeStartIndex = userIndex;
  }
  return group;
}

function normalizeInterruptedBatchMessages(messages) {
  (messages || []).forEach((message) => {
    if (message?.analysisMode !== "per-image-results" || !Array.isArray(message.results)) return;
    message.results.forEach((result) => {
      if (!["pending", "analyzing"].includes(result.status)) return;
      result.status = "failed";
      result.error = t("batch-interrupted");
    });
    message.content = formatBatchResultsContent(message.results);
  });
}

async function hydrateChatImagesForTabs() {
  const imageIds = new Set();
  tabs.forEach((tab) => {
    normalizeInterruptedBatchMessages(tab.messages);
    const activeIds = Array.isArray(tab.activeImageGroup?.imageIds)
      ? tab.activeImageGroup.imageIds
      : tab.activeImageId ? [tab.activeImageId] : [];
    activeIds.forEach((id) => imageIds.add(id));
    (tab.messages || []).forEach((message) => {
      collectMessageImageIds(message).forEach((id) => imageIds.add(id));
    });
  });
  await Promise.all([...imageIds].map(loadChatImageAsset));

  chatImagesByTab.clear();
  tabs.forEach((tab) => {
    const savedGroup = tab.activeImageGroup || null;
    let activeIds = Array.isArray(savedGroup?.imageIds)
      ? savedGroup.imageIds
      : tab.activeImageId ? [tab.activeImageId] : [];
    const savedImagesAreReferenced = (tab.messages || []).some((message) => (
      collectMessageImageIds(message).some((id) => activeIds.includes(id))
    ));
    if (activeIds.length && !savedImagesAreReferenced && savedGroup?.contextStartIndex != null) {
      // A request may have been interrupted after hiding the composer attachment
      // but before its user message was committed. Restore it as a pending attachment.
      savedGroup.contextStartIndex = null;
    }
    const images = activeIds.map((id) => chatImageAssets.get(id)).filter(Boolean);
    if (!images.length) {
      const inferredGroup = inferChatImageGroupFromMessages(tab.messages);
      if (inferredGroup) chatImagesByTab.set(tab.id, inferredGroup);
      return;
    }
    const fallbackIndex = (tab.messages || []).findIndex((message) => (
      collectMessageImageIds(message).some((id) => activeIds.includes(id))
    ));
    chatImagesByTab.set(tab.id, {
      ...createChatImageGroup(images, savedGroup?.analysisMode),
      contextStartIndex: Number.isInteger(savedGroup?.contextStartIndex)
        ? savedGroup.contextStartIndex
        : fallbackIndex >= 0 ? fallbackIndex : null,
      batchId: savedGroup?.batchId || null,
      initialPrompt: savedGroup?.initialPrompt || "",
      initialMode: savedGroup?.initialMode || null,
      focusImageId: savedGroup?.focusImageId || null,
      scopeStartIndex: Number.isInteger(savedGroup?.scopeStartIndex)
        ? savedGroup.scopeStartIndex
        : null,
      collapsed: Boolean(savedGroup?.collapsed)
    });
  });
}

async function dataUrlToFile(asset) {
  const response = await fetch(asset.dataUrl);
  const blob = await response.blob();
  return new File([blob], asset.name || "image", {
    type: asset.type || blob.type,
    lastModified: Date.now()
  });
}

async function hydrateImageGenerationTabs() {
  const ids = new Set();
  imageTabs.forEach((tab) => {
    tab.savedReferenceIds.forEach((id) => ids.add(id));
    tab.turns.forEach((turn) => {
      turn.referenceIds.forEach((id) => ids.add(id));
      if (turn.resultId) ids.add(turn.resultId);
    });
  });
  await Promise.all([...ids].map(loadChatImageAsset));

  await Promise.all(imageTabs.map(async (tab) => {
    tab.references = (await Promise.all(tab.savedReferenceIds.map(async (id) => {
      const asset = chatImageAssets.get(id);
      if (!asset) return null;
      const file = await dataUrlToFile(asset);
      return { id, file, url: URL.createObjectURL(file) };
    }))).filter(Boolean);
    await Promise.all(tab.turns.map(async (turn) => {
      const asset = chatImageAssets.get(turn.resultId);
      if (!asset) return;
      const blob = await (await fetch(asset.dataUrl)).blob();
      turn.result = {
        id: turn.resultId,
        blob,
        mimeType: asset.type || blob.type,
        format: turn.format,
        revisedPrompt: turn.revisedPrompt,
        url: URL.createObjectURL(blob)
      };
    }));
  }));
}

const modelDiscoveryState = {
  models: [],
  details: [],
  phase: "idle",
  error: "",
  verificationId: ""
};

function t(key, params = {}) {
  let text = TRANSLATIONS[state.currentLanguage]?.[key] || key;
  Object.keys(params).forEach((paramKey) => {
    text = text.replace(`{${paramKey}}`, params[paramKey]);
  });
  return text;
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtmlAttribute(text) {
  return escapeHtml(text).replace(/"/g, "&quot;");
}

function renderMarkdown(md) {
  let html = md || "";

  // 1. Fenced code blocks — escape HTML inside so code shows as-is
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_m, _lang, code) => {
    const esc = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `<pre><code>${esc}</code></pre>`;
  });

  // 2. Inline code — escape HTML inside
  html = html.replace(/`([^`]+)`/g, (_m, code) => {
    const esc = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `<code>${esc}</code>`;
  });

  // 3. Bold / italic
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");

  // 4. Headings (# treated same as ##)
  html = html.replace(/^#{1,2} (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");

  // 5. Ordered list items (mark with attribute to distinguish from ul)
  html = html.replace(/^\d+\. (.+)$/gm, "<li data-ol>$1</li>");

  // 6. Unordered list items
  html = html.replace(/^[-*] (.+)$/gm, "<li>$1</li>");

  // Group consecutive ordered-list items
  html = html.replace(/(<li data-ol>[\s\S]*?<\/li>\n*)+/g,
    (m) => `<ol>${m.replace(/ data-ol/g, "")}</ol>`);

  // Group consecutive unordered-list items
  html = html.replace(/(<li>[\s\S]*?<\/li>\n*)+/g, (m) => `<ul>${m}</ul>`);

  // 7. Tables
  html = html.replace(/((?:^\|[^\n]*(?:\n|$))+)/gm, (block) => {
    const lines = block.trim().split("\n").filter((l) => l.trim().startsWith("|"));
    if (lines.length < 3) return block;
    const isSep = (l) => /^\|[\s\-:|]+\|/.test(l.trim());
    if (!isSep(lines[1])) return block;
    const cells = (l) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
    const headers = cells(lines[0]);
    const rows = lines.slice(2).filter((l) => l.trim()).map(cells);
    let tbl = '<div class="table-wrapper"><table><thead><tr>';
    headers.forEach((h) => { tbl += `<th>${h}</th>`; });
    tbl += "</tr></thead><tbody>";
    rows.forEach((r) => {
      tbl += "<tr>";
      r.forEach((c) => { tbl += `<td>${c}</td>`; });
      tbl += "</tr>";
    });
    tbl += "</tbody></table></div>";
    return tbl;
  });

  // 8. Collapse all newlines → single <br>, no paragraph structure
  html = html.replace(/\n+/g, "\n");
  html = html.replace(/\n/g, "<br>");
  // Remove <br> directly adjacent to block elements (they space themselves via CSS margin)
  html = html.replace(/(<br>)+(<\/?(h[23]|li|[uo]l|pre|div)[^>]*>)/gi, "$2");
  html = html.replace(/(<\/?(h[23]|li|[uo]l|pre|div)[^>]*>)(<br>)+/gi, "$1");

  return html;
}

function updateUILanguage() {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    const key = element.getAttribute("data-i18n");
    if (!key) return;
    const text = t(key);

    if (key === "empty-text") {
      element.innerHTML = text.replace(/\n/g, "<br>");
      return;
    }

    if (element.tagName === "PRE") {
      element.textContent = text;
      return;
    }

    element.textContent = text;
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    const key = element.getAttribute("data-i18n-placeholder");
    if (!key) return;
    element.placeholder = t(key);
  });

  document.querySelectorAll("[data-i18n-title]").forEach((element) => {
    const key = element.getAttribute("data-i18n-title");
    if (!key) return;
    element.title = t(key);
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    const key = element.getAttribute("data-i18n-aria-label");
    if (!key) return;
    element.setAttribute("aria-label", t(key));
  });

  UI.languageSelect.value = state.currentLanguage;
  updatePanelModeBtn();

  // Re-render the model selector so dynamically built options (e.g. the
  // "verify models" action) pick up the newly selected language.
  renderModelOptions();
  renderReferenceImages();
  renderImageComposeState();
  renderImageTabBar();
  renderChatImageAttachment();
  renderMessages();
  if (state.pageContent) {
    showPageInfo(
      state.pageContent.title,
      state.pageContent.url,
      state.pageContent.isYouTubeTranscript ? state.pageContent.text : null
    );
  }
  renderModelDiscovery();
  if (!imageState.busy) UI.imageProgressText.textContent = t("image-generating");

  // Re-render the tab bar so dynamically built labels/tooltips (e.g. the
  // "double-click to rename" hint) pick up the newly selected language.
  renderTabBar();
}

function setStatus(type, text) {
  UI.statusIndicator.className = `status-indicator ${type}`;
  UI.statusText.textContent = text;
}

function budgetParseWindow(limit) {
  const m = limit.match(/per\s+(\d+)?\s*(second|minute|hour|day)/i);
  if (!m) return limit;
  const n = m[1] ? parseInt(m[1]) : 1;
  const abbr = { second: "s", minute: "m", hour: "h", day: "d" };
  return `${n}${abbr[m[2].toLowerCase()]}`;
}

function budgetFormatRemaining(seconds) {
  seconds = Math.floor(seconds);
  if (seconds <= 0) return "0s";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (d > 0) return `${d}d${h}h`;
  if (h > 0) return `${h}h${String(m).padStart(2, "0")}m`;
  if (m > 0) return `${m}m${String(s).padStart(2, "0")}s`;
  return `${s}s`;
}

function buildBudgetTooltip(rateLimits) {
  const now = Date.now() / 1000;
  const contexts = [...new Set(rateLimits.map(r => r.context))];
  const lines = [];
  for (const ctx of contexts) {
    const group = rateLimits.filter(r => r.context === ctx);
    if (!group.length) continue;
    if (ctx !== "default") lines.push(`[${ctx}]`);
    for (const r of group) {
      const win = budgetParseWindow(r.limit);
      const label = `${r.kind} (${win})`;
      const value = r.kind === "cost"
        ? `$${r.used.toFixed(2)} / $${r.max}`
        : `${r.used} / ${r.max}`;
      const reset = r.reset ? `  (resets in ${budgetFormatRemaining(r.reset - now)})` : "";
      lines.push(`${label}\t${value}${reset}`);
    }
    lines.push("");
  }
  return lines.join("\n").trim();
}

async function refreshBudget() {
  if (!isGnaiKey(state.selectedApiKey)) {
    UI.budgetText.textContent = "";
    UI.budgetText.title = "";
    return;
  }
  const res = await sendRuntimeMessage({
    type: "GET_BUDGET",
    apiKey: state.selectedApiKey
  });
  if (!res.ok) { UI.budgetText.textContent = ""; UI.budgetText.title = ""; return; }
  const pctEmoji = (pct) => pct < 80 ? "🟢" : pct < 100 ? "🟡" : "🔴";
  const dp = (res.daily.used / res.daily.max) * 100;
  let text = `${pctEmoji(dp)} D:$${res.daily.used.toFixed(2)}/$${Math.round(res.daily.max)}`;
  if (res.hourly) {
    const hp = (res.hourly.used / res.hourly.max) * 100;
    text = `${pctEmoji(hp)} H:$${res.hourly.used.toFixed(2)}/$${Math.round(res.hourly.max)} | ${text}`;
  }
  UI.budgetText.textContent = text;
  UI.budgetText.title = res.rateLimits?.length
    ? buildBudgetTooltip(res.rateLimits)
    : "";
}

async function sendRuntimeMessage(payload, timeoutMs = RUNTIME_MESSAGE_TIMEOUT_MS) {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      resolve({ ok: false, error: `Request timeout after ${timeoutMs}ms` });
    }, timeoutMs);

    chrome.runtime.sendMessage(payload, (response) => {
      clearTimeout(timeoutId);

      if (chrome.runtime.lastError) {
        resolve({ ok: false, error: chrome.runtime.lastError.message || "Runtime message failed" });
        return;
      }

      resolve(response || { ok: false, error: "No response from background" });
    });
  });
}

function isValidApiKey(key) {
  return typeof key === "string" && key.trim().length > 0 && !key.trim().startsWith("pak_");
}

function isGnaiKey(key) {
  return typeof key === "string" && key.length > 0 && !key.startsWith("pak_");
}

function getChatImageGroup(tabId = state.activeTabId) {
  return chatImagesByTab.get(tabId) || null;
}

function getChatImages(tabId = state.activeTabId) {
  return getChatImageGroup(tabId)?.images || [];
}

// Backward-compatible helper for code paths that only need a representative image.
function getChatImage(tabId = state.activeTabId) {
  return getChatImages(tabId)[0] || null;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result || "")), { once: true });
    reader.addEventListener("error", () => reject(reader.error || new Error("Unable to read image")), { once: true });
    reader.readAsDataURL(file);
  });
}

function renderChatImageAttachment() {
  const group = getChatImageGroup();
  const images = group?.images || [];
  const hasPendingImages = images.length > 0 && group.contextStartIndex == null;
  UI.chatAttachment.hidden = !hasPendingImages;
  UI.chatAttachmentList.textContent = "";
  if (!hasPendingImages) return;

  UI.chatAttachment.classList.toggle("collapsed", Boolean(group.collapsed));
  UI.chatAttachmentToggle.setAttribute("aria-expanded", String(!group.collapsed));
  const toggleKey = group.collapsed ? "attachment-expand" : "attachment-collapse";
  UI.chatAttachmentToggle.title = t(toggleKey);
  UI.chatAttachmentToggle.setAttribute("data-i18n-title", toggleKey);
  UI.chatAttachmentToggle.setAttribute("aria-label", t(toggleKey));

  const contextText = t("attachment-count", { count: String(images.length), max: String(MAX_CHAT_IMAGES) });
  UI.chatAttachmentSummary.textContent = contextText;
  UI.combinedAnalysisBtn.classList.toggle("active", group.analysisMode === "combined");
  UI.perImageAnalysisBtn.classList.toggle("active", group.analysisMode === "per-image");
  const modeLocked = false;
  UI.combinedAnalysisBtn.disabled = modeLocked;
  UI.perImageAnalysisBtn.disabled = modeLocked;

  let dragImageId = null;
  images.forEach((image, index) => {
    const item = document.createElement("div");
    item.className = "chat-attachment-item";
    item.draggable = !modeLocked;
    item.dataset.imageId = image.id;

    const preview = document.createElement("img");
    preview.src = image.dataUrl;
    preview.alt = image.name;
    preview.title = t("open-image-tab");
    preview.setAttribute("data-i18n-title", "open-image-tab");
    preview.addEventListener("click", () => openMessageImageTab(image.id));

    const name = document.createElement("span");
    name.className = "chat-attachment-name";
    name.textContent = `${index + 1}. ${image.name}`;

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "chat-attachment-remove";
    remove.title = t("remove-chat-image");
    remove.setAttribute("data-i18n-title", "remove-chat-image");
    remove.setAttribute("aria-label", t("remove-chat-image"));
    remove.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
    remove.hidden = modeLocked;
    remove.addEventListener("click", (event) => {
      event.stopPropagation();
      removeChatImage(image.id);
    });

    if (!modeLocked) {
      item.addEventListener("dragstart", () => {
        dragImageId = image.id;
        item.classList.add("dragging");
      });
      item.addEventListener("dragend", () => item.classList.remove("dragging"));
      item.addEventListener("dragover", (event) => {
        event.preventDefault();
        if (dragImageId !== image.id) item.classList.add("drag-over");
      });
      item.addEventListener("dragleave", () => item.classList.remove("drag-over"));
      item.addEventListener("drop", (event) => {
        event.preventDefault();
        item.classList.remove("drag-over");
        reorderChatImage(dragImageId, image.id);
      });
    }

    item.append(preview, name, remove);
    UI.chatAttachmentList.appendChild(item);
  });
}

async function toggleChatImageAttachment() {
  const group = getChatImageGroup();
  if (!group?.images?.length) return;
  group.collapsed = !group.collapsed;
  renderChatImageAttachment();
  await saveState();
}

async function setChatAnalysisMode(mode) {
  const group = getChatImageGroup();
  if (!group || group.contextStartIndex != null) return;
  group.analysisMode = normalizeAnalysisMode(mode);
  renderChatImageAttachment();
  await saveState();
}

async function reorderChatImage(sourceId, destinationId) {
  const group = getChatImageGroup();
  if (!group || group.contextStartIndex != null || !sourceId || sourceId === destinationId) return;
  const sourceIndex = group.images.findIndex((image) => image.id === sourceId);
  const destinationIndex = group.images.findIndex((image) => image.id === destinationId);
  if (sourceIndex < 0 || destinationIndex < 0) return;
  const [moved] = group.images.splice(sourceIndex, 1);
  group.images.splice(destinationIndex, 0, moved);
  renderChatImageAttachment();
  await saveState();
}

async function selectChatImages(fileList) {
  const files = Array.from(fileList || []).filter((file) => file instanceof File);
  if (!files.length) return;

  const previousGroup = getChatImageGroup();
  const startsNewGroup = !previousGroup || previousGroup.contextStartIndex != null;
  const group = startsNewGroup
    ? createChatImageGroup([], previousGroup?.analysisMode || DEFAULT_CHAT_ANALYSIS_MODE)
    : previousGroup;

  const remaining = MAX_CHAT_IMAGES - group.images.length;
  if (remaining <= 0) {
    setStatus("error", t("error-image-count", { max: String(MAX_CHAT_IMAGES) }));
    return;
  }
  if (files.length > remaining) {
    setStatus("error", t("error-image-count", { max: String(MAX_CHAT_IMAGES) }));
  }

  const accepted = files.slice(0, remaining);
  let added = 0;
  for (const file of accepted) {
    if (!CHAT_IMAGE_TYPES.has(file.type)) {
      setStatus("error", t("error-chat-image-type"));
      continue;
    }
    if (file.size > MAX_CHAT_IMAGE_BYTES) {
      setStatus("error", t("error-chat-image-size"));
      continue;
    }
    try {
      const image = {
        id: createChatImageId(),
        name: file.name || `image-${group.images.length + 1}`,
        type: file.type,
        size: file.size,
        dataUrl: await readFileAsDataUrl(file)
      };
      await storeChatImageAsset(image);
      group.images.push(image);
      added++;
    } catch (error) {
      setStatus("error", error.message || String(error));
    }
  }

  if (group.images.length) {
    if (added) group.collapsed = false;
    chatImagesByTab.set(state.activeTabId, group);
  } else if (!previousGroup) {
    chatImagesByTab.delete(state.activeTabId);
  }
  renderChatImageAttachment();
  renderMessages();
  await saveState();
  if (added) setStatus("ready", t("status-image-attached"));
  UI.messageInput.focus();
}

function getClipboardImageFiles(clipboardData) {
  return Array.from(clipboardData?.items || [])
    .filter((item) => item.kind === "file" && String(item.type || "").startsWith("image/"))
    .map((item) => item.getAsFile?.())
    .filter(Boolean);
}

async function pasteClipboardImage(event) {
  const files = getClipboardImageFiles(event.clipboardData);
  if (!files.length) return;

  event.preventDefault();
  await selectChatImages(files);
}

function getDroppedImageSources(dataTransfer) {
  const files = Array.from(dataTransfer?.files || []).filter((item) => (
    item instanceof File && typeof item.type === "string" && item.type.startsWith("image/")
  ));
  if (files.length) return { files, url: "" };

  const html = dataTransfer?.getData?.("text/html") || "";
  if (html) {
    const imageUrl = new DOMParser().parseFromString(html, "text/html")
      .querySelector("img")?.getAttribute("src")?.trim();
    if (imageUrl && /^(https?:|data:image\/)/i.test(imageUrl)) {
      return { files: [], url: imageUrl };
    }
  }

  const uriList = dataTransfer?.getData?.("text/uri-list") || "";
  const url = uriList.split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line && !line.startsWith("#"));
  return /^(https?:|data:image\/)/i.test(url || "")
    ? { files: [], url }
    : { files: [], url: "" };
}

function getDroppedImageName(url, type) {
  try {
    const pathname = new URL(url).pathname;
    const name = decodeURIComponent(pathname.split("/").pop() || "").trim();
    if (name) return name;
  } catch (_error) {
    // Data URLs and malformed path names use the MIME-derived fallback below.
  }
  const extension = type === "image/jpeg" ? "jpg" : type.split("/")[1] || "png";
  return `dropped-image.${extension}`;
}

async function downloadDroppedImage(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const contentLength = Number(response.headers.get("content-length") || 0);
  if (contentLength > MAX_CHAT_IMAGE_BYTES) {
    throw new Error(t("error-chat-image-size"));
  }

  const blob = await response.blob();
  const type = String(blob.type || "").split(";", 1)[0].toLowerCase();
  return new File([blob], getDroppedImageName(url, type), { type });
}

function hasImageDropData(dataTransfer) {
  const types = Array.from(dataTransfer?.types || []);
  if (types.includes(REFERENCE_REORDER_MIME)) return false;
  return types.includes("Files")
    || types.includes("text/html")
    || types.includes("text/uri-list");
}

function focusImagePasteTarget(container, event) {
  const interactive = event.target.closest?.("input, textarea, select, button, a, [tabindex], [contenteditable='true']");
  if (interactive && interactive !== container) return;
  container.focus({ preventScroll: true });
}

function showImageDropTarget(event) {
  if (!hasImageDropData(event.dataTransfer)) return;
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
  UI.chatPanel.classList.add("image-drag-over");
}

function hideImageDropTarget(event) {
  if (event?.relatedTarget && UI.chatPanel.contains(event.relatedTarget)) return;
  UI.chatPanel.classList.remove("image-drag-over");
}

async function dropChatImage(event) {
  const source = getDroppedImageSources(event.dataTransfer);
  hideImageDropTarget();
  if (!source.files.length && !source.url) return;

  event.preventDefault();
  try {
    setStatus("loading", t("status-loading-dropped-image"));
    const files = source.files.length ? source.files : [await downloadDroppedImage(source.url)];
    await selectChatImages(files);
  } catch (error) {
    setStatus("error", t("error-drop-image") + (error.message || String(error)));
  }
}

async function removeChatImage(imageId) {
  const group = getChatImageGroup();
  if (!group) return;
  const index = group.images.findIndex((image) => image.id === imageId);
  if (index < 0) return;
  const [image] = group.images.splice(index, 1);
  if (group.contextStartIndex == null) await deleteChatImageAsset(image.id);
  if (group.focusImageId === image.id) group.focusImageId = null;
  if (!group.images.length) {
    chatImagesByTab.delete(state.activeTabId);
    const previousContext = inferChatImageGroupFromMessages(state.messages);
    if (previousContext) chatImagesByTab.set(state.activeTabId, previousContext);
  }
  renderChatImageAttachment();
  renderMessages();
  await saveState();
  setStatus("ready", t("status-ready"));
}

function playModeSwitchAnimation(button) {
  const previousTimer = modeAnimationTimers.get(button);
  if (previousTimer) clearTimeout(previousTimer);

  button.classList.remove("mode-animate");
  void button.offsetWidth;
  button.classList.add("mode-animate");

  modeAnimationTimers.set(button, setTimeout(() => {
    button.classList.remove("mode-animate");
    modeAnimationTimers.delete(button);
  }, 380));
}

function serializeImageTab(tab) {
  return {
    id: tab.id,
    prompt: tab.prompt || "",
    size: tab.size || "1024x1024",
    quality: tab.quality || "medium",
    format: tab.format || "png",
    composeCollapsed: Boolean(tab.composeCollapsed),
    customLabel: tab.customLabel || null,
    autoLabel: tab.autoLabel || null,
    referenceIds: tab.references.map((reference) => reference.id).filter(Boolean),
    turns: tab.turns.map((turn) => ({
      id: turn.id,
      prompt: turn.prompt,
      referenceIds: turn.referenceIds,
      resultId: turn.resultId,
      size: turn.size,
      quality: turn.quality,
      format: turn.format,
      mimeType: turn.mimeType,
      revisedPrompt: turn.revisedPrompt || ""
    }))
  };
}

function commitActiveImageTab() {
  const tab = getActiveImageTab();
  if (!tab) return;
  tab.prompt = UI.imagePrompt.value;
  tab.size = UI.imageSize.value;
  tab.quality = UI.imageQuality.value;
  tab.format = UI.imageFormat.value;
}

function getImageTabFullLabel(tab) {
  if (tab.customLabel) return tab.customLabel.trim().replace(/\s+/g, " ");
  if (tab.autoLabel) return tab.autoLabel.trim().replace(/\s+/g, " ");
  if (tab.prompt) return tab.prompt.trim().replace(/\s+/g, " ");
  const tabNumber = Math.max(imageTabs.findIndex((item) => item.id === tab.id) + 1, 1);
  return t("image-new-tab-label", { number: String(tabNumber) });
}

function startImageTabRename(tab, label, button) {
  const input = document.createElement("input");
  input.className = "tab-rename-input";
  input.value = tab.customLabel || getImageTabFullLabel(tab);
  input.maxLength = 40;
  button.draggable = false;
  label.replaceWith(input);
  input.focus();
  input.select();

  let done = false;
  const finish = (commit) => {
    if (done) return;
    done = true;
    if (commit) tab.customLabel = input.value.trim() || null;
    renderImageTabBar();
    if (commit) saveState();
  };
  input.addEventListener("keydown", (event) => {
    event.stopPropagation();
    if (event.key === "Enter") { event.preventDefault(); finish(true); }
    else if (event.key === "Escape") { event.preventDefault(); finish(false); }
  });
  input.addEventListener("blur", () => finish(true));
  input.addEventListener("click", (event) => event.stopPropagation());
  input.addEventListener("dblclick", (event) => event.stopPropagation());
}

function createScrollableTabBar(bar, onAdd, addDisabled = false) {
  bar.replaceChildren();

  const previous = document.createElement("button");
  previous.className = "tab-scroll-btn tab-scroll-prev";
  previous.type = "button";
  previous.textContent = "\u2039";
  previous.title = t("tab-scroll-left");
  previous.setAttribute("aria-label", t("tab-scroll-left"));

  const viewport = document.createElement("div");
  viewport.className = "tab-scroll-viewport";
  viewport.tabIndex = 0;

  const strip = document.createElement("div");
  strip.className = "tab-strip";
  strip.setAttribute("role", "tablist");
  viewport.appendChild(strip);

  const next = document.createElement("button");
  next.className = "tab-scroll-btn tab-scroll-next";
  next.type = "button";
  next.textContent = "\u203a";
  next.title = t("tab-scroll-right");
  next.setAttribute("aria-label", t("tab-scroll-right"));

  const add = document.createElement("button");
  add.className = "tab-add";
  add.type = "button";
  add.textContent = "+";
  add.disabled = addDisabled;
  add.title = t("new-tab");
  add.setAttribute("aria-label", t("new-tab"));
  add.setAttribute("data-i18n-title", "new-tab");
  add.addEventListener("click", onAdd);

  const updateControls = () => {
    const maxScroll = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const hasOverflow = maxScroll > 1;
    previous.classList.toggle("no-overflow", !hasOverflow);
    next.classList.toggle("no-overflow", !hasOverflow);
    previous.disabled = !hasOverflow || viewport.scrollLeft <= 1;
    next.disabled = !hasOverflow || viewport.scrollLeft >= maxScroll - 1;
  };

  const scrollByPage = (direction) => {
    const distance = Math.max(120, Math.round(viewport.clientWidth * 0.72));
    viewport.scrollBy({ left: direction * distance, behavior: "smooth" });
  };
  previous.addEventListener("click", () => scrollByPage(-1));
  next.addEventListener("click", () => scrollByPage(1));
  viewport.addEventListener("scroll", updateControls, { passive: true });
  viewport.addEventListener("wheel", (event) => {
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX) || viewport.scrollWidth <= viewport.clientWidth) return;
    event.preventDefault();
    viewport.scrollLeft += event.deltaY;
  }, { passive: false });
  viewport.addEventListener("keydown", (event) => {
    if (event.target !== viewport || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "Home") viewport.scrollTo({ left: 0, behavior: "smooth" });
    else if (event.key === "End") viewport.scrollTo({ left: viewport.scrollWidth, behavior: "smooth" });
    else scrollByPage(event.key === "ArrowLeft" ? -1 : 1);
  });

  if (typeof ResizeObserver === "function") {
    const resizeObserver = new ResizeObserver(() => {
      if (!viewport.isConnected) {
        resizeObserver.disconnect();
        return;
      }
      updateControls();
    });
    resizeObserver.observe(viewport);
  }

  bar.append(previous, viewport, next, add);

  const finish = () => requestAnimationFrame(() => {
    const active = strip.querySelector(".tab-item.active");
    if (active) {
      const left = active.offsetLeft;
      const right = left + active.offsetWidth;
      let targetScroll = viewport.scrollLeft;
      if (left < viewport.scrollLeft) targetScroll = left;
      else if (right > viewport.scrollLeft + viewport.clientWidth) {
        targetScroll = right - viewport.clientWidth;
      }
      if (targetScroll !== viewport.scrollLeft) {
        const previousBehavior = viewport.style.scrollBehavior;
        viewport.style.scrollBehavior = "auto";
        viewport.scrollLeft = targetScroll;
        requestAnimationFrame(() => { viewport.style.scrollBehavior = previousBehavior; });
      }
    }
    updateControls();
  });

  return { strip, viewport, finish };
}

function renderImageTabBar() {
  const bar = UI.imageTabBar;
  if (!bar) return;
  const locked = imageTabs.some((tab) => tab.busy);
  const tabBar = createScrollableTabBar(bar, addImageTab, locked);
  const strip = tabBar.strip;
  let dragSourceId = null;

  imageTabs.forEach((tab) => {
    const button = document.createElement("button");
    button.className = "tab-item" + (tab.id === state.activeImageTabId ? " active" : "");
    button.type = "button";
    button.draggable = !locked;

    if (tab.busy) {
      const spinner = document.createElement("span");
      spinner.className = "image-tab-spinner";
      spinner.setAttribute("aria-hidden", "true");
      button.appendChild(spinner);
    }

    const label = document.createElement("span");
    label.className = "tab-label";
    const fullLabel = getImageTabFullLabel(tab);
    label.textContent = truncateTabLabel(fullLabel);
    label.title = `${fullLabel}\n${t("tab-rename-hint")}`;
    label.setAttribute("aria-label", fullLabel);
    if (!locked && !tab.busy) {
      label.addEventListener("dblclick", (event) => {
        event.stopPropagation();
        startImageTabRename(tab, label, button);
      });
    }
    button.appendChild(label);

    if (imageTabs.length > 1 && !tab.busy) {
      const close = document.createElement("span");
      close.className = "tab-close";
      close.textContent = "\u00d7";
      close.addEventListener("click", (event) => {
        event.stopPropagation();
        closeImageTab(tab.id);
      });
      button.appendChild(close);
    }

    button.addEventListener("click", () => switchImageTab(tab.id));
    if (!locked) {
      button.addEventListener("dragstart", (event) => {
        dragSourceId = tab.id;
        event.dataTransfer.effectAllowed = "move";
        button.classList.add("dragging");
      });
      button.addEventListener("dragend", () => {
        button.classList.remove("dragging");
        strip.querySelectorAll(".tab-item").forEach((item) => item.classList.remove("drag-over"));
      });
      button.addEventListener("dragover", (event) => {
        event.preventDefault();
        if (dragSourceId !== tab.id) button.classList.add("drag-over");
      });
      button.addEventListener("dragleave", () => button.classList.remove("drag-over"));
      button.addEventListener("drop", (event) => {
        event.preventDefault();
        button.classList.remove("drag-over");
        if (dragSourceId == null || dragSourceId === tab.id) return;
        commitActiveImageTab();
        const sourceIndex = imageTabs.findIndex((item) => item.id === dragSourceId);
        const destinationIndex = imageTabs.findIndex((item) => item.id === tab.id);
        if (sourceIndex < 0 || destinationIndex < 0) return;
        const [moved] = imageTabs.splice(sourceIndex, 1);
        imageTabs.splice(destinationIndex, 0, moved);
        renderImageTabBar();
        saveState();
      });
    }
    strip.appendChild(button);
  });
  tabBar.finish();
}

function loadActiveImageTab() {
  const tab = getActiveImageTab();
  if (!tab) return;
  UI.imagePrompt.value = tab.prompt || "";
  UI.imageSize.value = tab.size || "1024x1024";
  UI.imageQuality.value = tab.quality || "medium";
  UI.imageFormat.value = tab.format || "png";
  renderImageComposeState();
  renderImageTabBar();
  renderReferenceImages();
  UI.imageProgressText.textContent = tab.progressText || t("image-generating");
  refreshImageBusyUI();
  setStatus(tab.busy ? "loading" : "ready", tab.busy ? UI.imageProgressText.textContent : t("status-ready"));
}

function renderImageComposeState() {
  const tab = getActiveImageTab();
  const collapsed = Boolean(tab?.composeCollapsed);
  UI.imageCompose.classList.toggle("collapsed", collapsed);
  UI.imageComposeToggle.setAttribute("aria-expanded", String(!collapsed));
  const key = collapsed ? "image-compose-expand" : "image-compose-collapse";
  UI.imageComposeToggle.title = t(key);
  UI.imageComposeToggle.setAttribute("data-i18n-title", key);
  UI.imageComposeToggle.setAttribute("aria-label", t(key));
}

async function toggleImageCompose() {
  const tab = getActiveImageTab();
  if (!tab) return;
  tab.composeCollapsed = !tab.composeCollapsed;
  renderImageComposeState();
  await saveState();
}

async function addImageTab() {
  commitActiveImageTab();
  const current = getActiveImageTab();
  const tab = createImageTab(state.nextImageTabId++, {
    size: current?.size,
    quality: current?.quality,
    format: current?.format
  });
  imageTabs.push(tab);
  state.activeImageTabId = tab.id;
  loadActiveImageTab();
  await saveState();
  UI.imagePrompt.focus();
}

async function switchImageTab(id) {
  if (id === state.activeImageTabId) return;
  if (!imageTabs.some((tab) => tab.id === id)) return;
  commitActiveImageTab();
  state.activeImageTabId = id;
  loadActiveImageTab();
  await saveState();
  UI.imagePrompt.focus();
}

function releaseImageTabObjects(tab) {
  tab.controller?.abort();
  tab.references.forEach((entry) => {
    URL.revokeObjectURL(entry.url);
  });
  tab.turns.forEach((turn) => {
    if (turn.result?.url) URL.revokeObjectURL(turn.result.url);
  });
}

async function deleteImageTabAssets(tab) {
  const ids = new Set(tab.references.map((entry) => entry.id));
  tab.turns.forEach((turn) => {
    turn.referenceIds.forEach((id) => ids.add(id));
    if (turn.resultId) ids.add(turn.resultId);
  });
  await Promise.all([...ids].filter(Boolean).map(deleteChatImageAsset));
}

async function closeImageTab(id) {
  const index = imageTabs.findIndex((tab) => tab.id === id);
  if (index < 0) return;
  if (imageTabs[index].busy) return;
  commitActiveImageTab();
  const [removed] = imageTabs.splice(index, 1);
  releaseImageTabObjects(removed);
  await deleteImageTabAssets(removed);
  if (!imageTabs.length) imageTabs.push(createImageTab(state.nextImageTabId++));
  if (id === state.activeImageTabId) {
    state.activeImageTabId = imageTabs[Math.min(index, imageTabs.length - 1)].id;
  }
  loadActiveImageTab();
  await saveState();
}

function switchWorkspace(mode) {
  const imageMode = mode === "image";
  imageState.mode = imageMode ? "image" : "chat";
  document.body.classList.toggle("image-mode", imageMode);
  UI.chatModeBtn.classList.toggle("active", !imageMode);
  UI.imageModeBtn.classList.toggle("active", imageMode);
  UI.chatModeBtn.setAttribute("aria-selected", String(!imageMode));
  UI.imageModeBtn.setAttribute("aria-selected", String(imageMode));
  UI.chatModeBtn.tabIndex = imageMode ? -1 : 0;
  UI.imageModeBtn.tabIndex = imageMode ? 0 : -1;
  UI.chatPanel.setAttribute("aria-hidden", String(imageMode));
  UI.imagePanel.classList.toggle("active", imageMode);
  UI.imagePanel.setAttribute("aria-hidden", String(!imageMode));
  playModeSwitchAnimation(imageMode ? UI.imageModeBtn : UI.chatModeBtn);

  if (imageMode) {
    loadActiveImageTab();
    setStatus("ready", t("status-ready"));
    UI.imagePrompt.focus();
  } else {
    setStatus("ready", t("status-ready"));
    UI.messageInput.focus();
  }
}

function renderReferenceImages() {
  UI.referenceList.innerHTML = "";
  UI.referenceList.hidden = imageState.references.length === 0;
  const referenceLimitReached = imageState.references.length >= MAX_REFERENCE_IMAGES;
  UI.addReferenceBtn.disabled = imageState.busy || referenceLimitReached;
  UI.referenceInput.disabled = imageState.busy || referenceLimitReached;
  if (imageState.references.length === 0) {
    renderImagePromptTools();
    return;
  }

  let dragReferenceId = null;
  imageState.references.forEach((reference, index) => {
    const item = document.createElement("div");
    item.className = "reference-thumb";
    item.title = reference.file.name;
    item.draggable = !imageState.busy;
    item.dataset.referenceId = reference.id;

    const image = document.createElement("img");
    image.src = reference.url;
    image.alt = reference.file.name;
    image.draggable = false;
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.title = t("open-image-tab");
    image.setAttribute("data-i18n-title", "open-image-tab");
    image.setAttribute("aria-label", t("open-image-tab"));
    image.addEventListener("click", () => openMessageImageTab(reference.id));
    image.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openMessageImageTab(reference.id);
    });

    const remove = document.createElement("button");
    remove.className = "reference-remove";
    remove.type = "button";
    remove.textContent = "×";
    remove.title = t("image-remove-reference");
    remove.setAttribute("aria-label", t("image-remove-reference"));
    remove.addEventListener("click", () => removeReferenceImage(index));

    if (!imageState.busy) {
      item.addEventListener("dragstart", (event) => {
        event.stopPropagation();
        dragReferenceId = reference.id;
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData(REFERENCE_REORDER_MIME, reference.id);
        event.dataTransfer.setData("text/plain", reference.id);
        item.classList.add("dragging");
      });
      item.addEventListener("dragend", (event) => {
        event.stopPropagation();
        item.classList.remove("dragging");
        UI.referenceList.querySelectorAll(".drag-over").forEach((entry) => entry.classList.remove("drag-over"));
        dragReferenceId = null;
      });
      item.addEventListener("dragover", (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.dataTransfer.dropEffect = "move";
        if (dragReferenceId && dragReferenceId !== reference.id) item.classList.add("drag-over");
      });
      item.addEventListener("dragleave", (event) => {
        event.stopPropagation();
        item.classList.remove("drag-over");
      });
      item.addEventListener("drop", async (event) => {
        event.preventDefault();
        event.stopPropagation();
        item.classList.remove("drag-over");
        if (!dragReferenceId || dragReferenceId === reference.id) return;
        const sourceIndex = imageState.references.findIndex((entry) => entry.id === dragReferenceId);
        const destinationIndex = imageState.references.findIndex((entry) => entry.id === reference.id);
        if (sourceIndex < 0 || destinationIndex < 0) return;
        const [moved] = imageState.references.splice(sourceIndex, 1);
        imageState.references.splice(destinationIndex, 0, moved);
        renderReferenceImages();
        await saveState();
      });
    }

    item.append(image, remove);
    UI.referenceList.appendChild(item);
  });
  renderImagePromptTools();
}

async function addReferenceFiles(files) {
  const accepted = Array.from(files || []).filter((file) => {
    return file instanceof File && REFERENCE_IMAGE_TYPES.has(file.type);
  });

  let added = 0;
  let limitReached = false;
  for (const file of accepted) {
    const duplicate = imageState.references.some((entry) => (
      entry.file.name === file.name &&
      entry.file.size === file.size &&
      entry.file.lastModified === file.lastModified
    ));
    if (!duplicate) {
      if (imageState.references.length >= MAX_REFERENCE_IMAGES) {
        limitReached = true;
        continue;
      }
      try {
        const id = createChatImageId();
        const dataUrl = await readFileAsDataUrl(file);
        await storeChatImageAsset({
          id,
          name: file.name || "Reference image",
          type: file.type,
          size: file.size,
          dataUrl
        });
        imageState.references.push({ id, file, url: URL.createObjectURL(file) });
        added++;
      } catch (error) {
        setStatus("error", error?.message || String(error));
      }
    }
  }
  if (added) {
    const tab = getActiveImageTab();
    if (tab) tab.composeCollapsed = false;
    renderImageComposeState();
  }
  renderReferenceImages();
  if (added) await saveState();
  if (limitReached) {
    setStatus("error", t("error-reference-count", { max: String(MAX_REFERENCE_IMAGES) }));
  } else if (added) {
    setStatus("ready", t("status-reference-attached"));
  }
  return { added, limitReached };
}

async function pasteReferenceImages(event) {
  const clipboardImages = getClipboardImageFiles(event.clipboardData);
  if (!clipboardImages.length) return;
  event.preventDefault();
  if (imageState.busy) return;
  if (!clipboardImages.some((file) => REFERENCE_IMAGE_TYPES.has(file.type))) {
    setStatus("error", t("error-reference-type"));
    return;
  }
  await addReferenceFiles(clipboardImages);
}

function showReferenceDropTarget(event) {
  if (!hasImageDropData(event.dataTransfer)) return;
  event.preventDefault();
  if (imageState.busy) return;
  if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
  UI.imagePanel.classList.add("image-drag-over");
}

function hideReferenceDropTarget(event) {
  if (event?.relatedTarget && UI.imagePanel.contains(event.relatedTarget)) return;
  UI.imagePanel.classList.remove("image-drag-over");
}

async function dropReferenceImages(event) {
  const source = getDroppedImageSources(event.dataTransfer);
  hideReferenceDropTarget();
  if (!source.files.length && !source.url) return;
  event.preventDefault();
  if (imageState.busy) return;
  try {
    setStatus("loading", t("status-loading-dropped-image"));
    const files = source.files.length ? source.files : [await downloadDroppedImage(source.url)];
    if (!files.some((file) => REFERENCE_IMAGE_TYPES.has(file.type))) {
      setStatus("error", t("error-reference-type"));
      return;
    }
    await addReferenceFiles(files);
  } catch (error) {
    setStatus("error", t("error-drop-image") + (error?.message || String(error)));
  }
}

async function removeReferenceImage(index) {
  if (imageState.busy) return;
  const [removed] = imageState.references.splice(index, 1);
  if (removed?.url) URL.revokeObjectURL(removed.url);
  const usedByHistory = removed?.id && imageState.turns.some((turn) => turn.referenceIds.includes(removed.id));
  if (removed?.id && !usedByHistory) await deleteChatImageAsset(removed.id);
  renderReferenceImages();
  await saveState();
}

function createImageDownloadButton(turn) {
  const button = document.createElement("button");
  button.className = "copy-btn image-download-btn";
  button.type = "button";
  button.title = t("image-download");
  button.setAttribute("aria-label", t("image-download"));
  button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4M5 21h14"/></svg>';
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    downloadGeneratedImage(turn);
  });
  return button;
}

function renderImageStage() {
  UI.imageEmpty.hidden = imageState.busy || imageState.turns.length > 0;
  UI.imageProgress.hidden = !imageState.busy;
  UI.imageResult.hidden = imageState.turns.length === 0;
  UI.imageResult.textContent = "";
  imageState.turns.forEach((turn) => {
    const item = document.createElement("article");
    item.className = "image-turn";

    const userMessage = document.createElement("div");
    userMessage.className = "message user";
    if (turn.referenceIds.length) {
      const references = document.createElement("div");
      references.className = "message-user-images";
      turn.referenceIds.forEach((id, index) => {
        const asset = chatImageAssets.get(id);
        if (!asset?.dataUrl) return;
        const wrap = document.createElement("div");
        wrap.className = "message-user-image-wrap";
        const image = createMessageImagePreview(asset);
        const name = document.createElement("div");
        name.className = "message-user-image-name";
        name.textContent = `${index + 1}. ${asset.name || t("image-add-reference")}`;
        wrap.append(image, name);
        references.appendChild(wrap);
      });
      if (references.childElementCount) {
        userMessage.classList.add("has-image");
        userMessage.appendChild(references);
      }
    }

    const prompt = document.createElement("div");
    prompt.className = "message-user-text";
    prompt.textContent = turn.prompt;
    userMessage.appendChild(prompt);
    item.appendChild(userMessage);

    if (!turn.result?.url) {
      UI.imageResult.appendChild(item);
      return;
    }

    const assistantMessage = document.createElement("div");
    assistantMessage.className = "message assistant";
    const output = document.createElement("img");
    output.className = "image-turn-output";
    output.src = turn.result.url;
    output.alt = turn.prompt;
    output.title = t("open-image-tab");
    output.addEventListener("click", () => openMessageImageTab(turn.resultId));
    assistantMessage.append(output, createImageDownloadButton(turn));
    item.appendChild(assistantMessage);
    UI.imageResult.appendChild(item);
  });
  UI.imageStage?.scrollTo?.({ top: UI.imageStage.scrollHeight, behavior: "smooth" });
}

function refreshImageBusyUI() {
  const busy = imageState.busy;
  UI.panelModeBtn.disabled = imageTabs.some((tab) => tab.busy);
  updatePanelModeBtn();
  [
    UI.imageSize,
    UI.imageQuality,
    UI.imageFormat,
    UI.imageModelSelect,
    UI.addReferenceBtn,
    UI.referenceInput,
    UI.imagePrompt,
    UI.generateImageBtn
  ].forEach((element) => {
    if (element) {
      const referenceLimitReached = imageState.references.length >= MAX_REFERENCE_IMAGES;
      element.disabled = busy
        || (element === UI.imageModelSelect && state.generationModels.length === 0)
        || ([UI.addReferenceBtn, UI.referenceInput].includes(element) && referenceLimitReached);
    }
  });
  UI.referenceList.querySelectorAll("button").forEach((button) => {
    button.disabled = busy;
  });
  renderImageTabBar();
  renderImagePromptTools();
  renderImageStage();
}

function setImageBusy(tab, busy) {
  tab.busy = busy;
  UI.panelModeBtn.disabled = imageTabs.some((item) => item.busy);
  updatePanelModeBtn();
  if (tab.id === state.activeImageTabId) {
    refreshImageBusyUI();
  } else {
    renderImageTabBar();
  }
}

async function generateImage() {
  const hasKey = await ensureApiKey(false);
  if (!hasKey) return;
  if (!isGnaiKey(state.selectedApiKey)) {
    setStatus("error", t("error-image-key"));
    return;
  }
  if (!state.generationModels.includes(state.selectedGenerationModel)) {
    setStatus("error", t("error-load-models"));
    return;
  }

  const prompt = UI.imagePrompt.value.trim();
  if (!prompt) {
    setStatus("error", t("error-image-prompt"));
    UI.imagePrompt.focus();
    return;
  }

  const activeImageTab = getActiveImageTab();
  if (!activeImageTab || activeImageTab.busy) return;
  const requestApiKey = state.selectedApiKey;
  const requestModel = state.selectedGenerationModel;
  commitActiveImageTab();
  if (!activeImageTab.autoLabel) activeImageTab.autoLabel = truncateTabLabel(prompt, 26);
  renderImageTabBar();

  const requestTurn = {
    id: createChatImageId(),
    prompt,
    referenceIds: activeImageTab.references.map((reference) => reference.id).filter(Boolean),
    resultId: null,
    size: UI.imageSize.value,
    quality: UI.imageQuality.value,
    format: UI.imageFormat.value,
    mimeType: UI.imageFormat.value === "jpeg" ? "image/jpeg" : "image/png",
    revisedPrompt: "",
    result: null
  };
  const referenceFiles = activeImageTab.references.map((entry) => entry.file);
  activeImageTab.turns.push(requestTurn);

  const controller = new AbortController();
  activeImageTab.controller = controller;
  activeImageTab.progressText = t("image-generating");
  UI.imageProgressText.textContent = activeImageTab.progressText;
  setImageBusy(activeImageTab, true);
  setStatus("loading", t("image-generating"));
  await saveState();

  try {
    const result = await window.ImageChatterImageAPI.generateImage({
      apiKey: requestApiKey,
      model: requestModel,
      prompt,
      size: requestTurn.size,
      quality: requestTurn.quality,
      format: requestTurn.format,
      references: referenceFiles,
      signal: controller.signal,
      onRetry: ({ attempt, total, delayMs }) => {
        const retryText = t("image-retry", {
          seconds: Math.ceil(delayMs / 1000),
          attempt,
          total
        });
        activeImageTab.progressText = retryText;
        if (activeImageTab.id === state.activeImageTabId) {
          UI.imageProgressText.textContent = retryText;
          setStatus("loading", retryText);
        }
      }
    });

    const resultId = createChatImageId();
    const dataUrl = await readFileAsDataUrl(result.blob);
    await storeChatImageAsset({
      id: resultId,
      name: `generated.${result.format === "jpeg" ? "jpeg" : "png"}`,
      type: result.mimeType,
      size: result.blob.size,
      dataUrl
    });
    Object.assign(requestTurn, {
      resultId,
      format: result.format,
      mimeType: result.mimeType,
      revisedPrompt: result.revisedPrompt || "",
      result: {
        ...result,
        id: resultId,
        url: URL.createObjectURL(result.blob)
      }
    });
    if (activeImageTab.id === state.activeImageTabId) setStatus("ready", t("status-image-ready"));
  } catch (error) {
    if (error?.code === "cancelled") {
      if (activeImageTab.id === state.activeImageTabId) setStatus("ready", t("status-image-cancelled"));
    } else {
      if (activeImageTab.id === state.activeImageTabId) setStatus("error", t("error-image") + (error?.message || String(error)));
    }
  } finally {
    if (activeImageTab.controller === controller) activeImageTab.controller = null;
    activeImageTab.progressText = "";
    setImageBusy(activeImageTab, false);
    await saveState();
  }
}

function cancelImageGeneration() {
  getActiveImageTab()?.controller?.abort();
}

async function downloadGeneratedImage(turn) {
  if (!turn?.result) return;
  const stamp = new Date().toISOString().slice(0, 19).replace("T", "_").replace(/:/g, "");
  const extension = turn.format === "jpeg" ? "jpeg" : "png";
  try {
    await chrome.downloads.download({
      url: turn.result.url,
      filename: `image-chatter-images/${stamp}.${extension}`,
      saveAs: true
    });
  } catch (error) {
    setStatus("error", error.message || String(error));
  }
}

function cleanupImageObjects() {
  imageTabs.forEach(releaseImageTabObjects);
}

async function setSingleApiKey(key) {
  if (state.selectedApiKey !== key) {
    state.verifiedModels = null;
    state.openaiModels = [DEFAULT_MODEL];
    state.anthropicModels = [];
    state.models = [DEFAULT_MODEL];
    state.generationModels = [...DEFAULT_GENERATION_MODELS];
  }
  state.selectedApiKey = key;
  await saveState();
}

function promptForApiKey(force = false) {
  return new Promise((resolve) => {
    UI.apiKeyInput.value = state.selectedApiKey || "";
    UI.apiKeyModal.classList.add("show");
    UI.apiKeyInput.focus();
    UI.apiKeyInput.select();

    function cleanup() {
      UI.apiKeyModal.classList.remove("show");
      UI.apiKeyConfirmBtn.removeEventListener("click", onConfirm);
      UI.apiKeyCancelBtn.removeEventListener("click", onCancel);
      UI.closeApiKeyModal.removeEventListener("click", onCancel);
      UI.apiKeyModal.removeEventListener("click", onBackdrop);
      UI.apiKeyInput.removeEventListener("keydown", onKeydown);
    }

    function onConfirm() {
      const key = UI.apiKeyInput.value.trim();
      if (!isValidApiKey(key)) {
        setStatus("error", t("error-api-key-prefix"));
        cleanup();
        resolve(false);
        return;
      }
      cleanup();
      setSingleApiKey(key).then(() => {
        setStatus("ready", t("apikey-updated"));
        refreshBudget();
        resolve(true);
      });
    }

    function onCancel() {
      cleanup();
      if (force && !state.selectedApiKey) {
        setStatus("error", t("apikey-required"));
      }
      resolve(false);
    }

    function onBackdrop(e) {
      if (e.target === UI.apiKeyModal) onCancel();
    }

    function onKeydown(e) {
      if (e.key === "Enter") onConfirm();
      else if (e.key === "Escape") onCancel();
    }

    UI.apiKeyConfirmBtn.addEventListener("click", onConfirm);
    UI.apiKeyCancelBtn.addEventListener("click", onCancel);
    UI.closeApiKeyModal.addEventListener("click", onCancel);
    UI.apiKeyModal.addEventListener("click", onBackdrop);
    UI.apiKeyInput.addEventListener("keydown", onKeydown);
  });
}

function showConfirmSaveDialog() {
  return new Promise((resolve) => {
    UI.confirmSaveModal.classList.add("show");

    function cleanup() {
      UI.confirmSaveModal.classList.remove("show");
      UI.confirmSaveYesBtn.removeEventListener("click", onYes);
      UI.confirmSaveNoBtn.removeEventListener("click", onNo);
      UI.confirmSaveCancelBtn.removeEventListener("click", onCancel);
      UI.confirmSaveModal.removeEventListener("click", onBackdrop);
      document.removeEventListener("keydown", onKeydown);
    }

    function onYes() { cleanup(); resolve("yes"); }
    function onNo() { cleanup(); resolve("no"); }
    function onCancel() { cleanup(); resolve("cancel"); }
    function onBackdrop(e) { if (e.target === UI.confirmSaveModal) onCancel(); }
    function onKeydown(e) { if (e.key === "Escape") onCancel(); }

    UI.confirmSaveYesBtn.addEventListener("click", onYes);
    UI.confirmSaveNoBtn.addEventListener("click", onNo);
    UI.confirmSaveCancelBtn.addEventListener("click", onCancel);
    UI.confirmSaveModal.addEventListener("click", onBackdrop);
    document.addEventListener("keydown", onKeydown);
  });
}

async function ensureApiKey(forcePrompt = false) {
  if (isValidApiKey(state.selectedApiKey)) {
    return true;
  }

  if (!forcePrompt) {
    setStatus("error", t("apikey-required"));
    return false;
  }

  return promptForApiKey(true);
}

function _appendTranscriptToggle(node, transcript) {
  const toggle = document.createElement("div");
  toggle.className = "transcript-toggle";
  toggle.textContent = t("transcript-show");
  const panel = document.createElement("div");
  panel.className = "transcript-panel";
  panel.textContent = transcript;
  toggle.addEventListener("click", () => {
    const visible = panel.classList.toggle("visible");
    toggle.textContent = t(visible ? "transcript-hide" : "transcript-show");
  });
  node.appendChild(toggle);
  node.appendChild(panel);
}

async function navigateToUrl(url) {
  try {
    const found = await chrome.tabs.query({ url });
    if (found.length > 0) {
      await chrome.tabs.update(found[0].id, { active: true });
      await chrome.windows.update(found[0].windowId, { focused: true });
    } else {
      await chrome.tabs.create({ url });
    }
  } catch (e) {
    console.error("[KC] navigateToUrl error:", e);
  }
}

function _setPageUrl(element, url) {
  element.textContent = "";
  if (url && (url.startsWith("http://") || url.startsWith("https://"))) {
    const a = document.createElement("a");
    a.href = "#";
    a.textContent = url;
    a.addEventListener("click", (e) => { e.preventDefault(); navigateToUrl(url); });
    element.appendChild(a);
  } else {
    element.textContent = url || "";
  }
}

function showPageInfo(title, url, transcript = null) {
  let node = UI.messagesContainer.querySelector(".page-info");
  if (node) {
    node.querySelector(".page-title").textContent = title || "";
    _setPageUrl(node.querySelector(".page-url"), url);
    const oldToggle = node.querySelector(".transcript-toggle");
    const oldPanel  = node.querySelector(".transcript-panel");
    if (oldToggle) oldToggle.remove();
    if (oldPanel)  oldPanel.remove();
    if (transcript) _appendTranscriptToggle(node, transcript);
    return;
  }
  node = document.createElement("div");
  node.className = "page-info";
  node.innerHTML = "<div class=\"page-title\"></div><div class=\"page-url\"></div>";
  node.querySelector(".page-title").textContent = title || "";
  _setPageUrl(node.querySelector(".page-url"), url);
  if (transcript) _appendTranscriptToggle(node, transcript);
  UI.messagesContainer.prepend(node);
}

function hidePageInfo() {
  const node = UI.messagesContainer.querySelector(".page-info");
  if (node) node.remove();
}

function renderEmptyState() {
  UI.messagesContainer.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">
        <svg class="empty-mark" viewBox="0 0 120 104" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <defs>
            <linearGradient id="emg" x1="12" y1="10" x2="108" y2="92" gradientUnits="userSpaceOnUse">
              <stop stop-color="#3b82f6"/><stop offset="1" stop-color="#8b5cf6"/>
            </linearGradient>
            <radialGradient id="eglow" cx="50%" cy="46%" r="55%">
              <stop stop-color="#a78bfa" stop-opacity=".45"/><stop offset="1" stop-color="#a78bfa" stop-opacity="0"/>
            </radialGradient>
          </defs>
          <ellipse class="empty-glow" cx="60" cy="54" rx="52" ry="42" fill="url(#eglow)"/>
          <g class="empty-float">
            <path class="draw" d="M22 20h76a10 10 0 0 1 10 10v34a10 10 0 0 1-10 10H52l-19 16v-16H22a10 10 0 0 1-10-10V30a10 10 0 0 1 10-10Z" stroke="url(#emg)" stroke-width="3.5"/>
            <circle class="empty-dot d1" cx="44" cy="47" r="4.4" fill="#3b82f6"/>
            <circle class="empty-dot d2" cx="60" cy="47" r="4.4" fill="#7c3aed"/>
            <circle class="empty-dot d3" cx="76" cy="47" r="4.4" fill="#8b5cf6"/>
          </g>
          <circle class="empty-spark s1" cx="16" cy="14" r="2.4" fill="#c4b5fd"/>
          <circle class="empty-spark s2" cx="106" cy="16" r="2" fill="#a78bfa"/>
        </svg>
      </div>
      <div class="empty-state-title" data-i18n="empty-title">${t("empty-title")}</div>
      <div class="empty-state-text" data-i18n="empty-text">${t("empty-text").replace(/\n/g, "<br>")}</div>
    </div>
  `;
}

async function openMessageImageTab(imageId) {
  const response = await sendRuntimeMessage({ type: "OPEN_IMAGE_TAB", imageId });
  if (!response?.ok) {
    setStatus("error", response?.error || "Unable to open image tab");
  }
}

function getMessageImages(message) {
  const ids = Array.isArray(message?.imageIds)
    ? message.imageIds
    : message?.imageId ? [message.imageId] : [];
  return ids.map((id) => chatImageAssets.get(id)).filter(Boolean);
}

function createMessageImagePreview(image, className = "message-user-image") {
  const preview = document.createElement("img");
  preview.className = className;
  preview.src = image.dataUrl;
  preview.alt = image.name || "Attached image";
  preview.tabIndex = 0;
  preview.setAttribute("role", "button");
  preview.setAttribute("data-i18n-title", "open-image-tab");
  preview.setAttribute("data-i18n-aria-label", "open-image-tab");
  preview.setAttribute("aria-label", t("open-image-tab"));
  preview.title = t("open-image-tab");
  preview.addEventListener("click", () => openMessageImageTab(image.id));
  preview.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openMessageImageTab(image.id);
  });
  return preview;
}

function batchStatusLabel(status) {
  return t(`batch-status-${status || "pending"}`);
}

function renderBatchResultsMessage(node, message) {
  node.classList.add("batch-results-message");
  const results = Array.isArray(message.results) ? message.results : [];
  const completed = results.filter((result) => result.status === "completed").length;
  const settled = results.filter((result) => ["completed", "failed", "cancelled"].includes(result.status)).length;
  const running = batchRuns.has(message.batchId);

  const header = document.createElement("div");
  header.className = "batch-results-header";
  const title = document.createElement("div");
  title.className = "batch-results-title";
  title.textContent = t("batch-results");
  const progress = document.createElement("div");
  progress.className = "batch-results-progress";
  progress.textContent = t("batch-progress", { done: String(settled), total: String(results.length) });
  header.append(title, progress);

  if (running) {
    const cancel = document.createElement("button");
    cancel.className = "batch-action-btn batch-cancel-btn";
    cancel.type = "button";
    cancel.textContent = t("batch-cancel");
    cancel.addEventListener("click", () => cancelPerImageBatch(message.batchId));
    header.appendChild(cancel);
  }

  const list = document.createElement("div");
  list.className = "batch-result-list";
  results.forEach((result, index) => {
    const image = chatImageAssets.get(result.imageId);
    const card = document.createElement("details");
    card.className = "batch-result-card";
    card.open = result.status === "completed" || result.status === "failed";

    const summary = document.createElement("summary");
    if (image) summary.appendChild(createMessageImagePreview(image, "batch-result-thumb"));
    const name = document.createElement("span");
    name.className = "batch-result-name";
    name.textContent = `${index + 1}. ${result.imageName || image?.name || "Image"}`;
    const status = document.createElement("span");
    status.className = `batch-result-status ${result.status || "pending"}`;
    status.textContent = batchStatusLabel(result.status);
    summary.append(name, status);

    const body = document.createElement("div");
    body.className = "batch-result-body";
    const content = document.createElement("div");
    content.className = "batch-result-content";
    if (result.status === "completed") content.innerHTML = renderMarkdown(result.content || "");
    else if (result.status === "failed") {
      content.classList.add("batch-result-error");
      content.textContent = result.error || t("batch-status-failed");
    } else {
      content.textContent = batchStatusLabel(result.status);
    }
    body.appendChild(content);

    const actions = document.createElement("div");
    actions.className = "batch-result-actions";
    if (["failed", "cancelled"].includes(result.status)) {
      const retry = document.createElement("button");
      retry.className = "batch-action-btn";
      retry.type = "button";
      retry.textContent = t("batch-retry");
      retry.addEventListener("click", () => retryBatchImage(message.batchId, result.imageId));
      actions.appendChild(retry);
    }
    if (result.status === "completed") {
      const followUp = document.createElement("button");
      followUp.className = "batch-action-btn";
      followUp.type = "button";
      followUp.textContent = t("batch-follow-up");
      followUp.addEventListener("click", () => activateBatchScope(message.batchId, result.imageId));
      const copy = document.createElement("button");
      copy.className = "batch-action-btn";
      copy.type = "button";
      copy.textContent = t("copy");
      copy.addEventListener("click", () => navigator.clipboard.writeText(result.content || "").catch(() => {}));
      actions.append(followUp, copy);
    }
    if (actions.childElementCount) body.appendChild(actions);
    card.append(summary, body);
    list.appendChild(card);
  });

  node.append(header, list);
  if (completed > 1) {
    const compare = document.createElement("button");
    compare.className = "batch-action-btn";
    compare.type = "button";
    compare.style.marginTop = "8px";
    compare.textContent = t("batch-compare-all");
    compare.addEventListener("click", () => activateBatchScope(message.batchId, null));
    node.appendChild(compare);
  }
}

function addMessage(role, content, animate = false, imageOrImages = null, messageMeta = null) {
  const emptyState = UI.messagesContainer.querySelector(".empty-state");
  if (emptyState) {
    emptyState.remove();
  }

  const node = document.createElement("div");
  node.className = `message ${role}` + (animate ? " enter" : "");

  const images = Array.isArray(imageOrImages)
    ? imageOrImages.filter(Boolean)
    : imageOrImages ? [imageOrImages] : [];

  if (role === "assistant" && messageMeta?.analysisMode === "per-image-results") {
    renderBatchResultsMessage(node, messageMeta);
  } else if (role === "assistant") {
    node.innerHTML = renderMarkdown(content || "");
    addCopyButton(node, content || "");
  } else if (images.length) {
    node.classList.add("has-image");
    if (messageMeta?.analysisMode) {
      const badge = document.createElement("div");
      badge.className = "message-analysis-badge";
      badge.textContent = t(messageMeta.analysisMode === "per-image" ? "analysis-per-image" : "analysis-combined");
      node.appendChild(badge);
    }
    const gallery = document.createElement("div");
    gallery.className = "message-user-images";
    images.forEach((image, index) => {
      const wrap = document.createElement("div");
      wrap.className = "message-user-image-wrap";
      const preview = createMessageImagePreview(image);
      const name = document.createElement("div");
      name.className = "message-user-image-name";
      name.textContent = `${index + 1}. ${image.name || "Attached image"}`;
      wrap.append(preview, name);
      gallery.appendChild(wrap);
    });

    const text = document.createElement("div");
    text.className = "message-user-text";
    text.textContent = content || "";
    node.append(gallery, text);
  } else {
    node.textContent = content || "";
  }

  UI.messagesContainer.appendChild(node);
  UI.messagesContainer.scrollTop = UI.messagesContainer.scrollHeight;
  return node;
}

// Copy-to-clipboard button with animated checkmark draw-on confirmation.
function addCopyButton(node, text) {
  const btn = document.createElement("button");
  btn.className = "copy-btn";
  btn.type = "button";
  btn.title = t("copy");
  btn.setAttribute("aria-label", t("copy"));
  btn.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<g class="ic-copy">' +
    '<rect x="9" y="9" width="11" height="11" rx="2.4"/>' +
    '<path d="M5 15V6a2 2 0 0 1 2-2h9"/>' +
    '</g>' +
    '<path class="ic-check" d="M5 12.5 10 17.5 19.5 7"/>' +
    '</svg>';
  btn.addEventListener("click", async (e) => {
    e.stopPropagation();
    try {
      // Use the same mechanism as manual selection copy: mount a hidden clone,
      // select its contents, and let the browser's native copy pipeline handle
      // all clipboard formats (text/html with Fragment markers, text/plain,
      // CF_HTML for Word/Outlook, etc.).  This is identical to what the browser
      // does when the user selects text and presses Ctrl+C, so tables, colours
      // and all other formatting are preserved automatically.
      const clone = node.cloneNode(true);
      clone.querySelector(".copy-btn")?.remove();

      const temp = document.createElement("div");
      temp.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0;pointer-events:none;white-space:pre-wrap;";
      temp.appendChild(clone);
      document.body.appendChild(temp);

      const range = document.createRange();
      range.selectNodeContents(temp);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);

      let ok = false;
      try {
        ok = document.execCommand("copy");
      } finally {
        sel.removeAllRanges();
        document.body.removeChild(temp);
      }

      // execCommand fallback: if somehow unavailable, use writeText
      if (!ok) {
        await navigator.clipboard.writeText(node.textContent || "");
      }

      btn.classList.add("copied");
      btn.title = t("copied");
      clearTimeout(btn._t);
      btn._t = setTimeout(() => {
        btn.classList.remove("copied");
        btn.title = t("copy");
      }, 1600);
    } catch { /* clipboard unavailable */ }
  });
  node.appendChild(btn);
}

// Assistant "thinking" bubble shown while awaiting a reply.
function showTypingIndicator() {
  hideTypingIndicator();
  const emptyState = UI.messagesContainer.querySelector(".empty-state");
  if (emptyState) emptyState.remove();

  const node = document.createElement("div");
  node.className = "message assistant typing-indicator enter";
  node.id = "typingIndicator";
  node.innerHTML =
    '<svg class="typing-dots" viewBox="0 0 44 12" aria-hidden="true">' +
    '<circle cx="6" cy="6" r="4"/><circle cx="22" cy="6" r="4"/><circle cx="38" cy="6" r="4"/>' +
    "</svg>";
  UI.messagesContainer.appendChild(node);
  UI.messagesContainer.scrollTop = UI.messagesContainer.scrollHeight;
}

function hideTypingIndicator() {
  const node = document.getElementById("typingIndicator");
  if (node) node.remove();
}

function addSystemMessage(content) {
  const emptyState = UI.messagesContainer.querySelector(".empty-state");
  if (emptyState) {
    emptyState.remove();
  }

  const node = document.createElement("div");
  node.className = "message system";
  node.textContent = content;
  UI.messagesContainer.appendChild(node);
  UI.messagesContainer.scrollTop = UI.messagesContainer.scrollHeight;
}

function renderMessages() {
  UI.messagesContainer.innerHTML = "";

  if (!state.messages.length) {
    if (getChatImage()) {
      showQuickQuestions();
    } else {
      renderEmptyState();
    }
    return;
  }

  state.messages.forEach((message) => {
    addMessage(message.role, message.content, false, getMessageImages(message), message);
  });

  if (getChatImage()) {
    showQuickQuestions();
  }
}

function isAnthropicModelRestricted(model) {
  // All Anthropic models are now available
  return false;
}

function getSelectableModels() {
  return state.models.filter((model) => !isAnthropicModelRestricted(model));
}

function renderModelOptions() {
  UI.modelSelect.innerHTML = "";

  function appendVerifyAction() {
    const sep = document.createElement("option");
    sep.value = "";
    sep.disabled = true;
    sep.textContent = "──────────";
    UI.modelSelect.appendChild(sep);

    const verify = document.createElement("option");
    verify.value = VERIFY_MODELS_ACTION;
    verify.textContent = t("verify-models");
    UI.modelSelect.appendChild(verify);
  }

  if (!state.models.length) {
    const option = document.createElement("option");
    option.value = DEFAULT_MODEL;
    option.textContent = `${DEFAULT_MODEL} (0/0)`;
    UI.modelSelect.appendChild(option);
    appendVerifyAction();
    UI.modelSelect.value = DEFAULT_MODEL;
    return;
  }

  function appendModelGroup(models, label) {
    if (!models.length) return;

    const header = document.createElement("option");
    header.value = "";
    header.disabled = true;
    header.textContent = `--- ${label} ---`;
    UI.modelSelect.appendChild(header);

    const useGnai = isGnaiKey(state.selectedApiKey || "");
    models.forEach((model) => {
      const option = document.createElement("option");
      option.value = model;
      const isRestricted = isAnthropicModelRestricted(model);
      option.disabled = isRestricted;
      if (useGnai) {
        option.textContent = isRestricted
          ? `${model} [${t("model-restricted-tag")}]`
          : model;
      } else {
        const quota = state.modelQuotas[model] || { used: 0, limit: 0 };
        option.textContent = isRestricted
          ? `${model} (${quota.used}/${quota.limit}) [${t("model-restricted-tag")}]`
          : `${model} (${quota.used}/${quota.limit})`;
      }
      UI.modelSelect.appendChild(option);
    });
  }

  appendModelGroup(state.openaiModels, "OpenAI");
  appendModelGroup(state.anthropicModels, "Anthropic");
  appendVerifyAction();

  const selectableModels = getSelectableModels();

  if (!state.models.includes(state.selectedModel) || isAnthropicModelRestricted(state.selectedModel)) {
    state.selectedModel = selectableModels[0] || state.models[0];
  }

  UI.modelSelect.value = state.selectedModel;
}

function renderGenerationModelOptions() {
  const models = state.generationModels;
  UI.imageModelSelect.replaceChildren();
  if (!models.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "No verified image model";
    UI.imageModelSelect.appendChild(option);
    UI.imageModelSelect.disabled = true;
    return;
  }
  UI.imageModelSelect.disabled = false;
  models.forEach((model) => {
    const option = document.createElement("option");
    option.value = model;
    option.textContent = model;
    UI.imageModelSelect.appendChild(option);
  });
  if (!models.includes(state.selectedGenerationModel)) {
    state.selectedGenerationModel = models.includes(DEFAULT_GENERATION_MODEL)
      ? DEFAULT_GENERATION_MODEL
      : models[0];
  }
  UI.imageModelSelect.value = state.selectedGenerationModel;
}

function syncModelQuotasFromQuota(quota) {
  const modelQuotas = quota?.model_quotas || {};
  const mapped = {};

  Object.keys(modelQuotas).forEach((model) => {
    const info = modelQuotas[model] || {};
    mapped[model] = {
      used: Number(info.used ?? 0),
      limit: Number(info.limit ?? 0),
      remaining: Number(info.remaining ?? 0)
    };
  });

  state.modelQuotas = mapped;
  renderModelOptions();
}

async function fetchQuotaFromApi() {
  return sendRuntimeMessage({
    type: "GET_QUOTA",
    apiKey: state.selectedApiKey
  });
}

function incrementModelUsage(model) {
  if (!model) return;

  const current = state.modelQuotas[model] || { used: 0, limit: 0, remaining: 0 };
  const nextUsed = Number(current.used || 0) + 1;
  const nextLimit = Number(current.limit || 0);
  const nextRemaining = Math.max(nextLimit - nextUsed, 0);

  state.modelQuotas[model] = {
    ...current,
    used: nextUsed,
    remaining: nextRemaining
  };

  renderModelOptions();
}

async function saveState() {
  commitActiveTab();
  commitActiveImageTab();
  await chrome.storage.local.set({
    [STORAGE_KEYS.selectedApiKey]: state.selectedApiKey,
    [STORAGE_KEYS.selectedModel]: state.selectedModel,
    [STORAGE_KEYS.selectedGenerationModel]: state.selectedGenerationModel,
    [STORAGE_KEYS.workspaceMode]: imageState.mode,
    [STORAGE_KEYS.language]: state.currentLanguage,
    [STORAGE_KEYS.savedPrompts]: state.savedPrompts,
    [STORAGE_KEYS.imageSavedPrompts]: state.imageSavedPrompts,
    [STORAGE_KEYS.panelMode]: state.panelMode,
    [STORAGE_KEYS.verifiedModels]: state.verifiedModels,
    kc_tabs: tabs,
    kc_active_tab_id: state.activeTabId,
    kc_next_tab_id: state.nextTabId,
    kc_image_tabs: imageTabs.map(serializeImageTab),
    kc_active_image_tab_id: state.activeImageTabId,
    kc_next_image_tab_id: state.nextImageTabId,
  });
}

async function initializeState() {
  const stored = await chrome.storage.local.get([
    STORAGE_KEYS.selectedApiKey,
    STORAGE_KEYS.selectedModel,
    STORAGE_KEYS.selectedGenerationModel,
    STORAGE_KEYS.workspaceMode,
    STORAGE_KEYS.language,
    STORAGE_KEYS.messages,
    STORAGE_KEYS.pageContent,
    STORAGE_KEYS.savedPrompts,
    STORAGE_KEYS.imageSavedPrompts,
    STORAGE_KEYS.panelMode,
    STORAGE_KEYS.verifiedModels,
    "kc_tabs",
    "kc_active_tab_id",
    "kc_next_tab_id",
    "kc_image_tabs",
    "kc_active_image_tab_id",
    "kc_next_image_tab_id",
  ]);

  // Backward compatibility: migrate first valid key from legacy apiKeys[] storage.
  const keys = Array.isArray(stored.apiKeys) ? stored.apiKeys : [];
  const firstStoredKey = keys.find((key) => isValidApiKey(String(key)));
  const selectedKey = stored[STORAGE_KEYS.selectedApiKey];

  state.selectedApiKey = isValidApiKey(selectedKey) ? selectedKey : firstStoredKey || "";
  state.openaiModels = [];
  state.anthropicModels = [];
  const storedVerified = stored[STORAGE_KEYS.verifiedModels];
  const verificationSchema = Number(storedVerified?.verificationSchema || 1);
  state.verifiedModels = (storedVerified && typeof storedVerified === "object")
    ? {
        openai: Array.isArray(storedVerified.openai) ? storedVerified.openai : [],
        anthropic: Array.isArray(storedVerified.anthropic) ? storedVerified.anthropic : [],
        generation: verificationSchema >= 2 && Array.isArray(storedVerified.generation)
          ? storedVerified.generation
          : [...DEFAULT_GENERATION_MODELS],
        verificationSchema,
        verifiedAt: storedVerified.verifiedAt || null
      }
    : null;
  if (state.verifiedModels?.verifiedAt) {
    state.generationModels = [...state.verifiedModels.generation];
  }
  state.currentLanguage = stored[STORAGE_KEYS.language] || "zh-TW";
  state.selectedGenerationModel = typeof stored[STORAGE_KEYS.selectedGenerationModel] === "string"
    ? stored[STORAGE_KEYS.selectedGenerationModel]
    : DEFAULT_GENERATION_MODEL;
  if (Array.isArray(stored.kc_image_tabs) && stored.kc_image_tabs.length) {
    imageTabs = stored.kc_image_tabs
      .filter((tab) => Number.isInteger(tab?.id))
      .map((tab) => createImageTab(tab.id, tab));
  }
  if (!imageTabs.length) imageTabs = [createImageTab(0)];
  state.activeImageTabId = stored.kc_active_image_tab_id ?? imageTabs[0].id;
  if (!imageTabs.some((tab) => tab.id === state.activeImageTabId)) {
    state.activeImageTabId = imageTabs[0].id;
  }
  const minimumNextImageTabId = Math.max(...imageTabs.map((tab) => tab.id)) + 1;
  state.nextImageTabId = Math.max(stored.kc_next_image_tab_id ?? minimumNextImageTabId, minimumNextImageTabId);
  imageState.mode = stored[STORAGE_KEYS.workspaceMode] === "image" ? "image" : "chat";
  state.savedPrompts = Array.isArray(stored[STORAGE_KEYS.savedPrompts]) ? stored[STORAGE_KEYS.savedPrompts] : [];
  state.imageSavedPrompts = Array.isArray(stored[STORAGE_KEYS.imageSavedPrompts]) ? stored[STORAGE_KEYS.imageSavedPrompts] : [];
  state.panelMode = stored[STORAGE_KEYS.panelMode] || "sidepanel";
  // URL param is ground truth: no srcWindowId means we're in the sidepanel, not a popup.
  if (POPUP_SRC_WINDOW_ID === null) {
    state.panelMode = "sidepanel";
  } else {
    state.panelMode = "popup";
  }

  // Load tabs or migrate from legacy flat storage
  if (Array.isArray(stored.kc_tabs) && stored.kc_tabs.length > 0) {
    tabs = stored.kc_tabs;
    state.activeTabId = stored.kc_active_tab_id ?? tabs[0].id;
    state.nextTabId   = stored.kc_next_tab_id   ?? tabs.length;
    if (!tabs.find(t => t.id === state.activeTabId)) state.activeTabId = tabs[0].id;
  } else {
    tabs = [{
      id: 0,
      messages:      Array.isArray(stored[STORAGE_KEYS.messages]) ? stored[STORAGE_KEYS.messages] : [],
      pageContent:   stored[STORAGE_KEYS.pageContent] || null,
      selectedModel: stored[STORAGE_KEYS.selectedModel] || DEFAULT_MODEL,
      sessionSaved:  false,
    }];
    state.activeTabId = 0;
    state.nextTabId   = 1;
  }

  // Load active tab into state
  const activeTab = tabs.find(t => t.id === state.activeTabId) || tabs[0];
  state.messages      = activeTab.messages;
  state.pageContent   = activeTab.pageContent;
  state.selectedModel = activeTab.selectedModel || DEFAULT_MODEL;
  state.sessionSaved  = activeTab.sessionSaved  || false;
  await hydrateChatImagesForTabs();
  await hydrateImageGenerationTabs();

  // Apply popup-mode CSS class
  if (state.panelMode === "popup") {
    document.body.classList.add("popup-mode");
  } else {
    document.body.classList.remove("popup-mode");
  }
  updatePanelModeBtn();

  renderModelOptions();
  renderGenerationModelOptions();
  renderTabBar();
  loadActiveImageTab();
  renderMessages();
  renderChatImageAttachment();

  if (state.pageContent) {
    showPageInfo(
      state.pageContent.title,
      state.pageContent.url,
      state.pageContent.isYouTubeTranscript ? state.pageContent.text : null
    );
  }

  updateUILanguage();
  switchWorkspace(imageState.mode);
  await saveState();
}

function updatePanelModeBtn() {
  if (!UI.panelModeBtn) return;
  if (imageTabs.some((tab) => tab.busy)) {
    UI.panelModeBtn.title = t("panel-mode-disabled-generating");
    UI.panelModeBtn.setAttribute("aria-label", t("panel-mode-disabled-generating"));
    return;
  }
  if (state.panelMode === "popup") {
    UI.panelModeBtn.title = t("panel-mode-to-sidepanel");
    UI.panelModeBtn.setAttribute("aria-label", t("panel-mode-to-sidepanel"));
  } else {
    UI.panelModeBtn.title = t("panel-mode-to-popup");
    UI.panelModeBtn.setAttribute("aria-label", t("panel-mode-to-popup"));
  }
}

async function togglePanelMode() {
  if (imageTabs.some((tab) => tab.busy)) return;

  const newMode = state.panelMode === "popup" ? "sidepanel" : "popup";
  state.panelMode = newMode;

  if (newMode === "popup") {
    document.body.classList.add("popup-mode");
  } else {
    document.body.classList.remove("popup-mode");
    // Call sidePanel.open() immediately — before any await — to preserve the
    // user gesture context (Chrome requires it to be synchronous in the handler).
    if (POPUP_SRC_WINDOW_ID) {
      chrome.sidePanel.open({ windowId: POPUP_SRC_WINDOW_ID }).catch(() => {});
    }
  }

  updatePanelModeBtn();
  await saveState();

  const response = await sendRuntimeMessage({ type: "SET_PANEL_MODE", mode: newMode });
  if (response?.ok) {
    window.close();
  } else {
    setStatus("error", response?.error || "Mode switch failed");
  }
}

// ── Tab management ──────────────────────────────────────────────────────────
function commitActiveTab() {
  const tab = tabs.find(t => t.id === state.activeTabId);
  if (!tab) return;
  tab.messages      = state.messages;
  tab.pageContent   = state.pageContent;
  tab.selectedModel = state.selectedModel;
  tab.sessionSaved  = state.sessionSaved;
  tab.activeImageGroup = serializeChatImageGroup(getChatImageGroup());
  tab.activeImageId = null;
}

const TAB_LABEL_DISPLAY_LENGTH = 22;

function truncateTabLabel(text, maxLength = TAB_LABEL_DISPLAY_LENGTH) {
  const normalized = String(text || "").trim().replace(/\s+/g, " ");
  return normalized.length > maxLength
    ? normalized.slice(0, maxLength) + "\u2026"
    : normalized;
}

function compactQuestionForTab(question) {
  const original = String(question || "").trim().replace(/\s+/g, " ");
  if (!original) return "";

  let compact = original
    .replace(/^(?:請|请)\s*(?:幫我|帮我)?\s*/i, "")
    .replace(/^(?:please\s+)?(?:analyze|analyse|summarize|summarise|explain)\s+(?:this|the)\s+(?:image|picture|chart|slide)\s*(?:and\s+)?/i, "")
    .replace(/^(?:分析|解析|說明|说明|摘要|總結|总结)\s*(?:這|这)?\s*(?:張|张)?\s*(?:圖表|图表|圖片|图片|投影片|幻灯片|圖|图)\s*(?:的|並|并|，|,|：|:)?\s*/i, "")
    .replace(/[。.!！?？]+$/, "")
    .trim();

  if (!compact) compact = original;
  return truncateTabLabel(compact, 26);
}

function imageNameForTab(imageName) {
  const name = String(imageName || "").trim().replace(/\.[^.]+$/, "");
  return truncateTabLabel(name, 20);
}

function buildAutoTabLabel(imageName, question) {
  const imagePart = imageNameForTab(imageName);
  const questionPart = compactQuestionForTab(question);
  return [imagePart, questionPart].filter(Boolean).join(" \u00b7 ")
    || imagePart
    || questionPart;
}

function assignAutoTabLabel(tab, imageName, question) {
  if (!tab || tab.autoLabel) return;
  tab.autoLabel = buildAutoTabLabel(imageName, question) || null;
}

function getTabFullLabel(tab) {
  if (tab.customLabel) return tab.customLabel.trim().replace(/\s+/g, " ");
  if (tab.autoLabel) return tab.autoLabel.trim().replace(/\s+/g, " ");
  const firstImageQuestion = tab.messages?.find((message) => (
    message.role === "user" && message.imageName && message.content
  ));
  if (firstImageQuestion) {
    return buildAutoTabLabel(firstImageQuestion.imageName, firstImageQuestion.content);
  }
  if (tab.pageContent?.url === "clipboard://") {
    return t("clipboard-tab-label");
  }
  if (tab.pageContent?.title) {
    return tab.pageContent.title.trim().replace(/\s+/g, " ");
  }
  // No page loaded — use the first user message as the label
  const firstUser = tab.messages?.find(m => m.role === "user");
  if (firstUser?.content) {
    return firstUser.content.trim().replace(/\s+/g, " ");
  }
  const tabNumber = Math.max(tabs.findIndex((item) => item.id === tab.id) + 1, 1);
  return t("new-tab-label", { number: String(tabNumber) });
}

function getTabLabel(tab) {
  return truncateTabLabel(getTabFullLabel(tab));
}

function renderTabBar() {
  const bar = document.getElementById("tabBar");
  if (!bar) return;
  const tabBar = createScrollableTabBar(bar, addTab);
  const strip = tabBar.strip;

  let dragSrcId = null;

  tabs.forEach(tab => {
    const btn = document.createElement("button");
    btn.className = "tab-item" + (tab.id === state.activeTabId ? " active" : "");
    btn.draggable = true;
    btn.dataset.tabId = tab.id;

    const label = document.createElement("span");
    label.className = "tab-label";
    const fullLabel = getTabFullLabel(tab);
    label.textContent = truncateTabLabel(fullLabel);
    label.title = `${fullLabel}\n${t("tab-rename-hint")}`;
    label.setAttribute("aria-label", fullLabel);
    label.addEventListener("dblclick", e => {
      e.stopPropagation();
      startTabRename(tab, label, btn);
    });
    btn.appendChild(label);

    if (tabs.length > 1) {
      const close = document.createElement("span");
      close.className = "tab-close";
      close.textContent = "\xd7";
      close.addEventListener("click", e => { e.stopPropagation(); closeTab(tab.id); });
      btn.appendChild(close);
    }

    btn.addEventListener("click", () => switchTab(tab.id));

    // ── Drag-and-drop reorder ──
    btn.addEventListener("dragstart", e => {
      dragSrcId = tab.id;
      e.dataTransfer.effectAllowed = "move";
      btn.classList.add("dragging");
    });
    btn.addEventListener("dragend", () => {
      btn.classList.remove("dragging");
      strip.querySelectorAll(".tab-item").forEach(b => b.classList.remove("drag-over"));
    });
    btn.addEventListener("dragover", e => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      if (dragSrcId !== tab.id) btn.classList.add("drag-over");
    });
    btn.addEventListener("dragleave", () => btn.classList.remove("drag-over"));
    btn.addEventListener("drop", e => {
      e.preventDefault();
      btn.classList.remove("drag-over");
      if (dragSrcId === null || dragSrcId === tab.id) return;
      commitActiveTab();
      const srcIdx  = tabs.findIndex(t => t.id === dragSrcId);
      const destIdx = tabs.findIndex(t => t.id === tab.id);
      if (srcIdx === -1 || destIdx === -1) return;
      const [moved] = tabs.splice(srcIdx, 1);
      tabs.splice(destIdx, 0, moved);
      renderTabBar();
      saveState();
    });

    strip.appendChild(btn);
  });
  tabBar.finish();
}

// Inline-rename a tab: swap the label for a text input, commit on Enter/blur,
// cancel on Escape. An empty value clears the custom label (auto label returns).
function startTabRename(tab, label, btn) {
  const input = document.createElement("input");
  input.className = "tab-rename-input";
  input.value = tab.customLabel || getTabFullLabel(tab);
  input.maxLength = 40;
  const wasDraggable = btn.draggable;
  btn.draggable = false;

  label.replaceWith(input);
  input.focus();
  input.select();

  let done = false;
  const finish = commit => {
    if (done) return;
    done = true;
    btn.draggable = wasDraggable;
    if (commit) {
      const v = input.value.trim();
      tab.customLabel = v || null;
      saveState();
    }
    renderTabBar();
  };
  input.addEventListener("keydown", e => {
    e.stopPropagation();
    if (e.key === "Enter") { e.preventDefault(); finish(true); }
    else if (e.key === "Escape") { e.preventDefault(); finish(false); }
  });
  input.addEventListener("blur", () => finish(true));
  input.addEventListener("click", e => e.stopPropagation());
  input.addEventListener("dblclick", e => e.stopPropagation());
}

async function addTab() {
  commitActiveTab();
  const id = state.nextTabId;
  state.nextTabId++;
  tabs.push({ id, messages: [], pageContent: null, selectedModel: state.selectedModel, sessionSaved: false });
  state.activeTabId  = id;
  state.messages     = [];
  state.pageContent  = null;
  state.sessionSaved = false;
  renderTabBar();
  hidePageInfo();
  renderMessages();
  renderChatImageAttachment();
  UI.modelSelect.value = state.selectedModel;
  await saveState();
}

async function switchTab(id) {
  if (id === state.activeTabId) return;
  commitActiveTab();
  state.activeTabId = id;
  const tab = tabs.find(t => t.id === id) || tabs[0];
  state.messages      = tab.messages;
  state.pageContent   = tab.pageContent;
  state.selectedModel = tab.selectedModel;
  state.sessionSaved  = tab.sessionSaved;
  renderTabBar();
  renderMessages();
  renderChatImageAttachment();
  UI.modelSelect.value = state.selectedModel;
  if (state.pageContent) showPageInfo(
    state.pageContent.title,
    state.pageContent.url,
    state.pageContent.isYouTubeTranscript ? state.pageContent.text : null
  );
  else hidePageInfo();
  await saveState();
}

async function closeTab(id) {
  const idx = tabs.findIndex(t => t.id === id);
  if (idx === -1) return;

  // Determine whether this tab has unsaved content.
  // For the active tab use state.* (may have uncommitted changes);
  // for non-active tabs read directly from tabs[].
  const isActive = id === state.activeTabId;
  const tabData  = isActive ? state : tabs[idx];
  const hasUnsaved = tabData.messages.length > 0 && !tabData.sessionSaved;

  if (hasUnsaved) {
    // Switch to the tab so the user can see what they're being asked to save,
    // and so that downloadSession() operates on the correct content.
    if (!isActive) await switchTab(id);
    const choice = await showConfirmSaveDialog();
    if (choice === "cancel") return;
    if (choice === "yes") await downloadSession();
  }
  const imageIdsToDelete = new Set();
  (tabs[idx].messages || []).forEach((message) => {
    collectMessageImageIds(message).forEach((imageId) => imageIdsToDelete.add(imageId));
  });
  (tabs[idx].activeImageGroup?.imageIds || []).forEach((imageId) => imageIdsToDelete.add(imageId));
  if (tabs[idx].activeImageId) imageIdsToDelete.add(tabs[idx].activeImageId);
  getChatImages(id).forEach((image) => imageIdsToDelete.add(image.id));
  tabs.splice(idx, 1);
  chatImagesByTab.delete(id);
  await Promise.all([...imageIdsToDelete].map(deleteChatImageAsset));
  if (tabs.length === 0) {
    tabs.push({ id: state.nextTabId, messages: [], pageContent: null, selectedModel: DEFAULT_MODEL, sessionSaved: false });
    state.nextTabId++;
  }
  if (id === state.activeTabId) {
    const next = tabs[Math.min(idx, tabs.length - 1)];
    state.activeTabId   = next.id;
    state.messages      = next.messages;
    state.pageContent   = next.pageContent;
    state.selectedModel = next.selectedModel;
    state.sessionSaved  = next.sessionSaved;
  }
  renderTabBar();
  renderMessages();
  renderChatImageAttachment();
  UI.modelSelect.value = state.selectedModel;
  if (state.pageContent) showPageInfo(
    state.pageContent.title,
    state.pageContent.url,
    state.pageContent.isYouTubeTranscript ? state.pageContent.text : null
  );
  else hidePageInfo();
  await saveState();
}

const QUICK_QUESTIONS = [
  { key: "concise",   icon: `<path d="M8 6h13M8 12h13M8 18h13"/><path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01"/>` },
  { key: "keydata",   icon: `<path d="M3 21h18"/><rect x="5" y="11" width="3.4" height="7" rx="1"/><rect x="10.3" y="6" width="3.4" height="12" rx="1"/><rect x="15.6" y="14" width="3.4" height="4" rx="1"/>` },
  { key: "rootcause", icon: `<circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/>` },
  { key: "risk",      icon: `<path d="M12 3 2 20h20L12 3Z"/><path d="M12 10v4"/><path d="M12 17h.01"/>` },
  { key: "action",    icon: `<path d="M9 11l3 3L20 5"/><path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h9"/>` },
  { key: "quiz",      icon: `<rect x="6" y="4" width="12" height="16" rx="2"/><path d="M9 4V3h6v1"/><path d="M9 12.5l2 2 4-4.5"/>` },
];

const IMAGE_QUICK_TEMPLATES = [
  {
    id: "synthesize",
    requiresReferences: true,
    icon: `<path d="M4 5h6v6H4zM14 5h6v6h-6zM9 15h6v6H9z"/><path d="M7 11v2h5v2M17 11v2h-5"/>`,
    fields: []
  },
  {
    id: "beautify",
    requiresReferences: true,
    icon: `<path d="m12 3-1.5 3.5L7 8l3.5 1.5L12 13l1.5-3.5L17 8l-3.5-1.5Z"/><path d="M5 14v6h14v-6"/>`,
    fields: []
  },
  {
    id: "variation",
    requiresReferences: true,
    icon: `<path d="M4 7h10a4 4 0 0 1 4 4v6"/><path d="m15 14 3 3 3-3"/><path d="M4 17h6M4 12h4"/>`,
    fields: []
  },
  {
    id: "intel-dataviz",
    requiresReferences: true,
    requiresUserReferences: true,
    icon: `<path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/><path d="m3 6 6-3 6 5 6-5"/>`,
    fields: []
  },
  {
    id: "scene",
    requiresReferences: true,
    icon: `<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m3 17 5-4 4 3 3-2 6 4"/>`,
    fields: [
      { key: "subject", labelKey: "image-field-subject", multiline: false },
      { key: "scene", labelKey: "image-field-scene", multiline: false },
      { key: "action", labelKey: "image-field-action", multiline: false }
    ]
  },
  {
    id: "style",
    requiresReferences: true,
    icon: `<path d="M12 3a9 9 0 1 0 0 18h1.5a2 2 0 0 0 0-4H12a2 2 0 0 1 0-4h5a4 4 0 0 0 0-8Z"/><circle cx="7.5" cy="10" r=".5"/><circle cx="10" cy="7" r=".5"/>`,
    fields: [
      { key: "style", labelKey: "image-field-style", multiline: false },
      { key: "mood", labelKey: "image-field-mood", multiline: false }
    ]
  },
  {
    id: "poster",
    icon: `<rect x="4" y="3" width="16" height="18" rx="2"/><circle cx="12" cy="9" r="3"/><path d="M7 17h10M9 14h6"/>`,
    fields: [
      { key: "subject", labelKey: "image-field-subject", multiline: false },
      { key: "headline", labelKey: "image-field-headline", multiline: false },
      { key: "sellingPoints", labelKey: "image-field-selling-points", multiline: true }
    ]
  },
  {
    id: "silhouette",
    icon: `<path d="M6 21c1-5 1-8 0-12 4-5 10-5 13 0-3 1-4 3-3 5 1 3 0 5-2 7Z"/><path d="M9 9c2 1 4 1 7 0M10 13h4"/>`,
    fields: [
      { key: "theme", labelKey: "image-field-theme", multiline: false },
      { key: "character", labelKey: "image-field-character", multiline: false },
      { key: "elements", labelKey: "image-field-elements", multiline: true }
    ]
  }
];

const IMAGE_PROMPT_TEMPLATES = {
  "zh-TW": {
    synthesize: "綜整所有參考圖片的主題、構圖與視覺元素，生成一張完整且協調的圖片。保留各參考圖最具辨識度的特徵，避免生硬拼貼。若畫面包含文字，請使用繁體中文。",
    beautify: "以參考圖片為基礎，自動改善構圖、主體位置、視覺層級、留白、色彩平衡與光影。保留原本主體、內容與辨識特徵，修正不自然的比例、透視和畫面干擾，使結果更完整、專業且有視覺焦點。不要加入無關物件，不要改變角色或產品設定。若畫面包含文字，請使用繁體中文。",
    variation: "以參考圖片為基礎生成一個具有創意差異的新版本。保留主體身份、核心造型、主要配色與辨識特徵，重新探索姿勢、視角、構圖、光線與環境細節。新版本需明顯不同但仍忠於原始設定，比例自然、畫面完整，避免重複主體與多餘肢體。若畫面包含文字，請使用繁體中文。",
    "intel-dataviz": "將使用者提供的參考圖片重新設計為 Intel-inspired premium corporate data visualization。使用者參考圖是唯一的資料與內容來源：精確保留其中的標題、分類、數值、百分比、單位、趨勢與資料關係，不得複製最後一張風格參考圖中的 Noise、Intel Issue、Customer、3rd Party、47 cases 或其他範例資料。最後一張參考圖只用於視覺風格。依資料類型選擇最清楚的圖表，不必強制使用圓環圖。採用精準、工程導向、可信賴、乾淨、現代且企業級的設計；使用大量留白、低至中密度、清楚層級及細線圖示。色盤限定為 Intel blue #0068B5、deep navy #00285A、soft blue #7FB7E6、mist blue #DCEAF6、steel gray #8FA1B3、cool gray #D6DEE7、muted teal #7FAEB5、graphite #233142、secondary text #6B7785、divider #D7DEE6 與 white #FFFFFF。背景使用 #F5F8FB、#EAF0F6、#FFFFFF 的柔和淺灰藍漸層與極淡霧面顆粒；可使用克制的半透明磨砂玻璃、細白邊緣高光、柔和低透明環境陰影，以及少量 #1E90FF 光點。字體呈現 Intel Clear／SF Pro／Inter 類型的現代企業質感。避免彩虹色、Excel 預設圖表、厚邊框、卡通圖示、繁忙背景、厚重 3D、凌亂標籤、重陰影與廉價 PowerPoint 模板感。所有可見文字使用繁體中文，且必須清楚、正確、可讀。",
    scene: "以參考圖片中的「{{subject}}」為主要角色，忠實保留外觀、服裝、配色、比例與辨識特徵，將場景改為「{{scene}}」，呈現「{{action}}」。讓主體自然融入新環境，統一透視、光線、陰影與色溫；不要改變角色設定，不要出現多餘肢體或重複主體。若畫面包含文字，請使用繁體中文。",
    style: "將參考圖片重新詮釋為「{{style}}」風格，營造「{{mood}}」氛圍。保留原圖主體、角色設定、關鍵造型與主要構圖，只改變繪製技法、材質、色彩、光影與視覺語言。避免改變人物身份與核心辨識特徵。若畫面包含文字，請使用繁體中文。",
    poster: "以「{{subject}}」為主視覺，參考已附加圖片忠實還原造型與細節，製作高完成度商業海報。主體清楚突出，保留適當留白與明確視覺層級，加入標題「{{headline}}」及重點「{{sellingPoints}}」。使用專業排版、統一光影與精緻材質，避免廉價模板感、雜亂背景及無關裝飾。畫面文字使用繁體中文。",
    silhouette: "根據「{{theme}}」生成一張收藏版史詩敘事海報：以巨大的「{{character}}」側臉剪影作為外輪廓，並參考已附加圖片還原角色。剪影內部自然生長出「{{elements}}」相關場景、符號與氛圍。整體採用高級的剪影輪廓填充式敘事合成，不使用普通拼貼；帶有雙重曝光聯想，融合電影海報與夢幻水彩插畫。使用柔和空氣透視、輕霧化過渡、紙張顆粒、邊緣飛白與刷痕，保留大面積留白。版式克制高級，營造安靜、宏大、神聖、懷舊、詩意與傳說感。風格、色彩、場景與材質需依主題自動調整；所有元素必須與主題緊密相關、清楚可辨。避免雜亂、硬式拼貼、模板化背景與廉價奇幻素材。若畫面包含文字，請使用繁體中文。"
  },
  "zh-CN": {
    synthesize: "综合所有参考图片的主题、构图与视觉元素，生成一张完整且协调的图片。保留各参考图最具辨识度的特征，避免生硬拼贴。如果画面包含文字，请使用简体中文。",
    beautify: "以参考图片为基础，自动改善构图、主体位置、视觉层级、留白、色彩平衡与光影。保留原有主体、内容与辨识特征，修正不自然的比例、透视和画面干扰，使结果更完整、专业且具有视觉焦点。不要加入无关物体，不要改变角色或产品设定。如果画面包含文字，请使用简体中文。",
    variation: "以参考图片为基础生成一个具有创意差异的新版本。保留主体身份、核心造型、主要配色与辨识特征，重新探索姿势、视角、构图、光线与环境细节。新版本需明显不同但仍忠于原始设定，比例自然、画面完整，避免重复主体与多余肢体。如果画面包含文字，请使用简体中文。",
    "intel-dataviz": "将用户提供的参考图片重新设计为 Intel-inspired premium corporate data visualization。用户参考图是唯一的数据与内容来源：精确保留其中的标题、分类、数值、百分比、单位、趋势和数据关系，不得复制最后一张风格参考图中的 Noise、Intel Issue、Customer、3rd Party、47 cases 或其他示例数据。最后一张参考图仅用于视觉风格。根据数据类型选择最清楚的图表，不必强制使用圆环图。采用精准、工程导向、可信赖、干净、现代且企业级的设计；使用大量留白、低至中密度、清楚层级及细线图标。色板限定为 Intel blue #0068B5、deep navy #00285A、soft blue #7FB7E6、mist blue #DCEAF6、steel gray #8FA1B3、cool gray #D6DEE7、muted teal #7FAEB5、graphite #233142、secondary text #6B7785、divider #D7DEE6 和 white #FFFFFF。背景使用 #F5F8FB、#EAF0F6、#FFFFFF 的柔和浅灰蓝渐变与极淡哑光颗粒；可使用克制的半透明磨砂玻璃、细白边缘高光、柔和低透明环境阴影，以及少量 #1E90FF 光点。字体呈现 Intel Clear／SF Pro／Inter 类型的现代企业质感。避免彩虹色、Excel 默认图表、粗边框、卡通图标、繁忙背景、厚重 3D、凌乱标签、重阴影和廉价 PowerPoint 模板感。所有可见文字使用简体中文，并且必须清楚、正确、可读。",
    scene: "以参考图片中的「{{subject}}」为主要角色，忠实保留外观、服装、配色、比例与辨识特征，将场景改为「{{scene}}」，呈现「{{action}}」。让主体自然融入新环境，统一透视、光线、阴影与色温；不要改变角色设定，不要出现多余肢体或重复主体。如果画面包含文字，请使用简体中文。",
    style: "将参考图片重新诠释为「{{style}}」风格，营造「{{mood}}」氛围。保留原图主体、角色设定、关键造型与主要构图，只改变绘制技法、材质、色彩、光影与视觉语言。避免改变人物身份与核心辨识特征。如果画面包含文字，请使用简体中文。",
    poster: "以「{{subject}}」为主视觉，参考已附加图片忠实还原造型与细节，制作高完成度商业海报。主体清楚突出，保留适当留白与明确视觉层级，加入标题「{{headline}}」及重点「{{sellingPoints}}」。使用专业排版、统一光影与精致材质，避免廉价模板感、杂乱背景及无关装饰。画面文字使用简体中文。",
    silhouette: "根据「{{theme}}」生成一张收藏版史诗叙事海报：以巨大的「{{character}}」侧脸剪影作为外轮廓，并参考已附加图片还原角色。剪影内部自然生长出「{{elements}}」相关场景、符号与氛围。整体采用高级的剪影轮廓填充式叙事合成，不使用普通拼贴；带有双重曝光联想，融合电影海报与梦幻水彩插画。使用柔和空气透视、轻雾化过渡、纸张颗粒、边缘飞白与刷痕，保留大面积留白。版式克制高级，营造安静、宏大、神圣、怀旧、诗意与传说感。风格、色彩、场景与材质需根据主题自动调整；所有元素必须与主题紧密相关、清楚可辨。避免杂乱、生硬拼贴、模板化背景与廉价奇幻素材。如果画面包含文字，请使用简体中文。"
  },
  en: {
    synthesize: "Synthesize the subjects, composition, and visual elements from all reference images into one cohesive image. Preserve the most recognizable traits from each reference and avoid rigid collage. Use English for any visible text.",
    beautify: "Use the reference image as the foundation and automatically improve composition, subject placement, visual hierarchy, negative space, color balance, and lighting. Preserve the original subject, content, and identifying traits while correcting awkward proportions, perspective, and distractions. Make the result polished, professional, and visually focused. Do not add unrelated objects or change the character or product design. Use English for any visible text.",
    variation: "Create a distinct creative variation based on the reference image. Preserve the subject identity, core design, main colors, and recognizable traits while exploring a new pose, camera angle, composition, lighting, and environmental detail. The result should feel clearly different while remaining faithful to the source, with natural proportions and no duplicated subjects or extra limbs. Use English for any visible text.",
    "intel-dataviz": "Redesign the user-provided reference images as an Intel-inspired premium corporate data visualization. The user references are the sole source of data and content: preserve every title, category, value, percentage, unit, trend, and data relationship accurately. Do not copy Noise, Intel Issue, Customer, 3rd Party, 47 cases, or any other sample data from the final style reference; the final reference is visual-style guidance only. Choose the clearest chart type for the source data rather than forcing a donut chart. Make the design precise, engineering-driven, trustworthy, clean, modern, and enterprise-grade, with generous whitespace, low-to-medium density, strong hierarchy, and minimalist thin-line icons. Restrict the palette to Intel blue #0068B5, deep navy #00285A, soft blue #7FB7E6, mist blue #DCEAF6, steel gray #8FA1B3, cool gray #D6DEE7, muted teal #7FAEB5, graphite #233142, secondary text #6B7785, divider #D7DEE6, and white #FFFFFF. Use a soft #F5F8FB / #EAF0F6 / #FFFFFF light gray-blue gradient with very subtle matte grain. Apply restrained translucent frosted glass, thin white edge highlights, soft low-opacity ambient shadows, and sparse #1E90FF glow nodes. Typography should feel like Intel Clear, SF Pro, or Inter. Avoid rainbow colors, default Excel charts, thick borders, cartoon icons, busy backgrounds, heavy 3D, messy labels, strong shadows, and low-end PowerPoint styling. All visible text must be clear, accurate, readable English.",
    scene: "Use “{{subject}}” from the reference image as the main subject. Faithfully preserve appearance, clothing, colors, proportions, and identifying traits, but move the subject into “{{scene}}” while showing “{{action}}”. Integrate the subject naturally by unifying perspective, lighting, shadows, and color temperature. Do not alter the character design or create duplicate subjects or extra limbs. Use English for any visible text.",
    style: "Reinterpret the reference image in a “{{style}}” visual style with a “{{mood}}” mood. Preserve the original subject, character design, key shapes, and main composition; change only rendering technique, materials, colors, lighting, and visual language. Do not alter identity or core recognizable traits. Use English for any visible text.",
    poster: "Use “{{subject}}” as the key visual and faithfully reproduce its design and details from any attached references. Create a polished commercial poster with a clear focal point, intentional negative space, and strong hierarchy. Include the headline “{{headline}}” and key points “{{sellingPoints}}”. Use professional typography, unified lighting, and refined materials. Avoid cheap templates, cluttered backgrounds, and unrelated decoration. Use English for all visible text.",
    silhouette: "Create a collectible epic narrative poster based on “{{theme}}”. Use a monumental side-profile silhouette of “{{character}}” as the outer contour, faithfully informed by the attached references. Inside the silhouette, organically grow scenes, symbols, and atmosphere connected to “{{elements}}”. Use refined silhouette-filled narrative composition rather than ordinary collage, with a suggestion of double exposure that blends cinematic poster design and dreamlike watercolor illustration. Apply soft aerial perspective, light mist transitions, paper grain, dry-brush edges, and generous negative space. Keep the layout restrained and premium, with a quiet, monumental, sacred, nostalgic, poetic, and legendary mood. Adapt style, color, setting, and materials to the theme. Every element must be strongly tied to the theme and immediately recognizable. Avoid clutter, hard collage seams, template backgrounds, and cheap fantasy assets. Use English for any visible text."
  }
};

const IMAGE_TEMPLATE_EXAMPLES = {
  "zh-TW": { subject: "剛彈 RX-78-1", scene: "雨夜中的未來城市", action: "準備起飛", style: "美式厚塗插畫", mood: "安靜而史詩", headline: "守護未來", sellingPoints: "高性能、可靠、精密設計", theme: "Take Care", character: "阿妮亞", elements: "Intel、Graphics、GPU、生病看醫生、失聲、同事們的關心" },
  "zh-CN": { subject: "高达 RX-78-1", scene: "雨夜中的未来城市", action: "准备起飞", style: "美式厚涂插画", mood: "安静而史诗", headline: "守护未来", sellingPoints: "高性能、可靠、精密设计", theme: "Take Care", character: "阿尼亚", elements: "Intel、Graphics、GPU、生病就医、失声、同事们的关心" },
  en: { subject: "Gundam RX-78-1", scene: "a futuristic city on a rainy night", action: "preparing for launch", style: "American painterly illustration", mood: "quiet and epic", headline: "Protect the Future", sellingPoints: "high performance, reliability, precision design", theme: "Take Care", character: "Anya", elements: "Intel, graphics, GPU, seeing a doctor, losing her voice, and support from colleagues" }
};

let activeImageTemplateId = null;
let activeCustomImageTemplate = null;
let promptManagerMode = "chat";

function setImagePrompt(prompt) {
  UI.imagePrompt.value = prompt;
  UI.imagePrompt.style.height = "auto";
  UI.imagePrompt.style.height = `${Math.min(UI.imagePrompt.scrollHeight, 130)}px`;
  commitActiveImageTab();
  UI.imagePrompt.focus();
  saveState();
}

function fillImagePromptTemplate(templateId, values = {}) {
  let prompt = IMAGE_PROMPT_TEMPLATES[state.currentLanguage]?.[templateId] || "";
  Object.entries(values).forEach(([key, value]) => {
    prompt = prompt.replaceAll(`{{${key}}}`, String(value).trim());
  });
  return prompt;
}

function closeImageTemplateModal() {
  activeImageTemplateId = null;
  activeCustomImageTemplate = null;
  UI.imageTemplateModal.classList.remove("show");
  UI.imageTemplateFields.replaceChildren();
}

function isIntelStyleReference(reference) {
  return reference?.file?.name === "intel-style.png";
}

async function applyIntelDataVizTemplate() {
  const userReferences = imageState.references.filter((reference) => !isIntelStyleReference(reference));
  if (!userReferences.length || imageState.busy) return;

  try {
    const [imageResponse, styleResponse] = await Promise.all([
      fetch(chrome.runtime.getURL("ref/intel-style.png")),
      fetch(chrome.runtime.getURL("ref/intel_inspired_premium_dataviz_style.json"))
    ]);
    if (!imageResponse.ok) throw new Error("Unable to load ref/intel-style.png");
    if (!styleResponse.ok) throw new Error("Unable to load Intel style JSON");

    const [styleBlob, rawJson] = await Promise.all([imageResponse.blob(), styleResponse.text()]);
    JSON.parse(rawJson);

    const hasStyleReference = imageState.references.some((reference) => (
      isIntelStyleReference(reference) && reference.file.size === styleBlob.size
    ));
    if (!hasStyleReference) {
      const styleFile = new File([styleBlob], "intel-style.png", {
        type: styleBlob.type || "image/png",
        lastModified: 0
      });
      const { added } = await addReferenceFiles([styleFile]);
      if (!added) return;
    }

    setImagePrompt(`"""\n${rawJson}\n"""\n${t("image-intel-dataviz-instruction")}`);
  } catch (error) {
    setStatus("error", t("error-image") + (error?.message || String(error)));
  }
}

function openImageTemplate(templateId) {
  const definition = IMAGE_QUICK_TEMPLATES.find((template) => template.id === templateId);
  if (!definition) return;
  if (templateId === "intel-dataviz") {
    applyIntelDataVizTemplate();
    return;
  }
  if (!definition.fields.length) {
    setImagePrompt(fillImagePromptTemplate(templateId));
    return;
  }

  activeImageTemplateId = templateId;
  activeCustomImageTemplate = null;
  UI.imageTemplateTitle.textContent = t(`image-quick-${templateId}`);
  UI.imageTemplateHint.textContent = t("image-template-hint");
  UI.applyImageTemplateBtn.textContent = t("image-template-apply");
  UI.imageTemplateFields.replaceChildren();
  definition.fields.forEach((field, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "image-template-field";
    const label = document.createElement("label");
    label.htmlFor = `imageTemplateField-${field.key}`;
    label.textContent = t(field.labelKey);
    const input = document.createElement(field.multiline ? "textarea" : "input");
    input.id = label.htmlFor;
    input.name = field.key;
    input.required = true;
    input.placeholder = IMAGE_TEMPLATE_EXAMPLES[state.currentLanguage]?.[field.key] || "";
    if (field.multiline) input.rows = 3;
    wrapper.append(label, input);
    UI.imageTemplateFields.appendChild(wrapper);
    if (index === 0) setTimeout(() => input.focus(), 0);
  });
  UI.imageTemplateModal.classList.add("show");
}

function openCustomImageTemplate(prompt) {
  const fieldKeys = [...new Set([...prompt.matchAll(/\{\{([a-zA-Z][\w-]*)\}\}/g)].map((match) => match[1]))];
  if (!fieldKeys.length) {
    setImagePrompt(prompt);
    return;
  }
  const knownLabels = {
    subject: "image-field-subject",
    theme: "image-field-theme",
    character: "image-field-character",
    elements: "image-field-elements",
    scene: "image-field-scene",
    action: "image-field-action",
    style: "image-field-style",
    mood: "image-field-mood",
    headline: "image-field-headline",
    sellingPoints: "image-field-selling-points"
  };
  activeImageTemplateId = null;
  activeCustomImageTemplate = prompt;
  UI.imageTemplateTitle.textContent = t("image-saved-prompts");
  UI.imageTemplateHint.textContent = t("image-template-hint");
  UI.applyImageTemplateBtn.textContent = t("image-template-apply");
  UI.imageTemplateFields.replaceChildren();
  fieldKeys.forEach((key, index) => {
    const wrapper = document.createElement("div");
    wrapper.className = "image-template-field";
    const label = document.createElement("label");
    label.htmlFor = `imageTemplateField-${key}`;
    label.textContent = knownLabels[key] ? t(knownLabels[key]) : key.replaceAll("-", " ");
    const input = document.createElement(key === "elements" ? "textarea" : "input");
    input.id = label.htmlFor;
    input.name = key;
    input.required = true;
    if (input instanceof HTMLTextAreaElement) input.rows = 3;
    wrapper.append(label, input);
    UI.imageTemplateFields.appendChild(wrapper);
    if (index === 0) setTimeout(() => input.focus(), 0);
  });
  UI.imageTemplateModal.classList.add("show");
}

function renderImagePromptTools() {
  if (!UI.imagePromptTools) return;
  const lacksReferences = imageState.references.length === 0;
  const lacksUserReferences = !imageState.references.some((reference) => !isIntelStyleReference(reference));
  const templateNeedsReference = (template) => (
    (template.requiresUserReferences && lacksUserReferences)
    || (template.requiresReferences && lacksReferences)
  );
  const lockIcon = `<svg class="qq-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`;
  const renderTemplateButtons = (templates, noteId) => templates.map((template) => {
    const needsReference = templateNeedsReference(template);
    const disabled = imageState.busy || needsReference;
    const unavailableAttributes = needsReference
      ? ` class="quick-question-btn needs-reference" title="${escapeHtml(t("image-reference-required-tooltip"))}" aria-describedby="${noteId}"`
      : ` class="quick-question-btn"`;
    return `<button${unavailableAttributes} type="button" data-image-template="${template.id}" ${disabled ? "disabled" : ""}>
      <svg class="qq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${template.icon}</svg>
      <span class="qq-label">${t(`image-quick-${template.id}`)}</span>
      ${needsReference ? lockIcon : ""}
    </button>`;
  }).join("");
  const renderReferenceNote = (templates, noteId) => templates.some(templateNeedsReference)
    ? `<div class="image-reference-required-note" id="${noteId}" role="note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="m21 15-5-4-4 3-2-2-7 5"/></svg><span>${t("image-reference-required")}</span></div>`
    : "";
  const quickTemplates = IMAGE_QUICK_TEMPLATES.filter((template) => template.fields.length === 0);
  const formTemplates = IMAGE_QUICK_TEMPLATES.filter((template) => template.fields.length > 0);
  const saved = state.imageSavedPrompts.length
    ? state.imageSavedPrompts.map((prompt, index) => `<button class="saved-prompt-btn" type="button" data-image-prompt-index="${index}" ${imageState.busy ? "disabled" : ""}><svg class="sp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z"/></svg><span class="sp-label">${escapeHtml(prompt)}</span></button>`).join("")
    : `<div class="empty-saved-prompts"><span>${t("empty-saved-prompts")}</span></div>`;

  UI.imagePromptTools.innerHTML = `<div class="quick-questions">
      <div class="quick-questions-title"><span>${t("image-quick-title")} / ${t("image-template-title")}</span><button class="qq-help-btn" type="button" aria-label="${t("quick-question-help")}">?</button></div>
      <div class="qq-help-panel" hidden>${t("image-quick-help")}</div>
      <div class="image-tool-group">
        <div class="image-tool-group-title">${t("image-quick-title")}</div>
        ${renderReferenceNote(quickTemplates, "imageQuickReferenceNote")}
        <div class="quick-questions-grid">${renderTemplateButtons(quickTemplates, "imageQuickReferenceNote")}</div>
      </div>
      <div class="image-tool-group">
        <div class="image-tool-group-title">${t("image-template-title")}</div>
        ${renderReferenceNote(formTemplates, "imageTemplateReferenceNote")}
        <div class="quick-questions-grid">${renderTemplateButtons(formTemplates, "imageTemplateReferenceNote")}</div>
      </div>
    </div>
    <div class="saved-prompts-section">
      <div class="saved-prompts-header"><div class="saved-prompts-title"><span>${t("image-saved-prompts")}</span></div><button class="manage-prompts-btn" type="button" ${imageState.busy ? "disabled" : ""}><span>${t("manage-prompts")}</span></button></div>
      <div class="saved-prompts-list">${saved}</div>
    </div>`;

  const help = UI.imagePromptTools.querySelector(".qq-help-panel");
  const helpButton = UI.imagePromptTools.querySelector(".qq-help-btn");
  helpButton?.addEventListener("click", () => {
    help.hidden = !help.hidden;
    helpButton.classList.toggle("on", !help.hidden);
  });
  UI.imagePromptTools.querySelectorAll("[data-image-template]").forEach((button) => {
    button.addEventListener("click", () => openImageTemplate(button.dataset.imageTemplate));
  });
  UI.imagePromptTools.querySelectorAll("[data-image-prompt-index]").forEach((button) => {
    button.addEventListener("click", () => usePrompt(Number(button.dataset.imagePromptIndex), "image"));
  });
  UI.imagePromptTools.querySelector(".manage-prompts-btn")?.addEventListener("click", () => openSavedPromptsModal("image"));
}

function showQuickQuestions() {
  const existingQuick = UI.messagesContainer.querySelector(".quick-questions");
  if (existingQuick) {
    existingQuick.remove();
  }

  const existingSaved = UI.messagesContainer.querySelector(".saved-prompts-section");
  if (existingSaved) {
    existingSaved.remove();
  }

  const quickNode = document.createElement("div");
  quickNode.className = "quick-questions";

  const btnsHtml = QUICK_QUESTIONS.map((q) => `
      <button class="quick-question-btn" data-template="${q.key}">
        <svg class="qq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${q.icon}</svg>
        <span class="qq-label">${t("template-" + q.key)}</span>
      </button>`).join("");

  const helpHtml = QUICK_QUESTIONS.map((q) => `
      <div class="qq-help-item"><span class="qq-help-name">${t("template-" + q.key)}</span><span class="qq-help-desc">${t("qq-desc-" + q.key)}</span></div>`).join("");

  quickNode.innerHTML = `
    <div class="quick-questions-title">
      <span>${t("quick-question-title")}</span>
      <button class="qq-help-btn" id="quickHelpBtn" title="${t("quick-question-help")}" aria-label="${t("quick-question-help")}">?</button>
    </div>
    <div class="qq-help-panel" id="qqHelpPanel" hidden>
      <div class="qq-help-intro">${t("qq-help-intro")}</div>
      ${helpHtml}
    </div>
    <div class="quick-questions-grid">${btnsHtml}</div>
  `;

  const firstMessage = UI.messagesContainer.querySelector(".message");
  if (firstMessage) {
    UI.messagesContainer.insertBefore(quickNode, firstMessage);
  } else {
    UI.messagesContainer.appendChild(quickNode);
  }

  const helpBtn = quickNode.querySelector("#quickHelpBtn");
  const helpPanel = quickNode.querySelector("#qqHelpPanel");
  helpBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!helpPanel) return;
    helpPanel.hidden = !helpPanel.hidden;
    helpBtn.classList.toggle("on", !helpPanel.hidden);
  });

  quickNode.querySelectorAll(".quick-question-btn").forEach((btn) => {
    const template = btn.getAttribute("data-template") || "";
    btn.title = getQuestionPrompt(template);
    btn.addEventListener("click", () => {
      handleQuickQuestion(template);
    });
  });

  showSavedPromptsSection();
}

function showSavedPromptsSection() {
  const existingSaved = UI.messagesContainer.querySelector(".saved-prompts-section");
  if (existingSaved) {
    existingSaved.remove();
  }

  const savedNode = document.createElement("div");
  savedNode.className = "saved-prompts-section";

  const listHtml = !state.savedPrompts.length
    ? `<div class="empty-saved-prompts">
         <svg class="sp-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z"/></svg>
         <span>${t("empty-saved-prompts")}</span>
       </div>`
    : state.savedPrompts
      .map((prompt, index) => `<button class="saved-prompt-btn" data-index="${index}">
          <svg class="sp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"/></svg>
          <span class="sp-label">${escapeHtml(prompt)}</span>
        </button>`)
      .join("");

  savedNode.innerHTML = `
    <div class="saved-prompts-header">
      <div class="saved-prompts-title">
        <svg class="sp-title-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z"/></svg>
        <span>${t("saved-prompts")}</span>
      </div>
      <button class="manage-prompts-btn" id="managePromptsBtn">
        <svg class="mp-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="21" y1="6" x2="14" y2="6"/><line x1="10" y1="6" x2="3" y2="6"/><line x1="21" y1="12" x2="12" y2="12"/><line x1="8" y1="12" x2="3" y2="12"/><line x1="21" y1="18" x2="16" y2="18"/><line x1="12" y1="18" x2="3" y2="18"/><line x1="14" y1="4" x2="14" y2="8"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="16" y1="16" x2="16" y2="20"/></svg>
        <span>${t("manage-prompts")}</span>
      </button>
    </div>
    <div class="saved-prompts-list">
      ${listHtml}
    </div>
  `;

  const quickNode = UI.messagesContainer.querySelector(".quick-questions");
  if (quickNode && quickNode.nextSibling) {
    UI.messagesContainer.insertBefore(savedNode, quickNode.nextSibling);
  } else if (quickNode) {
    quickNode.parentNode.insertBefore(savedNode, quickNode.nextSibling);
  } else {
    UI.messagesContainer.appendChild(savedNode);
  }

  const manageBtn = savedNode.querySelector("#managePromptsBtn");
  if (manageBtn) {
    manageBtn.addEventListener("click", openSavedPromptsModal);
  }

  savedNode.querySelectorAll(".saved-prompt-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = Number(btn.getAttribute("data-index"));
      usePrompt(index);
    });
  });
}

function getQuestionPrompt(template) {
  const prompts = {
    "zh-TW": {
      concise: "請辨識這張圖是圖表、投影片或其他內容，並用繁體中文條列摘要主題、核心訊息與結論。只描述畫面可支持的資訊。",
      keydata: "請擷取圖片中的標題、圖例、座標軸、單位、關鍵數值與註解；若是圖表，請用表格整理可辨識的數據與比較結果。無法精確辨識的數字請標示不確定。",
      rootcause: "請分析圖表呈現的趨勢、轉折、異常值、群組差異與可能關聯。請區分畫面中的事實與你的推論，且不要把相關性說成因果。",
      risk: "請從這張圖表或投影片提出最重要的 insight，包括值得注意的變化、可能的商業或技術意義、風險，以及仍需哪些資料才能驗證。使用繁體中文。",
      action: "請根據這張投影片或圖表整理具體 action items，依優先順序列出行動、目的、依據與需確認事項。不要臆測畫面未提供的負責人或期限。",
      quiz: "請先辨識圖片中的所有可讀文字，再完整翻譯成繁體中文。保留產品名、技術名詞、數值、單位與原有段落結構；無法辨識處請標示 [無法辨識]。"
    },
    "zh-CN": {
      concise: "请辨识这张图是图表、幻灯片或其他内容，并用简体中文条列摘要主题、核心信息与结论。只描述画面可支持的信息。",
      keydata: "请提取图片中的标题、图例、坐标轴、单位、关键数值与注解；若是图表，请用表格整理可辨识的数据与比较结果。无法精确辨识的数字请标示不确定。",
      rootcause: "请分析图表呈现的趋势、转折、异常值、群组差异与可能关联。请区分画面中的事实与你的推论，不要把相关性说成因果。",
      risk: "请从这张图表或幻灯片提出最重要的 insight，包括值得注意的变化、可能的商业或技术意义、风险，以及仍需哪些资料才能验证。使用简体中文。",
      action: "请根据这张幻灯片或图表整理具体 action items，依优先顺序列出行动、目的、依据与需确认事项。不要臆测画面未提供的负责人或期限。",
      quiz: "请先辨识图片中的所有可读文字，再完整翻译成简体中文。保留产品名、技术名词、数值、单位与原有段落结构；无法辨识处请标示 [无法辨识]。"
    },
    en: {
      concise: "Identify whether this image is a chart, slide, or other content. Summarize its topic, key message, and conclusions in concise English bullets using only visually supported evidence.",
      keydata: "Extract the title, legend, axes, units, key values, and annotations. For charts, organize legible data and comparisons in a table. Mark any number that cannot be read precisely as uncertain.",
      rootcause: "Analyze trends, inflection points, outliers, group differences, and possible relationships. Separate visible facts from inference, and do not present correlation as causation.",
      risk: "Derive the most important insights from this chart or slide: notable changes, possible business or technical meaning, risks, and additional data needed for validation. Respond in English.",
      action: "Turn this chart or slide into prioritized action items. For each, state the action, purpose, visual evidence, and open questions. Do not invent owners or deadlines.",
      quiz: "Transcribe all legible text in the image, then translate it into English. Preserve product names, technical terms, numbers, units, and paragraph structure. Mark unreadable text as [unreadable]."
    }
  };

  return prompts[state.currentLanguage]?.[template] || "";
}

function makeVisionUserMessage(text, images) {
  const list = (Array.isArray(images) ? images : [images]).filter(Boolean);
  const content = [];
  list.forEach((image, index) => {
    if (list.length > 1) {
      content.push({ type: "text", text: `Image ${index + 1}: ${image.name || `image-${index + 1}`}` });
    }
    content.push({
      type: "image_url",
      image_url: { url: image.dataUrl, detail: "auto" }
    });
  });
  content.push({ type: "text", text });
  return { role: "user", content };
}

function formatBatchResultsContent(results, includeFailures = true) {
  return (results || []).map((result, index) => {
    const heading = `### Image ${index + 1}: ${result.imageName || "Image"}`;
    if (result.status === "completed") return `${heading}\n\n${result.content || ""}`;
    if (includeFailures && result.status === "failed") return `${heading}\n\n[${result.error || "Failed"}]`;
    if (includeFailures && result.status === "cancelled") return `${heading}\n\n[Cancelled]`;
    return "";
  }).filter(Boolean).join("\n\n");
}

function serializeMessageForApi(message) {
  if (message.role === "user" && collectMessageImageIds(message).length) {
    return makeVisionUserMessage(message.content || "", getMessageImages(message));
  }
  if (message.analysisMode === "per-image-results") {
    return { role: "assistant", content: formatBatchResultsContent(message.results, false) };
  }
  return { role: message.role, content: message.content || "" };
}

function findBatchRecords(batchId, messages = state.messages) {
  const userIndex = messages.findIndex((message) => message.batchId === batchId && message.role === "user");
  const resultIndex = messages.findIndex((message) => (
    message.batchId === batchId && message.analysisMode === "per-image-results"
  ));
  return {
    userIndex,
    resultIndex,
    user: userIndex >= 0 ? messages[userIndex] : null,
    result: resultIndex >= 0 ? messages[resultIndex] : null
  };
}

function buildGroupApiMessages(userMessage, group) {
  if (group.contextStartIndex == null) {
    return [makeVisionUserMessage(userMessage, group.images)];
  }

  if (group.initialMode === "per-image" && group.batchId) {
    const records = findBatchRecords(group.batchId);
    if (records.user && records.result) {
      const selectedImages = group.focusImageId
        ? group.images.filter((image) => image.id === group.focusImageId)
        : group.images;
      const selectedResults = group.focusImageId
        ? records.result.results.filter((result) => result.imageId === group.focusImageId)
        : records.result.results;
      const base = [
        makeVisionUserMessage(group.initialPrompt || records.user.content || "", selectedImages),
        { role: "assistant", content: formatBatchResultsContent(selectedResults, false) }
      ];
      const historyStart = Number.isInteger(group.scopeStartIndex)
        ? group.scopeStartIndex
        : records.resultIndex + 1;
      const history = state.messages.slice(historyStart)
        .filter((message) => !message.batchId)
        .map(serializeMessageForApi);
      return [...base, ...history, { role: "user", content: userMessage }];
    }
  }

  const history = state.messages.slice(group.contextStartIndex).map(serializeMessageForApi);
  return [...history, { role: "user", content: userMessage }];
}

function makeImageMetadata(images) {
  return images.map((image) => ({ id: image.id, name: image.name, type: image.type }));
}

function createInitialUserRecord(prompt, group, analysisMode, batchId = null) {
  const metadata = makeImageMetadata(group.images);
  return {
    role: "user",
    content: prompt,
    analysisMode,
    batchId,
    imageIds: metadata.map((image) => image.id),
    imageNames: metadata.map((image) => image.name),
    imageTypes: metadata.map((image) => image.type),
    imageName: metadata[0]?.name || ""
  };
}

async function requestVision(messages, model) {
  return sendRuntimeMessage({
    type: "VISION_CHAT",
    messages,
    language: state.currentLanguage,
    apiKey: state.selectedApiKey,
    model
  }, VISION_RUNTIME_MESSAGE_TIMEOUT_MS);
}

function setChatComposerDisabled(disabled) {
  UI.sendBtn.disabled = disabled;
  UI.messageInput.disabled = disabled;
  UI.attachChatImageBtn.disabled = disabled;
}

function refreshBatchUI(tabId) {
  if (state.activeTabId !== tabId) return;
  renderMessages();
  renderChatImageAttachment();
}

function cancelPerImageBatch(batchId) {
  const run = batchRuns.get(batchId);
  if (!run) return;
  run.cancelled = true;
  run.resultRecord.results.forEach((result) => {
    if (result.status === "pending") result.status = "cancelled";
  });
  run.resultRecord.content = formatBatchResultsContent(run.resultRecord.results);
  refreshBatchUI(run.tabId);
}

async function runPerImageBatch(tabId, group, userRecord, resultRecord, requestModel) {
  const run = { tabId, cancelled: false, resultRecord };
  batchRuns.set(resultRecord.batchId, run);
  let cursor = 0;

  const worker = async () => {
    while (cursor < resultRecord.results.length) {
      const index = cursor++;
      const result = resultRecord.results[index];
      if (run.cancelled) {
        result.status = "cancelled";
        continue;
      }
      const image = chatImageAssets.get(result.imageId);
      if (!image) {
        result.status = "failed";
        result.error = "Image data is unavailable";
        continue;
      }
      result.status = "analyzing";
      refreshBatchUI(tabId);
      const response = await requestVision([makeVisionUserMessage(userRecord.content, [image])], requestModel);
      if (run.cancelled) {
        result.status = "cancelled";
      } else if (response?.ok) {
        result.status = "completed";
        result.content = response.result || "";
        result.error = "";
        incrementModelUsage(requestModel);
      } else {
        result.status = "failed";
        result.error = response?.error || "Unknown error";
      }
      resultRecord.content = formatBatchResultsContent(resultRecord.results);
      refreshBatchUI(tabId);
      await saveState();
    }
  };

  await Promise.all(Array.from(
    { length: Math.min(PER_IMAGE_CONCURRENCY, resultRecord.results.length) },
    () => worker()
  ));
  resultRecord.results.forEach((result) => {
    if (["pending", "analyzing"].includes(result.status)) result.status = run.cancelled ? "cancelled" : "failed";
  });
  resultRecord.content = formatBatchResultsContent(resultRecord.results);
  batchRuns.delete(resultRecord.batchId);
  const srcTab = tabs.find((tab) => tab.id === tabId);
  if (srcTab) srcTab.sessionSaved = false;
  if (state.activeTabId === tabId) state.sessionSaved = false;
  await saveState();
  refreshBatchUI(tabId);
}

async function retryBatchImage(batchId, imageId) {
  const records = findBatchRecords(batchId);
  const result = records.result?.results?.find((item) => item.imageId === imageId);
  const image = chatImageAssets.get(imageId);
  if (!records.user || !result || !image || result.status === "analyzing") return;
  result.status = "analyzing";
  result.error = "";
  renderMessages();
  const response = await requestVision([makeVisionUserMessage(records.user.content, [image])], state.selectedModel);
  if (response?.ok) {
    result.status = "completed";
    result.content = response.result || "";
    incrementModelUsage(state.selectedModel);
  } else {
    result.status = "failed";
    result.error = response?.error || "Unknown error";
  }
  records.result.content = formatBatchResultsContent(records.result.results);
  state.sessionSaved = false;
  await saveState();
  renderMessages();
}

async function activateBatchScope(batchId, imageId = null) {
  const records = findBatchRecords(batchId);
  if (!records.user || !records.result) return;
  const images = records.user.imageIds.map((id) => chatImageAssets.get(id)).filter(Boolean);
  if (!images.length || (imageId && !images.some((image) => image.id === imageId))) return;
  const previousGroup = getChatImageGroup();
  if (previousGroup?.contextStartIndex == null) {
    const reusedIds = new Set(images.map((image) => image.id));
    await Promise.all(previousGroup.images
      .filter((image) => !reusedIds.has(image.id))
      .map((image) => deleteChatImageAsset(image.id)));
  }
  const group = createChatImageGroup(images, "per-image");
  group.contextStartIndex = records.userIndex;
  group.batchId = batchId;
  group.initialPrompt = records.user.content || "";
  group.initialMode = "per-image";
  group.focusImageId = imageId;
  group.scopeStartIndex = state.messages.length;
  chatImagesByTab.set(state.activeTabId, group);
  const activeTab = tabs.find((tab) => tab.id === state.activeTabId);
  if (activeTab) activeTab.activeImageGroup = serializeChatImageGroup(group);
  renderChatImageAttachment();
  await saveState();
  setStatus("ready", imageId
    ? t("context-single", { name: images.find((image) => image.id === imageId)?.name || "" })
    : t("context-all"));
  UI.messageInput.focus();
}

async function sendPerImageBatch(userMessage, group, srcTabId, requestModel) {
  const batchId = globalThis.crypto?.randomUUID?.()
    || `batch-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const contextStartIndex = state.messages.length;
  const userRecord = createInitialUserRecord(userMessage, group, "per-image", batchId);
  const resultRecord = {
    role: "assistant",
    content: "",
    analysisMode: "per-image-results",
    batchId,
    results: group.images.map((image) => ({
      imageId: image.id,
      imageName: image.name,
      status: "pending",
      content: "",
      error: ""
    }))
  };

  group.contextStartIndex = contextStartIndex;
  group.batchId = batchId;
  group.initialPrompt = userMessage;
  group.initialMode = "per-image";
  group.focusImageId = null;
  group.scopeStartIndex = contextStartIndex + 2;
  const srcTab = tabs.find((tab) => tab.id === srcTabId);
  if (srcTab) srcTab.activeImageGroup = serializeChatImageGroup(group);
  state.messages.push(userRecord, resultRecord);
  state.sessionSaved = false;
  assignAutoTabLabel(srcTab, group.images[0]?.name, userMessage);
  renderMessages();
  renderChatImageAttachment();
  renderTabBar();
  await saveState();
  await runPerImageBatch(srcTabId, group, userRecord, resultRecord, requestModel);
}

async function sendCombinedMessage(userMessage, group, srcTabId, requestModel) {
  const isInitial = group.contextStartIndex == null;
  const apiMessages = buildGroupApiMessages(userMessage, group);
  const userRecord = isInitial
    ? createInitialUserRecord(userMessage, group, "combined")
    : { role: "user", content: userMessage, contextImageId: group.focusImageId || null };

  if (isInitial) {
    group.contextStartIndex = state.messages.length;
    group.initialPrompt = userMessage;
    group.initialMode = "combined";
    group.scopeStartIndex = group.contextStartIndex;
  }

  addMessage("user", userMessage, true, isInitial ? group.images : [], userRecord);
  if (state.activeTabId === srcTabId) renderChatImageAttachment();
  showTypingIndicator();
  const response = await requestVision(apiMessages, requestModel);
  hideTypingIndicator();
  if (!response?.ok) {
    if (isInitial) {
      group.contextStartIndex = null;
      group.initialPrompt = "";
      group.initialMode = null;
      group.scopeStartIndex = null;
    }
    if (state.activeTabId === srcTabId) {
      renderMessages();
      renderChatImageAttachment();
    }
    throw new Error(response?.error || "Unknown error");
  }

  const srcTab = tabs.find((tab) => tab.id === srcTabId);
  const destinationMessages = state.activeTabId === srcTabId ? state.messages : srcTab?.messages;
  if (!destinationMessages) return;
  if (isInitial) {
    assignAutoTabLabel(srcTab, group.images[0]?.name, userMessage);
  }
  if (srcTab) srcTab.activeImageGroup = serializeChatImageGroup(group);
  destinationMessages.push(userRecord, { role: "assistant", content: response.result || "" });
  if (srcTab) srcTab.sessionSaved = false;
  if (state.activeTabId === srcTabId) {
    state.sessionSaved = false;
    addMessage("assistant", response.result || "", true);
  }
  incrementModelUsage(requestModel);
  await saveState();
  renderTabBar();
  if (state.activeTabId === srcTabId) {
    renderChatImageAttachment();
    showQuickQuestions();
  }
}

async function sendMessage() {
  const hasKey = await ensureApiKey(false);
  if (!hasKey) return;
  if (isAnthropicModelRestricted(state.selectedModel)) {
    setStatus("error", t("error-model-restricted"));
    return;
  }

  const userMessage = UI.messageInput.value.trim();
  if (!userMessage) {
    setStatus("error", t("error-empty-message"));
    return;
  }
  const srcTabId = state.activeTabId;
  let group = getChatImageGroup(srcTabId);
  if (!group?.images?.length) {
    group = inferChatImageGroupFromMessages(state.messages);
    if (group) chatImagesByTab.set(srcTabId, group);
  }
  if (!group?.images?.length) {
    setStatus("error", t("error-no-analysis-image"));
    return;
  }

  const requestModel = state.selectedModel;
  setChatComposerDisabled(true);
  setStatus("loading", t("status-vision-sending"));
  UI.messageInput.value = "";
  UI.messageInput.style.height = "auto";

  try {
    if (group.contextStartIndex == null && group.analysisMode === "per-image") {
      await sendPerImageBatch(userMessage, group, srcTabId, requestModel);
    } else {
      await sendCombinedMessage(userMessage, group, srcTabId, requestModel);
    }
    setStatus("ready", t("status-ready"));
  } catch (err) {
    if (!UI.messageInput.value) {
      UI.messageInput.value = userMessage;
      UI.messageInput.style.height = "auto";
      UI.messageInput.style.height = `${UI.messageInput.scrollHeight}px`;
    }
    setStatus("error", t("error-send") + (err.message || String(err)));
  } finally {
    setChatComposerDisabled(false);
    UI.messageInput.focus();
  }
}

async function handleQuickQuestion(template) {
  const hasKey = await ensureApiKey(false);
  if (!hasKey) {
    return;
  }

  if (isAnthropicModelRestricted(state.selectedModel)) {
    setStatus("error", t("error-model-restricted"));
    return;
  }

  const prompt = getQuestionPrompt(template);
  if (!prompt) return;

  if (template === "questions" && state.pageContent) {
    UI.sendBtn.disabled = true;
    UI.messageInput.disabled = true;
    setStatus("loading", t("status-sending"));
    const srcTabId = state.activeTabId;

    try {
      addMessage("user", prompt, true);
      showTypingIndicator();

      const contextMessage = `Page Title: ${state.pageContent.title}\nPage URL: ${state.pageContent.url}\n\nPage Content:\n${state.pageContent.text}\n\n---\n\n${prompt}`;
      const response = await sendRuntimeMessage({
        type: "CHAT",
        messages: [{ role: "user", content: contextMessage }],
        language: state.currentLanguage,
        apiKey: state.selectedApiKey,
        model: state.selectedModel
      });

      if (!response?.ok) {
        setStatus("error", t("error-send") + (response?.error || "Unknown error"));
        return;
      }

      if (state.activeTabId !== srcTabId) {
        const srcTab = tabs.find(t => t.id === srcTabId);
        if (srcTab) {
          srcTab.messages.push({ role: "user", content: prompt });
          srcTab.messages.push({ role: "assistant", content: response.result || "" });
          srcTab.sessionSaved = false;
        }
        incrementModelUsage(state.selectedModel);
        await saveState();
        setStatus("ready", t("status-ready"));
        return;
      }

      addMessage("assistant", response.result || "", true);
      state.messages.push({ role: "user", content: prompt });
      state.messages.push({ role: "assistant", content: response.result || "" });
      state.sessionSaved = false;
      incrementModelUsage(state.selectedModel);
      await saveState();
      setStatus("ready", t("status-ready"));
    } catch (err) {
      setStatus("error", t("error-send") + (err.message || String(err)));
    } finally {
      hideTypingIndicator();
      UI.sendBtn.disabled = false;
      UI.messageInput.disabled = false;
    }

    return;
  }

  UI.messageInput.value = prompt;
  UI.messageInput.style.height = "auto";
  UI.messageInput.style.height = `${UI.messageInput.scrollHeight}px`;
  await sendMessage();
}

async function clearConversation() {
  if (tabs.length > 1) {
    await closeTab(state.activeTabId);
    return;
  }
  // Only one tab: clear its content
  if (state.messages.length > 0 && !state.sessionSaved) {
    const choice = await showConfirmSaveDialog();
    if (choice === "cancel") return;
    if (choice === "yes") await downloadSession();
  }
  const imageIdsToDelete = new Set();
  state.messages.forEach((message) => {
    collectMessageImageIds(message).forEach((imageId) => imageIdsToDelete.add(imageId));
  });
  state.messages = [];
  state.pageContent = null;
  state.sessionSaved = false;
  const chatGroup = getChatImageGroup();
  if (chatGroup) {
    chatGroup.contextStartIndex = null;
    chatGroup.batchId = null;
    chatGroup.initialPrompt = "";
    chatGroup.initialMode = null;
    chatGroup.focusImageId = null;
    chatGroup.scopeStartIndex = null;
    chatGroup.images.forEach((image) => imageIdsToDelete.delete(image.id));
  }
  await Promise.all([...imageIdsToDelete].map(deleteChatImageAsset));
  hidePageInfo();
  renderMessages();
  renderChatImageAttachment();
  commitActiveTab();
  renderTabBar();
  await saveState();
  setStatus("ready", t("status-ready"));
}

async function loadModels() {
  const hasKey = await ensureApiKey(false);
  if (!hasKey) {
    state.openaiModels = [];
    state.anthropicModels = [];
    state.models = [];
    renderModelOptions();
    return;
  }

  // Prefer previously verified models (recorded via "驗證支援模型") if present.
  if (state.verifiedModels?.verifiedAt) {
    state.openaiModels = Array.isArray(state.verifiedModels.openai) ? state.verifiedModels.openai : [];
    state.anthropicModels = Array.isArray(state.verifiedModels.anthropic) ? state.verifiedModels.anthropic : [];
    state.models = [...state.openaiModels, ...state.anthropicModels];
    state.generationModels = Array.isArray(state.verifiedModels.generation)
      ? state.verifiedModels.generation
      : [...DEFAULT_GENERATION_MODELS];
    renderModelOptions();
    renderGenerationModelOptions();

    await saveState();
    setStatus("ready", t("status-models-loaded", { count: String(state.models.length) }));
    return;
  }

  state.openaiModels = [DEFAULT_MODEL];
  state.anthropicModels = [];
  state.models = [DEFAULT_MODEL];
  state.generationModels = [...DEFAULT_GENERATION_MODELS];
  renderModelOptions();
  renderGenerationModelOptions();

  await saveState();
  setStatus("ready", t("status-models-loaded", { count: String(state.models.length) }));
}

function renderModelDiscovery() {
  if (!UI.modelDiscoverySummary || !UI.modelDiscoveryList) return;

  const detailsByModel = new Map(
    modelDiscoveryState.details
      .filter((detail) => detail?.model)
      .map((detail) => [detail.model, detail])
  );
  const availableCount = modelDiscoveryState.details.filter((detail) => detail?.available).length;
  const unavailableCount = modelDiscoveryState.details.filter((detail) => detail && !detail.available).length;

  if (modelDiscoveryState.phase === "error") {
    UI.modelDiscoverySummary.textContent = t("model-discovery-error", {
      error: modelDiscoveryState.error || "unknown error"
    });
  } else if (modelDiscoveryState.phase === "done") {
    UI.modelDiscoverySummary.textContent = t("model-discovery-done", {
      ok: String(availableCount),
      fail: String(unavailableCount)
    });
  } else if (modelDiscoveryState.phase === "verifying") {
    UI.modelDiscoverySummary.textContent = t("model-discovery-progress", {
      done: String(modelDiscoveryState.details.length),
      count: String(modelDiscoveryState.models.length)
    });
  } else if (modelDiscoveryState.models.length > 0) {
    UI.modelDiscoverySummary.textContent = t("model-discovery-found", {
      count: String(modelDiscoveryState.models.length)
    });
  } else {
    UI.modelDiscoverySummary.textContent = "";
  }

  UI.modelDiscoveryList.replaceChildren();
  modelDiscoveryState.models.forEach((model) => {
    const detail = detailsByModel.get(model);
    const row = document.createElement("div");
    row.className = "model-discovery-row";

    const name = document.createElement("span");
    name.className = "model-discovery-name";
    name.textContent = model;

    const status = document.createElement("span");
    status.className = "model-discovery-status";
    if (!detail) {
      status.textContent = t("model-status-pending");
    } else if (detail.capability === "analysis") {
      status.classList.add("available");
      status.textContent = t("model-status-analysis");
    } else if (detail.capability === "generation") {
      status.classList.add("available");
      status.textContent = t("model-status-generation");
    } else {
      status.classList.add("unavailable");
      status.textContent = t("model-status-unavailable");
      status.title = detail.error || (detail.status ? `HTTP ${detail.status}` : "");
    }

    row.append(name, status);
    UI.modelDiscoveryList.appendChild(row);
  });
}

function updateModelVerificationProgress(message) {
  if (message?.verificationId !== modelDiscoveryState.verificationId) return;
  const detail = message?.detail;
  if (!detail?.model || !modelDiscoveryState.models.includes(detail.model)) return;

  const index = modelDiscoveryState.details.findIndex((item) => item?.model === detail.model);
  if (index >= 0) modelDiscoveryState.details[index] = detail;
  else modelDiscoveryState.details.push(detail);
  renderModelDiscovery();
}

function openModelDiscoveryModal() {
  renderModelDiscovery();
  UI.modelDiscoveryModal.classList.add("show");
}

function closeModelDiscoveryModal() {
  UI.modelDiscoveryModal.classList.remove("show");
}

// Discover candidates from the GNAI documentation, show the Model column,
// then probe each candidate and populate the selector with those that pass.
async function verifyAndLoadModels() {
  const hasKey = await ensureApiKey(true);
  if (!hasKey) return;

  modelDiscoveryState.models = [];
  modelDiscoveryState.details = [];
  modelDiscoveryState.phase = "loading";
  modelDiscoveryState.error = "";
  modelDiscoveryState.verificationId = globalThis.crypto?.randomUUID?.()
    || `verify-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  setStatus("loading", t("status-fetching-model-docs"));

  const discovery = await sendRuntimeMessage({ type: "DISCOVER_MODELS" }, 60000);
  if (!discovery?.ok) {
    const error = discovery?.error || "unknown error";
    modelDiscoveryState.phase = "error";
    modelDiscoveryState.error = error;
    openModelDiscoveryModal();
    setStatus("error", t("error-verify-models") + error);
    return;
  }

  const candidateModels = Array.isArray(discovery.models) ? discovery.models : [];
  modelDiscoveryState.models = candidateModels;
  modelDiscoveryState.phase = "verifying";
  console.info("[Image Chatter] Models discovered from GNAI documentation:", candidateModels);
  openModelDiscoveryModal();
  setStatus("loading", t("status-verifying-models"));

  // Verification can take a while (many probes), so allow a longer timeout.
  const response = await sendRuntimeMessage(
    {
      type: "VERIFY_MODELS",
      apiKey: state.selectedApiKey,
      models: candidateModels,
      verificationId: modelDiscoveryState.verificationId
    },
    300000
  );

  if (!response?.ok) {
    const error = response?.error || "unknown error";
    modelDiscoveryState.phase = "error";
    modelDiscoveryState.error = error;
    renderModelDiscovery();
    setStatus("error", t("error-verify-models") + error);
    return;
  }

  const openaiModels = Array.isArray(response.openaiModels) ? response.openaiModels : [];
  const anthropicModels = Array.isArray(response.anthropicModels) ? response.anthropicModels : [];
  const generationModels = Array.isArray(response.generationModels) ? response.generationModels : [];
  const details = Array.isArray(response.details) ? response.details : [];
  const failCount = details.filter((d) => d && !d.available).length;
  modelDiscoveryState.details = details;
  modelDiscoveryState.phase = "done";
  renderModelDiscovery();

  state.verifiedModels = {
    openai: openaiModels,
    anthropic: anthropicModels,
    generation: generationModels,
    verificationSchema: 2,
    verifiedAt: Date.now()
  };
  state.openaiModels = openaiModels;
  state.anthropicModels = anthropicModels;
  state.models = [...openaiModels, ...anthropicModels];
  state.generationModels = generationModels;
  renderModelOptions();
  renderGenerationModelOptions();

  await saveState();
  setStatus("ready", t("status-verify-done", {
    ok: String(state.models.length + generationModels.length),
    fail: String(failCount)
  }));
}

function getManagedPrompts() {
  return promptManagerMode === "image" ? state.imageSavedPrompts : state.savedPrompts;
}

function refreshManagedPromptSection() {
  if (promptManagerMode === "image") renderImagePromptTools();
  else showSavedPromptsSection();
}

function openSavedPromptsModal(mode = "chat") {
  promptManagerMode = mode === "image" ? "image" : "chat";
  UI.savedPromptsModalTitle.textContent = t(promptManagerMode === "image" ? "image-saved-prompts-title" : "saved-prompts-title");
  UI.savedPromptsModal.classList.add("show");
  renderSavedPromptsList();
}

function closeSavedPromptsModal() {
  UI.savedPromptsModal.classList.remove("show");
  UI.newPromptInput.value = "";
}

function renderSavedPromptsList() {
  const prompts = getManagedPrompts();
  if (!prompts.length) {
    UI.savedPromptsList.innerHTML = `
      <div class="empty-prompts">
        <div class="empty-prompts-icon">📝</div>
        <div class="empty-prompts-text">${t("empty-prompts")}</div>
      </div>
    `;
    return;
  }

  UI.savedPromptsList.innerHTML = prompts
    .map(
      (prompt, index) => `
      <div class="saved-prompt-item" data-index="${index}">
        <div class="drag-handle" title="拖曳排序">⠿</div>
        <div class="saved-prompt-text" data-index="${index}">${escapeHtml(prompt)}</div>
        <div class="saved-prompt-actions">
          <button class="prompt-action-btn delete-prompt-btn" data-index="${index}" title="Delete">🗑️</button>
        </div>
      </div>
    `
    )
    .join("");

  let draggingIndex = null;

  UI.savedPromptsList.querySelectorAll(".saved-prompt-item").forEach((item) => {
    const idx = Number(item.dataset.index);
    const handle = item.querySelector(".drag-handle");

    // Enable dragging only when pointerdown on the handle
    handle.addEventListener("pointerdown", () => {
      item.setAttribute("draggable", "true");
    });

    item.addEventListener("dragstart", (e) => {
      draggingIndex = idx;
      item.classList.add("dragging");
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", String(idx));
    });

    item.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      UI.savedPromptsList.querySelectorAll(".drag-over").forEach(el => el.classList.remove("drag-over"));
      if (idx !== draggingIndex) item.classList.add("drag-over");
    });

    item.addEventListener("dragleave", () => { item.classList.remove("drag-over"); });

    item.addEventListener("drop", async (e) => {
      e.preventDefault();
      item.classList.remove("drag-over");
      if (draggingIndex === null || draggingIndex === idx) return;
      const [dragged] = prompts.splice(draggingIndex, 1);
      prompts.splice(idx, 0, dragged);
      renderSavedPromptsList();
      refreshManagedPromptSection();
      await saveState();
    });

    item.addEventListener("dragend", () => {
      item.removeAttribute("draggable");
      item.classList.remove("dragging");
      UI.savedPromptsList.querySelectorAll(".drag-over").forEach(el => el.classList.remove("drag-over"));
      draggingIndex = null;
    });
  });

  UI.savedPromptsList.querySelectorAll(".saved-prompt-text").forEach((element) => {
    element.addEventListener("click", () => {
      const index = Number(element.getAttribute("data-index"));
      usePrompt(index, promptManagerMode);
    });
  });

  UI.savedPromptsList.querySelectorAll(".delete-prompt-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const index = Number(button.getAttribute("data-index"));
      deletePrompt(index);
    });
  });
}

async function addNewPrompt() {
  const promptText = UI.newPromptInput.value.trim();
  if (!promptText) return;

  getManagedPrompts().push(promptText);
  UI.newPromptInput.value = "";
  renderSavedPromptsList();
  refreshManagedPromptSection();
  await saveState();
}

async function deletePrompt(index) {
  getManagedPrompts().splice(index, 1);
  renderSavedPromptsList();
  refreshManagedPromptSection();
  await saveState();
}

function usePrompt(index, mode = "chat") {
  const prompt = (mode === "image" ? state.imageSavedPrompts : state.savedPrompts)[index];
  if (!prompt) return;

  if (mode === "image") {
    openCustomImageTemplate(prompt);
  } else {
    UI.messageInput.value = prompt;
    UI.messageInput.style.height = "auto";
    UI.messageInput.style.height = `${UI.messageInput.scrollHeight}px`;
    UI.messageInput.focus();
  }
  closeSavedPromptsModal();
}

function buildSessionMarkdown() {
  const lines = [];
  const dateStr = new Date().toLocaleString();
  const activeTab = tabs.find((tab) => tab.id === state.activeTabId);
  const sessionTitle = activeTab
    ? String(getTabFullLabel(activeTab) || "").trim().replace(/\s+/g, " ")
    : "";
  lines.push(`# ${sessionTitle || "Image Chatter Session"}\n`);
  lines.push(`**Date**: ${dateStr}  `);
  lines.push(`**Model**: ${state.selectedModel}  `);
  if (state.pageContent) {
    lines.push(`**Page**: [${state.pageContent.title}](${state.pageContent.url})  `);
  }
  lines.push("\n---\n");
  for (const msg of state.messages) {
    const role = msg.role === "user" ? "## \u{1F464} User" : "## \u{1F916} Assistant";
    lines.push(role + "\n");
    const imageIds = msg.role === "user" ? collectMessageImageIds(msg) : [];
    imageIds.forEach((imageId, index) => {
      const image = chatImageAssets.get(imageId);
      if (image?.dataUrl) {
        const name = image.name || msg.imageNames?.[index] || msg.imageName || `Attached image ${index + 1}`;
        lines.push(`<img src="${image.dataUrl}" alt="${escapeHtmlAttribute(name)}" style="max-width: 100%; height: auto;" />\n`);
        lines.push(`_${escapeHtml(name)}_\n`);
      } else {
        const fallbackName = msg.imageNames?.[index] || msg.imageName || `Attached image ${index + 1}`;
        lines.push(`_[Image unavailable: ${escapeHtml(fallbackName)}]_\n`);
      }
    });
    if (msg.analysisMode === "per-image-results") {
      (msg.results || []).forEach((result, index) => {
        lines.push(`### Image ${index + 1}: ${escapeHtml(result.imageName || "Image")}\n`);
        if (result.status === "completed") {
          lines.push(`${result.content || ""}\n`);
        } else {
          const status = result.status === "failed"
            ? `Failed: ${result.error || "Unknown error"}`
            : result.status === "cancelled" ? "Cancelled" : result.status;
          lines.push(`_[${escapeHtml(status || "Pending")}]_\n`);
        }
      });
    } else {
      lines.push((msg.content || "") + "\n");
    }
    lines.push("---\n");
  }
  return lines.join("\n");
}

async function downloadSession() {
  if (state.messages.length === 0) {
    setStatus("error", t("status-session-empty"));
    return;
  }
  const md = buildSessionMarkdown();
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const ts = new Date().toISOString().slice(0, 19).replace("T", "_").replace(/:/g, "");
  const filename = `image-chatter-report/${ts}.md`;
  try {
    const downloadId = await chrome.downloads.download({ url, filename, saveAs: true });

    // Wait for the download to either complete or be cancelled by the user
    const savedOk = await new Promise((resolve) => {
      const onChanged = (delta) => {
        if (delta.id !== downloadId) return;
        if (delta.state?.current === "complete") {
          chrome.downloads.onChanged.removeListener(onChanged);
          resolve(true);
        } else if (delta.state?.current === "interrupted") {
          chrome.downloads.onChanged.removeListener(onChanged);
          resolve(false);
        }
      };
      chrome.downloads.onChanged.addListener(onChanged);
      // Also check immediately in case the state already settled before we registered
      chrome.downloads.search({ id: downloadId }).then(([item]) => {
        if (item?.state === "complete") {
          chrome.downloads.onChanged.removeListener(onChanged);
          resolve(true);
        } else if (item?.state === "interrupted") {
          chrome.downloads.onChanged.removeListener(onChanged);
          resolve(false);
        }
      });
    });

    if (savedOk) {
      state.sessionSaved = true;
      await saveState();
      setStatus("ready", t("status-session-saved"));
    } else {
      setStatus("ready", t("status-ready"));
    }
  } catch (err) {
    setStatus("error", err.message || "Download failed");
  } finally {
    URL.revokeObjectURL(url);
  }
}

function setupEventHandlers() {
  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === "MODEL_VERIFICATION_PROGRESS") {
      updateModelVerificationProgress(message);
    }
  });

  UI.languageSelect.addEventListener("change", async () => {
    state.currentLanguage = UI.languageSelect.value;
    closeImageTemplateModal();
    updateUILanguage();
    renderImagePromptTools();

    if (getChatImage()) {
      showQuickQuestions();
    }

    await saveState();
    setStatus("ready", t("lang-set", { lang: state.currentLanguage }));
  });

  UI.headerTitle.addEventListener("click", async () => {
    const updated = await promptForApiKey(false);
    if (updated) {
      await loadModels();
    }
  });

  UI.modelSelect.addEventListener("change", async () => {
    if (UI.modelSelect.value === VERIFY_MODELS_ACTION) {
      // Restore the previously selected model in the dropdown, then verify.
      UI.modelSelect.value = state.selectedModel;
      await verifyAndLoadModels();
      return;
    }
    state.selectedModel = UI.modelSelect.value;
    if (isAnthropicModelRestricted(state.selectedModel)) {
      const selectableModels = getSelectableModels();
      state.selectedModel = selectableModels[0] || DEFAULT_MODEL;
      UI.modelSelect.value = state.selectedModel;
      setStatus("error", t("error-model-restricted"));
    }
    await saveState();
  });

  UI.imageModelSelect.addEventListener("change", async () => {
    state.selectedGenerationModel = UI.imageModelSelect.value;
    await saveState();
  });

  UI.budgetText.addEventListener("click", () => refreshBudget());
  UI.panelModeBtn.addEventListener("click", togglePanelMode);
  UI.saveSessionBtn.addEventListener("click", downloadSession);
  UI.clearBtn.addEventListener("click", clearConversation);

  UI.sendBtn.addEventListener("click", sendMessage);
  UI.attachChatImageBtn.addEventListener("click", () => UI.chatImageInput.click());
  UI.chatImageInput.addEventListener("change", () => {
    const files = Array.from(UI.chatImageInput.files || []);
    UI.chatImageInput.value = "";
    if (files.length) selectChatImages(files);
  });
  UI.combinedAnalysisBtn.addEventListener("click", () => setChatAnalysisMode("combined"));
  UI.perImageAnalysisBtn.addEventListener("click", () => setChatAnalysisMode("per-image"));
  UI.chatAttachmentToggle.addEventListener("click", toggleChatImageAttachment);
  [UI.chatModeBtn, UI.imageModeBtn].forEach((button) => {
    button.addEventListener("pointerenter", () => playModeSwitchAnimation(button));
  });
  UI.chatModeBtn.addEventListener("click", async () => {
    switchWorkspace("chat");
    await saveState();
  });
  UI.imageModeBtn.addEventListener("click", async () => {
    switchWorkspace("image");
    await saveState();
  });
  document.querySelector(".mode-switch")?.addEventListener("keydown", async (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const selectImage = event.key === "ArrowRight" || event.key === "End";
    switchWorkspace(selectImage ? "image" : "chat");
    await saveState();
    (selectImage ? UI.imageModeBtn : UI.chatModeBtn).focus();
  });
  UI.addReferenceBtn.addEventListener("click", () => UI.referenceInput.click());
  UI.imageComposeToggle.addEventListener("click", toggleImageCompose);
  UI.referenceInput.addEventListener("change", async () => {
    const files = Array.from(UI.referenceInput.files || []);
    UI.referenceInput.value = "";
    await addReferenceFiles(files);
  });
  [UI.imageSize, UI.imageQuality, UI.imageFormat].forEach((control) => {
    control.addEventListener("change", async () => {
      commitActiveImageTab();
      await saveState();
    });
  });
  UI.imagePrompt.addEventListener("input", () => {
    commitActiveImageTab();
    if (!getActiveImageTab()?.autoLabel && !getActiveImageTab()?.customLabel) renderImageTabBar();
    clearTimeout(imagePromptSaveTimer);
    imagePromptSaveTimer = setTimeout(() => saveState(), 300);
  });
  UI.imagePanel.addEventListener("paste", pasteReferenceImages);
  UI.imagePanel.addEventListener("pointerdown", (event) => focusImagePasteTarget(UI.imagePanel, event));
  UI.imagePanel.addEventListener("dragenter", showReferenceDropTarget);
  UI.imagePanel.addEventListener("dragover", showReferenceDropTarget);
  UI.imagePanel.addEventListener("dragleave", hideReferenceDropTarget);
  UI.imagePanel.addEventListener("drop", dropReferenceImages);
  UI.generateImageBtn.addEventListener("click", generateImage);
  UI.cancelImageBtn.addEventListener("click", cancelImageGeneration);
  UI.imagePrompt.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      generateImage();
    }
  });

  // Header cursor spotlight: a soft light that smoothly trails the pointer.
  (() => {
    const bar = document.querySelector(".header-bar");
    if (!bar) return;

    // Double-click an empty area of the header (not a button/select/title)
    // to toggle the ambient white sheen on or off.
    bar.addEventListener("dblclick", (e) => {
      if (e.target.closest(".header-title, .mode-switch, .header-controls")) return;
      bar.classList.toggle("sheen-off");
    });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let curX = 0, curY = 0, tgtX = 0, tgtY = 0, raf = 0, lit = false;
    const tick = () => {
      curX += (tgtX - curX) * 0.18;
      curY += (tgtY - curY) * 0.18;
      bar.style.setProperty("--mx", curX + "px");
      bar.style.setProperty("--my", curY + "px");
      if (lit && (Math.abs(tgtX - curX) > 0.5 || Math.abs(tgtY - curY) > 0.5)) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
    };
    bar.addEventListener("pointermove", (e) => {
      const r = bar.getBoundingClientRect();
      tgtX = e.clientX - r.left;
      tgtY = e.clientY - r.top;
      if (!raf) raf = requestAnimationFrame(tick);
    });
    bar.addEventListener("pointerenter", (e) => {
      const r = bar.getBoundingClientRect();
      curX = tgtX = e.clientX - r.left;
      curY = tgtY = e.clientY - r.top;
      lit = true;
      bar.classList.add("lit");
      if (!raf) raf = requestAnimationFrame(tick);
    });
    bar.addEventListener("pointerleave", () => {
      lit = false;
      bar.classList.remove("lit");
    });
  })();

  // Header icon buttons: replay a small SVG state-change animation on each click.
  [UI.clearBtn, UI.saveSessionBtn, UI.panelModeBtn].forEach((btn) => {
    if (!btn) return;
    btn.addEventListener("click", () => {
      btn.classList.remove("tog");
      void btn.offsetWidth;
      btn.classList.add("tog");
    });
    btn.addEventListener("animationend", () => btn.classList.remove("tog"));
  });

  // Send button press feedback: replay the squash + plane launch on each press.
  function playSendPress() {
    if (UI.sendBtn.disabled) return;
    UI.sendBtn.classList.remove("go");
    void UI.sendBtn.offsetWidth;
    UI.sendBtn.classList.add("go");
  }
  UI.sendBtn.addEventListener("pointerdown", playSendPress);
  UI.sendBtn.addEventListener("animationend", (e) => {
    // Keep .go until the longest animation (plane-launch) finishes so it
    // always plays out fully, even if the button was released early.
    if (e.animationName === "plane-launch") UI.sendBtn.classList.remove("go");
  });

  UI.chatPanel.addEventListener("paste", pasteClipboardImage);
  UI.chatPanel.addEventListener("pointerdown", (event) => focusImagePasteTarget(UI.chatPanel, event));
  UI.chatPanel.addEventListener("dragenter", showImageDropTarget);
  UI.chatPanel.addEventListener("dragover", showImageDropTarget);
  UI.chatPanel.addEventListener("dragleave", hideImageDropTarget);
  UI.chatPanel.addEventListener("drop", dropChatImage);

  UI.messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      playSendPress();
      sendMessage();
    }
  });

  UI.messageInput.addEventListener("input", () => {
    UI.messageInput.style.height = "auto";
    UI.messageInput.style.height = `${UI.messageInput.scrollHeight}px`;
  });

  UI.closeModelDiscoveryModal.addEventListener("click", closeModelDiscoveryModal);
  UI.modelDiscoveryModal.addEventListener("click", (event) => {
    if (event.target === UI.modelDiscoveryModal) closeModelDiscoveryModal();
  });

  UI.closeSavedPromptsModal.addEventListener("click", closeSavedPromptsModal);
  UI.savedPromptsModal.addEventListener("click", (event) => {
    if (event.target === UI.savedPromptsModal) {
      closeSavedPromptsModal();
    }
  });

  UI.addPromptBtn.addEventListener("click", addNewPrompt);
  UI.newPromptInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && event.ctrlKey) {
      event.preventDefault();
      addNewPrompt();
    }
  });

  UI.closeImageTemplateModal.addEventListener("click", closeImageTemplateModal);
  UI.cancelImageTemplateBtn.addEventListener("click", closeImageTemplateModal);
  UI.imageTemplateModal.addEventListener("click", (event) => {
    if (event.target === UI.imageTemplateModal) closeImageTemplateModal();
  });
  UI.imageTemplateForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!activeImageTemplateId && !activeCustomImageTemplate) return;
    const values = Object.fromEntries(new FormData(UI.imageTemplateForm).entries());
    let prompt = activeCustomImageTemplate || fillImagePromptTemplate(activeImageTemplateId);
    Object.entries(values).forEach(([key, value]) => {
      prompt = prompt.replaceAll(`{{${key}}}`, String(value).trim());
    });
    closeImageTemplateModal();
    setImagePrompt(prompt);
  });

  window.addEventListener("beforeunload", cleanupImageObjects, { once: true });
}

async function bootstrap() {
  setupTooltips();
  await initializeState();
  setupEventHandlers();

  if (!state.selectedApiKey) {
    await promptForApiKey(true);
  }

  setStatus("ready", t("status-ready"));
  await loadModels();
  refreshBudget();
  setInterval(refreshBudget, 5 * 60 * 1000);
}

bootstrap().catch((err) => {
  setStatus("error", t("error-init") + (err.message || String(err)));
});
