// AIProcessor类 - AI智能总结服务
export class AIProcessor {
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