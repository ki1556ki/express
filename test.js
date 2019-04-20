var express = require('express');
var http = require('http');
var static = require('serve-static');
var path = require('path');

var bodyParser = require('body-parser');

var app = express();

app.set('port', process.env.PORT || 3000);



var expressErrorHandler = require('express-error-handler');

var errorHandler = expressErrorHandler({
	static: {
		'404':'./public/404.html'
	}
})

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);


var server = http.createServer(app).listen(app.get('port'), function() {
	console.log('익스프레스로 웹 서버를 실행함 : ' + app.get('port'));
});