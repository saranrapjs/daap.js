var walk = require('walk'),
  fs = require('fs'),
  options,
  songFiles = [],
  walker,
  arguments = process.argv.splice(2),
  directory = arguments[0],
  daap = require('../lib/daap'),
  Song = require('../lib/song').Song;

options = {
    followLinks: false,
};
if (!directory) {
	console.log('usage: node server.js');
	return;
}
walker = walk.walkSync(directory, options);

// OR
// walker = walk.walkSync("/tmp", options);

var counter = 0;
walker.on("file", function (root, fileStats, next) {
	counter++;
	if (counter>20)   next();
	var file = {
		path: root + '/' + fileStats.name,
		name:fileStats.name
	}
	if (fileStats.name !== '.DS_Store') songFiles.push(file);
});

walker.on("errors", function (root, nodeStatsArray, next) {
  next();
});

walker.on("end", function () {
	console.log(songFiles);
	var playlist = [];
	for (var i=0;i<songFiles.length;i++) {
		var song = new Song({
			file:songFiles[i].path,
			name:songFiles[i].name
		});
		playlist.push(song);	
	}

	daap.createServer({
	  advertise:true,
	  songs: playlist
	}).listen(3688);


});



