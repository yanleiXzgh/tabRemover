// StorageManager类 - 数据存储管理服务
export class StorageManager {
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