var a = new Runner(document.querySelectorAll('.interstitial-wrapper')[0]);

var alpha = 0.01;
var gamma = 0.9;
var epsilon = 0.2;
var expsize = 5000;
var experiences = [];

var state = [0,0,0,0,0,0,0,0,0,0,0];
var action = 0;
var q = new synaptic.Architect.Perceptron(11,33,27,3);
q.layers.output.list[0].squash = synaptic.Neuron.squash.IDENTITY
q.layers.output.list[1].squash = synaptic.Neuron.squash.IDENTITY
q.layers.output.list[2].squash = synaptic.Neuron.squash.IDENTITY

var exportJSON = function(){
  var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({q:q.toJSON(),e:experiences}));
  var ae = document.createElement('a');
  ae.href = 'data:' + data;
  ae.download = 'population.json';
  ae.click();
};

var importJSON = function(files){
  if(!files){
    var upload = document.createElement('input');
    upload.innerHTML = '<input type="file" accept="application/json" onchange="importJSON(this.files)"/>';
    upload = upload.firstChild;
    upload.click();
  }
  else{
    var fr = new FileReader();
    fr.onload = function(e) {
      var res = JSON.parse(e.target.result);
      q = synaptic.Network.fromJSON(res.q);
      experiences = res.e;
    }
    fr.readAsText(files.item(0));
  }
};
