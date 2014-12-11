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
            my_target: {
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
        }
    });


    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');


    // Default task(s).
    grunt.registerTask('default', ['concat', 'uglify', 'cssmin']);
};