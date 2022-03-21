var crypto = require('crypto');
const fs = require('fs')
const opentype = require('opentype.js');
var eotparser = require('eot-parser');

const CONST = {
    UNKNOWN_FONTNAME: "",
    EXCLUDE_EXTENTIONS: [
        'gif',
        'jpg',
        'jpeg',
        'png',
        'ico',
        'bmp',
        'ogg',
        'webp',
        'mp4',
        'webm',
        'mp3',
        'json',
        'rss',
        'atom',
        'gz',
        'zip',
        'rar',
        '7z',
        'css',
        'js',
        'gzip',
        'exe',
        'svg',
        'pdf'
      ]
}

const TFFParser = (filepath, onComplete) => {
    opentype.load(filepath, function (err, font) {
        if (err) {
            onComplete({
                name: CONST.UNKNOWN_FONTNAME,
                filepath
            })
        }
        let fontName  = "";
        let metalicenseURL = ""
        if(font && font.names && font.names.fontFamily && font.names.fontFamily.en){
            fontName= font.names.fontFamily.en
            if(font.names.licenseURL){
                metalicenseURL = font.names.licenseURL
            }
        }
        onComplete({
            name: fontName,
            filepath,
            metalicenseURL
        })
    })
}

const EOTParser = (filepath, onComplete) => {
    fs.readFile(filepath, function (err, contents) {
        
        eotparser(contents).then(function (result) {
            if(result && (result.familyName || result.fullName )){
                onComplete({
                    name: result.familyName?result.familyName:result.fullName,
                    filepath
                })
            }else{
                onComplete({
                    name: CONST.UNKNOWN_FONTNAME,
                    filepath
                })
            }
        }).catch( () => {
            onComplete({
                name: CONST.UNKNOWN_FONTNAME,
                filepath
            })
        } );
    });
}

const NoParser = (filepath, onComplete) => {
    onComplete({
        name: CONST.UNKNOWN_FONTNAME,
        filepath
    })
}

const WOFF2Parser = (filepath, onComplete) => {
    onComplete();
}

const FONT_EXTENTIONS = {
    "woff2":{
        parser: NoParser
    },
    "ttf":{
        parser:TFFParser
    },
    "woff": {
        parser: TFFParser
    },
    "eot" : {
        parser: EOTParser
    }
}

const get_url_extension = ( url ) => {
    return url.split(/[#?]/)[0].split('.').pop().trim();
}

const getFontNamesWithNoLicense = (fontlistwithMeta) => {
    var fontList =[];
    fontlistwithMeta.forEach( (val, indx) => {
        if("metaName" in val){
            if((val.metaName !== "") || (val.metaName !== utils.CONST.UNKNOWN_FONTNAME) ) {
                if( (!("metaLicenseURL" in val)) ||  ( ("metaLicenseURL" in val) && (val.metaLicenseURL==='') )   ){
                    if(!fontList.includes(val.metaName)){
                        fontList.push(val.metaName)
                    }
                    
                }
            }
        }
    } )
    return fontList;
}

const getFontObjsEligibleForGoogleFontSearch = (fontlistwithMeta) => {
    var fontList =[];
    var elegibleFontDict = {};
    const gurl="https://fonts.gstatic.com/s/";
    fontlistwithMeta.forEach( (val, indx) => {
        if((!("metaName" in val)) && ("fonturl" in val) ){
            if( val.fonturl.indexOf(gurl) === 0 ){
                const fontname = val.fonturl.split(gurl)[1].split("/")[0]
                if(!(fontname in elegibleFontDict)){
                    elegibleFontDict[fontname] = [val]
                }else{
                    elegibleFontDict[fontname].push(val)
                }
            }
        }
    } )

    for(var fontname in elegibleFontDict){
        if(elegibleFontDict.hasOwnProperty(fontname)){
            fontList.push(fontname)
        }
    }
    return {
        elegibleFontDict,
        fontList
    };
}

const readTextLinesAsArray = (filename, makeUrl) => {
    return new Promise( (resolve,reject)=>{
        fs.readFile(filename, 'utf8', function (err,data) {
            if (err) {
                reject(err);
            }
            let lines = data.split("\n").filter( line => line.length>0 );
            if(makeUrl){
                lines = lines.map( (lineitem) => {
                    if(lineitem.indexOf("http") !==0 ){
                        lineitem="http://"+lineitem
                    }
                    return lineitem
                } )
            }
            resolve(lines);
        });
    })
}

const isWebPage = (url) => {
    if( CONST.EXCLUDE_EXTENTIONS.includes(get_url_extension(url))){
        return false;
    }
    return true;
}

module.exports = {
    readTextLinesAsArray,
    CONST,
    isWebPage,
    get_url_extension: get_url_extension,
    FONT_EXTENTIONS,
    isFont: (url) => {
        const ext =  get_url_extension(url);
        if(ext in FONT_EXTENTIONS){
            return true;
        }
        return false;
    },
    getFlatListFromArrayOfObjects : (jsobj) => {
        var arr = [];
        for(var jskey in jsobj) {
            arr=jsobj[jskey].concat(arr)
        }
        return arr;
    },
    getLocalFontObj: (fonturl) => {
        var hash = crypto.createHash('md5').update(fonturl).digest('hex');
        const urlparts = fonturl.split(".");
        let extenstion = urlparts[urlparts.length-1];
        if(extenstion.indexOf("?")!== -1){
            extenstion = extenstion.split("?")[0]
        }
        return {
            localpath: "temp/"+hash+"."+extenstion,
            fonturl,
            extenstion,
            hash
        }
    },
    updateModelWithFontsPerPage: (fontpaths, sitesAndPages, model) => {
        for(var siteroot in sitesAndPages){
            const sitepages = sitesAndPages[siteroot];
            for(var i=0; i<sitepages.length; i++){
                const sitepage = sitepages[i];
                if(sitepage in fontpaths){
                    const fontArray = fontpaths[sitepage];
                    for(var j=0; j< fontArray.length; j++){
                        model.addFontFiletoPage(siteroot, sitepage, fontArray[j])
                    }
                }
            }
        }
    },
    getFontNamesWithNoLicense,
    getFontObjsEligibleForGoogleFontSearch
}