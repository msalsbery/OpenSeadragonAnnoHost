﻿module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks("grunt-git-describe");
    grunt.loadNpmTasks('grunt-jsdoc');

    var packageJson = grunt.file.readJSON("package.json"),
        distributionName = 'openseadragon-annohost.js',
        minifiedName = 'openseadragon-annohost.min.js',
        srcDir = 'src/',
        buildDir = 'build/',
        docsDir = 'docs/',
        demoScriptsDir = 'demo/scripts/',
        distribution = buildDir + distributionName,
        minified = buildDir + minifiedName,
        sources = [
            srcDir + 'polyfills.js',
            srcDir + 'annohost.js'
        ];

    grunt.initConfig({
        pkg: packageJson,
        "git-describe": {
            build: {
                options: {
                    prop: "gitInfo"
                }
            }
        },
        clean: {
            build: {
                src: [buildDir]
            },
            doc: {
                src: [docsDir]
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            beforeconcat: sources,
            afterconcat: [distribution]
        },
        concat: {
            options: {
                banner: '//! <%= pkg.name %> <%= pkg.version %>\n'
                      + '//! Build date: <%= grunt.template.today("yyyy-mm-dd") %>\n'
                      + '//! Git commit: <%= gitInfo %>\n'
                      + '//! https://github.com/msalsbery/OpenSeadragonAnnoHost\n',
                      //+ '//! License: http://msalsbery.github.io/openseadragonannohost/index.html\n\n',
                process: true
            },
            dist: {
                src:  ['<banner>'].concat(sources),
                dest: distribution
            }
        },
        uglify: {
            options: {
                preserveComments: 'some'
            },
            build: {
                src: distribution,
                dest: minified
            }
        },
        watch: {
            files: ['Gruntfile.js', srcDir + '*.js'],
            tasks: ['build']
            //options: {
            //    event: ['added', 'deleted'], //'all', 'changed', 'added', 'deleted'
            //}
        },
        jsdoc : {
            dist : {
                src: [distribution, 'README.md'], 
                options: {
                    destination: 'docs',
                    //template: "node_modules/docstrap/template",
                    configure: 'doc-conf.json'
                }
            }
        }
    });

    // Copies built source to demo site folder
    grunt.registerTask('publish', function() {
        grunt.file.copy(distribution, demoScriptsDir + distributionName);
        grunt.file.copy(minified, demoScriptsDir + minifiedName);
    });

    // Build task(s).
    grunt.registerTask('build', ['clean:build', 'jshint:beforeconcat', 'git-describe', 'concat', 'jshint:afterconcat', 'uglify']);

    // Documentation task(s).
    grunt.registerTask('doc', ['clean:doc', 'jsdoc']);

    // Default task(s).
    grunt.registerTask('default', ['build']);

};