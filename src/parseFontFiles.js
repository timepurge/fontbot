const utils = require("./utils");

const parseFontFileObj = (fontslist, currIndex, resolve) => {
    const fontObj = fontslist[currIndex];
    if(fontObj.extenstion in utils.FONT_EXTENTIONS){
        utils.FONT_EXTENTIONS[fontObj.extenstion].parser(fontObj.localpath, (metaObj)=>{
            if(metaObj.name && (metaObj.name!=='') ){
                fontObj.metaName= metaObj.name;
            }
            if(metaObj.metalicenseURL && (metaObj.metalicenseURL!=='') ){
                fontObj.metaLicenseURL= metaObj.metalicenseURL;
            }
            const nextIndex = currIndex+1;
            if(nextIndex < fontslist.length){
                parseFontFileObj(fontslist,nextIndex, resolve)
            }else{
                resolve(fontslist)
            }
        })
    }
}

module.exports = {
    parseFontFiles: (fonts) => {
        return new Promise( (resolve) => {
            parseFontFileObj(fonts, 0, resolve)
        } )
        
    }
}