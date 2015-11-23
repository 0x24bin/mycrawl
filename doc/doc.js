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

    var result = [];
    for (var i = 0; i < valueInfosLength; i++) {
      var temResult = [];
      for (var j = 0; j < propertiesLength; j++) {
        var property = $(properties[j]).text().replace(/\n|\r|\t/g, "").trim();
        var td = $(valueInfos[i]).find("td")[j];
        var value = $(td).text().replace(/\n|\r|\t/g, "").trim();
        var detail = $(td).find("a").first().text().replace(/\n|\r|\t/g, "").trim();

        // 判断是否有股东详情
        var type = "text"
        var url = "";
        if (detail === '详情') {
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


  // 获取变更信息

  var ChangeInfoHTML = $("#alterTable").first();
  var changeInfos = InfoLists(ChangeInfoHTML);

  // 获取撤销事项
  var RevocationInfoHtml = $("#alterTable").eq(1);
  var revocationInfos = InfoLists(RevocationInfoHtml);

  var registrationInfo = {
    basicInfo: basicInfo,
    investors: investors,
    changeInfos: changeInfos,
    revocationInfos: revocationInfos
  };

  // log(registrationInfo)
  // return registrationInfo;
  //---------------------------------------------------------------
  // 下面的是备案信息
  var memberObj = $("#memberTable");
  var tds = memberObj.find(".page-item :not('.center')");
  var tdsLength = tds.length;

  var memberTable = [];
  var memberLength = tdsLength / 2;

  for (var i = 0; i < memberLength; i++) {
    var member = [];
    for (var j = 2 * i; j < 2 * (i + 1); j++) {
      if (j % 2 === 0) {
        var key = "姓名";
        var value = $(tds[j]).text().replace(/\n|\r|\t/g, "").trim();
      } else {
        var key = '职务';
        var value = $(tds[j]).text().replace(/\n|\r|\t/g, "").trim();
      }
      member.push({
        key: key,
        value: value
      });
    }
    memberTable.push(member)
  }

  var branchObj = $("#branchTable")

  var branchTable = InfoLists(branchObj);

  var recordInfo = {
    memberTable: memberTable,
    branchTable: branchTable
  };

  // 动产抵押登记信息
  mortageObj = $("#mortageTable");
  var mortageTable = InfoLists(mortageObj);


  // 行政处罚信息
  var punishObj = $("#punishTable");
  var punishTable = InfoLists(punishObj);

  // 经营异常信息
  var exceptObj = $("#exceptTable");
  var exceptTable = InfoLists(exceptObj);

  // 严重违法信息
  var blackObj = $("#blackTable");
  var blackTable = InfoLists(blackObj);


  // 抽查检查信息
  var spotcheckObj = $("#spotcheckTable");
  var spotcheckTable = InfoLists(spotcheckObj);

})