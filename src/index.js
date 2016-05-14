var app = require( 'express' )();
var http = require('http').Server(app);
var fs = require( 'fs' );
var io = require( 'socket.io' )(http);
var parser = require( './parserCustom' );
var path = require('path');
var clients = {};
var nombre = '';
var red = '';
var dir = '';

var mainurl = '/';

function fileExists(filePath)
{
    try
    {
        return fs.statSync(filePath).isFile();
    }
    catch (err)
    {
        return false;
    }
}

app.get( /^\/[a-z0-9_-]{3,15}\/(L\d+_xmb|L\d+xmb)\d+_xms\d+_om\d+\.\d+_s\d+_cs\d+_nc\d+_f\d+(_nt\d+(_c_|_s_)\d+bat|_c_\d+_bat_\d+)$/, function(req, res){
  nombre = req.url.substring(1,req.url.indexOf('/',1));
  red = req.url.substring(req.url.indexOf('/',1) + 1);
  var dirAux = "/home/" + nombre + "/public_html/apprwgl/";
  var sAux = red.split("_");
  if(sAux[0].indexOf("xmb") === -1){
      dir = dirAux + "redesCR/";
  }
  else{
      dir = dirAux + "redesSR/";
  }
  var nameFile1 = dir + 'bin/' + red + '.bin';
  var nameFile2 = dir + 'json/' + red + '_default.json';
  if( fileExists( nameFile1 ) && fileExists( nameFile2 ) ) {
      res.sendfile('redesPorosas.html');
      app.get( '/' + red + '_default.json', function(req, res){
        if( fileExists( nameFile2 ) ){
            res.sendfile( path.resolve( nameFile2 ) );
            app.get( '/redesPorosas.js', function(req, res){
              var url = req.url;
              if( fileExists( nameFile1 ) ){
                  res.sendfile('redesPorosas.js');
              }
              else {
                  //PENDIENTE
                  console.log( "No está el archivo1" );
              }
          });
        }
        else {
            //PENDIENTE
            console.log( "No está el archivo2" + url );
        }
      });
  }
  else {
      //PENDIENTE
      console.log( "No está el archivo3" );
  }

});

app.get( /^\/(L\d+_xmb|L\d+xmb)\d+_xms\d+_om\d+\.\d+_s\d+_cs\d+_nc\d+_f\d+(_nt\d+(_c_|_s_)\d+bat|_c_\d+_bat_\d+)_custom.json$/, function(req, res){
  var nameFile = dir + 'json/' + red + '_custom.json';
  if( fileExists( nameFile )  ) {
      res.sendfile( path.resolve( nameFile ) );
  }
  else {
      //PENDIENTE
      console.log( "No está el archivo4" );
  }

});

app.get( /^\/(L\d+_xmb|L\d+xmb)\d+_xms\d+_om\d+\.\d+_s\d+_cs\d+_nc\d+_f\d+(_nt\d+(_c_|_s_)\d+bat|_c_\d+_bat_\d+)_CC\d+_custom.json$/, function(req, res){
  var proc = req.url.substring(req.url.indexOf('_CC'),req.url.indexOf('_custom.json'));
  console.log("!11111 " + proc);
  var nameFile = dir + 'json/' + red + proc +'_custom.json';
  if( fileExists( nameFile )  ) {
      res.sendfile( path.resolve( nameFile ) );
  }
  else {
      //PENDIENTE
      console.log( "No está el archivo5" );
  }

});

app.get( /^\/(L\d+_xmb|L\d+xmb)\d+_xms\d+_om\d+\.\d+_s\d+_cs\d+_nc\d+_f\d+(_nt\d+(_c_|_s_)\d+bat|_c_\d+_bat_\d+)_default.json$/, function(req, res){
  var nameFile = dir + 'json/' +red + '_default.json';
  if( fileExists( nameFile )  ) {
      res.sendfile( path.resolve( nameFile ) );
  }
  else {
      //PENDIENTE
      console.log( "No está el archivo6" );
  }

});

app.get( /^\/(L\d+_xmb|L\d+xmb)\d+_xms\d+_om\d+\.\d+_s\d+_cs\d+_nc\d+_f\d+(_nt\d+(_c_|_s_)\d+bat|_c_\d+_bat_\d+)_CC\d+_default.json$/, function(req, res){
  var proc = req.url.substring(req.url.indexOf('_CC'),req.url.indexOf('_default.json'));
  console.log("!11111 " + proc);
  var nameFile = dir + 'json/' +red + proc +'_default.json';
  if( fileExists( nameFile )  ) {
      res.sendfile( path.resolve( nameFile ) );
  }
  else {
      //PENDIENTE
      console.log( "No está el archivo7: " + nameFile   );
  }

});

app.get( '/datguimin.js', function(req, res){
  var nameFile = '/home/redeswgl/nodeRePoApp/src/misc/datguimin.js';
  if( fileExists( nameFile ) ){
      res.sendfile( path.resolve( nameFile ) );
  }
  else {
      //PENDIENTE
      console.log( "No está el archivo8" );
  }
});

app.get( '/webgl-utils.js', function(req, res){
  var nameFile = '/home/redeswgl/nodeRePoApp/src/misc/webgl-utils.js';
  if( fileExists( nameFile ) ){
      res.sendfile( path.resolve( nameFile ) );
  }
  else {
      //PENDIENTE
      console.log( "No está el archivo9" );
  }
});

app.get( '/initShaders.js', function(req, res){
  var nameFile = '/home/redeswgl/nodeRePoApp/src/misc/initShaders.js';
  if( fileExists( nameFile ) ){
      res.sendfile( path.resolve( nameFile ) );
  }
  else {
      //PENDIENTE
      console.log( "No está el archivo10" );
  }
});

app.get( '/flatten.js', function(req, res){
  var nameFile = '/home/redeswgl/nodeRePoApp/src/misc/flatten.js';
  if( fileExists( nameFile ) ){
      res.sendfile( path.resolve( nameFile ) );
  }
  else {
      //PENDIENTE
      console.log( "No está el archivo11" );
  }
});

app.get( '/MV.js', function(req, res){
  var nameFile = '/home/redeswgl/nodeRePoApp/src/misc/MV.js';
  if( fileExists( nameFile ) ){
      res.sendfile( path.resolve( nameFile ) );
  }
  else {
      //PENDIENTE
      console.log( "No está el archivo12" );
  }
});

app.get( '/figurasv2.js', function(req, res){
  var nameFile = '/home/redeswgl/nodeRePoApp/src/misc/figurasv2.js';
  if( fileExists( nameFile ) ){
      res.sendfile( path.resolve( nameFile ) );
  }
  else {
      //PENDIENTE
      console.log( "No está el archivo13" );
  }
});

app.get( '/redesPorosas.js', function(req, res){
  var nameFile = '/home/redeswgl/nodeRePoApp/src/redesPorosas.js';

  if( fileExists( nameFile ) ){
      res.sendfile( path.resolve( nameFile ) );
  }
  else {
      //PENDIENTE
      console.log( "No está el archivo14" );
  }
});



io.on('connection', function(socket){
  var nameFile = red;
  console.log("nombreRed: " + red);
  clients[socket.id] = {nameFile:nameFile, dirU:dir};
  console.log(nameFile);
  console.log(dir);
  fs.readdir(dir + "/bin", function(err,files){
      var proc = 0;
      for(i = 0; i < files.length; i++ ){
          if(files[i].indexOf(red + "_CC") >= 0) proc += 1;
      }
      clients[socket.id]["proc"] = proc;
      socket.emit('cargaJSONDefault', clients[socket.id]);
  });
});

io.on('connection', function(socket){
  socket.on('mensaje', function(msg){
    parser( clients[socket.id].dirU, red, Number(msg.iniX), Number(msg.finX), Number(msg.iniY), Number(msg.finY), Number(msg.iniZ), Number(msg.finZ), msg.bSmall, msg.bMedium, msg.bBig, Number(msg.tipo), Number(msg.proc), socket );
  });
});


io.on('connection', function(socket){
    socket.on('disconnect', function() {
        delete clients[socket.id];
        console.log("Se desconectan");
    });
});

http.listen(3000,'148.206.49.92',function(){
  console.log('listening on *:3000');
  console.log(this._connectionKey);
});
