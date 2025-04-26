/**
 * 处理发送消息按钮点击事件
 * @param {Event} event - 点击事件对象
 * @returns {void}
 * @throws {Error} 当消息发送失败时抛出异常
 */
function handleClick(event) {
    inputText = document.getElementById('inputText').value;
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    
    chrome.tabs.sendMessage(tabs[0].id, {
      message: inputText,
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.log(`failed sending message: ${chrome.runtime.lastError?.message || '未知错误'}`);
        return;
      }
      console.log('accepted response:', response?.status);
    });
  });
}

// 初始化事件监听
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('sendBtn').addEventListener('click', handleClick);
});