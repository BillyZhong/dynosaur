var z = new Ziggurat();
var population = [];
var fitness = [];
var generation = 1;
var currentIndividual = 0;
var inputs = [0,0,0,0,0,0,0,0,0,0];
var outputs = [0,0];
var outputBinary = [0,0];
var maxFitness = [];
var crossoverRate = 0.5;
var mutationRate = 0.5;

var generatePopulation = function(popSize, hiddenNeurons){
  population = [];
  fitness = [];
  maxFitness = [];
  generation = 1;
  currentIndividual = 0;
  for(var i = 0; i < popSize; i++){
    var inputLayer = new synaptic.Layer(10);
    var hiddenLayers = [];
    for(var j = 0; j < hiddenNeurons.length; j++){
      hiddenLayers.push(new synaptic.Layer(hiddenNeurons[j]));
    }
    var outputLayer = new synaptic.Layer(2);
    var inputHidden = inputLayer.project(hiddenLayers[0]);
    for(var j = 1; j < hiddenLayers.length; j++){
      hiddenLayers[j-1].project(hiddenLayers[j]);
    }
    var hiddenOutput = hiddenLayers[hiddenLayers.length-1].project(outputLayer);
    var network = new synaptic.Network({
      input: inputLayer,
      hidden: hiddenLayers,
      output: outputLayer
    });
    for(var j = 0; j < network.layers.hidden.length; j++){
      for(var k = 0; k < network.layers.hidden[j].size; k++){
        network.layers.hidden[j].list[k].bias = Math.random()*2 - 1;
      }
    }
    for(var j = 0; j < network.layers.output.size; j++){
        network.layers.output.list[j].bias = Math.random()*2 - 1;
    }
    for(var j = 0; j < network.layers.hidden.length; j++){
      for(var k = 0; k < network.layers.hidden[j].size; k++){
        for(var l in network.layers.hidden[j].list[k].connections.inputs){
          network.layers.hidden[j].list[k].connections.inputs[l].weight = Math.random()*2 - 1;
        }
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

var fitnessFunction = function(f){
  return Math.pow(f-5,2);
}

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

var weightedSelection = function(){
  var tempMaxFit = -1;
  var tempPop = [];
  var tempFitness = [];
  var totalFitness = 0;
  for(var i = 0; i < population.length; i++){
    totalFitness += fitnessFunction(fitness[i]);
  }
  while(population.length > 0){
    var randFitness = Math.random()*totalFitness;
    var selectedIndividual = 0;
    while(randFitness > 0){
      randFitness -= fitnessFunction(fitness[selectedIndividual]);
      selectedIndividual++;
    }
    tempPop.push(population[selectedIndividual-1]);
    population.splice(selectedIndividual-1, 1);
    totalFitness -= fitnessFunction(fitness[selectedIndividual-1]);
    tempMaxFit = Math.max(tempMaxFit, fitness[selectedIndividual-1]);
    tempFitness.push(fitness[selectedIndividual-1]);
    fitness.splice(selectedIndividual-1, 1);
  }
  population = tempPop;
  fitness = tempFitness;
  maxFitness.push(tempMaxFit);
};

var multipleSelection = function(){
  var tempMaxFit = -1;
  var tempPop = [];
  var tempFitness = [];
  var totalFitness = 0;
  for(var i = 0; i < population.length; i++){
    totalFitness += fitnessFunction(fitness[i]);
    tempMaxFit = Math.max(tempMaxFit, fitness[i]);
  }
  for(var i = 0; i < population.length; i++){
    var randFitness = Math.random()*totalFitness;
    var selectedIndividual = 0;
    while(randFitness > 0){
      randFitness -= fitnessFunction(fitness[selectedIndividual]);
      selectedIndividual++;
    }
    tempPop.push(population[selectedIndividual-1].clone());
    tempFitness.push(fitness[selectedIndividual-1]);
  }
  population = tempPop;
  fitness = tempFitness;
  maxFitness.push(tempMaxFit);
};

var elitistSelection = function(){
  var tempMaxFit = -1;
  var tempPop = [];
  var tempFitness = [];
  var totalFitness = 0;
  for(var i = 0; i < population.length; i++){
    totalFitness += fitnessFunction(fitness[i]);
  }
  while(population.length > 0){
    var randFitness = Math.random()*totalFitness;
    var selectedIndividual = 0;
    while(randFitness > 0){
      randFitness -= fitnessFunction(fitness[selectedIndividual]);
      selectedIndividual++;
    }
    tempPop.push(population[selectedIndividual-1]);
    population.splice(selectedIndividual-1, 1);
    totalFitness -= fitnessFunction(fitness[selectedIndividual-1]);
    tempMaxFit = Math.max(tempMaxFit, fitness[selectedIndividual-1]);
    tempFitness.push(fitness[selectedIndividual-1]);
    fitness.splice(selectedIndividual-1, 1);
  }
  population = [tempPop[0].clone(), tempPop[1].clone()].concat(tempPop.slice(0,tempPop.length-2));
  fitness = [tempFitness[0], tempFitness[1]].concat(tempFitness.slice(0,tempFitness.length-2));
  maxFitness.push(tempMaxFit);
};

var crossover = function(individual1, individual2){
  for(var i = 0; i < population[individual1].layers.hidden.length; i++){
    for(var j = 0; j < population[individual1].layers.hidden[i].size; j++){
      if(Math.random() < crossoverRate){
        var temp = population[individual1].layers.hidden[i].list[j].bias;
        population[individual1].layers.hidden[i].list[j].bias = population[individual2].layers.hidden[i].list[j].bias;
        population[individual2].layers.hidden[i].list[j].bias = temp;
      }
    }
  }
  for(var i = 0; i < population[individual1].layers.output.size; i++){
    if(Math.random() < crossoverRate){
      var temp = population[individual1].layers.output.list[i].bias;
      population[individual1].layers.output.list[i].bias = population[individual2].layers.output.list[i].bias;
      population[individual2].layers.output.list[i].bias = temp;
    }
  }
  for(var i = 0; i < population[individual1].layers.hidden.length; i++){
    for(var j = 0; j < population[individual1].layers.hidden[i].size; j++){
      var in1con = [];
      var in2con = [];
      for(var k in population[individual1].layers.hidden[i].list[j].connections.inputs){
        in1con.push(k);
      }
      for(var k in population[individual2].layers.hidden[i].list[j].connections.inputs){
        in2con.push(k);
      }
      for(var k = 0; k < in1con.length; k++){
        if(Math.random() < crossoverRate){
          var temp = population[individual1].layers.hidden[i].list[j].connections.inputs[in1con[k]].weight;
          population[individual1].layers.hidden[i].list[j].connections.inputs[in1con[k]].weight = population[individual2].layers.hidden[i].list[j].connections.inputs[in2con[k]].weight;
          population[individual2].layers.hidden[i].list[j].connections.inputs[in2con[k]].weight = temp;
        }
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

var subgraphCrossover = function(individual1, individual2){
  for(var i = 0; i < population[individual1].layers.hidden.length; i++){
    for(var j = 0; j < population[individual1].layers.hidden[i].size; j++){
      if(Math.random() < crossoverRate){
        var temp = population[individual1].layers.hidden[i].list[j].bias;
        population[individual1].layers.hidden[i].list[j].bias = population[individual2].layers.hidden[i].list[j].bias;
        population[individual2].layers.hidden[i].list[j].bias = temp;
        var in1con = [];
        var in2con = [];
        for(var k in population[individual1].layers.hidden[i].list[j].connections.inputs){
          in1con.push(k);
        }
        for(var k in population[individual2].layers.hidden[i].list[j].connections.inputs){
          in2con.push(k);
        }
        for(var k = 0; k < in1con.length; k++){
          var temp = population[individual1].layers.hidden[i].list[j].connections.inputs[in1con[k]].weight;
          population[individual1].layers.hidden[i].list[j].connections.inputs[in1con[k]].weight = population[individual2].layers.hidden[i].list[j].connections.inputs[in2con[k]].weight;
          population[individual2].layers.hidden[i].list[j].connections.inputs[in2con[k]].weight = temp;
        }
      }
    }
  }
  for(var i = 0; i < population[individual1].layers.output.size; i++){
    if(Math.random() < crossoverRate){
      var temp = population[individual1].layers.output.list[i].bias;
      population[individual1].layers.output.list[i].bias = population[individual2].layers.output.list[i].bias;
      population[individual2].layers.output.list[i].bias = temp;
      var in1con = [];
      var in2con = [];
      for(var j in population[individual1].layers.output.list[i].connections.inputs){
        in1con.push(j);
      }
      for(var j in population[individual2].layers.output.list[i].connections.inputs){
        in2con.push(j);
      }
      for(var j = 0; j < in1con.length; j++){
        var temp = population[individual1].layers.output.list[i].connections.inputs[in1con[j]].weight;
        population[individual1].layers.output.list[i].connections.inputs[in1con[j]].weight = population[individual2].layers.output.list[i].connections.inputs[in2con[j]].weight;
        population[individual2].layers.output.list[i].connections.inputs[in2con[j]].weight = temp;
      }
    }
  }
};

var mutation = function(individual){
  for(var i = 0; i < population[individual].layers.hidden.length; i++){
    for(var j = 0; j < population[individual].layers.hidden[i].size; j++){
      if(Math.random() < mutationRate){
        population[individual].layers.hidden[i].list[j].bias += z.nextGaussian();//*population[individual].layers.hidden[i].list[j].bias;
        population[individual].layers.hidden[i].list[j].bias = population[individual].layers.hidden[i].list[j].bias > 1 ? 1 : population[individual].layers.hidden[i].list[j].bias;
        population[individual].layers.hidden[i].list[j].bias = population[individual].layers.hidden[i].list[j].bias < -1 ? -1 : population[individual].layers.hidden[i].list[j].bias;
      }
    }
  }
  for(var i = 0; i < population[individual].layers.output.size; i++){
    if(Math.random() < mutationRate){
      population[individual].layers.output.list[i].bias += z.nextGaussian();//*population[individual].layers.output.list[0].bias;
      population[individual].layers.output.list[i].bias = population[individual].layers.output.list[i].bias > 1 ? 1 : population[individual].layers.output.list[i].bias;
      population[individual].layers.output.list[i].bias = population[individual].layers.output.list[i].bias < -1 ? -1 : population[individual].layers.output.list[i].bias;
    }
  }
  for(var i = 0; i < population[individual].layers.hidden.length; i++){
    for(var j = 0; j < population[individual].layers.hidden[i].size; j++){
      for(var k in population[individual].layers.hidden[i].list[j].connections.inputs){
        if(Math.random() < mutationRate){
          population[individual].layers.hidden[i].list[j].connections.inputs[k].weight += z.nextGaussian();//*population[individual].layers.hidden[i].list[j].connections.inputs[k].weight;
          population[individual].layers.hidden[i].list[j].connections.inputs[k].weight = population[individual].layers.hidden[i].list[j].connections.inputs[k].weight > 1 ? 1 : population[individual].layers.hidden[i].list[j].connections.inputs[k].weight;
          population[individual].layers.hidden[i].list[j].connections.inputs[k].weight = population[individual].layers.hidden[i].list[j].connections.inputs[k].weight < -1 ? -1 : population[individual].layers.hidden[i].list[j].connections.inputs[k].weight;
        }
      }
    }
  }
  for(var i = 0; i < population[individual].layers.output.size; i++){
    for(var j in population[individual].layers.output.list[i].connections.inputs){
      if(Math.random() < mutationRate){
        population[individual].layers.output.list[i].connections.inputs[j].weight += z.nextGaussian();//*population[individual].layers.output.list[i].connections.inputs[j].weight;
        population[individual].layers.output.list[i].connections.inputs[j].weight = population[individual].layers.output.list[i].connections.inputs[j].weight > 1 ? 1 : population[individual].layers.output.list[i].connections.inputs[j].weight;
        population[individual].layers.output.list[i].connections.inputs[j].weight = population[individual].layers.output.list[i].connections.inputs[j].weight < -1 ? -1 : population[individual].layers.output.list[i].connections.inputs[j].weight;
      }
    }
  }
};
