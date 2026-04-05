/**
 * 构建脚本 - 将ES6模块打包为传统JS文件
 */

const fs = require('fs');
const path = require('path');

// 源文件目录和目标目录
const srcDir = path.join(__dirname, 'src');
const distDir = path.join(__dirname, 'dist');
const originalFilesDir = path.join(__dirname, 'original');

// 创建目标目录
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// 创建原始文件备份目录
if (!fs.existsSync(originalFilesDir)) {
  fs.mkdirSync(originalFilesDir, { recursive: true });
}

/**
 * 打包所有ES6模块到一个文件中
 */
function bundleES6Modules() {
  const modules = {
    constants: fs.readFileSync(path.join(srcDir, 'utils/constants.js'), 'utf8'),
    TabManager: fs.readFileSync(path.join(srcDir, 'services/TabManager.js'), 'utf8'),
    StorageManager: fs.readFileSync(path.join(srcDir, 'services/StorageManager.js'), 'utf8'),
    SettingsManager: fs.readFileSync(path.join(srcDir, 'services/SettingsManager.js'), 'utf8'),
    RegexManager: fs.readFileSync(path.join(srcDir, 'services/RegexManager.js'), 'utf8'),
    AIProcessor: fs.readFileSync(path.join(srcDir, 'services/AIProcessor.js'), 'utf8'),
    PopupController: fs.readFileSync(path.join(srcDir, 'classes/PopupController.js'), 'utf8'),
    MessageHandler: fs.readFileSync(path.join(srcDir, 'classes/MessageHandler.js'), 'utf8'),
    BackgroundService: fs.readFileSync(path.join(srcDir, 'classes/BackgroundService.js'), 'utf8')
  };

  // 创建一个打包文件，将所有类作为全局变量导出
  const bundledCode = `
// TapRenamer重构版 - ES6模块打包版本
// 将所有模块转换为传统JavaScript格式

// 常量定义
${modules.constants.replace(/export const/g, 'const')}

// TabManager类
${modules.TabManager.replace(/export class/g, 'class')}

// StorageManager类
${modules.StorageManager.replace(/export class/g, 'class')}

// SettingsManager类
${modules.SettingsManager.replace(/export class/g, 'class')}

// RegexManager类
${modules.RegexManager.replace(/export class/g, 'class')}

// AIProcessor类
${modules.AIProcessor.replace(/export class/g, 'class')}

// PopupController类
${modules.PopupController.replace(/export class/g, 'class')}

// MessageHandler类
${modules.MessageHandler.replace(/export class/g, 'class')}

// BackgroundService类
${modules.BackgroundService.replace(/export class/g, 'class')}

// 导出所有类作为全局变量
window.TabManager = TabManager;
window.StorageManager = StorageManager;
window.SettingsManager = SettingsManager;
window.RegexManager = RegexManager;
window.AIProcessor = AIProcessor;
window.PopupController = PopupController;
window.MessageHandler = MessageHandler;
window.BackgroundService = BackgroundService;
`;

  fs.writeFileSync(path.join(distDir, 'bundled.js'), bundledCode);
  console.log('ES6模块打包完成');
}

/**
 * 创建popup.js传统版本
 */
function createTraditionalPopupJS() {
  const bundledCode = fs.readFileSync(path.join(distDir, 'bundled.js'), 'utf8');
  
  const traditionalPopupJS = `
/**
 * 重构后的popup.js - 传统版本（不使用ES6模块）
 */

${bundledCode}

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
`;

  fs.writeFileSync(path.join(distDir, 'popup.js'), traditionalPopupJS);
  console.log('传统版popup.js创建完成');
}

/**
 * 创建content-script.js传统版本
 */
function createTraditionalContentScriptJS() {
  const bundledCode = fs.readFileSync(path.join(distDir, 'bundled.js'), 'utf8');
  
  const traditionalContentScriptJS = `
/**
 * 重构后的content-script.js - 传统版本（不使用ES6模块）
 */

${bundledCode}

// 初始化MessageHandler
const messageHandler = new MessageHandler();

// 启动消息监听器
messageHandler.init();
`;

  fs.writeFileSync(path.join(distDir, 'content-script.js'), traditionalContentScriptJS);
  console.log('传统版content-script.js创建完成');
}

/**
 * 创建background.js传统版本
 */
function createTraditionalBackgroundJS() {
  const bundledCode = fs.readFileSync(path.join(distDir, 'bundled.js'), 'utf8');
  
  const traditionalBackgroundJS = `
/**
 * 重构后的background.js - 传统版本（不使用ES6模块）
 */

${bundledCode}

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
`;

  fs.writeFileSync(path.join(distDir, 'background.js'), traditionalBackgroundJS);
  console.log('传统版background.js创建完成');
}

/**
 * 备份原始文件
 */
function backupOriginalFiles() {
  const filesToBackup = [
    { source: 'popup/popup.js', dest: 'popup.js' },
    { source: 'content-scripts/content-script.js', dest: 'content-script.js' },
    { source: 'background/background.js', dest: 'background.js' }
  ];

  for (const file of filesToBackup) {
    const sourcePath = path.join(__dirname, file.source);
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, path.join(originalFilesDir, file.dest));
      console.log(`备份${file.source}到${file.dest}`);
    }
  }
}

/**
 * 复制样式和HTML文件
 */
function copyStaticFiles() {
  const staticFiles = [
    'popup/popup.html',
    'popup/style.css',
    'manifest.json',
    'images/icon16.png',
    'images/icon48.png',
    'images/icon128.png'
  ];

  for (const file of staticFiles) {
    const sourcePath = path.join(__dirname, file);
    const destPath = path.join(distDir, file);
    
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destPath);
      console.log(`复制${file}`);
    }
  }
}

/**
 * 更新manifest.json为非模块版本
 */
function updateManifestForTraditional() {
  const manifestPath = path.join(distDir, 'manifest.json');
  const manifestContent = fs.readFileSync(manifestPath, 'utf8');
  
  // 将ES6模块配置改为传统配置
  const updatedManifest = manifestContent.replace(/"module": true/g, '')
    .replace(/"type": "module"/g, '')
    .replace(/content-scripts\/content-script.js/g, 'content-script.js')
    .replace(/background\/background.js/g, 'background.js');
    
  fs.writeFileSync(manifestPath, updatedManifest);
  console.log('manifest.json更新为传统版本');
}

/**
 * 创建传统版本项目结构
 */
function createTraditionalProjectStructure() {
  // 1. 备份原始文件
  backupOriginalFiles();
  
  // 2. 打包ES6模块
  bundleES6Modules();
  
  // 3. 创建传统版本JS文件
  createTraditionalPopupJS();
  createTraditionalContentScriptJS();
  createTraditionalBackgroundJS();
  
  // 4. 复制静态文件
  copyStaticFiles();
  
  // 5. 更新manifest.json
  updateManifestForTraditional();
  
  console.log('传统版本构建完成！');
}

// 执行构建
createTraditionalProjectStructure();

console.log('\n构建完成后，有两种方式使用：');
console.log('1. ES6模块版本: 使用src目录下的重构代码');
console.log('2. 传统版本: 使用dist目录下的打包代码');
console.log('\n使用传统版本：');
console.log('1. 将dist目录复制为新文件夹');
console.log('2. 在浏览器中加载dist目录作为扩展');
console.log('3. 测试重构功能是否正常工作');