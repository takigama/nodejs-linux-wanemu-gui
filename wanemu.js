var http = require('http');


function webRequest(req, res) {
	response.writeHead(200, {"Content-Type": "text/html"});
	response.write("<html><h1>test</h1></html>");


}



var server = http.createServer(function (req, res) {
		webRequest(req,res);
	});


server.listen(8080);

