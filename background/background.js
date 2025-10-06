console.log('background script loaded');

import {aiSummary} from './aiSummary.js';

function autoRename() {

    //chrome.storage.local.get([key], (result) => {
    //         if (chrome.runtime.lastError) {
    //             console.error(`获取 ${key} 状态失败: ${chrome.runtime.lastError.message}`);
    //             return;
    //         }
    //
    //         // 设置初始状态（如果存储中没有值，默认为false）
    //         const initialState = result[key] || false;
    //         switchElement.checked = initialState;
    //         console.log(`${key} 初始状态: ${initialState ? '开启' : '关闭'}`);
    //     });
    chrome.storage.local.get(['ifAutoRename'], (result) => {
        if (chrome.runtime.lastError) {
            console.error(`获取自动改名状态失败: ${chrome.runtime.lastError.message}`);
            return;
        }

        if (result.ifAutoRename) {
            console.log("自动改名已开启！")
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
                        chrome.notifications.alert('未找到匹配的正则表达式');
                    }
                });
            });
        }
    });
}

function intelligentSummary(param, input) {
    chrome.storage.label.get(['ifIntelligentSummary'], (result) => {
        if (chrome.runtime.lastError) {
            console.error(`获取自动改名状态失败: ${chrome.runtime.lastError.message}`);
            return;
        }
        if (result.ifIntelligentSummary) {
            chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
                if (!tabs[0] || !tabs[0].id) {
                    console.warn("当前没有活动标签页");
                    return;
                }
                //TODO:fulfill the functions
                try {
                    const summaryText = await aiSummary(urlObj.href);
                    console.log('总结:', summaryText);
                    // 在这里可以继续处理 summaryText

                    if (summaryText) {
                        // 应用匹配规则
                        chrome.tabs.sendMessage(tabs[0].id, {message: urlObj.hostname + summaryText,}, (response) => {
                            if (chrome.runtime.lastError) {
                                console.log(`failed sending message: ${chrome.runtime.lastError?.message || '未知错误'}`);
                                return;
                            }
                            console.log('accepted response:', response?.status);
                        });
                        console.log(`已AI智能总结：${summaryText}`);
                    } else {
                        chrome.notifications.alert('AI智能总结出错');
                    }

                } catch (error) {
                    console.error('生成摘要时发生错误:', error);
                }

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

