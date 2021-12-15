// Matej Delincak
// pre pustenie admin treba sa prihlasit => login: admin, password: admin
const serverSide = require('./server-side');
const http = require('http');
let port = 8080;
serverSide.set('port', port);

let server = http.createServer(serverSide);
server.listen(port);
server.on('listening', function() {
    console.log('Running on http://localhost:8080');
});