

var width = 400;
var height = 400;
var hexColor = '#0000FF';

function SetAbsolutePosition(element, x,y,width,height){
    element.style.position = 'absolute';
    element.style.left = x+'px';
    element.style.width = width+'px';
    element.style.top = y+'px';
    element.style.height = height+'px';
}

function ColorPicker(x,y,width,height){
    var input = document.createElement('input');
    input.type = 'color';
    SetAbsolutePosition(input, x,y,width,height);
    input.value = hexColor;
    input.oninput = ()=>hexColor = input.value;
    return input;
}

function Button(x,y,width,height,innerHTML,onclick){
    var button = document.createElement('button');
    SetAbsolutePosition(button,x,y,width,height);
    button.innerHTML = innerHTML;
    button.onclick = onclick;
    return button;
}

function ToolboxDiv(){
    var div = document.createElement('div');
    SetAbsolutePosition(div, 0,0,100,height);
    div.style.backgroundColor = 'rgb(200,200,200)';
    div.style.border = '2px solid rgb(200,200,220)';
    div.style.borderRightWidth = '0px';
    div.appendChild(Button(0,0,100,50,'circle',()=>shape='circle'));
    div.appendChild(Button(0,50,100,50,'rect', ()=>shape='rect'));
    div.appendChild(ColorPicker(0,100,100,50));
    return div;
}

function SVGImage(s){
    var div = document.createElement('div');
    SetAbsolutePosition(div, 100,0,width,height);
    div.style.border = '2px solid rgb(200,200,220)';
    return div;
}

var objects = [];
var shape = 'circle';
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
    if(shape == 'circle'){
        return {shape:'circle', x:dragStartX, y:dragStartY, r:Distance(dragStartX, dragStartY, dragEndX, dragEndY), fill:hexColor};

    }
    else if(shape == 'rect'){
        var rect = AbsRectSize({x:dragStartX, y:dragStartY, width:dragEndX-dragStartX, height:dragEndY-dragStartY});
        rect.shape = 'rect';
        rect.fill = hexColor;
        return rect;
    }
}

function CircleToSVG(circle){
    return '<circle cx="'+circle.x+'" cy="'+circle.y+'" r="'+circle.r+'" fill="'+circle.fill+'" />';
}

function RectToSVG(rect){
    return '<rect x="'+rect.x+'" y="'+rect.y+'" width="'+rect.width+'" height="'+rect.height+'" fill="'+rect.fill+'" />';
}

function ObjToSVG(o){
    if(o.shape == 'circle'){
        return CircleToSVG(o);
    }
    else if(o.shape == 'rect'){
        return RectToSVG(o);
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
document.body.appendChild(ToolboxDiv());
document.body.appendChild(imageDiv);
Draw();

function MouseDown(e){
    console.log(e.target);
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