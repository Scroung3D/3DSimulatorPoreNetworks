var app = require( 'express' )();
var http = require('http').Server(app);
var fs = require( 'fs' );
var io = require( 'socket.io' )(http);
var parser = require( './parser' );
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

app.get( /^\/L\d+_xmb\d+_xms\d+_s\d+_cs\d+_nc\d+_f\d+_nt\d+_c_\d+bat$/, function(req, res){
  mainurl = req.url;
  var nameFile1 = (mainurl + '.bin').substring( 1 );
  var nameFile2 = (mainurl + '.json').substring( 1 );
  if( fileExists( nameFile1 ) && fileExists( nameFile2 ) ) {
      res.sendfile('redesPorosasv6.html');
      app.get( mainurl + '.json', function(req, res){
        var url = req.url;
        var nameFile = ( url ).substring( 1 );
        if( fileExists( nameFile ) ){
            res.sendfile( nameFile );
            app.get( '/redesPorosasv6.js', function(req, res){
              var url = req.url;
              var nameFile = ( url ).substring( 1 );
              if( fileExists( nameFile ) ){
                  res.sendfile('redesPorosasv6.js');
              }
              else {
                  //PENDIENTE
                  console.log( "No está el archivo" );
              }
          });
        }
        else {
            //PENDIENTE
            console.log( "No está el archivo" + url );
        }
      });
  }
  else {
      //PENDIENTE
      console.log( "No está el archivo3" );
  }

});

app.get( /^\/L\d+_xmb\d+_xms\d+_s\d+_cs\d+_nc\d+_f\d+_nt\d+_c_\d+bat_custom.json$/, function(req, res){
  var nameFile = ( req.url ).substring( 1 );
  if( fileExists( nameFile )  ) {
      res.sendfile( nameFile );
  }
  else {
      //PENDIENTE
      console.log( "No está el archivo3" );
  }

});

app.get( '/datguimin.js', function(req, res){
  var url = req.url;
  var nameFile = ( url ).substring( 1 );
  if( fileExists( nameFile ) ){
      res.sendfile('datguimin.js');
  }
  else {
      //PENDIENTE
      console.log( "No está el archiv1o" );
  }
});

app.get( '/webgl-utils.js', function(req, res){
  var url = req.url;
  var nameFile = ( url ).substring( 1 );
  if( fileExists( nameFile ) ){
      res.sendfile('webgl-utils.js');
  }
  else {
      //PENDIENTE
      console.log( "No está el archivo2" );
  }
});

app.get( '/initShaders.js', function(req, res){
  var url = req.url;
  var nameFile = ( url ).substring( 1 );
  if( fileExists( nameFile ) ){
      res.sendfile('initShaders.js');
  }
  else {
      //PENDIENTE
      console.log( "No está el archivo3" );
  }
});

app.get( '/flatten.js', function(req, res){
  var url = req.url;
  var nameFile = ( url ).substring( 1 );
  if( fileExists( nameFile ) ){
      res.sendfile('flatten.js');
  }
  else {
      //PENDIENTE
      console.log( "No está el archivo4" );
  }
});

app.get( '/MV.js', function(req, res){
  var url = req.url;
  var nameFile = ( url ).substring( 1 );
  if( fileExists( nameFile ) ){
      res.sendfile('MV.js');
  }
  else {
      //PENDIENTE
      console.log( "No está el archivo5" );
  }
});

app.get( '/figurasv2.js', function(req, res){
  var url = req.url;
  var nameFile = ( url ).substring( 1 );
  if( fileExists( nameFile ) ){
      res.sendfile('figurasv2.js');
  }
  else {
      //PENDIENTE
      console.log( "No está el archivo6" );
  }
});

app.get( '/redesPorosasv6.js', function(req, res){
  var url = req.url;
  var nameFile = ( url ).substring( 1 );
  if( fileExists( nameFile ) ){
      res.sendfile('redesPorosasv6.js');
  }
  else {
      //PENDIENTE
      console.log( "No está el archivo7" );
  }
});



io.on('connection', function(socket){
  console.log('Se conectaron');
  io.emit('cargaJSON', mainurl);
});

io.on('connection', function(socket){
  socket.on('mensaje', function(msg){
    parser( mainurl, Number(msg.iniX), Number(msg.finX), Number(msg.iniY), Number(msg.finY), Number(msg.iniZ), Number(msg.finZ), io );
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
