'use strict';

(function(window, undefined) {

  $("#btn_login").click(function() {

    var dataPost = {
      "sender_wallet": $("#sender_wallet").val(),
      "api_url": $("#api_url").val(),
      "api_secret": $("#api_secret").val()
    };
    sessionStorage.setItem('credentials', JSON.stringify(dataPost));
    window.location.href = "app-chat.html";
    
  });

})(window);