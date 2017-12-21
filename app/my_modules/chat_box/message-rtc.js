console.log(0)
var MessageRTC = function () {
    'use strict';

    var SERVER_URL = null;
    var configuration = {
        'iceServers': [
            {urls: 'stun:stun.l.google.com:19302'},
            {
                urls: 'turn:numb.viagenie.ca',
                credential: 'muazkh',
                username: 'webrtc@live.com'
            },
            {
                urls: 'turn:192.158.29.39:3478?transport=udp',
                credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                username: '28224511:1379330808'
            },
            {
                urls: 'turn:192.158.29.39:3478?transport=tcp',
                credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
                username: '28224511:1379330808'
            }
        ]
    };

    var offerOptions= null;
    var connected = false,
        peerConnections = [];
    var roomId,ownerId;

    var user_name = localStorage.getItem('user_name');

    var socket = io.connect(SERVER_URL);
    return {
        init:init,
        create:create,
        join:join,
        leave:leave,
        sendMessage:sendMessage
    };
    function init() {
        //// messages've sended to server
        function send(message) {
            socket.emit('message', message);
        }
        function getPeerConnection(id) {
            var peer = peerConnections.filter(function (obj) {
                return obj.id == id;
            })[0];
            if (peer) {
                return peer['pc'];
            }
            var pc = new RTCPeerConnection(configuration);
            //creating data channel
            var tempDataChannel = pc.createDataChannel("channel");
            tempDataChannel.onerror = function (error) {
                logError(error);
            };

            tempDataChannel.onclose = function () {
                // console.log("data channel is closed");
            };
            peerConnections.push({id:id, pc:pc, dataChannel:tempDataChannel});
            pc.onicecandidate = function (event) {
                if(event.candidate){
                    send({ by: ownerId, to: id, candidate: event.candidate, type: 'ice-candidate' })
                }
            };
            /***********/
            pc.ondatachannel = function (event) {
                event.channel.onmessage = function(ev){
                    // console.log('got message:',ev);
                    // $rootScope.$broadcast('peer.message',ev.data);
                    // var event = $.Event('peerMessage');
                    // event.data = ev.data;
                    // $('body').trigger(event);
                    $.event.trigger('peerMessage',[{data:JSON.parse(ev.data)}]);
                }
            };
            /***********/
            return pc;
        }
        function makeOffer(id) {
            var pc = getPeerConnection(id);
            pc.createOffer(offerOptions).then(function (sdp) {
                // console.log('local session created:', sdp);
                pc.setLocalDescription(sdp, function () {
                    // console.log('sending local desc:', pc.localDescription);
                    send({ by: ownerId, to: id, sdp: sdp, type: 'sdp-offer' });
                }, logError);
            }, logError);
        }
        function handleMessage(data) {
            var pc = getPeerConnection(data.by);
            switch (data.type) {
                case 'sdp-offer':
                    // console.log('Got offer. Sending answer to peer.', data.by);
                    pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
                        },
                        logError);
                    pc.createAnswer(function (sdp) {
                        // console.log('local session created:');
                        pc.setLocalDescription(sdp, function () {
                            // console.log('sending local desc:');
                            send({ by: ownerId, to: data.by, sdp: sdp, type: 'sdp-answer' });
                        }, logError);
                    }, logError);
                    break;
                case 'sdp-answer':
                    // console.log('Got answer.');
                    pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
                            // console.log('Setting remote description by answer');
                        },
                        logError);
                    break;
                case 'ice-candidate':
                    if (data.candidate) {
                        // console.log('Adding ice candidates');
                        pc.addIceCandidate(new RTCIceCandidate(data.candidate));
                    }
                    break;
            }
        }
        function addHandlers(socket) {
            socket.on('peer.connected', function (params) {
                makeOffer(params.id);
            });
            socket.on('peer.disconnected', function (data) {
                // $rootScope.$broadcast('peer.leaved', data);
                // console.log("I'm leaving", data);
            });
            socket.on('message', function (data) {
                handleMessage(data);
            });
        }

        function logError(error) {
            // console.log('ERROR:', error.toString());
        }
        addHandlers(socket);
    }
    function create() {
        var d = $.Deferred();
        socket.emit('init', {user_name:user_name}, function (r, id) {
            d.resolve(r,id);
            roomId = r;
            ownerId =id;
            connected = true;
        });
        return d.promise();
    }
    function join(room) {
        var deferred = $.Deferred();
        if(!connected){
            socket.emit('init', {room:room,user_name:user_name}, function (r, id) {
                roomId = r;
                ownerId =id;
                connected = true;
                deferred.resolve(r,id);
            });
        }
        return deferred.promise();
    }
    function leave() {
        socket.emit('leaved',{room:roomId, id:ownerId});
    }
    function sendMessage(mes) {
        mes = JSON.stringify(mes);
        peerConnections.forEach(function(item){
            item.dataChannel.send(mes);
        });
    }

}();


