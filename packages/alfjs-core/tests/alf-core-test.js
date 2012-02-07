describe("BasicTest", function(){
	beforeEach(function(){
	
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
	
});