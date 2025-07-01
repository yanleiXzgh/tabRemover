console.log('content-script loaded')
//监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log(`已将标签页名改为：${request.message}`);
    document.title = request.message;
    sendResponse({status: 'accepted'});
    return true;
});
