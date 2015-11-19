'use strict';
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var yosay = require('yosay');
var mkdirp = require('mkdirp');
var _ = require('lodash');
var _s = require('underscore.string');

module.exports = yeoman.generators.Base.extend({
   // note: arguments and options should be defined in the constructor.
  constructor: function () {
    yeoman.generators.Base.apply(this, arguments);

    this.argument('customAppName', { type: String, required: false });
    if (typeof this.customAppName !== 'undefined') {
      this.appname = _s.slugify(this.customAppName);
    }
  },

  initializing: function () {
    this.pkg = require('../../package.json');
  },

  prompting: function () {
    var done = this.async();

    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the stellar ' + chalk.red('MustachePrototyping') + ' generator!'
    ));

    var prompts = [{
      type: 'checkbox',
      name: 'features',
      message: 'What more would you like?',
      choices: [{
        name: 'Bootstrap Sass Framework',
        value: 'includeBootstrapSass',
        checked: true
      }, {
        name: 'Modernizr',
        value: 'includeModernizr',
        checked: true
      }]
    }, {
      type: 'confirm',
      name: 'includeJQuery',
      message: 'Would you like to include jQuery?',
      default: true,
      when: function (answers) {
        return answers.features.indexOf('includeBootstrapSass') === -1;
      }
    }];

    this.prompt(prompts, function (answers) {
      var features = answers.features;

      function hasFeature(feat) {
        return features && features.indexOf(feat) !== -1;
      }

      this.includeBootstrapSass = hasFeature('includeBootstrapSass');
      this.includeModernizr = hasFeature('includeModernizr');
      this.includeJQuery = answers.includeJQuery;

      done();
    }.bind(this));
  },

  writing: {
    packageJson: function () {
      this.fs.copyTpl(
        this.templatePath('_package.json'),
        this.destinationPath('package.json'),
        {
          appname: this.appname
        }
      );
    },

    gruntfile: function () {
      this.fs.copyTpl(
        this.templatePath('Gruntfile.js'),
        this.destinationPath('Gruntfile.js'),
        {
          pkg: this.pkg,
          includeBootstrapSass: this.includeBootstrapSass,
          includeModernizr: this.includeModernizr
        }
      );

    },

    bower: function () {
      var bowerJson = {
        name: this.appname,
        private: true,
        dependencies: {}
      };

      if (this.includeBootstrapSass) {
        bowerJson.dependencies['bootstrap-sass'] = '~3.3.5';
        bowerJson.overrides = {
          'bootstrap-sass': {
            'main': [
              'assets/stylesheets/_bootstrap.scss',
              'assets/fonts/bootstrap/*',
              'assets/javascripts/bootstrap.js'
            ]
          }
        };
      } else if (this.includeJQuery) {
        bowerJson.dependencies['jquery'] = '~2.1.4';
      }

      if (this.includeModernizr) {
        bowerJson.dependencies['modernizr'] = '~2.8.3';
      }

      this.fs.writeJSON('bower.json', bowerJson);
      this.fs.copy(
        this.templatePath('bowerrc'),
        this.destinationPath('.bowerrc')
      );
    },

    mustacheData: function () {
      this.fs.copyTpl(
        this.templatePath('common-data.json'),
        this.destinationPath('app/common-data.json')  
      );
    }, 


    html: function () {
      this.fs.copyTpl(
        this.templatePath('head.html'),
        this.destinationPath('app/partials/head.html'), {
          appname: this.appname
        }
      );
      this.fs.copyTpl(
        this.templatePath('foot.html'),
        this.destinationPath('app/partials/foot.html')  
      );
      this.fs.copyTpl(
        this.templatePath('index.html'),
        this.destinationPath('app/index.html')  
      );
    },

    scripts: function () {
      this.fs.copy(
        this.templatePath('main.js'),
        this.destinationPath('app/scripts/main.js')
      );
    },

    styles: function () {
      this.fs.copy(
        this.templatePath('main.scss'),
        this.destinationPath('app/styles/main.scss')
      );
      this.fs.copy(
        this.templatePath('_variables.scss'),
        this.destinationPath('app/styles/_variables.scss')
      );
    },

    git: function () {
      this.fs.copy(
        this.templatePath('gitignore'),
        this.destinationPath('.gitignore')
      );

      this.fs.copy(
        this.templatePath('gitattributes'),
        this.destinationPath('.gitattributes')
      );
    },

    misc: function () {
      mkdirp('app/images');
      mkdirp('app/fonts');
    }, 

    icons: function () {
      this.fs.copy(
        this.templatePath('favicon.ico'),
        this.destinationPath('app/favicon.ico')
      );

      this.fs.copy(
        this.templatePath('apple-touch-icon.png'),
        this.destinationPath('app/apple-touch-icon.png')
      );
    }
  },

  install: function () {
    this.installDependencies();
  }
});
