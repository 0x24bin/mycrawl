var Registration = require('./lib/registration').Registration;
var CompanyName = require('./lib/companyname').CompanyName;
var RegistrationFeedback = require('./lib/registrationFeedback').RegistrationFeedback;

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


function handleKeywords(keywords, zone) {
  var keywordsLength = keywords.length;

  if(typeof keywords === 'string' && keywordsLength >= 2) {
     zone = zone || '上海'; // we only use this for shanghai province , china

    if(keywords.indexOf(zone) >= 0) {
      if(keywordsLength >= 4) {
        return {flag: true, searchKeywords: [keywords]};
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

//---------------------------------------------------


Crawler.prototype.searchCompanyInformation = function(options, keywords, callback) {
  var zone = '上海';
  var keywordsResults = handleKeywords(keywords, zone);
  var flag = keywordsResults.flag;
  var searchKeywords = keywordsResults.searchKeywords;
  
  log(zone, keywords, keywordsResults, searchKeywords)

  // var companyInformation ;

  if(flag) {
    // var self = this;
    var registration = new Registration(options);
    var detailResultsOutputs = []; 
    var companyListsOutputs = [];   
    var number = 0;
    var allpageNo = 0;
    async.each(searchKeywords, function(searchKeyword, done) {

      registration.getRegistrationLists(searchKeyword, function(err, body) {
        if(err) {
          log('error: ', err);
          done(err);
        } else {
          util.handleCompanyLists(body, function(companyResults){
            var companyLists = companyResults.companyLists;
            var numberOfResults = companyResults.numberOfResults;
            
            allpageNo += parseInt(companyResults.allpageNo);            

            number += parseInt(numberOfResults);

            companyLists.forEach(function(companyList) {
              
            companyListsOutputs.push(companyList);
            })
            // log(companyLists)
            done();
          })
        }
      })

    }, function(err) {
        if(err) {
          log(err);
          callback(err, {allpageNo: 0, numberOfResults: 0, detailResultsOutputs: null }); 
        } else {
        
          log('succeed get companyLists', number, companyListsOutputs);
          // callback(null, {numberOfResults: number, companyListsOutputs: companyListsOutputs})
          // var companyLists = com
          var companyLists = companyListsOutputs;
          async.each(companyLists, function(companyList, done) {
            var companyQueryId = companyList.companyQueryId;
            registration.getRegistrationDetail(companyQueryId, function(err, companyDetailHtml) {
              if(err) {
                done(err);
              } else {
                 util.handleCompanyDetail(companyDetailHtml, function(detailResults) {

                  var companyOutput = {
                    company: companyList,
                    basicDetail: detailResults.basicDetail,
                    annualCheckDetail: detailResults.annualCheckDetail
                  }
                  detailResultsOutputs.push(companyOutput);
                  done();
                 });
              }
            })       
          }, function(err) {
            if(err) {
              log(err);
              callback(err, {allpageNo: 0,numberOfResults: 0, detailResultsOutputs: null });                  
            } else {
              callback(null, {allpageNo: allpageNo, numberOfResults: number, detailResultsOutputs: detailResultsOutputs})

            }
          })
        }

      })

  }else {

    var err = '关键词输入不合法';
    callback(err, {allpageNo: 0, numberOfResults: 0, detailResultsOutputs: null });     
  }
}

//---------------------------------------------------
// Get more registrations with pageno

Crawler.prototype.getMoreRegistrations = function(options, keywords, allpageNo, pageNo, callback) {
  var zone = '上海';
  var keywordsResults = handleKeywords(keywords, zone);
  var flag = keywordsResults.flag;
  var searchKeywords = keywordsResults.searchKeywords;
  
  log(zone, keywords, keywordsResults, searchKeywords)

  // var companyInformation ;

  if(flag) {
    // var self = this;
    var registration = new Registration(options);
    var detailResultsOutputs = []; 
    var companyListsOutputs = [];   
    var number = 0;
    async.each(searchKeywords, function(searchKeyword, done) {

      registration.getMoreRegistrationsBasedNo(allpageNo, pageNo, searchKeyword, function(err, body) {
        if(err) {
          log('error: ', err);
          done(err);
        } else {
          util.handleCompanyLists(body, function(companyResults){
            var companyLists = companyResults.companyLists;
            var numberOfResults = companyResults.numberOfResults;            

            number += parseInt(numberOfResults);

            companyLists.forEach(function(companyList) {
              
            companyListsOutputs.push(companyList);
            })
            // log(companyLists)
            done();
          })
        }
      })

    }, function(err) {
        if(err) {
          log(err);
          callback(err, {numberOfResults: 0, detailResultsOutputs: null }); 
        } else {
        
          log('succeed get companyLists', number, companyListsOutputs);

          var companyLists = companyListsOutputs;
          async.each(companyLists, function(companyList, done) {
            var companyQueryId = companyList.companyQueryId;
            registration.getRegistrationDetail(companyQueryId, function(err, companyDetailHtml) {
              if(err) {
                done(err);
              } else {
                 util.handleCompanyDetail(companyDetailHtml, function(detailResults) {

                  var companyOutput = {
                    company: companyList,
                    basicDetail: detailResults.basicDetail,
                    annualCheckDetail: detailResults.annualCheckDetail
                  }
                  detailResultsOutputs.push(companyOutput);
                  done();
                 });
              }
            })       
          }, function(err) {
            if(err) {
              log(err);
              callback(err, {numberOfResults: 0, detailResultsOutputs: null });                  
            } else {
              callback(null, {numberOfResults: number, detailResultsOutputs: detailResultsOutputs})

            }
          })
        }

      })

  }else {

    var err = '关键词输入不合法';
    callback(err, {numberOfResults: 0, detailResultsOutputs: null });     
  }
}





//---------------------------------------------------


Crawler.prototype.searchCompanyNameStatus = function(options, keywords, callback) {

  log(options, keywords)
  keywords = keywords || "";
  var companyName = new CompanyName(options);

  companyName.getCompanyNameStatus(keywords, function(err, body) {
    if(err) {
      callback(err, null);
    } else {
    util.handleCompanyNameStatusPrecisily(body, function(companyNameStatusInfo) {
      callback(null, companyNameStatusInfo);
    });      
    }
  })
}

//---------------------------------------------------

Crawler.prototype.searchRegistrationStatus = function(options, keywords, callback) {

  log(options, keywords)
  var registrationFeedback = new RegistrationFeedback(options);

  registrationFeedback.getRegistrationStatus(keywords, function(err, body) {
    if(err) {
      callback(err, null);
    } else {
    util.handleRegistrationStatusFeedback(body, function(registrationStatusInfo) {
      callback(null, registrationStatusInfo);
    });      
    }
  })
}


//---------------------------------------------------