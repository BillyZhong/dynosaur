var a = new Runner(document.querySelectorAll('.interstitial-wrapper')[0],0);
var b = new Runner(document.querySelectorAll('.interstitial-wrapper')[1],1);

var inputs = [0,0,0,0,0,0,0,0,0,0,0];
var outputs = [0,0];
var learn = 1;

var data = [];


var net = new synaptic.Architect.LSTM(11,6,2);
var trainer = new synaptic.Trainer(net);
trainer.rate = 0.05;
trainer.iterations = 5000;
trainer.cost = synaptic.Trainer.cost.MSE;
trainer.log = 1000;
