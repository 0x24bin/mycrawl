var fs = require('fs');

var cheerio = require('cheerio');

function log(info) {
  console.log('--------------------------------------------------------')
  var len = arguments.length;
  for (var i = 0; i < len; i++) {
    console.log(arguments[i]);
  }
};



fs.readFile('./company.html', function(err, data) {
  var html = data.toString();

  var $ = cheerio.load(html);

  // 获取公司登记信息
  var basicInfoObj = $("div[rel='layout-01_01']").first();
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

  //-----------------------------------------
  var investorTable = $("#investorTable");

  // 获取股东信息属性
  var propertiesObj = investorTable.find("tr")[1];
  var properties = $(propertiesObj).find("th");
  var propertiesLength = properties.length;

  var investorsObj = investorTable.find("tr.page-item"); // 属性值
  var investorsObjLength = investorsObj.length;

  var investors = [];

  for (var i = 0; i < propertiesLength; i++) {
    var property = $(properties[i]).text().replace(/\n|\r|\t/g, "").trim();

    for (var j = 0; j < investorsObjLength; j++) {
      var td = $(investorsObj[j]).find("td")[i];
      var value = $(td).text().replace(/\n|\r|\t/g, "").trim();
      var detail = $(td).find("a").first().text().replace(/\n|\r|\t/g, "").trim();

      // 判断是否有股东详情
      var type = "text"
      var url = "";
      if (detail === '详情') {
        type = 'url';
        url = $(td).find("a").first().attr("href").replace("https", "http");
      }

      investors.push({
        key: property,
        value: value,
        type: type,
        url: url
      });
    }
  }


  function InfoLists(html) {
    var propertiesObj = html.find("tr")[1];
    var properties = $(propertiesObj).find("th");
    var propertiesLength = properties.length;
    var valueInfos = html.find("tr.page-item"); // 属性值
    var valueInfosLength = valueInfos.length;
    console.log(propertiesLength, valueInfosLength)

    var result = [];
    for (var i = 0; i < propertiesLength; i++) {
      var property = $(properties[i]).text().replace(/\n|\r|\t/g, "").trim();
      for (var j = 0; j < valueInfosLength; j++) {
        var td = $(valueInfos[j]).find("td")[i];
        var value = $(td).text().replace(/\n|\r|\t/g, "").trim();
        result.push({
          key: property,
          value: value
        })
      }
    };
    return result;
  };

  // 获取变更信息

  var ChangeInfoHTML = $("#alterTable").first();
  var changeInfos = InfoLists(ChangeInfoHTML);

  // 获取撤销事项
  var RevocationInfoHtml = $("#alterTable").eq(1);
  var revocationInfos = InfoLists(RevocationInfoHtml);




})