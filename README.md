# face_highlighter_REACT

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).  

React version of original [WebGL app](https://github.com/sethvan/face_highlighter) for selecting and highlighting faces of models in STL format.

It is meant to be integrated into a CAD tool. It will be used to select and save faces of 3D models of STL file format. I originally did this in OpenGL and then redid it in WebGL as it will be implemented as part of a browser based tool using REACT.

Instead of doing everything in JavaScript though I learned enough emscripten to have a C++ class take the picked VertexID passed to it and do the work for calculating which faces/vertices have been previously selected or saved and which to display for the picked faces based upon how much relative tolerance to allow between the difference in normals of adjacent triangles. The C++ class uses glm and helper structs/functions.  

That same C++ class also uses assimp to load the file which is passed to it as an array from a FileReader in JavaScript. The video begins demoing viewer and then demos the picking.

For time being, only keys are being used to re-position model:  

* Arrow keys for rotating.  
* 'q' makes model larger  
* 'e' makes model smaller  
* 'w' lowers the model  
* 's' elevates the model  
* 'a' moves model right  
* 'd' moves model left  
  
To use as a component  

* copy FaceSelector directory and paste it into your REACT app's src directory
* copy the textures directory and the module.wasm file from the public directory and paste those into your public directory
* `npm install gl-matrix`
* `import FaceHighlighter from "./FaceHighlighter"` in the file where you want to use it.

https://github.com/sethvan/face_highlighter/assets/78233173/9ed3a593-ab67-4b79-9c2b-e25386bf4596
