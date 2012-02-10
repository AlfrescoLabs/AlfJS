# AlfJS
A simple, low-level JavaScript client for the Alfresco ECM.

# Download AlfJS
The most recent reasonably stable build may be found in the [Downloads Page](https://github.com/Alfresco/AlfJS/downloads)

# Usage

## Establish a connection.
```javascript

var conn = AlfJS.createConnection({
    hostname: 'localhost',
    login: 'admin',
    password: 'admin',
    protocol: 'http',
    port: 8080,
    serviceBase: 'alfresco/service/'
});

```

## Login
```javascript

conn.login(function(data){
    console.log("Success!");
},function(err){
    console.log("Oops!");
});

```

## List User Sites

```javascript

var _self = this;

conn.getUserSites(function(data){
    _self.data = data;
    console.log("The first site on the list is " + data[0].title);
}, function(err){
    console.log("Oops!");
});

```

## List All Sites

```javascript

var _self = this;

conn.getSites(function(data){
    _self.data = data;
    console.log("The first site on the list is " + data[0].title);
}, function(err){
    console.log("Oops!");
});

```

## Get a sites' docLib

```javascript

var _self = this;
conn.getDocList({
   site: 'acme',
   model: 'cm:content',
   container: 'documentLibrary',
   folderPath: 'News/'
   },
   function(data) {
        _self.data = data;
   }, // end success function

   function(err) {
       console.log("Oops!");
   } // end error function
); // end conn.docList

```

## Get a specific Node

```javascript

var _self = this;
var ref = 'workspace://SpacesStore/80aaedad-cf8b-42f4-a3f4-88dc3c9f9d3b';

conn.getNode(ref,
   function(data) {
       _self.data = data;
   }, // end success function

   function(err) {
       //error function
   } // end error function
); // end conn.getNode


```

# Building AlfJS

Following these steps is *only necessary* if you intend to extend and/or contribute to AlfJS.

Visit the [Downloads Page](https://github.com/Alfresco/AlfJS/downloads) to obtain a pre-built version of the JavaScript library.

We assume you have Ruby installed (see "How to Run Tests" below).

1. Run `bundle exec rake` to build AlfJS. Two builds will be placed in the `dist/` directory.
  * `alfresco.js` and `alfresco.min.js` - unminified and minified
    builds of AlfJS.

If you are building under Linux, you will need a JavaScript runtime for
minification. You can either install nodejs or `gem install
therubyracer`.

# How to Run Tests

This project [Jasmine](http://pivotal.github.com/jasmine/) for BDD testing.

1. Install Ruby 1.9.2+. There are many resources on the web can help; one of the best is [rvm](http://rvm.beginrescueend.com/).

2. Install Bundler: `gem install bundler`

3. Run `bundle` inside the project root to install the gem dependencies.

4. To start the development server, run `bundle exec rakep`.

5. Then visit: `http://localhost:9292`.