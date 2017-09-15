var a = new Runner(document.querySelectorAll('.interstitial-wrapper')[0],0);
var b = new Runner(document.querySelectorAll('.interstitial-wrapper')[1],1);

var inputs = [0,0,0,0,0,0,0,0,0,0];
var outputs = [0,0];
var learn = 1;

var data = [];


var net = new synaptic.Architect.LSTM(10,6,2);
var trainer = new synaptic.Trainer(net);
