const utils = require('./utils');

const searchResultPageEval = () => {
    const resultlist = document.querySelectorAll(".name-section h2 a");
    const links = [];
    Array.from(resultlist).forEach( (el) => {
        let link = el.getAttribute("href");
        links.push({
        url: "https://www.fonts.com"+link,
        name: el.innerText
        })
    } )

    return links
}

const findValidFonts = (fonts, font) => {
    const validFonts = [];
    fonts.forEach( (fontobj, i) => {
        if(validFonts.length<1){ //MAX 3 PER MATCH. 
            if(fontobj.name.toLowerCase().replace(/\W/g, '').indexOf(font.toLowerCase().replace(/\W/g, ''))!==-1){
                validFonts.push(fontobj)
            }
        }
        
    } )
    return validFonts;
}

exports.SearchFont = (font) => {
    return new Promise( (resolve, reject) => {
        utils.evaluateInPuppeteer("https://www.fonts.com/search/all-fonts?ShowAllFonts=All&searchtext="+font, searchResultPageEval, 2000).then( (fontlist) =>{
            resolve(findValidFonts(fontlist,font))
        } )
    } )
}