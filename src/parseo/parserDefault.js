var fs = require('fs');

//parsear nombre

function fileExists( path )
{
    try
    {
        return fs.statSync( path ).isFile();
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

var parsea = function( iniX, finX, iniY, finY, iniZ, finZ, io ){
    var crgFlag = true;
    var objson = {};
    var objsonColor = {};
    var nameDefault = (process.argv[2] + '_default' + '.json');
    if( fileExists( nameDefault ) ) {
        fs.unlink( nameDefault );
    }
    var nameFile = (process.argv[2] + '.bin');
    fs.readFile( nameFile, function (err, data ) {
        var nameFileColor = (process.argv[3] + '.bin');
        var nameDefaultColor = (process.argv[3] + '_default' + '.json');
        fs.readFile( nameFileColor, function (err, dataColor ) {
            var s = nameFile.split( '_' );
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

            var arrayRadios = [];
            var arrayColores = [];
    	    finY = L;
    	    finZ = L;

            for ( var i = 0; i < L*L*L*4*4 ; i = i + 16 ) {
                arrayRadios.push([redondea( data.readFloatLE( i ) ),
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

            rmax = 0;
            for (x in arrayRadios) {
                if (rmax < arrayRadios[x][0]){
                    rmax = arrayRadios[x][0];
                }
            }

            interespacio = (rmax / 100.0)*2*1.2;
            cota = (( L-1 ) / 2.0) * interespacio;

            sitios = [];
            sitiosColor = [];
            enlaces = [];
            enlacesColor = [];

            //DEPTH_TEST
            cuenta = 1;


            i = 0;
            maxX =
            maxY = -cota - 1;
            maxZ = -cota - 1;
            minX = cota + 1;
            minY = cota + 1;
            minZ = cota + 1;
            x = -cota;
            x2 = 1;

            var cuenta1 = 0;
            var cuenta2 = 0;
            var cuenta3 = 0;

            while( x2 >= 1 && x2 <= L ) {
                y = -cota;
                y2 = 1;
                if( x2 === iniX )   minX = x;
                if( x2 === finX )   maxX = x;
                while( y2 >= 1 && y2 <= L ){
                    z = -cota;
                    z2 = 1;
                    if( y2 === iniY )   minY = y;
                    if( y2 === finY )   maxY = y;

                    while( z2 >= 1 && z2 <= L ){
                        cuenta = cuenta + 1;
                        if ( x2 >= iniX && x2 <= finX && y2 >= iniY && y2 <= finY && z2 >= iniZ && z2 <= finZ ){
                            if( z2 === iniZ )   minZ = z;
                            if( z2 === finZ )   maxZ = z;

                            sitiosColor.push(arrayColores[i][0]);
                            enlacesColor.push(arrayColores[i][1]);
                            enlacesColor.push(arrayColores[i][2]);
                            enlacesColor.push(arrayColores[i][3]);

                            sitios.push( redondea(x), redondea(y), redondea(z) );
                            sitios.push( redondea(arrayRadios[i][0]/100.0) );
                            sitios.push(0);


                            if( crgFlag ){  //CON RESTRICCIONES
                                enlaces.push( redondea(x), redondea(y), redondea(z + interespacio/2.0));
                                enlaces.push( redondea(arrayRadios[i][1]/100.0) );
                                enlaces.push(0);
                            }
                            else{   //SIN RESTRICCIONES
                                enlaces.push( redondea(x), redondea(y + interespacio/2.0), redondea(z));
                                enlaces.push( redondea(arrayRadios[i][1]/100.0) );
                                enlaces.push(1);
                            }
                            //SIN RESTRICCIONES y CON RESTRICCIONES
                            enlaces.push( redondea(x + interespacio/2.0), redondea(y), redondea(z));
                            enlaces.push( redondea(arrayRadios[i][2]/100.0) );
                            enlaces.push(2);

                            if( crgFlag ){  //CON RESTRICCIONES
                                enlaces.push( redondea(x), redondea(y + interespacio/2.0), redondea(z));
                                enlaces.push( redondea(arrayRadios[i][3]/100.0) );
                                enlaces.push(1);
                            }
                            else{   //SIN RESTRICCIONES
                                enlaces.push( redondea(x), redondea(y), redondea(z + interespacio/2.0));
                                enlaces.push( redondea(arrayRadios[i][3]/100.0) );
                                enlaces.push(0);
                            }
                            i = i + 1;
                        }
                        z = z + interespacio;
                        z2 = z2 + 1;
                    }
                    y = y + interespacio;
                    y2 = y2 + 1;
                }
                x = x + interespacio;
                x2 = x2 + 1;
            }

            atX = (maxX + minX)/2.0;
            atY = (maxY + minY)/2.0;
            atZ = (maxZ + minZ)/2.0;

            objson["sitios"] = sitios;
            objson["enlaces"] = enlaces;
            objsonColor["sitiosColor"] = sitiosColor;
            objsonColor["enlacesColor"] = enlacesColor;
            objson["atX"] = atX;
            objson["atY"] = atY;
            objson["atZ"] = atZ;
            objson["crgFlag"] = crgFlag;

            var string = JSON.stringify( objson );
            var stringColor = JSON.stringify( objsonColor );



            fs.writeFile( nameDefault, string, function(err) {
                if(err) {
                  console.log( err );
                } else {
                  console.log( "JSON saved to " + nameDefault );
                }
                fs.writeFile( nameDefaultColor, stringColor, function(err) {
                    if(err) {
                      console.log( err );
                    } else {
                      console.log( "JSON saved to " + nameDefaultColor );
                    }
                });
            });
        });
    });
};

parsea(1,1,1,20,1,20);
