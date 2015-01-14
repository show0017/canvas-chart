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
}

function setDefaultStyles(context){
  //set default styles for canvas
  context.strokeStyle = "#333";	//colour of the lines
  context.lineWidth = 3;
  context.font = "bold 16pt Arial";
  context.fillStyle = "#900";	//colour of the text
  context.textAlign = "left";
}

function drawPieChart(values){
    var canvas = document.getElementById("pie-chart");
    var context = canvas.getContext("2d");

    setDefaultStyles(context);
    var cx = canvas.width/2;
    var cy = canvas.height/2;
    var radius = 100;
    var currentAngle = 0;

    var total = 0;
    for(var i=0; i<values.length; i++){
        total += values[i].value;
    }

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
        //put the canvas back to the original position
        context.restore();
        //update the currentAngle
        currentAngle = endAngle;
    }
}
