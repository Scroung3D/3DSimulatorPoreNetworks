var fs = require('fs');

//parsear nombre
var L = 20;
var xms = 32;
var xmb = 26;
var sigma = 6;

var array = [];

function getMaxOfArray(numArray) {
  return Math.max.apply(null, numArray);
}

function redondea(num) {
  return Math.round( num * 100 )/100;
}

var parsea = function( path, iniX, finX, iniY, finY, iniZ, finZ ){
    fs.readFile( path, function (err, data ) {
        var s = nameFile.split( '_' );
        var L = s[0].substring( 1 );
        var xms = s[1].substring( 3 );
        var xmb = s[2].substring( 3 );
        var sigma = s[3].substring( 1 );

        var array = [];

        for ( var i = 0; i < L*L*L*4*4 ; i = i + 16 ) {
            array.push([redondea( data.readFloatLE( i ) ),
                        redondea( data.readFloatLE( i + 4 ) ),
                        redondea( data.readFloatLE( i + 8 ) ),
                        redondea( data.readFloatLE( i + 12 ))]);
        }

        rmax = 0;
        for (x in array) {
            if (rmax < array[x][0]){
                rmax = array[x][0];
            }
        }

        interespacio = (rmax / 100.0)*2*1.2;
        cota = (( L-1 ) / 2.0) * interespacio;

        sitios = [];
        enlaces = [];
        objson = null;


        i = 0;
        x = -cota;

        while( x < cota || x === cota ) {
            y = -cota;
            while( y < cota || y === cota  ){
                z = -cota;
                while( z < cota || z === cota ){

                    sitios.push( redondea(x), redondea(y), redondea(z));
                    sitios.push( redondea(array[i][0]/100.0) );
                    sitios.push(0);
                    if( array[i][0] <= (xms - 0.43*sigma) ){
                        sitios.push(0,1,1,1);
                    }
                    else if ( array[i][0] <= (xms + 0.43*sigma) ) {
                        sitios.push(0,0,1,1);
                    }
                    else {
                        sitios.push(1,0,0,1);
                    }

                    enlaces.push( redondea(x), redondea(y + interespacio/2.0), redondea(z));
                    enlaces.push( redondea(array[i][1]/100.0) );
                    enlaces.push(1)
                    if( array[i][1] <= (xmb - 0.43*sigma) ){
                        enlaces.push(0,1,1,1);
                    }
                    else if ( array[i][1] <= (xmb + 0.43*sigma) ) {
                        enlaces.push(0,0,1,1);
                    }
                    else {
                        enlaces.push(1,0,0,1);
                    }

                    enlaces.push( redondea(x + interespacio/2.0), redondea(y), redondea(z));
                    enlaces.push( redondea(array[i][2]/100.0) );
                    enlaces.push(2)
                    if( array[i][2] <= (xmb - 0.43*sigma) ){
                        enlaces.push(0,1,1,1);
                    }
                    else if ( array[i][2] <= (xmb + 0.43*sigma) ) {
                        enlaces.push(0,0,1,1);
                    }
                    else {
                        enlaces.push(1,0,0,1);
                    }

                    enlaces.push( redondea(x), redondea(y), redondea(z + interespacio/2.0));
                    enlaces.push( redondea(array[i][3]/100.0) );
                    enlaces.push(0)
                    if( array[i][3] <= (xmb - 0.43*sigma) ){
                        enlaces.push(0,1,1,1);
                    }
                    else if ( array[i][3] <= (xmb + 0.43*sigma) ) {
                        enlaces.push(0,0,1,1);
                    }
                    else {
                        enlaces.push(1,0,0,1);
                    }

                    i = i + 1;
                    z = z + interespacio;
                }
                y = y + interespacio;
            }
            x = x + interespacio;
        }

        objson = { L:L, xmb: xmb, xms: xms, sitios: sitios, enlaces: enlaces };

        console.log(objson.sitios);
    });
};

module.exports = parsea;
