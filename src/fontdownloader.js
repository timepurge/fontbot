const fs = require('fs')
const https = require("https");
const http = require("http");
const utils = require('./utils');

function download(url,callback) {
    const fontobj = utils.getLocalFontObj(url);
    const extenstion = fontobj.extenstion;
    const filepath = fontobj.localpath;
    if (fs.existsSync(filepath)) {
        callback(fontobj);
    }else{
        if(extenstion in utils.FONT_EXTENTIONS){
            console.log("downloading...", url)

            var tempFile = fs.createWriteStream(filepath);
            let prot = http;
            if(url.indexOf("https") === 0) {
                prot = https;
            }
            tempFile.on('open', function(fd) {
                prot.get(url, function(res) {
                    res.on('data', function(chunk) {
                        tempFile.write(chunk);
                    }).on('end', function() {
                        tempFile.end();
                        //fs.renameSync(tempFile.path, filepath);
                        return callback(fontobj);
                    });
                });
            });
        }else{
            callback()
        }
    }
}

const downloadFont = (fontlist, downloadIndex, resolve, fontsList) => {
    const url = fontlist[downloadIndex];
    download(url, (fobj)=> {
        const newIndex = downloadIndex+1;
        if(fobj){
            fontsList.push(fobj)
        }
        
        if(newIndex<fontlist.length){
            downloadFont(fontlist, newIndex, resolve, fontsList)
        }else{
            resolve(fontsList);
        }
    })
}

const fontdownloader = (fontlist) => {
    var fontsList = [];
    return new Promise( (resolve, reject) => {
        downloadFont(fontlist, 0, resolve, fontsList)
    } )
}

module.exports = fontdownloader;