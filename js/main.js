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


var dataSegments = (function () {
    var dataArray = [];
    var sum = 0;
    var maxValue = -1;
    var minValue;
    var parseArray = function (values) {
        minValue = values[0].value;
        for(var i=0; i<values.length; i++){
            dataArray [i]= values[i].value;
            sum += dataArray[i];
            if (dataArray[i]> maxValue){
                maxValue = dataArray[i];
            }
            if (dataArray[i] < minValue){
                minValue = dataArray[i];
            }
        }

        console.debug("total = "+ sum);
        console.debug("max = "+ maxValue);
        console.debug("min = "+ minValue);
    };

    var getTotalValues =  function () {
        return sum;
    };

    var getMaxIndex =  function () {
        return dataArray.indexOf(maxValue);
    };

    var getMinIndex =  function () {
        return dataArray.indexOf(minValue);
    };

    return {
        parseArray : parseArray,
        getTotalValues : getTotalValues,
        getMaxIndex : getMaxIndex,
        getMinIndex : getMinIndex
    };

})();

/* Pie-Chart Functions*/
var PieChart = (function () {

    var canvas;
    var context;
    var radius = 100;

    var setDefaultStyles = function(){
      //set default styles for canvas
      context.strokeStyle = "#333";	//colour of the lines
      context.lineWidth = 3;
      context.font = "bold 12pt Arial";
      context.fillStyle = "#900";	//colour of the text
      context.textAlign = "left";
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
    };

    var wrapText = function(text, x , y, lineHeight){
        var words = text.split(' ');
        var line = '';
        var maxWidth = 70;

        for(var n = 0; n < words.length; n++) {
          var testLine = line + words[n] + ' ';
          var metrics = context.measureText(testLine);
          var testWidth = metrics.width;
          if (testWidth > maxWidth && n > 0) {
            context.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
          }
          else {
            line = testLine;
          }
        }
        context.fillText(line, x, y);
    };

    var addLabels = function(rotationAngle, cx, cy, textLabel){
        context.save();
        context.translate(cx, cy);

        /* Rotate text to be parallel to lines of Pie-Chart.*/
        if(rotationAngle < Math.PI/2){
            context.rotate(rotationAngle);
            cx = 4;
            cy = 0;
        }else if (rotationAngle < Math.PI){
            context.rotate(Math.PI + rotationAngle);
            cx = -70;
            cy = 0;
        }else if (rotationAngle < 3*Math.PI/2){
            context.rotate(Math.PI + rotationAngle);
            cx = -55;
            cy = 0;
        }else{
            context.rotate(rotationAngle);
            cx = 4;
            cy = 0;
        }

        context.textAlign = 'left';

        context.shadowColor = "black";
        context.shadowOffsetX = 3;
        context.shadowOffsetY = 3;
        context.shadowBlur = 7;

        /* Wrap text if it exceeds current line width.*/
        var textWidth = context.measureText(textLabel).width;
        if (textWidth > 90){
            var lineHeightInPixels = 14;
            wrapText(textLabel, cx, cy, lineHeightInPixels);
        }else{
            context.fillText(textLabel, cx , cy);
        }
        context.restore();
    };

    var draw = function (values) {
        canvas = document.getElementById("pie-chart");
        context = canvas.getContext("2d");
        setDefaultStyles();
        dataSegments.parseArray(values);

        var cx = canvas.width/2;
        var cy = canvas.height/2;
        var currentAngle = 0;
        var total = dataSegments.getTotalValues();
        var finalRadius;

        for(var i=0; i<values.length; i++){
            var pct = values[i].value/total;
            var colour = values[i].color;
            //console.log(colour);
            var endAngle = currentAngle + (pct * (Math.PI * 2));
            //draw the arc
            context.moveTo(cx, cy);
            context.beginPath();
            context.fillStyle = colour;
            switch(i){
                    case dataSegments.getMaxIndex():
                        finalRadius = 0.9 * radius;
                        break;
                    case dataSegments.getMinIndex():
                        finalRadius = 1.1 * radius;
                        break;
                    default:
                        finalRadius = radius;
            }
            context.arc(cx, cy, finalRadius, currentAngle, endAngle, false);
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

            /* Write text parallet to mid line*/
            addLabels(midAngle,dx,dy,values[i].label);

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
    var rectWidth = 90;
    var rectHeight = 30;
    var horizontalOffset = 20;
    var verticalOffset = 5;
    var canvas;
    var context;
    var radiusInnerCircle = 10;
    var numberOfInnerCircles = 10;
    var innerCircleOffset = 4;
    var verticalBarWidth = 4;

    /*set default styles for canvas*/
    var setDefaultStyles = function () {
      context.strokeStyle = "#333";	//colour of the lines
      context.lineWidth = 3;
      context.font = "10pt Arial";
      context.fillStyle = "#900";	//colour of the text
      context.textAlign = "center";
    };

    var getTotalValues = function (values){
        var sum = 0;
        for(var i=0; i<values.length; i++){
            sum += values[i].value;
        }

        return sum;
    };

    var drawRect = function(cx, cy, width, height){
        context.moveTo(cx, cy);
        context.beginPath();
        context.fillStyle = "#808080";
        context.rect(cx, cy, width, height);
        context.fill();
    };

    /* Draw indicator circle for each cheese type.*/
    var drawIndicatorRect = function(cy,color, labelText){
        var cx =  horizontalOffset;
        context.moveTo(cx, cy);
        context.beginPath();
        context.fillStyle = color;
        context.rect(cx, cy, rectWidth, rectHeight);
        //context.arc(cx, cy, indicatorCircleRadius, 0, 2*Math.PI, false);
        context.fill();

        context.textAlign = 'center';
        context.fillStyle = ("rgb(18,82,178)"===color)?"white":"black";
        context.fillText(labelText, cx+rectWidth/2,cy+ rectHeight/2);
    };

    var drawSmallerCircles = function(cx,cy, numOfCircles,fillColor){
        for(var i=0; i< numOfCircles; i++){
            context.moveTo(cx, cy);
            context.beginPath();
            context.fillStyle = fillColor;
            context.arc(cx, cy, radiusInnerCircle, 0, 2*Math.PI, false);
            context.fill();
            cx += 2*radiusInnerCircle + innerCircleOffset;
        }
    };

    var drawGrid = function (values){

        /*Draw first vertical bar.*/
        var verticalBarHeight = canvas.height - 2*verticalOffset;
        var cx = rectWidth + 2*horizontalOffset;
        var cy = verticalOffset;
        drawRect(cx, cy, verticalBarWidth, verticalBarHeight);

        /*draw horizontal bars as well as inner circles of the base grid.*/
        cx += verticalBarWidth;
        cy += rectHeight;
        var horizontalBarHeight = 1;
        var horizontalBarWidth = numberOfInnerCircles*2*radiusInnerCircle +
            (numberOfInnerCircles+1)*innerCircleOffset;
        for (var i=0; i<values.length; i++){
            drawRect(cx,cy,horizontalBarWidth,horizontalBarHeight );
            drawIndicatorRect(cy-rectHeight/2, values[i].color, values[i].label);
            drawSmallerCircles(cx+radiusInnerCircle+innerCircleOffset,
                               cy,
                               numberOfInnerCircles,
                               "#D0D0D0");
            cy += (2*rectHeight + verticalOffset);
        }

        /*Draw second vertical bar.*/
        cx += horizontalBarWidth;
        cy = verticalOffset;
        drawRect(cx, cy, verticalBarWidth, verticalBarHeight);
    };

    var drawFractionalCircle = function (cx,cy,fraction,fillColor){
        context.moveTo(cx,cy);
        context.beginPath();
        context.fillStyle = fillColor;
        context.arc(cx, cy, radiusInnerCircle, 0, 2*Math.PI*fraction, false);
        context.lineTo(cx, cy);
        context.fill();
    };

    var highlightCircles = function(numOfCompleteCircles, fraction, cy, fillColor){

        /*start of cx is fixed for all inner circles.*/
        var cx = rectWidth + 2*horizontalOffset +
            verticalBarWidth +innerCircleOffset + radiusInnerCircle;

        /* highlight completed circles.*/
        drawSmallerCircles(cx,cy,numOfCompleteCircles,fillColor);

        /* draw fraction circle */
        cx += (numOfCompleteCircles*(2*radiusInnerCircle + innerCircleOffset));
        drawFractionalCircle(cx,cy,fraction,fillColor);

    };

    var drawPercent = function(values){
        var total = getTotalValues(values);
        var cy = rectHeight + verticalOffset;
        for(var i=0; i<values.length ; i++){
            var pct = values[i].value/total;
            var color = values[i].color;
            var totalNumOfCircles = pct * numberOfInnerCircles;
            var numOfCompleteCircles = Math.floor(totalNumOfCircles);
            var fractionOfCircle     = totalNumOfCircles - numOfCompleteCircles;
            /*console.debug("value:"+values[i].value+"\n\tpct:"+pct+"\n\ttotalNumOfCircles:"+
                          totalNumOfCircles+"\n\tnumOfCompleteCircles:"+numOfCompleteCircles+
                          "\n\tfractionOfCircle:"+fractionOfCircle);*/
            highlightCircles(numOfCompleteCircles, fractionOfCircle, cy, color);
            cy += (2*rectHeight + verticalOffset);
        }

    };

    var draw = function (values) {
        canvas = document.getElementById("temp-chart");
        context = canvas.getContext("2d");
        setDefaultStyles();

        /*draw vertical/horizontal bars as well as the inner circles for basic chart grid.*/
        drawGrid(values);

        /*apply percentage of values on the chart*/
        drawPercent(values);
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
