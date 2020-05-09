var slider = document.getElementById('myRange');
var output = document.getElementById('output');

output.innerHTML = "Speed: " + slider.value/100;

slider.oninput = function() {
    output.innerHTML = "Speed: " + this.value/100;
  }