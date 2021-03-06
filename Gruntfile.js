module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: ';',
            },
            js: {
                src: ['src/*.js', 'src/**/*.js'],
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
                    'public/hyperdrive.css': ['src/*.css', 'src/**/*.css']
                }
            },
            minify: {
                src: 'public/hyperdrive.css',
                dest: 'public/hyperdrive.css'
            }
        },
        csscomb: {
            dynamic_mappings: {
                expand: true,
                cwd: 'src/',
                src: ['*.css'],
                dest: 'src/'
            }
        },
        watch: {
            js: {
                files: ['src/*.js', 'src/**/*.js'],
                tasks: ['concat', 'uglify'],
                options: {
                    livereload: true,
                }
            },
            css: {
                files: ['src/*.css', 'src/**/*.css'],
                tasks: ['cssmin'],
                options: {
                    livereload: true,
                }
            }
        },
        shell: {
            mongodb: {
                command: 'mongod --dbpath ./.db',
                options: {
                    stdout: false,
                    stderr: false,
                    failOnError: false,
                    execOptions: {
                        cwd: '.',
                        detached: true 
                    },
                    async: true
                }
            },
            server: {
                command: 'npm start',
                options: {
                    stdout: false,
                    stderr: false,
                    failOnError: false,
                    execOptions: {
                        cwd: '.',
                        detached: true 
                    },
                    async: true
                }
            },
            watch: {
                command: 'grunt watch',
                options: {
                    stdout: true,
                    stderr: true,
                    failOnError: true,
                    execOptions: {
                        cwd: '.'
                    }
                }
            }
        }
    });


    grunt.registerTask('default', ['shell']);

    grunt.registerTask('minify', ['concat', 'uglify', 'cssmin']);
};