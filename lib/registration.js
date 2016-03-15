/**
 * get registration information
 * date: 2015-06-10
 * author: zunkun
 */

var request = require('request');
// var config = require('./config');
// var registrationConfig = config.registration;

//---------------------------------------------------

function log(info) {
  console.log('-------------------------')
  var len = arguments.length;
  for(var i =0; i < len; i++) {
    console.log(arguments[i]);
  }
}

//---------------------------------------------------
/**
 * @param {json} options options has 3 properties
 *  homeRefererUrl: home referer
 *  registrationResultsUrl: registration results url
 *  registrationDetailUrl: registration detail url
 */

var Registration = function(options) {
  this.options = options;
}

exports.Registration = Registration;

//---------------------------------------------------
/**
 * get registration information with keywords
 * @param  {array} keywords
 * @param  callback
 */
Registration.prototype.getRegistrationLists = function(keywords, callback) {
  // veriry if keywords is legal
  log(keywords, typeof keywords, keywords.length)
  if(typeof keywords !== 'string' || keywords.length < 4) {
    var err = 'keywords wrong'
    callback(err, null)
  } else {
    var self = this;

    var formData = {
      keyWords: keywords,
      searchType: '1'
    }

    var registrationResultsOption = {
      url: self.options.registrationResultsUrl,
      formData: formData
    }

    request.post(registrationResultsOption,function optionalCallback(err, httpResponse, body) {
      if(err) {
        log('Get registration err.')
        callback(err, null);
      } else {
        callback(null, body)
      }      
    });
  }
}


//---------------------------------------------------

Registration.prototype.getMoreRegistrationsBasedNo = function(allpageNo, pageNo, keywords, callback) {
  log(allpageNo, pageNo, typeof allpageNo, typeof pageNo)
  if(allpageNo>= 0 && pageNo >= 0 && allpageNo >= pageNo) {

    if(typeof keywords !== 'string' || keywords.length < 4) {
      var err = 'keywords wrong'
      callback(err, null)
    } else {
      var self = this;

      var formData = {
        period: keywords,
        keyWords: keywords,
        searchType: '1',
        pageNo: pageNo
      }

      var registrationListsBasedNoOptions = {
        url: self.options.registrationResultsUrl,
        formData: formData
      }

      request.post(registrationListsBasedNoOptions,function optionalCallback(err, httpResponse, body) {
        if(err) {
          log('Get more registration err.')
          callback(err, null);
        } else {
          callback(null, body)
        }      
      });
    }    
  } else {
    var err = 'Page number wrong';
    log(err);
    callback(err, null);
  }
}

//---------------------------------------------------

/**
 * get registration details
 * @param {string} registrationId registration id
 * @param {function} callback callback
 */

Registration.prototype.getRegistrationDetail = function(registrationId, callback) {
  var self = this;
  var registrationDetailOption = {
    url: self.options.registrationDetailUrl,
    headers: {
      Referer: self.options.homeRefererUrl
    },
    formData: {
      etpsId: registrationId
    }
  };


  request.post(registrationDetailOption, function optionalCallback(err, httpResponse, body){
    if(err) {
      log('Get registration detail error', err);
      callback(err, null);
    } else {
      log('Get registration detail succeed');
      callback(null, body);
    }
  });
}

//---------------------------------------------------
