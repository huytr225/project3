/* CONFIGURE*/
var BASE_URL = location.origin + '/app/';
console.log(BASE_URL);
var app = angular.module('app', [
    'ui.router',
    'ngMaterial',
    'textChat',
    'videoChat'
]);

app.controller('AppController', ['$rootScope',  function ($rootScope) {
}]);

app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider, $locationProvider) {
    // Redirect any unmatched url
    $urlRouterProvider.otherwise("/chat");
}]);
function configureTemplateFactory($provide) {
    // Set a suffix outside the decorator function
    var cacheBuster = Date.now().toString();

    function templateFactoryDecorator($delegate) {
        var fromUrl = angular.bind($delegate, $delegate.fromUrl);
        $delegate.fromUrl = function (url, params) {
            if (url !== null && angular.isDefined(url) && angular.isString(url)) {
                url += (url.indexOf("?") === -1 ? "?" : "&");
                url += "v=" + cacheBuster;
            }
            return fromUrl(url, params);
        };
        return $delegate;
    }
    $provide.decorator('$templateFactory', ['$delegate', templateFactoryDecorator]);
}

app.config(['$provide', configureTemplateFactory]);

app.constant('config',{
    SIGNAL_ID_SERVER_URL:null,
    iceServers:{ 
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
    },
    RTP_DATA_CHANNEL: {optional: [{ RtpDataChannels: true}]}
});

app.run(function($rootScope, $templateCache) {
    $rootScope.$on('$viewContentLoaded', function() {
        $templateCache.removeAll();
        if (!window.RTCPeerConnection || !navigator.getUserMedia) {
            window.alert('WebRTC is not supported by your browser. You can try the app with Chrome and Firefox.');
            return;
        }
    });
});

app.config(["$locationProvider", function($locationProvider) {
    $locationProvider.html5Mode(true);
}]);

app.directive('imageOnload', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            element.bind('load', function() {
                // console.log(1234567890);
               element.addClass('opacity-ceil').removeClass('opacity-floor');
            });
            element.bind('error', function(){
                element.addClass('opacity-floor').removeClass('opacity-ceil');
            });
        }
    };
});

app.directive('script', function() {
    return {
        restrict: 'A',
        scope: false,
        link: function(scope, elem, attr) {
            if (attr.type === 'text/javascript-lazy') {
                var code = elem.text();
                var f = new Function(code);
                f();
            }
        }
    };
});



