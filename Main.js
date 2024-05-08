

var width = 400;
var height = 400;
var toolbar = {};
toolbar.layoutY = 0;
toolbar.fill = '#0000FF';
toolbar.stroke = '#000000';
toolbar.strokeWidth = 0;
toolbar.shape = 'circle';

function SetAbsolutePosition(element, x,y,width,height){
    element.style.position = 'absolute';
    element.style.left = x+'px';
    element.style.width = width+'px';
    element.style.top = y+'px';
    element.style.height = height+'px';
}

function ColorPicker(varname){
    var input = document.createElement('input');
    input.type = 'color';
    input.value = toolbar[varname];
    input.oninput = ()=>toolbar[varname] = input.value;
    return input;
}

function NumberBox(varname){
    var input = document.createElement('input');
    input.type = 'number';
    input.value = toolbar[varname];
    input.oninput = ()=>toolbar[varname] = input.value;
    return input;
}

function Button(innerHTML,onclick){
    var button = document.createElement('button');
    button.innerHTML = innerHTML;
    button.onclick = onclick;
    return button;
}

function AddElement(element, sizex=100, sizey=25){
    toolbar.div.appendChild(element);
    SetAbsolutePosition(element, 0, toolbar.layoutY, sizex, sizey);
    toolbar.layoutY+=25;
}

function ToolbarDiv(){
    var div = document.createElement('div');
    toolbar.div = div;
    SetAbsolutePosition(div, 0,0,100,height);
    div.style.backgroundColor = 'rgb(200,200,200)';
    div.style.border = '2px solid rgb(200,200,220)';
    div.style.borderRightWidth = '0px';
    AddElement(Button('circle',()=>toolbar.shape='circle'));
    AddElement(Button('rect', ()=>toolbar.shape='rect'));
    AddElement(Button('ellipse', ()=>toolbar.shape='ellipse'));
    AddElement(Button('line', ()=>toolbar.shape='line'));
    AddElement(ColorPicker('fill'));
    AddElement(NumberBox('strokeWidth'), 90, 20);
    AddElement(ColorPicker('stroke'));
    return div;
}

function SVGImage(){
    var div = document.createElement('div');
    SetAbsolutePosition(div, 100,0,width,height);
    div.style.border = '2px solid rgb(200,200,220)';
    return div;
}

var objects = [];
var imageDiv = SVGImage();
var mousex = 0;
var mousey = 0;
var dragStartX = 0;
var dragStartY = 0;
var dragEndX = 0;
var dragEndY = 0;
var dragging = false;

function AbsRectSize(rect){
    var width = Math.abs(rect.width);
    var height = Math.abs(rect.height);
    var x = rect.x;
    var y = rect.y;
    if(rect.width<0){
        x+=rect.width;
    }
    if(rect.height<0){
        y+=rect.height;
    }
    return {x,y,width,height};
}

function RectContains(rect,x,y){
    return (x>=rect.left && y>=rect.top && x<=rect.right && y<=rect.bottom);
}

function Distance(x,y,x2,y2){
    return Math.sqrt((x2-x)*(x2-x) + (y2-y)*(y2-y));
}

function CreateObject(){
    function SetFillAndStroke(obj){
        obj.fill = toolbar.fill;
        obj.strokeWidth = toolbar.strokeWidth;
        obj.stroke = toolbar.stroke;
    }
    if(toolbar.shape == 'circle'){
        var circle = {shape:'circle', x:dragStartX, y:dragStartY, r:Distance(dragStartX, dragStartY, dragEndX, dragEndY)};
        SetFillAndStroke(circle);
        return circle;
    }
    else if(toolbar.shape == 'rect'){
        var rect = AbsRectSize({x:dragStartX, y:dragStartY, width:dragEndX-dragStartX, height:dragEndY-dragStartY});
        rect.shape = 'rect';
        SetFillAndStroke(rect);
        return rect;
    }
    else if(toolbar.shape == 'ellipse'){
        var ellipse = {
            shape:'ellipse',
            cx:(dragStartX+dragEndX)/2,
            cy:(dragStartY+dragEndY)/2,
            rx:Math.abs(dragEndX-dragStartX)/2,
            ry:Math.abs(dragEndY-dragStartY)/2,
        };
        SetFillAndStroke(ellipse);
        return ellipse;
    }
    else if(toolbar.shape == 'line'){
        return {shape:'line', x1:dragStartX, y1:dragStartY, x2:dragEndX, y2:dragEndY, stroke:toolbar.stroke, strokeWidth:toolbar.strokeWidth};
    }
}

function FillAndStrokeToSVG(obj){
    return 'fill="'+obj.fill+'" stroke="'+obj.stroke+'" stroke-width="'+obj.strokeWidth+'"';
}

function CircleToSVG(circle){
    return '<circle cx="'+circle.x+'" cy="'+circle.y+'" r="'+circle.r+'" '+FillAndStrokeToSVG(circle)+' />';
}

function RectToSVG(rect){
    return '<rect x="'+rect.x+'" y="'+rect.y+'" width="'+rect.width+'" height="'+rect.height+'" '+FillAndStrokeToSVG(rect)+' />';
}

function EllipseToSVG(ellipse){
    return '<ellipse cx="'+ellipse.cx+'" cy="'+ellipse.cy+'" rx="'+ellipse.rx+'" ry="'+ellipse.ry+'" '+FillAndStrokeToSVG(ellipse)+' />';
}

function LineToSVG(line){
    return '<line x1="'+line.x1+'" y1="'+line.y1+'" x2="'+line.x2+'" y2="'+line.y2+'" stroke="'+line.stroke+'" stroke-width="'+line.strokeWidth+'" />';
}

function ObjToSVG(o){
    if(o.shape == 'circle'){
        return CircleToSVG(o);
    }
    else if(o.shape == 'rect'){
        return RectToSVG(o);
    }
    else if(o.shape == 'ellipse'){
        return EllipseToSVG(o);
    }
    else if(o.shape == 'line'){
        return LineToSVG(o);
    }
}

function Draw(){
    var svg = '<svg width="'+width+'" height="'+height+'">';
    for(var o of objects){
        svg+=ObjToSVG(o);
    }
    if(dragging){
        svg+=ObjToSVG(CreateObject());;
    }
    svg+='</svg>';
    imageDiv.innerHTML = svg;
}
document.body.appendChild(ToolbarDiv());
document.body.appendChild(imageDiv);
Draw();

function MouseDown(e){
    var rect = imageDiv.getBoundingClientRect();
    if(RectContains(rect, e.clientX, e.clientY)){
        mousex = e.clientX - rect.left;
        mousey = e.clientY - rect.top; 
        dragging = true;
        dragStartX = mousex;
        dragStartY = mousey;
        dragEndX = mousex;
        dragEndY = mousey;
        Draw();
    }
}

function MouseUp(e){
    if(dragging){
        objects.push(CreateObject());
        Draw();
        dragging = false;
    }
}

function MouseMove(e){
    var rect = imageDiv.getBoundingClientRect();
    mousex = e.clientX - rect.left;
    mousey = e.clientY - rect.top; 
    if(dragging){
        dragEndX = mousex;
        dragEndY = mousey;
        Draw();
    }
}

function KeyDown(e){
    if(e.key == 'Escape'){
        if(objects.length>0){
            objects.splice(objects.length-1);
            Draw();
        }
    }
}

document.addEventListener('mousedown', MouseDown);
document.addEventListener('mouseup', MouseUp);
document.addEventListener('mousemove', MouseMove);
document.addEventListener('keydown', KeyDown);