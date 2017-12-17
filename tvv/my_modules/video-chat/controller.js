var user_name = localStorage.getItem('user_name');
(function () {
    'use strict';
    angular.module('videoChat')
        .controller('VideoChatController', function ($rootScope, $scope,$compile,$sce, $mdSidenav,$mdToast,$state,UserMedia,Room, $window, $mdDialog, $location) {
            $scope.loadDone = false;
            $scope.toggleLeft = function(){
                if($mdSidenav('left').isOpen() == false){
                    angular.element(document.querySelector('.wrap-videos')).addClass('show-mes-box');
                }else{
                    angular.element(document.querySelector('.wrap-videos')).removeClass('show-mes-box');
                }
                return $mdSidenav('left').toggle();
            };
            var localStream;
            var ownerId;
            var getMedia = UserMedia.get();
            $scope.largeStream = {
                id:null,
                name:'owner',
                src:null
            };
            getMedia.then(function (s) {
                localStream = s;
                $scope.largeStream.src = s;
                startConnect();
            },function (error) {
                $state.go('chat');
                console.log('Error get user media :', error.toString());
            });
            // connect to peers
            function startConnect() {
                Room.init(localStream);
                if(!$state.params.id){
                    var create = Room.create();
                    create.then(function (dat) {
                        ownerId = dat.id;
                        $scope.largeStream.id = ownerId;
                        console.log('create room: ',dat);

                        $state.go('videoChat',{id:dat.room}, {notify:false});
                    });
                }else{
                    var join = Room.join($state.params.id);
                    join.then(function (dat) {
                        ownerId = dat.id;
                        $scope.largeStream.id = ownerId;
                        console.log('Joined to room: ', dat);
                    });
                }
            }
            
            // add remote stream
            $scope.remoteStreams = [];
            $scope.$on('peer.stream', function (event ,data) {
                $scope.$apply(function () {
                    if($scope.remoteStreams.length == 0){
                        $scope.remoteStreams.push({
                            id:ownerId,
                            name:'owner',
                            src:localStream
                        });
                    }
                    $scope.remoteStreams.push({
                        id:data.id,
                        name:data.user_name,
                        src:data.stream
                    });
                });
            });
            
            // add a new message
            $scope.sendedText = '';
            $scope.sendMessage = function () {
                if($scope.sendedText){
                    var sendedText = angular.copy($scope.sendedText);
                    var html = '<span class="chat_msg_item chat_msg_item_user"><div class="chat_avatar"><i class="material-icons">person</i></div><span>'+sendedText+'</span></span>';
                    var chatEle = angular.element(document.querySelector('#chatarea'));
                    chatEle.append(angular.element(html));
                    chatEle[0].scrollTop = chatEle[0].scrollHeight;
                    var mess = {
                        name:user_name,
                        text:sendedText
                    };
                    $scope.sendedText = '';
                    Room.sendMessage(mess);
                }
            };
            // got message
            $scope.$on('peer.message', function (event ,data) {
                // console.log('GOT MESSAGE FROM ROOM SERVICE', angular.fromJson(data));
                var mess = angular.fromJson(data);
                var html = '<span class="chat_msg_item chat_msg_item_another"><div class="chat_avatar"><i class="material-icons">person</i></div><span>';
                html += mess.text + '</span><div class="author">';
                html += mess.name + '</div></span>';
                var chatEle = angular.element(document.querySelector('#chatarea'));
                chatEle.append(angular.element(html));
                chatEle[0].scrollTop = chatEle[0].scrollHeight;
            });
            
            // change large video
            $scope.videoBordered = 0;
            $scope.funcVideoBordered = function () {
                return $scope.videoBordered;
            };
            $scope.clickSmallVideo = function (index) {
                $scope.videoBordered = index;
                // $scope.largeStream = $scope.remoteStreams[index].src;
                $scope.largeStream = $scope.remoteStreams[index];
            };
            
            //end dialog
            $scope.endCall = function () {
                localStream.getVideoTracks()[0].stop();
                localStream.getAudioTracks()[0].stop();
                $window.close();
                $state.go('index',{},{reload:true});
            };
            
            $scope.typeCamera = 'videocam';
            $scope.chooseCam = function () {
                // console.log($scope.remoteStreams[0].src);
                if($scope.remoteStreams.length > 0){
                    if($scope.remoteStreams[0].src['id'] == $scope.largeStream['id']){
                    }
                }
                if($scope.typeCamera == 'videocam'){
                    $scope.typeCamera = 'videocam_off';
                    // $scope.largeStream.getVideoTracks()[0].enabled = false;
                    localStream.getVideoTracks()[0].enabled = false;
                }else{
                    $scope.typeCamera = 'videocam';
                    localStream.getVideoTracks()[0].enabled = true;
                }
            };
            
            $scope.typeMic = 'mic';
            $scope.chooseMic = function () {
                if($scope.typeMic == 'mic'){
                    $scope.typeMic = 'mic_off';
                    // $scope.largeStream.getAudioTracks()[0].enabled = false;
                    localStream.getAudioTracks()[0].enabled = false;
                }else{
                    $scope.typeMic = 'mic';
                    localStream.getAudioTracks()[0].enabled = true;
                }
            };
            
            $scope.inviteSomeone = function () {
                var currentUrl = $state.href($state.current.name, {}, {absolute: true});
                var copyElement = document.createElement("textarea");
                copyElement.style.position = 'fixed';
                copyElement.style.opacity = '0';
                copyElement.textContent = currentUrl;
                var body = document.getElementsByTagName('body')[0];
                body.appendChild(copyElement);
                copyElement.select();
                document.execCommand('copy');
                body.removeChild(copyElement);
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('Copied url to clipboard!')
                        .position('top right')
                        .action('OK')
                        .hideDelay(2000)
                );
            };
            
            // a peer left
            $scope.$on('peer.leaved',function (ev,data) {
                $scope.$apply(function () {
                    var i;
                     for(i=0; i < $scope.remoteStreams.length; i++){
                         // console.log($scope.remoteStreams[i].id,data.id);
                         if($scope.remoteStreams[i].id == data.id){
                             $scope.remoteStreams.splice(i,1);
                             break;
                         }
                     }
                });
                $mdToast.show(
                    $mdToast.simple()
                        .textContent('A peer left is ' + data.user_name)
                        .position('top right')
                        .action('OK')
                        .hideDelay(2000)
                );
            });
            $scope.loadDone = true;
        });
    
    
    angular.module('videoChat').directive('videoStream', function () {
        return{
            template: '<div class="video-media-container"></div>',
            restrict:'EA',
            replace: true,
            scope: {
                media: '=',
                name:'=',
                sourceId:'=sourceId',
                isMute:'@isMute',
                isSmall:'@isSmall'
            },
            link:function (scope, element, attrs) {
                scope.isMute = false;
                scope.$watch('media', function (newVal, oldVal) {
                    if(newVal){
                        console.log('directive video stream get media: ',newVal);
                        var video = document.createElement('video');
                        video.autoplay = true;
                        video.srcObject = newVal;
                        if(parseInt(scope.isMute) == 1){
                            video.muted = true;
                        }
                        if(scope.name == 'owner'){
                            video.volume = 0;
                            video.muted = true;
                        }
                        element.empty();
                        element.append(video);
                        // if(scope.isSmall == 1){
                        //     var html = '<div id="'+scope.sourceId+'"><span class="user-name"> This is '+scope.name+'</span></div>';
                        //     element.append(angular.element(html));
                        // }
                    }
                });
            }
        }
    });
    angular.module('videoChat').directive('textChat', function () {
        return{
            restrict:'EA',
            scope:{
                sender:'=',
                text:'=',
                name:'='
            },
            link:function (scope, element, attrs) {
                if(scope.text){
                    var html = '';
                    if(scope.sender == 'me'){
                        html = "<div class='wrap-a-mess'><div class='clearfix'><p class='me md-whiteframe-4dp'>"+scope.text+"</p></div></div>";
                    }else{
                        html = "<div class='wrap-a-mess'><h5>"+(scope.name?scope.name:'')+"</h5><div class='clearfix'><p class='other md-whiteframe-4dp'>"+scope.text+"</p></div></div>";
                    }
                    element.append(html);
                }
            }
        }
    });
    
})();
