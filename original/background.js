/**
 * 重构后的background.js - 使用面向对象架构
 */

// 导入需要的类
import { TabManager } from '../src/services/TabManager.js';
import { SettingsManager } from '../src/services/SettingsManager.js';
import { RegexManager } from '../src/services/RegexManager.js';
import { AIProcessor } from '../src/services/AIProcessor.js';
import { BackgroundService } from '../src/classes/BackgroundService.js';

// 主后台应用程序
class BackgroundApp {
  constructor() {
    this._logger = console;
    
    // 初始化管理器
    this.tabManager = new TabManager();
    this.settingsManager = new SettingsManager();
    this.regexManager = new RegexManager();
    this.aiProcessor = new AIProcessor();
    this.backgroundService = new BackgroundService();
    
    // 设置依赖关系
    this.settingsManager.setTabManager(this.tabManager);
    this.regexManager.setTabManager(this.tabManager);
    this.aiProcessor.setTabManager(this.tabManager);
    
    this.backgroundService.setTabManager(this.tabManager);
    this.backgroundService.setSettingsManager(this.settingsManager);
    this.backgroundService.setRegexManager(this.regexManager);
    this.backgroundService.setAIProcessor(this.aiProcessor);
    
    // 设置AI API密钥（从配置或用户输入获取）
    // this.aiProcessor.setApiKey('YOUR_API_KEY');
  }

  /**
   * 启动后台应用程序
   */
  start() {
    this.backgroundService.initListeners();
    this.backgroundService.startAllServices();
    
    this._logger.log('后台应用程序启动成功');
  }
}

// 启动后台应用程序
const backgroundApp = new BackgroundApp();
backgroundApp.start();