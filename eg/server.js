var daap = require('../lib/daap');
var Song = require('../lib/song').Song;

daap.createServer({
  advertise:true,
  songs: [new Song({
          file: 'Kalimba.mp3'
        })]
}).listen(3689);
