//codes to run D3 animation in Jupyter

%%javascript
//setting up d3
require.config({
    paths: { 
        d3: 'https://d3js.org/d3.v5.min'
    }
});
//getting data from file as json
$.getJSON("data.json", function(json) {
    var transitionMatrix = json
    var num = transitionMatrix.length
    const alpha = Array.from(Array(num)).map((e, i) => i + 65);
    const data = alpha.map((x) => String.fromCharCode(x)); //list of states
    var currentState = 0;
    var pi = Math.PI //determine Pi
    var m = data.length; // number of states

    (function(element) {
        require(['d3'], function(d3) {              //set up SVG element
            var svg = d3.select(element.get(0))
                        .append('svg')
                        .attr('width', 750)
                        .attr('height', 750);

            function circleTransition(){            //looping visualisation
                var filter = svg.append("defs")     //blur filter for glow effect
                    .append("filter")
                    .attr("id", "blur")
                    .append("feGaussianBlur")
                    .attr("stdDeviation", 2); 
                var timeCircle = svg.append("circle")       //transition circle
                    .attr("r", 40);
                var timeGlowCurrent = svg.append("circle")  //glow ring for current state
                    .attr("filter", "url(#blur)");   
                var timeGlowNext = svg.append("circle")     //glow ring for next state
                    .attr("filter", "url(#blur)"); 
                var g = svg.selectAll('.someClass')
                    .data(data)
                    .enter()
                    .append("g")
                    .attr("transform", function(d,i) {
                      return "translate(" + (300+ 200*Math.cos(i*2*pi/m)) + "," + (200*Math.sin(i*2*pi/m)+250) + ")";
                    });
        
                    g.append("circle")
                      .attr("cx", 40)
                      .attr("cy", 10)
                      .attr("r",30)
                      .style("fill", function(d,i){
                var num = (i+1)*255/m
                var num2 = 255 - (i+1)*255/m
                    return "rgb("+num+",200,"+num2+")"});   //for colours
        
                    g.append("text")
                      .style("fill", "white")
                      .attr("x",40)
                      .attr("y",17.5)
                      .attr("text-anchor","middle")
                      .attr("font-size",20)
                      .attr("font-weight",500)
                      .text(function(d) {
                        return d;
                      })
                repeat();
                function repeat() {
                    var i = currentState;
                    var nextStates = transitionMatrix[i];
                    var nextState = -1;
                    var rand = Math.random();
                    var total = 0;
                    for(var j = 0; j < nextStates.length; j++) {
                        total += nextStates[j];
                    if(rand < total) {
                        nextState = j;
                        break;
                        }
                    }
                    var cx_current =340+200*Math.cos(currentState*2*pi/m)   //define positions of current and next states
                    var cy_current =260+200*Math.sin(currentState*2*pi/m)
                    var cx_next =340+200*Math.cos(nextState*2*pi/m)
                    var cy_next = 260+200*Math.sin(nextState*2*pi/m)
                  timeCircle
                    .style("opacity",0.5)
                    .attr("fill", "yellow")
                    .attr('cx', cx_current)      // position the circle at current state
                    .attr('cy',cy_current)
                    .transition()        // apply a transition
                    .ease(d3.easePoly)  // apply transition ease
                    .delay(200)         // apply delay for 200 ms
                    .duration(800)      // apply it over 800 ms
                    .attr('r',15)       // radius of circle
                    .attr("fill", "orange")
                    .style("opacity",1.0)
                    .attr('cx', 340)     // move the circle to 340 on the x axis
                    .attr('cy',260)     // position the circle at 260 on the y axis
                    .transition()        // apply a transition
                    .duration(1000)      // apply it over 1000 milliseconds
                    .attr("fill", "yellow")     //changed colour
                    .attr('r',40)               //changed radius
                    .style("opacity",0.5)
                    .attr('cx', cx_next)      // position the circle to next state
                    .attr('cy', cy_next)
                    .on("end", repeat);  // when the transition finishes, repeat
              
                  timeGlowCurrent   //glow indicator of current state
                    .style("opacity",0)
                    .attr("fill","white")
                    .attr('cx', cx_current)
                    .attr('cy',cy_current)
                    .attr('r',40)
                    .transition()
                    .ease(d3.easeLinear)
                    .duration(200)
                    .attr("fill", "yellow")
                    .style("opacity",0.3)
                    .attr('r',45)
                    .transition()
                    .delay(1600)
                    .duration(200)
                    .attr("fill", "white")
                    .style("opacity",0)
                    .attr('r',60)
              
                  timeGlowNext      //glow indicator of next state
                    .style("opacity",0)
                    .attr("fill","white")
                    .attr('cx', cx_next)
                    .attr('cy',cy_next)
                    .attr('r',40)
                    .transition()
                    .ease(d3.easeLinear)
                    .duration(200)
                    .attr("fill", "pink")
                    .style("opacity",0.3)
                    .attr('r',45)
                    .transition()
                    .delay(1600)
                    .duration(200)
                    .attr("fill", "white")
                    .style("opacity",0)
                    .attr('r',60)
              
                  currentState = nextState; //set next state as current state
                };
            };
        circleTransition()}) //call function
    })(element);
});
