const fs = require("fs");
const path = require("path");
const http = require("http");


const TYPEMAP = {
	".js": "application/javascript",
	".css": "text/css",
	".png": "image/png"
};


const server = http.createServer(function(request, response)
{
	const filename = `game${request.url === "/" ? "/index.html" : request.url}`;
	const type = TYPEMAP[path.extname(filename)] || "text/html";

	fs.readFile(filename, function(error, content)
	{
		if(error === null)
		{
			response.writeHead(200, {"Content-Type": type});
			response.end(content, "utf-8");
		}
		else
		{
			response.writeHead(404);
			response.end(content, "utf-8");
		}
	});
});

server.listen(80);