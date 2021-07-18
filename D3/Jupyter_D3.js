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
