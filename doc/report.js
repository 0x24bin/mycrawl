var fs = require('fs');

var cheerio = require('cheerio');

function log(info) {
  console.log('--------------------------------------------------------')
  var len = arguments.length;
  for (var i = 0; i < len; i++) {
    console.log(arguments[i]);
  }
};

function InfoLists($, htmlObj) {
  var propertiesObj = htmlObj.find("tr")[1];
  var properties = $(propertiesObj).find("th");
  var propertiesLength = properties.length;
  var valueInfos = htmlObj.find("tr.page-item"); // 属性值
  var valueInfosLength = valueInfos.length;

  var result = [];
  for (var i = 0; i < valueInfosLength; i++) {
    var temResult = [];
    for (var j = 0; j < propertiesLength; j++) {
      var property = $(properties[j]).text().replace(/\n|\r|\t/g, "").trim();
      var td = $(valueInfos[i]).find("td")[j];
      var value = $(td).text().replace(/\n|\r|\t/g, "").trim();
      var detail = $(td).find("a");

      // 判断是否有详情
      var type = "text"
      var url = "";
      if (detail.length > 0) {
        value = $(detail).text().replace(/\n|\r|\t/g, "").trim();
        type = 'url';
        url = $(td).find("a").first().attr("href").replace("https", "http");
      }

      temResult.push({
        key: property,
        value: value,
        type: type,
        url: url
      })
    }
    result.push(temResult)
  };
  return result;
};


function InfoLists2($, htmlObj) {
  log(htmlObj)
  var propertiesObj = htmlObj.find("tr")[1];
  var properties = $(propertiesObj).find("th");
  var propertiesLength = properties.length;

  var valueInfos = htmlObj.find("td");
  var valueInfosLength = valueInfos.length;


  var valueItemLength = valueInfosLength / propertiesLength;
  var result = [];
  for (var i = 0; i < valueItemLength; i++) {
    var temResult = [];
    for (var j = propertiesLength * i; j < propertiesLength * (i + 1); j++) {
      var property = $(properties[j % propertiesLength]).text().replace(/\n|\r|\t/g, "").trim();

      var td = valueInfos[j];
      var value = $(td).text().replace(/\n|\r|\t/g, "").trim();
      var detail = $(td).find("a");
      // 判断是否有详情
      var type = "text"
      var url = "";
      if (detail.length > 0) {
        value = $(detail).text().replace(/\n|\r|\t/g, "").trim();
        type = 'url';
        url = $(td).find("a").first().attr("href").replace("https", "http");
      }

      temResult.push({
        key: property,
        value: value,
        type: type,
        url: url
      })
    }
    result.push(temResult)
  };

  return result
}


fs.readFile('./company7.html', function(err, data) {
  var html = data.toString();
  var $ = cheerio.load(html);

  // 企业基本信息
  var basicInfoObj = $("table").first();
  var basicLabels = basicInfoObj.find('th.right');
  var basicValues = basicInfoObj.find('td');
  var basicLength = basicLabels.length;

  var basicInfo = []; // 登记信息公司基本信息
  for (var i = 0; i < basicLength; i++) {
    var key = $(basicLabels[i]).text().replace(/\n|\r|\t/g, "").trim();
    var value = $(basicValues[i]).text().replace(/\n|\r|\t/g, "").trim();
    basicInfo.push({
      key: key,
      value: value
    });
  }

  // 网站或网店信息
  var siteObj = $("table")[1];
  var sitesInfo = InfoLists2($, $(siteObj));


  // 股东及出资信息（币种与注册资本一致

  var investorsObj = $("table")[2];
  var investoresInfo = InfoLists2($, $(investorsObj));

  // 对外投资信息

  






























});