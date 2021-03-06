var r = new Runner('.interstitial-wrapper');
var naivebot = 0;
var downPressed = 0;
var fitnessChart;
var scoreChart;
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
  var tempArr = [];
  for(var i = 0; i < population.length; i++){
    tempArr.push(population[i].toJSON());
  }
  var data = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tempArr));
  var ae = document.getElementById('exportJSON');
  ae.href = 'data:' + data;
  ae.download = 'population.json';
  ae.click();
};

var importPop = function(files){
  population = [];
  fitness = [];
  var fr = new FileReader();
  fr.onload = function(e) {
    var res = JSON.parse(e.target.result);
    for(var i = 0; i < res.length; i++){
      population.push(synaptic.Network.fromJSON(res[i]));
      fitness.push(0);
    }
    newPop(0);
  }

  fr.readAsText(files.item(0));
};

var updateCrossover = function(cr){
  crossoverRate = parseFloat(cr);
  document.getElementById('crossoverVal').innerHTML = cr;
};

var updateMutation = function(mr){
  mutationRate = parseFloat(mr);
  document.getElementById('mutationVal').innerHTML = mr;
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

  for (var i = 0; i < population[individual].layers.input.size; i++){
    g.nodes.push({
      id: 'i' + i,
      label: "", //+ population[individual].layers.input.list[i].bias,
      x: (i-(population[individual].layers.input.size-1)/2)*10,
      y: (-(population[individual].layers.hidden.length+1)/2)*40,
      size: 0.5,
      color: '#00BCD4'
    });
  }

  for(var i = 0; i < population[individual].layers.hidden.length; i++){
    for (var j = 0; j < population[individual].layers.hidden[i].size; j++){
      g.nodes.push({
        id: 'h' + i + "," + j,
        label: "", //+ population[individual].layers.hidden[i].list[j].bias,
        x: (j-(population[individual].layers.hidden[i].size-1)/2)*10,
        y: (i-(population[individual].layers.hidden.length-1)/2)*40,
        size: 0.5,
        color: '#00BCD4'
      });
    }
  }

  for (var i = 0; i < population[individual].layers.output.size; i++){
    g.nodes.push({
      id: 'o' + i,
      label: "", //+ population[individual].layers.output.list[i].bias,
      x: (i-0.5)*10,
      y: ((population[individual].layers.hidden.length+1)/2)*40,
      size: 0.5,
      color: '#00BCD4'
    });
  }

  for (var i = 0; i < population[individual].layers.input.size; i++){
    var k = 0;
    for(var j in population[individual].layers.input.list[i].connections.projected){
      g.edges.push({
        id: 'ei'+i+'h0,'+k,
        label: "", //+ population[individual].layers.input.list[i].connections.projected[j].weight,
        source: 'i' + i,
        target: 'h0,' + k,
        size: Math.abs(population[individual].layers.input.list[i].connections.projected[j].weight),
        color: population[individual].layers.input.list[i].connections.projected[j].weight > 0 ? "#8BC34A" : "#F44336",
        type: 'arrow'
      });
      k++;
    }
  }

  for (var i = 0; i < population[individual].layers.hidden.length-1; i++){
    for (var j = 0; j < population[individual].layers.hidden[i].size; j++){
      var l = 0;
      for(var k in population[individual].layers.hidden[i].list[j].connections.projected){
        g.edges.push({
          id: 'eh'+i+','+j+'h'+(i+1)+','+l,
          label: "", //+ population[individual].layers.hidden[i].list[j].connections.projected[k].weight,
          source: 'h' + i + ',' + j,
          target: 'h' + (i+1) + ',' + l,
          size: Math.abs(population[individual].layers.hidden[i].list[j].connections.projected[k].weight),
          color: population[individual].layers.hidden[i].list[j].connections.projected[k].weight > 0 ? "#8BC34A" : "#F44336",
          type: 'arrow'
        });
        l++;
      }
    }
  }

  for (var i = 0; i < population[individual].layers.hidden[population[individual].layers.hidden.length-1].size; i++){
    var k = 0;
    for(var j in population[individual].layers.hidden[population[individual].layers.hidden.length-1].list[i].connections.projected){
      g.edges.push({
        id: 'eh'+(population[individual].layers.hidden.length-1)+','+i+'o'+k,
        label: "", //+ population[individual].layers.input.list[i].connections.projected[j].weight,
        source: 'h'+(population[individual].layers.hidden.length-1)+','+i,
        target: 'o' + k,
        size: Math.abs(population[individual].layers.hidden[population[individual].layers.hidden.length-1].list[i].connections.projected[j].weight),
        color: population[individual].layers.hidden[population[individual].layers.hidden.length-1].list[i].connections.projected[j].weight > 0 ? "#8BC34A" : "#F44336",
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
  scores = [];
  if(gen){
    generatePopulation(32,[12,12,12]);
  }
  var labels = [];
  for(var i = 0; i < population.length; i++){
    labels.push("Individual " + (i+1));
  }
  var fitnessChartCtx = document.getElementById('fitnessChart').getContext('2d');
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
  fitnessChart = new Chart(fitnessChartCtx, {
      type: 'doughnut',
      data: data,
      options: {legend: {display:false}, layout:{padding:10}}
  });
  var scoreChartCtx = document.getElementById('scoreChart').getContext('2d');
  var data = {
      labels: [],
      datasets: [
          {
              label: "Score",
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
              data: [],
              spanGaps: false,
          }
      ]
  };
  try {
    scoreChart.destroy();
  }
  catch (e){}
  scoreChart = new Chart(scoreChartCtx, {
      type: 'line',
      data: data,
  	  options: {legend: {display:false}, layout:{padding:20}}
  });
};

var simulateNext = function(){
  drawNeuralNet(currentIndividual%population.length);
  up(0);
  downPressed = 0;
  document.getElementById('indNum').innerHTML = currentIndividual%population.length+1;
  r.tRex.xPos = 25;
  simulateIndividual(currentIndividual%population.length, 0.5, 0.5);
  currentIndividual++;
  fitnessChart.data.datasets[0].data = fitness;
  fitnessChart.update();
  scoreChart.data.labels = Array(scores.length).fill().map((e,i)=>i+1);;
  scoreChart.data.datasets[0].data = scores.slice();
  scoreChart.update();
};

var evolvePop = function(){
  weightedSelection();
  for(var i = 0; i < population.length; i+=2){
    subgraphCrossover(i,i+1);
  }
  for(var i = 0; i < population.length; i++){
    mutation(i);
  }
  generation++;
  document.getElementById('genNum').innerHTML = generation;
};
