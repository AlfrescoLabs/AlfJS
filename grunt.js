/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    meta: {
      banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.company %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */'
    },
    /*server: {
      port: 8000,
      base: 'testrunner'
    },*/
    //lint: {
    //  files: ['grunt.js', 'packages/**/*.js', 'tests/**/*.js']
    //},
    //test: {
    //  files: ['tests/**/*.js']
    //},
    concat: {
//		dist: {
//		  src: ['<banner:meta.banner>','packages/**/*.js'],
//		  dest: 'dist/<%= pkg.name %>.js'
//		},
		
      dist_web: {
        src: ['<banner:meta.banner>', 'generators/license.js', 'packages/vendor/*.js', 'packages/core/*.js', 'packages/utils/*.js','packages/*.js'],
        dest: 'dist/web/<%= pkg.name %>.js'
      },
      dist_node: {
        src: ['<banner:meta.banner>', 'generators/license.js', 'packages/core/*.js', 'packages/utils/*.js','packages/*.js'],
        dest: 'dist/alfjs-node/<%= pkg.name %>.js'
      },
	  dist_node_package: {
          src: ['node/package.json'],
          dest: 'dist/alfjs-node/package.json'	
	  },
      testing: {
        src: ['<banner:meta.banner>','packages/vendor/*.js', 'packages/core/*.js', 'packages/utils/*.js','packages/*.js'],
        dest: 'testrunner/source/<%= pkg.name %>.js'
      },
	  specs: {
          src: ['tests/**/*.js'],
          dest: 'testrunner/source/<%= pkg.name %>-spec.js'	  	
	  }	  
    },
    min: {
      dist: {
        src: ['<banner:meta.banner>', '<config:concat.dist_web.dest>'],
        dest: 'dist/web/<%= pkg.name %>.min.js'
      }
    },
    watch: {
      files: ['package.json', 'tests/**/*.js', 'packages/**/*.js'],
      tasks: 'default'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true
      },
	  globals: {
	    exports: true,
	    module: true,
		define:true,
		expect:true,
		it:true,
		runs:true,
		waits:true,
		AlfJS:true,
		beforeEach:true,
		describe:true
	  }
    },
    uglify: {}
  });

  // Default task.
  //grunt.registerTask('default', 'lint test concat min');
  grunt.registerTask('default', 'concat min');
  /*
	// Of course, you need to have the "connect" Npm module installed locally
	// for this to work. But that's just a matter of running: npm install connect
	var connect = require('connect');

	// Redefining the "server" task for this project. Note that the output
	// displayed by --help will reflect the new task description.
	grunt.registerTask('server', 'Start a custom static web server.', function() {
	  grunt.log.writeln('Starting static web server in "testrunner" on port 1234.');
	  connect(connect.static('testrunner')).listen(8000);
	});
	*/
};
