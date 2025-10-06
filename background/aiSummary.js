export async function callZhipuAPI(messages, model = 'glm-4.6') {
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


export async function aiSummary(inputURL) {
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