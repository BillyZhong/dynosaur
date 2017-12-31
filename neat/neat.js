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
  this.r = new Runner(document.querySelectorAll('.interstitial-wrapper')[0]);
};

NEAT.prototype = {
  init : function(n){
    this.n = n;
    this.sim = 0;
    this.c = -1;
    this.p = new Population(n);
    this.t;
    initGraphs(this.n);
  },

  simulateIndividual : function(individual){
    this.sim = 1;
    this.c = individual;
    this.p.population[individual].generateNeuralNetwork();
    this.r.restart();
  },

  simulateNextIndividual : function(){
    if(this.c == this.n-1){
      this.p.evolvePop();
      updateGeneration();
    }
    this.c = (this.c+1)%this.n;
    updateIndividual();
    this.simulateIndividual(this.c);
  },

  startEvolution : function(){
    var thisNeat = this;
    this.t = setInterval(function(){if(!thisNeat.sim){thisNeat.simulateNextIndividual()}},1000);
  },

  stopEvolution : function(){
    clearInterval(this.t);
    delete this.t;
  },

  exportJSON : function(){
    var g = [];
    for(var i = 0; i < this.n; i++){
      g.push(this.p.population[i].genome);
    }
    var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({population: g, innovations: this.p.innovations, generation: this.p.generation, scores: this.p.scores}));
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
        thisNeat.p.generation = res.generation;
        thisNeat.p.scores = res.scores;
      }
      fr.readAsText(files.item(0));
    }
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
    crossoverRate : 0.7,
    outputThreshold : [0.5,0.5]
  };
  this.population = [];
  this.generation = 1;
  this.innovations = [];
  this.scores = [];
  this.species = [];

  for(var i = 0; i < popsize; i++){
    this.population.push(new Individual());
  }
};

Population.prototype = {
  selection : function(){
    var tempPop = [];
    var tempFitness = [];
    var totalFitness = 0;
    for(var i = 0; i < this.population.length; i++){
      totalFitness += this.population[i].fitness;
    }
    while(this.population.length > 0){
      var randFitness = Math.random()*totalFitness;
      var selectedIndividual = 0;
      while(randFitness > 0){
        randFitness -= this.population[selectedIndividual].fitness;
        selectedIndividual++;
      }
      tempPop.push(this.population[selectedIndividual-1]);
      totalFitness -= this.population[selectedIndividual-1].fitness;
      this.population.splice(selectedIndividual-1, 1);
    }
    this.population = tempPop;
  },

  nodeMutation : function(individual){
    if(Math.random() < this.config.addNodeMutationRate){
      var enabledEdges = [];
      for(var k in this.population[individual].genome.edges){
        if(!this.population[individual].genome.edges[k].disabled){
          enabledEdges.push(k);
        }
      }
      if(enabledEdges.length > 0){
        var p = enabledEdges[Math.floor(Math.random()*enabledEdges.length)];

        this.population[individual].genome.edges[p].disabled = 1;
        var lnode = 11;
        for(var k in this.population[individual].genome.nodes){
          if(parseInt(k) != lnode+1){
            break;
          }
          else{
            lnode = parseInt(k);
          }
        }
        this.population[individual].genome.nodes[(lnode+1).toString()] = Math.random()*2-1;
        var innovp = -1;
        for(var i = 0; i < this.innovations.length; i++){
          if(this.innovations[i].source == this.population[individual].genome.edges[p].source && this.innovations[i].dest == lnode+1){
            innovp = i+1;
          }
        }
        if(innovp == -1){
          this.innovations.push({source:this.population[individual].genome.edges[p].source,dest:lnode+1});
          innovp = this.innovations.length;
        }
        this.population[individual].genome.edges[innovp.toString()] = {
          source: this.population[individual].genome.edges[p].source,
          dest: lnode+1,
          weight: Math.random()*2-1,
          disabled: 0
        };
        innovp = -1;
        for(var i = 0; i < this.innovations.length; i++){
          if(this.innovations[i].source == lnode+1 && this.innovations[i].dest == this.population[individual].genome.edges[p].dest){
            innovp = i+1;
          }
        }
        if(innovp == -1){
          this.innovations.push({source:lnode+1,dest:this.population[individual].genome.edges[p].dest});
          innovp = this.innovations.length;
        }
        this.population[individual].genome.edges[innovp.toString()] = {
          source: lnode+1,
          dest: this.population[individual].genome.edges[p].dest,
          weight: Math.random()*2-1,
          disabled: 0
        };
      }
    }
  },

  edgeMutation : function(individual){
    if(Math.random() < this.config.addEdgeMutationRate){
      var nonedges = new Set();
      for(var i = 1; i < 12; i++){
        for(var k in this.population[individual].genome.nodes){
          nonedges.add(pi(i,parseInt(k)));
        }
      }
      for(var k in this.population[individual].genome.nodes){
        for(var l in this.population[individual].genome.nodes){
          nonedges.add(pi(parseInt(k),parseInt(l)));
        }
      }
      for(var k in this.population[individual].genome.edges){
        nonedges.delete(pi(this.population[individual].genome.edges[k].source,this.population[individual].genome.edges[k].dest));
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
      this.population[individual].genome.edges[innovp.toString()] = {
        source: innov[0],
        dest: innov[1],
        weight: Math.random()*2-1,
        disabled: 0
      };
    }
  },

  deleteEdgeMutation : function(individual){
    if(Math.random() < this.config.deleteEdgeMutationRate){
      delete this.population[individual].genome.edges[Object.keys(this.population[individual].genome.edges)[Math.floor(Math.random()*Object.keys(this.population[individual].genome.edges).length)]];
    }
  },

  biasMutation : function(individual){
    for(var k in this.population[individual].genome.nodes){
      if(Math.random() < this.config.biasMutationRate){
        this.population[individual].genome.nodes[k] += z.nextGaussian()*0.1;
        this.population[individual].genome.nodes[k] = this.population[individual].genome.nodes[k] > 1 ? 1 : this.population[individual].genome.nodes[k];
        this.population[individual].genome.nodes[k] = this.population[individual].genome.nodes[k] < -1 ? -1 : this.population[individual].genome.nodes[k];
      }
      if(Math.random() < this.config.negateBiasMutationRate){
        this.population[individual].genome.nodes[k] = -this.population[individual].genome.nodes[k];
      }
    }
  },

  disableMutation : function(individual){
    for(var k in this.population[individual].genome.edges){
      if(Math.random() < this.disableGeneMutationRate){
        this.population[individual].genome.edges[k].disabled = 1;
      }
      else if(Math.random() < this.enableGeneMutationRate){
        this.population[individual].genome.edges[k].disabled = 0;
      }
    }
  },

  weightMutation : function(individual){
    for(var k in this.population[individual].genome.edges){
      if(Math.random() < this.edgeMutationRate){
        this.population[individual].genome.edges[k].weight += z.nextGaussian()*0.1;
        this.population[individual].genome.edges[k].weight = this.population[individual].genome.edges[k].weight > 1 ? 1 : this.population[individual].genome.edges[k].weight;
        this.population[individual].genome.edges[k].weight = this.population[individual].genome.edges[k].weight < -1 ? -1 : this.population[individual].genome.edges[k].weight;
      }
      if(Math.random() < this.negateEdgeMutationRate){
        this.population[individual].genome.edges[k].weight = -this.population[individual].genome.edges[k].weight;
      }
    }
  },

  synapsis : function(individual1, individual2){
    var edges = {};
    if(this.population[individual1].fitness == this.population[individual2].fitness){
      var e = new Set(Object.keys(this.population[individual1].genome.edges).concat(Object.keys(this.population[individual2].genome.edges)));
      for(let k of e){
        if(Math.random() < this.config.crossoverRate){
          edges[k] = this.population[individual1].genome.edges[k];
        }
        else{
          edges[k] = this.population[individual2].genome.edges[k];
        }
        if(edges[k] == undefined){
          delete edges[k];
        }
      }
    }
    else{
      for(var k in this.population[individual1].genome.edges){
        if(this.population[individual2].genome.edges[k] != undefined){
          if(Math.random() < this.config.crossoverRate){
            edges[k] = this.population[individual1].genome.edges[k];
          }
          else{
            edges[k] = this.population[individual2].genome.edges[k];
          }
        }
        else{
          edges[k] = this.population[individual1].genome.edges[k];
        }
      }
    }
    return edges;
  },

  crossover : function(individual1, individual2){
    var genome = {nodes:{},edges:{}};
    if(this.population[individual1].fitness < this.population[individual2].fitness){
      var t = this.population[individual1];
      this.population[individual1] = this.population[individual2];
      this.population[individual2] = t;
    }
    genome.edges = this.synapsis(individual1, individual2);
    var n = [];
    for(var k in genome.edges){
      n.push(genome.edges[k].source, genome.edges[k].dest);
    }
    n = new Set(n);
    for(var i = 1; i < 12; i++){
      n.delete(i);
    }
    for(let k of n){
      if((this.population[individual1].genome.nodes[k] && this.population[individual2].genome.nodes[k]) != undefined){
        if(Math.random() < this.config.crossoverRate){
          genome.nodes[k] = this.population[individual1].genome.nodes[k];
        }
        else{
          genome.nodes[k] = this.population[individual2].genome.nodes[k];
        }
      }
      else{
        genome.nodes[k] = this.population[individual1].genome.nodes[k] || this.population[individual2].genome.nodes[k];
      }
    }
    if(genome.nodes["12"] == undefined){
      if(Math.random() < this.config.crossoverRate){
        genome.nodes["12"] = this.population[individual1].genome.nodes["12"];
      }
      else{
        genome.nodes["12"] = this.population[individual2].genome.nodes["12"];
      }
    }
    if(genome.nodes["13"] == undefined){
      if(Math.random() < this.config.crossoverRate){
        genome.nodes["13"] = this.population[individual1].genome.nodes["13"];
      }
      else{
        genome.nodes["13"] = this.population[individual2].genome.nodes["13"];
      }
    }
    return genome;
  },

  distanceFunction : function(individual1, individual2, c1, c2, c3){
    var N = 1+Math.max(Object.keys(this.population[individual1].genome.edges).length, Object.keys(this.population[individual2].genome.edges).length);
    var E = 0;
    var D = 0;
    var W = 0;
    var m = 0;
    for(var k in this.population[individual1].genome.edges){
      if(this.population[individual2].genome.edges[k] == undefined){
        if(Object.keys(this.population[individual2].genome.edges).length == 0 || k > Object.keys(this.population[individual2].genome.edges)[Object.keys(this.population[individual2].genome.edges).length-1]){
          E++;
        }
        else{
          D++;
        }
      }
      else{
        W += Math.abs(this.population[individual1].genome.edges[k].weight - this.population[individual2].genome.edges[k].weight)
        m++;
      }
    }
    for(var k in this.population[individual2].genome.edges){
      if(this.population[individual1].genome.edges[k] == undefined){
        if(Object.keys(this.population[individual1].genome.edges).length == 0 || k > Object.keys(this.population[individual1].genome.edges)[Object.keys(this.population[individual1].genome.edges).length-1]){
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

  evolvePop : function(){
    this.selection();
    for(var i = 0; i < 2*this.population.length/3; i+=2){
      this.population[2*this.population.length/3 + i/2].genome = this.crossover(i,i+1);
    }
    for(var i = 0; i < this.population.length; i++){
      this.edgeMutation(i);
      this.nodeMutation(i);
      this.deleteEdgeMutation(i);
      this.biasMutation(i);
      this.disableMutation(i);
      this.weightMutation(i);
    }
    this.generation++;
  }
}

function Individual(){
  this.species = 0;
  this.genome = {nodes:{12:Math.random()*2-1, 13:Math.random()*2-1},edges:{}};
  this.fitness = 0;
  this.neurons;
};

Individual.prototype = {
  generateNeuralNetwork : function(){
    var neurons = {};
    for(var i = 1; i < 12; i++){
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
      if(parseInt(k) < 12){
        this.neurons[k].activate(inputs[parseInt(k)-1]);
      }
      else{
        if(k != "12" || k != "13"){
          this.neurons[k].activate();
        }
      }
    }
    return [this.neurons[12].activate(), this.neurons[13].activate()];
  }
};

var neat = new NEAT();
