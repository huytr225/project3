(function () {
    var module = angular.module('videoChat', []);
    module.config(configModule);

    function configModule($stateProvider) {
        $stateProvider.state('videoChat',
            {
                url: "/video/_?id=",
                cache: false,
                views: {
                    "content": {
                        controller: 'VideoChatController',
                        templateUrl: 'my_modules/video-chat/video-chat.html'
                    }
                }
            });
    }
})();
