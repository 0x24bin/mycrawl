var Registration = require('./lib/registration').Registration;

var Util = require('./lib/util').Util;

var util = new Util();
var cheerio = require('cheerio');
var async = require('async');

//---------------------------------------------------

function log(info) {
  console.log('------------------------------------------------------------')
  var len = arguments.length;
  for(var i =0; i < len; i++) {
    console.log(arguments[i]);
  }
}

var Crawler = function() {
  // this.options = options;
}

exports.Crawler = Crawler;

//---------------------------------------------------


// function verifyKeywords(keywords) {
//   log(keywords, typeof keywords)
//   if(typeof keywords === 'string' && keywords.length >= 4) {
//     return true;
//   } else {
//     return false;
//   }
// }

function handleKeywords(keywords, zone) {
  var keywordsLength = keywords.length;

  if(typeof keywords === 'string' && keywordsLength >= 2) {
     zone = zone || '上海'; // we only use this for shanghai province , china

    if(keywords.indexOf(zone) >= 0) {
      if(keywordsLength >= 4) {
        return {flag: true, searchKeywords: keywords};
      } else {
        return {flag: false, searchKeywords: []};
      }
    } else {
      searchKeywords = [zone + keywords, keywords + '（' + zone + '）'];
      return {flag: true, searchKeywords: searchKeywords}
    }
  } else {
    return {flag: false, searchKeywords: []}

  }
}





Crawler.searchCompanyInformation = function(options, keywords, callback) {

  var zone = '上海';

  var keywordsResults = handleKeywords(keywords, zone);
  var flag = keywordsResults.flag;
  var searchKeywords = keywordsResults.searchKeywords;

  if(flag !== false) {

    var self = this;
    var registration = new Registration(options);
    var detailResultsOutput = [];

    async.each(searchKeywords, function(searchKeyword, finish) {
      var keyword = searchKeyword;
      
      registration.getRegistrationLists(keyword, function(err, body) {
        if(err) {
          log('error: ', err);
          callback(err, {numberOfResults: 0, detailResultsOutput: null });
        } else {
          util.handleCompanyLists(body, function(companyResults) {
          
            // registration.getRegistrationDetail 
            var companyLists = companyResults.companyLists;
            var numberOfResults = companyResults.numberOfResults;

            if(companyLists.length !== 0) {
              async.each(companyLists, function(companyList, done) {
                var companyRegistrationId = companyList.companyRegistrationId;

                registration.getRegistrationDetail(companyRegistrationId, function(err, companyDetailHtml) {
                  if(err) {
                    // log('get detail err', err);
                    done(err);
                  } else {
                    util.handleCompanyDetail(companyDetailHtml, function(detailResults) {
                      // log(detailResults)
                      
                      detailResultsOutput.push({company: companyList, detailInformation: detailResults});
                      done();
                    })
                  }
                });   
              }, function(err) {
                if(err) {
                  log('get detail err: ', err);
                  callback(err, {numberOfResults: numberOfResults, detailResultsOutput: null });
                } else {
                  // log('Details: ', detailResultsOutput);
                  callback(null, {numberOfResults: numberOfResults, detailResultsOutput: detailResultsOutput })
                }
              });

            } else {
              callback(null, {numberOfResults: 0, detailResultsOutput: null });
            }
            });
          };
        })
      


    })




  } else {

     var err = '关键词输入不合法';
    callback(err, {numberOfResults: 0, detailResultsOutput: null });   

  }

}










