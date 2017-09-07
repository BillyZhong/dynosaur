var z = new Ziggurat();

/*
Sample Species
{
  model:,
  mean:,
  stdev:,
  members:[]
*/

function NEAT(){
};

NEAT.prototype = {
  init : function(n){
    this.n = n;
    this.r = [];
    this.sim = 0;
    for(var i = 0; i < n; i++){
      var el = document.createElement('div');
      el.innerHTML = '<div style="width:600px;display:inline-block" id="main-frame-error" class="interstitial-wrapper"><div id="main-content"></div></div>';
      el = el.firstChild;
      document.body.append(el);
      this.r.push(new Runner(document.querySelectorAll('.interstitial-wrapper')[i],i));
    }

    this.p = new Population(n);
    this.t;
  },

  startEvolution : function(){
    for(var i = 0; i < this.n; i++){
      this.p.population[i].generateNeuralNetwork();
    }
    this.sim = 1;
  },

  stopEvolution : function(){
    this.sim = 0;
  },

  exportJSON : function(){
    var g = [];
    for(var i = 0; i < this.n; i++){
      g.push(this.p.population[i].genome);
    }
    var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({population: g, innovations: this.p.innovations, generation: this.p.generation}));
    var ae = document.createElement('a');
    ae.href = 'data:' + data;
    ae.download = 'population.json';
    ae.click();
  },

  importJSON : function(files){
    if(!files){
      var upload = document.createElement('input');
      upload.innerHTML = '<input type="file" accept="application/json" onchange="neat.importJSON(this.files)"/>';
      upload = upload.firstChild;
      upload.click();
    }
    else{
      var thisNeat = this;
      var fr = new FileReader();
      fr.onload = function(e) {
        var res = JSON.parse(e.target.result);
        thisNeat.init(res.population.length);
        for(var i = 0; i < res.population.length; i++){
          thisNeat.p.population[i].genome = res.population[i];
        }
        thisNeat.p.innovations = res.innovations;
        if(res.generation){
          thisNeat.p.generation = res.generation;
        }
      }
      fr.readAsText(files.item(0));
    }
  }
};

function Rank(n){
  this.r = -1;
  this.t = -1;
  this.n = n;
  this.l = 0;
  this.pre = [];
  this.post = [];
  for(var i = 0; i < this.n; i++){
    this.pre.push(-1);
    this.post.push(-1);
  }
};

Rank.prototype = {
  traverse : function(){
    var c = this.r;
    while(c != -1){
      console.log(c);
      c = this.post[c];
    }
  },

  queue : function(addr){
    if(this.pre[addr] != -1 && this.post[addr] != -1){
      return;
    }
    if(this.r == -1){
      this.r = addr;
    }
    else{
      this.post[this.t] = addr;
    }
    this.pre[addr] = this.t;
    this.t = addr;
    this.l++;
  },

  delete : function(addr){
    if(this.pre[addr] == -1 && this.post[addr] == -1){
      return;
    }
    if(this.t == addr){
      this.t = this.pre[addr];
    }
    else{
      this.pre[this.post[addr]] = this.pre[addr];
    }
    if(this.r == addr){
      this.r = this.post[addr];
    }
    else{
      this.post[this.pre[addr]] = this.post[addr];
    }
    this.pre[addr] = -1;
    this.post[addr] = -1;
    this.l--;
  },

  select : function(){
    var c = this.r;
    var i = this.l == 0 ? 1 : this.l;
    var t = i;
    var r = Math.random()*pi(t,0);
    while(r > i){
      c = this.post[c];
      r-=i;
      i--;
    }
    return c;
  }
};

function Population(popsize){
  this.config = {
    addEdgeMutationRate : 0.15,
    addNodeMutationRate : 0.10,
    deleteEdgeMutationRate : 0.10,
    biasMutationRate : 0.25,
    negateBiasMutationRate : 0.10,
    disableGeneMutationRate : 0.05,
    enableGeneMutationRate : 0.10,
    edgeMutationRate : 0.25,
    negateEdgeMutationRate : 0.10,
    crossoverRate : 0.5,
    outputThreshold : [0.5,0.5]
  };
  this.population = [];
  this.rank = new Rank(popsize);
  this.generation = 1;
  this.innovations = [];
  this.maxFitness = [];
  this.species = [];

  for(var i = 0; i < popsize; i++){
    this.population.push(new Individual());
  }
};

Population.prototype = {
  select : function(){
    if(this.rank.l > 1){
      return JSON.parse(JSON.stringify(this.population[this.rank.select()].genome));
    }
    else{
      return JSON.parse(JSON.stringify(this.population[Math.floor(Math.random()*this.population.length)].genome));
    }
  },

  nodeMutation : function(individual){
    if(Math.random() < this.config.addNodeMutationRate){
      var enabledEdges = [];
      for(var k in individual.edges){
        if(!individual.edges[k].disabled){
          enabledEdges.push(k);
        }
      }
      if(enabledEdges.length > 0){
        var p = enabledEdges[Math.floor(Math.random()*enabledEdges.length)];

        individual.edges[p].disabled = 1;
        var lnode = 10;
        for(var k in individual.nodes){
          if(parseInt(k) != lnode+1){
            break;
          }
          else{
            lnode = parseInt(k);
          }
        }
        individual.nodes[(lnode+1).toString()] = Math.random()*2-1;
        var innovp = -1;
        for(var i = 0; i < this.innovations.length; i++){
          if(this.innovations[i].source == individual.edges[p].source && this.innovations[i].dest == lnode+1){
            innovp = i+1;
          }
        }
        if(innovp == -1){
          this.innovations.push({source:individual.edges[p].source,dest:lnode+1});
          innovp = this.innovations.length;
        }
        individual.edges[innovp.toString()] = {
          source: individual.edges[p].source,
          dest: lnode+1,
          weight: Math.random()*2-1,
          disabled: 0
        };
        innovp = -1;
        for(var i = 0; i < this.innovations.length; i++){
          if(this.innovations[i].source == lnode+1 && this.innovations[i].dest == individual.edges[p].dest){
            innovp = i+1;
          }
        }
        if(innovp == -1){
          this.innovations.push({source:lnode+1,dest:individual.edges[p].dest});
          innovp = this.innovations.length;
        }
        individual.edges[innovp.toString()] = {
          source: lnode+1,
          dest: individual.edges[p].dest,
          weight: Math.random()*2-1,
          disabled: 0
        };
      }
    }
  },

  edgeMutation : function(individual){
    if(Math.random() < this.config.addEdgeMutationRate){
      var nonedges = new Set();
      for(var i = 1; i < 11; i++){
        for(var k in individual.nodes){
          nonedges.add(pi(i,parseInt(k)));
        }
      }
      for(var k in individual.nodes){
        for(var l in individual.nodes){
          nonedges.add(pi(parseInt(k),parseInt(l)));
        }
      }
      for(var k in individual.edges){
        nonedges.delete(pi(individual.edges[k].source,individual.edges[k].dest));
      }
      if(nonedges.size == 0){
        return;
      }
      var nonedgesarr = Array.from(nonedges);
      var rne = nonedgesarr[Math.floor(Math.random()*nonedgesarr.length)];
      var innov = invpi(rne);
      var innovp = -1;
      for(var i = 0; i < this.innovations.length; i++){
        if(this.innovations[i].source == innov[0] && this.innovations[i].dest == innov[1]){
          innovp = i+1;
        }
      }
      if(innovp == -1){
        this.innovations.push({source : innov[0], dest : innov[1]});
        innovp = this.innovations.length;
      }
      individual.edges[innovp.toString()] = {
        source: innov[0],
        dest: innov[1],
        weight: Math.random()*2-1,
        disabled: 0
      };
    }
  },

  deleteEdgeMutation : function(individual){
    if(Math.random() < this.config.deleteEdgeMutationRate){
      delete individual.edges[Object.keys(individual.edges)[Math.floor(Math.random()*Object.keys(individual.edges).length)]];
    }
  },

  biasMutation : function(individual){
    for(var k in individual.nodes){
      if(Math.random() < this.config.biasMutationRate){
        individual.nodes[k] += z.nextGaussian()*0.1;
        individual.nodes[k] = individual.nodes[k] > 1 ? 1 : individual.nodes[k];
        individual.nodes[k] = individual.nodes[k] < -1 ? -1 : individual.nodes[k];
      }
      if(Math.random() < this.config.negateBiasMutationRate){
        individual.nodes[k] = -individual.nodes[k];
      }
    }
  },

  disableMutation : function(individual){
    for(var k in individual.edges){
      if(Math.random() < this.disableGeneMutationRate){
        individual.edges[k].disabled = 1;
      }
      else if(Math.random() < this.enableGeneMutationRate){
        individual.edges[k].disabled = 0;
      }
    }
  },

  weightMutation : function(individual){
    for(var k in individual.edges){
      if(Math.random() < this.edgeMutationRate){
        individual.edges[k].weight += z.nextGaussian()*0.1;
        individual.edges[k].weight = individual.edges[k].weight > 1 ? 1 : individual.edges[k].weight;
        individual.edges[k].weight = individual.edges[k].weight < -1 ? -1 : individual.edges[k].weight;
      }
      if(Math.random() < this.negateEdgeMutationRate){
        individual.edges[k].weight = -individual.edges[k].weight;
      }
    }
  },

  synapsis : function(individual1, individual2){
    var edges = {};
    var e = new Set(Object.keys(individual1.edges).concat(Object.keys(individual2.edges)));
    for(let k of e){
      if(Math.random() < this.config.crossoverRate){
        edges[k] = individual1.edges[k];
      }
      else{
        edges[k] = individual2.edges[k];
      }
      if(edges[k] == undefined){
        delete edges[k];
      }
    }
    return edges;
  },

  crossover : function(individual1, individual2){
    var genome = {nodes:{},edges:{}};
    genome.edges = this.synapsis(individual1, individual2);
    var n = [];
    for(var k in genome.edges){
      n.push(genome.edges[k].source, genome.edges[k].dest);
    }
    n = new Set(n);
    for(var i = 1; i < 11; i++){
      n.delete(i);
    }
    for(let k of n){
      if((individual1.nodes[k] && individual2.nodes[k]) != undefined){
        if(Math.random() < this.config.crossoverRate){
          genome.nodes[k] = individual1.nodes[k];
        }
        else{
          genome.nodes[k] = individual2.nodes[k];
        }
      }
      else{
        genome.nodes[k] = individual1.nodes[k] || individual2.nodes[k];
      }
    }
    if(genome.nodes["11"] == undefined){
      if(Math.random() < this.config.crossoverRate){
        genome.nodes["11"] = individual1.nodes["11"];
      }
      else{
        genome.nodes["11"] = individual2.nodes["11"];
      }
    }
    if(genome.nodes["12"] == undefined){
      if(Math.random() < this.config.crossoverRate){
        genome.nodes["12"] = individual1.nodes["12"];
      }
      else{
        genome.nodes["12"] = individual2.nodes["12"];
      }
    }
    return genome;
  },

  distanceFunction : function(individual1, individual2, c1, c2, c3){
    var N = 1+Math.max(Object.keys(individual1.edges).length, Object.keys(individual2.edges).length);
    var E = 0;
    var D = 0;
    var W = 0;
    var m = 0;
    for(var k in individual1.edges){
      if(individual2.edges[k] == undefined){
        if(Object.keys(individual2.edges).length == 0 || k > Object.keys(individual2.edges)[Object.keys(individual2.edges).length-1]){
          E++;
        }
        else{
          D++;
        }
      }
      else{
        W += Math.abs(individual1.edges[k].weight - individual2.edges[k].weight)
        m++;
      }
    }
    for(var k in individual2.edges){
      if(individual1.edges[k] == undefined){
        if(Object.keys(individual1.edges).length == 0 || k > Object.keys(individual1.edges)[Object.keys(individual1.edges).length-1]){
          E++;
        }
        else{
          D++;
        }
      }
    }
    W = m == 0 ? W : W/m;
    return c1*E/N + c2*D/N + c3*W;
  },

  evolve : function(individual){
    var in1 = this.select();
    var in2 = this.select();
    var ch = this.crossover(in1,in2);
    this.edgeMutation(ch);
    this.nodeMutation(ch);
    this.deleteEdgeMutation(ch);
    this.biasMutation(ch);
    this.disableMutation(ch);
    this.weightMutation(ch);
    this.population[individual].genome = ch;
  }
}

function Individual(){
  this.species = 0;
  this.genome = {nodes:{11:Math.random()*2-1, 12:Math.random()*2-1},edges:{}};
  this.fitness = 0;
  this.neurons;
};

Individual.prototype = {
  generateNeuralNetwork : function(){
    var neurons = {};
    for(var i = 1; i < 11; i++){
      neurons[i] = new synaptic.Neuron();
      neurons[i].ID = i;
    }
    for(var k in this.genome.nodes){
      neurons[parseInt(k)] = new synaptic.Neuron();
      neurons[parseInt(k)].ID = parseInt(k);
      neurons[parseInt(k)].bias = this.genome.nodes[k];
    }
    for(var k in this.genome.edges){
      if(!this.genome.edges[k].disabled){
        var conn = neurons[this.genome.edges[k].source].project(neurons[this.genome.edges[k].dest]);
        conn.ID = parseInt(k);
        conn.weight = this.genome.edges[k].weight;
      }
    }
    this.neurons = neurons;
  },

  fitnessFunction : function(s){
    this.fitness = Math.ceil(Math.pow(s,2)/Math.sqrt(1+Object.keys(this.genome.edges).length));
  },

  activateNeuralNetwork : function(inputs){
    for(var k in this.neurons){
      if(parseInt(k) < 11){
        this.neurons[k].activate(inputs[parseInt(k)-1]);
      }
      else{
        if(k != "11" || k != "12"){
          this.neurons[k].activate();
        }
      }
    }
    return [this.neurons[11].activate() < neat.p.config.outputThreshold[0] ? 0 : 1, this.neurons[12].activate() < neat.p.config.outputThreshold[1] ? 0 : 1];
  }
};

var neat = new NEAT();
