var z = new Ziggurat();
var population = [];
var fitness = [];
var generation = 1;
var currentIndividual = 0;
var innovations = [];
var inputs = [0,0,0,0,0,0,0,0,0,0];
var outputs = [0,0];
var outputBinary = [0,0];
var maxFitness = [];
var crossoverRate = 0.5;
var mutationRate = 0.5;

var generateNeatPopulation = function(popSize){
  population = [];
  innovations = [];
  fitness = [];
  maxFitness = [];
  generation = 1;
  currentIndividual = 0;
  for(var i = 0; i < popSize; i++){
    var genome = {nodes:[Math.random()*2-1, Math.random()*2-1],edges:[]};
    population.push(genome);
    fitness.push(0);
  }
};

var generateNeuralNetwork = function(individual){
  var neurons = [];
  for(var i = 0; i < 10; i++){
    neurons.push(new synaptic.Neuron());
    neurons[i].ID = i+1;
  }
  for(var i = 10; i < 10+population[individual].nodes.length; i++){
    neurons.push(new synaptic.Neuron());
    neurons[i].ID = i+1;
    neurons[i].bias = population[individual].nodes[i-10];
  }
  for(var i = 0; i < population[individual].edges.length; i++){
    if(!population[individual].edges[i].disabled){
      var conn = neurons[population[individual].edges[i].source-1].project(neurons[population[individual].edges[i].dest-1]);
      conn.ID = population[individual].edges[i].innovation;
      conn.weight = population[individual].edges[i].weight;
    }
  }
  return neurons;
};

var activateNeuron = function(neuron, activated){
  if(activated[neuron.ID-1]){
    return;
  }
  for(var i in neuron.connections.inputs){
    activateNeuron(neuron.connections.inputs[i].from,activated);
  }
  activated[neuron.ID-1] = 1;
  return neuron.activate();
}

var activateNeuralNetwork = function(neurons){
  var activated = [];
  for(var i = 0; i < 10; i++){
    neurons[i].activate(inputs[i]);
    activated.push(1);
  }
  for(var i = 10; i < neurons.length-10; i++){
    activated.push(0);
  }
  outputs[0] = activateNeuron(neurons[10],activated);
  outputs[1] = activateNeuron(neurons[11],activated);
};

var fitnessFunction = function(f){
  return f;
}

var simulateIndividual = function(individual, output1Threshold, output2Threshold){
  r.restart();
  var net = generateNeuralNetwork(individual);
  var sim = setInterval(function(){
    if(r.crashed){
      fitness[individual] = fitnessFunction(parseInt(r.distanceMeter.digits[0]+r.distanceMeter.digits[1]+r.distanceMeter.digits[2]+r.distanceMeter.digits[3]+r.distanceMeter.digits[4]));
      clearInterval(sim);
    }
    activateNeuralNetwork(net);
    if(outputs[0] > output1Threshold){
      outputBinary[0] = 1;
    }
    else{
      outputBinary[0] = 0;
    }
    if(outputs[1] > output2Threshold){
      outputBinary[1] = 1;
    }
    else{
      outputBinary[1] = 0;
    }
  }, 50);
};

var selection = function(){
  var tempMaxFit = -1;
  var tempPop = [];
  var tempFitness = [];
  var totalFitness = 0;
  for(var i = 0; i < population.length; i++){
    totalFitness += fitness[i];
  }
  while(population.length > 0){
    var randFitness = Math.random()*totalFitness;
    var selectedIndividual = 0;
    while(randFitness > 0){
      randFitness -= fitness[selectedIndividual];
      selectedIndividual++;
    }
    tempPop.push(population[selectedIndividual-1]);
    population.splice(selectedIndividual-1, 1);
    totalFitness -= fitness[selectedIndividual-1];
    tempMaxFit = Math.max(tempMaxFit, fitness[selectedIndividual-1]);
    tempFitness.push(fitness[selectedIndividual-1]);
    fitness.splice(selectedIndividual-1, 1);
  }
  population = tempPop;
  fitness = tempFitness;
  maxFitness.push(tempMaxFit);
};

var nodeMutation = function(individual){
  if(population[individual].edges.length > 0){
    var dis = 1;
    var p;
    while(dis){
      p = Math.floor(Math.random()*population[individual].edges.length);
      dis = population[individual].edges[p].disabled;
    }
    population[individual].edges[p].disabled = 1;
    population[individual].nodes.push(Math.random()*2-1);
    var innovp = -1;
    for(var i = 0; i < innovations.length; i++){
      if(innovations[i].source == population[individual].edges[p].source && innovations[i].dest == 10+population[individual].nodes.length){
        innovp = i+1;
      }
    }
    if(innovp == -1){
      innovations.push({source:population[individual].edges[p].source,dest:10+population[individual].nodes.length});
      innovp = innovations.length;
    }
    population[individual].edges.push({
      innovation: innovp,
      source: population[individual].edges[p].source,
      dest: 10+population[individual].nodes.length,
      weight: Math.random()*2-1,
      disabled: 0
    });
    var innovp = -1;
    for(var i = 0; i < innovations.length; i++){
      if(innovations[i].source == 10+population[individual].nodes.length && innovations[i].dest == population[individual].edges[p].dest){
        innovp = i+1;
      }
    }
    if(innovp == -1){
      innovations.push({source:10+population[individual].nodes.length,dest:population[individual].edges[p].dest});
      innovp = innovations.length;
    }
    population[individual].edges.push({
      innovation: innovp,
      source: 10+population[individual].nodes.length,
      dest: population[individual].edges[p].dest,
      weight: Math.random()*2-1,
      disabled: 0
    });
  }
};

var dfs = function(graph, visited, node, src){
  if(!visited[src] && !visited[node]){
    visited[node] = 1;
    for(var i = 0; i < graph[node].length; i++){
      dfs(graph, visited, graph[node][i], src);
    }
  }
}

var edgeMutation = function(individual){
  var innov;
  var cycle = 1;
  while(cycle){
    var ex = 1;
    while(ex){
      var tsrc = Math.ceil(Math.random()*(population[individual].nodes.length+8));
      tsrc = tsrc > 10 ? tsrc+2 : tsrc;
      var tdest = Math.ceil(Math.random()*(tsrc > 10 ? population[individual].nodes.length - 1 : population[individual].nodes.length))+10;
      tdest = tdest > tsrc-1 && tsrc > 10 ? tdest+1 : tdest;
      innov = {source: tsrc, dest: tdest};
      ex = 0;
      for(var i = 0; i < innovations.length; i++){
        if(innovations[i].source == innov.source && innovations[i].dest == innov.dest){
          ex = 1;
          break;
        }
      }
    }
    var adjlist = [];
    var visited = [];
    for(var i = 0; i < 10+population[individual].nodes.length; i++){
      adjlist.push([]);
      visited.push(0);
    }
    for(var i = 0; i < population[individual].edges.length; i++){
      adjlist[population[individual].edges[i].source-1].push(population[individual].edges[i].dest-1);
    }
    dfs(adjlist, visited, innov.dest-1, innov.source-1);
    cycle = visited[innov.source-1];
  }
  innovations.push(innov);
  population[individual].edges.push({
    innovation: innovations.length,
    source: innov.source,
    dest: innov.dest,
    weight: Math.random()*2-1,
    disabled: 0
  });
};

var synapsis = function(individual1, individual2){
  var i = 0;
  var j = 0;
  var inheritance = [];
  if(fitness[individual1] > fitness[individual2]){
    while(i < population[individual1].edges.length){
      if(j >= population[individual2].edges.length){
        inheritance.push({
          innovation: population[individual1].edges[i].innovation,
          source: population[individual1].edges[i].source,
          dest: population[individual1].edges[i].dest,
          weight: population[individual1].edges[i].weight,
          disabled: population[individual1].edges[i].disabled
        });
        i++;
      }
      else if(population[individual1].edges[i].innovation != population[individual2].edges[j].innovation){
        while(j < population[individual2].edges.length && population[individual1].edges[i].innovation > population[individual2].edges[j].innovation){
          j++;
        }
        if(j < population[individual2].edges.length && population[individual1].edges[i].innovation != population[individual2].edges[j].innovation){
          inheritance.push({
            innovation: population[individual1].edges[i].innovation,
            source: population[individual1].edges[i].source,
            dest: population[individual1].edges[i].dest,
            weight: population[individual1].edges[i].weight,
            disabled: population[individual1].edges[i].disabled
          });
          i++;
        }
      }
      else if(population[individual1].edges[i].innovation == population[individual2].edges[j].innovation){
        if(Math.random() < 0.5){
          inheritance.push({
            innovation: population[individual1].edges[i].innovation,
            source: population[individual1].edges[i].source,
            dest: population[individual1].edges[i].dest,
            weight: population[individual1].edges[i].weight,
            disabled: population[individual1].edges[i].disabled
          });
          i++;
          j++;
        }
        else{
          inheritance.push({
            innovation: population[individual2].edges[j].innovation,
            source: population[individual2].edges[j].source,
            dest: population[individual2].edges[j].dest,
            weight: population[individual2].edges[j].weight,
            disabled: population[individual2].edges[j].disabled
          });
          i++;
          j++;
        }
      }
    }
  }
  else if(fitness[individual1] == fitness[individual2]){
    while(i < population[individual1].edges.length || j < population[individual2].edges.length){
      if(j >= population[individual2].edges.length){
        inheritance.push({
          innovation: population[individual1].edges[i].innovation,
          source: population[individual1].edges[i].source,
          dest: population[individual1].edges[i].dest,
          weight: population[individual1].edges[i].weight,
          disabled: population[individual1].edges[i].disabled
        });
        i++;
      }
      else if(i >= population[individual1].edges.length){
        inheritance.push({
          innovation: population[individual2].edges[j].innovation,
          source: population[individual2].edges[j].source,
          dest: population[individual2].edges[j].dest,
          weight: population[individual2].edges[j].weight,
          disabled: population[individual2].edges[j].disabled
        });
        j++;
      }
      else if(population[individual1].edges[i].innovation < population[individual2].edges[j].innovation){
        inheritance.push({
          innovation: population[individual1].edges[i].innovation,
          source: population[individual1].edges[i].source,
          dest: population[individual1].edges[i].dest,
          weight: population[individual1].edges[i].weight,
          disabled: population[individual1].edges[i].disabled
        });
        i++;
      }
      else if(population[individual1].edges[i].innovation > population[individual2].edges[j].innovation){
        inheritance.push({
          innovation: population[individual2].edges[j].innovation,
          source: population[individual2].edges[j].source,
          dest: population[individual2].edges[j].dest,
          weight: population[individual2].edges[j].weight,
          disabled: population[individual2].edges[j].disabled
        });
        j++;
      }
      else if(population[individual1].edges[i].innovation == population[individual2].edges[j].innovation){
        if(Math.random() < 0.5){
          inheritance.push({
            innovation: population[individual1].edges[i].innovation,
            source: population[individual1].edges[i].source,
            dest: population[individual1].edges[i].dest,
            weight: population[individual1].edges[i].weight,
            disabled: population[individual1].edges[i].disabled
          });
          i++;
          j++;
        }
        else{
          inheritance.push({
            innovation: population[individual2].edges[j].innovation,
            source: population[individual2].edges[j].source,
            dest: population[individual2].edges[j].dest,
            weight: population[individual2].edges[j].weight,
            disabled: population[individual2].edges[j].disabled
          });
          i++;
          j++;
        }
      }
    }
  }
  return inheritance;
};

var graphCrossover = function(individual1, individual2){
  var genome = {nodes:[],edges:[]};
  if(fitness[individual1] < fitness[individual2]){
    var tg = population[individual1];
    var tf = fitness[individual1];
    population[individual1] = population[individual2];
    fitness[individual1] = fitness[individual2];
    population[individual2] = tg;
    fitness[individual2] = tf;
  }
  genome.edges = synapsis(individual1, individual2);
  var maxnode = 12;
  for(var i = 0; i < genome.edges.length; i++){
    maxnode = Math.max(maxnode, genome.edges[i].source, genome.edges[i].dest);
  }
  for(var i = 0; i < maxnode-10; i++){
    if(i >= population[individual2].nodes.length){
      genome.nodes.push(population[individual1].nodes[i]);
    }
    else if(i >= population[individual1].nodes.length){
      genome.nodes.push(population[individual2].nodes[i]);
    }
    else if(Math.random() < 0.5){
      genome.nodes.push(population[individual1].nodes[i]);
    }
    else{
      genome.nodes.push(population[individual2].nodes[i]);
    }
  }
  return genome;
};
