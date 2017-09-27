var express = require('express');
var app = express();

app.get('/', function(req,res){
  res.send("Dynosaur coming soon!");
});

app.get('*', function(req,res){
  res.sendFile('/home/billy/dynosaur/' + req.path);
});

app.listen(80);
