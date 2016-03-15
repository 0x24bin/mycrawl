var request = require('request');

//---------------------------------------------------

function log(info) {
  console.log('-------------------------')
  var len = arguments.length;
  for(var i =0; i < len; i++) {
    console.log(arguments[i]);
  }
}


var CompanyName = function(options) {
  this.options = options;
}


exports.CompanyName = CompanyName;


//---------------------------------------------------

CompanyName.prototype.getCompanyNameStatus = function(keywords, callback) {
  if(typeof keywords === 'string') {
    var self = this;
    var options = self.options; // we do not provide default options

    var formData = {
      'p': "",
      "nameSearchCondition.acceptOrgan": "",
      "nameSearchCondition.checkName": keywords,
      "nameSearchCondition.startDate": "",
      "nameSearchCondition.endDate": ""
    }

    var companyNameRequestOptions = {
      url: options.targetUrl,
      formData: formData
    }

    request.post(companyNameRequestOptions, function optionalCallback(err, httpReponse, body) {
      if(err) {
        log('Get company name [' + keywords + '] error' );
        callback(err, null);
      } else {
        callback(null, body);
      }
    });
  } else {
    var err = 'Error: keywords must be a string type';
    log(err);
    callback(err, null);
  }
}

//---------------------------------------------------

