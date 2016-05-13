var fs = require('fs');
var path2 = require('path');

//parsear nombre

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

function getMaxOfArray(numArray) {
  return Math.max.apply(null, numArray);
}

function redondea(num) {
  return Math.round( num * 100 )/100;
}

module.exports = exports = function( path, red, iniX, finX, iniY, finY, iniZ, finZ, bSmall, bMedium, bBig, tipo, nProc, socket ){
    var crgFlag = true;
    var objson = {};
    var objsonColor = {};
    var nameCustom = path + 'json/' + red  + '_custom' + '.json';
    if( fileExists( nameCustom ) ) {
        fs.unlink( path2.resolve( nameCustom ) );
    }
    var nameFile =  path + 'bin/' + red  + '.bin';
    fs.readFile( path2.resolve( nameFile ), function (err, data ) {
        var nameFileColor =  path + 'bin/' + red  + '_CC'+ nProc + '.bin';
        var nameCustomColor = path + 'json/' + red  + '_CC' + nProc +'_custom.json';
        console.log("KKKK + " + nProc);
        console.log("QQQQQ +" + nameFileColor);
        fs.readFile( path2.resolve( nameFileColor ), function (err, dataColor ) {
            nameFile = ( '/' + red + '.bin').substring(1);
            var s = nameFile.split( '_' );
            console.log(s);
            if (s[0].search(/xmb/) != -1){
                crgFlag = false;
                var L = Number(s[0].substring(1,s[0].indexOf("xmb")));
                var xmb = Number(s[0].substring(s[0].indexOf("xmb")+3));
                var xms = Number(s[1].substring( 3 ));
                var om = Number(s[2].substring( 2 ));
                var sigma = Number(s[3].substring( 1 ));
                var cs = Number(s[4].substring( 2 ));
                var nc = Number(s[5].substring( 2 ));
                var f = Number(s[6].substring( 1 ));
                var c = Number(s[8]);
                var bat = Number(s[10].substring(0,s[10].indexOf(".bin")));
                objson["L"] = L;
                objson["xmb"] = xmb;
                objson["xms"] = xms;
                objson["om"] = om;
                objson["sigma"] = sigma;
                objson["cs"] = cs;
                objson["nc"] = nc;
                objson["f"] = f;
                objson["c"] = c;
                objson["bat"] = bat;
            }
            else{
                var L = Number(s[0].substring( 1 ));
                var xmb = Number(s[1].substring( 3 ));
                var xms = Number(s[2].substring( 3 ));
                var om = Number(s[3].substring( 2 ));
                var sigma = Number(s[4].substring( 1 ));
                var cs = Number(s[5].substring( 2 ));
                var nc = Number(s[6].substring( 2 ));
                var f = Number(s[7].substring( 1 ));
                var nt = Number(s[8].substring( 2 ));
                var bat = Number(s[10].substring(0,s[10].indexOf("bat")));
                objson["L"] = L;
                objson["xmb"] = xmb;
                objson["xms"] = xms;
                objson["om"] = om;
                objson["sigma"] = sigma;
                objson["cs"] = cs;
                objson["nc"] = nc;
                objson["f"] = f;
                objson["nt"] = nt;
                objson["bat"] = bat;
            }
            console.log("L: " + L,"xmb: " + xmb, "xms: " + xms, "sigma: " + sigma);
            var array = [];
            var arrayColores = [];

            for ( var i = 0; i < L*L*L*4*4 ; i = i + 16 ) {
                array.push([redondea( data.readFloatLE( i ) ),
                            redondea( data.readFloatLE( i + 4 ) ),
                            redondea( data.readFloatLE( i + 8 ) ),
                            redondea( data.readFloatLE( i + 12 ))]);
            }

            for ( var i = 0; i < L*L*L*4*4 ; i = i + 16 ) {
                arrayColores.push([dataColor.readInt32LE( i ) ,
                                   dataColor.readInt32LE( i + 4 ),
                                   dataColor.readInt32LE( i + 8 ),
                                   dataColor.readInt32LE( i + 12 )]);
            }
            console.log("&&&&&&&&&&&& " + arrayColores[0], arrayColores[1], arrayColores[2]);

            rmax = 0;
            for (x in array) {
                if (rmax < array[x][0]){
                    rmax = array[x][0];
                }
            }

            interespacio = (rmax / 100.0)*2*1.2;
            cota = (( L-1 ) / 2.0) * interespacio;

            sitios = [];
            sitiosColor = [];
            enlaces = [];
            enlacesColor = [];


            i = 0;
            maxX = -cota - 1;
            maxY = -cota - 1;
            maxZ = -cota - 1;
            minX = cota + 1;
            minY = cota + 1;
            minZ = cota + 1;
            x = -cota;
            x2 = 1;
            console.log(bSmall, bMedium, bBig);
            var cuenta1 = 0;
            var cuenta2 = 0;
            var cuenta3 = 0;

            while( x2 >= 1 && x2 <= L ) {
                y = -cota;
                y2 = 1;
                while( y2 >= 1 && y2 <= L ){
                    z = -cota;
                    z2 = 1;
                    while( z2 >= 1 && z2 <= L ){
                        if ( x2 >= iniX && x2 <= finX && y2 >= iniY && y2 <= finY && z2 >= iniZ && z2 <= finZ ){
                            if(maxX < x) maxX = x;
                            if(maxY < y) maxY = y;
                            if(maxZ < z) maxZ = z;
                            if(minX > x) minX = x;
                            if(minY > y) minY = y;
                            if(minZ > z) minZ = z;




                            if( array[i][0] <= (xms - 0.43*sigma) ){
                                if( !bSmall ){
                                    sitios.push( redondea(x), redondea(y), redondea(z) );
                                    sitios.push( redondea(array[i][0]/100.0) );
                                    sitios.push(0);
                                    sitiosColor.push(arrayColores[i][0]);
                                    cuenta1 = cuenta1 + 1;
                                }
                            }
                            else if ( array[i][0] <= (xms + 0.43*sigma) ) {
                                if( !bMedium ){
                                    sitios.push( redondea(x), redondea(y), redondea(z) );
                                    sitios.push( redondea(array[i][0]/100.0) );
                                    sitios.push(0);
                                    sitiosColor.push(arrayColores[i][0]);
                                    cuenta2 = cuenta2 + 1;
                                }

                            }
                            else {
                                if( !bBig ){
                                    sitios.push( redondea(x), redondea(y), redondea(z) );
                                    sitios.push( redondea(array[i][0]/100.0) );
                                    sitios.push(0);
                                    sitiosColor.push(arrayColores[i][0]);
                                    cuenta3 = cuenta3 + 1;
                                }
                            }

                            if( array[i][1] <= (xmb - 0.43*sigma) ){
                                if( !bSmall ){
                                    if( crgFlag ){  //CON RESTRICCIONES
                                        enlaces.push( redondea(x), redondea(y), redondea(z + interespacio/2.0));
                                        enlaces.push( redondea(array[i][1]/100.0) );
                                        enlaces.push(0);
                                        enlacesColor.push(arrayColores[i][1]);
                                    }
                                    else{   //SIN RESTRICCIONES
                                        enlaces.push( redondea(x), redondea(y + interespacio/2.0), redondea(z));
                                        enlaces.push( redondea(array[i][1]/100.0) );
                                        enlaces.push(1);
                                        enlacesColor.push(arrayColores[i][1]);
                                    }
                                }
                            }
                            else if ( array[i][1] <= (xmb + 0.43*sigma) ) {
                                if( !bMedium ){
                                    if( crgFlag ){  //CON RESTRICCIONES
                                        enlaces.push( redondea(x), redondea(y), redondea(z + interespacio/2.0));
                                        enlaces.push( redondea(array[i][1]/100.0) );
                                        enlaces.push(0);
                                        enlacesColor.push(arrayColores[i][1]);
                                    }
                                    else{   //SIN RESTRICCIONES
                                        enlaces.push( redondea(x), redondea(y + interespacio/2.0), redondea(z));
                                        enlaces.push( redondea(array[i][1]/100.0) );
                                        enlaces.push(1);
                                        enlacesColor.push(arrayColores[i][1]);
                                    }
                                }
                            }
                            else {
                                if( !bBig ){
                                    if( crgFlag ){  //CON RESTRICCIONES
                                        enlaces.push( redondea(x), redondea(y), redondea(z + interespacio/2.0));
                                        enlaces.push( redondea(array[i][1]/100.0) );
                                        enlaces.push(0);
                                        enlacesColor.push(arrayColores[i][1]);
                                    }
                                    else{   //SIN RESTRICCIONES
                                        enlaces.push( redondea(x), redondea(y + interespacio/2.0), redondea(z));
                                        enlaces.push( redondea(array[i][1]/100.0) );
                                        enlaces.push(1);
                                        enlacesColor.push(arrayColores[i][1]);
                                    }

                                }
                            }
                            //CON y SIN RESTRICCIONES
                            if( array[i][2] <= (xmb - 0.43*sigma) ){
                                if( !bSmall ){
                                    enlaces.push( redondea(x + interespacio/2.0), redondea(y), redondea(z));
                                    enlaces.push( redondea(array[i][2]/100.0) );
                                    enlaces.push(2)
                                    enlacesColor.push(arrayColores[i][2]);
                                }
                            }
                            else if ( array[i][2] <= (xmb + 0.43*sigma) ) {
                                if( !bMedium ){
                                    enlaces.push( redondea(x + interespacio/2.0), redondea(y), redondea(z));
                                    enlaces.push( redondea(array[i][2]/100.0) );
                                    enlaces.push(2)
                                    enlacesColor.push(arrayColores[i][2]);
                                }
                            }
                            else {
                                if( !bBig ){
                                    enlaces.push( redondea(x + interespacio/2.0), redondea(y), redondea(z));
                                    enlaces.push( redondea(array[i][2]/100.0) );
                                    enlaces.push(2)
                                    enlacesColor.push(arrayColores[i][2]);
                                }
                            }

                            if( array[i][3] <= (xmb - 0.43*sigma) ){
                                if( !bSmall ){
                                    if( crgFlag ){  //CON RESTRICCIONES
                                        enlaces.push( redondea(x), redondea(y + interespacio/2.0), redondea(z));
                                        enlaces.push( redondea(array[i][3]/100.0) );
                                        enlaces.push(1);
                                        enlacesColor.push(arrayColores[i][3]);
                                    }
                                    else{   //SIN RESTRICCIONES
                                        enlaces.push( redondea(x), redondea(y), redondea(z + interespacio/2.0));
                                        enlaces.push( redondea(array[i][3]/100.0) );
                                        enlaces.push(0);
                                        enlacesColor.push(arrayColores[i][3]);
                                    }
                                }
                            }
                            else if ( array[i][3] <= (xmb + 0.43*sigma) ) {
                                if( !bMedium ){
                                    if( crgFlag ){  //CON RESTRICCIONES
                                        enlaces.push( redondea(x), redondea(y + interespacio/2.0), redondea(z));
                                        enlaces.push( redondea(array[i][3]/100.0) );
                                        enlaces.push(1);
                                        enlacesColor.push(arrayColores[i][3]);
                                    }
                                    else{   //SIN RESTRICCIONES
                                        enlaces.push( redondea(x), redondea(y), redondea(z + interespacio/2.0));
                                        enlaces.push( redondea(array[i][3]/100.0) );
                                        enlaces.push(0);
                                        enlacesColor.push(arrayColores[i][3]);
                                    }
                                }
                            }
                            else {
                                if( !bBig ){
                                    if( crgFlag ){  //CON RESTRICCIONES
                                        enlaces.push( redondea(x), redondea(y + interespacio/2.0), redondea(z));
                                        enlaces.push( redondea(array[i][3]/100.0) );
                                        enlaces.push(1);
                                        enlacesColor.push(arrayColores[i][3]);
                                    }
                                    else{   //SIN RESTRICCIONES
                                        enlaces.push( redondea(x), redondea(y), redondea(z + interespacio/2.0));
                                        enlaces.push( redondea(array[i][3]/100.0) );
                                        enlaces.push(0);
                                        enlacesColor.push(arrayColores[i][3]);
                                    }

                                }
                            }

                        }
                        i = i + 1;
                        z = z + interespacio;
                        z2 = z2 + 1;
                    }
                    y = y + interespacio;
                    y2 = y2 + 1;
                }
                x = x + interespacio;
                x2 = x2 + 1;
            }

            atX = (maxX+minX)/2;
            atY = (maxY+minY)/2;
            atZ = (maxZ+minZ)/2;

            console.log(cuenta1);
            console.log(cuenta2);
            console.log(cuenta3);
            console.log( finX + 'X' + finY + 'X' + finZ + '=' + sitios.length/(9) );
            console.log(atX,atY,atZ);
            objson["sitios"] = sitios;
            objson["enlaces"] = enlaces;

            objson["atX"] = atX;
            objson["atY"] = atY;
            objson["atZ"] = atZ;
            objson["crgFlag"] = crgFlag;
            objson["tipo"] = tipo;

            var string = JSON.stringify( objson );

            console.log("=====" + nameCustom);
            fs.writeFile( path2.resolve(nameCustom), string, function(err) {
                if(err) {
                  console.log( err );
                } else {
                  console.log( "JSON saved to " + nameCustom );
                  objsonColor["sitiosColor"] = sitiosColor;
                  objsonColor["enlacesColor"] = enlacesColor;
                  console.log("HHHHHHHHHHHHHHHHHH");
                  console.log(sitiosColor[0],sitiosColor[1],sitiosColor[2],sitiosColor[3]);
                  var stringColor = JSON.stringify( objsonColor );
                }
                fs.writeFile( path2.resolve(nameCustomColor), stringColor, function(err) {
                    if(err) {
                      console.log( err );
                    } else {
                      console.log( "JSON saved to " + nameCustomColor );
                    }
                    var s = nameCustom.split('/');
                    console.log(s);
                    socket.emit( 'cargaJSONCustom', {url:s[7].substring(0, s[7].indexOf("_custom.json")),proc:nProc} );
                });

            });
        });
    });
};
