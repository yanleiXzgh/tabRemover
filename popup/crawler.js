const url = document.getElementById('url').value;

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

function aiPush() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        document.querySelector('textarea').value = inputValueForAI
    });
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("aiBtn").addEventListener("click", () => {
        aiPush();
        crawler(url)
    })
});
