var a = new Runner(document.querySelectorAll('.interstitial-wrapper')[0],0);
var b = new Runner(document.querySelectorAll('.interstitial-wrapper')[1],1);

var inputs = [0,0,0,0,0,0,0,0,0,0];
var outputs = [0,0];
var learn = 1;


var net = new synaptic.Architect.Liquid(10,20,2,30,10);
