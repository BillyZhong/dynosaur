var a = new Runner(document.querySelectorAll('.interstitial-wrapper')[0],0);
var b = new Runner(document.querySelectorAll('.interstitial-wrapper')[1],1);

var inputLayer = new synaptic.Layer(10);
var hiddenLayers = [new synaptic.Layer(8),new synaptic.Layer(4)];
var outputLayer = new synaptic.Layer(2);

inputLayer.project(hiddenLayers[0]);
hiddenLayers[0].project(hiddenLayers[1]);
hiddenLayers[1].project(outputLayer);

var net = new synaptic.Network({
	input: inputLayer,
	hidden: hiddenLayers,
	output: outputLayer
});
