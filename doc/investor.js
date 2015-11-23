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
      if (detail.length > 0 ) {
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





fs.readFile('./investorview.html', function(err, data) {
  var html = data.toString();

  var $ = cheerio.load(html);

  var titleObj = $(".title-bar").find('li')[0];
  var title = $(titleObj).text().replace(/\n|\r|\t/g, "").trim();
  var creditObj = $(".title-bar li")[1];
  var creditIdString = $(creditObj).text().replace(/\n|\r|\t/g, "").trim();
  var creditId = creditIdString.slice(creditIdString.indexOf("：") + 1)

  var investorObj = $("#investor");
  log(investorObj.text())

  var investorTable = InfoLists($, investorObj)

  log(investorTable)











});