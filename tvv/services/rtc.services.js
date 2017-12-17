(function () {
    app.factory('UserMedia', function ($q) {
        var shared_webcam = {
            width: {exact: 640},
            height: {exact: 480}
        };
        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        var constraints = window.constraints = {
            audio: true,
            video: shared_webcam
        };
        return{
            get:get
        };
        function get() {
            var deferred = $q.defer();
            navigator.getUserMedia(constraints,
                function (stream) {
                    deferred.resolve(stream, constraints);
                },
                function (error) {
                    deferred.reject(error);
                });
            return deferred.promise;
        }
    });

    app.factory('Io', function () {
        if (typeof io === 'undefined') {
            throw new Error('Socket.io required');
        }
        return io;
    });

    app.factory('Room', function ($rootScope,$q, Io, config,$filter) {
        var offerOptions = {
            offerToReceiveAudio: 1,
            offerToReceiveVideo: 1
        };
        var stream, connected, roomId, ownerId;
        var peerConnections = [];
        var user_name = localStorage.getItem('user_name');
        var api = {
            init:init,
            create:create,
            join:join,
            leave:leave,
            sendMessage:sendMessage
        };

        var socket = Io.connect(config.SIGNALIG_SERVER_URL);
        connected = false;

        /***********BEGIN API**************/
        function init(s) {
            stream = s;
        }
        function create() {
            var deferred = $q.defer();
            socket.emit('init', {user_name:user_name}, function (r, id) {
                deferred.resolve({room:r, id:id});
                roomId = r;
                ownerId =id;
                connected = true;
            });
            return deferred.promise;
        }
        function join(room) {
            var deferred = $q.defer();
            if(!connected){
                socket.emit('init', {room:room, user_name:user_name}, function (r, id) {
                    deferred.resolve({room:r, id:id});
                    roomId = r;
                    ownerId =id;
                    connected = true;
                });
            }
            return deferred.promise;
        }
        function leave() {
            socket.emit('leaved',{room:roomId, id:ownerId, user_name:user_name});
        }
        // send messsage directly to other in group
        function sendMessage(mess) {
            mess = angular.toJson(mess);
            peerConnections.forEach(function(item){
                item.dataChannel.send(mess);
            });
        }

        /***********END API**************/
        //// messages've sended to server
        function send(message) {
            socket.emit('message', message);
        }
        function getPeerConnection(id, another_name) {
            // console.log("another_nameanother_nameanother_nameanother_nameanother_name",another_name);
            var peer = $filter("filter")(peerConnections, {id:id})[0];
            if (peer) {
                return peer['pc'];
            }
            // var pc = new RTCPeerConnection(config.CONFIG);

            // var tempDataChannel = pc.createDataChannel("channel");
            var pc = new RTCPeerConnection(config.iceServers,{});
            var tempDataChannel = pc.createDataChannel("channel", {});
            tempDataChannel.onerror = function (error) {
                // console.log("Ooops...error on DATA CHANNEL:", error);
            };

            tempDataChannel.onclose = function () {
                // console.log("data channel is closed");
            };
            peerConnections.push({id:id, pc:pc, dataChannel:tempDataChannel});
            pc.addStream(stream);
            pc.onicecandidate = function (event) {
                if(event.candidate){
                   send({ by: ownerId, to: id, candidate: event.candidate, type: 'ice-candidate', user_name:user_name})
                }
            };
            /***********/
            pc.onaddstream = function (event) {
                // console.log('Received new stream');
                $rootScope.$broadcast('peer.stream',{
                    user_name:another_name,
                    id: id,
                    stream: event.stream
                });
            };
            pc.ondatachannel = function (event) {
                event.channel.onmessage = function(event){
                    // console.log('got message:',event);
                    $rootScope.$broadcast('peer.message',event.data);
                }
            };
            /***********/
            return pc;
        }


        function makeOffer(id, another_name) {
            var pc = getPeerConnection(id, another_name);
            pc.createOffer(offerOptions).then(function (sdp) {
                // console.log('local session created:', sdp);
                pc.setLocalDescription(sdp, function () {
                    // console.log('sending local desc:', pc.localDescription.sdp);
                    send({ by: ownerId, to: id, sdp: sdp, type: 'sdp-offer', user_name:user_name});
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
                            // console.log('sending local desc: ', sdp.sdp);
                            send({ by: ownerId, to: data.by, sdp: sdp, type: 'sdp-answer', user_name:user_name});
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
                makeOffer(params.id, params.user_name);
            });
            socket.on('peer.disconnected', function (data) {
                $rootScope.$broadcast('peer.leaved', data);
            });
            socket.on('message', function (data) {
                handleMessage(data);
            });
        }
        function logError(error) {
            // console.log('ERROR:', error.toString());
        }
        addHandlers(socket);
        return api;
    });
})();
