console.log('Content script injected');

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.alert(`已将标签页名改为：${request.message}`);
  document.title = request.message;
  sendResponse({status: 'accepted'});
});

/**
 * @description
 * This module is used to send message for the page and use a crawl to extract data from it.
 */

const aiUrl = document.getElementById('url').value;
/**
 * @description
 * This function is used to crawl a website and extract data from it.
 * @param url
 */
function crawler(url) {
  const axios = require('axios');
  const clawerInstance = axios.create({
    baseURL: url,
    timeout: 1000,
    headers: {}
  });
  const cheerio = require('cheerio');
}

/**
 * @description
 * This function is used to send a message to the AI tab.
 */
function aiPush() {

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    window.inputValueForAI = "简化次标签页名称" + document.title;
  });
  //打开ai标签页
  window.open(aiUrl);
  //根据url转到标签页
  chrome.tabs.query({ url: aiUrl }, (tabs) => {
    document.querySelector('textarea').value = inputValueForAI;
    //模拟点击行为
    const event = new Event('input', { bubbles: true });
    document.querySelector('textarea').dispatchEvent(event);
    document.querySelector('button').click();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById("aiBtn").addEventListener("click", () => {
    aiPush();
    crawler(aiUrl)
  })
});