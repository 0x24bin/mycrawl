var Registration = require('./lib/registration').Registration;
var CompanyName = require('./lib/companyname').CompanyName;
var RegistrationFeedback = require('./lib/registrationFeedback').RegistrationFeedback;
var Credit = require('./lib/credit').Credit;

var Util = require('./lib/util').Util;
var util = new Util();


var cheerio = require('cheerio');
var async = require('async');

//---------------------------------------------------

function log(info) {
  console.log('------------------------------------------------------------')
  var len = arguments.length;
  for (var i = 0; i < len; i++) {
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

  if (typeof keywords === 'string' && keywordsLength >= 2) {
    zone = zone || '上海'; // we only use this for shanghai province , china

    if (keywords.indexOf(zone) >= 0) {
      if (keywordsLength >= 4) {
        return {
          flag: true,
          searchKeywords: [keywords]
        };
      } else {
        return {
          flag: false,
          searchKeywords: []
        };
      }
    } else {
      searchKeywords = [zone + keywords, keywords + '（' + zone + '）'];
      return {
        flag: true,
        searchKeywords: searchKeywords
      }
    }
  } else {
    return {
      flag: false,
      searchKeywords: []
    }

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

  if (flag) {
    // var self = this;
    var registration = new Registration(options);
    var detailResultsOutputs = [];
    var companyListsOutputs = [];
    var number = 0;
    var allpageNo = 0;
    async.each(searchKeywords, function(searchKeyword, done) {

      registration.getRegistrationLists(searchKeyword, function(err, body) {
        if (err) {
          log('error: ', err);
          done(err);
        } else {
          util.handleCompanyLists(body, function(companyResults) {
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
      if (err) {
        log(err);
        callback(err, {
          allpageNo: 0,
          numberOfResults: 0,
          detailResultsOutputs: null
        });
      } else {

        log('succeed get companyLists', number, companyListsOutputs);
        var companyLists = companyListsOutputs;
        async.each(companyLists, function(companyList, done) {
          var companyQueryId = companyList.companyQueryId;
          registration.getRegistrationDetail(companyQueryId, function(err, companyDetailHtml) {
            if (err) {
              done(err);
            } else {
              util.handleCompanyDetail(companyDetailHtml, function(detailResults) {
                var basicDetail = detailResults.basicDetail;
                var length = basicDetail.length;
                var companyId = "";
                for (var i = 0; i < length; i++) {
                  var detail = basicDetail[i];
                  var key = detail.key;
                  var value = detail.value;
                  var searchREG = /注册号|字号/;
                  var index = key.search(searchREG);
                  if (index > -1) {
                    companyId = value;
                    break;
                  } else {
                    companyId = "";
                  }
                };
                companyList.companyId = companyId;
                
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
          if (err) {
            log(err);
            callback(err, {
              allpageNo: 0,
              numberOfResults: 0,
              detailResultsOutputs: null
            });
          } else {
            callback(null, {
              allpageNo: allpageNo,
              numberOfResults: number,
              detailResultsOutputs: detailResultsOutputs
            })

          }
        })
      }

    })

  } else {

    var err = '关键词输入不合法';
    callback(err, {
      allpageNo: 0,
      numberOfResults: 0,
      detailResultsOutputs: null
    });
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

  if (flag) {
    // var self = this;
    var registration = new Registration(options);
    var detailResultsOutputs = [];
    var companyListsOutputs = [];
    var number = 0;
    async.each(searchKeywords, function(searchKeyword, done) {

      registration.getMoreRegistrationsBasedNo(allpageNo, pageNo, searchKeyword, function(err, body) {
        if (err) {
          log('error: ', err);
          done(err);
        } else {
          util.handleCompanyLists(body, function(companyResults) {
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
      if (err) {
        log(err);
        callback(err, {
          numberOfResults: 0,
          detailResultsOutputs: null
        });
      } else {

        log('succeed get companyLists', number, companyListsOutputs);

        var companyLists = companyListsOutputs;
        async.each(companyLists, function(companyList, done) {
          var companyQueryId = companyList.companyQueryId;
          registration.getRegistrationDetail(companyQueryId, function(err, companyDetailHtml) {
            if (err) {
              done(err);
            } else {
              util.handleCompanyDetail(companyDetailHtml, function(detailResults) {
                var basicDetail = detailResults.basicDetail;
                var length = basicDetail.length;
                var companyId = "";
                for (var i = 0; i < length; i++) {
                  var detail = basicDetail[i];
                  var key = detail.key;
                  var value = detail.value;
                  var searchREG = '注册号';
                  var index = key.search(searchREG);
                  if (index > -1) {
                    companyId = value;
                    break;
                  } else {
                    companyId = "";
                  }
                };
                companyList.companyId = companyId;

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
          if (err) {
            log(err);
            callback(err, {
              numberOfResults: 0,
              detailResultsOutputs: null
            });
          } else {
            callback(null, {
              numberOfResults: number,
              detailResultsOutputs: detailResultsOutputs
            })

          }
        })
      }

    })

  } else {

    var err = '关键词输入不合法';
    callback(err, {
      numberOfResults: 0,
      detailResultsOutputs: null
    });
  }
}



//---------------------------------------------------


Crawler.prototype.searchCompanyNameStatus = function(options, keywords, callback) {

  log(options, keywords)
  keywords = keywords || "";
  var companyName = new CompanyName(options);

  companyName.getCompanyNameStatus(keywords, function(err, body) {
    if (err) {
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
    if (err) {
      callback(err, null);
    } else {
      util.handleRegistrationStatusFeedback(body, function(registrationStatusInfo) {
        callback(null, registrationStatusInfo);
      });
    }
  })
}


//---------------------------------------------------

Crawler.prototype.getRegistrationDisclosure = function(options, callback) {
    if (!options || !options.keyword) {
      log("getRegistrationDisclosure failed", options);
      callback(null, null);
    } else {
      var credit = new Credit();

      credit.getPlatformParameter(function(err, obj) {
        obj.keyword = options.keyword;
        var Cookie = obj.Cookie;
        credit.getSingleCreditHTML(obj, function(err, result) {
          console.log(result)
          if (err || !result || !result.hasOwnProperty("uuid")) {
            log("get credit information failed");
            callback(null, null);
          } else {
            var companyBasic = result;
            var options = {
              uuid: result.uuid,
              tab: '01',
              Cookie: Cookie
            }

            credit.getDisclosureHTML(options, function(err, body) {
              util.registrationInfos(body, function(registration) {
                
                if(!registration.hasOwnProperty("investorsTable")) {
                  log("no investorsTable exists");
                  callback(null, {
                    companyBasic: companyBasic,
                    registration: registration
                  });
                } else {
                  var investorsTable = registration.investorsTable;

                  var self = this;
                  var investorsDetailContainer = [];

                  async.each(investorsTable, function(investors, done) {

                    util.handleInvestorDetail(investors, function(investorInfo) {
                      if(investorInfo !== null && investorInfo !== {}) {
                        investorsDetailContainer.push(investorInfo);
                      } 
                      console.log(typeof investorInfo, investorInfo, 5555, investorInfo instanceof Array)
                      done();
                    })
                  }, function(err) {
                    if (err) {
                      log("handle investors detail error", err);
                      callback(null, {
                        companyBasic: companyBasic,
                        registration: registration
                      });
                    } else {
                      log("handle investors detail succeed");
                      callback(null, {
                        companyBasic: companyBasic,
                        registration: registration,
                        investorsDetailContainer: investorsDetailContainer
                      });
                    }
                  })
                  
                }
              })
            })
          }
        })
      })
    }
  }
  //---------------------------------------------------
Crawler.prototype.getCompanyDisclosure = function(options, callback) {
  if (!options || !options.keyword) {
    log("getRegistrationDisclosure failed", options);
    callback(null, null);
  } else {
    var credit = new Credit();
    credit.getPlatformParameter(function(err, obj) {
      obj.keyword = options.keyword;
      var Cookie = obj.Cookie;
      credit.getSingleCreditHTML(obj, function(err, result) {
        var companyBasic = result;
        var options = {
          uuid: result.uuid,
          tab: '02',
          Cookie: Cookie
        }
        credit.getDisclosureHTML(options, function(err, body) {
          if (err) {
            log("get company disclosure error");
            callback(err, {
              companyBasic: companyBasic
            });
          } else {
            util.handleCompanyDisclosure(body, function(companyDisclosure) {
              callback(null, {
                companyBasic: companyBasic,
                companyDisclosure: companyDisclosure
              });
              var annualReportDetails = [];
              var annualReport = companyDisclosure.annualReport;

              async.each(annualReport, function(reports, done) {
                reports.forEach(function(report) {
                  if (report.hasOwnProperty('type') && report.type === 'url') {
                    util.handleReportDetail(report, function(err, annualReportDetail) {
                      if (err) {
                        log("get annualReport detail error");
                        done(err);
                      } else {
                        log("get annualReport detail succeed");
                        annualReportDetails.push(annualReportDetail);
                        done();
                      }
                    })
                  }
                })
              }, function(err) {
                if (err) {
                  log("get annualReport detail error");
                  callback(err, {
                    companyBasic: companyBasic,
                    companyDisclosure: companyDisclosure
                  });
                } else {
                  callback(null, {
                    companyBasic: companyBasic,
                    companyDisclosure: companyDisclosure,
                    annualReportDetails: annualReportDetails
                  });
                }
              })
            })
          }
        });
      });
    });
  }
}


//---------------------------------------------------