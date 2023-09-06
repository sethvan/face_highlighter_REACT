import { useEffect, useRef } from "react";
import { keys } from "./helperCode/funcs.js";

let gl = null;
let leftMouseButtonIsPressed = false;

let cursorX = 0;
let cursorY = 0;

function Canvas({ inputFocused }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    gl = canvas.getContext("webgl2");

    if (!gl) {
      console.error("WebGL is not supported");
      return;
    }

    gl.clearColor(0.34, 0.425, 0.6, 5);
    gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

    function handleKeyDown(event) {
      if (!inputFocused) {
        if (keys.hasOwnProperty(event.key)) {
          keys[event.key] = true;
        }
      }
    }
    function handleKeyUp(event) {
      if (!inputFocused) {
        if (keys.hasOwnProperty(event.key)) {
          keys[event.key] = false;
        }
      }
    }

    function handleMouseDown(event) {
      if (event && event.button === 0) {
        leftMouseButtonIsPressed = true;

        // Get the client rect of the canvas element
        let rect = canvas.getBoundingClientRect();

        // Calculate the relative position of the mouse cursor within the canvas
        cursorX = event.clientX - rect.left;
        cursorY = event.clientY - rect.top;
      }
    }
    function handleMouseUp(event) {
      if (event && event.button === 0) {
        leftMouseButtonIsPressed = false;
      }
    }

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    // Cleanup: remove event listeners when the component is unmounted
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  });

  return <canvas ref={canvasRef} width={750} height={600}></canvas>;
}

export { Canvas, gl, leftMouseButtonIsPressed, cursorX, cursorY };
