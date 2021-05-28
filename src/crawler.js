var Crawler = require("simplecrawler");
const low = require('lowdb')
var crypto = require('crypto');
const utils = require('./utils')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('./cache/crawler.json')
const db = low(adapter)
db.defaults({ siteData: {} }).write()

const exclude = utils.CONST.EXCLUDE_EXTENTIONS.join('|');

const extRegex = new RegExp(`\\.(${exclude})$`, 'i');

const crawlAPage = (url) => {
    var hash = crypto.createHash('md5').update(url).digest('hex');

    return new Promise( (resolve, reject) => {
        const cachedValue = db.get("siteData."+hash).value();
        if(cachedValue === undefined){
            var crawler = new Crawler(url);
            const allPages = [];
            crawler.addFetchCondition(parsedUrl => !parsedUrl.path.match(extRegex));
            crawler.on('fetchcomplete', (queueItem, page) => {
                console.log(queueItem.url)
                allPages.push(queueItem.url)
            })
            crawler.on('complete', () => {
                db.set("siteData."+hash, allPages ).write();
                resolve(allPages)
            })
            crawler.start();
        }else{
            resolve(cachedValue)
        }
    })
}

const loopAndCrawl = (currentIndex, sites, crawlData, resolve) => {
    crawlAPage(sites[currentIndex]).then( (pages) => {
        crawlData[sites[currentIndex]] = pages;
        if((currentIndex+1) < sites.length) {
            loopAndCrawl((currentIndex+1), sites, crawlData, resolve)
        }else{
            resolve(crawlData)
        }
    } )
}

module.exports = {
    crawlSites: (sites) => {
        return new Promise( (resolve, reject) => {
            if(sites.length===0){
                reject("No sites specified")
            }else{
                const crawlData = {};
                loopAndCrawl(0, sites, crawlData, resolve)
            }
            
        } )
    }
}