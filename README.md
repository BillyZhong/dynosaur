# Dynosaur

Welcome to Dynosaur, a machine learning project I started to learn all about
[reinforcement learning](https://en.wikipedia.org/wiki/Reinforcement_learning) and
beat the Google Dinosaur Jumper Game.
To get started, head on over to http://dynosaur.billyz.me

## Table of Contents
- The Game
- Neural Networks
- Neuroevolution
- Neuroevolution of Augmenting Topologies (NEAT)
  - Sequential NEAT
  - Parallel NEAT
  - Continuous NEAT
- Backpropagation
- Q Learning
  - Sequential Q
  - Parallel Q
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

![alt text](https://github.com/BillyZhong/dynosaur/raw/master/documentation/inputsoutputs.png "Google Dinosaur Game")


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
