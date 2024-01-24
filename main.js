"use strict";
let mandelbrotCanvas;

class complex {
    constructor(a,b){
        this.a =a;
        this.b =b;
    }

    addition(c){
        this.a += c.a;
        this.b += c.b;
        return this
    }

    module(){
        return Math.sqrt(this.a**2 + this.b**2);
    }

    square(){
        let oldA = this.a;
        let oldB = this.b;
        this.a = oldA**2 - oldB**2
        this.b = 2*oldA*oldB
        return this
    }
}

window.onload = function() {
    mandelbrotCanvas = document.getElementById("viewport");
    const mandelbrotCTX = mandelbrotCanvas.getContext("2d");
    
    const size = get_size()
    adjust_height(size)

    let mandelbrotImageData = mandelbrotCTX.getImageData(0,0,size[0],size[1]);  
    let precision = 200;

    generate_initial(size,mandelbrotImageData, mandelbrotCTX, precision);
    mandelbrotCanvas.addEventListener("click", (event) => select_pixel(event,size,mandelbrotImageData,mandelbrotCTX))
}

function get_size(){
    const width = Number(document.getElementById("viewport").getAttribute("width"));
    const height = Math.floor(width / (81/70))
    return [width, height]
}

function adjust_height(size){
    mandelbrotCanvas.setAttribute("height", size[1])
}

function paint_canvas(data,context){
    context.putImageData(data,0,0);
}

function set_pixel(imgData,x,y,r,g,b,size){
    const offset = (y * size[0] + x) * 4;
    imgData.data [offset] = r  ;
    imgData.data [offset + 1] = g;
    imgData.data [offset + 2] = b;
    imgData.data [offset + 3] = 255;
}


function check_pixel(a, c, precision){
    let z = new complex(a.a, a.b);
    let k = 0;
    while( k <= precision && z.module()<=2){
        z= z.square().addition(c);
        k++;
    }
    if (z.module()<=2){
        return -1;
    }
    else{
        return k;
    }
}

function check_mandelbrot(c, precision){
    let a = new complex(0,0);
    return check_pixel(a, c, precision);
}

function check_julia(a, x, y, size, precision){
    let c = new complex (-2+4*(x/size[0]),-2+4*(y/size[1]))
    return check_pixel(c, a, precision)
}

function get_positional_mandelbrot_complex(x,y,size){
    return new complex(-2+2.7*(x/size[0]),-(7/6)+(14/6)*(y/size[1]));
}

function generate_initial(size,mandelbrotImageData,mandelbrotCTX,precision){
    for (let y = 0; y <= size[1]; y++){
        for (let x = 0; x <= size[0]; x++){
            let c = get_positional_mandelbrot_complex(x,y,size);
            let r, g, b;
            let result = check_mandelbrot(c, precision);
            if (result == -1){
                r = 0;
                g = 0;
                b = 0;
            } else {
                r = 0;
                g = 255*(result/precision)
                b = 0;
            }
            set_pixel(mandelbrotImageData,x,y,r,g,b,size);
            }  
        }   
    
    paint_canvas(mandelbrotImageData, mandelbrotCTX);
}

function select_pixel(event,size,mandelbrotImageData,mandelbrotCTX){
    const bounding = mandelbrotCanvas.getBoundingClientRect();
    const x = Math.floor(event.clientX - bounding.left);
    const y = Math.floor(event.clientY - bounding.top);
    const a = get_positional_mandelbrot_complex(x,y,size)
    console.log("clicked pixel x:", x, " y:",y);
    set_pixel(mandelbrotImageData,x,y,255,255,255,size);
    paint_canvas(mandelbrotImageData, mandelbrotCTX)
    create_julia(a)
}

function create_julia(a){
    const juliaCanvas = document.getElementById("julia")
    const juliaCTX = juliaCanvas.getContext("2d")
    const size = [juliaCanvas.getAttribute("width"), juliaCanvas.getAttribute("height")]
    let juliaImageData = juliaCTX.getImageData(0, 0, size[0], size[1])
    let precision = 200
    generate_julia(a, size, juliaImageData, juliaCTX, precision)
}

function generate_julia(a,size,imageData,ctx,precision){
    for (let y = 0; y <= size[1]; y++){
        for (let x = 0; x <= size[0]; x++){
            let r, g, b;
            let result = check_julia(a,x,y,size,precision);
            if (result == -1){
                r = 0;
                g = 0;
                b = 0;
            } else {
                r = 0;
                g = 255*(result/precision)
                b = 0;
            }
            set_pixel(imageData,x,y,r,g,b,size);
            }  
        }   
    
    paint_canvas(imageData, ctx);
    console.log("zbim")
}
