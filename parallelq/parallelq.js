var alpha = 0.05;
var gamma = 0.8;
var epsilon = 0.3;
var expsize = 1000;

var q = new synaptic.Architect.Perceptron(10,30,27,3);
q.layers.output.list[0].squash = synaptic.Neuron.squash.IDENTITY
q.layers.output.list[1].squash = synaptic.Neuron.squash.IDENTITY
q.layers.output.list[2].squash = synaptic.Neuron.squash.IDENTITY

var r = [];

var init = function(n){
  for(var i = 0; i < n; i++){
    var el = document.createElement('div');
    el.innerHTML = '<div style="width:600px;display:inline-block" id="main-frame-error" class="interstitial-wrapper"><div id="main-content"></div></div>';
    el = el.firstChild;
    document.body.append(el);
    r.push(new Runner(document.querySelectorAll('.interstitial-wrapper')[i],i));
  }
}

var exportJSON = function(){
  var e = [];
  for(var i = 0; i < r.length; i++){
    e.push(r.experiences);
  }
  var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({q:q.toJSON(),e:e}));
  var ae = document.createElement('a');
  ae.href = 'data:' + data;
  ae.download = 'population.json';
  ae.click();
},

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
      for(var i = 0; i < r.length; i++){
        r.experiences = res.e[i];
      }
    }
    fr.readAsText(files.item(0));
  }
}
