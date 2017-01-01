var r = new Runner('.interstitial-wrapper');

var s = setInterval(function(){
  if(!r.crashed){
    document.getElementById('gameNum').innerText = r.playCount;
    document.getElementById('score').innerText = parseInt(r.distanceMeter.digits[0]+r.distanceMeter.digits[1]+r.distanceMeter.digits[2]+r.distanceMeter.digits[3]+r.distanceMeter.digits[4]);
    document.getElementById('obstacleNum').innerText = r.horizon.obstacleNum;
    document.getElementById('tRexHeight').innerText = -r.tRex.yPos + 93;
    document.getElementById('tRexSpeed').innerText = r.currentSpeed;
    try {
      document.getElementById('firstObsLeft').innerText = r.horizon.obstacles[0].xPos + 1;
      document.getElementById('firstObsRight').innerText = r.horizon.obstacles[0].xPos + r.horizon.obstacles[0].typeConfig.width * r.horizon.obstacles[0].size - 1;
      document.getElementById('firstObsTop').innerText = -(r.horizon.obstacles[0].yPos + 1) + 139;
      document.getElementById('firstObsBottom').innerText = -(r.horizon.obstacles[0].yPos + r.horizon.obstacles[0].typeConfig.height - 1) + 139;
    }
    catch (e) {
      document.getElementById('firstObsLeft').innerText = 0;
      document.getElementById('firstObsRight').innerText = 0;
      document.getElementById('firstObsTop').innerText = 0;
      document.getElementById('firstObsBottom').innerText = 0;
    }
    try {
      document.getElementById('secondObsLeft').innerText = r.horizon.obstacles[1].xPos + 1;
      document.getElementById('secondObsRight').innerText = r.horizon.obstacles[1].xPos + r.horizon.obstacles[1].typeConfig.width * r.horizon.obstacles[0].size - 1;
      document.getElementById('secondObsTop').innerText = -(r.horizon.obstacles[1].yPos + 1) + 139;
      document.getElementById('secondObsBottom').innerText = -(r.horizon.obstacles[1].yPos + r.horizon.obstacles[1].typeConfig.height - 1) + 139;
    }
    catch (e) {
      document.getElementById('secondObsLeft').innerText = 0;
      document.getElementById('secondObsRight').innerText = 0;
      document.getElementById('secondObsTop').innerText = 0;
      document.getElementById('secondObsBottom').innerText = 0;
    }
  }
},50);
