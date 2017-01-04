var r = new Runner('.interstitial-wrapper');
var naivebot = 0;
var downPressed = 0;

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
    document.getElementById('score').innerHTML = parseInt(r.distanceMeter.digits[0]+r.distanceMeter.digits[1]+r.distanceMeter.digits[2]+r.distanceMeter.digits[3]+r.distanceMeter.digits[4]);
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
    up(outputBinary[0]);
    document.getElementById('upOutput').innerText = outputs[0];
    if(outputBinary[0]){
      document.getElementById('upSwitch').setAttribute('checked',"");
      document.getElementById('upSwitch').parentElement.className += !document.getElementById('upSwitch').parentElement.className.includes(' is-checked') ? ' is-checked' : ''
    }
    else{
      document.getElementById('upSwitch').removeAttribute('checked');
      document.getElementById('upSwitch').parentElement.className = document.getElementById('upSwitch').parentElement.className.replace(' is-checked','');
    }
    down(outputBinary[1]);
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

var simulateNext = function(){
  document.getElementById('indNum').innerHTML = currentIndividual%population.length+1;
  simulateIndividual(currentIndividual%population.length, 0.5, 0.5);
  generation = Math.floor(currentIndividual/population.length)+1;
  document.getElementById('genNum').innerHTML = generation;
  currentIndividual++;
};

var evolvePop = function(){
  selection(totalFitness);
  for(var i = 0; i < population.length; i+=2){
    crossover(i,i+1,0.5);
  }
  for(var i = 0; i < population.length; i++){
    mutation(i, 0.3);
  }
};
