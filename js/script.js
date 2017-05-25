var hh_pre_url = 'https://api.hh.ru/areas/113';
$.getJSON(hh_pre_url, function(data) {
var hh_pre_arr = data.areas;
  var dropdown = document.createElement('div');
  document.getElementById('city').after(dropdown);
  dropdown.classList.add("dropdown");
  dropdown.insertAdjacentHTML('beforeend',"<div id='first_label' class='option_label'> Выберите город </div><div id='aaa' class='option_children'></div>");
  var option_label = $('#aaa');
for (var i = 0; i<hh_pre_arr.length; i++) {
  var options = "<div class='option'><div class='option_label'>" + hh_pre_arr[i].name + "</div><div class='option_children'></div></div>";
  option_label.append(options);
};
var option_children_after = $('.dropdown .option_children .option .option_children');
for (var i = 0; i<hh_pre_arr.length; i++) {
  for (var j = 0; j<hh_pre_arr[i].areas.length; j++) {
    var sub_option_val = "<div class='option'><div id='" + hh_pre_arr[i].areas[j].id + "' class='option_label target_city'>" + hh_pre_arr[i].areas[j].name + "</div></div>";
    option_children_after[i].insertAdjacentHTML('beforeend',sub_option_val);
  };
};
}).error(function(error) {
  console.log("=============== error");
  console.log(error);
});

// =============================================================================
setTimeout(function(){
  var target_city = document.getElementsByClassName('target_city');
  for (var i = 0; i<target_city.length; i++){
    target_city[i].addEventListener('click',function(e){
      var city_text = e.target.innerText;
      var city_id = e.target.id;
      var subject_name = e.target.parentNode.parentNode.previousSibling.innerText;
      var subject_name_PLUS = subject_name.replace(/\s/g,'+');
      document.getElementById('city').setAttribute('data_city_id',city_id);
      $('#city').val(city_text);
// =============================================================================
      var iframe = document.getElementById("iframe");
      var iframe_url = "https://www.google.com/maps/embed/v1/place?key=AIzaSyDRLAUBlx2U5rRQHff5XseZM3WX78kk2-Y&q=" + subject_name_PLUS + "," + city_text;
      console.log(iframe_url);
      iframe.setAttribute('src',iframe_url);
    });

  };
},1500);
// =============================================================================

function loadData() {

  var body = $('body');
  var wikiElem = $('#wikipedia-links');
  var nytHeaderElem = $('#nytimes-header');
  var nytElem = $('#nytimes-articles');
  var hhElem = $('#hh-vacancies');
  var hhHearerElem = $('#hh-header');
  var street_val = $('#street').val();
  var city_val = $('#city').val();
  var hh_text = $('#vacancy').val();
  var address = street_val + ', ' + city_val;

  // ================================================== clear out old data before new request
  wikiElem.text("");
  nytElem.text("");
  hhElem.text("");

  // ================================================== load streetview
  var g_api_key = "AIzaSyBWlsBPaVDJPJtgrSsaEcoyHvCgqDtxRrQ";
  var g_api_key_02 = "AIzaSyBBSJs6MpIYqUIAAH-X2TrS7BJAiwsU1sk";
  var streetviewUrl = 'https://maps.googleapis.com/maps/api/streetview?size=400x400&location=' + address + '&key=' + g_api_key_02 + '';
  body.append('<img class="bgimg" src="' + streetviewUrl + '">');

  // ================================================== load nytimes
  var nytimesUrl = 'https://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + city_val + '&sort=newest&api-key=3abc9a3d23e60b38c21b4ab9b0a91c07:17:69911633'
  $.getJSON(nytimesUrl, function(data) {

    nytHeaderElem.text('Статьи NEW-YORK TIMES (' + city_val + ")");

    articles = data.response.docs;
    for (var i = 0; i < articles.length; i++) {
      var article = articles[i];
      nytElem.append('<li class="article">' +
        '<a href="' + article.web_url + '">' + article.headline.main + '</a>' + '<p>' + article.snippet + '</p>' + '</li>');
    };

  }).error(function(e) {
    nytHeaderElem.text('Ошибка загрузки статей из NEW-YORK TIMES');
  });

  // ====================================================== load wikipedia data
  var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + city_val + '&format=json&callback=wikiCallback';
  var wikiRequestTimeout = setTimeout(function() {
    wikiElem.text("Ошибка загрузки статей из WIKIPEDIA");
  }, 4000);

  $.ajax({
    url: wikiUrl,
    dataType: "jsonp",
    jsonp: "callback",
    success: function(response) {
      var articleList = response[1];

      for (var i = 0; i < articleList.length; i++) {
        articleStr = articleList[i];
        var url = 'https://en.wikipedia.org/wiki/' + articleStr;
        wikiElem.append('<li><a href="' + url + '">' + articleStr + '</a></li>');
      };
      clearTimeout(wikiRequestTimeout);
    }
  });

  // ============================================================= load HeadHuner
  var hh_area = "113";
  var hh_name = "Россия";
  var hh_city = document.getElementById('city').getAttribute('data_city_id');
  console.log(hh_city);

  var hh_url = 'https://api.hh.ru/vacancies?text=' + hh_text + '&name=' + hh_name + '&area.id=' + hh_city;
  $.getJSON(hh_url, function(data) {

    var hh_arr = data.items;
    hhHearerElem.text('Вакансии' + hh_text + ' на HEAD HUNTER (найдено ' + hh_arr.length + ')');

    for (var i = 0; i < hh_arr.length; i++) {

      if (hh_arr[i].salary === null) {
         hhElem.append('<li><a href="'+ hh_arr[i].alternate_url+ '">'+ hh_arr[i].name+ '</a><p>Зарплата: ' + 'по договоренности' + '</p></li>');
      }
      else if (hh_arr[i].salary['to'] === null) {
        hhElem.append('<li><a href="'+ hh_arr[i].alternate_url+ '">'+ hh_arr[i].name+ '</a><p>Зарплата: ' + 'от ' + hh_arr[i].salary.from + ' ' + hh_arr[i].salary.currency + '</p></li>');
      }
      else if (hh_arr[i].salary['from'] === null) {
        hhElem.append('<li><a href="'+ hh_arr[i].alternate_url+ '">'+ hh_arr[i].name+ '</a><p>Зарплата: ' + 'до ' + hh_arr[i].salary.from + ' ' + hh_arr[i].salary.currency + '</p></li>');
      }
      else {
        hhElem.append('<li><a href="'+ hh_arr[i].alternate_url+ '">'+ hh_arr[i].name+ '</a><p>Зарплата: ' + 'от ' + hh_arr[i].salary.from + ' до ' + hh_arr[i].salary.to + ' ' + hh_arr[i].salary.currency + '</p></li>');
      }
    };
  }).error(function(error) {

    console.log("=============== error");
    console.log(error);

  });

// =============================================================================
// =================================== IFRAME ==================================



// =============================================================================



  return false;
  // ==================================  END of ALL ==============================

};

$('#form-container').submit(loadData);

// loadData();
// $('body').append('<img class="bgimg" src="http://3.bp.blogspot.com/-Gf7kdx_Snf0/UphofDlNzZI/AAAAAAAADNo/EvRpi5qsQqA/s1600/BulkJar.comBulkJar.com-Hot-Ass-Wallpapers-freehd.BulkJar.com14-BulkJar.comBulkJar.com_.jpg">');

// ============================ Wiki =================================
// var url = "http://ru.wikipedia.org/w/api.php?action=opensearch&search="
//           + city_val
//           + '&format=json&callback=?';
//
//           $.ajax( {
//               url: 'http://en.wikipedia.org/w/api.php',
//               data: {
//                   action: 'query',
//                   meta: 'tokens',
//                   format: 'json',
//                   origin: 'http://www.mediawiki.org'
//               },
//               xhrFields: {
//                   withCredentials: true
//               },
//               dataType: 'json'
//           } ).done( function ( data ) {
//               $.ajax( {
//                   url: 'http://en.wikipedia.org/w/api.php?origin=https://www.mediawiki.org',
//                   method: 'POST',
//                   data: {
//                       action: 'options',
//                       format: 'json',
//                       token: data.query.tokens.csrftoken,
//                       optionname: 'userjs-test',
//                       optionvalue: 'Hello world!'
//                   },
//                   xhrFields: {
//                       withCredentials: true
//                   },
//                   dataType: 'json'
//               } );
//           } );

// ============================ Wiki-end ==============================
// ====================== NY ===========================================
// var url = "https://api.nytimes.com/svc/search/v2/articlesearch.json";
// url += '?' + $.param({
//   'api-key': "c71d09ae04f54de58afa7756a63aec24",
//   'q': "moscow",
//   'begin_date': "20170519",
//   'end_date': "20170519"
// });
// $.getJSON(url, function(data) {
//   console.log(data);
//   var len = data['response']['docs'].length;
//
//     for (var i = 0; i<len; i++) {
//       var data_url = data['response']['docs'][i]['web_url'];
//       console.log(data_url);
//       $('#nytimes-articles').append("<br/><br/>" + data_url);
//     }
// });

// $.ajax({
//   url: url,
//   method: 'GET',
// }).done(function(result) {
//   var len = result['response']['docs'].length;
//   console.log(result);
//   for (var i = 0; i<len; i++) {
//     console.log(result['response']['docs'][i]['web_url']);
//   }
// }).fail(function(err) {
//   throw err;
// });
// =========================== NY-end ================================
