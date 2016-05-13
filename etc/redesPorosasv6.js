var gl;
var esfera;
var canvas;
var rm = 0.4;
var data = null;
var dataAux = null;
var zoom = 51;
var oldX, currentX, deltaX;
var oldY, currentY, deltaY;
var flag = false;
var eye = vec3(zoom,-zoom,zoom);
var at = vec3(0.0,0.0,0.0);
var up = vec3(0.0,0.0,1.0);
var gradosX = 0;
var gradosY = 0;
var iniX =1;
var iniY =1;
var iniZ =1;
var finX =1;
var finY;
var finZ;
var numeroSitios = 0;
var numeroEnlaces = 0;

var ambientArray = [];
var diffuseArray = [];


var FizzyText = function(L,xmb,xms) {
    this.Vista3D = 'Red Porosa';
    this.L = L;
    this.xms = xms;
    this.xmb = xmb;
    this.f = '0.3';
    this.Cm = '4.2';
    this.om = '0.31';
    this.send = function(){};
    this.iniX = 1;
    this.finX = 1;
    this.iniY = 1;
    this.finY = 100;
    this.iniZ = 1;
    this.finZ = 100;
    this.PxmbA = 1;
    this.MxmbA = 1;
    this.GxmbA = 1;
    this.PxmsA = 1;
    this.MxmsA= 1;
    this.GxmsA = 1;
};

var init = function(){
  //data = importJSON();
  finY = data.L;
  finZ = data.L;

  canvas = document.getElementById("id-canvas");

  text = new FizzyText(data.L, data.xmb, data.xms);
  gui = new dat.GUI();
  var controlador = [];

  var f1 = gui.addFolder('Datos');
  controlador[0] = f1.add(text, 'Vista3D');
  controlador[1] = f1.add(text, 'L');
  controlador[2] = f1.add(text, 'xms');
  controlador[3] = f1.add(text, 'xmb');
  controlador[4] = f1.add(text, 'f');
  controlador[5] = f1.add(text, 'Cm');
  controlador[6] = f1.add(text, 'om');

  f1.open();

  var f2 = gui.addFolder('Opacar');
  controlador[7] = f2.add(text, 'PxmbA').min(0).max(1).step(0.05).name("Enlace pequeño");
  controlador[8] = f2.add(text, 'MxmbA').min(0).max(1).step(0.05).name("Enlace medio");
  controlador[9] = f2.add(text, 'GxmbA').min(0).max(1).step(0.05).name("Enlace grande");
  controlador[10] = f2.add(text, 'PxmsA').min(0).max(1).step(0.05).name("Sitio pequeño");
  controlador[11] = f2.add(text, 'MxmsA').min(0).max(1).step(0.05).name("Sitio medio");
  controlador[12] = f2.add(text, 'GxmsA').min(0).max(1).step(0.05).name("Sitio grande");
  f2.close();

  var f3 = gui.addFolder('Seccionar');
  controlador[13] = f3.add(text, 'iniX', 1, 100).min(1).max(data["L"]).step(1).name("Inicio X");
  controlador[14] = f3.add(text, 'finX', 1, 100).min(1).max(data["L"]).step(1).name("Fin X");
  controlador[15] = f3.add(text, 'iniY', 1, 100).min(1).max(data["L"]).step(1).name("Inicio Y");
  controlador[16] = f3.add(text, 'finY', 1, 100).min(1).max(data["L"]).step(1).name("Fin Y");
  controlador[16].setValue( data["L"] );
  controlador[17] = f3.add(text, 'iniZ', 1, 100).min(1).max(data["L"]).step(1).name("Inicio Z");
  controlador[18] = f3.add(text, 'finZ', 1, 100).min(1).max(data["L"]).step(1).name("Fin Z");
  controlador[18].setValue( data["L"] );
  controlador[19] = f3.add(text, 'send').name("Cargar sección");
  f3.close();

  controlador[13].onChange(function(value) {
      iniX = value;
  });
  controlador[14].onChange(function(value) {
      finX = value;
  });
  controlador[15].onChange(function(value) {
      iniY = value;
  });
  controlador[16].onChange(function(value) {
      finY = value;
  });
  controlador[17].onChange(function(value) {
      iniZ = value;
  });
  controlador[18].onChange(function(value) {
      finZ = value;
  });

  controlador[19].onChange(function(value) {
      if( iniX <= finX && iniY <= finY && iniZ <= finZ){
          socket.emit( 'mensaje', {
              iniX: iniX,
              finX: finX,
              iniY: iniY,
              finY: finY,
              iniZ: iniZ,
              finZ: finZ} );
      }
      else{
          alert("La capa de inicio de cada eje debe ser menor o igual que la capa de fin de ese mismo eje.");
      }


  });

  gl = WebGLUtils.setupWebGL( canvas );
  if ( !gl ) { alert( "WebGL isn't available" ); }

  ext = gl.getExtension('ANGLE_instanced_arrays');

  var program = initShaders( gl, "vertex-shader", "fragment-shader" );
  gl.useProgram( program );

  uMVLoc = gl.getUniformLocation( program, "modelViewMatrix");
  uFlag = gl.getUniformLocation( program, "uFlag");
  vProjectionMatrix = gl.getUniformLocation( program, "projectionMatrix");
  uNormalMatrix = gl.getUniformLocation( program, "normalMatrix" );

  uSpecularProduct = gl.getUniformLocation( program, "specularProduct");
  uLightPosition = gl.getUniformLocation( program, "lightPosition");
  uShininess = gl.getUniformLocation( program, "shininess");

  samplerUniform = gl.getUniformLocation(program, "uSampler");

  gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
  gl.enable(gl.DEPTH_TEST);

  esfera = new Esfera(8,8,1);

  bufferId = gl.createBuffer( );
  gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
  gl.bufferData( gl.ARRAY_BUFFER, flatten( esfera.vertices ), gl.STATIC_DRAW );

  vPosition = gl.getAttribLocation( program, "vPosition" );
  gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vPosition );

  bufferN = gl.createBuffer( );
  gl.bindBuffer( gl.ARRAY_BUFFER, bufferN );
  gl.bufferData( gl.ARRAY_BUFFER, flatten( esfera.normales ), gl.STATIC_DRAW );

  vNormal = gl.getAttribLocation( program, "vNormal" );
  gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vNormal );

  attribBuffer = gl.createBuffer( );
  gl.bindBuffer( gl.ARRAY_BUFFER, attribBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, flatten( data.sitios ), gl.STATIC_DRAW );

  vOffset = gl.getAttribLocation( program, "vOffset" );
  gl.vertexAttribPointer( vOffset, 3, gl.FLOAT, false, 36, 0 );
  gl.enableVertexAttribArray( vOffset );
  ext.vertexAttribDivisorANGLE(vOffset, 1 );

  vRadioBuffer = gl.getAttribLocation( program, "vRadio" );
  gl.vertexAttribPointer( vRadioBuffer, 1, gl.FLOAT, false, 36, 12 );
  gl.enableVertexAttribArray( vRadioBuffer );
  ext.vertexAttribDivisorANGLE( vRadioBuffer, 1 );

  vRotationBuffer = gl.getAttribLocation( program, "vRotar" );
  gl.vertexAttribPointer( vRotationBuffer, 1, gl.FLOAT, false, 36, 16 );
  gl.enableVertexAttribArray( vRotationBuffer );
  ext.vertexAttribDivisorANGLE( vRotationBuffer, 1 );

  vAmbDifBuffer = gl.getAttribLocation( program, "vAmbDifProduct" );
  gl.vertexAttribPointer( vAmbDifBuffer, 4, gl.FLOAT, false, 36, 20 );
  gl.enableVertexAttribArray( vAmbDifBuffer );
  ext.vertexAttribDivisorANGLE( vAmbDifBuffer, 1);

  cilindro = new Cilindro(8,0.8,1.0);

  bufferId2 = gl.createBuffer( );
  gl.bindBuffer( gl.ARRAY_BUFFER, bufferId2 );
  gl.bufferData( gl.ARRAY_BUFFER, flatten( cilindro.vertices ), gl.STATIC_DRAW );

  vPosition2 = gl.getAttribLocation( program, "vPosition" );
  gl.vertexAttribPointer( vPosition2, 4, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vPosition2 );

  bufferN2 = gl.createBuffer( );
  gl.bindBuffer( gl.ARRAY_BUFFER, bufferN2 );
  gl.bufferData( gl.ARRAY_BUFFER, flatten( cilindro.normales ), gl.STATIC_DRAW );

  vNormal2 = gl.getAttribLocation( program, "vNormal" );
  gl.vertexAttribPointer( vNormal2, 4, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vNormal2 );

  attribBuffer2 = gl.createBuffer( );
  gl.bindBuffer( gl.ARRAY_BUFFER, attribBuffer2 );
  gl.bufferData( gl.ARRAY_BUFFER, flatten( data.enlaces ), gl.STATIC_DRAW );

  vOffset2 = gl.getAttribLocation( program, "vOffset" );
  gl.vertexAttribPointer( vOffset2, 3, gl.FLOAT, false, 36, 0 );
  gl.enableVertexAttribArray( vOffset2 );
  ext.vertexAttribDivisorANGLE(vOffset2, 1 );

  vRadioBuffer2 = gl.getAttribLocation( program, "vRadio" );
  gl.vertexAttribPointer( vRadioBuffer2, 1, gl.FLOAT, false, 36, 12 );
  gl.enableVertexAttribArray( vRadioBuffer2 );
  ext.vertexAttribDivisorANGLE( vRadioBuffer2, 1 );

  vRotationBuffer2 = gl.getAttribLocation( program, "vRotar" );
  gl.vertexAttribPointer( vRotationBuffer2, 1, gl.FLOAT, false, 36, 16 );
  gl.enableVertexAttribArray( vRotationBuffer2 );
  ext.vertexAttribDivisorANGLE( vRotationBuffer2, 1 );

  vAmbDifBuffer2 = gl.getAttribLocation( program, "vAmbDifProduct" );
  gl.vertexAttribPointer( vAmbDifBuffer2, 4, gl.FLOAT, false, 36, 20 );
  gl.enableVertexAttribArray( vAmbDifBuffer2 );
  ext.vertexAttribDivisorANGLE( vAmbDifBuffer2, 1);

  indexBuffer = gl.createBuffer( );
  gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indexBuffer );
  gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( esfera.indices ), gl.STATIC_DRAW );

  indexBuffer2 = gl.createBuffer( );
  gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indexBuffer2 );
  gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint16Array( cilindro.indices ), gl.STATIC_DRAW );

  luz = new Luz();

  canvas.addEventListener("wheel", function(event){
      if(navigator.userAgent.indexOf("Chrome") != -1 ){
          if (event.wheelDelta < 1){
              eye = vec3(eye[0]+eye[0]*0.05,eye[1]+eye[1]*0.05,eye[2]+eye[2]*0.05);
              cilindro.look = lookAt(eye,at,up);
              esfera.look = cilindro.look;
          }
          else{
              eye = vec3(eye[0]-eye[0]*0.05,eye[1]-eye[1]*0.05,eye[2]-eye[2]*0.05);
              cilindro.look = lookAt(eye,at,up);
              esfera.look = cilindro.look;
          }
      }
      else if(navigator.userAgent.indexOf("Firefox") != -1 ){
          if (event.deltaY > 1){
              eye = vec3(eye[0]+eye[0]*0.05,eye[1]+eye[1]*0.05,eye[2]+eye[2]*0.05);
              cilindro.look = lookAt(eye,at,up);
              esfera.look = cilindro.look;
          }
          else{
              eye = vec3(eye[0]-eye[0]*0.05,eye[1]-eye[1]*0.05,eye[2]-eye[2]*0.05);
              cilindro.look = lookAt(eye,at,up);
              esfera.look = cilindro.look;
          }
      }

  });

    canvas.addEventListener( "mousedown", function(event){
        flag = true;
		currentX = -1 + 2*event.clientX/canvas.width;
		currentY = -1 + 2*(canvas.height - event.clientY)/canvas.height;
	} );

    canvas.addEventListener( "mousemove", function(event){
		if (flag){
            oldX = currentX;
            oldY = currentY;
            currentX = -1 + 2*event.clientX/canvas.width;
    		currentY = -1 + 2*(canvas.height - event.clientY)/canvas.height;
            deltaX = currentX - oldX;
            deltaY = oldY - currentY;

            if (deltaX > 0 ){
                gradosX += 1;

            }
            else if (deltaX < 0) {
                gradosX -= 1;
            }
            if (deltaY > 0 ){
                gradosY -= 1;
            }
            else if (deltaY < 0) {
                gradosY += 1;
            }
            if ( gradosX == 360 || gradosX == -360 )    gradosX = 0;
            if ( gradosY == 360 || gradosY == -360 )    gradosY = 0;
            eye = multiplicaMatVec(rotate2( gradosX, up ), eye);
            up = multiplicaMatVec(rotate2( gradosX, up ), up);
            aux = cross( eye, up);
            eye = multiplicaMatVec(rotate2( gradosY, aux ), eye);
            up = multiplicaMatVec(rotate2( gradosY, aux ), up);
            cilindro.look = lookAt(eye,at,up);
            esfera.look = cilindro.look;

            gradosX = 0;
            gradosY = 0;
		}
	});

	canvas.addEventListener( "mouseup", function(event){
			flag = false;
	});

    canvas.addEventListener( "touchstart", function(event){
        flag2 = true;
		currentX = -1 + 2*event.touches[0].pageX/canvas.width;
		currentY = -1 + 2*(canvas.height - event.touches[0].pageY)/canvas.height;
	} );

    canvas.addEventListener( "touchmove", function(event){
		if (flag2){
            event.preventDefault();
            oldX = currentX;
            oldY = currentY;
            currentX = -1 + 2*event.touches[0].pageX/canvas.width;
    		currentY = -1 + 2*(canvas.height - event.touches[0].pageY)/canvas.height;
            deltaX = currentX - oldX;
            deltaY = oldY - currentY;

            if (deltaX > 0 ){
                gradosX += 5;

            }
            else if (deltaX < 0) {
                gradosX -= 5;
            }
            if (deltaY > 0 ){
                gradosY -= 5;
            }
            else if (deltaY < 0) {
                gradosY += 5;
            }
            if ( gradosX == 360 || gradosX == -360 )    gradosX = 0;
            if ( gradosY == 360 || gradosY == -360 )    gradosY = 0;
            eye = multiplicaMatVec(rotate2( gradosX, up ), eye);
            up = multiplicaMatVec(rotate2( gradosX, up ), up);
            aux = cross( eye, up);
            eye = multiplicaMatVec(rotate2( gradosY, aux ), eye);
            up = multiplicaMatVec(rotate2( gradosY, aux ), up);
            esfera.look = lookAt(eye,at,up);
            cilindro.look = lookAt(eye,at,up);

            gradosX = 0;
            gradosY = 0;
		}
	});

	canvas.addEventListener( "touchend", function(event){
			flag2 = false;
	});

  materialSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );
  materialShininess = 20;

  specularProduct = mult(vec4(luz.light_Specular),materialSpecular);
  gl.uniform4fv(uSpecularProduct,flatten(specularProduct));
  gl.uniform4fv(uLightPosition,flatten(vec4(luz.light_Position)));
  gl.uniform1f(uShininess,materialShininess);

  render();
};

function render(){
  gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
  resize();

  gl.uniformMatrix4fv(vProjectionMatrix, false, flatten(esfera.creaPerspective()) );
  gl.uniformMatrix4fv(uMVLoc, false, flatten(esfera.modelView()) );
  gl.uniformMatrix3fv(uNormalMatrix, false, flatten(normalMatrix(esfera.modelView(),true)) );
  gl.uniform1f(uFlag,0.0);

  gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
  gl.vertexAttribPointer( vPosition, 4, gl.FLOAT, false, 0, 0 );

  gl.bindBuffer( gl.ARRAY_BUFFER, bufferN );
  gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );

  gl.bindBuffer( gl.ARRAY_BUFFER, attribBuffer );
  gl.vertexAttribPointer( vOffset, 3, gl.FLOAT, false, 36, 0 );
  gl.vertexAttribPointer( vRadioBuffer, 1, gl.FLOAT, false, 36, 12 );
  gl.vertexAttribPointer( vRotationBuffer, 1, gl.FLOAT, false, 36, 16 );
  gl.vertexAttribPointer( vAmbDifBuffer, 4, gl.FLOAT, false, 36, 20 );

  gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indexBuffer );

  ext.drawElementsInstancedANGLE(gl.TRIANGLE_STRIP, esfera.indices.length, gl.UNSIGNED_SHORT, 0, data.sitios.length/9);

  gl.uniformMatrix4fv(vProjectionMatrix, false, flatten(cilindro.creaPerspective()) );
  gl.uniformMatrix4fv(uMVLoc, false, flatten(cilindro.modelView()) );
  gl.uniformMatrix3fv(uNormalMatrix, false, flatten(normalMatrix(cilindro.modelView(),true)) );
  gl.uniform1f(uFlag,1.0);

  gl.bindBuffer( gl.ARRAY_BUFFER, bufferId2 );
  gl.vertexAttribPointer( vPosition2, 4, gl.FLOAT, false, 0, 0 );

  gl.bindBuffer( gl.ARRAY_BUFFER, bufferN2 );
  gl.vertexAttribPointer( vNormal2, 4, gl.FLOAT, false, 0, 0 );

  gl.bindBuffer( gl.ARRAY_BUFFER, attribBuffer2 );
  gl.vertexAttribPointer( vOffset2, 3, gl.FLOAT, false, 36, 0 );
  gl.vertexAttribPointer( vRadioBuffer2, 1, gl.FLOAT, false, 36, 12 );
  gl.vertexAttribPointer( vRotationBuffer2, 1, gl.FLOAT, false, 36, 16 );
  gl.vertexAttribPointer( vAmbDifBuffer2, 4, gl.FLOAT, false, 36, 20 );

  gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indexBuffer2 );

  ext.drawElementsInstancedANGLE(gl.TRIANGLE_STRIP, cilindro.indices.length, gl.UNSIGNED_SHORT, 0, data.enlaces.length/9);
  requestAnimFrame(render);
}

function resize() {
	var canvas = gl.canvas;

	var displayWidth  = canvas.clientWidth;
	var displayHeight = canvas.clientHeight;

	if ( canvas.width  != displayWidth ||
		   canvas.height != displayHeight ) {

		   canvas.width  = displayWidth;
		   canvas.height = displayHeight;

		   gl.viewport( 0, 0, canvas.width, canvas.height );
	}
}


socket.on('cargaJSON', function(url){
  var jsonXhr = new XMLHttpRequest();
  jsonXhr.open('GET', (url + '.json').substring( 1 ), false);
  jsonXhr.onload = function() {
      data = JSON.parse(this.responseText);
  };
  jsonXhr.send(null);
  init();
});

socket.on('cargaJSONCustom', function(url){
    var jsonXhr = new XMLHttpRequest();
        jsonXhr.open('GET',  url , false);
        jsonXhr.onload = function() {
            dataAux = JSON.parse(this.responseText);
        };
        jsonXhr.send(null);
        //1.-CARGA
        gl.bindBuffer( gl.ARRAY_BUFFER, attribBuffer );
        gl.bufferData( gl.ARRAY_BUFFER, flatten( dataAux.sitios ), gl.STATIC_DRAW );

        gl.bindBuffer( gl.ARRAY_BUFFER, attribBuffer2 );
        gl.bufferData( gl.ARRAY_BUFFER, flatten( dataAux.enlaces ), gl.STATIC_DRAW );
        //2.-BORRA
        data = dataAux;
        at = vec3( data.atX, data.atY, data.atZ );
        esfera.look = lookAt(eye,at,up);
        cilindro.look = lookAt(eye,at,up);
});

function left( grados, eye, up ){
    eye = multiplicaMatVec(rotate2( grados, up ), eye);
    up = multiplicaMatVec(rotate2( grados, up ), up);
    esfera.look = lookAt(eye,at,up);
}

function upon( grados, eye, up ){
    aux = cross( eye, up);
    eye = multiplicaMatVec(rotate2( grados, aux ), eye);
    up = multiplicaMatVec(rotate2( grados, aux ), up);
    esfera.look = lookAt(eye,at,up);
}

function rotate2( angle, axis )
{
    if ( !Array.isArray(axis) ) {
        axis = [ arguments[1], arguments[2], arguments[3] ];
    }

    var v = normalize( axis );

    var x = -v[0];
    var y = -v[1];
    var z = -v[2];

    var c = Math.cos( radians(angle) );
    var omc = 1.0 - c;
    var s = Math.sin( radians(angle) );

    var result = mat3(
        vec3( x*x*omc + c,   x*y*omc - z*s, x*z*omc + y*s),
        vec3( x*y*omc + z*s, y*y*omc + c,   y*z*omc - x*s),
        vec3( x*z*omc - y*s, y*z*omc + x*s, z*z*omc + c)
    );

    return result;
}

function multiplicaMatVec(mat, vec){
    var result = [];
    for (i = 0; i <= 2; i++){
        acu = 0;
        for (j = 0; j <= 2; j++){
            acu = acu +  mat[i][j] * vec[j];
        }
        result.push(acu);
    }
    return vec3(result);
}
