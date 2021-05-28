const XLSX = require("xlsx");
    
function addSheet(XLSX, wb, sheetname, header, data){
    const excelContent = [header].concat(data);
    var ws = XLSX.utils.aoa_to_sheet(excelContent);
    XLSX.utils.book_append_sheet(wb, ws, sheetname);
}

const GenerateExcel = (writedataarr, keyarr) => {
    var filename = "font_report.xlsx";
    var wb = XLSX.utils.book_new();
    addSheet(XLSX, wb, "summary" , keyarr, writedataarr )
    XLSX.writeFile(wb, filename);
    console.log("Report generated: ", filename)
}

const convertObjToStr = (obj) => {
    var str = "";
    for(var key in obj) {
        if(obj.hasOwnProperty(key)){
            str = str+key+": "+obj[key]+" \n"
        }
    }
    return str;
}

const PrepFlatArrayOfObject = (model) => {
    const masterArr = [];
    const fontUrlDict = model.getFontObjArrAsObj("fonturl")
    const pageWiseFontPaths = model.getFontDataSet()
    for (var siteRoot in pageWiseFontPaths){ //siteRoot
        const pageAndFonts = pageWiseFontPaths[siteRoot];
        for( var sitePage in pageAndFonts ){ //sitePage
            const fontlist = pageAndFonts[sitePage]
            fontlist.forEach( (fonturl) => {
                if(fonturl in fontUrlDict){
                    const detailsObj =fontUrlDict[fonturl]
                    let probableLicenseDetails = ""
                    if("fontsDotComLicenseObj" in detailsObj) {
                        probableLicenseDetails = convertObjToStr(detailsObj.fontsDotComLicenseObj)
                    }
                    masterArr.push([
                        siteRoot,
                        sitePage,
                        fonturl,
                        detailsObj.metaName ? detailsObj.metaName : "",
                        detailsObj.metaLicenseURL? convertObjToStr(detailsObj.metaLicenseURL) : "",
                        probableLicenseDetails
                    ])
                }
            } )
        }
    }
    // ["domain", "page", "name", "fontpath", "licenseURL", "probableLicenseDetails" ]
    //fontsDotComLicenseObj:
    GenerateExcel(masterArr, ["domain", "page", "fontpath", "name", "licenseURL", "probableLicenseDetails" ])
}

module.exports = {
    init: (model) => {
        PrepFlatArrayOfObject(model)
    }
}