// TabManager类 - 标签页管理服务
export class TabManager {
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