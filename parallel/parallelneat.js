var z = new Ziggurat();

/*
Sample Species
{
  model:,
  mean:,
  stdev:,
  members:[]
*/

function NEAT(n){
  this.n = n;
  this.r = [];
  this.sim = 0;
  for(var i = 0; i < this.n; i++){
    var el = document.createElement('div');
    el.innerHTML = '<div style="width:600px;display:inline-block" id="main-frame-error" class="interstitial-wrapper"><div id="main-content"></div></div>';
    el = el.firstChild;
    document.body.append(el);
    this.r.push(new Runner(document.querySelectorAll('.interstitial-wrapper')[i],i));
  }

  this.p = new Population(n);
};

NEAT.prototype = {
  simulateGeneration : function(){
    this.sim = this.n;
    for(var i = 0; i < this.n; i++){
      this.p.population[i].generateNeuralNetwork();
    }
    for(var i = 0; i < this.n; i++){
      this.r[i].restart();
    }
  },

  exportJSON : function(){
    var g = [];
    for(var i = 0; i < this.n; i++){
      g.push(this.p.population[i].genome);
    }
    var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({population: g, innovations: this.p.innovations}));
    var ae = document.createElement('a');
    ae.href = 'data:' + data;
    ae.download = 'population.json';
    ae.click();
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
    crossoverRate : 0.5
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
      for(var i = 0; i < this.population[individual].genome.edges.length; i++){
        if(!this.population[individual].genome.edges[i].disabled){
          enabledEdges.push(i);
        }
      }
      if(enabledEdges.length > 0){
        var p = enabledEdges[Math.floor(Math.random()*enabledEdges.length)];
        this.population[individual].genome.edges[p].disabled = 1;
        this.population[individual].genome.nodes.push(Math.random()*2-1);
        var innovp = -1;
        for(var i = 0; i < this.innovations.length; i++){
          if(this.innovations[i].source == this.population[individual].genome.edges[p].source && this.innovations[i].dest == 10+this.population[individual].genome.nodes.length){
            innovp = i+1;
          }
        }
        if(innovp == -1){
          this.innovations.push({source:this.population[individual].genome.edges[p].source,dest:10+this.population[individual].genome.nodes.length});
          innovp = this.innovations.length;
        }
        var innovpos = this.population[individual].genome.edges.length;
        for(var i = this.population[individual].genome.edges.length-1; i >= 0; i--){
          if(this.population[individual].genome.edges[i].innovation > innovp){
            innovpos = i;
          }
          else{
            break;
          }
        }
        this.population[individual].genome.edges.splice(innovpos, 0, {
          innovation: innovp,
          source: this.population[individual].genome.edges[p].source,
          dest: 10+this.population[individual].genome.nodes.length,
          weight: Math.random()*2-1,
          disabled: 0
        });
        innovp = -1;
        for(var i = 0; i < this.innovations.length; i++){
          if(this.innovations[i].source == 10+this.population[individual].genome.nodes.length && this.innovations[i].dest == this.population[individual].genome.edges[p].dest){
            innovp = i+1;
          }
        }
        if(innovp == -1){
          this.innovations.push({source:10+this.population[individual].genome.nodes.length,dest:this.population[individual].genome.edges[p].dest});
          innovp = this.innovations.length;
        }
        innovpos = this.population[individual].genome.edges.length;
        for(var i = this.population[individual].genome.edges.length-1; i >= 0; i--){
          if(this.population[individual].genome.edges[i].innovation > innovp){
            innovpos = i;
          }
          else{
            break;
          }
        }
        this.population[individual].genome.edges.splice(innovpos, 0, {
          innovation: innovp,
          source: 10+this.population[individual].genome.nodes.length,
          dest: this.population[individual].genome.edges[p].dest,
          weight: Math.random()*2-1,
          disabled: 0
        });
      }
    }
  },

  dfs : function(graph, individual, dest, src){
    var visited = [];
    for(var i = 0; i < 10+this.population[individual].genome.nodes.length; i++){
      visited.push(0);
    }
    var nodestack = [dest];
    while(nodestack.length != 0){
      var node = nodestack.pop();
      if(!visited[src] && !visited[node]){
        visited[node] = 1;
        if(node == src){
          return true;
        }
        for(var i = 0; i < graph[node].length; i++){
          nodestack.push(graph[node][i]);
        }
      }
    }
    return false;
  },

  edgeMutation : function(individual){
    if(Math.random() < this.config.addEdgeMutationRate){
      var innov;
      var adjhash = [];
      for(var i = 0; i < this.population[individual].genome.nodes.length + 10; i++){
        adjhash.push([]);
        for(var j = 0; j < this.population[individual].genome.nodes.length + 10; j++){
          adjhash[i].push(0);
        }
      }
      for(var i = 0; i < this.population[individual].genome.edges.length; i++){
        adjhash[this.population[individual].genome.edges[i].source-1][this.population[individual].genome.edges[i].dest-1] = 1;
      }
      var nonedges = [];
      for(var i = 0; i < 10; i++){
        for(var j = 10; j < this.population[individual].genome.nodes.length + 10; j++){
          if(!adjhash[i][j]){
            nonedges.push({source:i+1,dest:j+1});
          }
        }
      }
      for(var i = 12; i < this.population[individual].genome.nodes.length + 10; i++){
        for(var j = 10; j < this.population[individual].genome.nodes.length + 10; j++){
          if(!adjhash[i][j]){
            nonedges.push({source:i+1,dest:j+1});
          }
        }
      }
      if(nonedges.length == 0){
        return;
      }
      var rne = Math.floor(Math.random()*nonedges.length);
      innov = nonedges[rne];
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
      var innovpos = this.population[individual].genome.edges.length;
      for(var i = this.population[individual].genome.edges.length-1; i >= 0; i--){
        if(this.population[individual].genome.edges[i].innovation > innovp){
          innovpos = i;
        }
        else{
          break;
        }
      }
      this.population[individual].genome.edges.splice(innovpos, 0, {
        innovation: innovp,
        source: innov.source,
        dest: innov.dest,
        weight: Math.random()*2-1,
        disabled: 0
      });
    }
  },

  deleteEdgeMutation : function(individual){
    if(Math.random() < this.config.deleteEdgeMutationRate){
      this.population[individual].genome.edges.splice(Math.floor(this.population[individual].genome.edges.length*Math.random()),1);
    }
  },

  biasMutation : function(individual){
    for(var i = 0; i < this.population[individual].genome.nodes.length; i++){
      if(Math.random() < this.config.biasMutationRate){
        this.population[individual].genome.nodes[i] += z.nextGaussian()*0.1;
        this.population[individual].genome.nodes[i] = this.population[individual].genome.nodes[i] > 1 ? 1 : this.population[individual].genome.nodes[i];
        this.population[individual].genome.nodes[i] = this.population[individual].genome.nodes[i] < -1 ? -1 : this.population[individual].genome.nodes[i];
      }
      if(Math.random() < this.config.negateBiasMutationRate){
        this.population[individual].genome.nodes[i] = -this.population[individual].genome.nodes[i];
      }
    }
  },

  disableMutation : function(individual){
    for(var i = 0; i < this.population[individual].genome.edges.length; i++){
      if(Math.random() < this.disableGeneMutationRate){
        this.population[individual].genome.edges[i].disabled = 1;
      }
      else if(Math.random() < this.enableGeneMutationRate){
        this.population[individual].genome.edges[i].disabled = 0;
      }
    }
  },

  weightMutation : function(individual){
    for(var i = 0; i < this.population[individual].genome.edges.length; i++){
      if(Math.random() < this.edgeMutationRate){
        this.population[individual].genome.edges[i].weight += z.nextGaussian()*0.1;
        this.population[individual].genome.edges[i].weight = this.population[individual].genome.edges[i].weight > 1 ? 1 : this.population[individual].genome.edges[i].weight;
        this.population[individual].genome.edges[i].weight = this.population[individual].genome.edges[i].weight < -1 ? -1 : this.population[individual].genome.edges[i].weight;
      }
      if(Math.random() < this.negateEdgeMutationRate){
        this.population[individual].genome.edges[i].weight = -this.population[individual].genome.edges[i].weight;
      }
    }
  },

  synapsis : function(individual1, individual2){
    var i = 0;
    var j = 0;
    var inheritance = [];
    if(this.population[individual1].fitness > this.population[individual2].fitness){
      while(i < this.population[individual1].genome.edges.length){
        if(j >= this.population[individual2].genome.edges.length){
          inheritance.push({
            innovation: this.population[individual1].genome.edges[i].innovation,
            source: this.population[individual1].genome.edges[i].source,
            dest: this.population[individual1].genome.edges[i].dest,
            weight: this.population[individual1].genome.edges[i].weight,
            disabled: this.population[individual1].genome.edges[i].disabled
          });
          i++;
        }
        else if(this.population[individual1].genome.edges[i].innovation != this.population[individual2].genome.edges[j].innovation){
          while(j < this.population[individual2].genome.edges.length && this.population[individual1].genome.edges[i].innovation > this.population[individual2].genome.edges[j].innovation){
            j++;
          }
          if(j < this.population[individual2].genome.edges.length && this.population[individual1].genome.edges[i].innovation != this.population[individual2].genome.edges[j].innovation){
            inheritance.push({
              innovation: this.population[individual1].genome.edges[i].innovation,
              source: this.population[individual1].genome.edges[i].source,
              dest: this.population[individual1].genome.edges[i].dest,
              weight: this.population[individual1].genome.edges[i].weight,
              disabled: this.population[individual1].genome.edges[i].disabled
            });
            i++;
          }
        }
        else if(this.population[individual1].genome.edges[i].innovation == this.population[individual2].genome.edges[j].innovation){
          if(Math.random() < this.config.crossoverRate){
            inheritance.push({
              innovation: this.population[individual1].genome.edges[i].innovation,
              source: this.population[individual1].genome.edges[i].source,
              dest: this.population[individual1].genome.edges[i].dest,
              weight: this.population[individual1].genome.edges[i].weight,
              disabled: this.population[individual1].genome.edges[i].disabled
            });
            i++;
            j++;
          }
          else{
            inheritance.push({
              innovation: this.population[individual2].genome.edges[j].innovation,
              source: this.population[individual2].genome.edges[j].source,
              dest: this.population[individual2].genome.edges[j].dest,
              weight: this.population[individual2].genome.edges[j].weight,
              disabled: this.population[individual2].genome.edges[j].disabled
            });
            i++;
            j++;
          }
        }
      }
    }
    else if(this.population[individual1].fitness == this.population[individual2].fitness){
      while(i < this.population[individual1].genome.edges.length || j < this.population[individual2].genome.edges.length){
        if(j >= this.population[individual2].genome.edges.length){
          inheritance.push({
            innovation: this.population[individual1].genome.edges[i].innovation,
            source: this.population[individual1].genome.edges[i].source,
            dest: this.population[individual1].genome.edges[i].dest,
            weight: this.population[individual1].genome.edges[i].weight,
            disabled: this.population[individual1].genome.edges[i].disabled
          });
          i++;
        }
        else if(i >= this.population[individual1].genome.edges.length){
          inheritance.push({
            innovation: this.population[individual2].genome.edges[j].innovation,
            source: this.population[individual2].genome.edges[j].source,
            dest: this.population[individual2].genome.edges[j].dest,
            weight: this.population[individual2].genome.edges[j].weight,
            disabled: this.population[individual2].genome.edges[j].disabled
          });
          j++;
        }
        else if(this.population[individual1].genome.edges[i].innovation < this.population[individual2].genome.edges[j].innovation){
          inheritance.push({
            innovation: this.population[individual1].genome.edges[i].innovation,
            source: this.population[individual1].genome.edges[i].source,
            dest: this.population[individual1].genome.edges[i].dest,
            weight: this.population[individual1].genome.edges[i].weight,
            disabled: this.population[individual1].genome.edges[i].disabled
          });
          i++;
        }
        else if(this.population[individual1].genome.edges[i].innovation > this.population[individual2].genome.edges[j].innovation){
          inheritance.push({
            innovation: this.population[individual2].genome.edges[j].innovation,
            source: this.population[individual2].genome.edges[j].source,
            dest: this.population[individual2].genome.edges[j].dest,
            weight: this.population[individual2].genome.edges[j].weight,
            disabled: this.population[individual2].genome.edges[j].disabled
          });
          j++;
        }
        else if(this.population[individual1].genome.edges[i].innovation == this.population[individual2].genome.edges[j].innovation){
          if(Math.random() < this.config.crossoverRate){
            inheritance.push({
              innovation: this.population[individual1].genome.edges[i].innovation,
              source: this.population[individual1].genome.edges[i].source,
              dest: this.population[individual1].genome.edges[i].dest,
              weight: this.population[individual1].genome.edges[i].weight,
              disabled: this.population[individual1].genome.edges[i].disabled
            });
            i++;
            j++;
          }
          else{
            inheritance.push({
              innovation: this.population[individual2].genome.edges[j].innovation,
              source: this.population[individual2].genome.edges[j].source,
              dest: this.population[individual2].genome.edges[j].dest,
              weight: this.population[individual2].genome.edges[j].weight,
              disabled: this.population[individual2].genome.edges[j].disabled
            });
            i++;
            j++;
          }
        }
      }
    }
    return inheritance;
  },

  graphCrossover : function(individual1, individual2){
    var genome = {species:0, nodes:[],edges:[]};
    if(this.population[individual1].fitness < this.population[individual2].fitness){
      var tg = this.population[individual1].genome;
      var tf = this.population[individual1].fitness;
      this.population[individual1].genome = this.population[individual2].genome;
      this.population[individual1].fitness = this.population[individual2].fitness;
      this.population[individual2].genome = tg;
      this.population[individual2].fitness = tf;
    }
    genome.edges = this.synapsis(individual1, individual2);
    var maxnode = 12;
    for(var i = 0; i < genome.edges.length; i++){
      maxnode = Math.max(maxnode, genome.edges[i].source, genome.edges[i].dest);
    }
    for(var i = 0; i < maxnode-10; i++){
      if(i >= this.population[individual2].genome.nodes.length){
        genome.nodes.push(this.population[individual1].genome.nodes[i]);
      }
      else if(i >= this.population[individual1].genome.nodes.length){
        genome.nodes.push(this.population[individual2].genome.nodes[i]);
      }
      else if(Math.random() < this.config.crossoverRate){
        genome.nodes.push(this.population[individual1].genome.nodes[i]);
      }
      else{
        genome.nodes.push(this.population[individual2].genome.nodes[i]);
      }
    }
    return genome;
  },

  distanceFunction : function(individual1, individual2, c1, c2, c3){
    var N = 1+Math.max(this.population[individual1].genome.edges.length, this.population[individual2].genome.edges.length);
    var E = 0;
    var D = 0;
    var W = 0;
    var m = 0;
    var genehash = [[],[]];
    for(var i = 0; i < this.innovations.length; i++){
      genehash[0].push(2);
      genehash[1].push(2);
    }
    for(var i = 0; i < this.population[individual1].genome.edges.length; i++){
      genehash[0][this.population[individual1].genome.edges[i].innovation-1] = this.population[individual1].genome.edges[i].weight;
    }
    for(var i = 0; i < this.population[individual2].genome.edges.length; i++){
      genehash[1][this.population[individual2].genome.edges[i].innovation-1] = this.population[individual2].genome.edges[i].weight;
    }
    for(var i = 0; i < this.innovations.length; i++){
      if(genehash[0][i] != 2 || genehash[1][i] != 2){
        if(genehash[0][i] != 2 && genehash[1][i] != 2){
          W += Math.abs(genehash[0][i]-genehash[1][i]);
          m++;
        }
        else if(genehash[0][i] != 2){
          if(this.population[individual2].genome.edges.length == 0 || i+1 > this.population[individual2].genome.edges[this.population[individual2].genome.edges.length-1].innovation){
            E++;
          }
          else{
            D++;
          }
        }
        else if(genehash[1][i] != 2){
          if(this.population[individual1].genome.edges.length == 0 || i+1 > this.population[individual1].genome.edges[this.population[individual1].genome.edges.length-1].innovation){
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
      this.population[2*this.population.length/3 + i/2].genome = this.graphCrossover(i,i+1);
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
  this.genome = {species:0, nodes:[Math.random()*2-1, Math.random()*2-1],edges:[]};
  this.fitness = 0;
  this.outputThreshold = [0.5,0.5];
  this.neurons;
};

Individual.prototype = {
  generateNeuralNetwork : function(){
    var neurons = [];
    for(var i = 0; i < 10; i++){
      neurons.push(new synaptic.Neuron());
      neurons[i].ID = i+1;
    }
    for(var i = 10; i < 10+this.genome.nodes.length; i++){
      neurons.push(new synaptic.Neuron());
      neurons[i].ID = i+1;
      neurons[i].bias = this.genome.nodes[i-10];
    }
    for(var i = 0; i < this.genome.edges.length; i++){
      if(!this.genome.edges[i].disabled){
        var conn = neurons[this.genome.edges[i].source-1].project(neurons[this.genome.edges[i].dest-1]);
        conn.ID = this.genome.edges[i].innovation;
        conn.weight = this.genome.edges[i].weight;
      }
    }
    this.neurons = neurons;
  },

  fitnessFunction : function(s){
    this.fitness = Math.ceil(Math.pow(s,2)/Math.sqrt(1+this.genome.edges.length));
  },

  activateNeuralNetwork : function(inputs){
    for(var i = 0; i < 10; i++){
      this.neurons[i].activate(inputs[i]);
    }
    for(var i = 12; i < this.neurons.length; i++){
      this.neurons[i].activate();
    }
    return [this.neurons[10].activate() < this.outputThreshold[0] ? 0 : 1, this.neurons[11].activate() < this.outputThreshold[1] ? 0 : 1];
  },

  activateNeuralNetworkDFS : function(inputs){
    var activated = [];
    for(var i = 0; i < 10; i++){
      this.neurons[i].activate(inputs[i]);
      activated.push(1);
    }
    for(var i = 10; i < this.neurons.length-10; i++){
      activated.push(0);
    }
    var nodestack = [11, 10];
    while(nodestack.length != 0){
      if(activated[nodestack[nodestack.length-1]]){
        nodestack.pop();
        continue;
      }
      activated[nodestack[nodestack.length-1]] = 1;
      for(var i in this.neurons[nodestack[nodestack.length-1]].connections.inputs){
        activated[nodestack[nodestack.length-1]] = activated[nodestack[nodestack.length-1]] && activated[this.neurons[nodestack[nodestack.length-1]].connections.inputs[i].from.ID-1];
      }
      if(activated[nodestack[nodestack.length-1]]){
        var tn = nodestack.pop();
        if(tn == 10){
          outputs[0] = this.neurons[tn].activate();
        }
        else if(tn == 11){
          outputs[1] = this.neurons[tn].activate();
        }
        else{
          this.neurons[tn].activate();
        }
      }
      else{
        var tl = nodestack.length-1;
        for(var i in this.neurons[nodestack[tl]].connections.inputs){
          nodestack.push(this.neurons[nodestack[tl]].connections.inputs[i].from.ID-1);
        }
      }
    }
  }
};
