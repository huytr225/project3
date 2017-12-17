module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                mangle: false
            },
            my_target: {
                files: {
                    'app/build/js/lib.js': [
                        'app/lib/adapter.js',
                        'node_modules/angular/angular.min.js',
                        'node_modules/angular-ui-router/release/angular-ui-router.min.js',
                        'node_modules/angular-aria/angular-aria.js',
                        'node_modules/angular-animate/angular-animate.js',
                        'node_modules/angular-material/angular-material.js',
                        'node_modules/socket.io-client/dist/socket.io.min.js'
                    ],
                    'app/build/js/app.js': [
                        'app/main.js',
                        'app/services/rtc.services.js',
                        'app/my_modules/text-chat/module.js',
                        'app/my_modules/video-chat/module.js',
                        'app/my_modules/text-chat/controller.js',
                        'app/my_modules/video-chat/controller.js'
                    ],
                    'app/build/js/iframe-chatbox.js':[
                        'app/lib/jquery.min.js',
                        'app/lib/adapter.js',
                        'node_modules/socket.io-client/dist/socket.io.min.js',
                        'app/my_modules/chat_box/message-rtc.js',
                        'app/my_modules/chat_box/script.js'
                       
                    ]
                }
            }
        },
        concat:{
            basic_and_extras: {
                files: {
                    'app/build/js/main-script.js': ['app/build/js/lib.js', 'app/build/js/app.js']
                }
            }
        },
        htmlmin: {                                   
            dist: {                                    
                options: {                                 
                    removeComments: true,
                }
            },
            dev: {                                       // Another target
                files: [{
                    expand: true,
                    cwd: 'app',
                    src: ['my_modules/**/*.html'],
                    dest: 'app/build'
                }]
            }
        },
        cssmin:{
            build:{
                files:[{
                        expand: true,
                        cwd: 'app',
                        src: ['my_modules/**/*.css'],
                        dest: 'app/build'
                    }, {
                       'app/build/css/style.min.css':[
                           'node_modules/angular-material/angular-material.min.css',
                           'app/lib/fonts/config-font.css'
                       ] 
                    }]
            }
        }
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
    grunt.loadNpmTasks('grunt-contrib-concat');
    // Default task(s).
    grunt.registerTask('default', ['uglify','concat', 'cssmin', 'htmlmin']);

};