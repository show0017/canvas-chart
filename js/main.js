document.addEventListener("DOMContentLoaded", init);

function init(){
    console.debug("page is loaded successfully");

    loadJsonData("data/cheese.json");
}

function loadJsonData (path){
//    var jsonScriptTag = document.createElement("script");
//    jsonScriptTag.addEventListener("load", onLoadJson );
//    document.querySelector("body").appendChild(jsonScriptTag);
//    jsonScriptTag.setAttribute("src",path);

    var xhr = $.ajax({
        url: path,
        datatype: "json",
        type:"GET"
    }).
    done(onLoadJson).
    fail(function(){console.error("***** Failed to load json data from server *****"+xhr.status); });
}

function onLoadJson(data){
    console.log(data);

    drawPieChart(data["segments"]);
    drawTempChart(data["segments"]);
}

function setDefaultStyles(context){
  //set default styles for canvas
  context.strokeStyle = "#333";	//colour of the lines
  context.lineWidth = 3;
  context.font = "bold 16pt Arial";
  context.fillStyle = "#900";	//colour of the text
  context.textAlign = "left";
}

function getTotalValues(values){
    var sum = 0;
    for(var i=0; i<values.length; i++){
        sum += values[i].value;
    }

    return sum;
}
/* Pie-Chart Functions*/
function drawPieChart(values){
    var canvas = document.getElementById("pie-chart");
    var context = canvas.getContext("2d");

    setDefaultStyles(context);
    var cx = canvas.width/2;
    var cy = canvas.height/2;
    var radius = 100;
    var currentAngle = 0;

    var total = getTotalValues(values);
    //the difference for each wedge in the pie is arc along the circumference
    //we use the percentage to determine what percentage of the whole circle
    //the full circle is 2 * Math.PI radians long.
    //start at zero and travelling clockwise around the circle
    //start the center for each pie wedge
    //then draw a straight line out along the radius at the correct angle
    //then draw an arc from the current point along the circumference
    //stopping at the end of the percentage of the circumference
    //finally going back to the center point.
    for(var i=0; i<values.length; i++){
        var pct = values[i].value/total;
        var colour = values[i].color;
        //console.log(colour);
        var endAngle = currentAngle + (pct * (Math.PI * 2));
        //draw the arc
        context.moveTo(cx, cy);
        context.beginPath();
        context.fillStyle = colour;
        context.arc(cx, cy, radius, currentAngle, endAngle, false);
        context.lineTo(cx, cy);
        context.fill();


        //Now draw the lines that will point to the values
        context.save();
        context.translate(cx, cy);//make the middle of the circle the (0,0) point
        context.strokeStyle = "#0CF";
        context.lineWidth = 1;
        context.beginPath();
        //angle to be used for the lines
        var midAngle = (currentAngle + endAngle)/2;//middle of two angles
        context.moveTo(0,0);//this value is to start at the middle of the circle
        //to start further out...
        var dx = Math.cos(midAngle) * (0.8 * radius);
        var dy = Math.sin(midAngle) * (0.8 * radius);
        context.moveTo(dx, dy);
        //ending points for the lines
        var dx = Math.cos(midAngle) * (radius + 30); //30px beyond radius
        var dy = Math.sin(midAngle) * (radius + 30);
        context.lineTo(dx, dy);
        context.stroke();
        context.fillText(values[i].label, dx , dy);
        //put the canvas back to the original position
        context.restore();
        //update the currentAngle
        currentAngle = endAngle;
    }

    drawInnerCircle(cx, cy,context, radius);
}

function drawInnerCircle(cx, cy,context, radius){
    context.beginPath();
    context.arc(cx, cy, 0.5*radius, 0, 2 * Math.PI, false);
    context.fillStyle = 'white';
    context.fill();

    context.textAlign = 'center';
    context.fillStyle = "black";
    context.fillText("Cheese", cx,cy);

    //put the canvas back to the original position
    context.restore();

}

/* Temp-Chart Functions */
function drawTempChart(values){
    var canvas = document.getElementById("temp-chart");
    var context = canvas.getContext("2d");
    setDefaultStyles(context);
    var radius = 30; //25,30
    var offset = 5; //15,5
    var cx = radius + offset;
    var cy = radius + offset;

    /*draw vertical/horizontal bars for the smaller circles.*/
    drawBars(canvas,context, cx, cy ,offset);

    var total = getTotalValues(values);
    for(var i=0; i<values.length; i++){
        var pct = values[i].value/total;
        var colour = values[i].color;

        /* Draw indicator circle for each cheese type.*/
        context.moveTo(cx, cy);
        context.beginPath();
        context.fillStyle = colour;
        context.arc(cx, cy, radius, 0, 2*Math.PI, false);
        context.fill();

        /*increment cy to draw next circle to the bottom of the current one. */
        cy += (2*radius + offset);

    }

}

function drawBars(canvas,context, cx , cy, verticalOffset){
    var rectWidth = 4;
    var rectHeight = canvas.height - 2*verticalOffset;
    var cxRect = 2*cx;
    /*Draw first vertical bar.*/
    drawRect(context, cxRect, verticalOffset, rectWidth, rectHeight);


    var radiusInnerCircle = 15;
    var numberOfInnerCircles = 10;
    /*Draw second vertical bar.*/
    cxRect += (numberOfInnerCircles* (2*radiusInnerCircle))
    drawRect(context, cxRect, verticalOffset, rectWidth, rectHeight);

    /*Draw horizontal bar*/
    cxRect = 2*cx+rectWidth;
    rectHeight = 4;
    rectWidth = numberOfInnerCircles* (2*radiusInnerCircle);
    drawRect(context,cxRect,cy,rectWidth,rectHeight );

}

function drawRect(context, cx, cy, width, height){
    context.moveTo(cx, cy);
    context.beginPath();
    context.fillStyle = "grey";
    context.rect(cx, cy, width, height);
    context.fill();
}

/* 400px width = 60px(2R of circle indicator) +
                 2*5px(right/left offsets around circle indicator) +
                 2*4px (width of vertical rectangle bars)+
                 2*2px (right offset of first vertical bar + left offset of second vertical bar)
                 10*30px (2R of inner-circles multiplied by 10 times)
                 = 378px*/
