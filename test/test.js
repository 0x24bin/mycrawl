function log(info) {
  console.log('------------------------------------------------------------')
  var len = arguments.length;
  for(var i =0; i < len; i++) {
    console.log(arguments[i]);
  }
}




//------------------------------------------------------------ 

function handleKeywords(keywords) {
  var keywordsLength = keywords.length;

  if(typeof keywords === 'string' && keywordsLength >= 2) {
    var zone = '上海'; // we only use this for shanghai province , china

    if(keywords.indexOf(zone) >= 0) {
      if(keywordsLength >= 4) {
        return {flag: true, searchKeywords: keywords};
      } else {
        return {flag: false, searchKeywords: []};
      }
    } else {
      searchKeywords = [zone + keywords, keywords + '（' + zone + '）'];
      return {flag: true, searchKeywords: searchKeywords}
    }
  } else {
    return {flag: false, searchKeywords: []}

  }
}

//------------------------------------------------------------

var keywords = ['上海月湖', '月湖','湖', '海月湖', '上海月湖会计', '月湖会计' ]


keywords.forEach(function(keyword) {
  var results = handleKeywords(keyword);
  log(keyword, results)

})

//------------------------------------------------------------











//------------------------------------------------------------



