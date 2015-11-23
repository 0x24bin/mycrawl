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



fs.readFile('./company5.html', function(err, data) {
  var html = data.toString();
  var $ = cheerio.load(html);
  // 企业年报
  var annualReportObj = $("div[rel='layout-02_01']").first();
  var annualReport = InfoLists2($, annualReportObj);
  // 行政许可信息
  var adminLicenseObj = $("div[rel='layout-02_02']").first();
  var adminLicenseTable = InfoLists2($, adminLicenseObj);
  // 知识产权出质登记信息
  var intellectualPropertyObj = $("div[rel='layout-02_03']").first();
  var intellecturlTable = InfoLists2($, intellectualPropertyObj)
    // 行政处罚信息
  var adminPenaltiesObj = $("div[rel='layout-02_05']").first();
  var adminPenalties = InfoLists2($, adminPenaltiesObj);

  var companyDisclosure = {
    annualReport: annualReport,
    adminLicenseTable: adminLicenseTable,
    intellecturlTable: intellecturlTable,
    adminPenalties: adminPenalties
  }

  log(companyDisclosure)








})