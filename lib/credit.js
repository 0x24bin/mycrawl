var restify = require('restify');
var cheerio = require('cheerio');
var url = require('url');
var querystring = require('querystring');


/**
 * print information
 * @param  {array} info information needs to be print
 */
function log(info) {
  console.log('--------------------------------------------------------')
  var len = arguments.length;
  for (var i = 0; i < len; i++) {
    console.log(arguments[i]);
  }
};


var Credit = function(options) {
  this.options = options;
};

exports.Credit = Credit;

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

//-----------------------------------------------------------------
/**
 * get platform parameter : session.token, Cookie
 * @param  {Function} callback return parameters
 * @return {obj}            json parameters
 */
Credit.prototype.getPlatformParameter = function(callback) {

  homeClient.get('/notice/home', function(err, req, res, body) {
    if (err) {
      log("get homepage platform parameters error", err);
      callback(err, null);
    } else if (res.statusCode === 200) {
      var headers = res.headers;
      if (headers && headers.hasOwnProperty('set-cookie')) {
        var setCookie = headers['set-cookie'].toString();
        var Cookie = setCookie.slice(0, setCookie.indexOf(';')) || "";
        // get session.token
        var $ = cheerio.load(body);
        var sessionToken = $("input[name='session.token']").attr("value") || "";

        var result = {
          Cookie: Cookie,
          sessionToken: sessionToken
        };
        callback(null, result);
      } else {
        callback(null, null);
      }
    }
  })
};

//-----------------------------------------------------------------
/**
 * get single company creadit information
 * @param  {json}   options  contains Cookie, sessionToken
 * @param  {function} callback return credit lists
 * @return {json}            credit information lists
 */
Credit.prototype.getSingleCreditHTML = function(options, callback) {
  if (options && options.hasOwnProperty('Cookie') && options.hasOwnProperty('sessionToken') && options.hasOwnProperty("keyword")) {
    var headers = {
      "Accept": " */*",
      "Accept-Encoding": "gzip, deflate",
      "Accept-Language": "zh-CN,zh;q=0.8,en-US;q=0.6,en;q=0.4",
      "Connection": "keep-alive",
      "Content-Type": "text/plain; charset=utf-8 ",
      "Cookie": options.Cookie,
      "DNT": 1,
      "Host": "www.sgs.gov.cn",
      "Origin": "https://www.sgs.gov.cn",
      "Referer": "https://www.sgs.gov.cn/notice/home",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36"
    };

    // create http client to get credit lists
    var client = restify.createStringClient({
      url: 'http://www.sgs.gov.cn',
      headers: headers
    });

    client.post('/notice/search/ent_info_list', {
      'captcha': 6,
      'condition.pageNo': '1',
      'condition.insType': '',
      'session.token': options.sessionToken,
      'condition.keyword': options.keyword || "",
    }, function(err, req, res, body) {
      if (err || res.statusCode !== 200) {
        log("get single credit information error", err);
        callback(err, null);
      } else {
        log("get single credit information succeed");
        var $ = cheerio.load(body);
        var listItem = $(".list-item").first();
        if (listItem.length === 1) {
          var companyItem = listItem.find("a");
          var companyName = companyItem.text().trim();
          var industryDisclosureURL = companyItem.attr("href");
          var query = url.parse(industryDisclosureURL).query;
          var uuid = querystring.parse(query).uuid;

          var profile = listItem.find(".profile").first();
          var text = profile.text().trim();

          var companyCode = text.slice(text.indexOf(":") + 1, text.indexOf("负责人")).replace(/\n|\r|\t/g, "").trim();
          var pic = text.slice(text.indexOf("负责人") + 4, text.indexOf("登记机关")).replace(/\n|\r|\t/g, "").trim();
          var registrationAuthority = text.slice(text.indexOf("登记机关") + 5, text.indexOf("成立日期")).replace(/\n|\r|\t/g, "").trim();
          var companyCreateTime = text.slice(text.indexOf("成立日期") + 5).replace(/\n|\r|\t/g, "").trim();


          var basicInfos = [{
            key: '公司名称',
            value: companyName
          }, {
            key: '统一社会信用代码/注册号',
            value: companyCode
          }, {
            key: '负责人',
            value: pic
          }, {
            key: '登记机关',
            value: registrationAuthority
          }, {
            key: '成立日期',
            value: companyCreateTime
          }];
          var infos = {
            uuid: uuid, // uuid to load company disclosure information
            basicInfos: basicInfos
          }
          callback(null, infos);
        } else {
          callback(null, null);
        }
      }
    })
  } else {
    log("get single credit failed, options not completely", options);
    callback(null, null);
  }
};

/**
 * get company disclosure html
 * @param  {json}   options  contaion uuid, tab, Cookie
 * @param  {Function} callback return html
 */
Credit.prototype.getDisclosureHTML = function(options, callback) {
  if (options && options.hasOwnProperty("uuid") && options.hasOwnProperty("tab") && options.hasOwnProperty('Cookie')) {
    var urlpath = 'http://www.sgs.gov.cn/notice/notice/view?uuid=' + options.uuid + '&tab=' + options.tab;
    var headers = {
      "Accept": " */*",
      "Accept-Encoding": "gzip, deflate",
      "Accept-Language": "zh-CN,zh;q=0.8,en-US;q=0.6,en;q=0.4",
      "Connection": "keep-alive",
      "Content-Type": "text/plain; charset=utf-8 ",
      "Cookie": options.Cookie,
      "DNT": 1,
      "Host": "www.sgs.gov.cn",
      "Origin": "https://www.sgs.gov.cn",
      "Referer": "https://www.sgs.gov.cn/notice/search/ent_info_list",
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36"
    };

    // create http client to get credit lists
    var client = restify.createStringClient({
      url: 'http://www.sgs.gov.cn',
      headers: headers
    });

    client.get(urlpath, function(err, req, res, body) {
      if (res.statusCode === 200) {
        callback(null, body);
      } else {
        callback(null, null);
      }
    })
  } else {
    log("get industry disclosure information failed", options);
    callback(null, null);
  }
};