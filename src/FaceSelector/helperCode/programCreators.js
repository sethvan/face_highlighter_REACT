const createShaderProgram = function (gl, vs_src, fs_src) {
  const program = gl.createProgram();

  const vertexShader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertexShader, vs_src);
  gl.compileShader(vertexShader);
  gl.attachShader(program, vertexShader);

  const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragmentShader, fs_src);
  gl.compileShader(fragmentShader);
  gl.attachShader(program, fragmentShader);

  gl.linkProgram(program);
  gl.validateProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log(gl.getShaderInfoLog(vertexShader));
    console.log(gl.getShaderInfoLog(fragmentShader));
  }

  gl.validateProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log(gl.getShaderInfoLog(vertexShader));
    console.log(gl.getShaderInfoLog(fragmentShader));
  }

  return program;
};

const createMainProgram = async function (gl, vs_src, fs_src) {
  const mainProgram = {};
  mainProgram.program = await createShaderProgram(gl, vs_src, fs_src);

  gl.useProgram(mainProgram.program);
  mainProgram.uniformModel = gl.getUniformLocation(
    mainProgram.program,
    "model"
  );
  mainProgram.uniformProjection = gl.getUniformLocation(
    mainProgram.program,
    "projection"
  );
  mainProgram.uniformView = gl.getUniformLocation(mainProgram.program, "view");
  mainProgram.uniformEyePosition = gl.getUniformLocation(
    mainProgram.program,
    "eyePosition"
  );

  // Material uniforms
  mainProgram.uniformSpecularIntensity = gl.getUniformLocation(
    mainProgram.program,
    "material.specularIntensity"
  );
  mainProgram.uniformShininess = gl.getUniformLocation(
    mainProgram.program,
    "material.shininess"
  );

  //Directional light uniforms
  mainProgram.uniformDirectionalLightAmbientColour = gl.getUniformLocation(
    mainProgram.program,
    "directionalLight.base.colour"
  );
  mainProgram.uniformDirectionalLightAmbientIntensity = gl.getUniformLocation(
    mainProgram.program,
    "directionalLight.base.ambientIntensity"
  );
  mainProgram.uniformDirectionalLightDiffuseIntensity = gl.getUniformLocation(
    mainProgram.program,
    "directionalLight.base.diffuseIntensity"
  );
  mainProgram.uniformDirectionalLightDirection = gl.getUniformLocation(
    mainProgram.program,
    "directionalLight.direction"
  );

  //Point light uniforms
  mainProgram.uniformPointLightAmbientColour = gl.getUniformLocation(
    mainProgram.program,
    "pointLight.base.colour"
  );
  mainProgram.uniformPointLightAmbientIntensity = gl.getUniformLocation(
    mainProgram.program,
    "pointLight.base.ambientIntensity"
  );
  mainProgram.uniformPointLightDiffuseIntensity = gl.getUniformLocation(
    mainProgram.program,
    "pointLight.base.diffuseIntensity"
  );
  mainProgram.uniformPointLightPosition = gl.getUniformLocation(
    mainProgram.program,
    "pointLight.position"
  );
  mainProgram.uniformPointLightConstant = gl.getUniformLocation(
    mainProgram.program,
    "pointLight.constant"
  );
  mainProgram.uniformPointLightLinear = gl.getUniformLocation(
    mainProgram.program,
    "pointLight.linear"
  );
  mainProgram.uniformPointLightExponent = gl.getUniformLocation(
    mainProgram.program,
    "pointLight.exponent"
  );
  gl.useProgram(null);

  mainProgram.useLights = function () {
    gl.uniform1f(mainProgram.uniformSpecularIntensity, 1.0);
    gl.uniform1f(mainProgram.uniformShininess, 64);

    gl.uniform3f(
      mainProgram.uniformDirectionalLightAmbientColour,
      1.0,
      1.0,
      1.0
    );
    gl.uniform1f(mainProgram.uniformDirectionalLightAmbientIntensity, 0.1);
    gl.uniform1f(mainProgram.uniformDirectionalLightDiffuseIntensity, 0.1);
    gl.uniform3f(mainProgram.uniformDirectionalLightDirection, 0.0, -1.0, 0.0);

    gl.uniform3f(mainProgram.uniformPointLightAmbientColour, 1.0, 1.0, 1.0);
    gl.uniform1f(mainProgram.uniformPointLightAmbientIntensity, 0.7);
    gl.uniform1f(mainProgram.uniformPointLightDiffuseIntensity, 1.0);
    gl.uniform3f(mainProgram.uniformPointLightPosition, 0.0, 2.0, 3.0);
    gl.uniform1f(mainProgram.uniformPointLightConstant, 0.3);
    gl.uniform1f(mainProgram.uniformPointLightLinear, 0.2);
    gl.uniform1f(mainProgram.uniformPointLightExponent, 0.1);
  };

  return mainProgram;
};

const createPickingProgram = function (
  gl,
  pickingVertexShaderSrc,
  pickingFragmentShaderSrc
) {
  let pickingProgram = {};
  pickingProgram.program = createShaderProgram(
    gl,
    pickingVertexShaderSrc,
    pickingFragmentShaderSrc
  );
  gl.useProgram(pickingProgram.program);
  pickingProgram.uniformModel = gl.getUniformLocation(
    pickingProgram.program,
    "model"
  );
  pickingProgram.uniformProjection = gl.getUniformLocation(
    pickingProgram.program,
    "projection"
  );
  pickingProgram.uniformView = gl.getUniformLocation(
    pickingProgram.program,
    "view"
  );

  gl.useProgram(null);

  return pickingProgram;
};

export { createMainProgram, createPickingProgram };
