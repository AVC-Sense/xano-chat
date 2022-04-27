'use strict';

// TODO
/*
  + check if User is logged in
  + show Profile on top right if Yes
  + show Overlay and Login button if NO
  + add receiver_mail field for Requests tables
  + update API, add paths (Only all request works fine)
  - load all chat list (Need to group chats by sender_email on JS side)
  + show Overlay and Add Contact button if user list is empty (same as for empty filter result after searh on top input)
  - add Click on Overlay to Close it
  - send messages to another User
  - load all messages from another User
  - clear search box after adding a new contact
  - clean all code
  - if sender_email == cred.sender.email, then right chat else - left chat
*/

const user_api_url = "https://x8ki-letl-twmt.n7.xano.io/api:yKiPHhYH/users";
const chat_api_url = "https://x8ki-letl-twmt.n7.xano.io/api:9tWaOBw7/getAllRequests";
//const chat_api_url = "https://x8ki-letl-twmt.n7.xano.io/api:ZHMh-f15/getAllRequests";
var credentials;

function chatMessagesSend(){
  console.log("!chatMessagesSend")
  var api_url = $("#contact-area")[0].dataset.api_url + "/addRequest";

  var message = $(".chat-message-send").val();
  var email = $("#contact-area .contact-title").text()

  var dataPost = {
    "sender_email": credentials.sender_mail,
    "txn_id": message,
    "request": "test",
    "receiver_email": email
  }

  console.log(dataPost)

  $.post(api_url, dataPost, function(data, status) {
    console.log("URL: " + api_url);
    console.log("Data: " + data);
    console.log("Status: " + status);

    postChat(message, false)
    $(".chat-message-send").text();

    $.post(credentials.api_url + "/addRequest", dataPost, function(data, status) {
      console.log("URL: " + credentials.api_url);
      console.log("Data: " + data);
      console.log("Status: " + status);

    })

  });

}

function postChat(message, incoming) {
  var chat = 
  `<div class="chat ${incoming?"chat-left":""}">
    <!-- <div class="chat-avatar">
      <div class="avatar avatar-md">
       <img src="app-assets/img/portrait/small/avatar.png" alt="avatar">
      </div>
    </div> -->
    <div class="chat-body">
      <div class="chat-content">
       <p>${message}</p>
      </div>
    </div>
  </div>`;
  $(".chat-app-window .chats").append(chat);
}

(function (window, undefined) {

  var cred = sessionStorage.getItem("credentials");
  credentials = JSON.parse(cred);

  if (!cred || !credentials || !credentials.sender_mail || !credentials.api_url) {
    $(".main-wrapper").addClass("show-blocker");
    $("#btn_login").show();
    $("#user_bar").hide();
  }

  $("#user-title").text(credentials.sender_mail);
  $("#btn_login").hide();
  $("#user_bar").show();

  var userList;
  var chatList;

  // Buttons 
  $(".content-overlay .add-contact").click(function () {
    $(".wrapper").removeClass("show-overlay")
  });

  $("#add_user_btn").click(function () {
    var newUser = {
      sender_email: $("#sender_mail").val(),
      api_url: $("#api_url").val(),
      api_secret: $("#api_secret").val()
    }
    const data = [newUser].concat(chatList);
    fillUserList(data);
    $("#timesheetinput1").value = "";
    chatList = data;
  });

  console.log("Loading chat list..");

  $.get(credentials.api_url + "/getAllRequests", function (chats) {
    chatList = chats;
    console.log(chats);

    if(!chats || chats.length == 0) {      
      $(".wrapper").addClass("show-overlay")
      return;
    }

    $.each(chats, function (index, obj) {
      $("#users-list div.users-list-padding").append(
        `<a class="list-group-item" data-email='${obj.sender_email}' data-api_url='${obj.api_url}'>
          <div class="media align-items-center py-1">
            <span class="avatar avatar-md mr-2">
              <img src="app-assets/img/portrait/small/avatar.png" alt="Avatar">
              <span class="avatar-status-online"></span>
            </span>
            <div class="media-body">
                <h6 class="list-group-item-heading mb-1">"${obj.sender_email.toString().substring(0, 20)}"
                    <span class="font-small-2 float-right grey darken-1">"${obj.created_at}"</span>
                </h6>
                <p class="list-group-item-text grey darken-2 m-0">
                    <i class="ft-check primary font-small-2 mr-1"></i><span>"${obj.txn_id.toString().substring(0, 20)}"</span>
                    <span class="float-right primary"><i class="font-medium-1 icon-pin"></i></span>
                </p>
            </div>
          </div>
        </a>`
      );
    })

    $(".list-group-item").click("on", function () {      
      $(this).addClass("selected-chat")
      selectChat(this.dataset.email);
    });
  });

  // Filter
  $("#timesheetinput1").on("keyup", function (e) {
    console.log("Check!");
    if (e.keyCode !== 38 && e.keyCode !== 40 && e.keyCode !== 13) {
      if (e.keyCode == 27) {
        $("#timesheetinput1").val("")
        $(".wrapper").removeClass("show-overlay")
      }

      // Define variables
      var value = $(this)
        .val()
        .toLowerCase(), //get values of inout on keyup
        activeClass = "",
        liList = $("ul.search-list li") // get all the list items of the search
      liList.remove()

      // If input value is blank
      //if (value != "") {
      $(".wrapper").addClass("show-overlay")

      console.log(value);

      var data = chatList.filter(user => user.sender_email.includes(value));
      fillUserList(data);
      if (data.length > 0) {
        $(".wrapper").removeClass("show-overlay")
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

  // Fill user list after data filter apply
  function fillUserList(data) {

    var $startList = "",
      $otherList = "",
      $htmlList = "",
      $activeItemClass = "",
      a = 0

    if (data.length == 0) {
      console.log("Empty data");
    }

    for (var i = 0; i < data.length; i++) {

      // Search list item start with entered letters and create list
      if (
        // data[i].sender_mail.toLowerCase().indexOf(value) == 0 &&
        // a < 10 || !(data[i].sender_mail.toLowerCase().indexOf(value) == 0) &&
        // data[i].sender_mail.toLowerCase().indexOf(value) > -1 &&
        a < 10
      ) {
        if (a === 0) {
          $activeItemClass = "current_item"
        } else {
          $activeItemClass = ""
        }
        $startList +=
          `<a class="list-group-item" data-email='${data[i].sender_email}' data-api_url='${data[i].api_url}'>
                            <div class="media align-items-center py-1">
                              <span class="avatar avatar-md mr-2">
                                <img src="app-assets/img/portrait/small/avatar.png" alt="Avatar">
                                <span class="avatar-status-online"></span>
                              </span>
                              <div class="media-body">
                                <h6 class="list-group-item-heading mb-1">"${data[i].sender_email}"
                                    <span class="font-small-2 float-right grey darken-1">"${data[i].created_at}"</span>
                                </h6>
                                <p class="list-group-item-text grey darken-2 m-0">
                                    <i class="ft-check primary font-small-2 mr-1"></i><span>"${data[i].txn_id}"</span>
                                    <span class="float-right primary"><i class="font-medium-1 icon-pin"></i></span>
                                </p>
                              </div>
                            </div>
                          </a>`
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

    $htmlList = $startList.concat($otherList)
    $("#users-list div.users-list-padding").html($htmlList)
    $(".list-group-item").click("on", function () {
      selectChat(this);
    });
  }

  function fillChat(messages) {    
    $(".chat-app-window .chats").empty();
    console.log("Fill the Chat with messages:")
    console.log(messages)
    var incoming = true;
    $.each(messages, function(index, obj) {
      incoming =  !obj.receiver_email || obj.receiver_email == "";
      postChat(obj.txn_id, incoming)
    })
  }

  // Add message to chat
function postMessage(message, incoming) {
  if ((message != "") && message != " ") {
    var html = '<div class="chat-content">' + "<p>" + message + "</p>" + "</div>";
    $(".chat-app-window .chat:last-child .chat-body").append(html);
    $(".chat-message-send").val("");
    $(".chat-app-window").scrollTop($(".chat-app-window > .chats").height());
  }
}

function selectChat(email){
  console.log($("#contact-area .contact-title").text());
  console.log(email)
  $("#contact-area .contact-title").text(email)
  var api_url;

  $.get(user_api_url, function (users) {
    console.log(users)
    var api = users.filter(user => user.sender_mail == email)[0].api_url;
    console.log("API URL:")
    console.log(api)
    $("#contact-area").attr("data-api_url", api)
  })


  $("#users-list .users-list-padding .list-group-item").removeClass("selected-chat")
  var data = chatList.filter(message => message.sender_email == email || message.receiver_email == email)
  fillChat(data)

}

function test(data){
  console.log(data)
}

})(window);