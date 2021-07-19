//codes to run D3 animation in Jupyter

%%javascript
require.config({
    paths: { 
        d3: 'https://d3js.org/d3.v5.min'
    }
});
$.getJSON("data.json", function(json) {
    var transitionMatrix = json
    var num = transitionMatrix.length
    const alpha = Array.from(Array(num)).map((e, i) => i + 65);
    const data = alpha.map((x) => String.fromCharCode(x));
    var currentState = 0;
    var pi = Math.PI //determine Pi
    var m = data.length; // number of states

    (function(element) {
        require(['d3'], function(d3) {
            var svg = d3.select(element.get(0))
                        .append('svg')
                        .attr('width', 750)
                        .attr('height', 750);

            function circleTransition(){
                var filter = svg.append("defs")
                    .append("filter")
                    .attr("id", "blur")
                    .append("feGaussianBlur")
                    .attr("stdDeviation", 2); 
                var timeCircle = svg.append("circle")
                    .attr("r", 40);
                
                var timeGlowCurrent = svg.append("circle")
                    .attr("filter", "url(#blur)");   
                
                var timeGlowNext = svg.append("circle")
                    .attr("filter", "url(#blur)");
                
                var movingCurrentState = svg.append("text")
                    .attr("font-size",0)
                    .attr("font-weight",500)
                    .attr('text-anchor','middle')
                
                var movingNextState = svg.append("text")
                    .attr("font-size",0)
                    .attr("font-weight",500)
                    .attr('text-anchor','middle')
                var text = svg.append("text")
                    .attr('x',650)
                    .attr('y',100)
                    .attr('font-size', 20)
                    .attr("font-weight",500)
                    .attr('text-anchor','middle')
                    .text("TO")
                
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
                    return "rgb("+num+",200,"+num2+")"});
        
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
                    var cx_current =340+200*Math.cos(currentState*2*pi/m)
                    var cy_current =260+200*Math.sin(currentState*2*pi/m)
                    var cx_next =340+200*Math.cos(nextState*2*pi/m)
                    var cy_next = 260+200*Math.sin(nextState*2*pi/m)
                  timeCircle
                    .style("opacity",0.5)
                    .attr("fill", "yellow")
                    .attr('cx', cx_current)      // position the circle at 40 on the x axis
                    .attr('cy',cy_current)
                    .transition()        // apply a transition
                    .ease(d3.easePoly)
                    .delay(200)
                    .duration(800)      // apply it over 2000 milliseconds
                    .attr('r',15)
                    .attr("fill", "orange")
                    .style("opacity",1.0)
                    .attr('cx', 340)     // move the circle to 920 on the x axis
                    .attr('cy',260)     // position the circle at 250 on the y axis
                    .transition()        // apply a transition
                    .duration(1000)      // apply it over 2000 milliseconds
                    .attr("fill", "yellow")
                    .attr('r',40)
                    .style("opacity",0.5)
                    .attr('cx', cx_next)      // position the circle at 40 on the x axis
                    .attr('cy', cy_next)
                    .on("end", repeat);  // when the transition finishes start again
              
                  timeGlowCurrent
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
              
                  timeGlowNext
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
                    
                  movingCurrentState
                    .attr('x',600)
                    .attr('y',100)
                    .attr('fill', function(d){
                        var num = (currentState+1)*255/m
                        var num2 = 255 - (currentState+1)*255/m
                        return "rgb("+num+",200,"+num2+")"})
                    .text(data[currentState])
                    .transition()
                    .duration(800)
                    .attr('font-size',40)
                    .transition()
                    .duration(800)
                    .delay(400)
                    .attr('font-size',0)
                    
                  movingNextState
                    .attr('x',700)
                    .attr('y',100)
                    .attr('fill', function(d){
                        var num = (nextState+1)*255/m
                        var num2 = 255 - (nextState+1)*255/m
                        return "rgb("+num+",200,"+num2+")"})
                    .text(data[nextState])
                    .transition()
                    .duration(800)
                    .attr('font-size',40)
                    .transition()
                    .delay(400)
                    .duration(800)
                    .attr('font-size',0)
                
                  text
                    .transition()
                    .duration(800)
                    .attr('fill','green')
                    .attr('font-size',30)
                    .transition()
                    .duration(800)
                    .delay(400)
                    .attr('font-size',20)
                    .attr('fill','palegreen')
                  currentState = nextState;
                };
            };
        circleTransition()})
    })(element);
});
