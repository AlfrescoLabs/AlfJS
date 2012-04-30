require('./alfresco.js');

var conn = AlfJS.createConnection({
    hostname: 'x.local',
    login: 'admin',
    password: 'admin',
    protocol: 'http',
    port: 9090,
    serviceBase: 'alfresco/service/'
});

var ticket = undefined;

conn.login(function(){
    ticket = conn.getTicket();
    console.log('Ticket: ' + ticket);
});

