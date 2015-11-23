var cheerio = require('cheerio');
var fs = require('fs');
var restify = require('restify');

//---------------------------------------------------
var homeClient = restify.createStringClient({
  url: 'http://www.sgs.gov.cn',
  headers: {
    "Accept": " */*",
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "zh-CN,zh;q=0.8,en-US;q=0.6,en;q=0.4",
    "Connection": "keep-alive",
    "Content-Type": "text/plain; charset=utf-8 ",
    "DNT": 1,
    "Host": "www.sgs.gov.cn",
    "Origin": "https://www.sgs.gov.cn",
    "Referer": "https://www.sgs.gov.cn/notice/home",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36"
  }
});

//---------------------------------------------------

function log(info) {
  console.log('--------------------------------------------------------')
  var len = arguments.length;
  for (var i = 0; i < len; i++) {
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
  var numberOfResults = resultsNumString.substring(numStartIndex, numEndIndex).replace(/[^0-9]/ig, "") // number of records that get from web.
  if (numberOfResults === "") {
    numberOfResults = 0;
  }
  // all pageNo handle
  var allpageNo = 0;
  var pageNoStartIndex = allPageNoString.indexOf(str3);
  var pageNoEndIndex = allPageNoString.indexOf(str4);

  if (pageNoStartIndex === -1) {
    allpageNo = 0;
  } else {
    allpageNo = allPageNoString.substring(pageNoStartIndex + str3.length, pageNoEndIndex).replace(/[^0-9]/ig, "");
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

  callback({
    allpageNo: allpageNo,
    numberOfResults: numberOfResults,
    companyLists: companyLists
  });
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

  var tds = detailInfo.find('.list_boder td');
  // log($(tds).text())
  var basicDetail = [];
  for (var i = 0; i < tds.length / 2; i++) {
    var key = $(tds[2 * i]).text().replace(/\n|\r|\t/g, "").trim();
    var value = $(tds[2 * i + 1]).text().replace(/\n|\r|\t/g, "").trim();
    basicDetail.push({
      key: key,
      value: value
    });
  }


  var annu = detailAnnual.find('.list_td_1');
  var annualCheckDetail = [];

  for (var i = 0; i < annu.length / 2; i++) {
    var key = $(annu[2 * i]).text().replace(/\n|\r|\t/g, "").trim();
    var value = $(annu[2 * i + 1]).text().replace(/\n|\r|\t/g, "").trim();
    annualCheckDetail.push({
      key: key,
      value: value
    });
  }

  detailResult = {
    basicDetail: basicDetail,
    annualCheckDetail: annualCheckDetail
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

  for (var i = 1; i < trsLength; i++) {
    var tds = $(trs[i]).find('td');

    var tdsLength = tds.length;
    var applyInfo = {
      acceptedDate: $(tds[0]).text().replace(/\n|\r|\t/g, "").trim(),
      companyName: $(tds[1]).text().replace(/\n|\r|\t/g, "").trim(),
      acceptOrgan: $(tds[2]).text().replace(/\n|\r|\t/g, "").trim(),
      applayStatus: $(tds[3]).text().replace(/\n|\r|\t/g, "").trim()
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

  if (trsLength === 1) {
    statuscode = 0; // without any results
    callback({
      statuscode: statuscode,
      companynameInfo: []
    })
  } else if (trsLength === 2) {
    var tds = $(trs[1]).find('td');
    var applyInfo = {
      acceptedDate: $(tds[0]).text().replace(/\n|\r|\t/g, "").trim(),
      companyName: $(tds[1]).text().replace(/\n|\r|\t/g, "").trim(),
      acceptOrgan: $(tds[2]).text().replace(/\n|\r|\t/g, "").trim(),
      applayStatus: $(tds[3]).text().replace(/\n|\r|\t/g, "").trim()
    }

    statuscode = 1;
    companynameInfo.push(applyInfo);
    callback({
      statuscode: statuscode,
      companynameInfo: companynameInfo
    })

  } else {
    statuscode = 2;
    callback({
      statuscode: statuscode,
      companynameInfo: []
    })
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

  if (trsLength === 1) {
    statuscode = 0; // without any results
    callback({
      statuscode: statuscode,
      registrationStatusInfo: []
    })
  } else if (trsLength === 2) {
    var tds = $(trs[1]).find('td');
    var applyInfo = {
      applyDate: $(tds[0]).text().replace(/\n|\r|\t/g, "").trim(),
      companyName: $(tds[1]).text().replace(/\n|\r|\t/g, "").trim(),
      registrationStatus: $(tds[2]).text().replace(/\n|\r|\t/g, "").trim()
    }

    statuscode = 1;
    registrationStatusInfo.push(applyInfo);
    callback({
      statuscode: statuscode,
      registrationStatusInfo: registrationStatusInfo
    })

  } else {
    statuscode = 2;
    callback({
      statuscode: statuscode,
      registrationStatusInfo: []
    })
  }

}

//---------------------------------------------------

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


Util.prototype.registrationInfos = function(html, callback) {
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

  // 获取股东信息
  var investorTableObj = $("#investorTable");

  var investorsTable = InfoLists($, investorTableObj);

  // 获取变更信息

  var ChangeInfoHTML = $("#alterTable").first();
  var changeInfos = InfoLists($, ChangeInfoHTML);

  // 获取撤销事项
  var RevocationInfoHtml = $("#alterTable").eq(1);
  var revocationInfos = InfoLists($, RevocationInfoHtml);

  // 下面的是备案信息
  // 主要人员信息
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
  // 分支机构信息
  var branchObj = $("#branchTable")
  var branchTable = InfoLists($, branchObj);

  var recordInfo = {
    memberTable: memberTable,
    branchTable: branchTable
  };

  // 动产抵押登记信息
  mortageObj = $("#mortageTable");
  var mortageTable = InfoLists($, mortageObj);


  // 行政处罚信息
  var punishObj = $("#punishTable");
  var punishTable = InfoLists($, punishObj);

  // 经营异常信息
  var exceptObj = $("#exceptTable");
  var exceptTable = InfoLists($, exceptObj);

  // 严重违法信息
  var blackObj = $("#blackTable");
  var blackTable = InfoLists($, blackObj);

  // 抽查检查信息
  var spotcheckObj = $("#spotcheckTable");
  var spotcheckTable = InfoLists($, spotcheckObj);

  var registrationInfo = {
    basicInfo: basicInfo,
    investorsTable: investorsTable,
    changeInfos: changeInfos,
    revocationInfos: revocationInfos,
    recordInfo: recordInfo,
    mortageTable: mortageTable,
    punishTable: punishTable,
    exceptTable: exceptTable,
    blackTable: blackTable,
    spotcheckTable: spotcheckTable
  };

  callback(registrationInfo);
}
//---------------------------------------------------
// 处理股东信息---企业信用
Util.prototype.handleInvestorDetail = function(investors, callback) {

  investors.forEach(function(investor) {
    if (investor.hasOwnProperty('type') && investor.type === 'url') {
      var url = investor.url;
      homeClient.get(url, function(err, req, res, body) {
        var $ = cheerio.load(body)
        var script = $("script");
        var scriptText = script.text();

        var investorInvNameIndex = scriptText.indexOf("investor.invName");
        var entInvtSetArrayIndex = scriptText.indexOf("认缴")
          // 股东
        var investorInvName = scriptText.slice(investorInvNameIndex + 19, entInvtSetArrayIndex).replace(/\n|\r|\t|\"|\'|;|\//g, "").trim() || "";

        var subConAmIndex = scriptText.indexOf("subConAm");
        var invtConDateIndex = scriptText.indexOf("invt.conDate");
        var invtConFormIndex = scriptText.indexOf("invt.conForm");
        var entInvetSetPushIndex = scriptText.indexOf("entInvtSet.push(invt)");


        // 认缴额（万元）
        var indexSubConAm = scriptText.slice(subConAmIndex + 11, invtConDateIndex).replace(/\n|\r|\t|\"|\'|;/g, "").trim();
        // 认缴出资日期
        var invetConDate = scriptText.slice(invtConDateIndex + 15, invtConFormIndex).replace(/\n|\r|\t|\"|\'|;/g, "").trim() || "";
        // 认缴出资方式
        invtConForm = scriptText.slice(invtConFormIndex + 15, entInvetSetPushIndex).replace(/\n|\r|\t|\"|\'|;/g, "").trim() || "";
        var entInvtSet = {
          indexSubConAm: indexSubConAm,
          invetConDate: invetConDate,
          invtConForm: invtConForm
        }


        var invtActlAcConAmIndex = scriptText.indexOf("invtActl.acConAm");
        var invtActlConDateIndex = scriptText.indexOf("invtActl.conDate")
        var invtActlConFormIndex = scriptText.indexOf("invtActl.conForm");
        var entInvtActlSetIndex = scriptText.indexOf("entInvtActlSet.push");

        // 实缴出资额（万元）
        var invtActlAcConAm = scriptText.slice(invtActlAcConAmIndex + 19, invtActlConDateIndex).replace(/\n|\r|\t|\"|\'|;/g, "").trim() || "";
        // 实缴出资日期
        invtActlConDate = scriptText.slice(invtActlConDateIndex + 19, invtActlConFormIndex).replace(/\n|\r|\t|\"|\'|;/g, "").trim() || "";
        // 实缴出资方式
        var invtActlConForm = scriptText.slice(invtActlConFormIndex + 19, entInvtActlSetIndex).replace(/\n|\r|\t|\"|\'|;/g, "").trim() || "";

        var entInvtActlSet = {
          invtActlAcConAm: invtActlAcConAm,
          invtActlConDate: invtActlConDate,
          invtActlConForm: invtActlConForm
        }

        var investorInfo = {
          investorInvName: investorInvName,
          entInvtSet: entInvtSet,
          entInvtActlSet: entInvtActlSet
        };
        callback(investorInfo)

      });
    }
  })
}









//---------------------------------------------------