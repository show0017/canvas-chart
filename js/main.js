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

    PieChart.draw(data["segments"]);
    TempChart.draw(data["segments"]);
}


/* Pie-Chart Functions*/
var PieChart = (function () {

    var canvas;
    var context;
    var radius = 100;

    var setDefaultStyles = function(){
      //set default styles for canvas
      context.strokeStyle = "#333";	//colour of the lines
      context.lineWidth = 3;
      context.font = "bold 16pt Arial";
      context.fillStyle = "#900";	//colour of the text
      context.textAlign = "left";
    };

    var getTotalValues = function (values){
        var sum = 0;
        for(var i=0; i<values.length; i++){
            sum += values[i].value;
        }

        return sum;
    };

    var drawInnerCircle = function(cx, cy){
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
    var draw = function (values) {
        canvas = document.getElementById("pie-chart");
        context = canvas.getContext("2d");
        setDefaultStyles();

        var cx = canvas.width/2;
        var cy = canvas.height/2;
        var currentAngle = 0;
        var total = getTotalValues(values);

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
        drawInnerCircle(cx, cy);
    };

    return {
        draw: draw
    };

})();

/* Temp-Chart Functions */
var TempChart = (function () {
    var indicatorCircleRadius = 30; //25,30
    var offset = 5; //15,5
    var canvas;
    var context;
    var radiusInnerCircle = 15;
    var numberOfInnerCircles = 10;

    var setDefaultStyles = function () {
      //set default styles for canvas
      context.strokeStyle = "#333";	//colour of the lines
      context.lineWidth = 3;
      context.font = "bold 16pt Arial";
      context.fillStyle = "#900";	//colour of the text
      context.textAlign = "left";
    };

    var drawRect = function(cx, cy, width, height){
        context.moveTo(cx, cy);
        context.beginPath();
        context.fillStyle = "grey";
        context.rect(cx, cy, width, height);
        context.fill();
    };

    var drawIndicatorCircle = function (cy,color){
        /* Draw indicator circle for each cheese type.*/
        var cx = indicatorCircleRadius + offset;
        context.moveTo(cx, cy);
        context.beginPath();
        context.fillStyle = color;
        context.arc(cx, cy, indicatorCircleRadius, 0, 2*Math.PI, false);
        context.fill();
    };

    var drawBars = function (values){
        var verticalBarWidth = 4;
        var verticalBarHeight = canvas.height - 2*offset;
        var cx = 2*(indicatorCircleRadius + offset);
        var cy = offset;

        /*Draw first vertical bar.*/
        drawRect(cx, cy, verticalBarWidth, verticalBarHeight);

        /*draw horizontal bars.*/
        cx += verticalBarWidth;
        cy += indicatorCircleRadius;
        var horizontalBarHeight = 1;
        var horizontalBarWidth = numberOfInnerCircles* (2*radiusInnerCircle);
        for (var i=0; i<values.length; i++){
            drawRect(cx,cy,horizontalBarWidth,horizontalBarHeight );
            drawIndicatorCircle(cy,values[i].color);
            cy += (2*indicatorCircleRadius + offset);
        }


        /*Draw second vertical bar.*/
        cx += (numberOfInnerCircles* (2*radiusInnerCircle));
        cy = offset;
        drawRect(cx, cy, verticalBarWidth, verticalBarHeight);


    };

    var draw = function (values) {
      canvas = document.getElementById("temp-chart");
      context = canvas.getContext("2d");
      setDefaultStyles();

      /*draw vertical/horizontal bars for the smaller circles.*/
      drawBars(values);
    };

  return {
    draw: draw
  };

})();
/* 400px width = 60px(2R of circle indicator) +
                 2*5px(right/left offsets around circle indicator) +
                 2*4px (width of vertical rectangle bars)+
                 2*2px (right offset of first vertical bar + left offset of second vertical bar)
                 10*30px (2R of inner-circles multiplied by 10 times)
                 = 378px*/
