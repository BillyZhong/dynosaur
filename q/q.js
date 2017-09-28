var a = new Runner(document.querySelectorAll('.interstitial-wrapper')[0]);

var alpha = 0.05;
var gamma = 0.8;
var epsilon = 0.3;
var expsize = 5000;
var experiences = [];

var state = [0,0,0,0,0,0,0,0,0,0];
var action = 0;
var q = new synaptic.Architect.Perceptron(10,30,27,3);
q.layers.output.list[0].squash = synaptic.Neuron.squash.IDENTITY
q.layers.output.list[1].squash = synaptic.Neuron.squash.IDENTITY
q.layers.output.list[2].squash = synaptic.Neuron.squash.IDENTITY
