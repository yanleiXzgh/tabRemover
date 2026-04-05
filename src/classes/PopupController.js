// PopupController类 - UI控制器
export class PopupController {
  constructor() {
    this._logger = console;
    this._tabManager = null;
    this._regexManager = null;
    this._settingsManager = null;
  }

  setTabManager(tabManager) {
    this._tabManager = tabManager;
  }

  setRegexManager(regexManager) {
    this._regexManager = regexManager;
  }

  setSettingsManager(settingsManager) {
    this._settingsManager = settingsManager;
  }

  /**
   * 初始化页面标签切换
   */
  initTabChange() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const pages = document.querySelectorAll('.page');
        pages.forEach(page => page.classList.remove('active');

        const targetPage = document.querySelector(`#${tab.dataset.page}`);
        if (targetPage) {
          targetPage.classList.add('active');
        } else {
          this._logger.error(`未找到对应的页面元素, data-page值为: ${tab.dataset.page}`);
        }
      });
    });
  }

  /**
   * 绑定直接改名按钮事件
   */
  bindDirectRenameButton() {
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) {
      sendBtn.addEventListener('click', async () => {
        const inputText = document.getElementById('inputText').value;
        
        if (!inputText.trim()) {
          alert('请输入新的标签页名称');
          return;
        }

        if (!this._tabManager) {
          this._logger.error('TabManager未设置');
          alert('初始化失败，请检查扩展状态');
          return;
        }

        const success = await this._tabManager.renameTab(inputText);
        if (success) {
          alert(`已将标签页名改为：${inputText}`);
        } else {
          alert('修改失败，请检查标签页状态');
        }
      });
    }
  }

  /**
   * 绑定正则表达式保存按钮事件
   */
  bindRegexSaveButton() {
    const addRegexBtn = document.getElementById('addRegexBtn');
    if (addRegexBtn) {
      addRegexBtn.addEventListener('click', async () => {
        const regexName = document.getElementById('name').value;
        const regexPattern = document.getElementById('url').value;

        if (!regexName.trim() || !regexPattern.trim()) {
          alert('请填写完整的规则名称和网址');
          return;
        }

        if (!this._regexManager) {
          this._logger.error('RegexManager未设置');
          alert('初始化失败，请检查扩展状态');
          return;
        }

        const success = await this._regexManager.saveRegexRule(regexName, regexPattern);
        if (success) {
          alert(`规则已保存：${regexName}`);
        } else {
          alert('规则保存失败');
        }
      });
    }
  }

  /**
   * 绑定快速重命名按钮事件
   */
  bindQuickRenameButton() {
    const quickRenameBtn = document.getElementById('quickRenameBtn');
    if (quickRenameBtn) {
      quickRenameBtn.addEventListener('click', async () => {
        if (!this._regexManager) {
          this._logger.error('RegexManager未设置');
          alert('初始化失败，请检查扩展状态');
          return;
        }

        const success = await this._regexManager.applyRegexRule();
        if (success) {
          alert('快速重命名成功');
        } else {
          alert('快速重命名失败：未找到匹配的规则');
        }
      });
    }
  }

  /**
   * 初始化开关设置
   */
  async initSwitches() {
    const switches = {
      ifAutoRename: document.querySelector('.switch input[data-key="ifAutoRename"]'),
      ifIntelligentSummary: document.querySelector('.switch input[data-key="ifIntelligentSummary"]'),
      ifAddKeyWords: document.querySelector('.switch input[data-key="ifAddKeyWords"]')
    };

    if (this._settingsManager) {
      await this._settingsManager.initAllSwitches(switches);
    }
  }

  /**
   * 初始化所有功能
   */
  async initAll() {
    try {
      // 初始化页面标签切换
      this.initTabChange();

      // 绑定按钮事件
      this.bindDirectRenameButton();
      this.bindRegexSaveButton();
      this.bindQuickRenameButton();

      // 初始化开关设置
      await this.initSwitches();
      
      this._logger.log('PopupController初始化完成');
    } catch (error) {
      this._logger.error('PopupController初始化失败:', error);
    }
  }
}