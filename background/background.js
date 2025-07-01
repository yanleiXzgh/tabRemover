console.log('background script loaded');

function autoRename() {
    chrome.storage.local.get(['autoRename'], (result) => {
        if (chrome.runtime.lastError) {
            console.error(`获取自动改名状态失败: ${chrome.runtime.lastError.message}`);
            return;
        }

        if (result.autoRename) {
            chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                if (!tabs[0] || !tabs[0].id) {
                    console.warn("当前没有活动标签页");
                    return;
                }

                const tabId = tabs[0].id;

                const urlObj = new URL(tabs[0].url); // 获取当前标签页的 URL 对象
                const currentHostname = urlObj.hostname; // 获取域名

                chrome.storage.local.get(['regexList'], (result) => {
                    const regexList = result.regexList || [];
                    const matchedRule = regexList.find(rule =>
                        new RegExp(rule.hostname).test(currentHostname) // 匹配规则
                    );

                    if (matchedRule) {
                        // 应用匹配规则
                        chrome.tabs.sendMessage(tabs[0].id, {message: matchedRule.replaceName,}, (response) => {
                            if (chrome.runtime.lastError) {
                                console.log(`failed sending message: ${chrome.runtime.lastError?.message || '未知错误'}`);
                                return;
                            }
                            console.log('accepted response:', response?.status);
                        });
                        console.log(`已应用正则表达式：${matchedRule.replaceName}`);
                    } else {
                        window.alert('未找到匹配的正则表达式');
                    }
                });
            });
        }
    });
}

// 添加标签页更新事件监听
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active) {
        autoRename();
    }
});
