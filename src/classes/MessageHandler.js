// MessageHandler类 - 内容脚本消息处理器
export class MessageHandler {
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