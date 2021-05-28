module.exports = () => {
    this.fontDatatset = {};
    this.fontListWithMetaData = [];
    return {
        addFontFiletoPage: (site, page, fonturl) => {
            if(!(site in this.fontDatatset)){
                this.fontDatatset[site] = {};
            }
            if(!(page in this.fontDatatset[site])){
                this.fontDatatset[site][page] = []
            }
            this.fontDatatset[site][page].push(fonturl);
            //console.log(this.fontDatatset)
        },
        getFontDataSet: () =>{
            return this.fontDatatset;
        },
        getFlatFontDataSet: ()=> {
            var flatlist = [];
            for(var siteroot in this.fontDatatset){
                const targetsite = this.fontDatatset[siteroot];
                for(var sitepageurl in targetsite) {
                    const fontList = targetsite[sitepageurl]
                    flatlist = flatlist.concat(fontList)
                }
            }
            return flatlist;
        },
        setFontListWithMetaData : (newobj) => {
            this.fontListWithMetaData = newobj
        },
        getFontListWithMetaData : () => {
            return this.fontListWithMetaData;
        },
        applyFontsDotComLicenseDataToFontListWithMetaData: (fdata) => {
            //inputname
            const ObjWithNameKey = {};
            fdata.forEach( (fitem) => {
                if("url" in fitem){
                    ObjWithNameKey[fitem.inputname] = fitem;
                }
            } )

            this.fontListWithMetaData.forEach( (fontobj) => {
                if(fontobj.metaName && (fontobj.metaName in ObjWithNameKey)){
                    fontobj.fontsDotComLicenseObj = ObjWithNameKey[fontobj.metaName]
                }
            } )
        },
        applyGoogleLicenseDataToFontListWithMetaData: (elegibleFontDict,licensedetails) => {
            licensedetails.forEach( (fontlicenseObj) => {
                //fontlicenseObj: url, name, license, inputname
                const trgtFontObjs =  elegibleFontDict[fontlicenseObj.inputname];
                trgtFontObjs.forEach( (trgtobj) => {
                    if(!("fontsDotComLicenseObj" in trgtobj)){
                        if((!("metaName" in trgtobj)) &&  ("name" in fontlicenseObj) ){
                            trgtobj.metaName =fontlicenseObj.name
                        }
                        trgtobj.fontsDotComLicenseObj = JSON.parse(JSON.stringify(fontlicenseObj))
                    }
                } )
                
            } )
        },
        getFontObjArrAsObj: (refkey) => {
            const newObj = {};
            this.fontListWithMetaData.forEach( (listitem) => {
                if(refkey in listitem) {
                    newObj[listitem[refkey]] = listitem
                }
            } )
            return newObj;
        }
    }
}