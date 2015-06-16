var cheerio = require('cheerio');

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

  var resultsNumString = $('th[class="result"]').text();
  var str1 = '搜索结果';
  var str2 = '查询条件';

  var numStartIndex = resultsNumString.indexOf(str1);
  var numEndIndex = resultsNumString.indexOf(str2);
  var numberOfResults = resultsNumString.substring(numStartIndex, numEndIndex).replace(/[^0-9]/ig,"") // number of records that get from web.
  if(numberOfResults === "") {
    numberOfResults = 0;
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

    var address = info.substring(addressIndex + addressTitle.length + 1, companyStatusIndex).trim();
    var companyStatus = info.substring(companyStatusIndex + companyStatusTitle.length + 1).trim(); 

    var companyRegistrationId = first.replace(/[^0-9]/ig,"");  

    var company = {
      companyName: companyName,
      address: address,
      companyStatus: companyStatus,
      companyRegistrationId: companyRegistrationId
    };

    companyLists.push(company);
  });

  callback({numberOfResults: numberOfResults, companyLists:companyLists});
}



//---------------------------------------------------


Util.prototype.handleCompanyDetail = function(companyDetailHtml, callback) {

  var $ = cheerio.load(companyDetailHtml);

  var detailResult = {};

  var detailInfo = $('table[id="resultTbInfo"]');
  var detailAnnual = $('table[id="resultTbAnnl"]');

  var tds =  detailInfo.find('.list_boder td');

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


