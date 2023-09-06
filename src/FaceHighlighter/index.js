import { useState, useEffect, useRef } from "react";
import {
  createMainProgram,
  createPickingProgram,
} from "./helperCode/programCreators.js";
import { PickingTexture } from "./helperCode/pickingTexture.js";
import {
  mainVertexShaderSrc,
  mainFragmentShaderSrc,
} from "./shaders/default.js";
import {
  pickingVertexShaderSrc,
  pickingFragmentShaderSrc,
} from "./shaders/picking.js";

import {
  Canvas,
  gl,
  leftMouseButtonIsPressed,
  cursorX,
  cursorY,
} from "./Canvas.js";
import {
  createVao,
  loadImage,
  generateTexture,
  Rotator,
  saveSelection,
  Translator,
  Scalar,
  setToDefaultPosition,
} from "./helperCode/funcs.js";
import "./index.css";
import Module from "./helperCode/module.js";
const { mat4 } = require("gl-matrix");

export default function FaceSelector() {
  const [inputFocused, setInputFocused] = useState(false);
  const fileInputRef = useRef(null);
  const toleranceInputRef = useRef(null);
  const resetSelectionButtonRef = useRef(null);
  const saveSelectionButtonRef = useRef(null);
  const selectionNameInputRef = useRef(null);
  const displaySelectionButtonRef = useRef(null);
  const selectionDropdownRef = useRef(null);
  const defaultPositionButtonRef = useRef(null);

  useEffect(() => {
    async function setListenersAndDraw() {
      const mainProgram = await createMainProgram(
        gl,
        mainVertexShaderSrc,
        mainFragmentShaderSrc
      );
      const pickingProgram = await createPickingProgram(
        gl,
        pickingVertexShaderSrc,
        pickingFragmentShaderSrc
      );
      const fileInput = fileInputRef.current;
      const toleranceInput = toleranceInputRef.current;
      const resetSelectionButton = resetSelectionButtonRef.current;
      const saveSelectionButton = saveSelectionButtonRef.current;
      const selectionNameInput = selectionNameInputRef.current;
      const displaySelectionButton = displaySelectionButtonRef.current;
      const selectionDropdown = selectionDropdownRef.current;
      const defaultPositionButton = defaultPositionButtonRef.current;

      defaultPositionButton.addEventListener("click", setToDefaultPosition);

      const mainTexImage = await loadImage("textures/Solid_silver.png");
      const mainTexture = generateTexture(gl, mainTexImage, 200, 200);
      const selectionTexImage = await loadImage("textures/yellow.png");
      const selectionTexture = generateTexture(
        gl,
        selectionTexImage,
        1200,
        900
      );

      gl.clearColor(0.34, 0.425, 0.6, 5);
      gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

      let instance = 0;
      fileInput.addEventListener("click", function (event) {
        if (instance++) {
          alert("Please refresh page before loading another STL file");
          event.preventDefault();
          return;
        }
      });

      fileInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onerror = (event) => {
          console.error("Error reading file:", event.target.error);
        };

        reader.onload = (event) => {
          const fileContent = event.target.result;
          const fileContentAsArray = new Uint8Array(fileContent);

          Module().then(async (Module) => {
            try {
              // Pass file contents to C++ class constructor, pLoader loads model using assimp in emscripten
              // ..and uses glm to calculate vertices for picked faces.
              const pLoader = await new Module.PickLoader(fileContentAsArray);
              const indices = pLoader.indices;
              const vertices = pLoader.vertices;
              const center = pLoader.model_center;
              const initialScaleFactor = pLoader.scaleFactor;
              const numTriangles = pLoader.numTriangles;

              const vao = createVao(gl, indices, vertices);
              const pickingTexture = new PickingTexture();
              pickingTexture.init(gl, 1000, 800);

              setToDefaultPosition();
              let deltaTime = 0;
              let lastTime = 0;
              let selections = {};
              let faces = {};
              selectionDropdown.innerHTML = "";

              resetSelectionButton.addEventListener("click", function () {
                pLoader.clearSelection();
                faces = {};
              });

              saveSelectionButton.addEventListener("click", function () {
                const selectionName = selectionNameInput.value;
                if (selectionName.length) {
                  saveSelection(
                    selections,
                    selectionDropdown,
                    faces,
                    selectionName
                  );
                }
                selectionNameInput.value = "";
                faces = {};
                pLoader.clearSelection();
              });

              displaySelectionButton.addEventListener("click", function () {
                const selectionName = selectionDropdown.value;
                if (selectionName.length) {
                  faces = selections[selectionName];
                  pLoader.clearSelection();
                }
              });

              const projection = mat4.create();
              mat4.perspective(
                projection,
                45.0 / 57.29578,
                gl.canvas.width / gl.canvas.height,
                0.1,
                100.0
              );

              const draw = () => {
                requestAnimationFrame(draw);
                const now = performance.now();
                deltaTime = now - lastTime;
                lastTime = now;
                Rotator.updateRotation(deltaTime);
                Translator.updateTranslation(deltaTime);
                Scalar.updateScaling(deltaTime);

                const model = mat4.create();
                mat4.rotateY(model, model, Rotator.yChange);
                mat4.rotateX(model, model, Rotator.xChange);
                mat4.scale(model, model, [
                  Scalar.factor,
                  Scalar.factor,
                  Scalar.factor,
                ]);
                mat4.scale(model, model, [
                  initialScaleFactor,
                  initialScaleFactor,
                  initialScaleFactor,
                ]);
                mat4.translate(model, model, [
                  -center[0],
                  -center[1],
                  -center[2],
                ]);

                const view = mat4.create();
                mat4.lookAt(
                  view,
                  [Translator.xChange, Translator.yChange, 3],
                  [Translator.xChange, Translator.yChange, 0],
                  [0, 1, 0]
                );

                if (leftMouseButtonIsPressed) {
                  pickingTexture.write(
                    gl,
                    pickingProgram,
                    vao,
                    numTriangles,
                    view,
                    projection,
                    model
                  );

                  const vertexId = pickingTexture.readPixel(
                    gl,
                    (cursorX * gl.canvas.width) / gl.canvas.clientWidth,
                    gl.canvas.height -
                      (cursorY * gl.canvas.height) / gl.canvas.clientHeight -
                      1
                  );
                  if (vertexId && vertexId < indices.length) {
                    faces = pLoader.calcCurrentFaces(
                      vertexId,
                      parseFloat(toleranceInput.value)
                    );
                  }
                } else {
                  pLoader.on = false; // for de-selecting / re-selecting
                }

                gl.clearColor(0.34, 0.425, 0.6, 5);
                gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

                gl.useProgram(mainProgram.program);
                gl.enable(gl.DEPTH_TEST);

                gl.uniformMatrix4fv(mainProgram.uniformView, false, view);
                gl.uniformMatrix4fv(
                  mainProgram.uniformProjection,
                  false,
                  projection
                );
                gl.uniformMatrix4fv(mainProgram.uniformModel, false, model);
                gl.uniform3f(
                  mainProgram.uniformEyePosition,
                  Translator.xChange,
                  Translator.yChange,
                  3.0
                );
                mainProgram.useLights();

                // render picked faces
                if (faces.startIndices) {
                  gl.activeTexture(gl.TEXTURE0);
                  gl.bindTexture(gl.TEXTURE_2D, selectionTexture);
                  let i = 0;
                  gl.bindVertexArray(vao);
                  for (const index of faces.startIndices) {
                    gl.drawElements(
                      gl.TRIANGLES,
                      faces.counts[i++],
                      gl.UNSIGNED_INT,
                      index * 4 // because of data size, 4 is the stride
                    );
                  }
                  gl.bindVertexArray(null);
                }

                // render model
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, mainTexture);
                gl.bindVertexArray(vao);
                gl.drawElements(gl.TRIANGLES, numTriangles, gl.UNSIGNED_INT, 0);
                gl.bindVertexArray(null);
                gl.useProgram(null);
              };

              draw();
            } catch (err) {
              console.log(err);
            }
          });
        };
        reader.readAsArrayBuffer(file);
      });
    }
    setListenersAndDraw();
  }, []);

  return (
    <div className="container">
      <Canvas inputFocused={inputFocused} />
      <div className="input-container">
        <div className="canvas-inputs">
          <label>STL File: </label>
          <input ref={fileInputRef} type="file" />
        </div>
        <div className="canvas-inputs">
          <label>Tolerance: </label>
          <input
            ref={toleranceInputRef}
            type="number"
            min="1.0"
            max="90.0"
            step="0.1"
            defaultValue="5.0"
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
          />
        </div>
        <div className="canvas-inputs">
          <button ref={resetSelectionButtonRef} type="reset">
            Reset Selection
          </button>
        </div>
        <div className="canvas-inputs">
          <button ref={saveSelectionButtonRef}>
            Save current selection as
          </button>
          <input
            ref={selectionNameInputRef}
            type="text"
            placeholder="Selection Name"
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
          />
        </div>
        <div className="canvas-inputs">
          <button ref={displaySelectionButtonRef}>Display a Selection</button>
          <select
            ref={selectionDropdownRef}
            aria-label="Available Selections"></select>
        </div>
        <div className="canvas-inputs">
          <button ref={defaultPositionButtonRef}>
            Re-position to default view
          </button>
        </div>
      </div>
    </div>
  );
}
