// require module
const http = require('http');

// file imports
const respond = require('./lib/respond.js');

// connection settings
const port = process.env.PORT || 3000;
// const hostname = '127.0.0.1';

// create server
const server = http.createServer(respond);

server.listen(port, () => {
    console.log(`Listening on port 3000`);
});
