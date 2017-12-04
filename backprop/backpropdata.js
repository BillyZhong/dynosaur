window.addEventListener("keydown", function(e) {
  if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
      e.preventDefault();
  }
}, false);
var exportData = function(){
  var d = "text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
  var ae = document.getElementById('exportJSON');
  ae.href = 'data:' + d;
  ae.download = 'data.json';
  ae.click();
};

var importData = function(files){
  var fr = new FileReader();
  fr.onload = function(e) {
    var res = JSON.parse(e.target.result);
    data = res;
  }

  fr.readAsText(files.item(0));
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
