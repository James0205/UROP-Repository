// require is how jupyter manages javascript libraries
require.config({
    paths: {
        d3: 'https://d3js.org/d3.v6.min'
    }
});

require(["d3"], function(d3) {
    //console.log(d3.version);

    // size of plot
    const width = %%width%%;
    const height = %%height%%;

    // node radius
    const node_radius = %%noderadius%%;
    // link distance before weight is applied
    const link_distance = %%linkdistance%%;
    // collision exclusion scale
    const collision_scale = %%collisionscale%%;
    // link width scale
    const link_width_scale = %%linkwidthscale%%;
    // link charge
    const link_charge = %%linkcharge%%;

    // links and nodes data
    const links = %%links%%;
    const nodes = %%nodes%%; 
    
    // boolean if zoom is disabled
    const zoomBoolean = %%zoomBoolean%%
    
    // boolean if colour is given
    const colourGiven = %%colourGiven%%;
    const colourArray = %%colourArray%%;

    if (%%colourGiven%% == true){
        var types = Array.from(new Set(nodes.map(d => d.id))),
            color = d3.scaleOrdinal(types,colourArray);
    }else{
        var types = Array.from(new Set(nodes.map(d => d.id))),
            color = d3.scaleOrdinal(types,d3.schemeCategory10);
    };

    // create simulation
    const simulation = d3.forceSimulation(nodes)
                        .force("link", d3.forceLink().links(links).distance(d => link_distance-d.weight*150))
                        .force("charge", d3.forceManyBody().strength(link_charge))
                        .force('collision', d3.forceCollide().radius(collision_scale * node_radius))
                        .force("center", d3.forceCenter(width / 2, height / 2))
                        .stop();
    
    // allow simulation to run
    simulation.tick(%%ticks%%);

    // define d3.zoom                
    var zoom = d3.zoom()
                 .extent([[0, 0], [width, height]])
                 .scaleExtent([0.2, 10])
                 .on("zoom", zoomed);
    
            //set zoom for model
    function zoomed({transform}) {
                    node.attr("transform",transform); 
                    link.attr("transform",transform);
                    group.attr("transform",transform);
                    };
            
    // select HTML element and attach SVG to it
    const svg = d3.select("#d3-container-%%unique-id%%")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(zoom);
    
    // setting zoom booleans to disable zoom
    if (zoomBoolean) {
            svg.call(zoom);
        } else {
            svg.on('.zoom', null);
        }
    
    // add arrow marker to links
    const arrows = svg.attr("class", "arrow")
                        .selectAll('.arrows') //set arrow marker
                        .data(types)
                        .enter()
                        .append("g")
         
    //for loops away from self
    const arrow_away = arrows.append("defs")
                       .append("marker")
                        .attr("id", d => `arrow-${d}`)
                        .attr("viewBox", "0 -10 20 20")
                        .attr("refX", 1)
                        .attr("refY", 0)
                        .attr("markerWidth", 3)
                        .attr("markerHeight", 3)
                        .attr("orient", "auto-start-reverse")
                        .append("path")
                        .attr("fill", color)
                        .attr("d", "M0,-10L20,0L0,10");
       
    //for self loops
    const arrow_self = arrows.append("defs")
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
    
    
    // add links to svg element
    const link = svg.append("g")
            .attr("class", "links")
            .selectAll("path")
            .data(links)
            .enter().append("path")
                .attr('stroke-width',d => 2+link_width_scale*d.weight)
                .attr('opacity',0.3)
                .attr('marker-end', markerType)
                .attr('d',curvepath1)
                .attr('d',curvepath2)
                .attr('stroke', d => color(d.source.id))
                .on('mouseover', motionInLink)
                .on('mouseout', motionOutLink);

    const node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(nodes)
            .enter().append("g");

    // circular nodes
    const circle = node.append("circle")
            .attr("r", node_radius)
            .attr('fill',d => color(d.id))
            .attr("cx", d => d.x)
            .attr("cy", d => d.y)
            .on('mouseover', motionInNode)
            .on('mouseout', motionOutNode);

    // svg text labels for each node
    const text = node.append("text")
            .attr("dx", -3.5)
            .attr("dy", 3.5)
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .text(d => d.id[0]);

    const image = node.append("svg:image") //set image on nodes if exist
            .attr("xlink:href",d => d.image)
            .attr("id", d =>`image-${d.id}`)
//             .attr("x", -10)
//             .attr("y", -10)
            .attr("x", d => d.x-10)
            .attr("y", d => d.y-10)
            .attr("height", 20)
            .attr("width", 20)
            .on('mouseover', motionInNode)
            .on('mouseout', motionOutNode);
    
    const group = svg.append("g");
    
    //choosing marker types based on loop style
    function markerType(d){ //set different marker for self loop
            if (d.source == d.target) {
            return `url(${new URL(`#arrow2-${d.source.id}`,location)})`
            } else {
            return `url(${new URL(`#arrow-${d.source.id}`,location)})`      
            }};
    
    //hover-in animation for Links
    function motionInLink(d){
            var dxx = 0,probability = 0,
                dyy = 0,length = 0;
                
            d3.select(this).transition()
                           .attr('opacity', function(d){
                                probability = Math.round((d.weight + Number.EPSILON) * 100) / 100
                                length = 10 + 8 * probability.toString().length
                                if(d.source == d.target){ //set position arguments
                                   dxx = ((d.source.x+d.target.x)/2)+40
                                   dyy = ((d.source.y+d.target.y)/2)-40}else{
                                   dxx = (d.source.x+d.target.x)/2
                                   dyy = (d.source.y+d.target.y)/2-10  
                                   }return 1})
                           .attr('stroke-width',2+link_width_scale);

            group.append("rect")
               .attr("rx", 6)
               .attr("ry", 6)
               .attr('height',20)
               .attr('width',length)
               .attr('id','indicatorRect')
               .attr('fill','black')
               .attr('opacity',0.5)
               .attr('x',dxx-length/2)
               .attr('y',dyy)

            group.append("text")
               .attr("id", 'probabilityshow')
               .attr('font-size',15)
               .attr('fill','white')
               .attr('x',dxx)
               .attr('y',dyy+15)
               .attr('text-anchor','middle')
               .text(probability)
            };
        
    //hover-out animation for Links
    function motionOutLink(d) {
            d3.select(this).transition()
                           .attr('opacity', 0.3)
                           .attr('stroke-width',d => 2+link_width_scale*d.weight);
            d3.select('#probabilityshow').remove(); //remove elements when mouse out
            d3.select('#indicatorRect').remove();
            };
    
    //hover animation for Nodes
    function motionInNode(d){
            var name = "", length = 0,
                locx = 0 , locy = 0;
                
            d3.select(this).transition()
              .attr("x",d=>d.x-15)
              .attr("y",d=>d.y-15)
              .attr('width',30)
              .attr('height',function(d){
                  name = d.id, locx = d.x, locy = d.y
                  length = 10+10*d.id.length
                  return 30});
                                                 
            group.append("rect")
               .attr("rx", 6)
               .attr("ry", 6)
               .attr('height',20)
               .attr('width',length)
               .attr('id','stateRect')
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
                           .attr("x",d=>d.x-10)
                           .attr("y",d=>d.y-10)
                           .attr('height',20)
                           .attr('width',20);
            d3.select('#stateshow').remove();
            d3.select('#stateRect').remove();
            };
    
    //function to define link path 1.0
    function curvepath1(d){
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx **2 + dy **2);
            return "M" + d.source.x + "," + d.source.y + "A" + dr + "," 
                       + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
            };

    //function to define link path 2.0
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
                   m2= this.getPointAtLength(r+2); //leaving end

               var dx = m.x - d.source.x,
                   dy = m.y - d.source.y,
                   dr = Math.sqrt(dx * dx + dy * dy);

               return "M" + m2.x + "," + m2.y + "A" + dr + "," +
                      dr + " 0 0,1 " + m.x + "," + m.y;
               }};
    
    //setting initial zoom level
    function lapsedZoomFit() {
               var bounds = svg.node().getBBox(),
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
    }lapsedZoomFit();
    //return svg.node();
});
