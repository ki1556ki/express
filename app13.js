var express = require('express');
var http = require('http');
var static = require('serve-static');
var path = require('path');

var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');

var multer = require('multer');
var fs = require('fs');

var cors = require('cors');


var app = express();

app.set('port', process.env.PORT || 3000);
app.use('/public', static(path.join(__dirname, 'public')));
app.use('/uploads', static(path.join(__dirname, 'uploads')));


app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.use(cookieParser());
app.use(expressSession({
	secret:'my key',
	resave:true,
	saveUninitialized:true
}));

app.use(cors());

var storage = multer.diskStorage({
	destination: function(req, file, callback) {
		callback(null, 'uploads');
	},
	filename:function(req, file, callback) {
		var extension = path.extname(file.originalname);
		var basename = path.basename(file.originalname, extension);
		callback(null, basename + Date.now() + extension);
	}
});

var upload = multer({
	storage: storage,
	limits:{
		files:10,
		fileSize:1024*1024*1024
	}
});


var router = express.Router();

router.route('/process/photo').post(upload.array('photo', 1), function(req, res) {
	console.log('/process/photo 라우팅 함수 호출됨.');
	
	var files = req.files;
	console.log('==== 업로드된 파일 ====');
	if (files.length > 0) {
		console.dir(files[0]);
	} else {
		console.log('파일이 없습니다.');
	}

	var originalname;
	var filename;
	var mimetype;
	var size;
	
	if (Array.isArray(files)) {
		for(var i = 0; i < files.length; i++) {
			originalname = files[i].originalname;
			filename = files[i].filename;
			mimetype = files[i].mimetype;
			size = files[i].size;
		}
	}
	res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
	res.write("<h1>파일 업로드 성공</h1>");
	res.write("<p>원본파일 : " + originalname + "</p>");
	res.write("<p>저장파일 : " + filename + "</p>");
	res.end();
	
});


router.route('/process/product').get(function(req, res) {
	console.log('/process/product 라우팅 함수 호출됨.');
	
	if (req.session.user) {
		res.redirect('/public/product.html');
	} else {
		res.redirect('/public/login2.html');
	}
});

router.route('/process/login').post(function(req, res) {
	console.log('/process/login 라우팅 함수 호출됨.');
	
	
	var paramId = req.body.id || req.query.id;
	var paramPassword = req.body.password || req.query.password;
	console.log('오청 파라미터 : ' + paramId + ', ' + paramPassword);
	
	if (req.session.user) {
		console.log('이미 로그인되어 있습니다.');
		
		res.redirect('/public/product.html');
	} else {
		req.session.user = {
			id:paramId,
			name:'소녀시대',
			authorized:true
		};
		
		res.writeHead(200, {"Content-Type":"text/html;charset=utf8"});
		res.write('<h1>로그인 성공</h1>');
		res.write('<p>Id : ' + paramId + '</p>');
		res.write('<br><br><a href="/process/public/product.html">상품 페이지로 이동하기</a>');
		res.end();
	}
});

router.route('/process/logout').get(function(req, res) {
	console.log('/process/logout 라우팅 함수 호출됨.');
	
	if (req.session.user) {
		console.log('로그아웃 합니다.');
		
		req.session.destroy(function(err) {
			if (err) {
				console.log('세션 삭제 시 에러 발생.');
				return;
			}
			
			console.log('세션 삭제 성공');
			res.redirect('/public/login2.html');
			
		});
	} else {
		console.log('로그인되어 있지 않습니다.');
		res.redirect('public/login2.html');
	}
});



router.route('/process/setUserCookie').get(function(req, res) {
	console.log('/process/setUserCookie 라우팅 함수 호출됨.');
	
	res.cookie('user', {
		id:'mike',
		name:'소녀시대',
		authorized:true
	});
	
	res.redirect('/process/showCookie'); 
});

router.route('/process/showCookie').get(function(req, res) {
	console.log('/process/showCookie 라우팅 함수 호출됨.');
	
	res.send(req.cookies);
});

app.use('/', router);

app.all('*', function(req, res) {
	res.status(404).send('<h1>요청하신 페이지는 없어요.</h1>')
});


var server = http.createServer(app).listen(app.get('port'), function() {
	console.log('익스프레스로 웹 서버를 실행함 : ' + app.get('port'));
});
