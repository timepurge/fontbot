const puppeteer = require('puppeteer');
const low = require('lowdb')
var crypto = require('crypto');
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('./cache/puppetterevalresp.json')
const db = low(adapter)
db.defaults({ respEval: {} }).write()

function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
  }
exports.evaluateInPuppeteer = (pageurl, evalFn, delayTime) => {
    var hash = crypto.createHash('md5').update(pageurl).digest('hex');
    const cachedValue = db.get("respEval."+hash).value();

    
    return new Promise( async(resolve, reject) => {
      if(cachedValue){
        resolve(cachedValue)
      }else{
        console.log('crawling...', pageurl)
        const browser = await puppeteer.launch({headless:true});
        const page = await browser.newPage();
        await page.goto(pageurl, {waitUntil: 'domcontentloaded', timeout: 0});
        await delay(delayTime)
        const evalResponse = await page.evaluate(evalFn);
        await browser.close();
        db.set("respEval."+hash, evalResponse ).write();
        resolve(evalResponse);
      }
      
    });
  }