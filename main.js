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

    substraction(c){
        this.a -= c.a
        this.b -= c.b
        return this
    }

    difference(c){
        let newA = c.a - this.a;
        let newB = c.b - this.b;
        let result = new complex(newA, newB)
        return result
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
    mandelbrotCanvas.addEventListener("click", (event) => select_pixel(event,size,mandelbrotImageData,mandelbrotCTX,colormap))
}

/// Setup the page
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

/// Functions to draw on the canvas
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

/// Functions to test how pixels need to be colored
function check_pixel(a, c, precision){
    let z = new complex(a.a, a.b);
    let k = 0;
    while( z.module_carre()<=4) {
        z= z.square().addition(c);
        if (k++ > precision) return -1;
    }
    return k;
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
    return new complex(-2 + 2.7 * (x / size[0]) , -(7 / 6) + (14 / 6) * (y / size[1]) );
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

function select_pixel(event,size, mandelbrotImageData,mandelbrotCTX, colormap){
    const bounding = mandelbrotCanvas.getBoundingClientRect();
    const x = Math.floor(event.clientX - bounding.left);
    const y = Math.floor(event.clientY - bounding.top);
    const a = get_positional_mandelbrot_complex(x,y,size)
    
    switch (check_radio_value()){
        case "juliaRadio":
            console.log("Generating a julia");
            create_julia(a,colormap);
            break;
        
        case "zoomRadio":
            console.log("Zooming in")
            zoom_in(x, y, a, 100, size,colormap)
            break;
        
        default:
            console.log("Doing nothing")
            break;
    }

    console.log("clicked pixel x:", x, " y:",y);
}

function check_radio_value() {
    let selected;
    let options = document.getElementsByName('clickOptions');
    for (let i = 0; i < options.length; i++){
        if (options[i].checked){
            selected = options[i].id;
        }
    }
    return selected;
}


function create_julia(a,colormap){
    const juliaCanvas = document.getElementById("julia")
    const juliaCTX = juliaCanvas.getContext("2d")
    const size = [juliaCanvas.getAttribute("width"), juliaCanvas.getAttribute("height")]
    let juliaImageData = juliaCTX.getImageData(0, 0, size[0], size[1])
    let precision = 200
    generate_julia(a, size, juliaImageData, juliaCTX, precision,colormap)
}

function generate_julia(a,size,imageData,ctx,precision,colormap){
    for (let y = 0; y <= size[1]; y++){
        for (let x = 0; x <= size[0]; x++){
            let r, g, b;
            let result = check_julia(a,x,y,size,precision);
            if (result == -1){
                r = 0;
                g = 0;
                b = 0;
            } else {
                let color = colormap[result];
                r = color[0] ; g = color[1] ; b = color[2] ;
            }
            set_pixel(imageData,x,y,r,g,b,size);
            }  
        }   
    paint_canvas(imageData, ctx);
}

function zoom_in(x, y, a, zone, size, colormap){
    
    let newSize = [size[0], size[0]];
    mandelbrotCanvas.setAttribute("height", newSize[1]);
    const ctx = mandelbrotCanvas.getContext("2d")
    let imageData = ctx.getImageData(0, 0, newSize[0], newSize[1])
    
    let b = get_positional_mandelbrot_complex(x + zone, y + zone, size);

    genetate_zoomed(a, b, newSize, ctx, imageData, colormap); 
}

function genetate_zoomed(a, b, newSize, ctx, imageData, colormap){
    for (let y = 0; y <= newSize[1]; y++){
        for (let x = 0; x <= newSize[0]; x++){
            let c = new complex( a.a + (b.a - a.a) * (x/newSize[0]),  a.b + (b.b - a.b) * (y/newSize[1])) ;
            let red, green, blue;
            let result = check_mandelbrot(c, 256);
            if (result == -1){
                red = 0;
                green = 0;
                blue = 0;
            } else {
                let color = colormap[result];
                red = color[0];
                green = color[1];
                blue = color[2];
            
            }
            set_pixel(imageData,x,y,red,green,blue,newSize);
    }
   
    }
    paint_canvas(imageData, ctx);
}

///Testing colormaps
function color_map(p,precision){
    let r=0 ; let g=0 ; let b=0;
    r = Math.floor((p / precision) * 255);
    g = Math.floor((-0.05) * (p-127)**2 + 255)
    b = Math.floor((precision - p) / precision * 255);
    return [r ,g ,b]
}

function create_colormap(precision){
    let colormap = []
    /*
    for (let i = 0; i<=precision+1; i++){
        colormap.push(color_map(i,precision))
    }
    */

    colormap = [
    [255, 255, 255], [255, 255, 253], [255, 255, 251], [255, 255, 249], [255, 255, 247], [255, 255, 245], [255, 255, 243], [255, 255, 241], [255, 255, 239], [255, 255, 237], [255, 255, 235], [255, 255, 233], [255, 255, 231], [255, 255, 229], [255, 255, 227], [255, 255, 225], [255, 255, 223], [255, 255, 221], [255, 255, 219], [255, 255, 217], [255, 255, 215], [255, 255, 213], [255, 255, 211], [255, 255, 209], [255, 255, 207], [255, 255, 205], [255, 255, 203], [255, 255, 201], [255, 255, 199], [255, 255, 197], [255, 255, 195], [255, 255, 193], [255, 255, 191], [255, 255, 189], [255, 255, 187], [255, 255, 185], [255, 255, 183], [255, 255, 181], [255, 255, 179], [255, 255, 177], [255, 255, 175], [255, 255, 173], [255, 255, 172], [255, 255, 170], [255, 255, 168], [255, 255, 166], [255, 255, 164], [255, 255, 162], [255, 255, 160], [255, 255, 158], [255, 255, 156], [255, 255, 154], [255, 255, 152], [255, 255, 150], [255, 255, 148], [255, 255, 146], [255, 255, 144], [255, 255, 142], [255, 255, 140], [255, 255, 138], [255, 255, 136], [255, 255, 134], [255, 255, 132], [255, 255, 130], [255, 255, 128], [255, 253, 126], [255, 251, 124], [255, 249, 122], [255, 247, 120], [255, 245, 118], [255, 242, 116], [255, 241, 114], [255, 238, 112], [255, 237, 110], [255, 235, 108], [255, 233, 106], [255, 231, 104], [255, 229, 102], [255, 227, 100], [255, 225, 98], [255, 223, 96], [255, 221, 94], [255, 219, 92], [255, 217, 90], [255, 215, 88], [255, 213, 86], [255, 211, 84], [255, 209, 81], [255, 207, 79], [255, 205, 77], [255, 203, 75], [255, 201, 73], [255, 199, 71], [255, 197, 69], [255, 195, 67], [255, 193, 65], [255, 191, 63], [255, 189, 61], [255, 187, 59], [255, 185, 57], [255, 183, 55], [255, 181, 53], [255, 179, 51], [255, 177, 49], [255, 175, 47], [255, 173, 45], [255, 171, 43], [255, 169, 41], [255, 167, 39], [255, 165, 37], [255, 163, 35], [255, 161, 33], [255, 159, 31], [255, 157, 29], [255, 155, 27], [255, 153, 25], [255, 151, 23], [255, 149, 21], [255, 147, 19], [255, 145, 17], [255, 143, 15], [255, 141, 13], [255, 138, 11], [255, 136, 9], [255, 134, 7], [255, 132, 5], [255, 131, 3], [255, 129, 1], [254, 126, 0], [252, 125, 0], [250, 122, 0], [248, 121, 0], [246, 118, 0], [244, 116, 0], [242, 115, 0], [240, 113, 0], [238, 111, 0], [236, 109, 0], [234, 107, 0], [232, 105, 0], [230, 102, 0], [228, 100, 0], [227, 98 ,0], [225, 97 ,0], [223, 94 ,0], [221, 93 ,0], [219, 91 ,0], [217, 89 ,0], [215, 87 ,0], [213, 84 ,0], [211, 83 ,0], [209, 81 ,0], [207, 79 ,0], [205, 77 ,0], [203, 75 ,0], [201, 73 ,0], [199, 70 ,0], [197, 68 ,0], [195, 66 ,0], [193, 64 ,0], [191, 63 ,0], [189, 61 ,0], [187, 59 ,0], [185, 57 ,0], [183, 54 ,0], [181, 52 ,0], [179, 51 ,0], [177, 49 ,0], [175, 47 ,0], [174, 44 ,0], [172, 42 ,0], [170, 40 ,0], [168, 39 ,0], [166, 37 ,0], [164, 34 ,0], [162, 33 ,0], [160, 31 ,0], [158, 29 ,0], [156, 27 ,0], [154, 25 ,0], [152, 22 ,0], [150, 20 ,0], [148, 18 ,0], [146, 17 ,0], [144, 14 ,0], [142, 13 ,0], [140, 11 ,0], [138, 9 ,0], [136, 6 ,0], [134, 4 ,0], [132, 2 ,0], [130, 0 ,0], [128, 0 ,0], [126, 0 ,0], [124, 0 ,0], [122, 0 ,0], [120, 0 ,0], [118, 0 ,0], [116, 0, 0], [114, 0, 0], [112, 0, 0], [110, 0, 0], [108, 0, 0], [106, 0, 0], [104, 0, 0], [102, 0, 0], [100, 0, 0], [98 ,0 ,0], [96 ,0 ,0], [94, 0, 0], [92, 0, 0], [90, 0, 0], [88, 0, 0], [86, 0, 0], [83, 0, 0], [81, 0, 0], [79, 0, 0], [77, 0, 0], [75, 0, 0], [73, 0, 0], [71, 0, 0], [69, 0, 0], [67, 0, 0], [65, 0, 0], [63, 0, 0], [61, 0, 0], [59, 0, 0], [57, 0, 0], [55, 0, 0], [53, 0, 0], [51, 0, 0], [49, 0, 0], [47, 0, 0], [45, 0, 0], [43, 0, 0], [41, 0, 0], [39, 0, 0], [37, 0, 0], [35, 0, 0], [33, 0, 0], [31, 0, 0], [29, 0, 0], [26, 0, 0], [24, 0, 0], [22, 0, 0], [20, 0, 0], [18, 0, 0], [16, 0, 0], [14, 0, 0], [12, 0, 0], [10, 0, 0], [8 ,0 ,0], [6 ,0 ,0], [4 ,0 ,0], [3 ,0 ,0], [2 ,0 ,0], [1 ,0 ,0], [0 ,0 ,0]
    ]
    
    return colormap.reverse()
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