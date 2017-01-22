var z = new Ziggurat();
var population = [];
var fitness = [];
var generation = 1;
var currentIndividual = 0;
var innovations = 0;
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
    var genome = {nodes:[Math.random()*2-1,Math.random()*2-1],edges:[]};
    population.push(genome);
    fitness.push(0);
  }
};

var generateNeuralNetwork = function(individual){
  var inputLayer = [];
  for(var i = 0; i < 10; i++){
    inputLayer.push(new synaptic.Neuron());
  }
  var outputLayer = [];
  for(var i = 0; i < 2; i++){
    outputLayer.push(new synaptic.Neuron());
    outputLayer[i].bias = population[individual].nodes[i];
  }
  var hiddenLayer = [];
  for(var i = 0; i < population[individual].edges.length; i++){
    
  }

};
