////////////////LIBRERIA FIGURA////////////////////
	function Figura() {
    	this.look = this.creaLook( );
    	this.MV = mat4();
    	this.visible = true;
			this.pers = this.creaPerspective( );
	}

	Figura.prototype.creaLook = function(){
		var eye = vec3(51.0,-51.0,51.0);
		var at = vec3(0.0,0.0,0.0);
		var up = vec3(0.0,0.0,1.0);
		return lookAt(eye,at,up);
	};

	Figura.prototype.creaPerspective = function(){
		var m = mat4();
		var fovy = 45;
		var aspect =  canvas.clientWidth/canvas.clientHeight;
		var near = 1;
		var far = 1024;

		m = perspective( fovy, aspect, near, far);

		return m;
	};

	Figura.prototype.modelView = function(){
		var m = mat4();
		var s = scalem(this.scale[0],this.scale[1],this.scale[2]);
		var t = translate(this.translate[0],this.translate[1],this.translate[2]);
		var rx = rotate(this.rotate[0],vec3(1,0,0));
		var ry = rotate(this.rotate[1],vec3(0,1,0));
		var rz = rotate(this.rotate[2],vec3(0,0,1));

		m = mult(this.look,mult(t,mult(rz,mult(ry,mult(rx,s)))));
		return m;
	};

//////////////CONO/////////////////////////////////
	function Cono(lados,largo,radio) {
		Figura.call(this, null);
    	this.radio = radio;
    	this.scale = [1,1,1];
    	this.rotate = [0,0,0];
    	this.translate = [0,0,0];
    	this.lados = lados;
    	this.largo = largo;
    	this.vertices = this.creaVertices(radio,largo,lados);
    	this.indices = this.creaIndices(lados);
    	this.colores = null;
	}

	Cono.prototype = Object.create(Figura.prototype);

	Cono.prototype.creaVertices = function(radio,largo,n){
		var vertices = [];
		var grados = 360 / n;
		var theta = 0;
		for(var i = 0; i < n; i++){
			theta = i * grados;
			rad = (theta * Math.PI)/180;
			vertices.push(vec3(radio*Math.sin(rad),-largo/2,radio*Math.cos(rad)));
		}

		vertices.push(vec3(0.0,largo/2,0.0));
		return vertices;
	};

	Cono.prototype.creaIndices = function(n){
		var indices = [];
	    indices.push(0);

		for (var i = 1; i < Math.ceil(n/2); i++) {
			indices.push(i,n-i);
		}

		if ( n % 2 == 0 ) {
			indices.push( n/2 );
		}
		//Create pike
		for (var i = 0; i < Math.ceil(n/3.0);i++){
			if (i!=0){
				var aux = indices[indices.length-1];
				indices.push( aux );
				if (n%2==1){
					indices.push( aux, (aux+1)%n );
				}
				else{
					var aux2 = aux - 1;
					if (aux2 < 0)	aux2 = n + aux2;
					indices.push( aux, aux2 );
				}
			}
			aux = indices[indices.length-1];
			indices.push(n);
			if ( i*3 + 1 < n ){
				if (n%2==1){
					indices.push( (aux+1)%n );
					if ( i*3 + 2 < n ){
						indices.push( (aux+2)%n );
					}
				}
				else{
					var aux2 = aux - 1;
					if (aux2 < 0)	aux2 = n + aux2;
					indices.push( aux2 );
					if ( i*3 + 2 < n ){
						aux2 = aux - 2;
						if (aux2 < 0)	aux2 = n + aux2;
						indices.push( aux2 );
					}
				}
			}
		}
		return indices;
	};

	Cono.prototype.creaColores = function(indices, r, g, b){
		var colors = [];
	    for(var i = 0; i <indices.length; i++ ){
			colors.push(vec4(r/256,g/256,b/256,1.0));
		}
		return colors;
	};



//////////////CILINDRO/////////////////////////////////
	function Cilindro(lados,largo,radio) {
		Figura.call(this, null);
    	this.radio = radio;
    	this.scale = [1,1,1];
    	this.rotate = [0,0,0];
    	this.translate = [0,0,0];
		this.normales = [];
    	this.lados = lados;
    	this.largo = largo;
    	this.aux = this.creaVerInd(lados,radio,largo);
    	this.vertices =  this.aux.vertices;
    	this.indices =  this.aux.indices;
    	this.colores =  this.creaColores(this.indices);
	}

	Cilindro.prototype = Object.create(Figura.prototype);

	Cilindro.prototype.creaVerInd = function(n,radio,largo){
		var vertices = [];
		var indices = [];

		var grados = 360 / n;
		var theta = 0;
		for(var i = 0; i < n; i++){
			theta = i * grados;
			rad = (theta * Math.PI)/180;
			vertices.push(vec4(radio*Math.cos(rad),radio*Math.sin(rad),largo/2,1.0));
			this.normales.push(vec4(Math.cos(rad),Math.sin(rad),0,0));
		}

		indices.push(0);

		for (var i = 1; i < Math.ceil(n/2); i++) {
			indices.push(i,n-i);
		}

		if ( n % 2 == 0 ) {
			indices.push( n/2 );
		}

		var lastInd = indices[n-1];

		vertices.push(vec4(vertices[lastInd][0],vertices[lastInd][1],-largo/2,1.0));
		this.normales.push(vec4(vertices[lastInd][0],vertices[lastInd][1],0,0));
		indices.push(n);

		if ( n % 2 == 1 ) {

			for ( var i = 1; i < n; i++ ){
				vertices.push(vec4(vertices[ (lastInd+i)%n][0] , vertices[(lastInd+i)%n][1] , -largo/2, 1.0 ));
				this.normales.push(vec4(vertices[ (lastInd+i)%n][0] , vertices[(lastInd+i)%n][1] , -largo/2, 0 ));
				indices.push((lastInd+i)%n, n+i);
			}

		}else{

			for ( var i = 1; i < n; i++ ){
				var aux = lastInd - i;
				if (aux < 0)	aux = n + aux;
				vertices.push(vec4( vertices[aux][0] ,vertices[aux][1] , -largo/2, 1.0 ));
				this.normales.push(vec4( vertices[aux][0] ,vertices[aux][1] , -largo/2, 0 ));
				indices.push(aux, n+i);
			}
		}

		indices.push(n);

		//another face
		for (var i = 1; i <= n-2; i++){
			if ( i%2 == 1 ){
				indices.push(indices[indices.length-2] - 1);
			}
			else{
				indices.push(indices[indices.length-2] + 1);
			}
		}
		return {
                indices: indices,
                vertices: vertices
        };
	};

	Cilindro.prototype.creaColores = function(indices, r, g, b){
		var colors = [];
	    for(var i = 0; i <indices.length; i++ ){
			colors.push(vec4(r/256,g/256,b/256,1.0));
		}
		return colors;
	};

//////////////ESFERA/////////////////////////////////

	function Esfera(nLongitud,nLatitud,radio) {
		Figura.call(this, null);
    	this.nLongitud = nLongitud;
    	this.nLatitud = nLatitud;
    	this.radio = radio;
    	this.scale = [1,1,1];
    	this.rotate = [0,0,0];
    	this.translate = [0,0,0];
		this.normales = [];
    	this.vertices = this.creaVertices(nLongitud,nLatitud,radio);
    	this.indices = this.creaIndices(nLongitud,nLatitud);
    	this.colores = this.creaColores(this.indices);
	}
    Esfera.prototype = Object.create(Figura.prototype);

	Esfera.prototype.creaVertices = function(nLongitud,nLatitud,radio){
		var vertices = [];
		var gradosLatitud = 360 / nLatitud;
		var gradosLongitud = 180 / nLongitud;
		var theta = 0;
		var phi = 0;

		for(var i = 0; i <= nLongitud; i++){
			phi = i * gradosLongitud;
			a = phi;
			phi = (phi * Math.PI)/180;

			var z = radio * Math.cos(phi);

			if ( i!=0 && i!=(nLongitud) ){

				for(var j = 0; j < nLatitud; j++){

					theta = j * gradosLatitud;
					theta = (theta * Math.PI)/180;

					var x = Math.sin(phi) * Math.cos(theta);
					var y = Math.sin(phi) * Math.sin(theta);

					if (Math.abs(x) < 0.0000000000001) x = 0;
					if (Math.abs(y) < 0.0000000000001) y = 0;

					this.normales.push(x);
	        		this.normales.push(y);
	        		this.normales.push(z);
					this.normales.push(0);
					vertices.push( vec4( radio * x, radio * y, z, 1) );
				}
			}
			else{
				if ( i==0 ){
					this.normales.push(0);
	        		this.normales.push(0);
	        		this.normales.push(z);
					this.normales.push(0);
					vertices.push( vec4( 0, 0, z, 1) );
				}
				if ( i==(nLongitud) ){
					this.normales.push(0);
	        		this.normales.push(0);
	        		this.normales.push(z);
					this.normales.push(0);
					vertices.push( vec4( 0, 0, z, 1) );
				}
			}
		}
		return vertices;
	};

	Esfera.prototype.creaIndices = function(nLongitud,nLatitud){
		var indices = [];
	    indices.push( 1, 2 );
		for (var i = 0; i < Math.ceil(nLatitud/3.0);i++){
			if ( i > 0 ){
				indices.push( aux, aux );
				if (aux + 1 > nLatitud) aux = 0;
				indices.push( aux + 1 );
			}
			var aux = indices[indices.length-1];

			indices.push(0);

			if ( i*3 + 1 < nLatitud ){
				if (aux + 1 > nLatitud) aux = 0;
				aux = aux + 1;

				indices.push( aux );
				if ( i*3 + 2 < nLatitud ){
					if (aux + 1 > nLatitud) aux = 0;
					aux = aux + 1;
					indices.push( aux );
				}
			}
		}
		var value = indices.length;

		//Cintas Alrededor
		indices.push(indices[indices.length-1], 1);

		for (var i = 1; i <= nLongitud - 2; i++){
			for (var j = 1; j <= nLatitud; j++){
				indices.push( (i-1)*nLatitud + j, i*nLatitud + j );
			}
			indices.push( (i-1)*nLatitud + 1, i*nLatitud + 1);
		}

		//Tapa inferior
		len = (nLongitud - 1) * nLatitud + 1;
		indices.push(indices[0] + (nLongitud-2) * nLatitud);
		for ( var i = 0; i < value; i++){
			if (indices[i] == 0 ){
				indices.push(len);
			}
			else{
				indices.push(indices[i] + (nLongitud-2) * nLatitud);
			}
		}
		return indices;
	};

	Esfera.prototype.creaColores = function(indices, r, g, b){
		var colors = [];
	    for(var i = 0; i <indices.length; i++ ){
			colors.push(vec4(r/256,g/256,b/256,1.0));
		}
		return colors;
	};
///////////////////////////PLANO/////////////////////////////////
	function Plano(step1,step2,perpendicular) {
		Figura.call(this, null);
		this.scale = [1,1,1];
    	this.rotate = [0,0,0];
    	this.translate = [0,0,0];
    	this.step1 = step1;
    	this.step2 = step2;
    	this.perpendicular = perpendicular;
    	this.vertices = this.creaVertices(step1,step2,perpendicular);
    	this.colores = this.creaColores(this.vertices);
	}

	Plano.prototype = Object.create(Figura.prototype);

	Plano.prototype.creaVertices = function(step1,step2,perpendicular){
		var vertices = [];
		stepA = 1.35/step1;
		stepB = 1.35/step2;

		switch(perpendicular){
			case 0:
				for (var i = -0.675; i <= 0.675; i += stepA){
					vertices.push( vec3( 0, i, -0.675) );
					vertices.push( vec3( 0, i,  0.675) );
				}
				for (var j = -0.675; j <= 0.675; j += stepB){
					vertices.push( vec3( 0,-0.675, j) );
					vertices.push( vec3( 0, 0.675, j) );
				}
			break;
			case 1:
				for (var i = -0.675; i <= 0.675; i += stepA){
					vertices.push( vec3( i, 0, -0.675) );
					vertices.push( vec3( i, 0,  0.675) );
				}
				for (var j = -0.675; j <= 0.675; j += stepB){
					vertices.push( vec3(-0.675, 0, j) );
					vertices.push( vec3( 0.675, 0, j) );
				}

			break;
			case 2:
				for (var i = -0.675; i <= 0.675; i += stepA){
					vertices.push( vec3( -0.675, i, 0) );
					vertices.push( vec3( 0.675,  i, 0) );
				}
				for (var j = -0.675; j <= 0.675; j += stepB){
					vertices.push( vec3( j,-0.675, 0) );
					vertices.push( vec3( j, 0.675, 0) );
				}
			break;

		}
		return vertices;
	};

	Plano.prototype.creaColores = function(indices){
		var colors = [];
	    for(var i = 0; i <indices.length; i++ ){
			colors.push(vec4(0.7,0.7,0.7,1.0));
		}
		return colors;
	};
	///////////////////////////LUCES//////////////////////////////////
	function Luz() {
		this.light_Position =  vec4(1.0, 1.0, 1.0, 0.0 );
		this.light_Ambient = vec4(0.2, 0.2, 0.2, 1.0 );
		this.light_Diffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
		this.light_Specular = vec4(1.0,1.0,1.0,1.0);
	}

	Luz.prototype = Object.create(Esfera.prototype);
