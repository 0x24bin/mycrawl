var cheerio = require('cheerio');

var fs = require('fs');

//---------------------------------------------------

function log(info) {
  console.log('--------------------------------------------------------')
  var len = arguments.length;
  for(var i =0; i < len; i++) {
    console.log(arguments[i]);
  }
}

//---------------------------------------------------

var Util = function() {

}

exports.Util = Util;
//---------------------------------------------------

Util.prototype.handleCompanyLists = function(companyListsHtml, callback) {
  var $ = cheerio.load(companyListsHtml);
  log('handleCompanyLists');
  var resultsNumString = $('th[class="result"]').text();
  var allPageNoString = $('td[class="pageCount"]').text();
  var str1 = '搜索结果';
  var str2 = '查询条件';
  var str3 = '共';
  var str4 = '页';

  var numStartIndex = resultsNumString.indexOf(str1);
  var numEndIndex = resultsNumString.indexOf(str2);
  var numberOfResults = resultsNumString.substring(numStartIndex, numEndIndex).replace(/[^0-9]/ig,"") // number of records that get from web.
  if(numberOfResults === "") {
    numberOfResults = 0;
  }
  // all pageNo handle
  var allpageNo = 0;
  var pageNoStartIndex = allPageNoString.indexOf(str3);
  var pageNoEndIndex = allPageNoString.indexOf(str4);

  if(pageNoStartIndex === -1) {
    allpageNo = 0;
  } else {
    allpageNo =  allPageNoString.substring(pageNoStartIndex + str3.length, pageNoEndIndex).replace(/[^0-9]/ig,"");
  }


  var companyLists = [];
  $('table[class="con"]').each(function(i, e) {
    var info = $(this).text();
    var first = $(this).find('td').first().find('a').attr('onclick')

    var detailTitle = '详细信息';
    var addressTitle = '住所';
    var companyStatusTitle = '企业状态';

    var detailIndex = info.indexOf(detailTitle);
    var addressIndex = info.indexOf(addressTitle);
    var companyStatusIndex = info.indexOf(companyStatusTitle);
    var companyName = info.substring(0, detailIndex).trim();

    var addressTempStr = info.substring(detailIndex, companyStatusIndex)
    var address = addressTempStr.substring(addressTempStr.lastIndexOf('：') + 1).trim();

    var companyStatus = info.substring(companyStatusIndex + companyStatusTitle.length + 1).trim(); 

    var start = "('";
    var end = "')";
    var companyQueryId = first.substring(first.indexOf(start) + start.length, first.indexOf(end)) 

    var company = {
      companyName: companyName,
      address: address,
      companyStatus: companyStatus,
      companyQueryId: companyQueryId
    };

    companyLists.push(company);
  });

  callback({allpageNo: allpageNo, numberOfResults: numberOfResults, companyLists:companyLists});
}



//---------------------------------------------------


Util.prototype.handleCompanyDetail = function(companyDetailHtml, callback) {

  log('handleCompanyDetail');
  fs.appendFile('result.html', companyDetailHtml, function(err) {
    log(err);
  }) 

  var $ = cheerio.load(companyDetailHtml);

  var detailResult = {};

  var detailInfo = $('table[id="resultTbInfo"]');
  var detailAnnual = $('table[id="resultTbAnnl"]');

  var tds =  detailInfo.find('.list_boder td');
  // log($(tds).text())
  var basicDetail = [];
  for(var i = 0; i < tds.length /2; i++) {
    var key = $(tds[2*i]).text().replace(/\n|\r|\t/g,"").trim();
    var value = $(tds[2*i + 1]).text().replace(/\n|\r|\t/g,"").trim();
    basicDetail.push({key: key, value: value});
  }


  var annu = detailAnnual.find('.list_td_1');
  var annualCheckDetail = [];

  for(var i = 0; i < annu.length / 2; i++) {
    var key = $(annu[2 * i]).text().replace(/\n|\r|\t/g,"").trim();
    var value = $(annu[2 * i + 1]).text().replace(/\n|\r|\t/g,"").trim();
    annualCheckDetail.push({key: key, value: value});
  }

  detailResult = {
    basicDetail : basicDetail,
    annualCheckDetail : annualCheckDetail
  }

  callback(detailResult);
}


//---------------------------------------------------

Util.prototype.handleCompanyNameStatusFuzzily = function(companyNameHtml, callback) {
  log('handleCompanyNameStatusFuzzily');
  var $ = cheerio.load(body);
  var tb = $('table[class="tgList"]');
  var trs = tb.find('tr');

  var results = [];
  var trsLength = trs.length;

  for(var i = 1; i < trsLength; i++) {
    var tds = $(trs[i]).find('td');

    var tdsLength = tds.length;
    var applyInfo = {
      acceptedDate: $(tds[0]).text().replace(/\n|\r|\t/g,"").trim(),
      companyName: $(tds[1]).text().replace(/\n|\r|\t/g,"").trim(),
      acceptOrgan: $(tds[2]).text().replace(/\n|\r|\t/g,"").trim(),
      applayStatus: $(tds[3]).text().replace(/\n|\r|\t/g,"").trim()
    }

    results.push(applyInfo);
  }

  callback(results);
}


//---------------------------------------------------

Util.prototype.handleCompanyNameStatusPrecisily = function(companyNameHtml, callback) {
  log('handleCompanyNameStatusPrecisily');
  var $ = cheerio.load(companyNameHtml);
  var tb = $('table[class="tgList"]');
  var trs = tb.find('tr');

  var companynameInfo = [];
  var trsLength = trs.length;
  var statuscode = 0; // 0: 0 result,1: 1 result, 2 :more than 1 results

  if(trsLength === 1) {
    statuscode = 0; // without any results
    callback({statuscode:statuscode, companynameInfo: []})
  } else if(trsLength === 2) {
    var tds = $(trs[1]).find('td');
    var applyInfo = {
      acceptedDate: $(tds[0]).text().replace(/\n|\r|\t/g,"").trim(),
      companyName: $(tds[1]).text().replace(/\n|\r|\t/g,"").trim(),
      acceptOrgan: $(tds[2]).text().replace(/\n|\r|\t/g,"").trim(),
      applayStatus: $(tds[3]).text().replace(/\n|\r|\t/g,"").trim()
    }

    statuscode = 1; 
    companynameInfo.push(applyInfo);
    callback({statuscode:statuscode, companynameInfo: companynameInfo})    

  } else {
    statuscode = 2;
    callback({statuscode:statuscode, companynameInfo: []})    
  }

}


//---------------------------------------------------

Util.prototype.handleRegistrationStatusFeedback = function(companyStatusHtml, callback) {
  log('handleRegistrationStatusFeedback');
  var $ = cheerio.load(companyStatusHtml);
  var tb = $('table[class="tgList"]');
  var trs = tb.find('tr');

  var registrationStatusInfo = [];
  var trsLength = trs.length;
  var statuscode = 0; // 0: 0 result,1: 1 result, 2 :more than 1 results

  if(trsLength === 1) {
    statuscode = 0; // without any results
    callback({statuscode:statuscode, registrationStatusInfo: []})
  } else if(trsLength === 2) {
    var tds = $(trs[1]).find('td');
    var applyInfo = {
      applyDate: $(tds[0]).text().replace(/\n|\r|\t/g,"").trim(),
      companyName: $(tds[1]).text().replace(/\n|\r|\t/g,"").trim(),
      registrationStatus: $(tds[2]).text().replace(/\n|\r|\t/g,"").trim()
    }

    statuscode = 1; 
    registrationStatusInfo.push(applyInfo);
    callback({statuscode:statuscode, registrationStatusInfo: registrationStatusInfo})    

  } else {
    statuscode = 2;
    callback({statuscode:statuscode, registrationStatusInfo: []})    
  }

}

//---------------------------------------------------





























//---------------------------------------------------


