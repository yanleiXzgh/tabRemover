// SettingsManager类 - 设置管理服务
export class SettingsManager {
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