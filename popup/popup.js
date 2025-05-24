/**
 * 修改标签页名称-mainFuc
 * @param {Event|null} event - 事件对象（可选）
 * @param {string} newName - 新的标签页名称
 */
function handleNameChange(event, newName) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => { // 获取当前活动标签页
    chrome.tabs.sendMessage(tabs[0].id, {
      message: newName,
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.log(`failed sending message: ${chrome.runtime.lastError?.message || '未知错误'}`);
        return;
      }
      console.log('accepted response:', response?.status);
    });
  });
}

/**
 * 存储正则表达式规则
 * @param {Event} event - 事件对象
 */
function storeRegexClick(event) {
  const regexName = document.getElementById('name').value; // 获取规则名称
  const regexPattern = document.getElementById('url').value; // 获取规则的正则表达式

  chrome.storage.local.get(['regexList'], (result) => {
    const regexList = result.regexList || [];
    regexList.push({
      id: Date.now(), // 唯一标识符
      hostname: regexPattern, // 匹配规则
      replaceName: regexName // 替换名称
    });

    chrome.storage.local.set({ regexList }, () => {
      window.alert(`规则已保存：${regexName}`);
    });
  });
}

/**
 * 删除正则表达式
 */
function deleteRegexClick(event) {

}
/**
 * 应用正则表达式规则到当前标签页
 * @param {Event} event - 事件对象
 */
function applyRegexClick(event) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) {
      console.error('未找到活动标签页');
      return;
    }
    const urlObj = new URL(tabs[0].url); // 获取当前标签页的 URL 对象
    const currentHostname = urlObj.hostname; // 获取域名

    chrome.storage.local.get(['regexList'], (result) => {
      const regexList = result.regexList || [];
      const matchedRule = regexList.find(rule =>
        new RegExp(rule.hostname).test(currentHostname) // 匹配规则
      );

      if (matchedRule) {
        handleNameChange(null, matchedRule.replaceName); // 应用匹配规则
        console.log(`已应用正则表达式：${matchedRule.replaceName}`);
      } else {
        window.alert('未找到匹配的正则表达式');
      }
    });
  });
}

/**
 * 切换页面标签
 */
function tabChange() {
  const tabs = document.querySelectorAll('.tab'); // 获取所有标签页元素
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active')); // 移除所有标签页的激活状态
      tab.classList.add('active'); // 激活当前标签页

      const pages = document.querySelectorAll('.page'); // 获取所有页面元素
      pages.forEach(page => page.classList.remove('active')); // 移除所有页面的激活状态

      const targetPage = document.querySelector(`#${tab.dataset.page}`); // 获取目标页面
      if (targetPage) {
        targetPage.classList.add('active'); // 激活目标页面
      } else {
        console.error(`未找到对应的页面元素,data-page 值为: ${tab.dataset.page}`);
      }
    });
  });
}

/**
 * 初始化事件监听器
 * 在 DOM 加载完成后绑定事件
 */
document.addEventListener('DOMContentLoaded', () => {
  tabChange(); // 初始化标签页切换功能
  document.getElementById("addRegexBtn").addEventListener("click", storeRegexClick); // 绑定存储规则按钮事件
  document.getElementById("quickRenameBtn").addEventListener("click", applyRegexClick); // 绑定快速重命名按钮事件
  // document.getElementById("deleteRegexBtn").addEventListener("click", deleteRegexClick); // 绑定删除规则按钮事件
  document.getElementById('sendBtn').addEventListener('click', () => {
    const inputText = document.getElementById('inputText').value; // 获取输入框的值
    handleNameChange(null, inputText); // 修改标签页名称
  });
});