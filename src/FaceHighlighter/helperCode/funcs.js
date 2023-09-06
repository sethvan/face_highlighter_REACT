

const createVao = function (gl, indices, vertices) {
  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const vbo = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const ibo = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 32, 0);
  gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 32, 12);
  gl.vertexAttribPointer(2, 3, gl.FLOAT, false, 32, 20);

  gl.enableVertexAttribArray(0);
  gl.enableVertexAttribArray(1);
  gl.enableVertexAttribArray(2);

  gl.bindVertexArray(null);
  return vao;
};

const loadImage = (imgPath) =>
  new Promise((resolve) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => console.log(error));
    image.src = imgPath;
  });

const generateTexture = function (gl, img, width, height) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGB,
    width,
    height,
    0,
    gl.RGB,
    gl.UNSIGNED_BYTE,
    img
  );
  gl.generateMipmap(gl.TEXTURE_2D);
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
};

// Track the state of arrow keys
const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
  a: false,
  w: false,
  s: false,
  d: false,
  q: false,
  e: false,
};

const Rotator = {
  xChange: 0,
  yChange: 0,
  updateRotation: function (deltaTime) {
    const input = (45 * (deltaTime / 1000)) / 57.29578;

    if (keys.ArrowUp) {
      this.xChange += input;
    } else if (keys.ArrowDown) {
      this.xChange -= input;
    }

    if (keys.ArrowLeft) {
      this.yChange += input;
    } else if (keys.ArrowRight) {
      this.yChange -= input;
    }
  },
};

const Translator = {
  xChange: 0,
  yChange: 0,
  updateTranslation: function (deltaTime) {
    const input = deltaTime / 3000;

    if (keys.a) {
      this.xChange -= input;
    } else if (keys.d) {
      this.xChange += input;
    }

    if (keys.w) {
      this.yChange += input;
    } else if (keys.s) {
      this.yChange -= input;
    }
  },
};
const Scalar = {
  factor: 1,
  updateScaling: function (deltaTime) {
    const input = deltaTime / 3000;
    if (keys.q) {
      this.factor += input;
    } else if (keys.e) {
      this.factor -= input;
    }
  },
};

function saveSelection(
  selectionCollection,
  dropdown,
  selection,
  selectionName
) {
  if (selection.startIndices) {
    selectionCollection[selectionName] = selection;
    console.log("selectionCollection", selectionCollection);

    const optionAlreadyExists =
      dropdown.options &&
      Array.from(dropdown.options).find(
        (option) => option.value === selectionName
      );
    if (!optionAlreadyExists) {
      const optionElement = document.createElement("option");
      optionElement.value = selectionName;
      optionElement.text = selectionName;
      dropdown.add(optionElement);
    }
  }
}

const setToDefaultPosition = function () {
  Rotator.xChange = 0;
  Rotator.yChange = 0;
  Translator.xChange = 0;
  Translator.yChange = 0;
  Scalar.factor = 1;
};

export {
  createVao,
  loadImage,
  generateTexture,
  keys,
  Rotator,
  saveSelection,
  Translator,
  Scalar,
  setToDefaultPosition,
};
