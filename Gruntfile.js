'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {
  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Automatically load required Grunt tasks
  require('jit-grunt')(grunt, {
    useminPrepare: 'grunt-usemin',
    ngtemplates: 'grunt-angular-templates',
    cdnify: 'grunt-google-cdn'
  });

  // Configurable paths for the application
  var appConfig = {
    app: require('./bower.json').appPath || 'app',
    dist: 'dist'
  };

  var modRewrite = require('connect-modrewrite');

  grunt.loadNpmTasks('grunt-ng-constant');
  var environmentTask = getEnvironmentTask(grunt.option('env'));
  var siteTask = getSiteTask(grunt.option('site')); //grunt serve --site (kids,studio,home)

  // Define the configuration for all the tasks
  grunt.initConfig({
    // Project settings
    yeoman: appConfig,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['wiredep']
      },
      js: {
        files: ['<%= yeoman.app %>/scripts/{,*/}*.js'],
        tasks: ['newer:jshint:all', 'newer:jscs:all'],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      jsTest: {
        files: ['test/spec/{,*/}*.js'],
        tasks: ['newer:jshint:test', 'newer:jscs:test', 'karma']
      },
      styles: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.css'],
        tasks: ['newer:copy:styles', 'postcss']
      },
      gruntfile: {
        files: ['Gruntfile.js']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= yeoman.app %>/{,*/}*.html',
          '.tmp/styles/{,*/}*.css',
          '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
        ]
      }
    },

    // The actual grunt server settings
    connect: {
      options: {
        port: 9000,
        // Change this to '0.0.0.0' to access the server from outside.
        hostname: 'localhost',
        // hostname:'192.168.1.184',
        livereload: 35729
      },
      livereload: {
        options: {
          open: true,
          middleware: function (connect) {
            return [
              modRewrite([
                '!\\.html|\\.js|\\.svg|\\.css|\\.png|\\.jpg|\\.ttf|\\.woff|\\.mp4|\\.gif|\\.xml|\\.webm$ /index.html [L]'
              ]),

              connect.static('.tmp'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect().use('/app/styles', connect.static('./app/styles')),
              connect.static(appConfig.app)
            ];
          }
        }
      },
      test: {
        options: {
          port: 9001,
          middleware: function (connect) {
            return [
              connect.static('.tmp'),
              connect.static('test'),
              connect().use(
                '/bower_components',
                connect.static('./bower_components')
              ),
              connect.static(appConfig.app)
            ];
          }
        }
      },
      dist: {
        options: {
          open: true,
          base: '<%= yeoman.dist %>'
        }
      }
    },

    // Make sure there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: ['Gruntfile.js', '<%= yeoman.app %>/scripts/{,*/}*.js']
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/spec/{,*/}*.js']
      }
    },

    // Make sure code styles are up to par
    jscs: {
      options: {
        config: '.jscsrc',
        verbose: true
      },
      all: {
        src: ['Gruntfile.js', '<%= yeoman.app %>/scripts/{,*/}*.js']
      },
      test: {
        src: ['test/spec/{,*/}*.js']
      }
    },

    // Empties folders to start fresh
    clean: {
      dist: {
        files: [
          {
            dot: true,
            src: [
              '.tmp',
              '<%= yeoman.dist %>/{,*/}*',
              '!<%= yeoman.dist %>/.git{,*/}*'
            ]
          }
        ]
      },
      server: '.tmp'
    },

    // Add vendor prefixed styles
    postcss: {
      options: {
        processors: [
          require('autoprefixer-core')({ browsers: ['last 1 version'] })
        ]
      },
      server: {
        options: {
          map: true
        },
        files: [
          {
            expand: true,
            cwd: '.tmp/styles/',
            src: '{,*/}*.css',
            dest: '.tmp/styles/'
          }
        ]
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: '.tmp/styles/',
            src: '{,*/}*.css',
            dest: '.tmp/styles/'
          }
        ]
      }
    },

    // Automatically inject Bower components into the app
    wiredep: {
      app: {
        src: ['<%= yeoman.app %>/index.html'],
        ignorePath: /\.\.\//
      },
      test: {
        devDependencies: true,
        src: '<%= karma.unit.configFile %>',
        ignorePath: /\.\.\//,
        fileTypes: {
          js: {
            block: /(([\s\t]*)\/{2}\s*?bower:\s*?(\S*))(\n|\r|.)*?(\/{2}\s*endbower)/gi,
            detect: {
              js: /'(.*\.js)'/gi
            },
            replace: {
              js: "'{{filePath}}',"
            }
          }
        }
      }
    },

    // Renames files for browser caching purposes
    filerev: {
      dist: {
        src: [
          '<%= yeoman.dist %>/scripts/{,*/}*.js',
          '<%= yeoman.dist %>/styles/{,*/}*.css',
          '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= yeoman.dist %>/styles/fonts/*'
        ]
      }
    },

    // Reads HTML for usemin blocks to enable smart builds that automatically
    // concat, minify and revision files. Creates configurations in memory so
    // additional tasks can operate on them
    useminPrepare: {
      html: '<%= yeoman.app %>/index.html',
      options: {
        dest: '<%= yeoman.dist %>',
        flow: {
          html: {
            steps: {
              js: ['concat', 'uglifyjs'],
              css: ['cssmin']
            },
            post: {}
          }
        }
      }
    },

    // Performs rewrites based on filerev and the useminPrepare configuration
    usemin: {
      html: ['<%= yeoman.dist %>/**/*.html'],
      css: ['<%= yeoman.dist %>/styles/{,*/}*.css'],
      js: ['<%= yeoman.dist %>/scripts/{,*/}*.js'],
      options: {
        assetsDirs: [
          '<%= yeoman.dist %>',
          '<%= yeoman.dist %>/images',
          '<%= yeoman.dist %>/styles'
        ],
        patterns: {
          js: [
            [
              /(images\/[^''""]*\.(png|jpg|jpeg|gif|webp|svg))/g,
              'Replacing references to images'
            ]
          ]
        }
      }
    },

    // The following *-min tasks will produce minified files in the dist folder
    // By default, your `index.html`'s <!-- Usemin block --> will take care of
    // minification. These next options are pre-configured if you do not wish
    // to use the Usemin blocks.
    // cssmin: {
    //   dist: {
    //     files: {
    //       '<%= yeoman.dist %>/styles/main.css': [
    //         '.tmp/styles/{,*/}*.css'
    //       ]
    //     }
    //   }
    // },
    // uglify: {
    //   dist: {
    //     files: {
    //       '<%= yeoman.dist %>/scripts/scripts.js': [
    //         '<%= yeoman.dist %>/scripts/scripts.js'
    //       ]
    //     }
    //   }
    // },
    // concat: {
    //   dist: {}
    // },

    imagemin: {
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.app %>/images',
            src: '{,*/}*.{png,jpg,jpeg,gif}',
            dest: '<%= yeoman.dist %>/images'
          },
          {
            expand: true,
            cwd: '<%= yeoman.app %>/design/',
            src: '{,*/}*.{png,jpg,jpeg,gif}',
            dest: '<%= yeoman.dist %>/design/'
          }
        ]
      }
    },

    svgmin: {
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.app %>/images',
            src: '{,*/}*.svg',
            dest: '<%= yeoman.dist %>/images'
          }
        ]
      }
    },

    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          conservativeCollapse: true,
          collapseBooleanAttributes: false,
          removeCommentsFromCDATA: true
        },
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.dist %>',
            src: ['*.html'],
            dest: '<%= yeoman.dist %>'
          }
        ]
      }
    },

    ngtemplates: {
      dist: {
        options: {
          module: 'actualWebApp',
          htmlmin: '<%= htmlmin.dist.options %>',
          usemin: 'scripts/scripts.js'
        },
        cwd: '<%= yeoman.app %>',
        src: 'views/**/*.html',
        dest: '.tmp/templateCache.js'
      }
    },

    // ng-annotate tries to make the code safe for minification automatically
    // by using the Angular long form for dependency injection.
    ngAnnotate: {
      dist: {
        files: [
          {
            expand: true,
            cwd: '.tmp/concat/scripts',
            src: '*.js',
            dest: '.tmp/concat/scripts'
          }
        ]
      }
    },

    // Replace Google CDN references
    cdnify: {
      dist: {
        html: ['<%= yeoman.dist %>/*.html']
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [
          {
            expand: true,
            dot: true,
            cwd: '<%= yeoman.app %>',
            dest: '<%= yeoman.dist %>',
            src: [
              '*.{ico,png,txt}',
              '*.html',
              'images/{,*/}*.{webp}',
              'styles/fonts/{,*/}*.*',
              'fonts/{,*/}*.*',
              'fonts/dashboard-fonts/{,*/}*.*',
              '.htaccess',
              'sitemap.xml',
              'actual_home.xml',
              'actual_studio.xml',
              'actual_kids.xml'
            ]
          },
          {
            expand: true,
            cwd: '.tmp/images',
            dest: '<%= yeoman.dist %>/images',
            src: ['generated/*']
          },
          {
            //for custom fonts
            expand: true,
            dot: true,
            cwd: '<%= yeoman.app %>/fonts',
            src: ['*.*'],
            dest: '<%= yeoman.dist %>/fonts'
          }
        ]
      },
      styles: {
        expand: true,
        cwd: '<%= yeoman.app %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      }
    },

    // Run some tasks in parallel to speed up the build process
    concurrent: {
      server: ['copy:styles'],
      test: ['copy:styles'],
      dist: ['copy:styles', 'imagemin', 'svgmin']
    },

    // Test settings
    karma: {
      unit: {
        configFile: 'test/karma.conf.js',
        singleRun: true
      }
    },

    processhtml: {
      options: {
        commentMarker: 'process',
        data: {
          metaTags: getMetaTagsBySite(grunt.option('site')),
          tagManagerId: getTagManagerId(grunt),
          facebookPixelId: getFacebookPixelId(grunt.option('env')),
          mailchimpId: getMailchimpId(grunt)
        }
      },
      dist: {
        files: [
          {
            expand: true,
            cwd: '<%= yeoman.dist %>',
            src: ['index.html', 'index.html'],
            dest: '<%= yeoman.dist %>'
          }
        ]
      }
    },

    //ENV AND CONSTANTS SETTINGS
    ngconstant: {
      // Options for all targets
      options: {
        space: '  ',
        wrap: '"use strict";\n\n {%= __ngModule %}'
      },
      // Environment targets
      sandbox: {
        options: {
          dest: '<%= yeoman.app %>/scripts/envconfig.js',
          name: 'envconfig'
        },
        constants: {
          ENV: {
            name: 'sandbox',
            apiEndpoint: 'https://sandboxapi.actualstudio.com',
            cdnUrl: 'https://d116li125og699.cloudfront.net',
            adminUrl: 'http://sandboxadmin.miactual.com',
            tokenPrefix: 'sandbox',
            conektaHomeKey: 'key_LcURg3XbcFPVXud8KmHkmGg',
            conektaKidsKey: 'key_FAVz7GZoqMy4PwugqgHNrag',
            conektaStudioKey: 'key_Eedd73QyEppQ3NxPgjVRxHQ'
          }
        }
      },
      demo: {
        options: {
          dest: '<%= yeoman.app %>/scripts/envconfig.js',
          name: 'envconfig'
        },
        constants: {
          ENV: {
            name: 'demo',
            apiEndpoint: 'https://sandboxapi.actualstudio.com',
            cdnUrl: 'https://d116li125og699.cloudfront.net',
            adminUrl: 'http://sandboxadmin.miactual.com',
            tokenPrefix: 'demo',
            conektaHomeKey: 'key_LcURg3XbcFPVXud8KmHkmGg',
            conektaKidsKey: 'key_FAVz7GZoqMy4PwugqgHNrag',
            conektaStudioKey: 'key_Eedd73QyEppQ3NxPgjVRxHQ'
          }
        }
      },
      production: {
        options: {
          dest: '<%= yeoman.app %>/scripts/envconfig.js',
          name: 'envconfig'
        },
        constants: {
          ENV: {
            name: 'production',
            apiEndpoint: 'https://api.actualstudio.com',
            cdnUrl: 'https://d116li125og699.cloudfront.net',
            adminUrl: 'http://admin.miactual.com',
            tokenPrefix: 'production',
            conektaHomeKey: 'key_fTqfbsS7oxfpqZxtP9qZqdw',
            conektaKidsKey: 'key_QCgrTimPycx55HtzxStvXZw',
            conektaStudioKey: 'key_YrdmsrYuzSnqfZYryJxrjiQ',
            studioAnalytics: 'UA-54662003-1',
            homeAnalytics: 'UA-78979962-1',
            kidsAnalytics: 'UA-55789134-1'
          }
        }
      },
      staged: {
        options: {
          dest: '<%= yeoman.app %>/scripts/envconfig.js',
          name: 'envconfig'
        },
        constants: {
          ENV: {
            name: 'dev',
            apiEndpoint: 'http://localhost:1337',
            cdnUrl: 'https://d116li125og699.cloudfront.net',
            adminUrl: 'http://localhost:3000',
            tokenPrefix: 'dev',
            conektaHomeKey: 'key_LcURg3XbcFPVXud8KmHkmGg',
            conektaKidsKey: 'key_FAVz7GZoqMy4PwugqgHNrag',
            conektaStudioKey: 'key_Eedd73QyEppQ3NxPgjVRxHQ'
          }
        }
      },

      actualHome: {
        options: {
          dest: '<%= yeoman.app %>/scripts/siteconfig.js',
          name: 'siteconfig'
        },
        constants: {
          SITE: {
            name: 'actual-home',
            publicName: 'Actual Home',
            baseUrl: 'https://actualhome.com',
            domain: 'actualhome.com',
            fb_url: 'https://www.facebook.com/ActualHomeMx',
            instagram_url: 'https://www.instagram.com/actualhome_mx/',
            foursquare_url: 'https://es.foursquare.com/p/actual-home/90458136',
            pinterest_url: 'https://www.pinterest.com.mx/ActualGroup/'
          }
        }
      },

      actualStudio: {
        options: {
          dest: '<%= yeoman.app %>/scripts/siteconfig.js',
          name: 'siteconfig'
        },
        constants: {
          SITE: {
            name: 'actual-studio',
            publicName: 'Actual Studio',
            baseUrl: 'https://actualstudio.com',
            domain: 'actualstudio.com',
            fb_url: 'https://www.facebook.com/actualstudioo',
            instagram_url: 'https://www.instagram.com/actual_studio/',
            foursquare_url:
              'https://es.foursquare.com/p/actual-studio/87584627',
            pinterest_url: 'https://www.pinterest.com.mx/ActualGroup/'
          }
        }
      },

      actualKids: {
        options: {
          dest: '<%= yeoman.app %>/scripts/siteconfig.js',
          name: 'siteconfig'
        },
        constants: {
          SITE: {
            name: 'actual-kids',
            publicName: 'Actual Kids',
            baseUrl: 'https://actualkids.com',
            domain: 'actualkids.com',
            fb_url: 'https://www.facebook.com/ActualKids',
            instagram_url: 'https://www.instagram.com/actualkids_mx/',
            foursquare_url:
              'https://es.foursquare.com/p/actual-studio/87584627',
            pinterest_url: 'https://www.pinterest.com.mx/ActualGroup/'
          }
        }
      },
      dev: {
        options: {
          dest: '<%= yeoman.app %>/scripts/envconfig.js',
          name: 'envconfig'
        },
        constants: {
          SITE: {
            name: 'staged',
            publicName: 'Staged',
            baseUrl: 'http://stagingapiweb.miactual.com',
            domain: 'stagingapiweb.miactual.com',
            fb_url: 'https://www.facebook.com/ActualKids',
            instagram_url: 'https://www.instagram.com/actualkids_mx/',
            foursquare_url:
              'https://es.foursquare.com/p/actual-studio/87584627',
            pinterest_url: 'https://www.pinterest.com.mx/ActualGroup/'
          }
        }
      }
    }
  });

  grunt.registerTask(
    'serve',
    'Compile then start a connect web server',
    function (target) {
      if (target === 'dist') {
        return grunt.task.run(['build', 'connect:dist:keepalive']);
      }

      grunt.task.run([
        'clean:server',
        environmentTask,
        siteTask,
        'wiredep',
        'concurrent:server',
        'postcss:server',
        'connect:livereload',
        'processhtml',
        'watch'
      ]);
    }
  );

  grunt.registerTask(
    'server',
    'DEPRECATED TASK. Use the "serve" task instead',
    function (target) {
      grunt.log.warn(
        'The `server` task has been deprecated. Use `grunt serve` to start a server.'
      );
      grunt.task.run(['serve:' + target]);
    }
  );

  grunt.registerTask('test', [
    'clean:server',
    'wiredep',
    'concurrent:test',
    'postcss',
    'connect:test',
    'karma'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    environmentTask,
    siteTask,
    'wiredep',
    'useminPrepare',
    'concurrent:dist',
    'postcss',
    'ngtemplates',
    'concat',
    'ngAnnotate',
    'copy:dist',
    'cdnify',
    'cssmin',
    'uglify',
    'filerev',
    'processhtml',
    'usemin',
    'htmlmin'
  ]);

  grunt.registerTask('default', [
    'newer:jshint',
    'newer:jscs',
    'test',
    'build'
  ]);
};

function getEnvironmentTask(envOption) {
  console.log('envOption', envOption);
  var task;
  switch (envOption) {
    case 'sandbox':
      task = 'ngconstant:sandbox';
      break;
    case 'demo':
      task = 'ngconstant:demo';
      break;
    case 'production':
      task = 'ngconstant:production';
      break;
    default:
      task = 'ngconstant:dev';
      break;
  }
  return task;
}

function getSiteTask(siteOption) {
  console.log('siteOption', siteOption);
  var task;
  switch (siteOption) {
    case 'studio':
      task = 'ngconstant:actualStudio';
      break;
    case 'home':
      task = 'ngconstant:actualHome';
      break;
    case 'kids':
      task = 'ngconstant:actualKids';
      break;
    default:
      task = 'ngconstant:actualHome';
      break;
  }
  return task;
}

function getTagManagerId(grunt) {
  if (grunt.option('env') !== 'production') {
    return '';
  }
  var tagManagerId = '';
  switch (grunt.option('site')) {
    case 'kids':
      tagManagerId = 'GTM-P833XQZ';
      break;
    case 'home':
      tagManagerId = 'GTM-MT5PVDH';
      break;
    case 'studio':
      tagManagerId = 'GTM-M2CFZQH';
      break;
    default:
      break;
  }
  return tagManagerId;
}

function getMailchimpId(grunt) {
  if (grunt.option('env') !== 'production') {
    return '';
  }
  var tagManagerId = '';
  switch (grunt.option('site')) {
    case 'kids':
      tagManagerId = '16e1cf103f04ae5477495f7c2';
      break;
    case 'home':
      tagManagerId = '517b7e0e325738506afd95862';
      break;
    case 'studio':
      tagManagerId = '517b7e0e325738506afd95862';
      break;
    default:
      break;
  }
  return tagManagerId;
}

function getFacebookPixelId(env) {
  var facbookPixelId = '';
  switch (env) {
    case 'production':
      facbookPixelId = '591808408023977';
      break;
    case 'sandbox':
      facbookPixelId = '591808408023977';
      break;
    case 'dev':
      facbookPixelId = '';
      break;
    default:
      break;
  }
  return facbookPixelId;
}

function getMetaTagsBySite(siteOption) {
  var metaTags = {
    title: 'Actual | Más de 25 años de experiencia en muebles e interiorismo.',
    description:
      'Amamos el arte moderno y la arquitectura, los interiores y los objetos extraordinarios, amamos el arte transformado en muebles y piezas decorativas.',
    image: 'https://api.actualstudio.com/logos/studio-og.png',
    url: 'https://actualstudio.com',
    favicon: 'https://api.actualStudio.com/icons/actual-studio-favicon.png'
  };

  switch (siteOption) {
    case 'studio':
      metaTags = {
        title: 'Actual Studio | Muebles, accesorios y para el hogar en México',
        description:
          'Muebles y decoración; salas, comedores, sillas, recámaras. Decora tu hogar con muebles modernos y funcionales',
        image: 'https://api.actualstudio.com/logos/studio-og.png',
        url: 'https://actualstudio.com',
        favicon: 'https://api.actualStudio.com/icons/actual-studio-favicon.png'
      };
      break;
    case 'home':
      metaTags = {
        title: 'Actual Home',
        description:
          'Muebles y decoración para los más exigentes, lujo accesible para amantes del diseño',

        image: 'https://api.actualstudio.com/logos/home-og.png',
        url: 'https://actualhome.com',
        favicon: 'https://api.actualStudio.com/icons/actual-home-favicon.png'
      };
      break;
    case 'kids':
      metaTags = {
        title: 'Actual Kids',
        description:
          'Muebles y decoración infantiles para niños, bebés, papás. Seguridad, estilo, interactividad y diversión',
        image: 'https://api.actualstudio.com/logos/kids-og.png',
        url: 'https://actualkids.com',
        favicon: 'https://api.actualStudio.com/icons/actual-kids-favicon.png'
      };
      break;
  }
  return metaTags;
}
