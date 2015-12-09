var request = require('request');
//---------------------------------------------------

function log(info) {
  console.log('-------------------------')
  var len = arguments.length;
  for(var i =0; i < len; i++) {
    console.log(arguments[i]);
  }
}


var RegistrationFeedback = function(options) {
  this.options = options;
}


exports.RegistrationFeedback = RegistrationFeedback;


//---------------------------------------------------

RegistrationFeedback.prototype.getRegistrationStatus = function(keywords, callback) {
  if(typeof keywords === 'string') {
    var self = this;
    var options = self.options; // we do not provide default options

    var formData = {
      'p': '',
      'appTotalSearchCondition.acceptOrgan': '',
      'appTotalSearchCondition.etpsName': keywords,
      'appTotalSearchCondition.startDate': '',
      'appTotalSearchCondition.endDate': ''
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

