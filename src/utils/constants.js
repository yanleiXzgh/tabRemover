// 常量定义文件
export const STORAGE_KEY = {
  REGEX_LIST: 'regexList',
  AUTO_RENAME: 'ifAutoRename',
  ADD_KEYWORDS: 'ifAddKeyWords',
  INTEL_SUMMARY: 'ifIntelligentSummary'
};

export const MESSAGE_TYPE = {
  NAME_CHANGE: 'handleNameChange',
  AUTO_KEYWORDS: 'ifAutoKeyWords',
  REGEX_APPLY: 'applyRegex',
  REGEX_SAVE: 'saveRegex',
  REGEX_DELETE: 'deleteRegex'
};

export const ERROR_MESSAGE = {
  NO_ACTIVE_TAB: '未找到活动标签页',
  NO_MATCHING_REGEX: '未找到匹配的正则表达式',
  STORAGE_ERROR: '存储操作失败',
  SEND_MESSAGE_ERROR: '消息发送失败',
  AI_API_ERROR: 'AI API调用失败'
};

export const SPECIAL_URL_PREFIXES = ['chrome://', 'about:', 'edge://'];

export const AI_CONFIG = {
  API_URL: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  DEFAULT_MODEL: 'glm-4.6',
  TEMPERATURE: 0.6,
  SYSTEM_MESSAGE: '你是一个乐于解答各种问题的助手，你的任务是为用户提供专业、准确、有见地的建议。\n' +
    '你将收到一段网址，总结该网页的内容并返回一个50字以内的总结，形式为："类型|内容"；其中，"类型"包括"学习","工作","娱乐"等\n' +
    '不考虑上下文。\n' +
    '内容尽可能详细。'
};