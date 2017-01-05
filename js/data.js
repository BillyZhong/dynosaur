var r = new Runner('.interstitial-wrapper');
var naivebot = 0;
var downPressed = 0;
var fitnessChart;
var maxFitnessChart;
var snet;

var up = function(press){
  if(press){
    var event = new Event('keydown');
    event.keyCode = 38;
    event.which = event.keyCode;
    event.altKey = false;
    event.ctrlKey = true;
    event.shiftKey = false;
    event.metaKey = false;
    document.dispatchEvent(event);
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

var s = setInterval(function(){
  updateData();
  if(naivebot){
    if(parseInt(document.getElementById('firstObsRight').innerText) < 50){
      down(1);
    }
    else if(parseInt(document.getElementById('firstObsLeft').innerText) < 120){
      down(0);
      up(1);
    }
    else{
      down(1);
    }
  }
},50);

var drawNeuralNet = function(individual){
  try {
    snet.kill();
  }
  catch (e) {}

  var g = {
    nodes: [],
    edges: []
  };

  for (var i = 0; i < 10; i++){
    g.nodes.push({
      id: 'i' + i,
      label: "" + population[individual].layers.input.list[i].bias,
      x: (i-4.5)*10,
      y: -50,
      size: 0.5,
      color: '#00BCD4'
    });
  }

  for (var i = 0; i < population[individual].layers.hidden[0].size; i++){
    g.nodes.push({
      id: 'h' + i,
      label: "" + population[individual].layers.hidden[0].list[i].bias,
      x: (i-(population[individual].layers.hidden[0].size-1)/2)*10,
      y: 0,
      size: 0.5,
      color: '#00BCD4'
    });
  }

  for (var i = 0; i < 2; i++){
    g.nodes.push({
      id: 'o' + i,
      label: "" + population[individual].layers.output.list[i].bias,
      x: (i-0.5)*10,
      y: 50,
      size: 0.5,
      color: '#00BCD4'
    });
  }

  for (var i = 0; i < 10; i++){
    var k = 0;
    for(var j in population[individual].layers.input.list[i].connections.projected){
      g.edges.push({
        id: 'ei'+i+'h'+k,
        label: "" + population[individual].layers.input.list[i].connections.projected[j].weight,
        source: 'i' + i,
        target: 'h' + k,
        size: 0.5,
        color: population[individual].layers.input.list[i].connections.projected[j].weight > 0 ? "#8BC34A" : "#F44336",
        type: 'arrow'
      });
      k++;
    }
  }

  for (var i = 0; i < population[individual].layers.hidden[0].size; i++){
    var k = 0;
    for(var j in population[individual].layers.hidden[0].list[i].connections.projected){
      g.edges.push({
        id: 'eh'+i+'o'+k,
        label: "" + population[individual].layers.hidden[0].list[i].connections.projected[j].weight,
        source: 'h' + i,
        target: 'o' + k,
        size: 0.5,
        color: population[individual].layers.hidden[0].list[i].connections.projected[j].weight > 0 ? "#8BC34A" : "#F44336",
        type: 'arrow'
      });
      k++;
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

var evolve = function(){
  newPop();
  var intrvl = setInterval(function(){ if(r.crashed){if(currentIndividual%population.length==0&&currentIndividual!=0){evolvePop();} simulateNext();}},1000);
};

var newPop = function(){
  generation = 1;
  document.getElementById('genNum').innerHTML = generation;
  currentIndividual = 0;
  document.getElementById('indNum').innerHTML = currentIndividual + 1;
  generatePopulation(8,4);
  var labels = [];
  for(var i = 0; i < 8; i++){
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
  drawNeuralNet(currentIndividual%population.length);
  downPressed = 0;
  document.getElementById('indNum').innerHTML = currentIndividual%population.length+1;
  r.tRex.xPos = 25;
  simulateIndividual(currentIndividual%population.length, 0.5, 0.5);
  currentIndividual++;
  fitnessChart.data.datasets[0].data = fitness;
  fitnessChart.update();
};

var evolvePop = function(){
  selection();
  for(var i = 0; i < population.length; i+=2){
    crossover(i,i+1,0.5);
  }
  for(var i = 0; i < population.length; i++){
    mutation(i, 0.3);
  }
  maxFitnessChart.data.labels.push(generation);
  maxFitnessChart.update();
  generation++;
  document.getElementById('genNum').innerHTML = generation;
};
