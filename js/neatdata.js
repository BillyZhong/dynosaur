var r = new Runner('.interstitial-wrapper');
var downPressed = 0;
var fitnessChart;
var maxFitnessChart;
var snet;
var evolution;

var up = function(press){
  if(press && inputs[0] == 0){
    var event = new Event('keydown');
    event.keyCode = 38;
    event.which = event.keyCode;
    event.altKey = false;
    event.ctrlKey = true;
    event.shiftKey = false;
    event.metaKey = false;
    document.dispatchEvent(event);
  }
  else if(!press){
    var event = new Event('keyup');
    event.keyCode = 38;
    event.which = event.keyCode;
    event.altKey = false;
    event.ctrlKey = true;
    event.shiftKey = false;
    event.metaKey = false;
    document.dispatchEvent(event);
  }
};

var down = function(press){
  if(press && !downPressed){
    var event = new Event('keydown');
    event.keyCode = 40;
    event.which = event.keyCode;
    event.altKey = false;
    event.ctrlKey = true;
    event.shiftKey = false;
    event.metaKey = false;
    document.dispatchEvent(event);
    downPressed = 1;
  }
  else if(!press && downPressed){
    var event = new Event('keyup');
    event.keyCode = 40;
    event.which = event.keyCode;
    event.altKey = false;
    event.ctrlKey = true;
    event.shiftKey = false;
    event.metaKey = false;
    document.dispatchEvent(event);
    downPressed = 0;
  }
};

var exportPop = function(){
  var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({population: population, innovations: innovations}));
  var ae = document.getElementById('exportJSON');
  ae.href = 'data:' + data;
  ae.download = 'population.json';
  ae.click();
};

var importPop = function(files){
  population = [];
  fitness = [];
  innovations = [];
  var fr = new FileReader();
  fr.onload = function(e) {
    var res = JSON.parse(e.target.result);
    for(var i = 0; i < res.population.length; i++){
      population.push(res.population[i]);
      fitness.push(0);
    }
    for(var i = 0; i < res.innovations.length; i++){
      innovations.push(res.innovations[i]);
    }
    newPop(0);
  }

  fr.readAsText(files.item(0));
};

var updateData = function(){
  if(!r.crashed){
    document.getElementById('fitnessScore').innerHTML = isNaN(parseInt(r.distanceMeter.digits[0]+r.distanceMeter.digits[1]+r.distanceMeter.digits[2]+r.distanceMeter.digits[3]+r.distanceMeter.digits[4])) ? 0 : parseInt(r.distanceMeter.digits[0]+r.distanceMeter.digits[1]+r.distanceMeter.digits[2]+r.distanceMeter.digits[3]+r.distanceMeter.digits[4]);
    document.getElementById('obstacleNum').innerHTML = r.horizon.obstacleNum;
    document.getElementById('tRexHeight').innerText = -r.tRex.yPos + 93;
    inputs[0] = -r.tRex.yPos + 93;
    document.getElementById('tRexSpeed').innerText = r.currentSpeed;
    inputs[1] = r.currentSpeed;
    try {
      document.getElementById('firstObsLeft').innerText = r.horizon.obstacles[0].xPos + 1;
      inputs[2] = r.horizon.obstacles[0].xPos + 1;
      document.getElementById('firstObsRight').innerText = r.horizon.obstacles[0].xPos + r.horizon.obstacles[0].typeConfig.width * r.horizon.obstacles[0].size - 1;
      inputs[3] = r.horizon.obstacles[0].xPos + r.horizon.obstacles[0].typeConfig.width * r.horizon.obstacles[0].size - 1;
      document.getElementById('firstObsTop').innerText = -(r.horizon.obstacles[0].yPos + 1) + 139;
      inputs[4] = -(r.horizon.obstacles[0].yPos + 1) + 139;
      document.getElementById('firstObsBottom').innerText = -(r.horizon.obstacles[0].yPos + r.horizon.obstacles[0].typeConfig.height - 1) + 139;
      inputs[5] = -(r.horizon.obstacles[0].yPos + r.horizon.obstacles[0].typeConfig.height - 1) + 139;
    }
    catch (e) {
      document.getElementById('firstObsLeft').innerText = 999;
      inputs[2] = 999;
      document.getElementById('firstObsRight').innerText = 999;
      inputs[3] = 999;
      document.getElementById('firstObsTop').innerText = 999;
      inputs[4] = 999;
      document.getElementById('firstObsBottom').innerText = 999;
      inputs[5] = 999;
    }
    try {
      document.getElementById('secondObsLeft').innerText = r.horizon.obstacles[1].xPos + 1;
      inputs[6] = r.horizon.obstacles[1].xPos + 1;
      document.getElementById('secondObsRight').innerText = r.horizon.obstacles[1].xPos + r.horizon.obstacles[1].typeConfig.width * r.horizon.obstacles[0].size - 1;
      inputs[7] = r.horizon.obstacles[1].xPos + r.horizon.obstacles[1].typeConfig.width * r.horizon.obstacles[0].size - 1;
      document.getElementById('secondObsTop').innerText = -(r.horizon.obstacles[1].yPos + 1) + 139;
      inputs[8] = -(r.horizon.obstacles[1].yPos + 1) + 139;
      document.getElementById('secondObsBottom').innerText = -(r.horizon.obstacles[1].yPos + r.horizon.obstacles[1].typeConfig.height - 1) + 139;
      inputs[9] = -(r.horizon.obstacles[1].yPos + r.horizon.obstacles[1].typeConfig.height - 1) + 139;
    }
    catch (e) {
      document.getElementById('secondObsLeft').innerText = 999;
      inputs[6] = 999;
      document.getElementById('secondObsRight').innerText = 999;
      inputs[7] = 999;
      document.getElementById('secondObsTop').innerText = 999;
      inputs[8] = 999;
      document.getElementById('secondObsBottom').innerText = 999;
      inputs[9] = 999;
    }
    if(outputBinary[0] && outputBinary[1]){
      down(1);
    }
    else{
      up(outputBinary[0]);
      down(outputBinary[1]);
    }
    document.getElementById('upOutput').innerText = outputs[0];
    if(outputBinary[0]){
      document.getElementById('upSwitch').setAttribute('checked',"");
      document.getElementById('upSwitch').parentElement.className += !document.getElementById('upSwitch').parentElement.className.includes(' is-checked') ? ' is-checked' : ''
    }
    else{
      document.getElementById('upSwitch').removeAttribute('checked');
      document.getElementById('upSwitch').parentElement.className = document.getElementById('upSwitch').parentElement.className.replace(' is-checked','');
    }
    document.getElementById('downOutput').innerText = outputs[1];
    if(outputBinary[1]){
      document.getElementById('downSwitch').setAttribute('checked',"");
      document.getElementById('downSwitch').parentElement.className += !document.getElementById('downSwitch').parentElement.className.includes(' is-checked') ? ' is-checked' : ''
    }
    else{
      document.getElementById('downSwitch').removeAttribute('checked');
      document.getElementById('downSwitch').parentElement.className = document.getElementById('downSwitch').parentElement.className.replace(' is-checked','');
    }
  }
};

var drawNeatNeuralNet = function(individual){
  try {
    snet.kill();
  }
  catch (e) {}

  var g = {
    nodes: [],
    edges: []
  };

  for(var i = 0; i < 10; i++){
    g.nodes.push({
      id: '' + (i+1),
      label: '' + (i+1),
      x: (i-4.5)*10,
      y: -50,
      size: 0.5,
      color: '#00BCD4'
    });
  }

  for(var i = 10; i < 12; i++){
    g.nodes.push({
      id: '' + (i+1),
      label: '' + (i+1),
      x: (i-10.5)*50,
      y: 50,
      size: 0.5,
      color: '#00BCD4'
    });
  }

  for(var i = 2; i < population[individual].nodes.length; i++){
    g.nodes.push({
      id: '' + (i+11),
      label: '' + (i+11),
      x: Math.random()*80-40,
      y: Math.random()*80-40,
      size: 0.5,
      color: '#00BCD4'
    });
  }

  for(var i = 0; i < population[individual].edges.length; i++){
    if(!population[individual].edges[i].disabled){
      g.edges.push({
        id: '' + population[individual].edges[i].innovation,
        label: '' + population[individual].edges[i].innovation,
        source: population[individual].edges[i].source,
        target: population[individual].edges[i].dest,
        size: Math.abs(population[individual].edges[i].weight),
        color: population[individual].edges[i].weight > 0 ? "#8BC34A" : "#F44336",
        type: population[individual].edges[i].source == population[individual].edges[i].dest ? 'curvedArrow' : 'arrow'
      });
    }
  }

  snet = new sigma({
    graph: g,
    renderer: {
      container: document.getElementById('neuralNetContainer'),
      type: 'canvas'
    },
    settings: {
      edgeLabelSize: 'proportional'
    }
  });
};

var startEvolution = function(){
  evolution = setInterval(function(){ if(r.crashed){if(currentIndividual%population.length==0&&currentIndividual!=0){evolvePop();} simulateNext();}},1000);
};

var stopEvolution = function(){
  clearInterval(evolution);
};

var newPop = function(gen){
  generation = 1;
  document.getElementById('genNum').innerHTML = generation;
  currentIndividual = 0;
  document.getElementById('indNum').innerHTML = currentIndividual + 1;
  maxFitness = [];
  if(gen){
    generateNeatPopulation(config.populationSize);
  }
  var labels = [];
  for(var i = 0; i < population.length; i++){
    labels.push("Individual " + (i+1));
  }
  var fitnessCtx = document.getElementById('fitnessChart').getContext('2d');
  var data = {
      labels: labels,
      datasets: [
          {
              data: fitness,
          }]
  };
  try {
    fitnessChart.destroy();
  }
  catch (e){}
  fitnessChart = new Chart(fitnessCtx, {
      type: 'doughnut',
      data: data,
      options: {legend: {display:false}, layout:{padding:10}}
  });
  var maxFitnessCtx = document.getElementById('maxFitnessChart').getContext('2d');
  var data = {
      labels: [],
      datasets: [
          {
              label: "Maximum Fitness",
              fill: false,
              lineTension: 0.1,
              backgroundColor: "rgba(0,188,212,0.4)",
              borderColor: "rgba(0,188,212,1)",
              borderCapStyle: 'butt',
              borderDash: [],
              borderDashOffset: 0.0,
              borderJoinStyle: 'miter',
              pointBorderColor: "rgba(0,188,212,1)",
              pointBackgroundColor: "#fff",
              pointBorderWidth: 1,
              pointHoverRadius: 5,
              pointHoverBackgroundColor: "rgba(0,188,212,1)",
              pointHoverBorderColor: "rgba(220,220,220,1)",
              pointHoverBorderWidth: 2,
              pointRadius: 1,
              pointHitRadius: 10,
              data: maxFitness,
              spanGaps: false,
          }
      ]
  };
  try {
    maxFitnessChart.destroy();
  }
  catch (e){}
  maxFitnessChart = new Chart(maxFitnessCtx, {
      type: 'line',
      data: data,
  	  options: {legend: {display:false}, layout:{padding:20}}
  });
};

var simulateNext = function(){
  drawNeatNeuralNet(currentIndividual%population.length);
  up(0);
  downPressed = 0;
  document.getElementById('indNum').innerHTML = currentIndividual%population.length+1;
  r.tRex.xPos = 25;
  simulateIndividual(currentIndividual%population.length, config.outputThreshold[0], config.outputThreshold[1]);
  currentIndividual++;
  fitnessChart.data.datasets[0].data = fitness;
  fitnessChart.update();
};

var evolvePop = function(){
  selection();
  for(var i = 0; i < 2*population.length/3; i+=2){
    population[2*population.length/3 + i/2] = graphCrossover(i,i+1);
  }
  for(var i = 0; i < population.length; i++){
    if(Math.random() < config.addEdgeMutationRate){
      edgeMutation(i);
    }
    if(Math.random() < config.addNodeMutationRate){
      nodeMutation(i);
    }
    if(Math.random() < config.deleteEdgeMutationRate){
      deleteEdgeMutation(i);
    }
    biasMutation(i, config.biasMutationRate, config.negateBiasMutationRate);
    disableMutation(i, config.disableGeneMutationRate, config.enableGeneMutationRate);
    weightMutation(i, config.edgeMutationRate, config.negateEdgeMutationRate);
  }
  maxFitnessChart.data.labels.push(generation);
  maxFitnessChart.update();
  generation++;
  document.getElementById('genNum').innerHTML = generation;
};
