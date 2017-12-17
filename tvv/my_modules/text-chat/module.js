
(function () {
    var module = angular.module('textChat', []);
    module.config(configModule);

    function configModule($stateProvider) {
        $stateProvider
            .state('index',
            {
                url: "/chat",
                views: {
                    "content": {
                        controller: 'TextChatController',
                        templateUrl: 'my_modules/text-chat/text-chat.html'
                    }
                }
            })
            .state('chat',
            {
                url: "/chat/_?id=",
                views: {
                    "content": {
                        controller: 'TextChatController',
                        templateUrl: 'my_modules/text-chat/text-chat.html'
                    }
                }
            });
    }
})();
