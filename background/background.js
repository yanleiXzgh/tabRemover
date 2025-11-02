console.log('background script loaded');

/**
 * 自动改名
 */
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

                // const tabId = tabs[0].id;

                const urlObj = new URL(tabs[0].url); // 获取当前标签页的 URL 对象
                const currentHostname = urlObj.hostname; // 获取域名

                chrome.storage.local.get(['regexList'], (result) => {
                    const regexList = result.regexList || [];
                    const matchedRule = regexList.find(rule =>
                        new RegExp(rule.hostname).test(currentHostname) // 匹配规则
                    );

                    if (matchedRule) {
                        // 应用匹配规则
                        chrome.tabs.sendMessage(tabs[0].id, {type:'handleNameChange', message: matchedRule.replaceName,}, (response) => {
                            if (chrome.runtime.lastError) {
                                console.log(`failed sending message: ${chrome.runtime.lastError?.message || '未知错误'}`);
                                return;
                            }
                            console.log('autoRename消息状态:', response?.status);
                        });
                        console.log(`autoRename已应用正则表达式：${matchedRule.replaceName}`);
                    } else {
                        console.log('autoRename未找到匹配的正则表达式');
                    }
                });
            });
        }
    });
}

/**
 * 智能总结
 * @param {string} input -文本内容
 */
function intelligentSummary(input) {
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
                    console.log('总结:', summaryText || input);
                    // 在这里可以继续处理 summaryText

                    if (summaryText) {
                        // 智能总结
                        chrome.tabs.sendMessage(tabs[0].id, {message: urlObj.hostname + summaryText,}, (response) => {
                            if (chrome.runtime.lastError) {
                                console.log(`failed sending message: ${chrome.runtime.lastError?.message || '未知错误'}`);
                                return;
                            }
                            console.log('accepted response:', response?.status);
                        });
                        console.log(`已AI智能总结：${summaryText}`);
                    } else {
                        console.error('AI智能总结出错');
                    }

                } catch (error) {
                    console.error('生成摘要时发生错误:', error);
                }

            });
        }

    });
}

/**
 * AI智能总结-智谱api
 * @param messages
 * @param model
 * @returns {Promise<any>}
 */
async function callZhipuAPI(messages, model = 'glm-4.6') {
    const url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': 'Bearer YOUR_API_KEY',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: model,
            messages: messages,
            temperature: 0.6
        })
    });

    if (!response.ok) {
        throw new Error(`API 调用失败: ${response.status}`);
    }

    return await response.json();
}

/**
 * 智能总结
 * @param inputURL
 * @returns {Promise<void>}
 */
async function aiSummary(inputURL) {
    const systemMessage = '1. 你是一个乐于解答各种问题的助手，你的任务是为用户提供专业、准确、有见地的建议。\n' +
        '2. 你将收到一段网址，总结该网页的内容并返回一个50字以内的总结，形式为：“类型|内容”；其中，“类型”包括“学习”，“工作”，“娱乐”等\n' +
        '3. 不考虑上下文。\n' +
        '4. 内容尽可能详细。'
// 使用示例
    const messages = [
        { role: 'system', content: systemMessage },
        { role: 'user', content: inputURL}
    ];

    callZhipuAPI(messages)
        .then(result => {
            console.log(result.choices[0].message.content);
            return result.choices[0].message.content;
        })
        .catch(error => {
            console.error('错误:', error);
        });
    // try {
    //     const result = await callZhipuAPI(messages);
    //     return result.choices[0].message.content;
    // } catch (error) {
    //     console.error('错误:', error);
    //     throw error; // 重新抛出错误以便在调用处处理
    // }
}

/**
 * 关键词添加
 * @description 自动添加关键词到标签页标题
 * @returns {void}
 */
function addKeyWords() {
    chrome.storage.local.get(['ifAddKeyWords'], (result) => {
        if (chrome.runtime.lastError) {
            console.error(`获取自动改名状态失败: ${chrome.runtime.lastError.message}`);
            return;
        }
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            if (!tabs[0] || !tabs[0].id) {
                console.warn("当前没有活动标签页");
                return;
            }
            // 检查是否为特殊页面（不支持content script的页面）
            const tabUrl = tabs[0].url;
            if (tabUrl.startsWith('chrome://') || tabUrl.startsWith('about:') || tabUrl.startsWith('edge://')) {
                console.log('addKeyWords特殊页面，跳过消息发送:', tabUrl);
                return;
            }
            
            const tabId = tabs[0].id;
            const messageFlag = result.ifAddKeyWords;
            try {
                chrome.tabs.sendMessage(tabId, {
                    type: 'ifAutoKeyWords',
                    message: messageFlag
                }, (response) => {
                    if (chrome.runtime.lastError) {
                        console.error(`addKeyWords消息发送失败: ${chrome.runtime.lastError.message || '未知错误'}`);
                        return;
                    }
                    console.log('addKeyWords消息状态:', response?.status);
                });
            } catch (error) {
                console.error('addKeyWords发送消息时捕获异常:', error.message);
            }
        });
    });
}



/**
 * 添加标签页更新事件监听
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active) {
        // 等待autoRename执行完成后再执行addKeyWords
        autoRename((autoRenameSuccess) => {
            if (autoRenameSuccess) {
                addKeyWords();
            }
        });
    }
});