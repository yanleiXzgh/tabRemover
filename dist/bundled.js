
// TapRenamer重构版 - ES6模块打包版本
// 将所有模块转换为传统JavaScript格式

// 常量定义
// 常量定义文件
const STORAGE_KEY = {
  REGEX_LIST: 'regexList',
  AUTO_RENAME: 'ifAutoRename',
  ADD_KEYWORDS: 'ifAddKeyWords',
  INTEL_SUMMARY: 'ifIntelligentSummary'
};

const MESSAGE_TYPE = {
  NAME_CHANGE: 'handleNameChange',
  AUTO_KEYWORDS: 'ifAutoKeyWords',
  REGEX_APPLY: 'applyRegex',
  REGEX_SAVE: 'saveRegex',
  REGEX_DELETE: 'deleteRegex'
};

const ERROR_MESSAGE = {
  NO_ACTIVE_TAB: '未找到活动标签页',
  NO_MATCHING_REGEX: '未找到匹配的正则表达式',
  STORAGE_ERROR: '存储操作失败',
  SEND_MESSAGE_ERROR: '消息发送失败',
  AI_API_ERROR: 'AI API调用失败'
};

const SPECIAL_URL_PREFIXES = ['chrome://', 'about:', 'edge://'];

const AI_CONFIG = {
  API_URL: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  DEFAULT_MODEL: 'glm-4.6',
  TEMPERATURE: 0.6,
  SYSTEM_MESSAGE: '你是一个乐于解答各种问题的助手，你的任务是为用户提供专业、准确、有见地的建议。\n' +
    '你将收到一段网址，总结该网页的内容并返回一个50字以内的总结，形式为："类型|内容"；其中，"类型"包括"学习","工作","娱乐"等\n' +
    '不考虑上下文。\n' +
    '内容尽可能详细。'
};

// TabManager类
// TabManager类 - 标签页管理服务
class TabManager {
  constructor() {
    this._logger = console;
  }

  /**
   * 获取当前活动标签页
   * @returns {Promise<chrome.tabs.Tab>} 当前活动标签页
   */
  async getActiveTab() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs || tabs.length === 0) {
        throw new Error('未找到活动标签页');
      }
      return tabs[0];
    } catch (error) {
      this._logger.error('获取活动标签页失败:', error);
      return null;
    }
  }

  /**
   * 向标签页发送消息
   * @param {number} tabId 标签页ID
   * @param {Object} message 消息内容
   * @returns {Promise<any>} 响应结果
   */
  async sendMessageToTab(tabId, message) {
    try {
      const response = await chrome.tabs.sendMessage(tabId, message);
      return response;
    } catch (error) {
      this._logger.error(`向标签页${tabId}发送消息失败:`, error);
      return null;
    }
  }

  /**
   * 修改标签页名称
   * @param {string} newName 新名称
   * @returns {Promise<boolean>} 是否成功
   */
  async renameTab(newName) {
    const tab = await this.getActiveTab();
    if (!tab) {
      this._logger.error('无法修改标签页名称: 无活动标签页');
      return false;
    }

    const response = await this.sendMessageToTab(tab.id, {
      type: 'handleNameChange',
      message: newName
    });

    return response?.status === 'accepted';
  }

  /**
   * 检查是否为特殊页面
   * @param {string} url 页面URL
   * @returns {boolean} 是否为特殊页面
   */
  isSpecialPage(url) {
    const prefixes = ['chrome://', 'about:', 'edge://'];
    return prefixes.some(prefix => url.startsWith(prefix));
  }

  /**
   * 从URL提取主机名
   * @param {string} url 页面URL
   * @returns {string|null} 主机名
   */
  extractHostname(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname;
    } catch (error) {
      this._logger.error('URL解析失败:', url, error);
      return null;
    }
  }
}

// StorageManager类
// StorageManager类 - 数据存储管理服务
class StorageManager {
  constructor() {
    this._logger = console;
  }

  /**
   * 获取存储数据
   * @param {string} key 存储键
   * @returns {Promise<any>} 存储值
   */
  async get(key) {
    try {
      const result = await chrome.storage.local.get([key]);
      return result[key];
    } catch (error) {
      this._logger.error(`获取存储${key}失败:`, error);
      return null;
    }
  }

  /**
   * 设置存储数据
   * @param {string} key 存储键
   * @param {any} value 存储值
   * @returns {Promise<boolean>} 是否成功
   */
  async set(key, value) {
    try {
      await chrome.storage.local.set({ [key]: value });
      return true;
    } catch (error) {
      this._logger.error(`设置存储${key}失败:`, error);
      return false;
    }
  }

  /**
   * 获取正则表达式列表
   * @returns {Promise<Array>} 正则表达式列表
   */
  async getRegexList() {
    try {
      const result = await chrome.storage.local.get(['regexList']);
      return result.regexList || [];
    } catch (error) {
      this._logger.error('获取正则表达式列表失败:', error);
      return [];
    }
  }

  /**
   * 保存正则表达式列表
   * @param {Array} regexList 正则表达式列表
   * @returns {Promise<boolean>} 是否成功
   */
  async saveRegexList(regexList) {
    try {
      await chrome.storage.local.set({ regexList });
      return true;
    } catch (error) {
      this._logger.error('保存正则表达式列表失败:', error);
      return false;
    }
  }

  /**
   * 添加正则表达式规则
   * @param {Object} rule 规则对象
   * @returns {Promise<boolean>} 是否成功
   */
  async addRegexRule(rule) {
    const regexList = await this.getRegexList();
    regexList.push({
      id: Date.now(),
      hostname: rule.hostname,
      replaceName: rule.replaceName
    });

    return await this.saveRegexList(regexList);
  }

  /**
   * 删除正则表达式规则
   * @param {number} ruleId 规则ID
   * @returns {Promise<boolean>} 是否成功
   */
  async deleteRegexRule(ruleId) {
    const regexList = await this.getRegexList();
    const updatedList = regexList.filter(rule => rule.id !== ruleId);
    
    if (updatedList.length === regexList.length) {
      this._logger.warn(`未找到ID为${ruleId}的规则`);
      return false;
    }

    return await this.saveRegexList(updatedList);
  }

  /**
   * 根据主机名查找匹配的规则
   * @param {string} hostname 主机名
   * @returns {Promise<Object|null>} 匹配的规则
   */
  async findRegexRuleByHostname(hostname) {
    const regexList = await this.getRegexList();
    
    for (const rule of regexList) {
      try {
        const regex = new RegExp(rule.hostname);
        if (regex.test(hostname)) {
          return rule;
        }
      } catch (error) {
        this._logger.error(`正则表达式${rule.hostname}解析失败:`, error);
      }
    }
    
    return null;
  }
}

// SettingsManager类
// SettingsManager类 - 设置管理服务
class SettingsManager {
  constructor() {
    this._logger = console;
    this._tabManager = null;
  }

  setTabManager(tabManager) {
    this._tabManager = tabManager;
  }

  /**
   * 获取设置状态
   * @param {string} key 设置键
   * @returns {Promise<boolean>} 设置状态
   */
  async getSetting(key) {
    const storage = chrome.storage.local;
    try {
      const result = await storage.get([key]);
      return result[key] || false;
    } catch (error) {
      this._logger.error(`获取${key}设置失败:`, error);
      return false;
    }
  }

  /**
   * 设置开关状态
   * @param {string} key 设置键
   * @param {boolean} value 设置值
   * @returns {Promise<boolean>} 是否成功
   */
  async setSetting(key, value) {
    const storage = chrome.storage.local;
    try {
      await storage.set({ [key]: value });
      this._logger.log(`${key}功能已${value ? '开启' : '关闭'}`);
      return true;
    } catch (error) {
      this._logger.error(`设置${key}失败:`, error);
      return false;
    }
  }

  /**
   * 初始化开关设置
   * @param {HTMLElement} switchElement 开关元素
   * @param {string} key 存储键名
   */
  async initSwitchSetting(switchElement, key) {
    // 加载初始状态
    const initialState = await this.getSetting(key);
    switchElement.checked = initialState;
    this._logger.log(`${key}初始状态: ${initialState ? '开启' : '关闭'}`);

    // 添加变更监听器
    switchElement.addEventListener('change', async (event) => {
      const isChecked = event.target.checked;
      const success = await this.setSetting(key, isChecked);
      
      if (!success) {
        event.target.checked = !isChecked; // 恢复之前的状态
      }
    });
  }

  /**
   * 批量初始化开关设置
   * @param {Object} switches 开关元素对象
   * @returns {Promise<void>}
   */
  async initAllSwitches(switches) {
    for (const [key, element] of Object.entries(switches)) {
      if (element) {
        await this.initSwitchSetting(element, key);
      } else {
        this._logger.warn(`未找到${key}对应的开关元素`);
      }
    }
  }

  /**
   * 执行自动改名功能
   * @returns {Promise<void>}
   */
  async executeAutoRename() {
    const autoRenameEnabled = await this.getSetting('ifAutoRename');
    
    if (!autoRenameEnabled) {
      this._logger.log('自动改名功能未开启');
      return;
    }

    if (!this._tabManager) {
      this._logger.error('TabManager未设置');
      return;
    }

    const tab = await this._tabManager.getActiveTab();
    if (!tab) {
      this._logger.warn('当前没有活动标签页');
      return;
    }

    const hostname = this._tabManager.extractHostname(tab.url);
    if (!hostname) {
      this._logger.error('无法提取主机名');
      return;
    }

    const storageManager = new StorageManager();
    const matchedRule = await storageManager.findRegexRuleByHostname(hostname);

    if (matchedRule) {
      await this._tabManager.sendMessageToTab(tab.id, {
        type: 'handleNameChange',
        message: matchedRule.replaceName
      });
      this._logger.log(`autoRename已应用正则表达式: ${matchedRule.replaceName}`);
    } else {
      this._logger.log('autoRename未找到匹配的正则表达式');
    }
  }

  /**
   * 执行添加关键词功能
   * @returns {Promise<void>}
   */
  async executeAddKeywords() {
    const addKeywordsEnabled = await this.getSetting('ifAddKeyWords');
    
    if (!addKeywordsEnabled) {
      this._logger.log('添加关键词功能未开启');
      return;
    }

    if (!this._tabManager) {
      this._logger.error('TabManager未设置');
      return;
    }

    const tab = await this._tabManager.getActiveTab();
    if (!tab) {
      this._logger.warn('当前没有活动标签页');
      return;
    }

    // 检查是否为特殊页面
    if (this._tabManager.isSpecialPage(tab.url)) {
      this._logger.log('addKeyWords特殊页面，跳过消息发送:', tab.url);
      return;
    }

    await this._tabManager.sendMessageToTab(tab.id, {
      type: 'ifAutoKeyWords',
      message: addKeywordsEnabled
    });
  }
}

// RegexManager类
// RegexManager类 - 正则表达式管理服务
class RegexManager {
  constructor() {
    this._logger = console;
    this._storageManager = new StorageManager();
    this._tabManager = null;
  }

  setTabManager(tabManager) {
    this._tabManager = tabManager;
  }

  /**
   * 保存正则表达式规则
   * @param {string} name 替换名称
   * @param {string} hostnamePattern 主机名匹配模式
   * @returns {Promise<boolean>} 是否成功
   */
  async saveRegexRule(name, hostnamePattern) {
    const rule = {
      id: Date.now(),
      hostname: hostnamePattern,
      replaceName: name
    };

    return await this._storageManager.addRegexRule(rule);
  }

  /**
   * 应用正则表达式规则到当前标签页
   * @returns {Promise<boolean>} 是否成功应用
   */
  async applyRegexRule() {
    if (!this._tabManager) {
      this._logger.error('TabManager未设置');
      return false;
    }

    const tab = await this._tabManager.getActiveTab();
    if (!tab) {
      this._logger.error('未找到活动标签页');
      return false;
    }

    const hostname = this._tabManager.extractHostname(tab.url);
    if (!hostname) {
      this._logger.error('无法提取主机名');
      return false;
    }

    const matchedRule = await this._storageManager.findRegexRuleByHostname(hostname);

    if (matchedRule) {
      const success = await this._tabManager.renameTab(matchedRule.replaceName);
      if (success) {
        this._logger.log(`已应用正则表达式: ${matchedRule.replaceName}`);
        return true;
      } else {
        this._logger.error('应用正则表达式失败');
        return false;
      }
    } else {
      this._logger.log('未找到匹配的正则表达式');
      return false;
    }
  }

  /**
   * 获取正则表达式列表
   * @returns {Promise<Array>} 正则表达式列表
   */
  async getRegexList() {
    return await this._storageManager.getRegexList();
  }

  /**
   * 删除正则表达式规则
   * @param {number} ruleId 规则ID
   * @returns {Promise<boolean>} 是否成功
   */
  async deleteRegexRule(ruleId) {
    return await this._storageManager.deleteRegexRule(ruleId);
  }
}

// AIProcessor类
// AIProcessor类 - AI智能总结服务
class AIProcessor {
  constructor() {
    this._logger = console;
    this._tabManager = null;
    this._storageManager = new StorageManager();
    this._apiKey = null;
  }

  setTabManager(tabManager) {
    this._tabManager = tabManager;
  }

  /**
   * 设置API密钥
   * @param {string} apiKey API密钥
   */
  setApiKey(apiKey) {
    this._apiKey = apiKey;
  }

  /**
   * 调用AI API
   * @param {string} url 网页URL
   * @returns {Promise<string|null>} AI总结结果
   */
  async callAIAPI(url) {
    if (!this._apiKey) {
      this._logger.error('API密钥未设置');
      return null;
    }

    const messages = [
      {
        role: 'system',
        content: '1. 你是一个乐于解答各种问题的助手，你的任务是为用户提供专业、准确、有见地的建议。\n' +
          '2. 你将收到一段网址，总结该网页的内容并返回一个50字以内的总结，形式为："类型|内容"；其中，"类型"包括"学习","工作","娱乐"等\n' +
          '3. 不考虑上下文。\n' +
          '4. 内容尽可能详细。'
      },
      {
        role: 'user',
        content: url
      }
    ];

    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this._apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'glm-4.6',
        messages: messages,
        temperature: 0.6
      })
    });

    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status}`);
    }

    const result = await response.json();
    return result.choices[0].message.content;
  }

  /**
   * 执行智能总结功能
   * @returns {Promise<void>}
   */
  async executeIntelligentSummary() {
    const intelligentSummaryEnabled = await this._storageManager.get('ifIntelligentSummary');
    
    if (!intelligentSummaryEnabled) {
      this._logger.log('智能总结功能未开启');
      return;
    }

    if (!this._tabManager) {
      this._logger.error('TabManager未设置');
      return;
    }

    const tab = await this._tabManager.getActiveTab();
    if (!tab) {
      this._logger.warn('当前没有活动标签页');
      return;
    }

    try {
      const summaryText = await this.callAIAPI(tab.url);
      
      if (summaryText) {
        await this._tabManager.sendMessageToTab(tab.id, {
          message: tab.url + summaryText
        });
        this._logger.log(`已AI智能总结: ${summaryText}`);
      } else {
        this._logger.error('AI智能总结出错');
      }
    } catch (error) {
      this._logger.error('生成摘要时发生错误:', error);
    }
  }
}

// PopupController类
// PopupController类 - UI控制器
class PopupController {
  constructor() {
    this._logger = console;
    this._tabManager = null;
    this._regexManager = null;
    this._settingsManager = null;
  }

  setTabManager(tabManager) {
    this._tabManager = tabManager;
  }

  setRegexManager(regexManager) {
    this._regexManager = regexManager;
  }

  setSettingsManager(settingsManager) {
    this._settingsManager = settingsManager;
  }

  /**
   * 初始化页面标签切换
   */
  initTabChange() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.classList.remove('active');

        const targetPage = document.querySelector(`#${tab.dataset.page}`);
        if (targetPage) {
          targetPage.classList.add('active');
        } else {
          this._logger.error(`未找到对应的页面元素, data-page值为: ${tab.dataset.page}`);
        }
      });
    });
  }

  /**
   * 绑定直接改名按钮事件
   */
  bindDirectRenameButton() {
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) {
      sendBtn.addEventListener('click', async () => {
        const inputText = document.getElementById('inputText').value;
        
        if (!inputText.trim()) {
          alert('请输入新的标签页名称');
          return;
        }

        if (!this._tabManager) {
          this._logger.error('TabManager未设置');
          alert('初始化失败，请检查扩展状态');
          return;
        }

        const success = await this._tabManager.renameTab(inputText);
        if (success) {
          alert(`已将标签页名改为：${inputText}`);
        } else {
          alert('修改失败，请检查标签页状态');
        }
      });
    }
  }

  /**
   * 绑定正则表达式保存按钮事件
   */
  bindRegexSaveButton() {
    const addRegexBtn = document.getElementById('addRegexBtn');
    if (addRegexBtn) {
      addRegexBtn.addEventListener('click', async () => {
        const regexName = document.getElementById('name').value;
        const regexPattern = document.getElementById('url').value;

        if (!regexName.trim() || !regexPattern.trim()) {
          alert('请填写完整的规则名称和网址');
          return;
        }

        if (!this._regexManager) {
          this._logger.error('RegexManager未设置');
          alert('初始化失败，请检查扩展状态');
          return;
        }

        const success = await this._regexManager.saveRegexRule(regexName, regexPattern);
        if (success) {
          alert(`规则已保存：${regexName}`);
        } else {
          alert('规则保存失败');
        }
      });
    }
  }

  /**
   * 绑定快速重命名按钮事件
   */
  bindQuickRenameButton() {
    const quickRenameBtn = document.getElementById('quickRenameBtn');
    if (quickRenameBtn) {
      quickRenameBtn.addEventListener('click', async () => {
        if (!this._regexManager) {
          this._logger.error('RegexManager未设置');
          alert('初始化失败，请检查扩展状态');
          return;
        }

        const success = await this._regexManager.applyRegexRule();
        if (success) {
          alert('快速重命名成功');
        } else {
          alert('快速重命名失败：未找到匹配的规则');
        }
      });
    }
  }

  /**
   * 初始化开关设置
   */
  async initSwitches() {
    const switches = {
      ifAutoRename: document.querySelector('.switch input[data-key="ifAutoRename"]'),
      ifIntelligentSummary: document.querySelector('.switch input[data-key="ifIntelligentSummary"]'),
      ifAddKeyWords: document.querySelector('.switch input[data-key="ifAddKeyWords"]')
    };

    if (this._settingsManager) {
      await this._settingsManager.initAllSwitches(switches);
    }
  }

  /**
   * 初始化所有功能
   */
  async initAll() {
    try {
      // 初始化页面标签切换
      this.initTabChange();

      // 绑定按钮事件
      this.bindDirectRenameButton();
      this.bindRegexSaveButton();
      this.bindQuickRenameButton();

      // 初始化开关设置
      await this.initSwitches();
      
      this._logger.log('PopupController初始化完成');
    } catch (error) {
      this._logger.error('PopupController初始化失败:', error);
    }
  }
}

// MessageHandler类
// MessageHandler类 - 内容脚本消息处理器
class MessageHandler {
  constructor() {
    this._logger = console;
  }

  /**
   * 处理标签页名称修改请求
   * @param {string} newName 新名称
   * @returns {Promise<Object>} 响应对象
   */
  async handleNameChange(newName) {
    try {
      this._logger.log(`已将标签页名改为：${newName}`);
      
      // 保存原始标题以便后续处理
      const originalTitle = document.title;
      document.title = newName;

      // 检查是否需要添加关键词
      const result = await chrome.storage.local.get(['ifAddKeyWords']);
      if (result.ifAddKeyWords) {
        // 获取keywords meta标签
        const keyWordsMeta = document.head.querySelector('meta[name="keywords"]');
        const keyWordsContent = keyWordsMeta ? keyWordsMeta.getAttribute('content') : "无关键词";
        
        // 获取description meta标签
        const descriptionMeta = document.head.querySelector('meta[name="description"]');
        const descriptionContent = descriptionMeta ? descriptionMeta.getAttribute('content') : "无介绍";
        
        // 组合标题：新标题 + 关键词描述
        const newTitle = newName + ' - ' + keyWordsContent + ' - ' + descriptionContent;
        document.title = newTitle;
        
        this._logger.log('autoRename后添加关键词:', keyWordsContent);
        this._logger.log('最终标题:', newTitle);
      }

      return { status: 'accepted' };
    } catch (error) {
      this._logger.error('处理标签页名称修改失败:', error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * 处理自动关键词添加请求
   * @param {boolean} enabled 是否启用
   * @returns {Promise<Object>} 响应对象
   */
  async handleAutoKeywords(enabled) {
    if (!enabled) {
      this._logger.log('addKeyWords功能已关闭');
      return { status: 'ignored' };
    }

    try {
      // 获取keywords meta标签
      const keyWordsMeta = document.head.querySelector('meta[name="keywords"]');
      const keyWordsContent = keyWordsMeta ? keyWordsMeta.getAttribute('content') : "无关键词";
      
      // 获取description meta标签
      const descriptionMeta = document.head.querySelector('meta[name="description"]');
      const descriptionContent = descriptionMeta ? descriptionMeta.getAttribute('content') : "无介绍";
      
      // 检查当前标题是否已经被autoRename修改过
      const currentTitle = document.title;
      
      // 如果标题已经包含关键词分隔符，说明可能已经被处理过
      if (currentTitle.includes(' - ')) {
        // 提取原始标题部分（去掉关键词部分）
        const titleParts = currentTitle.split(' - ');
        const baseTitle = titleParts[0]; // 基础标题（可能是autoRename的结果）
        
        // 重新组合标题：基础标题 + 关键词 + 描述
        const newTitle = baseTitle + '\n' + keyWordsContent + '\n' + descriptionContent;
        document.title = newTitle;
      } else {
        // 如果标题没有被处理过，直接添加关键词
        const newTitle = currentTitle + '\n' + keyWordsContent + '\n' + descriptionContent;
        document.title = newTitle;
      }
      
      this._logger.log('addKeyWords已添加关键词:', keyWordsContent);
      this._logger.log('新标题:', document.title);
      
      return { status: 'accepted' };
    } catch (error) {
      this._logger.error('处理自动关键词添加失败:', error);
      return { status: 'error', message: error.message };
    }
  }

  /**
   * 注册消息监听器
   */
  registerMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      let handlerPromise;
      
      if (request.type === 'handleNameChange') {
        handlerPromise = this.handleNameChange(request.message);
      } else if (request.type === 'ifAutoKeyWords') {
        handlerPromise = this.handleAutoKeywords(request.message);
      } else {
        this._logger.warn(`未知的消息类型: ${request.type}`);
        sendResponse({ status: 'unknown', message: `未知的消息类型: ${request.type}` });
        return false;
      }

      // 异步处理并返回响应
      handlerPromise.then(response => {
        sendResponse(response);
      }).catch(error => {
        sendResponse({ status: 'error', message: error.message });
      });

      return true; // 保持消息通道开放
    });
  }

  /**
   * 初始化
   */
  init() {
    this._logger.log('content-script loaded');
    this.registerMessageListener();
  }
}

// BackgroundService类
// BackgroundService类 - 后台服务
class BackgroundService {
  constructor() {
    this._logger = console;
    this._tabManager = null;
    this._settingsManager = null;
    this._regexManager = null;
    this._aiProcessor = null;
  }

  setTabManager(tabManager) {
    this._tabManager = tabManager;
  }

  setSettingsManager(settingsManager) {
    this._settingsManager = settingsManager;
  }

  setRegexManager(regexManager) {
    this._regexManager = regexManager;
  }

  setAIProcessor(aiProcessor) {
    this._aiProcessor = aiProcessor;
  }

  /**
   * 初始化监听器
   */
  initListeners() {
    // 监听标签页更新事件
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.active) {
        this.onTabUpdated(tabId, tab);
      }
    });

    this._logger.log('background script loaded');
  }

  /**
   * 处理标签页更新事件
   * @param {number} tabId 标签页ID
   * @param {chrome.tabs.Tab} tab 标签页对象
   */
  async onTabUpdated(tabId, tab) {
    try {
      // 执行自动改名
      await this._settingsManager.executeAutoRename();
      
      // 执行添加关键词
      await this._settingsManager.executeAddKeywords();
      
      // 执行智能总结（如果AIProcessor已设置）
      if (this._aiProcessor) {
        await this._aiProcessor.executeIntelligentSummary();
      }
    } catch (error) {
      this._logger.error('处理标签页更新事件失败:', error);
    }
  }

  /**
   * 启动所有功能
   */
  async startAllServices() {
    if (!this._tabManager || !this._settingsManager) {
      this._logger.error('TabManager或SettingsManager未设置');
      return;
    }

    this._logger.log('所有后台服务已启动');
  }
}

// 导出所有类作为全局变量
window.TabManager = TabManager;
window.StorageManager = StorageManager;
window.SettingsManager = SettingsManager;
window.RegexManager = RegexManager;
window.AIProcessor = AIProcessor;
window.PopupController = PopupController;
window.MessageHandler = MessageHandler;
window.BackgroundService = BackgroundService;
