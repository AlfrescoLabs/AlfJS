## AlfJS
A JavaScript client for the Alfresco ECM.

# Building AlfJS

1. Run `rake` to build AlfJS. Two builds will be placed in the `dist/` directory.
  * `alfresco.js` and `alfresco.min.js` - unminified and minified
    builds of Ember.js

If you are building under Linux, you will need a JavaScript runtime for
minification. You can either install nodejs or `gem install
therubyracer`.

# How to Run Tests

This project [Jasmine](http://pivotal.github.com/jasmine/) for BDD testing.

1. Install Ruby 1.9.2+. There are many resources on the web can help; one of the best is [rvm](http://rvm.beginrescueend.com/).

2. Install Bundler: `gem install bundler`

3. Run `bundle` inside the project root to install the gem dependencies.

4. To start the development server, run `bundle exec rackup`.

5. Then visit: `http://localhost:9292/tests/index.html`. 