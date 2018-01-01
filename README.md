# Dynosaur

Welcome to Dynosaur, a machine learning project I started to learn all about
[reinforcement learning](https://en.wikipedia.org/wiki/Reinforcement_learning) and
beat the Google Dinosaur Jumper Game.
To get started, head on over to [http://dynosaur.billyz.me](http://dynosaur.billyz.me)

## Table of Contents
- [The Game](#the-game)
- [Neural Networks](#neural-networks)
- [Multidimensional Optimization Problem](#multidimensional-optimization-problem)
- [Neuroevolution](#neuroevolution)
- Neuroevolution of Augmenting Topologies (NEAT)
  - Sequential NEAT
  - Parallel NEAT
  - Continuous NEAT
- Backpropagation
- Q Learning
  - Sequential Q
  - Parallel Q
- The Lab
- Future Improvements

## The Game
The Google Dinosaur Game is found on Google Chrome's default offline page.
The game has a simple objective: maximize your score by avoiding oncoming obstacles. The longer you survive, the higher the score becomes.

![alt text](https://github.com/BillyZhong/dynosaur/raw/master/documentation/googledinosaurgame.png "Google Dinosaur Game")

#### Actions
The dinosaur has three actions: jump (up arrow or space), duck (down arrow), or neither.
When the dinosaur is ducking, its collision box becomes shorter than when it is standing up.
When the dinosaur jumps, its collision box maintains the same dimensions while rising upwards using standard projectile physics.

#### Obstacles
There are two obstacles to avoid in the game: cacti and pterodactyls. Cacti have varying  height but are always located on the ground. They can be clustered or singular, which alters the width of their collision boxes. In order to continue, dinosaurs must jump over the cacti.
Pterodactyls are always singular and all have the same dimensions. However, pterodactyls can hover at three different heights. At the lowest height, the dinosaur must jump over the pterodactyls to continue. At the second lowest height, the dinosaur can jump over the pterodactyl or duck under in order to continue. At the highest height, the dinosaur can do all three actions (if timed correctly) in order to continue.

#### Inputs
In order to make this game accessible to the bot, an open source version of the game, with identical physics, was utilized. The game file was modified to allow the bot to access data to use as inputs. These inputs are

- T-Rex Speed
- Distance from Ground to the Top of T-Rex Collision Box
- Distance from Ground to the Bottom of T-Rex Collision Box
- Distance from Left of the First Obstacle Collision Box to Right of the T-Rex Collision Box
- Distance from Right of the First Obstacle Collision Box to Right of the T-Rex Collision Box
- Distance from Ground to the Top of First Obstacle Collision Box
- Distance from Ground to the Bottom of First Obstacle Collision Box
- Distance from Left of the Second Obstacle Collision Box to Right of the T-Rex Collision Box
- Distance from Right of the Second Obstacle Collision Box to Right of the T-Rex Collision Box
- Distance from Ground to the Top of Second Obstacle Collision Box
- Distance from Ground to the Bottom of Second Obstacle Collision Box

![alt text](https://github.com/BillyZhong/dynosaur/raw/master/documentation/inputsoutputs.png "Inputs and Outputs")

## Neural Networks

In order to give the dinosaur some way to make decisions on whether to jump or duck, each dinosaur will have a neural network “brain”. [Neural Networks](https://en.wikipedia.org/wiki/Artificial_neural_network) consist of artificial neurons that are linked together to model biological neurons.

#### Neurons
An [artificial neuron](https://en.wikipedia.org/wiki/Artificial_neuron) applies activation function 𝜑(𝑥) to Euclidean inner product of inputs and weights to produce output 𝑦, which is fed into the next neurons. They model [biological neurons](https://en.wikipedia.org/wiki/Neuron), which sum up all stimuli from dendrites and synapses across axon when above a certain threshold.

![alt text](https://github.com/BillyZhong/dynosaur/raw/master/documentation/neuron.png "Artificial Neuron")

#### Activation Functions
[Activation functions](https://en.wikipedia.org/wiki/Activation_function) are typically [Sigmoid functions](https://en.wikipedia.org/wiki/Sigmoid_function) to round out extreme inputs and center them around zero

![alt text](https://github.com/BillyZhong/dynosaur/raw/master/documentation/activation.png "Activation Functions")

#### Networks
A network of neurons allows one to create an overall system, in which each neuron’s output feeds into another’s input. Networks consists of input, hidden, and output neurons.
Input neurons sense stimuli. Hidden neurons allow for internal abstraction of senses. Output neurons respond with interpretation of stimuli.

![alt text](https://github.com/BillyZhong/dynosaur/raw/master/documentation/neuralnet.png "Neural Network")

The dinosaurs will take the numerical values of the inputs measured above, propagate them through the networks and use the output values to decide whether or not to jump or duck. Between the two output neurons the actions will be decided using the following pseudocode

```
if(output2 > outputThreshold2):
  duck
else if(output1 > outputThreshold1):
  jump
else:
  idle
```

## Multidimensional Optimization Problem

A dinosaur will perform and score based off of what neural network it has. Thus, we can consider a dinosaur's score a function of it's neural network. But because a network is merely an n-dimensional vector of weights and biases, the score is actually a function of an n-dimensional vector. Thus the problem to find an optimal scoring dinosaur is actually a multidimensional [optimization problem](https://en.wikipedia.org/wiki/Optimization_problem) to find the n-dimensional vector (set of weights and biases) that yield the global maximum.

![alt text](https://github.com/BillyZhong/dynosaur/raw/master/documentation/multidimensional.png "Multidimensional Graph")

## Neuroevolution
The first method used to mutate the networks is known as [neuroevolution](https://en.wikipedia.org/wiki/Neuroevolution). Neuroevolution serves as a heuristic for exploring the multidimensional search space utilizing [genetic operators](https://en.wikipedia.org/wiki/Genetic_operator) observed in [biological evolution](https://en.wikipedia.org/wiki/Evolution).

#### Neural Network


#### Fitness

#### Genetic Operators
The three main genetic operators are

- [Selection](https://en.wikipedia.org/wiki/Selection_(genetic_algorithm))
- [Crossover](https://en.wikipedia.org/wiki/Crossover_(genetic_algorithm))
- [Mutation](https://en.wikipedia.org/wiki/Mutation_(genetic_algorithm))

## Parallel
```javascript
neat.init(30);
//spacebar
neat.startEvolution();
```

## Continuous Natural
```javascript
neat.init(30);
neat.startEvolution();
//spacebar
```

## Q Learning
```javascript
//spacebar
```

## Parallel Q
```javascript
init(30);
//spacebar
```
