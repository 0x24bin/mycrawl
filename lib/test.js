var request = require('request');
// var config = require('./config');
// var registrationConfig = config.registration;
var cheerio = require('cheerio');

var fs = require('fs');
//---------------------------------------------------

function log(info) {
  console.log('-------------------------')
  var len = arguments.length;
  for (var i = 0; i < len; i++) {
    console.log(arguments[i]);
  }
}

var url = "http://www.sgs.gov.cn/nameqry/searchTrdUseableName.action"
var f_type = "餐饮";
var formData = {
  // trdId:  "", // 行业类别
  // trdName : f_type,//行业表述
  // zihao: "" ,
  // query: '1',
  // type: 'search',
  page: 2
}



var detailOptions = {
  url: url,

  formData: formData

}


request.post(detailOptions, function optionalCallback(err, httpResponse, body) {
  if (err) {
    log('Get useable name err.', err)
  } else {
    log('get useable name succeed', body);

  }
});