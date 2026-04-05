// RegexManager类 - 正则表达式管理服务
export class RegexManager {
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