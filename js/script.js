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
      document.getElementById('city').addEventListener('onkeyup',function(e){
        subject_name = e.target.value;
        console.log(subject_name);
        return subject_name;
      });
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
  var nytimesUrl = 'https://api.nytimes.com/svc/search/v2/articlesearch.json?q=' + hh_text + '&sort=newest&api-key=3abc9a3d23e60b38c21b4ab9b0a91c07:17:69911633'
  $.getJSON(nytimesUrl, function(data) {

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
  var wikiUrl = 'https://en.wikipedia.org/w/api.php?action=opensearch&search=' + hh_text + '&format=json&callback=wikiCallback';
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
  var hh_per_page = "100";
  var hh_city = document.getElementById('city').getAttribute('data_city_id');

  var hh_url = 'https://api.hh.ru/vacancies?text=' + hh_text + '&area=' + hh_area + '&name=' + hh_name + '&area.id=' + hh_city + '&per_page=' + hh_per_page;
  $.getJSON(hh_url, function(data) {

    var hh_arr = data.items;

    for (var i = 0; i < hh_arr.length; i++) {

      if (hh_arr[i].salary === null) {
         hhElem.append('<li><a href="'+ hh_arr[i].alternate_url+ '">'+ hh_arr[i].name+ '</a><p>' + 'по договоренности' + '</p></li>');
      }
      else if (hh_arr[i].salary['to'] === null) {
        hhElem.append('<li><a href="'+ hh_arr[i].alternate_url+ '">'+ hh_arr[i].name+ '</a><p>' + 'от ' + hh_arr[i].salary.from + ' ' + hh_arr[i].salary.currency + '</p></li>');
      }
      else if (hh_arr[i].salary['from'] === null) {
        hhElem.append('<li><a href="'+ hh_arr[i].alternate_url+ '">'+ hh_arr[i].name+ '</a><p>' + 'до ' + hh_arr[i].salary.to + ' ' + hh_arr[i].salary.currency + '</p></li>');
      }
      else {
        hhElem.append('<li><a href="'+ hh_arr[i].alternate_url+ '">'+ hh_arr[i].name+ '</a><p>' + 'от ' + hh_arr[i].salary.from + ' до ' + hh_arr[i].salary.to + ' ' + hh_arr[i].salary.currency + '</p></li>');
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
