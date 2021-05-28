
const searchfont = require('./searchfont').SearchFont;
const getfamlist = require('./getfontfamlist').GetFontFamList


const getFontLicense = (font) => {
    return new Promise( (resolve, reject) => {
        searchfont(font).then( (matchFamList) => {
            getfamlist(matchFamList).then( (fontobjlist) => {
                resolve(fontobjlist)
                //resolve(font)
            } )
            //resolve(font)
        } )
    } )
}

const fetchLicenseDetails = (fontlist, currentIndex, finalresolve, licensedetails) => {
    const fontToCheck = fontlist[currentIndex]
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
        currentIndex = currentIndex+1;
        if(currentIndex<fontlist.length){
            fetchLicenseDetails(fontlist,currentIndex, finalresolve, newLicenselist)
        }else{
            finalresolve(newLicenselist)
        }
    } )
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