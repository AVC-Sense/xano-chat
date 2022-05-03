'use strict';

// TODO
/*
  + check if User is logged in
  + show Profile on top right if Yes
  + show Overlay and Login button if NO
  + add receiver_mail field for Requests tables
  + update API, add paths (Only all request works fine)
  + load all chat list (Need to group chats by sender_email on JS side)
  + show Overlay and Add Contact button if user list is empty (same as for empty filter result after searh on top input)
  - add Click on Overlay to Close it
  + send messages to another User
  + load all messages from another User
  - clear search box after adding a new contact
  - clean all code
  + if sender_email == cred.sender.email, then right chat else - left chat
  + clear input after sending a message
  + fix adding new Contact to Groupped chats
  + check filtering
  + add onHover on the Chat list
  + update DB for wallet addresses and statuses
  + update API for statuses
  - update UI for statuses
  - add check existing contacts
*/

const user_api_url = "https://x8ki-letl-twmt.n7.xano.io/api:yKiPHhYH/users";
var credentials;
var chatList = [];
var chatGroup = [];


function sendChat() {
  var api_url = $("#contact-area")[0].dataset.api_url;
  var message = $(".chat-message-send").val();

  if ((message == "") || message == " ") { return }

  var dataPost = {
    "sender_wallet": credentials.sender_wallet,
    "api_url": api_url,
    "txn_id": message,
    "request": {},
  }

  $.post(api_url + "/request",
    {
      "sender_wallet": dataPost.sender_wallet,
      "api_url": credentials.api_url,
      "txn_id": dataPost.txn_id,
      "request": dataPost.request.toString(),
      "status": "pending"
    }, function (data, status) {
      $.post(credentials.api_url + "/request",
        {
          "sender_wallet": dataPost.sender_wallet,
          "api_url": dataPost.api_url,
          "txn_id": dataPost.txn_id,
          "request": dataPost.request.toString(),
          "status": "pending"
        }, function (data, status) {
          console.log("Status: " + status);
          $(".chat-app-window").scrollTop($(".chat-app-window > .chats").height());
          $(".chat-message-send").val("");
        })

    });
}

function updateStatus(status, messageId) {
  $.post(credentials.api_url + "/request/" + messageId,
    {
      "status": status
    }, function (data, statusRequest) {
      console.log("Status: " + statusRequest);
      $('*[data-message_id="' + messageId + '"] .chat-content').addClass(status);
      $('*[data-message_id="' + messageId + '"] .dropdown').hide();
    })
}

function postChat(message, incoming, status, messageId) {
  var chat =
    `<div class="chat ${incoming ? "chat-left" : ""} ${(incoming && status != "cancelled" && status != "done") ? `" data-message_id='${messageId}'>
      <div class="chat-avatar">
        <div class="avatar avatar-md">
          <div class="btn-group dropdown mr-1">
            <button type="button" class="btn btn-sm dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"></button>
            <div class="dropdown-menu">
              <a class="dropdown-item done" href="javascript:updateStatus('done', ${messageId});">done</a>
              <a class="dropdown-item cancelled" href="javascript:updateStatus('cancelled', ${messageId});">cancelled</a>
            </div>
          </div>
        </div>
      </div> ` : `">`}
    <div class="chat-body">
      <div class="chat-content ${status}">
        <p style="float:left;">${message}</p>
      </div>
    </div>
  </div>`;
  $(".chat-app-window .chats").append(chat);
}

(function (window, undefined) {

  var cred = sessionStorage.getItem("credentials");
  credentials = JSON.parse(cred);

  // Button handlers
  $(".content-overlay .add-contact").click(function () {
    $(".wrapper").removeClass("show-overlay")
  });

  $("#add_user_btn").click(function () {
    var userChat =
      [$("#api_url").val(), [{
        api_url: $("#api_url").val(),
        sender_wallet: $("#sender_wallet").val(),
        created_at: "",
        txn_id: ""
      }]]


    chatGroup = chatGroup ?? [];
    const data = [userChat].concat(chatGroup);
    fillUserList(data);
    $("#timesheetinput1").value = "";
    chatList = data;
    chatGroup = data;
  });

  $("#btnSendMessage").on("click", function (e) {
    console.log("Send message..")
    sendChat();
  })

  $("#timesheetinput1").on("keyup", function (e) {
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

      var data = chatGroup.filter(chat => chat[1].filter(message => message.sender_wallet.includes(value)).length > 0);
      fillUserList(data);
      if (data.length > 0) {
        $(".wrapper").removeClass("show-overlay")
      }
    }
  })

  // Add class on hover of the list
  $(document).on("mouseenter", ".list-group-item", function (e) {
    $(this).addClass("hovered-chat")
  })

  // Add class on hover of the list
  $(document).on("mouseleave", ".list-group-item", function (e) {
    $(this).removeClass("hovered-chat")
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

    var userChat;

    if (data.length == 0) {
      console.log("Empty data");
    }

    for (var i = 0; i < data.length; i++) {

      if (a < 10) {
        if (a === 0) {
          $activeItemClass = "current_item"
        } else {
          $activeItemClass = ""
        }

        var userChat = data[i];
        var url = userChat[0];
        var messages = userChat[1];
        var lastMessage;

        messages.sort((a, b) => b.created_at - a.created_at)
        lastMessage = messages.slice(0, 1)[0];

        var date = new Date(lastMessage.created_at)


        $startList +=
          `<a class="list-group-item" data-api_url='${lastMessage.api_url}' data-contact_title='${lastMessage.sender_wallet}'>
                            <div class="media align-items-center py-1">
                              <span class="avatar avatar-md mr-2">
                                <img src="app-assets/img/portrait/small/avatar.png" alt="Avatar">
                                <span class="avatar-status-online"></span>
                              </span>
                              <div class="media-body">
                                <h6 class="list-group-item-heading mb-1">"${lastMessage.sender_wallet}"
                                    <span class="font-small-2 float-right grey darken-1">"${date.getDate() + "/" + date.getMonth() + "/" + date.getFullYear()}"</span>
                                </h6>
                                <p class="list-group-item-text grey darken-2 m-0">
                                    <i class="ft-check primary font-small-2 mr-1"></i><span>"${lastMessage.txn_id}"</span>
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

    // $(".list-group-item").click("on", function () {
    //   selectChat(this);
    // });


    $(".list-group-item").click("on", function () {
      $("#users-list .users-list-padding .list-group-item").removeClass("selected-chat")
      $(this).addClass("selected-chat")
      selectChat(this.dataset.api_url, this.dataset.contact_title);
    });
  }

  function fillChat(messages) {
    var incoming = true;
    $.each(messages, function (index, obj) {
      incoming = obj.sender_wallet != credentials.sender_wallet;
      postChat(obj.txn_id, incoming, obj.status, obj.id)
    })
  }

  // Add message to chat
  // function postMessage(message, incoming) {
  //   if ((message != "") && message != " ") {
  //     var html = '<div class="chat-content">' + "<p>" + message + "</p>" + "</div>";
  //     $(".chat-app-window .chat:last-child .chat-body").append(html);
  //     $(".chat-message-send").val("");
  //     $(".chat-app-window").scrollTop($(".chat-app-window > .chats").height());
  //   }
  // }

  function selectChat(api_url, title) {

    $("#contact-area .contact-title").text(api_url)
    $("#contact-area").attr("data-api_url", api_url)
    //var api_url;

    //var chat = Object.entries(chatList);
    var chat = chatGroup.filter(chat => chat[0] == api_url)[0]

    var messages = chat[1]
    messages.sort((a, b) => a.created_at - b.created_at)
    $(".chat-app-window .chats").empty();

    fillChat(messages)

  }




  //  Start function code

  // Check login and credentials
  if (!cred || !credentials || !credentials.sender_wallet || !credentials.api_url) {
    $(".main-wrapper").addClass("show-blocker");
    $("#btn_login").show();
    $("#user_bar").hide();
    return;
  }
  else {
    $("#user-title").text(credentials.sender_wallet);
    $("#btn_login").hide();
    $("#user_bar").show();
  }

  console.log("Loading chat list..");

  $.get(credentials.api_url + "/request", function (chats) {

    if (!chats || chats.length == 0) {
      $(".wrapper").addClass("show-overlay")
      return;
    }

    console.log(chats);
    var i = 0;



    // // Grouping by interlocutor
    // var data = chatList.reduce((chat, message) => {
    //   const email = message.sender_email == credentials.sender_mail ? message.receiver_email : message.sender_email;
    //   chat[email] = chat[email] ?? [];
    //   chat[email].push(message);
    //   return chat;
    // }, {});

    // Grouping by interlocutor
    chatList = chats.reduce((chat, message) => {
      const api_url = message.api_url
      chat[api_url] = chat[api_url] ?? [];
      chat[api_url].push(message);
      return chat;
    }, []);

    var data = Object.entries(chatList);
    chatGroup = data;

    // Fill chat list
    fillUserList(data);

    $(".list-group-item").click("on", function () {
      $("#users-list .users-list-padding .list-group-item").removeClass("selected-chat")
      $(this).addClass("selected-chat")
      selectChat(this.dataset.api_url, this.dataset.contact_title);
    });

  });

})(window);