//codes to run D3 animation in Jupyter

%%javascript
(function(element) {
    require(['d3'], function(d3) {
        var svg = d3.select(element.get(0))
                    .append('svg')
                    .attr('width', 500)
                    .attr('height', 500)
        function circleTransition(){        
            var timeCircle = svg.append("circle")
                .attr("fill", "steelblue")
                .attr("r", 20);
            repeat();
            function repeat() {
              timeCircle
                .attr('cx', 40)      // position the circle at 40 on the x axis
                .attr('cy', 250)     // position the circle at 250 on the y axis
                .transition()        // apply a transition
                .duration(2000)      // apply it over 2000 milliseconds
                .attr('cx', 450)     // move the circle to 920 on the x axis
                .attr('cy',450)
                .transition()        // apply a transition
                .duration(2000)      // apply it over 2000 milliseconds
                .attr('cx', 40)      // return the circle to 40 on the x axis
                .attr('cy',250)
                .on("end", repeat);  // when the transition finishes start again
            };
        };
    circleTransition()})
})(element);

//New working code
%%javascript
var pi = Math.PI //determine Pi
var data = ["A","B","C","D","E","F","G","H","I","J","K","L"]; //json file from sample function
var m = data.length; // number of states
(function(element) {
    require(['d3'], function(d3) {
        var svg = d3.select(element.get(0))
                    .append('svg')
                    .attr('width', 750)
                    .attr('height', 500);
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
              .style("fill", "turquoise");

        g.append("text")
              .style("fill", "white")
              .attr("x",40)
              .attr("y",17.5)
              .attr("text-anchor","middle")
              .attr("font-size",20)
              .text(function(d) {
                return d;
              })
        function circleTransition(){        
            var timeCircle = svg.append("circle")
                .attr("fill", "pink")
                .attr("r", 15);

            repeat();
            function repeat() {
              timeCircle
                .attr('cx', 340+200*Math.cos(1*2*pi/m))      // position the circle at 40 on the x axis
                .attr('cy',200*Math.sin(1*2*pi/m)+260)     // position the circle at 250 on the y axis
                .transition()        // apply a transition
                .ease(d3.easePoly)
                .duration(1000)      // apply it over 2000 milliseconds
                .attr('cx', 340)     // move the circle to 920 on the x axis
                .attr('cy',260)
                .transition()        // apply a transition
                .duration(1000)      // apply it over 2000 milliseconds
                .attr('cx', 340+200*Math.cos(1*2*pi/m))      // return the circle to 260 on the x axis
                .attr('cy',200*Math.sin(1*2*pi/m)+260)
                .on("end", repeat);  // when the transition finishes start again
            };
        };
    circleTransition()})
})(element);
