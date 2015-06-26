var request = require('request');
// var config = require('./config');
// var registrationConfig = config.registration;
var cheerio = require('cheerio');

var fs = require('fs');
//---------------------------------------------------

function log(info) {
  console.log('-------------------------')
  var len = arguments.length;
  for(var i =0; i < len; i++) {
    console.log(arguments[i]);
  }
}

var keyWords = "上海东方";

var formData = {
  period : keyWords,
  keyWords: keyWords,
  searchType: 1,
  pageNo: 0
}


var detailOptions = {
  url: 'http://www.sgs.gov.cn/lz/etpsInfo.do?method=doSearch',
  
  formData: formData

}


request.post(detailOptions,function optionalCallback(err, httpResponse, body) {
  if(err) {
    log('Get registration  detail err.', err)
  } else {
    // log(null, body)
    
     var $ = cheerio.load(body);
     var pageCount = $('td[class="pageCount"]').text();
     var str1 = '共'
     var str2 = '页'

     var index1 = pageCount.indexOf(str1);
     var index2 = pageCount.indexOf(str2);

     log(index1, index2, pageCount.substring(index1+ str1.length, index2))

    











  }      
});













