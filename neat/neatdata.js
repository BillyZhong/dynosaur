var fitnessChart;
var scoreChart;
var snet;
var evolution;

var initGraphs = function(n){
  var labels = [];
  for(var i = 0; i < n; i++){
    labels.push("Individual " + (i+1));
  }
  var fitnessChartCtx = document.getElementById('fitnessChart').getContext('2d');
  var data = {
      labels: labels,
      datasets: [
          {
              data: [],
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
              label: "Fitness",
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

var updateGeneration = function(){
  document.getElementById('genNum').innerHTML = neat.p.generation;
};

var updateIndividual = function(){
  document.getElementById('indNum').innerHTML = neat.c+1;
  drawNeatNeuralNet(neat.c);
  var fitness = [];
  for(var i = 0; i < neat.n; i++){
    fitness.push(neat.p.population[i].fitness);
  }
  fitnessChart.data.datasets[0].data = fitness;
  fitnessChart.update();
  scoreChart.data.labels = Array(neat.p.scores.length).fill().map((e,i)=>i+1);;
  scoreChart.data.datasets[0].data = neat.p.scores.slice();
  scoreChart.update();
};

var update = function(inputs,outputs){
  document.getElementById('tRexSpeed').innerText = inputs[0];
  document.getElementById('tRexTop').innerText = inputs[1];
  document.getElementById('tRexBottom').innerText = inputs[2];
  document.getElementById('firstObsLeft').innerText = inputs[3];
  document.getElementById('firstObsRight').innerText = inputs[4];
  document.getElementById('firstObsTop').innerText = inputs[5];
  document.getElementById('firstObsBottom').innerText = inputs[6];
  document.getElementById('secondObsLeft').innerText = inputs[7];
  document.getElementById('secondObsRight').innerText = inputs[8];
  document.getElementById('secondObsTop').innerText = inputs[9];
  document.getElementById('secondObsBottom').innerText = inputs[10];
  document.getElementById('upOutput').innerText = outputs[0];
  document.getElementById('downOutput').innerText = outputs[1];
  if(outputs[0] > 0.5){
    document.getElementById('upSwitch').setAttribute('checked',"");
    document.getElementById('upSwitch').parentElement.className += !document.getElementById('upSwitch').parentElement.className.includes(' is-checked') ? ' is-checked' : ''
  }
  else{
    document.getElementById('upSwitch').removeAttribute('checked');
    document.getElementById('upSwitch').parentElement.className = document.getElementById('upSwitch').parentElement.className.replace(' is-checked','');
  }
  if(outputs[1] > 0.5){
    document.getElementById('downSwitch').setAttribute('checked',"");
    document.getElementById('downSwitch').parentElement.className += !document.getElementById('downSwitch').parentElement.className.includes(' is-checked') ? ' is-checked' : ''
  }
  else{
    document.getElementById('downSwitch').removeAttribute('checked');
    document.getElementById('downSwitch').parentElement.className = document.getElementById('downSwitch').parentElement.className.replace(' is-checked','');
  }
}


var drawNeatNeuralNet = function(individual){
  try {
    snet.kill();
  }
  catch (e) {}

  var g = {
    nodes: [],
    edges: []
  };

  for(var i = 1; i < 12; i++){
    g.nodes.push({
      id: '' + i,
      label: '' + i,
      x: (i-6)*10,
      y: -50,
      size: 0.5,
      color: '#00BCD4'
    });
  }

  for(var i in neat.p.population[individual].genome.nodes){
    g.nodes.push({
      id: '' + i,
      label: '' + i,
      x: Math.random()*80-40,
      y: Math.random()*80-40,
      size: 0.5,
      color: '#00BCD4'
    });
  }

  for(var i in neat.p.population[individual].genome.edges){
    if(!neat.p.population[individual].genome.edges[i].disabled){
      g.edges.push({
        id: '' + i,
        label: '' + i,
        source: neat.p.population[individual].genome.edges[i].source,
        target: neat.p.population[individual].genome.edges[i].dest,
        size: Math.abs(neat.p.population[individual].genome.edges[i].weight),
        color: neat.p.population[individual].genome.edges[i].weight > 0 ? "#8BC34A" : "#F44336",
        type: neat.p.population[individual].genome.edges[i].source == neat.p.population[individual].genome.edges[i].dest ? 'curvedArrow' : 'arrow'
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
