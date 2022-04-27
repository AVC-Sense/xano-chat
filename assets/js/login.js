'use strict';
const user_api_url = "https://x8ki-letl-twmt.n7.xano.io/api:yKiPHhYH/users";

(function(window, undefined) {

  $("#btn_login").click(function() {

    var dataPost = {
      "sender_mail": $("#sender_mail").val(),
      "api_url": $("#api_url").val(),
      "api_secret": $("#api_secret").val()
    };
    console.log("click");
    $.post(user_api_url, dataPost, function(data, status) {
      console.log("Data: " + data);
      console.log("Status: " + status);
      sessionStorage.setItem('credentials', JSON.stringify(dataPost));
      window.location.href = "app-chat.html";
    });

  });

})(window);