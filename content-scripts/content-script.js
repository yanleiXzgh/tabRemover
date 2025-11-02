console.log('content-script loaded')

/**
 * 监听来自popup的消息改名
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'handleNameChange') {
        console.log(`已将标签页名改为：${request.message}`);
        // 保存原始标题以便后续处理
        const originalTitle = document.title;
        document.title = request.message;
        
        // 检查是否需要添加关键词
        chrome.storage.local.get(['ifAddKeyWords'], (result) => {
            if (result.ifAddKeyWords) {
                // 获取keywords meta标签
                const keyWordsMeta = document.head.querySelector('meta[name="keywords"]');
                const keyWordsContent = keyWordsMeta ? keyWordsMeta.getAttribute('content') : "无关键词";
                
                // 获取description meta标签
                const descriptionMeta = document.head.querySelector('meta[name="description"]');
                const descriptionContent = descriptionMeta ? descriptionMeta.getAttribute('content') : "无介绍";
                
                // 组合标题：新标题 + 关键词描述
                const newTitle = request.message + ' - ' + keyWordsContent + ' - ' + descriptionContent;
                document.title = newTitle;
                
                console.log('autoRename后添加关键词:', keyWordsContent);
                console.log('最终标题:', newTitle);
            }
        });
        
        sendResponse({status: 'accepted'});
        return true;
    }
});
/**
 * AI爬虫
*/
//TODO:AI爬虫

/**
 * 自动添加keyword
 * @description 根据页面meta标签自动添加关键词到标题
 */
chrome.runtime.onMessage.addListener((request,sender,sendResponse) => {
    if (request.type === 'ifAutoKeyWords') {
        if (request.message) {
            // 获取keywords meta标签
            const keyWordsMeta = document.head.querySelector('meta[name="keywords"]');
            const keyWordsContent = keyWordsMeta ? keyWordsMeta.getAttribute('content') : "无关键词";
            
            // 获取description meta标签
            const descriptionMeta = document.head.querySelector('meta[name="description"]');
            const descriptionContent = descriptionMeta ? descriptionMeta.getAttribute('content') : "无介绍";
            
            // 检查当前标题是否已经被autoRename修改过
            const currentTitle = document.title;
            
            // 如果标题已经包含关键词分隔符，说明可能已经被处理过
            if (currentTitle.includes(' - ')) {
                // 提取原始标题部分（去掉关键词部分）
                const titleParts = currentTitle.split(' - ');
                const baseTitle = titleParts[0]; // 基础标题（可能是autoRename的结果）
                
                // 重新组合标题：基础标题 + 关键词 + 描述
                const newTitle = baseTitle + '\n' + keyWordsContent + '\n' + descriptionContent;
                document.title = newTitle;
            } else {
                // 如果标题没有被处理过，直接添加关键词
                const newTitle = currentTitle + '\n' + keyWordsContent + '\n' + descriptionContent;
                document.title = newTitle;
            }
            
            console.log('addKeyWords已添加关键词:', keyWordsContent);
            console.log('新标题:', document.title);
            sendResponse({status: 'accepted'});
        } else {
            console.log('addKeyWords功能已关闭');
            sendResponse({status: 'ignored'});
        }
        return true;
    }
});
