require.undef('visualisation');

define('visualisation', ['d3'], function (d3) {
    function draw(container,transitionMatrix,nodes,links,transitionTime) {
            var currentState = 0,
                probability = 0, //link probability placeholder
                arrx = [], //array of x coordinates for hovering animation refreshed on every tick
                arry = [], //array of y coordinates for hovering animation refreshed on every tick
                width = 1000, //of svg
                height = 750, //of svg
                types = Array.from(new Set(links.map(d => d.type))), //map link source to type
                color = d3.scaleOrdinal(types,d3.schemeCategory10); //set colour
            
            var svg = d3.select(element.get(0)) //define svg
                        .append('svg')
                        .attr('width', width)
                        .attr('height', height)
                        .attr("cursor", "grab");
            
            
            var arrows = svg.selectAll('.arrows') //set arrow marker
                        .data(types)
                        .enter()
                        .append("g")
                        
                arrows.append("defs")
                        .append("marker")
                        .attr("id", d =>`arrow-${d}`)
                        .attr("viewBox", "0 -10 20 20")
                        .attr("refX", 0)
                        .attr("refY", 0)
                        .attr("markerWidth", 3)
                        .attr("markerHeight", 3)
                        .attr("orient", "auto-start-reverse")
                      .append("path")
                        .attr("fill", color)
                        .attr("d", "M0,-10L20,0L0,10");
            
                arrows.append("defs")
                        .append("marker")
                        .attr("id", d =>`arrow2-${d}`)
                        .attr("viewBox", "0 -10 20 20")
                        .attr("refX", 10)
                        .attr("refY", 2)
                        .attr("markerWidth", 3)
                        .attr("markerHeight", 3)
                        .attr("orient", "auto-start-reverse")
                      .append("path")
                        .attr("fill", color)
                        .attr("d", "M0,-10L20,0L0,10");
           
                svg.call(d3.zoom()
                        .extent([[0, 0], [width, height]]) //fixed
                        .scaleExtent([0.2, 3]) //scale of zoom
                        .on("zoom", zoomed));
            
            function zoomed({transform}) { //set zoom for model
                        gg.attr("transform",transform);
                        };
            
            var simulation = d3.forceSimulation(nodes)
                        .force('charge', d3.forceManyBody().strength(-200))
                        .force('center', d3.forceCenter(width/2, height/2))
                        .force('collision', d3.forceCollide().radius(20))
                        .force('link', d3.forceLink().links(links).distance(function(d){
                            return 180-d.stroke*150}))
                        .on('tick', ticked)
                        .tick(200);
            
            var  gg = svg.append('g')
                        
            var link = gg.append('g') // links
                       .selectAll('link')
                       .data(links)
                       .enter()
                       .append('path')
                       .attr('stroke', d => color(d.type))
                       .attr('fill','none')
                       .attr('stroke-width',function(d){
                            return 2+4*d.stroke
                        })
                       .on('mouseover', function (d,i) {
                                var dxx = 0;
                                var dyy = 0;
                                   d3.select(this).transition()
                                                   .attr('opacity', function(d){
                                                        probability = d.stroke
                                                        if(d.source == d.target){ //set position arguments
                                                        dxx = arrx[d.index]+40
                                                        dyy = arry[d.index]-30}else{
                                                        dxx = arrx[d.index]+20
                                                        dyy = arry[d.index]   
                                                        }
                                                        return 1})
                                                   .attr('stroke-width',6);
                           
                                   gg.append("circle")
                                        .attr('r',15)
                                        .attr('id','indicatorCircle')
                                        .attr('fill','black')
                                        .attr('opacity',0.5)
                                        .attr('cx',dxx)
                                        .attr('cy',dyy)

                                   gg.append("text")
                                       .attr("id", 'probabilityshow')
                                       .attr('font-size',15)
                                       .attr('fill','white')
                                       .attr('x',dxx)
                                       .attr('y',dyy+5)
                                       .attr('text-anchor','middle')
                                       .text(probability)
                        })
                        .on('mouseout', function (d) {
                                    d3.select(this).transition()
                                                   .attr('opacity', 0.3)
                                                   .attr('stroke-width',function(d){
                                                        return 2+4*d.stroke
                                                        });
                                    d3.select('#probabilityshow').remove(); //remove elements when mouse out
                                    d3.select('#indicatorCircle').remove();
                        });
    
            
            var node = gg.append("g")
                       .selectAll('circle')
                       .data(nodes)
                       .enter()
                       .append("g")
            
                   node.append('circle') // nodes
                       .attr("id", d =>`circle-${d}`)
                       .attr('fill',d => color(d.type))
                       .attr('stroke','white')
                       .attr('stroke-width',2)
                       .attr("stroke-linecap", "round")
                       .attr("stroke-linejoin", "round")
                       .attr('r', 10)
                       .on('mouseover', motionIn)
                        .on('mouseout', motionOut);
            
                   node.append("text") //text on nodes
                       .attr("x", 0)
                       .attr("y", "0.31em")
                       .attr('font-size',8)
                       .attr('fill', 'white')
                       .attr('stroke-width',2)
                       .attr('font-weight','bold')
                       .attr('text-anchor','middle')
                       .text(d => d.name[0]);
        
                   node.append("svg:image") //set image on nodes if exist
                        .attr("xlink:href",d => d.image)
                        .attr("x", -10)
                        .attr("y", -10)
                        .attr("height", 20)
                        .attr("width", 20)
                        .on('mouseover', motionIn)
                        .on('mouseout', motionOut);
        
                
            var transitionCircle = gg.append("circle") //circle in motion
                    .attr("fill","black")
                    .attr("cx",width/2)
                    .attr("cy",height/2)
                    .attr("opacity",0.3)
                    .attr("stroke","white")
                    .attr("stroke-width",1)
                    .attr("r", 10);
            
            function markertype(d){ //set different marker for self loop
                        if (d.source == d.target) {
                      return `url(${new URL(`#arrow2-${d.type}`,location)})`
                        } else {
                      return `url(${new URL(`#arrow-${d.type}`,location)})`      
                        }};
            
            function curvepath1(d){ //link path 1.0
                            var dx = d.target.x - d.source.x,
                                dy = d.target.y - d.source.y,
                                dr = Math.sqrt(dx **2 + dy **2);
                              return "M" + d.source.x + "," + d.source.y + "A" + dr + "," 
                              + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
                          };
            
            function curvepath2(d){ //link path 2.0
                        if (d.source == d.target) {
                            var xRotation = -45;
                            var  largeArc = 1;
                            var  sweep = 1;
                            var drx = 15;
                            var dry = 15;
                            var dx1 = d.source.x+10,
                                dy1 = d.source.y+10,
                                dx2 = d.target.x+10,
                                dy2 = d.target.y-10;

                             return "M" + dx1 + "," + dy1 + "A" + drx + "," 
                                 + dry + " " + xRotation + ","+ largeArc + "," + 0 + " " + 
                                 dx2 + "," + dy2;
                        } else {
                      // length of current path
                      var pl = this.getTotalLength(),
                        // radius of circle plus marker head
                        r = 20 + 5.6568, 
                        // position close to where path intercepts circle
                        m = this.getPointAtLength(pl - r),
                        m2= this.getPointAtLength(r);

                       var dx = m.x - d.source.x,
                        dy = m.y - d.source.y,
                        dr = Math.sqrt(dx * dx + dy * dy);

                       return "M" + m2.x + "," + m2.y + "A" + dr + "," + dr 
                           + " 0 0,1 " + m.x + "," + m.y;
                  }};
                         
           function motionIn(d){ //animation for nodes
                                var name = "",
                                    length = 0,
                                    locx = 0,
                                    locy = 0;
                                   d3.select(this).transition()
                                                  .attr("x",-15)
                                                  .attr("y",-15)
                                                  .attr('width',30)
                                                  .attr('height',function(d){
                                                       name = d.name
                                                       locx = d.x
                                                       locy = d.y
                                                       length = 10+10*d.name.length
                                                       return 30});
                                                   
                           
                                   gg.append("rect")
                                        .attr("rx", 6)
                                        .attr("ry", 6)
                                        .attr('height',20)
                                        .attr('width',length)
                                        .attr('id','stateCircle')
                                        .attr('fill','black')
                                        .attr('opacity',0.5)
                                        .attr('x',locx-length/2)
                                        .attr('y',locy+22)

                                   gg.append("text")
                                       .attr("id", 'stateshow')
                                       .attr('font-size',15)
                                       .attr('fill','white')
                                       .attr('x',locx)
                                       .attr('y',locy+37.5)
                                       .attr('text-anchor','middle')
                                       .text(name)
            };
            
            function motionOut(d) { //animation for nodes
                                    d3.select(this).transition()
                                                   .attr("x",-10)
                                                   .attr("y",-10)
                                                   .attr('height',20)
                                                   .attr('width',20);
                                    d3.select('#stateshow').remove();
                                    d3.select('#stateCircle').remove();
                        };
        
            
            function ticked() {
                node.attr("transform", d => `translate(${d.x},${d.y})`);

                link.attr('marker-end', markertype)
                    .attr('fill', 'none')
                    .attr("opacity",function(d){
                    arrx.push((d.source.x+d.target.x)/2); //update average x position of 2 linked nodes
                    arry.push((d.source.y+d.target.y)/2); //update average y position of 2 linked nodes
                    return 0.3})
                    .attr("d", curvepath1)
                    .attr("d", curvepath2);
            };
    
            repeat();
            function repeat() {
                var i = currentState;
                var nextStates = transitionMatrix[i];
                var nextState = -1;
                var rand = Math.random();
                var total = 0;
                for(var j = 0; j < nextStates.length; j++) {
                    total += nextStates[j];  // generating next state
                if(rand < total) {
                    nextState = j;
                    break;
                }}
                
                var path = svg.append("path")
                .style("stroke", "none")
                .style("fill", "none")
                .attr("d", function(){
                    if (currentState == nextState) {
                      var xRotation = -45;
                            var  largeArc = 1;
                            var  sweep = 1;
                            var drx = 15;
                            var dry = 15;
                            var dx1 = nodes[currentState].x,
                                dy1 = nodes[currentState].y,
                                dx2 = nodes[nextState].x,
                                dy2 = nodes[nextState].y-0.1;

                             return "M" + dx1 + "," + dy1 + "A" + drx + "," 
                                 + dry + " " + xRotation + ","+ largeArc + "," + 0 + " " + 
                                 dx2 + "," + dy2;
                        } else {
                          var dx = nodes[nextState].x - nodes[currentState].x,
                            dy = nodes[nextState].y - nodes[currentState].y,
                            dr = Math.sqrt(dx **2 + dy **2);
                          return "M" + nodes[currentState].x + "," + nodes[currentState].y 
                          + "A" + dr + "," + dr + " 0 0,1 " + nodes[nextState].x + "," 
                          + nodes[nextState].y;
                  }})

                transitionCircle  //animations
                    .transition()
                    .ease(d3.easeBounce)
                    .duration(transitionTime/15)
                    .attr('r',5)
                    .attr('x',nodes[currentState].x)
                    .attr('y',nodes[currentState].y)
                    .transition()
                    .ease(d3.easeLinear)
                    .duration(transitionTime*10/15)
                    .tween("pathTween",function(){return pathTween(path)})
                    .attr('r',5)
                    .transition()
                    .ease(d3.easeBounce)
                    .duration(transitionTime*4/15)
                    .attr('x',nodes[nextState].x)
                    .attr('y',nodes[nextState].y)
                    .attr('r',10)
                    .on("end", repeat);
                
                function pathTween(path){
                    var length = path.node().getTotalLength(); // Get the length of the path
                    var r = d3.interpolate(0, length); //Set up interpolation from 0 to the path length
                    return function(t){
                        var point = path.node().getPointAtLength(r(t)); // Get the next point along the path
                        d3.select(this) // Select the circle
                        .attr("cx", point.x) // Set the cx
                        .attr("cy", point.y) // Set the cy
                    }
                }
                currentState = nextState;
            };
    }
    return draw;
});
