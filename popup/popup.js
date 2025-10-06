/**
 * 修改标签页名称-mainFuc
 * @param {Event|null} event - 事件对象（可选）
 * @param {string} newName - 新的标签页名称
 */
function handleNameChange(event, newName) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => { // 获取当前活动标签页
        chrome.tabs.sendMessage(tabs[0].id, {message: newName,}, (response) => {
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

        chrome.storage.local.set({regexList}, () => {
            window.alert(`规则已保存：${regexName}`);
        });
    });
}
/**
 * 删除正则表达式
 */
function deleteRegexClick(event) {
    //按id删除表达式
    const idToRemove = a;
    chrome.storage.local.get(['regexList'], (result) => {
        newRules = newRules.filter(rule => rule.id !== idToRemove);
        chrome.storage.local.set({ rules }, () => {
            console.log(`Rule with ID "${idToRemove}" has been removed.`);
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


// /**
//  * 开关设置
//  */
//
// function buttonSettings(switchElement, key) {
//     switchElement.addEventListener('change', (event) => {
//     const isChecked = event.target.checked;
//     chrome.storage.local.set({[key] : isChecked}, () => {
//         if (chrome.runtime.lastError) {
//             console.error(`设置 ${key} 失败: ${chrome.runtime.lastError.message}`);
//             // return;
//         }
//         console.log(`${key} 功能已${isChecked ? '开启' : '关闭'}`);
//     });
//     chrome.storage.local.get([key],(result) => {
//         if (chrome.runtime.lastError) {
//             console.error(`获取 ${key} 状态失败: ${chrome.runtime.lastError.message}`);
//             // return;
//         }
//         switchElement.checked = result[key] || false;
//
//     });
//     });
// }
//
// // function ifAutoRename() {
// //     const switchElement = document.querySelector('.switch input[type="checkbox"]');
// //     if (!switchElement) {
// //         console.error('未找到开关元素');
// //         return;
// //     }
// //     switchElement.addEventListener('change', (event) => {
// //         const isChecked = event.target.checked;
// //         chrome.storage.local.set({ autoRename: isChecked }, () => {
// //             if (chrome.runtime.lastError) {
// //                 console.error(`设置自动改名失败: ${chrome.runtime.lastError.message}`);
// //                 return;
// //             }
// //             console.log(`自动改名功能已${isChecked ? '开启' : '关闭'}`);
// //         });
// //     });
// //
// //     chrome.storage.local.get(['autoRename'], (result) => {
// //         if (chrome.runtime.lastError) {
// //             console.error(`获取自动改名状态失败: ${chrome.runtime.lastError.message}`);
// //             return;
// //         }
// //         if (result.autoRename) {
// //             console.log('自动改名功能已开启');
// //             switchElement.checked = true; // 设置开关状态为开启
// //         } else {
// //             switchElement.checked = false; // 设置开关状态为关闭
// //         }
// //     });
// // }
// const ifAutoRename = document.querySelector('.switch input[data-key="ifAutoRename"]');
// if (ifAutoRename) {
//     buttonSettings(ifAutoRename,'ifAutoRename');
// }
// const ifIntelligentSummary = document.querySelector('.switch input[data-key="ifIntelligentSummary"]');
// if (ifIntelligentSummary) {
//     buttonSettings(ifIntelligentSummary,'ifIntelligentSummary');
// }

/**
 * 初始化并管理开关设置
 * @param {HTMLElement} switchElement - 开关元素
 * @param {string} key - 存储在chrome.storage中的键名
 */
function initSwitchSetting(switchElement, key) {
    // 1. 从存储加载初始状态
    chrome.storage.local.get([key], (result) => {
        if (chrome.runtime.lastError) {
            console.error(`获取 ${key} 状态失败: ${chrome.runtime.lastError.message}`);
            return;
        }

        // 设置初始状态（如果存储中没有值，默认为false）
        const initialState = result[key] || false;
        switchElement.checked = initialState;
        console.log(`${key} 初始状态: ${initialState ? '开启' : '关闭'}`);
    });

    // 2. 添加变更事件监听器
    switchElement.addEventListener('change', (event) => {
        const isChecked = event.target.checked;

        // 保存新状态到存储
        chrome.storage.local.set({[key]: isChecked}, () => {
            if (chrome.runtime.lastError) {
                console.error(`设置 ${key} 失败: ${chrome.runtime.lastError.message}`);
                // 恢复之前的状态（可选）
                event.target.checked = !isChecked;
                return;
            }
            console.log(`${key} 功能已${isChecked ? '开启' : '关闭'}`);
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
    // ifAutoRename();
    const autoRenameSwitch = document.querySelector('.switch input[data-key="ifAutoRename"]');
    if (autoRenameSwitch) {
        initSwitchSetting(autoRenameSwitch, 'ifAutoRename');
    }

    // 初始化智能摘要开关
    const intelligentSummarySwitch = document.querySelector('.switch input[data-key="ifIntelligentSummary"]');
    if (intelligentSummarySwitch) {
        initSwitchSetting(intelligentSummarySwitch, 'ifIntelligentSummary');
    }
    document.getElementById('sendBtn').addEventListener('click', () => {
        const inputText = document.getElementById('inputText').value; // 获取输入框的值
        handleNameChange(null, inputText); // 修改标签页名称
    });
});