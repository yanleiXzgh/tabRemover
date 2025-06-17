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

chrome.storage.local.get(['autoRename'], (result) => {
    if (result.autoRename) {
        console.log('already auto rename');
        // 启用自动改名功能
        applyRegexClick();
    }
});
