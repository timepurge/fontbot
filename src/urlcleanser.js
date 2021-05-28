const puppeteer = require('puppeteer');

async function getPageUrl(site_url){
    console.log(site_url);
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(site_url);
    const pageURL = await page.evaluate(() => {
        return {
            url: document.URL,
            content: document.body.innerText
        }
    });
    await browser.close();
    return {
        url: pageURL.url
    }
}

const getActualUrls = (domains) => {
    console.log(getPageUrl(domains[0]))
}

module.exports = {
    getActualUrls
}