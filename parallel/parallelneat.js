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

  simulateGeneration : function(){
    this.sim = this.n;
    for(var i = 0; i < this.n; i++){
      this.p.population[i].generateNeuralNetwork();
    }
    for(var i = 0; i < this.n; i++){
      this.r[i].restart();
    }
  },

  startEvolution : function(){
    this.sim = 0;
    var thisNeat = this;
    this.t = setInterval(function(){if(thisNeat.sim==0){thisNeat.p.evolvePop();thisNeat.simulateGeneration()}},1000);
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
  this.generation = 1;
  this.innovations = [];
  this.maxFitness = [];
  this.species = [];

  for(var i = 0; i < popsize; i++){
    this.population.push(new Individual());
  }
};

Population.prototype = {
  selection : function(){
    var tempMaxFit = -1;
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
      tempMaxFit = Math.max(tempMaxFit, this.population[selectedIndividual-1].fitness);
      this.population.splice(selectedIndividual-1, 1);
    }
    this.population = tempPop;
    this.maxFitness.push(tempMaxFit);
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
        var lnode = 10;
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
      var adjhash = [];
      for(var i = 0; i < Object.keys(this.population[individual].genome.nodes).length + 10; i++){
        adjhash.push([]);
        for(var j = 0; j < Object.keys(this.population[individual].genome.nodes).length + 10; j++){
          adjhash[i].push(0);
        }
      }
      for(var k in this.population[individual].genome.edges){
        adjhash[this.population[individual].genome.edges[k].source-1][this.population[individual].genome.edges[k].dest-1] = 1;
      }
      var nonedges = [];
      for(var i = 0; i < 10; i++){
        for(var j = 10; j < Object.keys(this.population[individual].genome.nodes).length + 10; j++){
          if(!adjhash[i][j]){
            nonedges.push({source:i+1,dest:j+1});
          }
        }
      }
      for(var i = 12; i < Object.keys(this.population[individual].genome.nodes).length + 10; i++){
        for(var j = 10; j < Object.keys(this.population[individual].genome.nodes).length + 10; j++){
          if(!adjhash[i][j]){
            nonedges.push({source:i+1,dest:j+1});
          }
        }
      }
      if(nonedges.length == 0){
        return;
      }
      var rne = Math.floor(Math.random()*nonedges.length);
      var innov = nonedges[rne];
      var innovp = -1;
      for(var i = 0; i < this.innovations.length; i++){
        if(this.innovations[i].source == innov.source && this.innovations[i].dest == innov.dest){
          innovp = i+1;
        }
      }
      if(innovp == -1){
        this.innovations.push(innov);
        innovp = this.innovations.length;
      }
      this.population[individual].genome.edges[innovp.toString()] = {
        source: innov.source,
        dest: innov.dest,
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
    var genome = {species:0, nodes:{},edges:{}};
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
    for(var i = 1; i < 11; i++){
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
    if(genome.nodes["11"] == undefined){
      if(Math.random() < this.config.crossoverRate){
        genome.nodes["11"] = this.population[individual1].genome.nodes["11"];
      }
      else{
        genome.nodes["11"] = this.population[individual2].genome.nodes["11"];
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
    return genome;
  },

  distanceFunction : function(individual1, individual2, c1, c2, c3){
    var N = 1+Math.max(Object.keys(this.population[individual1].genome.edges).length, Object.keys(this.population[individual2].genome.edges).length);
    var E = 0;
    var D = 0;
    var W = 0;
    var m = 0;
    var genehash = [[],[]];
    for(var i = 0; i < this.innovations.length; i++){
      genehash[0].push(2);
      genehash[1].push(2);
    }
    for(var k in this.population[individual1].genome.edges){
      genehash[0][this.population[individual1].genome.edges[k].innovation-1] = this.population[individual1].genome.edges[k].weight;
    }
    for(var k in this.population[individual2].genome.edges){
      genehash[1][this.population[individual2].genome.edges[k].innovation-1] = this.population[individual2].genome.edges[k].weight;
    }
    for(var i = 0; i < this.innovations.length; i++){
      if(genehash[0][i] != 2 || genehash[1][i] != 2){
        if(genehash[0][i] != 2 && genehash[1][i] != 2){
          W += Math.abs(genehash[0][i]-genehash[1][i]);
          m++;
        }
        else if(genehash[0][i] != 2){
          if(Object.keys(this.population[individual2].genome.edges).length == 0 || i+1 > this.population[individual2].genome.edges[Object.keys(this.population[individual2].genome.edges).length-1].innovation){
            E++;
          }
          else{
            D++;
          }
        }
        else if(genehash[1][i] != 2){
          if(Object.keys(this.population[individual1].genome.edges).length == 0 || i+1 > this.population[individual1].genome.edges[Object.keys(this.population[individual1].genome.edges).length-1].innovation){
            E++;
          }
          else{
            D++;
          }
        }
      }
    }
    if(m > 0){
      W /= m;
    }
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
  this.genome = {species:0, nodes:{11:Math.random()*2-1, 12:Math.random()*2-1},edges:{}};
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
