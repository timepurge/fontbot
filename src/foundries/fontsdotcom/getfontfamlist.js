const utils = require('./utils');

const fontFamResultPageEval = () => {
    const targetFontEntry =  document.querySelector(".typeface-item")
    const resultlist = targetFontEntry.querySelector(".name-section h2 a");
    const costEl = targetFontEntry.querySelector(".money")
    const fontFrom = document.querySelector(".columns.large-4 p")
    let link = resultlist.getAttribute("href");
    const linkObl = {
        url: "https://www.fonts.com"+link,
        name: resultlist? resultlist.innerText: "unknown",
        cost: costEl? "$"+costEl.innerText:"unknown",
        ownedby: fontFrom? fontFrom.innerText : "unknown"
    }
    return linkObl
}

const getFontPage = (fontobjlist, currIndex, resolve, fontList) => {
    const fontobj = fontobjlist[currIndex];
    utils.evaluateInPuppeteer(fontobj.url, fontFamResultPageEval, 2000).then( (fontobj) =>{
        fontList.push(fontobj);
        currIndex= currIndex+1;
        if(currIndex<fontobjlist.length){
            getFontPage(fontobjlist,currIndex, resolve, fontList)
        }else{
            resolve(fontList)
        }
    } )
}

exports.GetFontFamList = (fontobjlist) => {
    var fontList = [];
    
    return new Promise( (resolve, reject) => {
        if(fontobjlist && (fontobjlist.length>0)){
            getFontPage(fontobjlist,0, resolve, fontList)
        }else{
            resolve([])
        }
        
    } )
    
}
