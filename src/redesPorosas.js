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
var banderaSeccionar = true;
var banderaOcultar = true;
var banderaProceso = true;
var banderaSmall = false;
var banderaMedium = false;
var banderaBig = false;
//Tipo 1:seccionar 2:ocultar 3:cambiar proceso
var tipo = 0;
var ambientArray = [];
var diffuseArray = [];
var consCam;
var procActual = 0;
var nProc = 0;

var MenuText = function(L,xmb,xms,om,sigma,cs,nc,f,bat) {
    this.Vista3D = '';
    this.L = String(L);
    this.xmb = String(xmb);
    this.xms = String(xms);
    this.om = String(om);
    this.sigma = String(sigma);
    this.cs = String(cs);
    this.nc = String(nc);
    this.f = String(f);
    this.c = 'void';
    this.bat = String(bat);
    this.nt = 'void';
    this.send = function(){};
    this.send2 = function(){};
    this.send3 = function(){};
    this.anim = function(){};
    this.iniX = 1;
    this.finX = 1;
    this.iniY = 1;
    this.finY = 100;
    this.iniZ = 1;
    this.finZ = 100;
    this.Small = false;
    this.Medium = false;
    this.Big = false;
    this.proc = 0;
};

var init = function(){
  //data = importJSON();
  finY = data.L;
  finZ = data.L;

  canvas = document.getElementById("id-canvas");

  text = new MenuText(data.L, data.xmb, data.xms, data.om, data.sigma, data.cs, data.nc, data.f, data.bat);
  gui = new dat.GUI();
  controlador = [];

  var f1 = gui.addFolder('Datos');
  controlador[0] = f1.add(text, 'Vista3D');
  if (data.crgFlag === true) controlador[0].setValue( "Red Porosa cRG" );
  else  controlador[0].setValue( "Red Porosa sRG" );
  controlador[1] = f1.add(text, 'L').name("Tamaño L");
  controlador[2] = f1.add(text, 'xms').name("Media Sitios");
  controlador[3] = f1.add(text, 'xmb').name("Media Enlaces");
  controlador[4] = f1.add(text, 'om');
  controlador[5] = f1.add(text, 'sigma').name("Sigma");
  controlador[6] = f1.add(text, 'cs');
  controlador[7] = f1.add(text, 'nc');
  controlador[8] = f1.add(text, 'f');
  if (data.nt != undefined){
      controlador[9] = f1.add(text, 'nt').name("N Hilos");
      controlador[9].setValue( data["nt"] );
  }
  else{
      controlador[9] = f1.add(text, 'c');
      controlador[9].setValue( data["c"] );
  }
  controlador[10] = f1.add(text, 'bat').name("N Batidos");
  controlador[22] = f1.add(text, 'proc').min(0).max(nProc-1).step(1).name("Proceso");
  controlador[23] = f1.add(text, 'send3').name("Carga Proceso");
  controlador[24] = f1.add(text, 'anim').name("Animar Procesos");

  f1.open();

  var f2 = gui.addFolder('Seccionar');
  controlador[11] = f2.add(text, 'iniX', 1, 100).min(1).max(data["L"]).step(1).name("Inicio X");
  controlador[12] = f2.add(text, 'finX', 1, 100).min(1).max(data["L"]).step(1).name("Fin X");
  controlador[13] = f2.add(text, 'iniY', 1, 100).min(1).max(data["L"]).step(1).name("Inicio Y");
  controlador[14] = f2.add(text, 'finY', 1, 100).min(1).max(data["L"]).step(1).name("Fin Y");
  controlador[14].setValue( data["L"] );
  controlador[15] = f2.add(text, 'iniZ', 1, 100).min(1).max(data["L"]).step(1).name("Inicio Z");
  controlador[16] = f2.add(text, 'finZ', 1, 100).min(1).max(data["L"]).step(1).name("Fin Z");
  controlador[16].setValue( data["L"] );
  controlador[17] = f2.add(text, 'send').name("Cargar Sección");
  f2.close();

  var f3 = gui.addFolder('Ocultar');
  controlador[18] = f3.add(text, 'Small');
  controlador[19] = f3.add(text, 'Medium');
  controlador[20] = f3.add(text, 'Big');
  controlador[21] = f3.add(text, 'send2').name("Ocultar Selección");
  f3.close();

  controlador[11].onChange(function(value) {
      iniX = value;
  });
  controlador[12].onChange(function(value) {
      finX = value;
  });
  controlador[13].onChange(function(value) {
      iniY = value;
  });
  controlador[14].onChange(function(value) {
      finY = value;
  });
  controlador[15].onChange(function(value) {
      iniZ = value;
  });
  controlador[16].onChange(function(value) {
      finZ = value;
  });

  controlador[17].onChange(function(value) {
      if (banderaSeccionar){
          if (banderaOcultar){
              if( iniX <= finX && iniY <= finY && iniZ <= finZ){
                  if( banderaSmall != true ||  banderaMedium != true ||  banderaBig != true  ){
                      banderaSeccionar = false;
                      socket.emit( 'mensaje', {
                          iniX: iniX,
                          finX: finX,
                          iniY: iniY,
                          finY: finY,
                          iniZ: iniZ,
                          finZ: finZ,
                          bSmall: banderaSmall,
                          bMedium: banderaMedium,
                          bBig: banderaBig,
                          tipo: 1,
                          proc: procActual} );
                          controlador[17].name("Cargando Red...");
                  }
                  else{
                      alert("No tiene sentido ocultar todos los poros.");
                  }

              }
              else{
                  alert("La capa de inicio de cada eje debe ser menor o igual que la capa de fin de ese mismo eje.");
              }
          }
          else alert("Hay un proceso de ocultamiento pendiente... Espere");
      }
  });

  controlador[18].onChange(function(value) {
      banderaSmall = value;
  });

  controlador[19].onChange(function(value) {
      banderaMedium = value;
  });

  controlador[20].onChange(function(value) {
      banderaBig = value;
  });

  controlador[21].onChange(function(value) {
      if (banderaOcultar){
          if (banderaSeccionar){
              if( iniX <= finX && iniY <= finY && iniZ <= finZ){
                  if( banderaSmall != true ||  banderaMedium != true ||  banderaBig != true  ){
                      banderaOcultar = false;
                      socket.emit( 'mensaje', {
                          iniX: iniX,
                          finX: finX,
                          iniY: iniY,
                          finY: finY,
                          iniZ: iniZ,
                          finZ: finZ,
                          bSmall: banderaSmall,
                          bMedium: banderaMedium,
                          bBig: banderaBig,
                          tipo: 2,
                          proc: procActual} );
                          console.log(banderaSmall, banderaMedium, banderaBig);
                          controlador[21].name("Ocultando Red...");
                  }
                  else alert("No tiene sentido ocultar todos los poros.");
              }
              else alert("La capa de inicio de cada eje debe ser menor o igual que la capa de fin de ese mismo eje.");

          }
          else alert("Hay un proceso de seccionado pendiente... Espere");
      }
  });

  controlador[22].onChange(function(value) {
      procActual = value;
  });

  controlador[23].onChange(function(value) {
      if (banderaProceso){
          if (banderaOcultar){
              if (banderaSeccionar){
                  if( iniX <= finX && iniY <= finY && iniZ <= finZ){
                      if( banderaSmall != true ||  banderaMedium != true ||  banderaBig != true  ){
                          banderaProceso = false;
                          socket.emit( 'mensaje', {
                              iniX: iniX,
                              finX: finX,
                              iniY: iniY,
                              finY: finY,
                              iniZ: iniZ,
                              finZ: finZ,
                              bSmall: banderaSmall,
                              bMedium: banderaMedium,
                              bBig: banderaBig,
                              tipo: 3,
                              proc: procActual} );
                              controlador[23].name("Cargando Proceso...");
                      }
                      else alert("No tiene sentido ocultar todos los poros.");
                  }
                  else alert("La capa de inicio de cada eje debe ser menor o igual que la capa de fin de ese mismo eje.");

              }
              else alert("Hay un proceso de seccionado pendiente... Espere");
          }
          else alert("Hay un proceso de ocultamiento pendiente... Espere");
      }
  });

  var anima = function(i){
      if (i < nProc){
          setTimeout(function(){
              banderaProceso = false;
              socket.emit( 'mensaje', {
                  iniX: iniX,
                  finX: finX,
                  iniY: iniY,
                  finY: finY,
                  iniZ: iniZ,
                  finZ: finZ,
                  bSmall: banderaSmall,
                  bMedium: banderaMedium,
                  bBig: banderaBig,
                  tipo: 4,
                  proc: i} );
                  controlador[22].setValue( i );
                  anima(i+1);
          }, 1000);
          controlador[24].name("Animando...");

      }
  };

  controlador[24].onChange(function(value) {
      if (banderaProceso){
          if (banderaOcultar){
              if (banderaSeccionar){
                  if( iniX <= finX && iniY <= finY && iniZ <= finZ){
                      if( banderaSmall != true ||  banderaMedium != true ||  banderaBig != true  ){
                          anima(0);
                      }
                      else alert("No tiene sentido ocultar todos los poros.");
                  }
                  else alert("La capa de inicio de cada eje debe ser menor o igual que la capa de fin de ese mismo eje.");

              }
              else alert("Hay un proceso de seccionado pendiente... Espere");
          }
          else alert("Hay un proceso de ocultamiento pendiente... Espere");
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

  gl.clearColor( 0.99, 0.99, 0.99, 1.0 );
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
  gl.vertexAttribPointer( vOffset, 3, gl.FLOAT, false, 20, 0 );
  gl.enableVertexAttribArray( vOffset );
  ext.vertexAttribDivisorANGLE(vOffset, 1 );

  vRadioBuffer = gl.getAttribLocation( program, "vRadio" );
  gl.vertexAttribPointer( vRadioBuffer, 1, gl.FLOAT, false, 20, 12 );
  gl.enableVertexAttribArray( vRadioBuffer );
  ext.vertexAttribDivisorANGLE( vRadioBuffer, 1 );

  vRotationBuffer = gl.getAttribLocation( program, "vRotar" );
  gl.vertexAttribPointer( vRotationBuffer, 1, gl.FLOAT, false, 20, 16 );
  gl.enableVertexAttribArray( vRotationBuffer );
  ext.vertexAttribDivisorANGLE( vRotationBuffer, 1 );

  colorBuffer = gl.createBuffer( );
  gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer );
  gl.bufferData( gl.ARRAY_BUFFER, flatten( data.sitiosColor ), gl.STATIC_DRAW );


  //CAMBIAR
  vAmbDifBuffer = gl.getAttribLocation( program, "vAmbDifProduct" );
  gl.vertexAttribPointer( vAmbDifBuffer, 1, gl.FLOAT, false, 0, 0 );
  gl.enableVertexAttribArray( vAmbDifBuffer );
  ext.vertexAttribDivisorANGLE( vAmbDifBuffer, 1);

  cilindro = new Cilindro(8,0.6,1.0);

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
  gl.vertexAttribPointer( vOffset2, 3, gl.FLOAT, false, 20, 0 );
  gl.enableVertexAttribArray( vOffset2 );
  ext.vertexAttribDivisorANGLE(vOffset2, 1 );

  vRadioBuffer2 = gl.getAttribLocation( program, "vRadio" );
  gl.vertexAttribPointer( vRadioBuffer2, 1, gl.FLOAT, false, 20, 12 );
  gl.enableVertexAttribArray( vRadioBuffer2 );
  ext.vertexAttribDivisorANGLE( vRadioBuffer2, 1 );

  vRotationBuffer2 = gl.getAttribLocation( program, "vRotar" );
  gl.vertexAttribPointer( vRotationBuffer2, 1, gl.FLOAT, false, 20, 16 );
  gl.enableVertexAttribArray( vRotationBuffer2 );
  ext.vertexAttribDivisorANGLE( vRotationBuffer2, 1 );

  colorBuffer2 = gl.createBuffer( );
  gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer2 );
  gl.bufferData( gl.ARRAY_BUFFER, flatten( data.enlacesColor ), gl.STATIC_DRAW );


  //CAMBIAR
  vAmbDifBuffer2 = gl.getAttribLocation( program, "vAmbDifProduct" );
  gl.vertexAttribPointer( vAmbDifBuffer2, 1, gl.FLOAT, false, 0, 0 );
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
              eye = vec3(eye[0]+(eye[0]-at[0])*0.01,eye[1]+(eye[1]-at[1])*0.01,eye[2]+(eye[2]-at[2])*0.01);
              cilindro.look = lookAt(eye,at,up);
              esfera.look = lookAt(eye,at,up);
          }
          else{
              eye = vec3(eye[0]-(eye[0]-at[0])*0.01,eye[1]-(eye[1]-at[1])*0.01,eye[2]-(eye[2]-at[2])*0.01);
              cilindro.look = lookAt(eye,at,up);
              esfera.look = lookAt(eye,at,up);
          }
      }
      else if(navigator.userAgent.indexOf("Firefox") != -1 ){
          if (event.deltaY > 1){
              eye = vec3(eye[0]+eye[0]*0.05,eye[1]+eye[1]*0.05,eye[2]+eye[2]*0.05);
              cilindro.look = lookAt(eye,at,up);
              esfera.look = lookAt(eye,at,up);
          }
          else{
              eye = vec3(eye[0]-eye[0]*0.05,eye[1]-eye[1]*0.05,eye[2]-eye[2]*0.05);
              cilindro.look = lookAt(eye,at,up);
              esfera.look = lookAt(eye,at,up);
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
            help = vec3(eye[0]-at[0],eye[1]-at[1],eye[2]-at[2]);
            help2 = multiplicaMatVec(rotate2( gradosX, up ), help);
            eye = vec3(help2[0]+at[0],help2[1]+at[1],help2[2]+at[2]);
            up = multiplicaMatVec(rotate2( gradosX, up ), up);
            aux = cross( eye, up);
            help3 = vec3(eye[0]-at[0],eye[1]-at[1],eye[2]-at[2]);
            help4 = multiplicaMatVec(rotate2( gradosY, aux ), help3);
            eye = vec3(help4[0]+at[0],help4[1]+at[1],help4[2]+at[2]);
            up = multiplicaMatVec(rotate2( gradosY, aux ), up);
            console.log( eye );
            console.log("distancia:" + Math.sqrt(Math.pow(eye[0]-at[0],2)+Math.pow(eye[1]-at[1],2)+Math.pow(eye[2]-at[2],2)));
            cilindro.look = lookAt(eye,at,up);
            esfera.look = lookAt(eye,at,up);

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
            help = vec3(eye[0],eye[1],eye[2]);
            eye = multiplicaMatVec(rotate2( gradosX, up ), vec3(help[0]-at[0],help[1]-at[1],help[2]-at[2]));
            up = multiplicaMatVec(rotate2( gradosX, up ), up);
            aux = cross( eye, up);
            eye = multiplicaMatVec(rotate2( gradosY, aux ), vec3(help[0]-at[0],help[1]-at[1],help[2]-at[2]));
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

  esfera.look = lookAt(eye,at,up);
  cilindro.look = lookAt(eye,at,up);

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
  gl.vertexAttribPointer( vOffset, 3, gl.FLOAT, false, 20, 0 );
  gl.vertexAttribPointer( vRadioBuffer, 1, gl.FLOAT, false, 20, 12 );
  gl.vertexAttribPointer( vRotationBuffer, 1, gl.FLOAT, false, 20, 16 )

  gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer );
  gl.vertexAttribPointer( vAmbDifBuffer, 1, gl.FLOAT, false, 0, 0 );

  gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indexBuffer );

  ext.drawElementsInstancedANGLE(gl.TRIANGLE_STRIP, esfera.indices.length, gl.UNSIGNED_SHORT, 0, data.sitios.length/5);

  gl.uniformMatrix4fv(vProjectionMatrix, false, flatten(cilindro.creaPerspective()) );
  gl.uniformMatrix4fv(uMVLoc, false, flatten(cilindro.modelView()) );
  gl.uniformMatrix3fv(uNormalMatrix, false, flatten(normalMatrix(cilindro.modelView(),true)) );
  gl.uniform1f(uFlag,1.0);

  gl.bindBuffer( gl.ARRAY_BUFFER, bufferId2 );
  gl.vertexAttribPointer( vPosition2, 4, gl.FLOAT, false, 0, 0 );

  gl.bindBuffer( gl.ARRAY_BUFFER, bufferN2 );
  gl.vertexAttribPointer( vNormal2, 4, gl.FLOAT, false, 0, 0 );

  gl.bindBuffer( gl.ARRAY_BUFFER, attribBuffer2 );
  gl.vertexAttribPointer( vOffset2, 3, gl.FLOAT, false, 20, 0 );
  gl.vertexAttribPointer( vRadioBuffer2, 1, gl.FLOAT, false, 20, 12 );
  gl.vertexAttribPointer( vRotationBuffer2, 1, gl.FLOAT, false, 20, 16 );

  gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer2 );
  gl.vertexAttribPointer( vAmbDifBuffer2, 1, gl.FLOAT, false, 0, 0 );

  gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, indexBuffer2 );

  ext.drawElementsInstancedANGLE(gl.TRIANGLE_STRIP, cilindro.indices.length, gl.UNSIGNED_SHORT, 0, data.enlaces.length/5);
  requestAnimFrame(render);
}

function resize() {
	var canvas = gl.canvas;

	var displayWidth  = canvas.clientWidth;
    var displayHeight  = canvas.clientHeight;
	if ( canvas.width  != displayWidth ||
		   canvas.height != displayHeight ) {

		   canvas.width  = displayWidth;
		   canvas.height = displayHeight;

		   gl.viewport( 0, 0, canvas.width, canvas.height );
	}
}


socket.on('cargaJSONDefault', function(url){
  var jsonXhr = new XMLHttpRequest();

  jsonXhr.open('GET', ('../' + url.nameFile + '_default.json'), false);
  jsonXhr.onload = function() {
      data = JSON.parse(this.responseText);
      at = vec3(data.atX,data.atY,data.atZ);
      nProc = url.proc;
      console.log(nProc);
      var jsonXhr2 = new XMLHttpRequest();
      jsonXhr2.open('GET', ('../' + url.nameFile + '_CC0_default.json'), false);
      jsonXhr2.onload = function() {
          dataAux = JSON.parse(this.responseText);
          data["sitiosColor"]=dataAux.sitiosColor;
          data["enlacesColor"]=dataAux.enlacesColor;
          init();
          esfera.look = lookAt(eye,at,up);
          cilindro.look = lookAt(eye,at,up);
      };
      jsonXhr2.send(null);

  };
  jsonXhr.send(null);


});

socket.on('cargaJSONCustom', function(res){
    var jsonXhr = new XMLHttpRequest();
        jsonXhr.open('GET',  ('../' + res.url + '_custom.json') , false);
        jsonXhr.onload = function() {
            dataAux = null;
            dataAux = JSON.parse(this.responseText);
            console.log(dataAux);
            var jsonXhr2 = new XMLHttpRequest();
                jsonXhr2.open('GET',  ('../' + res.url + '_CC' + res.proc + '_custom.json') , false);
                jsonXhr2.onload = function() {
                    dataAux2 = null;
                    dataAux2 = JSON.parse(this.responseText);
                    console.log(dataAux2);

                    //1.-CARGA
                    //=========================================================================================================================

                    attribBuffer = null;
                    attribBuffer = gl.createBuffer( );
                    gl.bindBuffer( gl.ARRAY_BUFFER, attribBuffer );
                    gl.bufferData( gl.ARRAY_BUFFER, flatten( dataAux.sitios ), gl.STATIC_DRAW );


                    gl.vertexAttribPointer( vOffset, 3, gl.FLOAT, false, 20, 0 );

                    gl.vertexAttribPointer( vRadioBuffer, 1, gl.FLOAT, false, 20, 12 );

                    gl.vertexAttribPointer( vRotationBuffer, 1, gl.FLOAT, false, 20, 16 );

                    colorBuffer = null;
                    colorBuffer = gl.createBuffer( );
                    gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer );
                    gl.bufferData( gl.ARRAY_BUFFER, flatten( dataAux2.sitiosColor ), gl.STATIC_DRAW );
                    gl.vertexAttribPointer( vAmbDifBuffer, 1, gl.FLOAT, false, 0, 0 );

                    attribBuffer2 = null;
                    attribBuffer2 = gl.createBuffer( );
                    gl.bindBuffer( gl.ARRAY_BUFFER, attribBuffer2 );
                    gl.bufferData( gl.ARRAY_BUFFER, flatten( dataAux.enlaces ), gl.STATIC_DRAW );

                    gl.vertexAttribPointer( vOffset2, 3, gl.FLOAT, false, 20, 0 );

                    gl.vertexAttribPointer( vRadioBuffer2, 1, gl.FLOAT, false, 20, 12 );

                    gl.vertexAttribPointer( vRotationBuffer2, 1, gl.FLOAT, false, 20, 16 );

                    gcolorBuffer2 = null;
                    colorBuffer2 = gl.createBuffer( );
                    gl.bindBuffer( gl.ARRAY_BUFFER, colorBuffer2 );
                    gl.bufferData( gl.ARRAY_BUFFER, flatten( dataAux2.enlacesColor ), gl.STATIC_DRAW );
                    gl.vertexAttribPointer( vAmbDifBuffer2, 1, gl.FLOAT, false, 0, 0 );
                    //====================================================================================================================================
                    //2.-BORRA
                    oldAt = at;
                    at = vec3( dataAux.atX, dataAux.atY, dataAux.atZ );
                    newAt = at;
                    data = dataAux;
                    esfera.look = lookAt(eye,at,up);
                    cilindro.look = lookAt(eye,at,up);
                    if (data.tipo === 1){
                        banderaSeccionar = true;
                        controlador[17].name("Cargar Sección");
                    }
                    if (data.tipo === 2){
                        banderaOcultar = true;
                        controlador[21].name("Ocultar Selección");
                    }
                    if (data.tipo === 3){
                        banderaProceso = true;
                        controlador[23].name("Cargar Proceso");
                    }
                    if (data.tipo === 4){
                        banderaProceso = true;
                        controlador[24].name("Animar Procesos");
                    }
            };
            jsonXhr2.send(null);
        };
        jsonXhr.send(null);

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
