var userName = localStorage.getItem('user_name');
var ChatHandler = function () {
    return {
        initChat:function () {
            //define chat color
            // $('.fabs').addClass("amber");
            if (typeof(Storage) !== "undefined") {
                if (localStorage.getItem('fab-color') === null) {
                    localStorage.setItem("fab-color", "amber");
                }
                $('.fabs').addClass(localStorage.getItem("fab-color"));
            } else {
                $('.fabs').addClass("amber");
            }
            //Fab click
            $('#prime').click(function() {
                var element = $('.wrap-actions',parent.document);
                if($(this).hasClass('is-visible')){
                    element.removeClass('iframe-added');
                }else{
                    element.addClass('iframe-added');
                }
                toggleFab();
            });
            //Send input using enter and send key
            $('#chatSend').bind("enterChat", function(e) {
                userSend($('#chatSend').val());
            });
            $('#fab_send').bind("enterChat", function(e) {
                userSend($('#chatSend').val());
            });
            $('#chatSend').keypress(function(event) {
                if (event.keyCode === 13) {
                    event.preventDefault();
                    if (jQuery.trim($('#chatSend').val()) !== '') {
                        $(this).trigger("enterChat");
                    }
                }
            });

            $('#fab_send').click(function(e) {
                if (jQuery.trim($('#chatSend').val()) !== '') {
                    $(this).trigger("enterChat");
                }
            });


            // Color options
            $(".chat_color").click(function(e) {
                $('.fabs').removeClass(localStorage.getItem("fab-color"));
                $('.fabs').addClass($(this).attr('color'));
                localStorage.setItem("fab-color", $(this).attr('color'));
            });

            $('.chat_option').click(function(e) {
                $(this).toggleClass('is-dropped');
            });
            // Ripple effect
            var target, ink, d, x, y;
            $(".fab").click(function(e) {
                target = $(this);
                //create .ink element if it doesn't exist
                if (target.find(".ink").length == 0)
                    target.prepend("<span class='ink'></span>");

                ink = target.find(".ink");
                //incase of quick double clicks stop the previous animation
                ink.removeClass("animate");

                //set size of .ink
                if (!ink.height() && !ink.width()) {
                    //use parent's width or height whichever is larger for the diameter to make a circle which can cover the entire element.
                    d = Math.max(target.outerWidth(), target.outerHeight());
                    ink.css({
                        height: d,
                        width: d
                    });
                }

                //get click coordinates
                //logic = click coordinates relative to page - parent's position relative to page - half of self height/width to make it controllable from the center;
                x = e.pageX - target.offset().left - ink.width() / 2;
                y = e.pageY - target.offset().top - ink.height() / 2;

                //set the position and add class .animate
                ink.css({
                    top: y + 'px',
                    left: x + 'px'
                }).addClass("animate");
            });
        },
        toggleFab: function() {
            toggleFab()
        },
        userSend:function (text) {
            userSend(text)
        },
        anotherSend:function (text,author) {
            anotherSend(text,author);
        },
        loadBeat:function (bool) {
            loadBeat(bool);
        },
        hideChat:function (bool) {
            hideChat(bool);
        }
    };

    //Toggle chat
    function toggleFab(){
        $('.prime').toggleClass('zmdi-plus');
        $('.prime').toggleClass('zmdi-close');
        $('.prime').toggleClass('is-active');
        $('#prime').toggleClass('is-float');
        $('.chat').toggleClass('is-visible');
        $('.fab').toggleClass('is-visible');
    }
    //User msg
    function userSend(text) {
        var img = '<i class="zmdi zmdi-account"></i>';
        $('#chat_converse').append('<div class="chat_msg_item chat_msg_item_user"><div class="chat_avatar">' + img + '</div>' + text + '</div>');
        $('#chatSend').val('');
        if ($('.chat_converse').height() >= 256) {
            $('.chat_converse').addClass('is-max');
        }
        $('.chat_converse').scrollTop($('.chat_converse')[0].scrollHeight);

        // send message
        var mess = {
            name:userName,
            text:text
        };
        MessageRTC.sendMessage(mess);
    }

    //another msg
    function anotherSend(text,author) {
        // console.log(text,author);
        $('#chat_converse').append('<div class="chat_msg_item chat_msg_item_another"><div class="chat_avatar"><i class="zmdi zmdi-headset-mic"></i></div><span>' + text + '</span><div class="author">'+author+'</div></div>');
        if ($('.chat_converse').height() >= 256) {
            $('.chat_converse').addClass('is-max');
        }
        $('.chat_converse').scrollTop($('.chat_converse')[0].scrollHeight);
    }

    //Loader effect
    function loadBeat(beat) {
        beat ? $('.chat_loader').addClass('is-loading') : $('.chat_loader').removeClass('is-loading');
    }


    function hideChat(hide) {
        if (hide) {
            $('.chat_converse').css('display', 'none');
            $('.fab_field').css('display', 'none');
        } else {
            /// add text to chat head
            // $('#chat_head').html(readCookie('fab_chat_username'));
            // Help
            $('.chat_login').css('display', 'none');
            $('.chat_converse').css('display', 'block');
            $('.fab_field').css('display', 'inline-block');
        }
    }
}();

var chat = {
    messageToSend: '',
    init: function() {
      this.cacheDOM();
      this.bindEvents();
      this.render();
    },
    cacheDOM: function() {
      this.$chatHistory = $('.chat-history');
      this.$button = $('button');
      this.$textarea = $('#message-to-send');
      this.$chatHistoryList =  this.$chatHistory.find('ul');
    },
    bindEvents: function() {
      this.$button.on('click', this.addMessage.bind(this));
      this.$textarea.on('keyup', this.addMessageEnter.bind(this));
    },
    render: function() {
      this.scrollToBottom();
      if (this.messageToSend.trim() !== '') {
        var template = Handlebars.compile( $("#message-template").html());
        var context = { 
          messageOutput: this.messageToSend,
          time: this.getCurrentTime()
        };

        this.$chatHistoryList.append(template(context));
        this.scrollToBottom();
        this.$textarea.val('');
        
      }
      
    },
    
    addMessage: function() {
      this.messageToSend = this.$textarea.val()
      this.render();
      // send message
        var mess = {
            name:userName,
            text: this.messageToSend
        };
        console.log(mess);
        MessageRTC.sendMessage(mess);
    },
    anotherSend: function(text, author){
      var templateResponse = Handlebars.compile( $("#message-response-template").html());
      var contextResponse = { 
        response: text,
        time: this.getCurrentTime()
      };
      this.$chatHistoryList.append(templateResponse(contextResponse));
      this.scrollToBottom(); 
      
    },
    addMessageEnter: function(event) {
        // enter was pressed
        if (event.keyCode === 13) {
          this.addMessage();
        }
    },
    scrollToBottom: function() {
       this.$chatHistory.scrollTop(this.$chatHistory[0].scrollHeight);
    },
    getCurrentTime: function() {
      return new Date().toLocaleTimeString().
              replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, "$1$3");
    },
    getRandomItem: function(arr) {
      return arr[Math.floor(Math.random()*arr.length)];
    }
    
};

jQuery(document).ready(function () {
    // console.log("script.js")
    ChatHandler.initChat();
    ChatHandler.toggleFab();
    ChatHandler.loadBeat(false);
    ChatHandler.hideChat(false);
    // chat.init();
    var roomId = gup('id', window.top.location.href);
    MessageRTC.init();
    // console.log("hi")
    if(!roomId){
        var create = MessageRTC.create();
        create.then(function (r,ownerId) {
            // userName = ownerId;
            roomId = r;
            // window.top.history.pushState('','','chat?id='+roomId);
            var myCustomData =  {roomId: r};
            var event = new CustomEvent('triggerRoomId', { detail: myCustomData });
            window.parent.document.dispatchEvent(event)
        });
    }else{
        var join = MessageRTC.join(roomId);
        join.then(function (r,ownerId) {
            // console.log('Joined to room: ', r);
            // userName = ownerId;
        });
    }
});

function gup(name, url){
    if (!url) url = location.href;
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( url );
    return results == null ? null : results[1];
}

$(document).bind('peerMessage',function (ev,dat) {
    var data = dat.data;
    ChatHandler.anotherSend(data['text'] , data['name']);
    chat.anotherSend(data['text'] , data['name']);
});
