
(function () {
    'use strict';
    angular.module('textChat')
        .controller('TextChatController', function ($rootScope, $scope, $compile, $sce, $window, $interval, $timeout, $state, $http) {
            
            $http({
              method: "GET",
              url: "/users/"
              }).success(function (result) {
                  
                  $window.localStorage.setItem('user', result.user_name);
                  $rootScope.user = result.user_name;

              }).error(function (err) {
                console.log("Error: ", err);
              });
                
            $scope.loadChat = function () {
                $.getScript( '/app/my_modules/chat_box/script.js', function( data, textStatus, jqxhr ) {
                } );
            }


            $scope.loadDone = false;
            $scope.disabledVideo = false;
            $scope.disableChat = false;
            window.document.addEventListener('triggerRoomId', function (e) {
                $scope.$apply(function () {
                    $state.go('chat', {id:e.detail.roomId}, {notify:false});
                });
            }, false);
            $scope.call = function () {
                if(!$scope.disabledVideo){
                    var width = $window.screen.width - 150;
                    var left = 75;
                    var height = $window.screen.height - 150;
                    $window.open(BASE_URL + '#/video/_?', '_blank', 'toolbar=0,location=0,menubar=0,width=1290,height=750, left='+left+', top=0');
                    $scope.disabledVideo = true;
                }
            };
            
            $scope.toggleMessage = function(){
                if(!$scope.disableChat){
                    $scope.disableChat = true;
                    var element = angular.element(document.querySelector('.wrap-iframe'));
                    element.css({'display':'block'});
                    element.empty();
                    var html = '<iframe ng-src="{{getSource()}}" id="iframe_mess"></iframe>';
                    var dom = angular.element(html);
                    element.append($compile(dom)($scope));

                    angular.element(document.querySelector('.wrap-actions')).addClass('iframe-added');
                }
            };  
            
            $scope.getSource = function () {
                return $sce.trustAsResourceUrl(BASE_URL+'my_modules/chat_box/index.html');
            };
            $scope.imageBackground = setBackgroundImage();
            $interval(function () {
                // set opacity = 0
                angular.element(document.querySelector(".wrap-image-2 > img")).addClass('opacity-floor').removeClass('opacity-ceil');
                $timeout(function () {
                    $scope.imageBackground = setBackgroundImage();
                },2000);
            },20000);
            function setBackgroundImage() {
                var random = Math.floor(Math.random() * 12) + 1; 
                return BASE_URL + 'images/' + random + '.jpeg' + '?time=' + new Date().getTime();
            }
            
            $scope.$on('$viewContentLoaded',function () {
                $scope.loadDone = true;
            });
        });


    angular.module('textChat').directive('iframeDirective',function ($sce) {
        return {
            restrict:"EA",
            scope:{
                source:'@source',
                height: '@height',
                width: '@width',
                scrolling: '@scrolling'
            },
            template: '<iframe class="frame" height="{{height}}" width="{{width}}" frameborder="0" border="0" marginwidth="0" marginheight="0" scrolling="{{scrolling}}" src="{{source}}"></iframe>',
            link:function (scope, element, attrs) {
                // element.find('iframe').bind('load', function (event) {
                //     event.target.contentWindow.scrollTo(0,400);
                // });
            }
        }
    });

})();
