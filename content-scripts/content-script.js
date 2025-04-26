console.log('Content script injected');

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  window.alert(`已将标签页名改为：${request.message}`);
  document.title = request.message;
  sendResponse({status: 'accepted'});
});