(function() {
 
  var streaming = false,
      video        = document.querySelector('#video'),
      canvas       = document.querySelector('#canvas'),
      photo        = document.querySelector('#photo'),
      download      = document.querySelector('#download'),
      startbutton  = document.querySelector('#startbutton'),
      width = 600,
      height = 0;
 
  navigator.getMedia = ( navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia ||
                         navigator.msGetUserMedia);
 
  navigator.getMedia(
    {
      video: true,
      audio: true
    },
    function(stream) {
        main(stream);
        if (navigator.mozGetUserMedia) {
            video.mozSrcObject = stream;
        } else {
            var vendorURL = window.URL || window.webkitURL;
            video.src = vendorURL.createObjectURL(stream);
        }
        video.play();
    },
    function(err) {
        alert("An error occured! " + err);
    }
  );
 
  video.addEventListener('canplay', function(ev){
    if (!streaming) {
      height = video.videoHeight / (video.videoWidth/width);
      video.setAttribute('width', width);
      video.setAttribute('height', height);
      canvas.setAttribute('width', width);
      canvas.setAttribute('height', height);
      streaming = true;
    }
  }, false);
 
  function takepicture() {
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(video, 0, 0, width, height);
        var data = canvas.toDataURL('image/png');
        data = data.replace(/^data:image\/[^;]/, 'data:application/octet-stream');
        download.setAttribute('href', data);
  }
 
  startbutton.addEventListener('click', function(ev){
        takepicture();
        ev.preventDefault();
  }, false);
   
  function main(stream){
         
    audioContext = new webkitAudioContext();
    analyser = audioContext.createAnalyser();
    microphone = audioContext.createMediaStreamSource(stream);
    javascriptNode = audioContext.createScriptProcessor(2048, 1, 1);
 
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 1024;
 
    microphone.connect(analyser);
    analyser.connect(javascriptNode);
    javascriptNode.connect(audioContext.destination);
 
    var canvas = document.getElementById("soundLvl");
    context = canvas.getContext("2d");
 
    javascriptNode.onaudioprocess = function() {
        var array =  new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        var values = 0;
 
        var length = array.length;
        for (var i = 0; i < length; i++) {
            values += array[i];
        }
 
        var average = values / length;
        var THRESHOLD = 20;
        if(average > THRESHOLD)
            document.getElementById("startbutton").click();
         
        var centerX = 0;
        var centerY = 0;
        var MAX = 50;
        var radius = 10 + ((average < MAX) ? average : MAX);
        context.save();
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.translate(canvas.width / 2, canvas.height / 2);
        context.scale(2, 1);
        context.beginPath();
        context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
        context.restore();
        context.fillStyle = "rgba("+ ((average * 200 / MAX.toFixed(2))|0) + ", 0, 0, 1)";
        context.fill();
        context.lineWidth = 5;
        context.strokeStyle = 'black';
        context.stroke();
    }
 
}  
 
})();
