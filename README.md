# AlfJS
A simple, low-level JavaScript client for the Alfresco ECM.

# Download AlfJS
The most recent reasonably stable build may be found in the [Downloads Page](https://github.com/Alfresco/AlfJS/downloads)

# Usage

*NOTE:* This library is still in its nascent stages and is therefore subject to change.

To use this library, one of the following conditions must be met:

*  The alfresco.js file is being served from the Alfresco server instance.
*  JSONP is being used in the configuration parameters. (use `format: 'jsonp'` as shown in the next section.)
*  An AJAX proxy is being utilized. (use `prefix: '/sample/proxy/endpoint'` to configure your AJAX proxy)

## A Note on JSONP Callback Support

Please follow [these instructions](http://wiki.alfresco.com/wiki/Web_Scripts#JSON_Callbacks) to enable JSONP support on your Alfresco server.

## Establish a Connection.
Pass along a JavaScript object populated with the configuration parameters needed to connect to your Alfresco server.

```javascript

var conn = AlfJS.createConnection({
    hostname: 'localhost',
    login: 'admin',
    password: 'admin',
    protocol: 'http',
    port: 8080,
    serviceBase: 'alfresco/service/',
    format: 'json', // Optional, the default is 'json', the other option is 'jsonp'
    prefix: '', // Optional, prepend a prefix to the connection URL. Useful if an AJAX proxy is being employed.
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

The returned data will be an object of the form:

```json

[
{
	"url": "\alfresco\s\api\sites\swsdp",
	"sitePreset": "site-dashboard",
	"shortName": "swsdp",
	"title": "Sample: Web Site Design Project",
	"description": "This is a Sample Alfresco Team site.",
	"node": "/alfresco/s/api/node/workspace/SpacesStore/b4cff62a-664d-4d45-9302-98723eac1319",
	"tagScope": "/alfresco/s/api/tagscopes/workspace/SpacesStore/b4cff62a-664d-4d45-9302-98723eac1319",
	"siteManagers":
	[
			"mjackson",
			"admin"
	],
	"isPublic": true,
	"visibility": "PUBLIC"
}
		,
{
	"url": "/alfresco/s/api/sites/acme",
	"sitePreset": "site-dashboard",
	"shortName": "acme",
	"title": "ACME",
	"description": "Sample Descriptions\n\nBreak",
	"node": "/alfresco/s/api/node/workspace/SpacesStore/7956c1b8-7dd3-40ee-a4c0-b55ddf8ee6c8",
	"tagScope": "/alfresco/s/api/tagscopes/workspace/SpacesStore/7956c1b8-7dd3-40ee-a4c0-b55ddf8ee6c8",
	"siteManagers":
	[
			"admin"
	],
	"isPublic": true,
	"visibility": "PUBLIC"
}

]

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

The returned data will be the same as shown in the previous section.


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

The returned data will be an object of the form:

```json

{
   "totalRecords": 15,
   "startIndex": 0,
   "metadata":
   {
      "repositoryId": "96f1317a-cf20-42bf-9a1e-c65cea40f044",
      "container": "workspace://SpacesStore/e400f07a-3b69-47f5-b2f1-9470a0d168b3",
      "parent": {"isLink":false,"aspects":["cm:auditable","sys:referenceable","cm:titled","sys:localized"],"permissions":{"roles":["ALLOWED;GROUP_site_acme_SiteCollaborator;SiteCollaborator;INHERITED","ALLOWED;GROUP_EVERYONE;SiteConsumer;INHERITED","ALLOWED;GROUP_site_acme_SiteConsumer;SiteConsumer;INHERITED","ALLOWED;GROUP_site_acme_SiteContributor;SiteContributor;INHERITED","ALLOWED;GROUP_EVERYONE;ReadPermissions;INHERITED","ALLOWED;GROUP_site_acme_SiteManager;SiteManager;INHERITED"],"inherited":true,"user":{"CancelCheckOut":false,"ChangePermissions":true,"CreateChildren":true,"Delete":true,"Write":true}},"nodeRef":"workspace://SpacesStore/80aaedad-cf8b-42f4-a3f4-88dc3c9f9d3b","properties":{"cm:name":"News","sys:node-dbid":929,"sys:store-identifier":"SpacesStore","sys:locale":"en_US","cm:title":"","cm:modified":{"value":"Tue Feb 07 14:45:03 PST 2012","iso8601":"2012-02-07T14:45:03.413-08:00"},"sys:node-uuid":"80aaedad-cf8b-42f4-a3f4-88dc3c9f9d3b","cm:created":{"value":"Tue Feb 07 14:44:52 PST 2012","iso8601":"2012-02-07T14:44:52.375-08:00"},"sys:store-protocol":"workspace","cm:creator":{"userName":"admin","firstName":"Administrator","lastName":"","displayName":"Administrator"},"cm:description":"","cm:modifier":{"userName":"admin","firstName":"Administrator","lastName":"","displayName":"Administrator"}},"type":"cm:folder","isContainer":true,"isLocked":false},
      "custom": {"vtiServer":{"port":7070,"host":"X.local"},"googleDocs":{"enabled":false}},
      "onlineEditing": true,
      "itemCounts":
      {
         "folders": 0,
         "documents": 15
      },
      "workingCopyLabel": " (Working Copy)"
   },
   "items":
   [
      {
         "node": {"mimetype":"text/html","isLink":false,"aspects":["cm:auditable","sys:referenceable","rn:renditioned","sys:localized"],"permissions":{"roles":["ALLOWED;GROUP_site_acme_SiteCollaborator;SiteCollaborator;INHERITED","ALLOWED;GROUP_EVERYONE;SiteConsumer;INHERITED","ALLOWED;GROUP_site_acme_SiteConsumer;SiteConsumer;INHERITED","ALLOWED;GROUP_site_acme_SiteContributor;SiteContributor;INHERITED","ALLOWED;GROUP_EVERYONE;ReadPermissions;INHERITED","ALLOWED;GROUP_site_acme_SiteManager;SiteManager;INHERITED"],"inherited":true,"user":{"CancelCheckOut":false,"ChangePermissions":true,"CreateChildren":true,"Delete":true,"Write":true}},"nodeRef":"workspace://SpacesStore/32400b92-fdb7-4d2b-96e1-74e43e6f7fe7","properties":{"cm:name":"Alfresco 4 Delivers Cloud-Scale Performance, Social Publishing and Consumer-Like UI.html","sys:node-dbid":932,"sys:store-identifier":"SpacesStore","sys:locale":"en_US","cm:content":"contentUrl=store://2012/2/7/14/45/b6ec7cbf-8b48-4128-abee-df15e9e934f6.bin|mimetype=text/html|size=8124|encoding=ISO-8859-1|locale=en_US_|id=332","cm:modified":{"value":"Tue Feb 07 14:45:03 PST 2012","iso8601":"2012-02-07T14:45:03.051-08:00"},"sys:node-uuid":"32400b92-fdb7-4d2b-96e1-74e43e6f7fe7","cm:created":{"value":"Tue Feb 07 14:45:03 PST 2012","iso8601":"2012-02-07T14:45:03.051-08:00"},"sys:store-protocol":"workspace","cm:creator":{"userName":"admin","firstName":"Administrator","lastName":"","displayName":"Administrator"},"cm:modifier":{"userName":"admin","firstName":"Administrator","lastName":"","displayName":"Administrator"}},"type":"cm:content","contentURL":"/api/node/content/workspace/SpacesStore/32400b92-fdb7-4d2b-96e1-74e43e6f7fe7/Alfresco%204%20Delivers%20Cloud-Scale%20Performance%2c%20Social%20Publishing%20and%20Consumer-Like%20UI.html","isContainer":false,"size":8124,"isLocked":false},

   "version": "1.0",
   "webdavUrl": "/webdav/acme/documentLibrary/News/Alfresco%204%20Delivers%20Cloud-Scale%20Performance%2c%20Social%20Publishing%20and%20Consumer-Like%20UI.html",

   "isFavourite": false,

   "likes":
   {
      "isLiked": false,
      "totalLikes": 0
   },
   "location":
   {
      "repositoryId": "96f1317a-cf20-42bf-9a1e-c65cea40f044",
      "site":
      {
         "name": "acme",
         "title": "ACME",
         "preset": "site-dashboard"
      },
      "container":
      {
         "name": "documentLibrary",
         "type": "cm:folder"
      },
      "path": "/News",
      "file": "Alfresco 4 Delivers Cloud-Scale Performance, Social Publishing and Consumer-Like UI.html",
      "parent":
      {
      }
   }
      },
   ]
}


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
The returned data will be an object of the form:

```json

{
   "metadata":
   {
      "repositoryId": "96f1317a-cf20-42bf-9a1e-c65cea40f044",
      "container": "workspace://SpacesStore/80aaedad-cf8b-42f4-a3f4-88dc3c9f9d3b",

      "custom": {"vtiServer":{"port":7070,"host":"X.local"},"googleDocs":{"enabled":false}},
      "onlineEditing": true,
      "workingCopyLabel": " (Working Copy)"
   },
   "item":
   {
      "node": {"isLink":false,"aspects":["cm:auditable","sys:referenceable","cm:titled","sys:localized"],"permissions":{"roles":["ALLOWED;GROUP_site_acme_SiteContributor;SiteContributor;INHERITED","ALLOWED;GROUP_EVERYONE;SiteConsumer;INHERITED","ALLOWED;GROUP_site_acme_SiteManager;SiteManager;INHERITED","ALLOWED;GROUP_site_acme_SiteCollaborator;SiteCollaborator;INHERITED","ALLOWED;GROUP_site_acme_SiteConsumer;SiteConsumer;INHERITED","ALLOWED;GROUP_EVERYONE;ReadPermissions;INHERITED"],"inherited":true,"user":{"CancelCheckOut":false,"ChangePermissions":true,"CreateChildren":true,"Delete":true,"Write":true}},"nodeRef":"workspace://SpacesStore/80aaedad-cf8b-42f4-a3f4-88dc3c9f9d3b","properties":{"cm:name":"News","sys:node-dbid":929,"sys:store-identifier":"SpacesStore","sys:locale":"en_US","cm:title":"","cm:modified":{"value":"Tue Feb 07 14:45:03 PST 2012","iso8601":"2012-02-07T14:45:03.413-08:00"},"sys:node-uuid":"80aaedad-cf8b-42f4-a3f4-88dc3c9f9d3b","cm:created":{"value":"Tue Feb 07 14:44:52 PST 2012","iso8601":"2012-02-07T14:44:52.375-08:00"},"sys:store-protocol":"workspace","cm:creator":{"userName":"admin","firstName":"Administrator","lastName":"","displayName":"Administrator"},"cm:description":"","cm:modifier":{"userName":"admin","firstName":"Administrator","lastName":"","displayName":"Administrator"}},"type":"cm:folder","isContainer":true,"isLocked":false},
      "parent": {"isLink":false,"aspects":["cm:auditable","st:siteContainer","cm:ownable","cm:tagscope","sys:referenceable","cm:titled","sys:localized"],"permissions":{"roles":["ALLOWED;GROUP_site_acme_SiteContributor;SiteContributor;INHERITED","ALLOWED;GROUP_EVERYONE;SiteConsumer;INHERITED","ALLOWED;GROUP_site_acme_SiteManager;SiteManager;INHERITED","ALLOWED;GROUP_site_acme_SiteCollaborator;SiteCollaborator;INHERITED","ALLOWED;GROUP_site_acme_SiteConsumer;SiteConsumer;INHERITED","ALLOWED;GROUP_EVERYONE;ReadPermissions;INHERITED"],"inherited":true,"user":{"CancelCheckOut":false,"ChangePermissions":true,"CreateChildren":true,"Delete":true,"Write":true}},"nodeRef":"workspace://SpacesStore/e400f07a-3b69-47f5-b2f1-9470a0d168b3","properties":{"cm:name":"documentLibrary","sys:node-dbid":836,"sys:store-identifier":"SpacesStore","st:componentId":"documentLibrary","sys:locale":"en_US","cm:owner":{"userName":"admin","firstName":"Administrator","lastName":"","displayName":"Administrator"},"sys:node-uuid":"e400f07a-3b69-47f5-b2f1-9470a0d168b3","cm:modified":{"value":"Tue Feb 07 14:44:52 PST 2012","iso8601":"2012-02-07T14:44:52.569-08:00"},"cm:created":{"value":"Thu Feb 02 14:51:42 PST 2012","iso8601":"2012-02-02T14:51:42.766-08:00"},"sys:store-protocol":"workspace","cm:description":"Document Library","cm:creator":{"userName":"admin","firstName":"Administrator","lastName":"","displayName":"Administrator"},"cm:modifier":{"userName":"admin","firstName":"Administrator","lastName":"","displayName":"Administrator"}},"type":"cm:folder","isContainer":true,"isLocked":false},
   "version": "1.0",
   "webdavUrl": "/webdav/acme/documentLibrary/News",

   "isFavourite": false,

   "likes":
   {
      "isLiked": false,
      "totalLikes": 0
   },
   "location":
   {
      "repositoryId": "96f1317a-cf20-42bf-9a1e-c65cea40f044",
      "site":
      {
         "name": "acme",
         "title": "ACME",
         "preset": ""
      },
      "container":
      {
         "name": "documentLibrary",
         "type": "cm:folder"
      },
      "path": "/",
      "file": "News",
      "parent":
      {
      }
   }
   }
}

```

# Building AlfJS

Following these steps is *only necessary* if you intend to extend and/or contribute to AlfJS.

Visit the [Downloads Page](https://github.com/Alfresco/AlfJS/downloads) to obtain a pre-built version of the JavaScript library.

We assume you have Node.js installed (see "How to Run Tests" below).

1. Run `grunt` to build AlfJS. Two builds will be placed in the `dist/web` and `dist/node` directories.
  * `alfresco.js` and `alfresco.min.js` - unminified and minified
    builds of AlfJS.

If you are building under Linux, you will need a JavaScript runtime for
minification. You can either install nodejs or `gem install
therubyracer`.

# How to Run Tests

This project [Jasmine](http://pivotal.github.com/jasmine/) for BDD testing.

1. Install [Node.js](http://nodejs.com/).

2. Install Grunt: `npm install -g grunt`

3. Run `npm install` inside the project root to install the project dependencies.

4. You can build once by running `grunt`, or run `grunt watch` to build continuously.

5. You can run tests by first opening a new terminal window and running `node server`.

6. Run the test suite by visiting: `http://localhost:8000`.

# License
Copyright (C) 2012 Alfresco Software Limited

This file is part of an unsupported extension to Alfresco.

Alfresco Software Limited licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
