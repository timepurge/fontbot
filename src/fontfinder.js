const puppeteer = require('puppeteer');
const utils = require('./utils');
const low = require('lowdb')
var crypto = require('crypto');
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('./cache/fontperpage.json')
const db = low(adapter)
db.defaults({ fontData: {} }).write()

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
}

const findFont =  (page_url) => {
    var hash = crypto.createHash('md5').update(page_url).digest('hex');
    const cachedValue = db.get("fontData."+hash).value();

    return new Promise( async(resolve, reject) => {
        if(cachedValue === undefined) {
            const fontUrls = [];
            const browser = await puppeteer.launch({
                headless:true,
                args: [
                    '--disable-web-security',
                    '--disable-features=IsolateOrigins,site-per-process'
                ]
            });
            console.log("analyzing..", page_url)
            const page = await browser.newPage();
            await page.setRequestInterception(true);
            page.on('request', (request) => {
                const url = request.url();
                if(utils.isFont(url)){
                    fontUrls.push(url)
                }
                request.continue();
            });
            await page.goto(page_url, {waitUntil: 'load', timeout: 0});
            await delay(5000)
            await browser.close();
            db.set("fontData."+hash, fontUrls ).write();
            resolve(fontUrls)
        }else{
            resolve(cachedValue)
        }
        
    } )
}


const iterateAndGetFonts = (sites, index, fontListDict, resolve) => {
    findFont(sites[index]).then( (fontlist) => {
        fontListDict[sites[index]] = fontlist;
        const nextIndex = index+1
        if(nextIndex < sites.length){
            iterateAndGetFonts(sites, nextIndex , fontListDict, resolve)
        }else{
            resolve(fontListDict)
        }
    } )
}

const findFontlistBySite = (sites) => {
    return new Promise( (resolve) => {
        const fontListDict = {};
        iterateAndGetFonts(sites,0, fontListDict, resolve)
    } )
    
}

module.exports = findFontlistBySite;