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

    module_carre(){
        return this.a * this.a + this.b * this.b
    }

}

window.onload = function() {
    mandelbrotCanvas = document.getElementById("viewport");
    const mandelbrotCTX = mandelbrotCanvas.getContext("2d");
    
    const size = get_size()
    adjust_height(size)

    let mandelbrotImageData = mandelbrotCTX.getImageData(0,0,size[0],size[1]);  
    let precision = 256;

    console.time("temps de création de la colormap")
    const colormap = create_colormap(precision)
    console.log(colormap)
    show_colormap(colormap)
    console.timeEnd("temps de création de la colormap")

    


    generate_initial(size,mandelbrotImageData, mandelbrotCTX, precision, colormap);
    mandelbrotCanvas.addEventListener("click", (event) => select_pixel(event,size,mandelbrotImageData,mandelbrotCTX))
}

function get_size(){
    let width = Number(document.getElementById("viewport").getAttribute("width"));
    if (width%2 == 0){
        width+=1
    }
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

function get_pixel(array, x, y, width){
    const offset = (y * width + x) * 4;
    let R = array[offset];
    let G = array[offset + 1];
    let B = array[offset + 2];
    let A = array[offset + 3];
    return [R,G,B,A];
}

function check_pixel(a, c, precision){
    let z = new complex(a.a, a.b);
    let k = 0;
    while( z.module_carre()<=4) {
        z= z.square().addition(c);
        if (k++ > precision) return -1;
    }
    return k;
    /*while( k <= precision && z.module_carre()<=4){
        z= z.square().addition(c);
        k++;
    }
    return (z.module_carre()<=4) ? -1 : k;*/
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

function generate_initial(size,mandelbrotImageData,mandelbrotCTX,precision,colormap){
    console.time("temps de génération de mandelbrot")
    ///Generate the upper half
    for (let y = 0; y <= Math.floor(size[1]/2); y++){
        for (let x = 0; x <= size[0]; x++){
            let c = get_positional_mandelbrot_complex(x,y,size);
            let r, g, b;
            let result = check_mandelbrot(c, precision);
            if (result == -1){
                r = 0;
                g = 0;
                b = 0;
            } else {
                let color = colormap[result];
                r = color[0];
                g = color[1];
                b = color[2];
                /*
                r = 0;
                g = 255*(result/precision)   ///No colormap
                b = 0;
                */
            }
            set_pixel(mandelbrotImageData,x,y,r,g,b,size);
            }  
        }   

    for (let y = size[1]; y >Math.floor(size[1]/2); y--){
        for (let x = 0; x <= size[0]; x++){
            let color = get_pixel(mandelbrotImageData.data,x,size[1]-y,size[0])
            let r = color[0]
            let g = color[1]
            let b = color[2]
            set_pixel(mandelbrotImageData,x,y,r,g,b,size);
        }
    }
    
        console.timeEnd("temps de génération de mandelbrot")
    paint_canvas(mandelbrotImageData, mandelbrotCTX);
}

function select_pixel(event,size,mandelbrotImageData,mandelbrotCTX){
    const bounding = mandelbrotCanvas.getBoundingClientRect();
    const x = Math.floor(event.clientX - bounding.left);
    const y = Math.floor(event.clientY - bounding.top);
    const a = get_positional_mandelbrot_complex(x,y,size)
    console.log("clicked pixel x:", x, " y:",y);
    set_pixel(mandelbrotImageData,x,y,255,255,255,size);
    set_pixel(mandelbrotImageData,x,size[1]-y,255,255,255,size);
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
}

///Testing colormaps
function color_map(p,precision) {
    let sr=0 ; let sg=0 ; let sb=0;
    if (p < (precision/6)) {
        sr = 0 ; sg = 0 ; sb = 230 / (10/p);
    } 
    else if (((precision / 6.5) <= p) && (p < (precision /3))) {
        sr = 0 ; sg =  (p - Math.floor(precision/6))*10; sb = (230 / (10/(Math.floor(precision/6))))-Math.floor(p/2);
    } else if (p < 150) {
        sr = (p - 128) * 4 ; sg = 255  ;sb = 0;
    } else {
        sr = 255 ; sg = (256 - (p - 191) * 4) ; sb = 0;
    }
  return [sr ,sg ,sb];
}

function color_map_2(p){
    let r=0 ; let g=0 ; let b=0;
    r = Math.floor(1.022 ** p)
    if (p > 0 && p < 150){
        b = Math.floor(75*Math.log(p) - 2*p)
    }
    if (p < 200){
        g = Math.floor( ( ( p**2 - 0.005*(p**3) ) / 4000 ) * p )
    }

    return [r ,g ,b]
}

function create_colormap(precision){
    let colormap = []
    for (let i = 0; i<=precision+1; i++){
        colormap.push(color_map_2(i))
    }
    return colormap
}

function show_colormap(colormap){
    let colorCanvas = document.getElementById("colormap");
    const ctx = colorCanvas.getContext("2d");
    const width = colormap.length;
    colorCanvas.setAttribute("width", width);
    let imageData = ctx.getImageData(0,0,width,20);
    create_colormap_gradient(ctx,width,imageData,colormap)

}

function create_colormap_gradient(ctx,width,imageData,colormap){
    for (let x = 0; x < width; x++){
        let color = colormap[x];
        for (let y = 0; y < 20; y++){
            set_pixel(imageData,x,y,color[0],color[1],color[2],[width,20]);
        }
    }
    paint_canvas(imageData,ctx)
}