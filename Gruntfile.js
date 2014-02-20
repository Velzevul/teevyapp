module.exports = function(grunt) {
  grunt.initConfig({
    compass: {
      dist: {
        options: {
          config: 'config.rb'
        }
      }
    },

    cssmin: {
      def: {
        src: 'backend/public/my_assets/main.css',
        dest: 'backend/public/my_assets/styles.min.css'
      }
    },

    uglify: {
      app: {
        src:  'backend/public/my_assets/app.js',
        dest: 'backend/public/my_assets/app.min.js'
      }
    },

    concat: {
      vendor: {
        src: [
          'bower_components/jquery/jquery.min.js',
          'bower_components/angular/angular.min.js',
          'bower_components/angular-route/angular-route.min.js',
          'bower_components/momentjs/min/moment.min.js',
          'bower_components/angular-truncate/dist/angular-truncate.min.js',
        ],
        dest: 'backend/public/my_assets/vendor.min.js'
      },
      app: {
        src: [
          'frontend/javascripts/landing.js',
          'frontend/javascripts/app.js'
        ],
        dest: 'backend/public/my_assets/app.js'
      },
      dev: {
        src: [
          'backend/public/my_assets/vendor.min.js',
          'backend/public/my_assets/app.js'
        ],
        dest: 'backend/public/my_assets/scripts.js'
      },
      prod: {
        src: [
          'backend/public/my_assets/vendor.min.js',
          'backend/public/my_assets/app.min.js'
        ],
        dest: 'backend/public/my_assets/scripts.min.js'
      }
    },

    clean: {
      vendor: [ 'backend/public/my_assets/vendor.min.js' ],
      css:    [ 'backend/public/my_assets/**/*.css' ],
      js:     [
        'backend/public/my_assets/app.js',
        'backend/public/my_assets/app.min.js',
        'backend/public/my_assets/scripts.js',
        'backend/public/my_assets/scripts.min.js'
      ],
      extra:  [
        'backend/public/my_assets/main.css',
        'backend/public/my_assets/app.js',
        'backend/public/my_assets/app.min.js'
      ]
    },

    watch: {
      dev: {
        files: [
          'frontend/sass/**/*.scss',
          'frontend/javascripts/**/*.js'
        ],
        tasks: [
          'clean:css', 'compass', 'cssmin',
          'clean:js', 'concat:app', 'concat:dev', 'clean:extra'
        ]
      },
      prod: {
        files: [
          'frontend/sass/**/*.scss',
          'frontend/javascripts/**/*.js'
        ],
        tasks: [
          'clean:css', 'compass', 'cssmin',
          'clean:js', 'concat:app', 'uglify:app', 'concat:prod', 'clean:extra'
        ]
      }
    },

    imageoptim: {
      dist: {
        src: ['backend/public/images']
      }
    },
  });

  grunt.loadNpmTasks('grunt-imageoptim');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');


  grunt.registerTask('default',    ['clean', 'concat:vendor', 'watch:dev']);
  grunt.registerTask('production', ['clean', 'concat:vendor', 'watch:prod']);
};