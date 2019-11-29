var express = require("express");
var app = express();
var mysql = require('mysql');
var mysqlsyn = require('sync-mysql');

var connection = mysql.createConnection({
	host     : '54.180.35.194',
	user     : 'root',
	password : '1234',
	database : 'sys'
});

var connectionsyn = new mysqlsyn({
	host     : '54.180.35.194',
	user     : 'root',
	password : '1234',
	database : 'sys'
});


connection.connect();

var logger = require('morgan');
var bodyParser = require('body-parser');
var request = require('request');
var moment = require('moment');
moment().format();
var apiRouter = express.Router();

var port = process.env.PORT || 3000;



app.use(logger('dev', {}));
app.use(bodyParser.json());

app.use('/api', apiRouter);
app.use(express.static(__dirname+'/public'));
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

//서버 test용 한지은 이민지
app.get('/', function(req, res) {
	res.render('hello');
});

//스킬 test용
apiRouter.post('/sayHello', function(req, res) {
	var responseBody = {
		version: "2.0",
		template: {
			outputs: [
				{
					simpleText: {
						text: "hello I'm Ryan"
					}
				}
			]
		}
	};

	res.status(200).send(responseBody);
});

//스킬 test용
apiRouter.post('/showHello', function(req, res) {
	console.log(req.body);

	var responseBody = {
		version: "2.0",
		template: {
			outputs: [
				{
					simpleImage: {
						imageUrl: "https://t1.daumcdn.net/friends/prod/category/M001_friends_ryan2.jpg",
						altText: "hello I'm Ryan"
					}
				}
			]
		}
	};

	res.status(200).send(responseBody);
});


apiRouter.post('/checkPeriod', function(req, res){
	console.log(req.body);
	var responseBody = {
		version: "2.0",
		data: {
			"check": "good" 
		}

	};	



	res.status(200).send(responseBody);
})


// 시작 api
apiRouter.post('/welcome', function(req, res){
	var bodyjson = req.body;
	console.log(bodyjson);
	var id = bodyjson.userRequest.user.id;
	var sql = "SELECT * FROM user WHERE kakaoId = ?;";
	connection.query(sql, [id], function(err, result){
		console.log(result);
		if(result.length == 0){ // 가입 안함
			var responseBody = {
				"version": "2.0",
				"template": {
					"outputs": [
						{
							"basicCard": {
								"description": "PayLoL은 간편하게 임금을 관리 해주는 임금관리 챗봇입니다. 근태관리부터 임금관리까지 소상공인을 돕는 임금관리봇, PayLoL!\n"+" 💰 페이롤 제공 서비스\n"+" ✅ 신한은행 API 를 통한 급여이체\n"+" ✅ 출결/임금 관리\n"+" ✅ 스마트 계약\n"+" 처음 이용하시면 계좌등록을 눌러주세요!\n"+"기존 고객은 시작하기를 눌러주세요!",
								"thumbnail": {
									"imageUrl": "https://firebasestorage.googleapis.com/v0/b/piko-mobile.appspot.com/o/%EC%8B%A0%ED%95%9C%ED%95%B4%EC%BB%A4%ED%86%A4.jpg?alt=media&token=7986b53b-799b-4678-a93d-5c03b211d42c"
								},
								"buttons": [
									{
										"action": "webLink",
										"label": "계좌등록",
										"webLinkUrl": "http://54.180.35.194:3000/api/enroll?id="+id
									},
									{
										"action": "block",
										"label": "시작하기",
										"blockId": "5d2c1cc2ffa7480001003c46"
									}
								]
							}
						}
					]
				}
			};

			res.status(200).send(responseBody);		  
		}else{// 이전에 방문했으면
			//예치금 다시 입력하기
			//가점 다시 계산하기
			//청약 추천 보기
			var responseBody = {
				"version": "2.0",
				"template": {
					"outputs": [
						{
							"basicCard": {

								"description":  "PayLoL은 간편하게 임금을 관리 해주는 임금관리 챗봇입니다. 근태관리부터 임금>관리까지 소상공인을 돕는 임금관리봇, PayLoL!\n"+" 💰 페이롤 제공 서비스\n"+" ✅ 신한은행 API 를 통한 급여이체\n"+" ✅ 출결/임금 관리\n"+" ✅ 스마트 계약\n",
								"thumbnail": {
									"imageUrl": "https://firebasestorage.googleapis.com/v0/b/piko-mobile.appspot.com/o/%EC%8B%A0%ED%95%9C%ED%95%B4%EC%BB%A4%ED%86%A4.jpg?alt=media&token=7986b53b-799b-4678-a93d-5c03b211d42c"

								},
								"buttons": [
									{
										"action": "block",
										"label": "계좌조회",
										"blockId": "5dd8c0df92690d000194fb1c"
									},
									{
										"action": "block",
										"label": "가게관리",
										"blockId": "5dda228db617ea0001b5ea87"

									},
									{
										"action":  "block",
										"label": "청약주택 추천받기",
										"blockId": "5d2a08abb617ea0001178d79"
									}
								]
							}
						}
					]
				}
			};

			res.status(200).send(responseBody);

		}
	})
})

//계좌 등록하기
app.post('/join', function(req, res){
	var body = req.body;
	var accessToken = req.body.accessToken;
	var useNum = req.body.useseqnum;
	var kakaoId = req.body.kakaoId;
	var account_num = req.body.account_num;
	console.log(body);
	console.log(accessToken, useNum);
	//var sql = "INSERT INTO user (kakaoId, name, accessToken, useseqnum) VALUES ('"+id+"','한지은','6f806275-5e56-4a66-9bf2-10129ad56752','1100035222')";
	if(accessToken.length == 0){
		console.log("계좌인증부터하시라!")
		res.json(-1);	
	}else{
		var sql = 'INSERT INTO user (kakaoId,  accessToken, useseqnum) VALUES (?,?,?);'
		connection.query(sql,[kakaoId, accessToken, useNum], function (error, results) {
			if (error) throw error;  
			else {
				console.log(this.sql);
				res.json(1);
			}
		});}
})

//계좌없이 시작하기
apiRouter.post('/testenroll', function(req,res){

	var bodyjson = req.body;
	console.log(bodyjson);
	var id = bodyjson.userRequest.user.id;
	var sql = "INSERT INTO user (kakaoId, name, accessToken, useseqnum) VALUES ('"+id+"','OOO','6f806275-5e56-4a66-9bf2-10129ad56752','1100035222')";


	connection.query(sql, function(err, result){
		console.log(result);
		console.log(err);
	})

	var responseBody = {
		version: "2.0",
		data: {
			"name": "OOO"
		}

	};	

	res.status(200).send(responseBody);		 

})

apiRouter.post('/transaction', function(req, res){

	var bodyjson = req.body;
	console.log(bodyjson);
	var id = bodyjson.userRequest.user.id;

	var sql = "SELECT * FROM user WHERE kakaoId = ?";

	var result = connectionsyn.query(sql, [id]);
	console.log(id);
	console.log(result.length);
	//계좌 등록 안했으면!!
	if(result.length == 0){
		var responseBody = {
			"version": "2.0",
			"template": {
				"outputs": [

					{
						"basicCard": {
							"description": "안녕하세요! 카톡으로 간편하게 주택 청약 관련 서비스 이용을 도와드리는 청약봇입니다.\n\n 청약점수계산·당첨확률예상 등 청약 관련 서비스를 제공합니다. 현재 보유하고 계신 청약이 있으시다면 [계좌등록]을 눌러서 서비스를 이용해보세요.😊🏠",
							"thumbnail": {
								"imageUrl": "https://i.imgur.com/X83c7Wl.jpg"
							},
							"buttons": [
								{
									"action": "webLink",
									"label": "계좌등록",
									"webLinkUrl": "http://54.180.35.194/api/enroll?id="+id
								},
								{
									"action": "block",
									"label": "시작하기",
									"blockId": "5d2c1cc2ffa7480001003c46"
								},
								{
									"action":  "block",
									"label": "계좌없이 시작하기",
									"blockId": "5d30356eb617ea0001da2890"
								}

							]
						}
					},
					{
						"simpleText": {
							"text": "등록된 계좌가 없습니다."
						}
					}
				]
			}
		};
		res.status(200).send(responseBody);
	}else{
		//계좌 정보 가져오기
		console.log(result);
		var accessToken = result[0].accessToken;
		var useseqnum = result[0].useseqnum;	

		var user_seq_no = useseqnum;
		var qs = "?user_seq_no="+user_seq_no;
		var getAccountUrl = "https://testapi.open-platform.or.kr/user/me"+qs;
		var option = {
			method : "GET",
			url : getAccountUrl,
			headers : {
				"Authorization" : "Bearer "+accessToken
			}

		};
		request(option, function(err, response, body){
			if(err) throw err;
			else {
				console.log(body);
				var accessRequestResult = JSON.parse(body);
				var name = accessRequestResult.user_name;			
				console.log("name:"+name);
				var finnum = accessRequestResult.res_list[0].fintech_use_num;
				console.log("finnum:"+finnum);
				var bank = accessRequestResult.res_list[0].bank_name;
				console.log("bank:"+bank);
				var account = accessRequestResult.res_list[0].account_num_masked;
				console.log("account:"+account);


				var sql = "UPDATE user SET name = '"+name+"', fintechnum = '"+finnum+"' where kakaoId = '"+id+"'";
				connection.query(sql, function(err, result){
					console.log("update:"+result);
					console.log(err);

				}
				)


				let tempPassword = "";

				for(var i=0; i<8; i++){ var rndVal = (Math.random() * 62); if(rndVal < 10) { tempPassword += rndVal; } else if(rndVal > 35) { tempPassword += (rndVal + 61); } else { tempPassword += (rndVal + 55); } }

				var  bank_tran_id = "T991600590U" + Math.floor(100000000 + Math.random() * 900000000);
				console.log("뱅크:"+bank_tran_id);

				//계좌 거래내역 가져오기
				//                var bank_tran_id="T991600590U33AYADZZZ"
				var fintech_use_num = finnum;
				var inquiry_type = "A";
				var inquiry_base = "D";

				var from_date = "20000718";
				var to_date = "20191124";
				var sort_order = "D";			
				var page_index = "1";
				var tran_dtime = "20191124101921";
				//	var befor_inquiry_trace_info = "123";
				//	var list_tran_seqno = "0";		
				var qs = "?bank_tran_id="+bank_tran_id+"&"
					+"fintech_use_num="+fintech_use_num+"&"  				        + "inquiry_type="+inquiry_type+"&"			+"inquiry_base="+inquiry_base+"&"			+ "from_date="+from_date+"&" + "to_date="+to_date+"&"  	    	    	    	    	    							                                + "sort_order="+sort_order+"&"    + "tran_dtime="+tran_dtime+"&"

				var qs1 = "?bank_tran_id="+bank_tran_id+"&" +"fintech_use_num="+fintech_use_num+"&" + "tran_dtime="+tran_dtime
				var getBalanceUrl = "https://testapi.open-platform.or.kr/v2.0/account/balance/fin_num"+qs1;

				var option = {
					method : "GET",
					url : getBalanceUrl,
					headers : {
						Authorization : "Bearer "+accessToken
					}

				};


				request(option,function(err,response,body){
					if(err) {
						console.log("에러임둥");
						throw err;}
					else{
						var accessRequestResult = JSON.parse(body);
						var balance = accessRequestResult.balance_amt;
						var sql = "UPDATE user SET money = '"+balance+"'";
						console.log("뭐들어잇노 : "+body);
						console.log("내잔액:"+balance);
						responseBody = {
							version: "2.0",
							template: {
								outputs: [
									{
										simpleText: {
											text: name+"님의 계좌등록이 완료되었습니다!\n"+"아래내용을 확인해주요.\n"                                                                                                                                                                                                                                                                                          +"―――――――\n"+"✨ 은행명 :"+bank+"\n"+"✨ 계좌번>호 :"+account+"\n"+"잔액:"+balance
										}
									}
								]
							}
						};
						res.status(200).send(responseBody);

					}

				})
			}
		})
	}})


//예치금 입력받기
apiRouter.post('/testbalance', function(req, res){
	console.log(req.body);

	//console.log(req.body);
	var bodyjson = req.body;
	var params = bodyjson.action.params;
	var testbalJson = JSON.parse(params.testbal);
	var testbal = testbalJson.amount * 10000;


	var id = bodyjson.userRequest.user.id;	

	//db query score update
	var sql = "UPDATE user SET money = "+testbal+" where kakaoId = '"+id+"'";
	connection.query(sql, function(err, result){
		console.log(result);

	})


	var responseBody = {
		version: "2.0"
	}

	res.status(200).send(responseBody);


})





//계좌 등록 페이지로 이동
apiRouter.get('/enroll', function(req, res, next){
	res.render('enroll');
});

// 콜백 api
apiRouter.get('/callback', function(req, res) {
	var authcode = req.query.code;
	console.log("callback 들어오니??");
	console.log(authcode);


	var getTokenUrl = "https://testapi.open-platform.or.kr/oauth/2.0/token"
	var option = {
		method : "POST",
		url : getTokenUrl,
		headers : {

		},
		form : {
			code : authcode,
			client_id : "1vVc97OYjdbYpG8V5ZYqjhs1G0NnSRGnf8N2v1LC",
			client_secret : "3EDg9EcBzScRFVvJAkz1vqKMTpJLM6zSnEH74ts4",
			redirect_uri : "http://54.180.35.194:3000/api/callback",
			grant_type : "authorization_code"
		}
	}



	request(option, function(err, response, body){
		if(err) throw err;
		else {
			console.log(body);
			var accessRequestResult = JSON.parse(body);
			console.log(accessRequestResult);
			res.render('resultChild', {data : accessRequestResult});
		}
	})
})

app.listen(port);

console.log("Listening on Port", port);



apiRouter.post('/barcode', function (req, res) {

	var bodyjson = req.body;
	console.log(bodyjson);
	var id = bodyjson.userRequest.user.id;
	var qrdata = bodyjson.action.params.barcode;
	var work = "출근";
	var d = new Date();
	var currentDate = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();



	var currentTime = d.getHours() + ":" + d.getMinutes();

	var sql = "INSERT INTO test VALUES ('" + id + "','" + qrdata.substring(16, qrdata.length - 2) + "' ,'" + currentDate + "' ,'" + currentTime + "','" + work + "' )";

	connection.query(sql, function (err, result) {
		console.log(result);
		console.log(err);
	})

	var responseBody = {
		"version": "2.0",
		"template": {
			"outputs": [

				{
					"simpleText": {
						"text": "출근 처리가 완료 됐습니다."
					}
				}
			]
		}
	};
	console.log(responseBody);
	res.status(200).send(responseBody);

})







apiRouter.post('/barcode_out', function (req, res) {

	var bodyjson = req.body;
	console.log(bodyjson);
	var id = bodyjson.userRequest.user.id;
	var qrdata = bodyjson.action.params.outbarcode;

	var work = "퇴근";
	var d = new Date();
	var currentDate = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();



	var currentTime = d.getHours()  + ":" + d.getMinutes();




	var sql = "SELECT * FROM test WHERE id = ? and date = ? and  type ='출근' ";     //출근시간 뽑아오기

	var result = connectionsyn.query(sql, [id,currentDate]);         // SQL 가동

	var startHour = result[0].time.substring(0,1);
	var startMin = result[0].time.substring(3,result[0].time.length);

	//sql2 =  출근 시간
	console.log(result);

	var workHour;
	var workMinute;

	if (startMin <= d.getMinutes()) {

		workHour = d.getHours() - startHour;
		workMinute = d.getMinutes() - startMin;
	}
	else {

		workHour = d.getHours() - startHour - 1;
		workMinute =( d.getMinutes()+60)  - startMin;
	}


	if(workMinute <60 && workMinute>=30 ) 
		workHour += 0.5 ; 
	var workTime = workHour;


	// 총 토탈 시간 계산해서 집어 넣기
	var sql = "INSERT INTO total_work VALUES ('" + id + "','" + qrdata.substring(16, qrdata.length - 2) + "' ,'" + currentDate + "' ,'" + workTime + "' )";


	connection.query(sql, function (err, result) {              // sql 문 실행 코드
		console.log(result);
		console.log(err);
	})



	var sql = "INSERT INTO test VALUES ('" + id + "','" + qrdata.substring(16, qrdata.length - 2) + "' ,'" + currentDate + "' ,'" + currentTime + "','" + work + "' )";


	connection.query(sql, function (err, result) {              // sql 문 실행 코드
		console.log(result);
		console.log(err);
	})



	var responseBody = {
		"version": "2.0",
		"template": {
			"outputs": [

				{
					"simpleText": {
						"text": "퇴근 처리가 완료 됐습니다."
					}
				}
			]
		}
	};

	res.status(200).send(responseBody);                   // 응답값

})

apiRouter.post('/search_account', function(req, res) {
	var bodyjson = req.body;
	console.log(bodyjson);
	var id = bodyjson.userRequest.user.id;

	var sql = "select * from user where kakaoId = ?"

	var result = connectionsyn.query(sql, [id]);
	console.log(result);

	var accessToken = result[0].accessToken;
	var useseqnum = result[0].useseqnum;
	var fin_num = result[0].fintechnum;
	var user_seq_no= useseqnum;

	var qs = "?user_seq_no="+user_seq_no;
	var addUrl = "&include_cancel_yn=Y&sort_order=D"
	var getAccountListUrl = "https://testapi.open-platform.or.kr/v2.0/account/list"+qs+addUrl;

	var option = {
		method : "GET",
		url : getAccountListUrl,
		headers : {
			"Authorization" : "Bearer "+accessToken
		}
	};
	request(option, function(err, response, body){
		if(err) throw err;
		else{
			console.log(body);
			var accessRequestResult = JSON.parse(body);
			var name = accessRequestResult.user_name;
			console.log("name:"+name);

			var length = accessRequestResult.res_list.length;
			var account_alias = new Array();
			var bank_name = new Array();
			var account_balance = new Array();
			for(var i = 0; i < length; i++){                                                                                                                                                            account_alias.push(accessRequestResult.res_list[i].account_alias);
				bank_name.push(accessRequestResult.res_list[i].bank_name)

			}

			//					
			let tempPassword = "";

			for (var i = 0; i < 8; i++) { var rndVal = (Math.random() * 62); if (rndVal < 10) { tempPassword += rndVal; } else if (rndVal > 35) { tempPassword += (rndVal + 61); } else { tempPassword += (rndVal + 55); } }

			var bank_tran_id = "T991600590U" + Math.floor(100000000 + Math.random() * 900000000);
			console.log("뱅크:" + bank_tran_id);
			var inquiry_type = "A";
			var inquiry_base = "D";

			var from_date = "20000718";
			var to_date = "20191124";
			var sort_order = "D";
			var page_index = "1";
			var tran_dtime = "20191124101921";

			var qs1 = "?bank_tran_id=" + bank_tran_id + "&" + "fintech_use_num=" + fin_num + "&" + "tran_dtime=" + tran_dtime
			var getBalanceUrl = "https://testapi.open-platform.or.kr/v2.0/account/balance/fin_num" + qs1;


			var option = {
				method: "GET",
				url: getBalanceUrl,
				headers: {
					Authorization: "Bearer " + accessToken
				}
			};
			request(option, function (err, response, body) {
				if (err) {
					console.log("에러임둥");
					throw err;
				}
				else {
					var accessRequestResult = JSON.parse(body);
					var balance = accessRequestResult.balance_amt;
					var sql = "UPDATE user SET money = '" + balance + "'";
					console.log("뭐들어잇노 : " + body);
					console.log("내잔액:" + balance);
					for(var i = 0; i < length; i++){								                                                                                             
						account_balance.push(balance);
					}
					var al = [];
					for(var i=0; i<length; i++){
						var items = '{'+'"title": "'+bank_name[i]+'", "description": "-계좌잔액:'+account_balance[i]+'","thumbnail": { "imageUrl": "http://k.kakaocdn.net/dn/83BvP/bl20duRC1Q1/lj3JUcmrzC53YIjNDkqbWK/i_6piz1p.jpg" },'+'"buttons": [{"action": "webLink", "label": "상세보기"},{"action":  "block", "label": "계좌 확인"}]'+'}';
						console.log(items)
						var it = JSON.parse(items);
						al.push(it);										                                                                                        }
					var responseBody = {
						"version": "2.0",
						"template": {
							"outputs": [
								{
									"basicCard": {
										"title": "✔️ 분석 완료 ",
										"description": name+"님의 등록된 계좌는" +length +"개 입니다.",
										"thumbnail": {
											"imageUrl": "https://i.imgur.com/n308Vha.jpg"
										}
									}
								},
								{
									"carousel": {
										"type": "basicCard",
										"items": al
									}

								}
							]
						}
					};
				}
				res.status(200).send(responseBody);
			})

		}
		//


	});

})

apiRouter.post('/withdraw', function(req, res){
	var bodyjson = req.body;
	var id = bodyjson.userRequest.user.id;

	var sql = "select * from user where kakaoId = ?"

	var result = connectionsyn.query(sql, [id]);

	var accessToken = result[0].accessToken;
	var useseqnum = result[0].useseqnum;
	var name = result[0].name;
	var fintech_use_num = result[0].fintechnum;
	console.log(fintech_use_num+ "핀테크");
	var paylol_account_num = "67520200041120";

	let tempPassword = "";

	for(var i=0; i<8; i++){ var rndVal = (Math.random() * 62); if(rndVal < 10) { tempPassword += rndVal; } else if(rndVal > 35) { tempPassword += (rndVal + 61); } else { tempPassword += (rndVal + 55); } }

	//bank_tran_id = "T991600590UA"+tempPassword
	var  bank_tran_id = "T991600590U" + Math.floor(100000000 + Math.random() * 900000000);

	console.log(bank_tran_id);

	var getwithdrawUrl = "https://testapi.open-platform.or.kr/v2.0/transfer/withdraw/fin_num"
	var option = {
		method : "POST",
		url : getwithdrawUrl,
		headers : {
			Authorization : "Bearer "+accessToken,
			"Content-Type": "application/json; charset=UTF-8"
		},
		json : {
			"bank_tran_id":bank_tran_id,
			"cntr_account_type": "N",
			"cntr_account_num" : paylol_account_num,
			"dps_print_content": name,
			"fintech_use_num" : fintech_use_num,
			"tran_amt": "100000",
			"tran_dtime": "20191129101921",
			"req_client_name": name,
			"req_client_num": "WITHDRAW1",
			"transfer_purpose" : "TR",
			"req_client_fintech_use_num" : fintech_use_num
		}
	}

	request(option, function(err, response, body){
		if (err) throw err;
		else{

			console.log("body");
			console.log(body);

			responseBody = {
				"version": "2.0",
				"template": {
					"outputs": [
						{
							"basicCard": {
								"title": "✔️ 출금이체 완료 ",						
								"description": name+"님의 출금이체가 정상적으로 완료되었습니다.",
								"thumbnail": {
									"imageUrl": "https://i.imgur.com/n308Vha.jpg"
								}

							}
						}
					]
				}
			}
		}
		console.log(responseBody);
		res.status(200).send(responseBody);
	});


})







apiRouter.post('/wage', function (req, res) {
	var bodyjson = req.body;
	console.log("임금조회임다"+bodyjson);
	var id = bodyjson.userRequest.user.id;
	var d = new Date();
	var currentDate = "%"+ d.getFullYear() + "-" + (d.getMonth() + 1) +"%";
	var sql = "SELECT * FROM worker WHERE id = ? "
	var result = connectionsyn.query(sql, [id]);
	var name = result[0].name;
	var hour_wage = result[0].minimum_wage;         // 8530
	var sql = "SELECT count(*) as cnt FROM total_work WHERE id = ? and date like ? "
	var result = connectionsyn.query(sql, [id,currentDate]);
	var work_cnt = result[0].cnt;
	console.log("ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ"+result);
	var sql = "SELECT sum(work) as work FROM total_work WHERE id =? and date like ? "
	var result = connectionsyn.query(sql, [id,currentDate]);
	var total_work_hour = result[0].work;
	var my_wage = total_work_hour *hour_wage;
	var month_date = (d.getMonth()+1);
	var tax = my_wage * 0.045;
	var total_wage = (my_wage - tax);

	console.log("ㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎㅎ"+result[0].work);
	//	var responseBody = {
	//		"version": "2.0",
	//		"template": {
	//			"outputs": [
	//
	//				{
	//					"simpleText": {
	//						"text": name + "님의 " + (d.getMonth() + 1) +"월 임금 현황 \n" 
	//						+ "-----------------------------------------\n" + "✨ 총 근무일 :" + work_cnt +"일" + "\n" + "✨ 총 근무시간 :" + total_work_hour + "시간" + "\n" + "✨ 총 급여 :" + total_work_hour * hour_wage+"원" + "\n" + "✨ 월급지급액 :" + (d.getMonth() + 1) +"월"+"30일"									}
	//				}
	//			]
	//		}
	//	};
	responseBody = {
		version: "2.0",
		data: {
			"name": name,
			"work_cnt": work_cnt,
			"total_work_hour":total_work_hour,
			"mywage":my_wage,
			"tax":tax,
			"total_wage": total_wage

		}

	};
	res.status(200).send(responseBody);                   // 응답값

})


//가게등록
apiRouter.post('/enroll_myshop', function (req, res) {

	var bodyjson = req.body;
	console.log(bodyjson);
	var id = bodyjson.userRequest.user.id;
	var qrdata = bodyjson.action.params.barcode;


	var sql = "INSERT INTO my_shop VALUES ('" + id + "','" + qrdata.substring(16, qrdata.leng)+"')"

	connection.query(sql, function (err, result) {              // sql 문 실행 코드 
		console.log(result);
		console.log(err);
	})

	var responseBody = {
		"version": "2.0",
		"template": {
			"outputs": [

				{
					"simpleText": {
						"text": "가게 등록이 완료 됐습니다."
					}
				}
			]
		}
	};

	res.status(200).send(responseBody);                   // 응답값 

})


apiRouter.post('/enroll_worker', function (req, res) {

	var bodyjson = req.body;
	console.log("워커"+bodyjson);
	var id = bodyjson.userRequest.user.id;

	var name = bodyjson.action.params.bot_name;
	var wage = bodyjson.action.params.bot_minimum_wage;

	var sql = "SELECT * FROM my_shop WHERE id = ? "    

	var result = connectionsyn.query(sql, [id]);

	var barcode = result[0].barcode; 

	console.log("zzzzzzzzzzzzzzzzzzzzzzzzzz"+name);
	console.log("zㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ"+wage);

	var sql = "INSERT INTO worker (name, id, minimum_wage, barcode) VALUES ('" + name + "','"+id+"','" + wage + "','" + barcode+ "' )";


	connection.query(sql, function (err, result) {              // sql 문 실행 코드 
		console.log(result);
		console.log(err);
	})

	var responseBody = {
		"version": "2.0",
		"template": {
			"outputs": [

				{
					"simpleText": {
						"text": "근로자 등록이 완료 됐습니다."
					}
				}
			], 
			 "quickReplies": [
				 				{
														"label": "이전으로",
														"action": "block",
														"blockId": "5dda228db617ea0001b5ea87"
													}
			]
		}
	};

	res.status(200).send(responseBody);                   // 응답값 

})

//근로자확인하기
apiRouter.post('/info_worker', function (req, res) {

	var bodyjson = req.body;
	console.log(bodyjson);
	var id = bodyjson.userRequest.user.id;

	var sql = "SELECT * FROM my_shop WHERE id = ? "    //id 에 따른 바코드 뽑아오기 바코드 = 나의 가게 


	var result = connectionsyn.query(sql, [id]);

	var barcode = result[0].barcode;

	var sql = "SELECT * FROM worker WHERE barcode = ? "

	var result = connectionsyn.query(sql, [barcode]);

	var name = new Array();                          //내 가게에서 일하고 있는 놈 저장 

	for (var i = 0; i < result.length; i++)
		name[i] = result[i].name;

	var al = [];
	for (var i = 0; i < name.length; i++) {
		var items = '{' + '"title": "' +"이름:" +name[i]+ '", "description": "임금정산' + name[i] + '","thumbnail": { "imageUrl": "http://k.kakaocdn.net/dn/83BvP/bl20duRC1Q1/lj3JUcmrzC53YIjNDkqbWK/i_6piz1p.jpg" },' + '"buttons": [{"action": "block", "label": "임금 이체","blockId":"5dda743bffa7480001554a26"},{"action":  "block", "label": "계좌 확인"}]' + '}';
		console.log(items);
		var it = JSON.parse(items);
		al.push(it);
	}
	var responseBody = {
		"version": "2.0",
		"template": {
			"outputs": [
				{
					"basicCard": {
						"title": "✔️ 근로자 이름 ",
						"description": "호호",
						"thumbnail": {
							"imageUrl": "https://i.imgur.com/n308Vha.jpg"
						}
					}
				},
				{
					"carousel": {
						"type": "basicCard",
						"items": al
					}

				}
			]
		}
	};

	res.status(200).send(responseBody);
})

apiRouter.post('/deposit', function(req, res){
	var bodyjson = req.body;
	console.log(bodyjson);
	var id = bodyjson.userRequest.user.id;

	var sql = "select * from user where kakaoId = ?";

	var paylolToken = "862627c9-0c49-44cd-97b9-268404702fdb";

	var result = connectionsyn.query(sql, [id]);
	console.log(result);


	var useseqnum = result[0].useseqnum;
	var name = result[0].name;
	var fintech_use_num = result[0].fintechnum;

	var bank_tran_id = "T991600590U" + Math.floor(100000000 + Math.random() * 900000000);

	var getTokenUrl = "https://testapi.open-platform.or.kr/v2.0/transfer/deposit/fin_num"

	var option = {
		method : "POST",
		url : getTokenUrl,
		headers : {
			Authorization : "Bearer "+paylolToken
		},
		json : {
			"cntr_account_type": "N",
			"cntr_account_num": "67520200041120",
			"wd_pass_phrase": "NONE",
			"wd_print_content": "환불금액",
			"name_check_option": "off",
			"tran_dtime": "20191123101921",
			"req_cnt": "1",
			"req_list": [
				{
					"tran_no": "1",
					"bank_tran_id": bank_tran_id,
					"fintech_use_num": "199160059057881018769540",
					"print_content": "ㅎㅎ",
					"tran_amt": "500",
					"req_client_name":"전기태",
					"req_client_num":"JEONGITAE1",
					"transfer_purpose":"TR",
					"req_client_fintech_use_num": "199160059057881018767310"
				}]


		}
	}

	request(option, function(err, response, body){
		if (err) throw err;
		else{
			console.log(body);
			responseBody = {
				"version": "2.0",
				"template": {
					"outputs": [
						{
							"basicCard": {
								"title": "✔️ 입금이체 완료 ",						
								"description": name+"님의 출금이체가 정상적으로 완료되었습니다.",
								"thumbnail": {
									"imageUrl": "https://i.imgur.com/n308Vha.jpg"
								}
							}
						}
					]
				}
			}}
		console.log(responseBody);
		res.status(200).send(responseBody)
	});
})













apiRouter.post('/transaction_his', function (req, res) {

	var bodyjson = req.body;
	console.log(bodyjson);
	var id = bodyjson.userRequest.user.id;

	var sql = "SELECT * FROM user WHERE kakaoId = ?";

	var result = connectionsyn.query(sql, [id]);
	//var qrdata = bodyjson.action.params.barcode;



	var accessToken = result[0].accessToken;
	var useseqnum = result[0].useseqnum;
	var fintech_use_num = result[0].fintechnum;
	var bank_tran_id = "T991600590U" + Math.floor(100000000 + Math.random() * 900000000);
	var inquiry_type = "A";
	var inquiry_base = "D";
	var from_date = "20191115";   //조회 시작 일자   .cf) 지금은 임의로 넣었음, 나중에는 사용자가 조회 일자 선택하게 해야될듯 ?
	var to_date = "20191124";   //조회 종료 일자     .cf) 이것도 위에랑 마찬가지 ㅋ
	var sort_order = "D";
	var tran_dtime = "20191124113345";   // 요청일시  .cf ) 이것도 임의로 넣었음 제대로 할라면 자바 시간 받아서 해야될듯



	var qs = "?bank_tran_id=" + bank_tran_id + "&"
		+ "fintech_use_num=" + fintech_use_num + "&" + "inquiry_type=" + inquiry_type + "&" + "inquiry_base=" + inquiry_base + "&" + "from_date=" + from_date + "&" + "to_date=" + to_date + "&" + "sort_order=" + sort_order + "&" + "tran_dtime=" + tran_dtime;

	//var qs1 = "?bank_tran_id=" + bank_tran_id + "&" + "fintech_use_num=" + fintech_use_num + "&" + "tran_dtime=" + tran_dtime
	var getBalanceUrl = "https://testapi.open-platform.or.kr/v2.0/account/transaction_list/fin_num" + qs;


	var option = {

		method: "GET",

		url: getBalanceUrl,

		headers: {

			Authorization: "Bearer " + accessToken

		}

	};


	request(option, function (err, response, body) {
		if (err) {
			console.log("에러임둥");
			throw err;
		}
		else {
			var accessRequestResult = JSON.parse(body);
			var balance = accessRequestResult.balance_amt;
			console.log("뭐들어잇노 : " + body);
			console.log("내잔액:" + balance);




			var tran_date = new Array();
			var tran_time = new Array();
			var tran_amt = new Array();
			var after_balance_amt = new Array();
			var branch_name = new Array();

			var len = accessRequestResult.res_list.length;

			for (var i = 0; i < len; i++) {

				tran_date[i] = accessRequestResult.res_list[i].tran_date;
				tran_time[i] = accessRequestResult.res_list[i].tran_time;
				tran_amt[i] = accessRequestResult.res_list[i].tran_amt;
				after_balance_amt[i] = accessRequestResult.res_list[i].after_balance_amt;
				branch_name[i] = accessRequestResult.res_list[i].branch_name;

			}

			for(var i=0 ; i<len ; i ++) 
				console.log("ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ" +branch_name[i]);


			var al = [];
			for (var i = 0; i < len; i++) {

				//'{' + '"title": "' +"근로자" + '", "description": "이름:' + name[i] + '","thumbnail": { "imageUrl": "http://k.kakaocdn.net/dn/83BvP/bl20duRC1Q1/lj3JUcmrzC53YIjNDkqbWK/i_6piz1p.jpg" },' + '"buttons": [{"action": "webLink", "label": "임금 확인"},{"action":  "block", "label": "계좌 확인"}]' + '}';
				var items = '{' + '"title": "' + "거래일: " + tran_date[i] + "\n거래시각: " + tran_time[i] + "\n거래금액: " + tran_amt[i]  +"\n거래후 잔액: "+after_balance_amt[i]  + "\n거래한 은행: " +branch_name[i]   + '", "description": "' + '","thumbnail": { "imageUrl": "http://k.kakaocdn.net/dn/83BvP/bl20duRC1Q1/lj3JUcmrzC53YIjNDkqbWK/i_6piz1p.jpg" },' + '"buttons": [{"action": "webLink", "label": "최근거래내역 입니다."}]' + '}';
				console.log(items)
				var it = JSON.parse(items);
				al.push(it);
			}




			var responseBody = {
				"version": "2.0",
				"template": {
					"outputs": [
						{
							"basicCard": {
								"title": "✔️ 최근거래내역 ",
								"description": "최근10건만 표시됩니다.",
								"thumbnail": {
									"imageUrl": "https://i.imgur.com/n308Vha.jpg"
								}
							}
						},
						{
							"carousel": {
								"type": "basicCard",
								"items": al
							}

						}
					]
				}
			};
			res.status(200).send(responseBody);

		}		

	})


})


apiRouter.post('/account_deposit', function(req, res){
	var bodyjson = req.body;
	console.log(bodyjson);
	var id = bodyjson.userRequest.user.id;

	var sql = "select * from user where kakaoId = ?";

	var paylolToken = "862627c9-0c49-44cd-97b9-268404702fdb";

	var result = connectionsyn.query(sql, [id]);
	console.log(result);


	var useseqnum = result[0].useseqnum;
	var name = result[0].name;
	var fintech_use_num = result[0].fintechnum;

	var bank_tran_id = "T991600590U" + Math.floor(100000000 + Math.random() * 900000000);

	var getTokenUrl = "https://testapi.open-platform.or.kr/v2.0/transfer/deposit/acnt_num"

	var option = {
		method : "POST",
		url : getTokenUrl,
		headers : {
			Authorization : "Bearer "+paylolToken
		},
		json : {
			"cntr_account_type": "N",
			"cntr_account_num": "67520200041120",
			"wd_pass_phrase": "NONE",
			"wd_print_content": "adsafsdf",
			"name_check_option": "off",
			"tran_dtime": "20191123101921",
			"req_cnt": "1",
			"req_list": [
				{
					"tran_no" : "1",
					"bank_tran_id" : bank_tran_id,
					"bank_code_std" : "097",
					"account_num" : "11111111111",
					"account_holder_name" : "안지훈",
					"print_content" : "송금",
					"tran_amt" : "5000",
					"req_client_name" : "전기태",
					"req_client_num" : "JEONGITAE1",
					"req_client_fintech_use_num" : fintech_use_num,
					"transfer_purpose": "TR"
				}]
		}       
	}

	request(option, function(err, response, body){
		if (err) throw err;
		else{
			console.log(body);
			responseBody = {
				"version": "2.0",
				"template": {
					"outputs": [
						{
							"basicCard": {
								"title": "✔️ 입금이체 완료 ",						
								"description": name+"님의 입금이체가 정상적으로 완료되었습니다.",
								"thumbnail": {
									"imageUrl": "https://i.imgur.com/n308Vha.jpg"
								}
							}
						}
					]
				}
			}}
		console.log(responseBody);
		res.status(200).send(responseBody)
	});
})



apiRouter.post('/bank_transfer', function(req, res){
	var bodyjson = req.body;
	console.log(bodyjson);
	var id = bodyjson.userRequest.user.id;

	var sql = "select * from user where kakaoId = ?"

	var result = connectionsyn.query(sql, [id]);
	console.log(result);

	var accessToken = result[0].accessToken;
	var useseqnum = result[0].useseqnum;
	var name = result[0].name;
	var fintech_use_num = result[0].fintechnum;

	let tempPassword = "";


	bank_tran_id = "T991600590U"+Math.floor(100000000 + Math.random() * 900000000);


	var getwithdrawUrl = "https://testapi.open-platform.or.kr/v2.0/transfer/withdraw/fin_num"
	var option = {
		method : "POST",
		url : getwithdrawUrl,
		headers : {
			Authorization : "Bearer "+accessToken
		},
		json : {
			"bank_tran_id":bank_tran_id,
			"cntr_account_type": "N",
			"cntr_account_num" : "67520200041120",
			"dps_print_content": name,
			"fintech_use_num" : fintech_use_num,
			"tran_amt": "100000",
			"tran_dtime": "20191123101921",
			"req_client_name": name,
			"req_client_num": "JEONGITAE1",
			"transfer_purpose" : "TR",
			"req_client_fintech_use_num" : fintech_use_num
		}
	}

	request(option, function(err, response, body){
		if (err) throw err;
		else{



		}
	});

	var getdepositUrl = "https://testapi.open-platform.or.kr/v2.0/transfer/deposit/acnt_num"


	var bank_tran_id = "T991600590U" + Math.floor(100000000 + Math.random() * 900000000);

	var paylolToken = "862627c9-0c49-44cd-97b9-268404702fdb";



	var option = {
		method : "POST",
		url : getdepositUrl,
		headers : {
			Authorization : "Bearer "+paylolToken
		},
		json : {
			"cntr_account_type": "N",
			"cntr_account_num": "67520200041120",
			"wd_pass_phrase": "NONE",
			"wd_print_content": "adsafsdf",
			"name_check_option": "off",
			"tran_dtime": "20191123101921",
			"req_cnt": "1",
			"req_list": [
				{
					"tran_no" : "1",
					"bank_tran_id" : bank_tran_id,
					"bank_code_std" : "097",
					"account_num" : "11111111111",
					"account_holder_name" : "안지훈",
					"print_content" : "송금",
					"tran_amt" : "5000",
					"req_client_name" : "전기태",
					"req_client_num" : "JEONGITAE1",
					"req_client_fintech_use_num" : fintech_use_num,
					"transfer_purpose": "TR"
				}]
		}       
	}

	request(option, function(err, response, body){
		if (err) throw err;
		else{
			console.log(body);
			var accessRequestResult = JSON.parse(JSON.stringify(body));
			console.log(accessRequestResult);
			var tran_amt = accessRequestResult.res_list[0].tran_amt;
			responseBody = {
				"version": "2.0",
				"template": {
					"outputs": [
						{
							"basicCard": {
								"title": "✔️ 입금이체 완료 ",						
								"description": name+"님에게 " + tran_amt + "원 입금이체가 정상적으로 완료되었습니다.",
								"thumbnail": {
									"imageUrl": "https://i.imgur.com/n308Vha.jpg"
								}
							}
						}
					]
				}
			}}
		console.log(responseBody);
		res.status(200).send(responseBody)
	});
})


