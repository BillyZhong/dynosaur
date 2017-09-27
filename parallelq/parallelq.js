var alpha = 0.05;
var gamma = 0.8;
var epsilon = 0.3;

var q = new synaptic.Architect.Perceptron(10,30,27,3);
q.layers.output.list[0].squash = synaptic.Neuron.squash.IDENTITY
q.layers.output.list[1].squash = synaptic.Neuron.squash.IDENTITY
q.layers.output.list[2].squash = synaptic.Neuron.squash.IDENTITY

var init = function(n){
  this.n = n;
  this.r = [];
  for(var i = 0; i < n; i++){
    var el = document.createElement('div');
    el.innerHTML = '<div style="width:600px;display:inline-block" id="main-frame-error" class="interstitial-wrapper"><div id="main-content"></div></div>';
    el = el.firstChild;
    document.body.append(el);
    this.r.push(new Runner(document.querySelectorAll('.interstitial-wrapper')[i],i));
  }
}
