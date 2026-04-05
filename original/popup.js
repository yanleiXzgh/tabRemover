/**
 * 重构后的popup.js - 使用面向对象架构
 */

// 导入需要的类
import { TabManager } from '../src/services/TabManager.js';
import { RegexManager } from '../src/services/RegexManager.js';
import { SettingsManager } from '../src/services/SettingsManager.js';
import { PopupController } from '../src/classes/PopupController.js';

// 主应用程序
class App {
  constructor() {
    this._logger = console;
    
    // 初始化管理器
    this.tabManager = new TabManager();
    this.regexManager = new RegexManager();
    this.settingsManager = new SettingsManager();
    this.popupController = new PopupController();
    
    // 设置依赖关系
    this.regexManager.setTabManager(this.tabManager);
    this.settingsManager.setTabManager(this.tabManager);
    this.popupController.setTabManager(this.tabManager);
    this.popupController.setRegexManager(this.regexManager);
    this.popupController.setSettingsManager(this.settingsManager);
  }

  /**
   * 启动应用程序
   */
  async start() {
    try {
      await this.popupController.initAll();
      this._logger.log('应用程序启动成功');
    } catch (error) {
      this._logger.error('应用程序启动失败:', error);
    }
  }
}

// 初始化并启动应用程序
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.start();
});