function pi(x,y){
  return ((x+y+1)*(x+y))/2 + y;
}

function invpi(z){
  var w = Math.floor((Math.sqrt(8*z+1)-1)/2)
  var t = (w**2+w)/2;
  return [w-z+t,z-t];
}
