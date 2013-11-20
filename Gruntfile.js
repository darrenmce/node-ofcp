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
                src: ['app/scripts/js/*.js'],
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
        clean: ["temp"]
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Default task.
    grunt.registerTask('default', ['jshint', 'qunit']);
    grunt.registerTask('compile', ['concat', 'uglify', 'clean']);

};
