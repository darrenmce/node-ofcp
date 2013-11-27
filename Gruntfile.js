'use strict';

module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        nodeunit: {
            files: ['test/**/*_test.js'],
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            gruntfile: {
                src: 'Gruntfile.js'
            },
            node: {
                src: ['index.js', 'lib/*.js']
            },
            app: {
                src: ['app/scripts/js/deck.js','app/scripts/js/player.js','app/scripts/js/game.js','app/scripts/js/main.js']
            }
        },
        qunit: {
            all: ['test/**/*.html']
        },
        concat: {
            options: {
                separator: ';'
            },
            dist: {
                src: ['app/scripts/js/vendor/*.js'
                    ,'app/scripts/js/deck.js'
                    ,'app/scripts/js/player.js'
                    ,'app/scripts/js/game.js'
                    ,'app/scripts/js/rules.js'
                    ,'app/scripts/js/util.js'
                    ,'app/scripts/js/game-func.js'
                    ,'app/scripts/js/main.js'],
                dest: 'temp/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    "app/scripts/js/<%= pkg.name %>.min.js": ['<%= concat.dist.dest %>']
                }
            }
        },
        clean: ["temp"],
        replace: {
            dev: {
                options: {
                    variables: {
                        'include': '<%= grunt.file.read("app/templates/dev-scripts.html") %>'
                    }
                },
                files: [
                    {src: ['app/templates/index.html'], dest: 'app/index.html'}
                ]
            },
            prod: {
                options: {
                    variables: {
                        'include': '<%= grunt.file.read("app/templates/prod-scripts.html") %>'
                    }
                },
                files: [
                    {src: ['app/templates/index.html'], dest: 'app/index.html'}
                ]
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-replace');

    grunt.registerTask('dev', ['replace:dev','jshint','qunit']);
    grunt.registerTask('prod', ['concat', 'uglify', 'replace:prod', 'clean']);

};
