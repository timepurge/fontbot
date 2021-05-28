const FontsDotComAdaptor = require('./foundries/fontsdotcom/adaptor').Adaptor
const GoogleAdaptor = require('./foundries/google/adaptor').Adaptor

exports.adaptors = {
    fontsdotcom: FontsDotComAdaptor,
    google: GoogleAdaptor
}