// BackgroundService类 - 后台服务
export class BackgroundService {
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