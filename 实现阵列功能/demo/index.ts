import { createMxCad } from "mxcad"

createMxCad({
    "canvas": "#mxcad",
     locateFile: (fileName)=> new URL(`/node_modules/mxcad/dist/wasm/2d/${fileName}`, import.meta.url).href,
})