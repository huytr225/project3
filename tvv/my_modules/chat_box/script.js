var userName = localStorage.getItem('user_name');

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
    chat.init();
    
    
    var roomId = gup('id', window.top.location.href);
    MessageRTC.init();
    // console.log(window.top.history);
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

 $(document).bind('peerMessage',function (ev,dat) {
    var data = dat.data;
    console.log(dat, ev);

    chat.anotherSend(data['text'] , data['name']);
});

function function_name(dat) {
    var data = dat.data;

    chat.anotherSend(data['text'] , data['name']);
}

function gup(name, url){
    if (!url) url = location.href;
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( url );
    return results == null ? null : results[1];
}

