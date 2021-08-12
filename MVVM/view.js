require.undef('view');

require(['viewmodel'], function(viewmodel) {
define('view', ['d3'], function (d3) {
    function draw(container,nodes,links) {

            //importing data from viewmodel
            var nodesData = viewmodel(nodes,links)[0],
                linksData = viewmodel(nodes,links)[1];            

            var width = 1000, height = 750;  
        
            var zoom = d3.zoom()
                        .extent([[0, 0], [width, height]])
                        .scaleExtent([0.2, 10])
                        .on("zoom", zoomed);
            
            //set zoom for model
            function zoomed({transform}) {
                        group.attr("transform",transform);            
                        };
            
            var svg = d3.select(container)
                        .append('svg')
                        .attr('width', width)
                        .attr('height', height)
                        .attr("cursor", "grab")
                        .call(zoom);
            
            //bind elements to svg
            var group = svg.append("g");
        
            //binding colour to element
            var types = Array.from(new Set(linksData.map(d => d.type))),
                color = d3.scaleOrdinal(types,d3.schemeCategory10);
        
            var arrows = svg.selectAll('.arrows') //set arrow marker
                        .data(types)
                        .enter()
                        .append("g")
                        
                 arrows.append("defs")
                       .append("marker")
                        .attr("id", d =>`arrow-${d}`)
                        .attr("viewBox", "0 -10 20 20")
                        .attr("refX", 1)
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
        
            //choosing marker types based on loop style
            function markerType(d){ //set different marker for self loop
                        if (d.source == d.target) {
                        return `url(${new URL(`#arrow2-${d.type}`,location)})`
                        } else {
                        return `url(${new URL(`#arrow-${d.type}`,location)})`      
                        }};
        
            var link = group.append('g') // links
                       .selectAll('link')
                       .data(linksData)
                       .enter()
                       .append('path')
                       .attr('opacity',0.3)
                       .attr('marker-end', markerType)
                       .attr('d',curvepath1)
                       .attr('d',curvepath2)
                       .attr('stroke', d => color(d.type))
                       .attr('fill','none')
                       .attr('stroke-width',function(d){
                            return 2+4*d.stroke
                        })
                       .on('mouseover', motionInLink)
                       .on('mouseout', motionOutLink);
        
            //hover animation for Links
            function motionInLink(d){
                          var dxx = 0,dyy = 0,probability = 0;
                
                          d3.select(this).transition()
                                         .attr('opacity', function(d){
                                               probability = d.stroke
                                               if(d.source == d.target){ //set position arguments
                                                  dxx = ((d.source.x+d.target.x)/2)+40
                                                  dyy = ((d.source.y+d.target.y)/2)-30}else{
                                                  dxx = (d.source.x+d.target.x)/2
                                                  dyy = (d.source.y+d.target.y)/2  
                                                  }return 1})
                                                   .attr('stroke-width',6);

                                  group.append("circle")
                                       .attr('r',15)
                                       .attr('id','indicatorCircle')
                                       .attr('fill','black')
                                       .attr('opacity',0.5)
                                       .attr('cx',dxx)
                                       .attr('cy',dyy)

                                  group.append("text")
                                       .attr("id", 'probabilityshow')
                                       .attr('font-size',15)
                                       .attr('fill','white')
                                       .attr('x',dxx)
                                       .attr('y',dyy+5)
                                       .attr('text-anchor','middle')
                                       .text(probability)
                        };
        
            function motionOutLink(d) {
                        d3.select(this).transition()
                                                   .attr('opacity', 0.3)
                                                   .attr('stroke-width',function(d){
                                                        return 2+4*d.stroke
                                                        });
                                    d3.select('#probabilityshow').remove(); //remove elements when mouse out
                                    d3.select('#indicatorCircle').remove();
                        };
       
            var node = group.append("g")
                        .attr("stroke", "#fff")
                        .attr("stroke-width", 1.5)
                        .selectAll("circle")
                        .data(nodesData)
                        .enter()
                        .append('g')
                        .attr("transform", d => `translate(${d.x},${d.y})`);
            
                   node.append("circle")
                        .attr('fill',d => color(d.type))
                        .attr('stroke','white')
                        .attr('stroke-width',2)
                        .attr("stroke-linecap", "round")
                        .attr("stroke-linejoin", "round")
                        .attr('r', 10)
                        .on('mouseover', motionInNode)
                        .on('mouseout', motionOutNode);
        
                  node.append("text") //text on nodes
                       .attr("x", 0)
                       .attr("y", "0.31em")
                       .attr('font-size',10)
                       .attr('fill', 'white')
                       .attr('stroke-width',0.6)
                       .attr('text-anchor','middle')
                       .text(d => d.name[0]);
        
                  node.append("svg:image") //set image on nodes if exist
                        .attr("xlink:href",d => d.image)
                        .attr("id", d =>`image-${d.name}`)
                        .attr("x", -10)
                        .attr("y", -10)
                        .attr("height", 20)
                        .attr("width", 20)
                        .on('mouseover', motionInNode)
                        .on('mouseout', motionOutNode);
            
            //hover animation for Nodes
            function motionInNode(d){
                         var name = "", length = 0,
                             locx = 0 , locy = 0;
                
                         d3.select(this).transition()
                                        .attr("x",-15)
                                        .attr("y",-15)
                                        .attr('width',30)
                                        .attr('height',function(d){
                                            name = d.name, locx = d.x, locy = d.y
                                            length = 10+10*d.name.length
                                            return 30});
                                                 
                                   group.append("rect")
                                        .attr("rx", 6)
                                        .attr("ry", 6)
                                        .attr('height',20)
                                        .attr('width',length)
                                        .attr('id','stateCircle')
                                        .attr('fill','black')
                                        .attr('opacity',0.5)
                                        .attr('x',locx-length/2)
                                        .attr('y',locy+22)

                                   group.append("text")
                                       .attr("id", 'stateshow')
                                       .attr('font-size',15)
                                       .attr('fill','white')
                                       .attr('x',locx)
                                       .attr('y',locy+37.5)
                                       .attr('text-anchor','middle')
                                       .text(name)
                        };
        
            function motionOutNode(d) {
                        d3.select(this).transition()
                                       .attr("x",-10)
                                       .attr("y",-10)
                                       .attr('height',20)
                                       .attr('width',20);
                        d3.select('#stateshow').remove();
                        d3.select('#stateCircle').remove();
                        };
        
            //functions to define link paths
            function curvepath1(d){
                        var dx = d.target.x - d.source.x,
                            dy = d.target.y - d.source.y,
                            dr = Math.sqrt(dx **2 + dy **2);
                        return "M" + d.source.x + "," + d.source.y + "A" + dr + "," 
                                + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
                        };
            
            function curvepath2(d){
                        if (d.source == d.target) {
                            var xRotation = -45,
                                largeArc = 1,
                                sweep = 1,
                                drx = 15,
                                dry = 15;
                            var dx1 = d.source.x+10,
                                dy1 = d.source.y+10,
                                dx2 = d.target.x+10,
                                dy2 = d.target.y-10;

                            return "M" + dx1 + "," + dy1 + "A" + drx + "," + dry + " " + 
                                   xRotation + ","+ largeArc + "," + 0 + " " + dx2 + "," + dy2;
                        } else {
                        // length of current path
                        var pl = this.getTotalLength(),
                        // adjust r for suitable radius
                        r = 25.6568, 
                        // position close to where path intercepts circle
                        m = this.getPointAtLength(pl - r), //approaching end
                        m2= this.getPointAtLength(r); //leaving end

                       var dx = m.x - d.source.x,
                           dy = m.y - d.source.y,
                           dr = Math.sqrt(dx * dx + dy * dy);

                       return "M" + m2.x + "," + m2.y + "A" + dr + "," +
                               dr + " 0 0,1 " + m.x + "," + m.y;
                       }};
        
            //setting initial zoom level
            function delayZoomFit() {
                        var zoomFunction = setTimeout(lapsedZoomFit, 0);
                        };

            function lapsedZoomFit() {
                        var bounds = group.node().getBBox(),
                            midX = bounds.x+bounds.width/2,
                            midY = bounds.y+bounds.height/2;
                        var scale = (0.75) / Math.max(bounds.width / width, bounds.height / height);
                        var translateX = width / 2 - scale * midX;
                        var translateY = height / 2 - scale * midY;
                        svg.transition().duration(0).call(
                                  zoom.transform, d3.zoomIdentity
                                      .translate(translateX, translateY)
                                      .scale(scale)
                        );
            }delayZoomFit();
    };
return draw;
});
});