var getUserMedia = require('getusermedia');

getUserMedia({video: false, audio: true}, function(err, stream) {
  if (err) return console.error(err)

  var socket = io();
  var Peer = require('simple-peer');
  var p = new Peer({
    initiator: location.hash === '#init',
    trickle: false,
    stream: stream
  });
  var isHost = (location.hash === '#init') ? true : false;
  var otherKey = null;

  p.on('error', function(err) {
    console.log('error', err)
  });

  p.on('signal', function(data) {
    socket.emit('emitMyKey', JSON.stringify(data));
  });

  socket.on('otherKey', function(key) {
    if (otherKey === null) {
      otherKey = key;
      p.signal(key);
    }
  });

  socket.on('hostKey', function(key) {
    if (otherKey === null && !isHost) {
      otherKey = key;
      p.signal(key);
    }
  });

  socket.on('noHostKeyFound', function(key) {
    if (!isHost) {
      $('#errorMessage').toggleClass("hidden");
    }
  });

  $('form').submit(function() {
    var msg = $('#m').val();
    if(msg != ""){
      $('#messages').append($('<li class="mine">').text(msg));
      p.send(msg);
      $('#m').val('');
    }
    return false;
  });

  p.on('data', function(msg) {
    $('#messages').append($('<li>').text(msg));
  });

  p.on('stream', function (stream) {
    var audio = $('#audioPlayer');
    audio[0].src = window.URL.createObjectURL(stream);
    audio[0].play();
  });

  //Volume code
  $('#volumeSlider').val($('audio').prop("volume")*100);

  $("#volume").on('click', function(){
    $('#volumeSlider').toggleClass("hidden");
  });

  $('#volumeSlider').on('input', function () {
      $('audio').prop("volume", $('#volumeSlider').val()/100);
  });
});
