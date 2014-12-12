module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';',
            },
            js: {
                src: ['src/js/*.js'],
                dest: 'public/hyperdrive.js',
            }
        },
        uglify: {
            js: {
                files: {
                    'public/hyperdrive.js': 'public/hyperdrive.js'
                }
            }
        },
        cssmin: {
            combine: {
                files: {
                    'public/hyperdrive.css': 'src/css/*.css'
                }
            },
            minify: {
                src: 'public/hyperdrive.css',
                dest: 'public/hyperdrive.css'
            }
        },
        watch: {
            js: {
                files: ['src/js/*.js'],
                tasks: ['concat', 'uglify'],
                options: {
                    livereload: true,
                }
            },
            css: {
                files: ['src/css/*.css'],
                tasks: ['cssmin'],
                options: {
                    livereload: true,
                }
            }
        }
    });


    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('default', ['concat', 'uglify', 'cssmin']);
};