var z = new Ziggurat();
var population = [];
var fitness = [];
var totalFitness = 0;
var generation = 1;
var currentIndividual = 0;
var inputs = [0,0,0,0,0,0,0,0,0,0];
var outputs = [0,0];
var outputBinary = [0,0];
//maxGen, elitism

var generatePopulation = function(popSize, hiddenNeuronNum){
  population = [];
  fitness = [];
  totalFitness = 0;
  generation = 1;
  currentIndividual = 0;
  for(var i = 0; i < popSize; i++){
    var inputLayer = new synaptic.Layer(10);
    var hiddenLayer = new synaptic.Layer(hiddenNeuronNum);
    var outputLayer = new synaptic.Layer(2);
    var inputHidden = inputLayer.project(hiddenLayer);
    var hiddenOutput = hiddenLayer.project(outputLayer);
    var network = new synaptic.Network({
      input: inputLayer,
      hidden: [hiddenLayer],
      output: outputLayer
    });
    for(var j = 0; j < network.layers.hidden[0].size; j++){
      network.layers.hidden[0].list[j].bias = Math.random();
    }
    network.layers.output.list[0].bias = Math.random();
    network.layers.output.list[1].bias = Math.random();
    for(var j = 0; j < network.layers.hidden[0].size; j++){
      for(var k in network.layers.hidden[0].list[j].connections.inputs){
        network.layers.hidden[0].list[j].connections.inputs[k].weight = Math.random()*2 - 1;
      }
    }
    for(var j = 0; j < network.layers.output.size; j++){
      for(var k in network.layers.output.list[j].connections.inputs){
        network.layers.output.list[j].connections.inputs[k].weight = Math.random()*2 - 1;
      }
    }
    population.push(network);
    fitness.push(0);
  }
};

var simulateIndividual = function(individual, output1Threshold, output2Threshold){
  r.restart();
  var sim = setInterval(function(){
    if(r.crashed){
      fitness[individual] = parseInt(r.distanceMeter.digits[0]+r.distanceMeter.digits[1]+r.distanceMeter.digits[2]+r.distanceMeter.digits[3]+r.distanceMeter.digits[4]);
      totalFitness += fitness[individual];
      clearInterval(sim);
    }
    outputs = population[individual].activate(inputs);
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

var selection = function(totalFitness){
  var tempPop = [];
  var tempFitness = [];
  while(population.length > 0){
    var randFitness = Math.random()*totalFitness;
    var currentIndividual = 0;
    while(randFitness > 0){
      randFitness -= fitness[currentIndividual];
      currentIndividual++;
    }
    tempPop.push(population[currentIndividual-1]);
    population.splice(currentIndividual-1, 1);
    totalFitness -= fitness[currentIndividual-1];
    tempFitness.push(fitness[currentIndividual-1]);
    fitness.splice(currentIndividual-1, 1);
  }
  population = tempPop;
  fitness = tempFitness;
};

var crossover = function(individual1, individual2, crossoverRate){
  for(var i = 0; i < population[individual1].layers.hidden[0].size; i++){
    if(Math.random() < crossoverRate){
      var temp = population[individual1].layers.hidden[0].list[i].bias;
      population[individual1].layers.hidden[0].list[i].bias = population[individual2].layers.hidden[0].list[i].bias;
      population[individual2].layers.hidden[0].list[i].bias = temp;
    }
  }
  if(Math.random() < crossoverRate){
    var temp = population[individual1].layers.output.list[0].bias;
    population[individual1].layers.output.list[0].bias = population[individual2].layers.output.list[0].bias;
    population[individual2].layers.output.list[0].bias = temp;
  }
  if(Math.random() < crossoverRate){
    var temp = population[individual1].layers.output.list[1].bias;
    population[individual1].layers.output.list[1].bias = population[individual2].layers.output.list[1].bias;
    population[individual2].layers.output.list[1].bias = temp;
  }
  for(var i = 0; i < population[individual1].layers.hidden[0].size; i++){
    var in1con = [];
    var in2con = [];
    for(var j in population[individual1].layers.hidden[0].list[i].connections.inputs){
      in1con.push(j);
    }
    for(var j in population[individual2].layers.hidden[0].list[i].connections.inputs){
      in2con.push(j);
    }
    for(var j = 0; j < in1con.length; j++){
      if(Math.random() < crossoverRate){
        var temp = population[individual1].layers.hidden[0].list[i].connections.inputs[in1con[j]].weight;
        population[individual1].layers.hidden[0].list[i].connections.inputs[in1con[j]].weight = population[individual2].layers.hidden[0].list[i].connections.inputs[in2con[j]].weight;
        population[individual2].layers.hidden[0].list[i].connections.inputs[in2con[j]].weight = temp;
      }
    }
  }
  for(var i = 0; i < population[individual1].layers.output.size; i++){
    var in1con = [];
    var in2con = [];
    for(var j in population[individual1].layers.output.list[i].connections.inputs){
      in1con.push(j);
    }
    for(var j in population[individual2].layers.output.list[i].connections.inputs){
      in2con.push(j);
    }
    for(var j = 0; j < in1con.length; j++){
      if(Math.random() < crossoverRate){
        var temp = population[individual1].layers.output.list[i].connections.inputs[in1con[j]].weight;
        population[individual1].layers.output.list[i].connections.inputs[in1con[j]].weight = population[individual2].layers.output.list[i].connections.inputs[in2con[j]].weight;
        population[individual2].layers.output.list[i].connections.inputs[in2con[j]].weight = temp;
      }
    }
  }
};

var mutation = function(individual, mutationRate){
  for(var i = 0; i < population[individual].layers.hidden[0].size; i++){
    if(Math.random() < mutationRate){
      population[individual].layers.hidden[0].list[i].bias += z.nextGaussian()*population[individual].layers.hidden[0].list[i].bias;
    }
  }
  if(Math.random() < mutationRate){
    population[individual].layers.output.list[0].bias += z.nextGaussian()*population[individual].layers.output.list[0].bias;
  }
  if(Math.random() < mutationRate){
    population[individual].layers.output.list[1].bias += z.nextGaussian()*population[individual].layers.output.list[1].bias;
  }
  for(var i = 0; i < population[individual].layers.hidden[0].size; i++){
    for(var j in population[individual].layers.hidden[0].list[i].connections.inputs){
      if(Math.random() < mutationRate){
        population[individual].layers.hidden[0].list[i].connections.inputs[j].weight += z.nextGaussian()*population[individual].layers.hidden[0].list[i].connections.inputs[j].weight;
      }
    }
  }
  for(var i = 0; i < population[individual].layers.output.size; i++){
    for(var j in population[individual].layers.output.list[i].connections.inputs){
      if(Math.random() < mutationRate){
        population[individual].layers.output.list[i].connections.inputs[j].weight += z.nextGaussian()*population[individual].layers.output.list[i].connections.inputs[j].weight;
      }
    }
  }
};


var evolve = function(popSize, hiddenNeuronNum, crossoverRate, mutationRate){
  generatePopulation(popSize, hiddenNeuronNum);
  for(var i = 0; i < popSize; i++){
    simulateIndividual(i);
  }
  selection(totalFitness);
  for(var i = 0; i < popSize; i+=2){
    crossover(i,i+1,crossoverRate);
  }
  for(var i = 0; i < popSize; i++){
    mutation(i, mutationRate);
  }
};
