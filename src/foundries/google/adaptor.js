const puppeteer = require('puppeteer');
const low = require('lowdb')
var crypto = require('crypto');
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('./cache/googleresp.json')
const db = low(adapter)
db.defaults({ respEval: {} }).write()

function delay(time) {
  return new Promise(function(resolve) { 
      setTimeout(resolve, time)
  });
}

const evaluateInPuppeteer = (pageurl, evalFn, delayTime) => {
  var hash = crypto.createHash('md5').update(pageurl).digest('hex');
  const cachedValue = db.get("respEval."+hash).value();

  return new Promise( async(resolve, reject) => {

    if(cachedValue){
      resolve(cachedValue)
    }else{
      console.log('crawling...', pageurl)
      const browser = await puppeteer.launch({headless:true});
      const page = await browser.newPage();
      await page.goto(pageurl);
      await delay(delayTime)
      const evalResponse = await page.evaluate(evalFn);
      await browser.close();
      db.set("respEval."+hash, evalResponse ).write();
      resolve(evalResponse);
    }
    
  });
}

const getFontUrls =   (pageurl) => {
  const LinkEval = () => {
    const elements = document.querySelectorAll(".grid-list-tile a");
    const links = [];
    Array.from(elements).forEach( (el, ii) => {
      if(ii===0){ // LIMIT TO JUST ONE RESULT
        let link = el.getAttribute("href");
        links.push({
          url: link
        })
      }
      
    } )

    return {
      links
    }
    
  }
  return evaluateInPuppeteer( pageurl, LinkEval, 500 )
}

const getPageLicenseDetails = (pageurl) => {
  const fontEval = () => {
    const licenceTextEl = document.getElementById("license");
    const licenceText = licenceTextEl.innerText;
    return {
      licenceText
    }
  }
  return evaluateInPuppeteer( pageurl+"#license", fontEval, 5000 )
}

const Helpers = {
  getFontFromGoogleUrl: (url) => {
    const urlparts = url.split("specimen/");
    if(urlparts.length>=2){
      let fontName = urlparts[1];
      fontName = fontName.split("?")[0];
      return fontName;
    }
    return undefined;
  },
  getProbableFontPages: (url) => {
      return new Promise( (resolve, reject) => {
        
        getFontUrls(url).then( (data) => {
          const links = data.links;
          const promises = [];
          links.forEach( (link) => {
            link.name=Helpers.getFontFromGoogleUrl(link.url).split("+").join(" ")
            promises.push(getPageLicenseDetails(link.url))
          } )

          Promise.all(promises).then((values) => {
            if(values.length === links.length){
              values.forEach( (licenseobj, i) => {
                links[i].license = licenseobj.licenceText;
              } )
            }
            resolve(links)
          });
          

        } )
      })
      
  }
}


const fetchLicenseDetails = (fontlist, currentIndex, finalresolve, licensedetails) => {
    const fontToCheck = fontlist[currentIndex]
    Helpers.getProbableFontPages(`https://fonts.google.com/?query=${fontToCheck}`).then( (fontlicense) => {
        fontlicense.forEach( (fontobj) => {
          fontobj.inputname = fontToCheck
        })
        const newLicenselist = licensedetails.concat(fontlicense)
        currentIndex = currentIndex+1;
        if(currentIndex<fontlist.length){
            fetchLicenseDetails(fontlist,currentIndex, finalresolve, newLicenselist)
        }else{
            finalresolve(newLicenselist)
        }
    })
/*
    getFontLicense(fontToCheck).then( (fontlicense) => {
        if(fontlicense.length === 0 ){
            fontlicense = {
                inputname: fontToCheck
            }
        }else{
            fontlicense.forEach( (fontobj) => {
                fontobj.inputname = fontToCheck
            } )
        }
        const newLicenselist = licensedetails.concat(fontlicense)
        console.log(fontlicense);
        currentIndex = currentIndex+1;
        if(currentIndex<fontlist.length){
            fetchLicenseDetails(fontlist,currentIndex, finalresolve, newLicenselist)
        }else{
            finalresolve(newLicenselist)
        }
    } )*/
}

exports.Adaptor = {
    init:function(fontlist){
        return new Promise( (finalresolve, reject) => {
            if(fontlist.length>0){
                const licensedetails = [];
                fetchLicenseDetails(fontlist,0, finalresolve, licensedetails)
            }else{
                finalresolve([])
            }
        } )
        
        
    }
}