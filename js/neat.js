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

var activateNeuralNetworkDFS = function(neurons){
  var activated = [];
  for(var i = 0; i < 10; i++){
    neurons[i].activate(inputs[i]);
    activated.push(1);
  }
  for(var i = 10; i < neurons.length-10; i++){
    activated.push(0);
  }
  var nodestack = [11, 10];
  while(nodestack.length != 0){
    if(activated[nodestack[nodestack.length-1]]){
      nodestack.pop();
      continue;
    }
    activated[nodestack[nodestack.length-1]] = 1;
    for(var i in neurons[nodestack[nodestack.length-1]].connections.inputs){
      activated[nodestack[nodestack.length-1]] = activated[nodestack[nodestack.length-1]] && activated[neurons[nodestack[nodestack.length-1]].connections.inputs[i].from.ID-1];
    }
    if(activated[nodestack[nodestack.length-1]]){
      var tn = nodestack.pop();
      if(tn == 10){
        outputs[0] = neurons[tn].activate();
      }
      else if(tn == 11){
        outputs[1] = neurons[tn].activate();
      }
      else{
        neurons[tn].activate();
      }
    }
    else{
      var tl = nodestack.length-1;
      for(var i in neurons[nodestack[tl]].connections.inputs){
        nodestack.push(neurons[nodestack[tl]].connections.inputs[i].from.ID-1);
      }
    }
  }
};

var activateNeuralNetwork = function(neurons){
  for(var i = 0; i < 10; i++){
    neurons[i].activate(inputs[i]);
  }
  for(var i = 12; i < neurons.length; i++){
    neurons[i].activate();
  }
  outputs[0] = neurons[10].activate();
  outputs[1] = neurons[11].activate();
};

var fitnessFunction = function(f, individual){
  return Math.ceil(Math.pow(f,2)/Math.sqrt(1+population[individual].edges.length));
};

var simulateIndividual = function(individual, output1Threshold, output2Threshold){
  r.restart();
  var net = generateNeuralNetwork(individual);
  var sim = setInterval(function(){
    if(r.crashed){
      fitness[individual] = fitnessFunction(parseInt(r.distanceMeter.digits[0]+r.distanceMeter.digits[1]+r.distanceMeter.digits[2]+r.distanceMeter.digits[3]+r.distanceMeter.digits[4]),individual);
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
    var innovpos = population[individual].edges.length;
    for(var i = population[individual].edges.length-1; i >= 0; i--){
      if(population[individual].edges[i].innovation > innovp){
        innovpos = i;
      }
      else{
        break;
      }
    }
    population[individual].edges.splice(innovpos, 0, {
      innovation: innovp,
      source: population[individual].edges[p].source,
      dest: 10+population[individual].nodes.length,
      weight: Math.random()*2-1,
      disabled: 0
    });
    innovp = -1;
    for(var i = 0; i < innovations.length; i++){
      if(innovations[i].source == 10+population[individual].nodes.length && innovations[i].dest == population[individual].edges[p].dest){
        innovp = i+1;
      }
    }
    if(innovp == -1){
      innovations.push({source:10+population[individual].nodes.length,dest:population[individual].edges[p].dest});
      innovp = innovations.length;
    }
    innovpos = population[individual].edges.length;
    for(var i = population[individual].edges.length-1; i >= 0; i--){
      if(population[individual].edges[i].innovation > innovp){
        innovpos = i;
      }
      else{
        break;
      }
    }
    population[individual].edges.splice(innovpos, 0, {
      innovation: innovp,
      source: 10+population[individual].nodes.length,
      dest: population[individual].edges[p].dest,
      weight: Math.random()*2-1,
      disabled: 0
    });
  }
};

var dfs = function(graph, individual, dest, src){
  var visited = [];
  for(var i = 0; i < 10+population[individual].nodes.length; i++){
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
}

var edgeMutation = function(individual){
  var innov;
  var adjhash = [];
  for(var i = 0; i < population[individual].nodes.length + 10; i++){
    adjhash.push([]);
    for(var j = 0; j < population[individual].nodes.length + 10; j++){
      adjhash[i].push(0);
    }
  }
  for(var i = 0; i < population[individual].edges.length; i++){
    adjhash[population[individual].edges[i].source-1][population[individual].edges[i].dest-1] = 1;
  }
  var nonedges = [];
  for(var i = 0; i < 10; i++){
    for(var j = 10; j < population[individual].nodes.length + 10; j++){
      if(!adjhash[i][j]){
        nonedges.push({source:i+1,dest:j+1});
      }
    }
  }
  for(var i = 12; i < population[individual].nodes.length + 10; i++){
    for(var j = 10; j < population[individual].nodes.length + 10; j++){
      if(!adjhash[i][j] && i!=j){
        nonedges.push({source:i+1,dest:j+1});
      }
    }
  }
  var adjlist = [];
  for(var i = 0; i < 10+population[individual].nodes.length; i++){
    adjlist.push([]);
  }
  for(var i = 0; i < population[individual].edges.length; i++){
    adjlist[population[individual].edges[i].source-1].push(population[individual].edges[i].dest-1);
  }
  if(nonedges.length == 0){
    return;
  }
  var rne = Math.floor(Math.random()*nonedges.length);
  innov = nonedges[rne];
  var innovp = -1;
  for(var i = 0; i < innovations.length; i++){
    if(innovations[i].source == innov.source && innovations[i].dest == innov.dest){
      innovp = i+1;
    }
  }
  if(innovp == -1){
    innovations.push(innov);
    innovp = innovations.length;
  }
  var innovpos = population[individual].edges.length;
  for(var i = population[individual].edges.length-1; i >= 0; i--){
    if(population[individual].edges[i].innovation > innovp){
      innovpos = i;
    }
    else{
      break;
    }
  }
  population[individual].edges.splice(innovpos, 0, {
    innovation: innovp,
    source: innov.source,
    dest: innov.dest,
    weight: Math.random()*2-1,
    disabled: 0
  });
};

var biasMutation = function(individual, mutationRate, negateMutationRate){
  for(var i = 0; i < population[individual].nodes.length; i++){
    if(Math.random() < mutationRate){
      population[individual].nodes[i] += z.nextGaussian();
      population[individual].nodes[i] = population[individual].nodes[i] > 1 ? 1 : population[individual].nodes[i];
      population[individual].nodes[i] = population[individual].nodes[i] < -1 ? -1 : population[individual].nodes[i];
    }
    if(Math.random() < negateMutationRate){
      population[individual].nodes[i] = -population[individual].nodes[i];
    }
  }
};

var disableMutation = function(individual, disableRate, enableRate){
  for(var i = 0; i < population[individual].edges.length; i++){
    if(Math.random() < disableRate){
      population[individual].edges[i].disabled = 1;
    }
    else if(Math.random() < enableRate){
      population[individual].edges[i].disabled = 0;
    }
  }
};

var weightMutation = function(individual, mutationRate, negateMutationRate){
  for(var i = 0; i < population[individual].edges.length; i++){
    if(Math.random() < mutationRate){
      population[individual].edges[i].weight += z.nextGaussian();
      population[individual].edges[i].weight = population[individual].edges[i].weight > 1 ? 1 : population[individual].edges[i].weight;
      population[individual].edges[i].weight = population[individual].edges[i].weight < -1 ? -1 : population[individual].edges[i].weight;
    }
    if(Math.random() < negateMutationRate){
      population[individual].edges[i].weight = -population[individual].edges[i].weight;
    }
  }
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

var distanceFunction = function(individual1, individual2, c1, c2, c3){
  var N = 1+Math.max(population[individual1].edges.length, population[individual2].edges.length);
  var E = 0;
  var D = 0;
  var W = 0;
  var m = 0;
  var genehash = [[],[]];
  for(var i = 0; i < innovations.length; i++){
    genehash[0].push(2);
    genehash[1].push(2);
  }
  for(var i = 0; i < population[individual1].edges.length; i++){
    genehash[0][population[individual1].edges[i].innovation-1] = population[individual1].edges[i].weight;
  }
  for(var i = 0; i < population[individual2].edges.length; i++){
    genehash[1][population[individual2].edges[i].innovation-1] = population[individual2].edges[i].weight;
  }
  for(var i = 0; i < innovations.length; i++){
    if(genehash[0][i] != 2 || genehash[1][i] != 2){
      if(genehash[0][i] != 2 && genehash[1][i] != 2){
        W += Math.abs(genehash[0][i]-genehash[1][i]);
        m++;
      }
      else if(genehash[0][i] != 2){
        if(i+1 > population[individual2].edges[population[individual2].edges.length-1].innovation){
          E++;
        }
        else{
          D++;
        }
      }
      else if(genehash[1][i] != 2){
        if(i+1 > population[individual1].edges[population[individual1].edges.length-1].innovation){
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
};
