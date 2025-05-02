//修改名称
function handleNameChange(event,newName) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => { //获取当前标签页
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
//存储正则表达式
function storeRegexClick(event) {
  // 声明常量避免污染全局作用域
  const regexName = document.getElementById('name').value;
  const regexPattern = document.getElementById('url').value;
  
  // 使用结构化存储
  chrome.storage.local.get(['regexList'], (result) => {
    const regexList = result.regexList || [];
    regexList.push({ 
      hostname: regexPattern,  // 存储匹配规则
      replaceName: regexName    // 存储替换名称
    });
    
    chrome.storage.local.set({ regexList }, () => {
      window.alert(`规则已保存：${regexName}`);
    });
  });
}

// 应用正则表达式
function applyRegexClick(event) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0]) {
      console.error('未找到活动标签页');
      return;
    }
    //获取当前标签页的域名
    const urlObj = new URL(tabs[0].url);
    const currentHostname = urlObj.hostname;
    
    chrome.storage.local.get(['regexList'], (result) => {
      const regexList = result.regexList || [];
      // 查找匹配规则
      const matchedRule = regexList.find(rule => 
        new RegExp(rule.hostname).test(currentHostname)
      );
      
      if (matchedRule) {
        handleNameChange(null, matchedRule.replaceName);
        console.log(`已应用正则表达式：${matchedRule.replaceName}`);
      } else {
        window.alert('未找到匹配的正则表达式');
      }
    });
  });
}

//切换页面
function tabChange() {
  const tabs = document.querySelectorAll('.tab'); 
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      //标签页切换
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      //切换页面显示
      const pages = document.querySelectorAll('.page'); // 获取所有页面.page,css元素
      pages.forEach(page => page.classList.remove('active')); // 移除所有页面的active状态
      // 显示当前页面
      const targetPage = document.querySelector(`#${tab.dataset.page}`); //用“#${}”来获取tab的data-page属性的值
      if (targetPage) {
        targetPage.classList.add('active'); // 添加当前页面的active状态
      } else {
        console.error(`未找到对应的页面元素,data-page 值为: ${tab.dataset.page}`);
      }
    });
  });
}


//查看storage数据
// chrome.storage.local.get(null, (result) => { //获取storage数据
//   console.log('Storage data:', result); //输出storage数据
//   //用window.alert()显示storage数据：
//   window.alert(`Storage data: ${JSON.stringify(result)}`); //用window.alert()显示storage数据
// });


// 初始化事件监听
// 监听DOM加载完成事件，确保DOM元素可用后再添加事件监听器
document.addEventListener('DOMContentLoaded', () => {
  // document.getElementById('sendBtn').addEventListener('click', handleClick);
  document.getElementById('sendBtn').addEventListener('click', () => {
    const inputText = document.getElementById('inputText').value;
    handleNameChange(null,inputText);
  });
  tabChange();
  document.getElementById("addRegexBtn").addEventListener("click", storeRegexClick); // 添加按钮的点击事件
  // applyRegexClick();
  document.getElementById("quickRenameBtn").addEventListener("click", applyRegexClick); // 添加按钮的点击事件
});