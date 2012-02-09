describe("BasicTest", function(){

    var conn;
    var conn2;

	beforeEach(function(){
	    conn = AlfJS.createConnection({
			hostname: 'x.local',
			login: 'admin',
			password: 'admin',
			protocol: 'http',
			port: 8080,
			serviceBase: 'alfresco/service/'
		});

        conn2 = AlfJS.createConnection({
			hostname: 'x.local',
			login: 'admin',
			password: 'blah',
			protocol: 'http',
			port: 8080,
			serviceBase: 'alfresco/service/'
		});
	});
	
	it("has equal values", function(){
		expect(true).toEqual(true);
	});
	
	it("has a moduleProperty with value '12345'", function() {
		expect(AlfJS.moduleProperty).toEqual(12345);
	});
	
	it("has a callPrivateMethod that returns 'hello'", function(){
		expect(AlfJS.callPrivateMethod()).toEqual('hello');
	});

	it("has a createConnections method that can support multiple AlfJS.Connection instances", function(){
		var conn1 = AlfJS.createConnection({
			hostname: 'host1',
			login: 'user1',
			password: 'password1',
			protocol: 'http',
			port: 8080,
			serviceBase: 'alfresco/service/'		
		});
		var conn2 = AlfJS.createConnection({
			hostname: 'host2',
			login: 'user2',
			password: 'password2',
			protocol: 'http',
			port: 8080,
			serviceBase: 'alfresco/service/'		
		});
		
		expect(conn1.getConfig().hostname).toEqual('host1');
		expect(conn2.getConfig().hostname).toEqual('host2');
	});

    it("has a working http/ajax method", function(){

        var _self = this;

        AlfJS.ajax("/index.html",function(data){
            _self.sub = data.substring(0, 9);
        });

        waits(500);

        runs(function(){
            expect(this.sub).toEqual('<!DOCTYPE');
        });

    });

    it("can login to an Alfresco server", function(){

        var _self = this;

        conn.login(function(){
            _self.ticket = conn.getTicket();
        });

        waits(1000);

        runs(function(){
            expect(this.ticket.substring(0,6)).toEqual('TICKET');
            expect(conn.getTicket().substring(0,6)).toEqual('TICKET');
        });
    });

    it("calls the error callback when the login is invalid.", function(){

        var _self = this;

        conn2.login(function(){
            _self.ticket = conn.getTicket();
        },function(err){
            _self.error = JSON.parse(err.responseText);
        });

        waits(1000);

        runs(function(){
            console.log(this.error);
            expect(this.error.status.code).toEqual(403);
        });
    });

    it("can retrieve a list of nodes from a given site's doclib", function() {

        var _self = this;

        conn.login();

        waits(1000);

        runs(function() {

            conn.docList({
               site: 'acme',
               model: 'cm:content',
               container: 'documentLibrary',
               folderPath: 'News/'
               },
               function(data) {
                   _self.data = data;
               }, // end success function

               function(err) {
                   //error funciton
               } // end error function
            ); // end conn.docList
        });


        waits(1000);

        runs(function(){
            expect(this.data.totalRecords).toBeDefined();
        });
    });

    it("can retrieve a nodes by its nodeRef", function() {

        var _self = this;
        var ref = 'workspace://SpacesStore/80aaedad-cf8b-42f4-a3f4-88dc3c9f9d3b';

        conn.login();

        waits(1000);

        runs(function() {

            conn.node(ref,
               function(data) {
                   _self.data = data;
               }, // end success function

               function(err) {
                   //error funciton
               } // end error function
            ); // end conn.docList
        });


        waits(1000);

        runs(function(){
            expect(this.data.item.node.nodeRef).toEqual(ref);
        });
    });
});