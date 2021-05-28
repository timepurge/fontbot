var fs = require('fs');

const CACHE_DIR = './cache';
const TEMP_DIR = './temp';

if (!fs.existsSync(CACHE_DIR)){
    fs.mkdirSync(CACHE_DIR);
}
if (!fs.existsSync(TEMP_DIR)){
    fs.mkdirSync(TEMP_DIR);
}


const crawler = require("./src/crawler");
const fontfinder = require('./src/fontfinder');
const fontDownloader = require('./src/fontdownloader')
const fontParser = require('./src/parseFontFiles')
const Model = require('./src/model');
const utils = require('./src/utils');
const Adators = require('./src/adaptors').adaptors;
const xlreport = require('./src/excelreport')
const urlcleaner = require('./src/urlcleanser')

var model = Model();

function crawlSites(sitelist,onComplete) {
    crawler.crawlSites(sitelist).then( (sitedata) =>{
        for(var site in sitedata){
            const urls = sitedata[site];
            const pages = [];
            for(var i=0; i< urls.length; i++){
                const trgtUrl = urls[i]
                if(utils.isFont(trgtUrl)){
                    model.addFontFiletoPage(site, site, trgtUrl)
                }else{
                    if(utils.isWebPage(trgtUrl)){
                        pages.push(trgtUrl)
                    }
                    
                }
            }
            sitedata[site] = pages;
        }
        onComplete(sitedata)
    } ).catch((error)=>{
        console.log(error)
    })
}

function crawl (sitesfile) {
    if(sitesfile === undefined){
        sitesfile = './sites.txt';
    }

    try {
        if (fs.existsSync(sitesfile)) {
            utils.readTextLinesAsArray(sitesfile, true).then( (SITES) => {
                crawlSites(SITES, (sitesAndPages)=>{
                    console.log("stage1 complete.")
                    fontfinder(utils.getFlatListFromArrayOfObjects(sitesAndPages)).then( (fontpaths) => {
                        console.log("stage2 complete.")
        
                        utils.updateModelWithFontsPerPage(fontpaths, sitesAndPages, model)
                        const flatFontList = model.getFlatFontDataSet();
                        
                        fontDownloader(flatFontList).then( (fontMetaObj) => {
                            console.log("stage3 complete.")
                            model.setFontListWithMetaData(fontMetaObj); 
                            fontParser.parseFontFiles(model.getFontListWithMetaData()).then( () => {
                                fetchFontLicenseDetailsFromFontsDotCom()
                            } )
                        } )
                    } )
                    
                })
            } )
        }else{
            console.log("Please provide the list of sites in a newline delimited sites.txt")
        }
    } catch(err) {
        console.error(err)
    }

    
}

function fetchFontLicenseDetailsFromFontsDotCom(){
    var fontList = utils.getFontNamesWithNoLicense(model.getFontListWithMetaData())
    Adators.fontsdotcom.init(fontList).then( (licensedetails) => {
        model.applyFontsDotComLicenseDataToFontListWithMetaData(licensedetails);
        fetchFontLicenseDetailsFromGoogle();
    } )
}

function fetchFontLicenseDetailsFromGoogle(){
    var {elegibleFontDict, fontList} = utils.getFontObjsEligibleForGoogleFontSearch(model.getFontListWithMetaData())
    Adators.google.init(fontList).then( (licensedetails) => {
        model.applyGoogleLicenseDataToFontListWithMetaData(elegibleFontDict,licensedetails)
        xlreport.init(model)
    } )
}

module.exports =  {
    init:crawl
};