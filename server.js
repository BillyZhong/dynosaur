var express = require('express');
var app = express();

app.get('*', function(req,res){
  res.sendFile('/Users/billy/dynosaur/mdl' + req.path);
});

app.listen(8080);