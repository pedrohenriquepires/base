(function(){
	"use strict";

	var express = require("express"),
		config  = require("./config.json"),
		port 	= process.env.port || config.defaultPort,
		app 	= express(),
		http 	= require("http").Server(app);

	app.use(express.static("dist"));

	app.get("/", function() {
		res.sendFile(__dirname + "/index.html");
	});

	http.listen(port, function(){
		console.log("--- SERVER INIT ---");
		console.log("--- PORT " + port + "---");
	});	
})()