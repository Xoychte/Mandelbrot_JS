"use strict";
let canvas;

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
    canvas = document.getElementById("viewport");
    const ctx = canvas.getContext("2d");
    const size = [Number(document.getElementById("viewport").getAttribute("width")), Number(document.getElementById("viewport").getAttribute("height"))];
    let imageData = ctx.getImageData(0,0,size[0],size[1]);  
    let precision = 200;
    generate_initial(size,imageData, ctx, precision);

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


function check_mandelbrot(c, precision){
    let z = new complex(0,0);
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

function generate_initial(size,imageData,ctx,precision){
    for (let y = 0; y <= size[1]; y++){
        for (let x = 0; x <= size[0]; x++){
            let c = new complex(-2+2.7*(x/size[0]),-(7/6)+(14/6)*(y/size[1]));
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
            set_pixel(imageData,x,y,r,g,b,size);
            }  
        }   
    
    paint_canvas(imageData, ctx);
}

