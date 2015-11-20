mycrawl
----------

Developed for [yiqicha.net](http://www.yiqicha.net)  to crawl compamny registration information in Shanghai that is based on the website of `http://www.sgs.gov.cn/shaic/`. Any question is welcomed, contract `zunkun.liu@kyl.biz`

This crawler can get company registration information , company certifaction process information.You should provide search parameters to crawler when use this module.

### How to use?
1. use npm to get the latest package `npm install mycrawl`
2. generate you crawler 

```javascript
var Crawler = require('mycrawl').Crawler;
var crawler = new Crawler();

```

### API
#### searchCompanyInformation

```javascript
  registrationOptions =  {
    homeRefererUrl: 'http://www.sgs.gov.cn/lz/etpsInfo.do?method=index', // The referer url
    registrationResultsUrl: 'http://www.sgs.gov.cn/lz/etpsInfo.do?method=doSearch', // results for keywords url
    registrationDetailUrl: 'http://www.sgs.gov.cn/lz/etpsInfo.do?method=viewDetail' // url for keywords detail
  }
  var keywords = '上海东风';
  crawler.searchCompanyInformation(registrationOptions, keywords, function(err, registrationResults) {
    //you handle...
  });


```
#### getMoreRegistrations

```javascript
crawler.getMoreRegistrations(registrationOptions, keywords, allpageNo, pageNo, function(err, moreRegistrations) {
      callback(err, moreRegistrations)
    })

```



#### searchCompanyNameStatus

```javascript
var companyStatusOptions = {
  targetUrl: 'http://www.sgs.gov.cn/shaic/workonline/appStat!toNameAppList.action'
};

var keywords = '美孕国际'

crawler.searchCompanyNameStatus(companyStatusOptions, keyword, function(err, companyNameStatusInfo) {
  log(keyword, err, companyNameStatusInfo)
})

```

#### searchRegistrationStatus

```javascipt
var registrationStatusOption = {
  targetUrl : 'http://www.sgs.gov.cn/shaic/workonline/appStat!toEtpsAppList.action'
}

var keywords = '上海顺风';

crawler.searchRegistrationStatus(registrationStatusOption, keyword, function(err, registrationStatusInfo) {
  log(keyword, err, registrationStatusInfo)
})

```


### License: MIT
