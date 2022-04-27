/*=========================================================================================
  File Name: app.js
  Description: Template related app JS.
  ----------------------------------------------------------------------------------------
  Item Name: Apex - HTML 5 Bootstrap Admin Template
  Author: Pixinvent
  Author URL: hhttp://www.themeforest.net/user/pixinvent
==========================================================================================*/

(function (window, document, $) {
  'use strict';
  var $html = $('html');
  var $body = $('body');
  var $sidebar = $('.app-sidebar'),
  $sidebar_img = $sidebar.data('image'),
  $sidebar_img_container = $('.sidebar-background');


  function scrollTopFn(){
    var $scrollTop = $(window).scrollTop();
    if ($scrollTop > 60) {
      $("body").addClass("navbar-scrolled");
    }else{
      $("body").removeClass("navbar-scrolled");
    }

    if ($scrollTop > 20) {
      $("body").addClass("page-scrolled");
    }
    else{
      $("body").removeClass("page-scrolled");
    }
  }

  $(window).scroll(function () {
    scrollTopFn();
  });

  $(window).on("load", function () {

    // Bg-colors of navbars for transparent fixed layout
    var tl = $(".layout-dark.layout-transparent");
    var tl_bg_color = tl.attr("data-bg-img");
    if (".layout-dark.layout-transparent.page-scrolled") {
      $("nav.header-navbar").addClass(tl_bg_color);

      setTimeout(function(){
        $(".horizontal-layout div.header-navbar").addClass(tl_bg_color);
      }, 10);
    }

    if($("body.horizontal-layout.vertical-overlay-menu.layout-dark:not(.layout-transparent)").length > 0){
      $('.app-sidebar').data('background-color','black');
    }

      var rtl;
      var compactMenu = false; // Set it to true, if you want default menu to be compact

      if ($body.hasClass("nav-collapsed")) {
          compactMenu = true;
      }

      if ($("html").data("textdirection") == "rtl") {
          rtl = true;
      }

      setTimeout(function () {
          $html.removeClass("loading").addClass("loaded");
      }, 1200);
      // Navigation configurations
      var config = {
          speed: 300 // set speed to expand / collpase menu
      };

      //  Notifications & messages scrollable
      $('.scrollable-container').each(function () {
          var scrollable_container = new PerfectScrollbar($(this)[0], {
              wheelPropagation: false
          });
      });
      
      // Filter
      $(".search-input .input").on("keyup", function (e) {
          if (e.keyCode !== 38 && e.keyCode !== 40 && e.keyCode !== 13) {
              if (e.keyCode == 27) {
                  // $(".wrapper").removeClass("show-overlay")

                  $(".search-input input").val("")
                  $(".search-input input").blur()
                  $(".search-input").removeClass("open")
                  if ($(".search-list").hasClass("show")) {
                      $(this).removeClass("show")
                      $(".search-input").removeClass("show")
                  }
              }

              // Define variables
              var value = $(this)
                  .val()
                  .toLowerCase(), //get values of inout on keyup
                  activeClass = "",
                  liList = $("ul.search-list li") // get all the list items of the search
              liList.remove()

              // If input value is blank
              if (value != "") {
                  $(".wrapper").addClass("show-overlay")


                  var $startList = "",
                      $otherList = "",
                      $htmlList = "",
                      $activeItemClass = "",
                      a = 0

                  // getting json data from file for search results
                  $.getJSON("app-assets/data/" + $filename + ".json", function (
                      data
                  ) {
                      for (var i = 0; i < data.listItems.length; i++) {

                          // Search list item start with entered letters and create list
                          if (
                              data.listItems[i].name.toLowerCase().indexOf(value) == 0 &&
                              a < 10 || !(data.listItems[i].name.toLowerCase().indexOf(value) == 0) &&
                              data.listItems[i].name.toLowerCase().indexOf(value) > -1 &&
                              a < 10
                          ) {
                              if (a === 0) {
                                  $activeItemClass = "current_item"
                              } else {
                                  $activeItemClass = ""
                              }
                              $startList +=
                                  '<li class="auto-suggestion d-flex align-items-center justify-content-between cursor-pointer ' +
                                  $activeItemClass +
                                  '">' +
                                  '<a class="d-flex align-items-center justify-content-between w-100" href=' +
                                  data.listItems[i].url +
                                  ">" +
                                  '<div class="d-flex align-items-center justify-content-start">' +
                                  '<span class="mr-2 ' +
                                  data.listItems[i].icon +
                                  '"></span>' +
                                  "<span>" +
                                  data.listItems[i].name +
                                  "</span>" +
                                  "</div>"
                              a++
                          }
                      }
                      if ($startList == "" && $otherList == "") {
                          $otherList =
                              '<li class="auto-suggestion d-flex align-items-center cursor-pointer">' +
                              '<a class="d-flex align-items-center justify-content-between w-100">' +
                              '<div class="d-flex align-items-center justify-content-start">' +
                              '<span class="mr-2"></span>' +
                              "<span>No results found.</span>" +
                              "</div>" +
                              "</a>" +
                              "</li>"
                      }

                      $htmlList = $startList.concat($otherList) // merging start with and other list
                      $("ul.search-list").html($htmlList) // Appending list to <ul>
                  })
              } else {
                  // if search input blank, hide overlay
                  if ($(".wrapper").hasClass("show-overlay")) {
                      $(".wrapper").removeClass("show-overlay")
                  }
              }
          }
      })

      // Add class on hover of the list
      $(document).on("mouseenter", ".search-list li", function (e) {
          $(this)
              .siblings()
              .removeClass("current_item")
          $(this).addClass("current_item")
      })
      $(document).on("click", ".search-list li", function (e) {
          e.stopPropagation()
      })

  });
  // If we use up key(38) Down key (40) or Enter key(13)
  $(window).on("keydown", function (e) {
      var $current = $(".search-list li.current_item"),
          $next,
          $prev
      if (e.keyCode === 40) {
          $next = $current.next()
          $current.removeClass("current_item")
          $current = $next.addClass("current_item")
      } else if (e.keyCode === 38) {
          $prev = $current.prev()
          $current.removeClass("current_item")
          $current = $prev.addClass("current_item")
      }

      if (e.keyCode === 13 && $(".search-list li.current_item").length > 0) {
          var selected_item = $(".search-list li.current_item a")
          window.location = selected_item.attr("href")
          $(selected_item).trigger("click")
      }
  })

  $(document).ready(function () {
    /**********************************
     *   Form Wizard Step Icon
     **********************************/
    $('.step-icon').each(function () {
      var $this = $(this);
      if ($this.siblings('span.step').length > 0) {
        $this.siblings('span.step').empty();
        $(this).appendTo($(this).siblings('span.step'));
      }
    });
  });

  // Update manual scroller when window is resized
  $(window).resize(function () {
      $.app.menu.manualScroller.updateHeight();

      // We listen to the resize event
      // We execute the same script to get the inner height
      // var vh = window.innerHeight * 0.01;
      // document.documentElement.style.setProperty('--vh', vh + 'px');
  });

})(window, document, jQuery);
