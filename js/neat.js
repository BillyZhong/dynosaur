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

var nodeMutation = function(individual){
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
