//利用爬虫获取json数据
async function crawler(url) {
    const response = await fetch(url,{credentials: 'include'});
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    //返回DOM对象
    const parser = new DOMParser();
    const doc = parser.parseFromString(await response.text(), 'text/html');
    //参数解释：
    //doc: 要解析的HTML文档。
    //'text/html': 表示要解析的文档类型，这里是HTML。
    //返回值：
    //一个Document对象，包含了解析后的HTML文档的结构和内容。
    return doc;
}
const domData = crawler("https://www.tongyi.com/")

function outPut(domData) {
    return markdownText = domData.querySelector(".tongyi_markdown");     
}

function main(domData) {
    outPut(domData)
}