class PickingTexture {
  init(gl, width, height) {
    this.fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);

    this.pickingTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.pickingTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA32UI,
      width,
      height,
      0,
      gl.RGBA_INTEGER,
      gl.UNSIGNED_INT,
      null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.pickingTexture,
      0
    );

    this.depthTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.depthTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.DEPTH_COMPONENT24,
      width,
      height,
      0,
      gl.DEPTH_COMPONENT,
      gl.UNSIGNED_INT,
      null
    );
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.TEXTURE_2D,
      this.depthTexture,
      0
    );

    const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
    if (status !== gl.FRAMEBUFFER_COMPLETE) {
      console.error("FB error, status:", status);
    }

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  enableWriting(gl) {
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, this.fbo);
  }

  disableWriting(gl) {
    gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, null);
  }

  readPixel(gl, x, y) {
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.fbo);
    gl.readBuffer(gl.COLOR_ATTACHMENT0);

    const pixel = new Uint32Array(4);
    gl.readPixels(x, y, 1, 1, gl.RGBA_INTEGER, gl.UNSIGNED_INT, pixel);

    gl.readBuffer(gl.NONE);
    gl.bindFramebuffer(gl.READ_FRAMEBUFFER, null);

    return pixel[0];
  }

  write(gl, pickingProgram, vao, numTriangles, view, projection, model) {
    this.enableWriting(gl);
    gl.clearBufferuiv(gl.COLOR, 0, [0, 0, 0, 1]);
    gl.clear(gl.DEPTH_BUFFER_BIT);
    gl.useProgram(pickingProgram.program);
    gl.enable(gl.DEPTH_TEST);
    gl.uniformMatrix4fv(pickingProgram.uniformView, false, view);
    gl.uniformMatrix4fv(pickingProgram.uniformProjection, false, projection);
    gl.uniformMatrix4fv(pickingProgram.uniformModel, false, model);
    gl.bindVertexArray(vao);
    gl.drawElements(gl.TRIANGLES, numTriangles, gl.UNSIGNED_INT, 0);
    gl.bindVertexArray(null);
    this.disableWriting(gl);
  }
}

export { PickingTexture };
