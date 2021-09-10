// require is how jupyter manages javascript libraries
require.config({
    paths: {
        d3: 'https://d3js.org/d3.v6.min'
    }
});

// require(["d3","save-svg-as-png"], function(d3,saveSvgAsPng) {
// require(["d3","file-saver"], function(d3,FileSaver) {

require(["d3"], function(d3) {

//     console.log(d3.version);

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

    // links, nodes and dates data
    const linksData = %%links%%;
    const nodesData = %%nodes%%;
    const date_list = %%date_list%%;
    
    //initial data set selected
    var links = linksData[0]; 
    var nodes = nodesData[0];

    // boolean if zoom is disabled
    const zoomBoolean = %%zoomBoolean%%;
    
    // define colour
    const colourArray = %%colourArray%%;

    if (colourArray == null){
        var types = Array.from(new Set(nodes.map(d => d.id))),
            colour = d3.scaleOrdinal(types,d3.schemeCategory10);
    }else{
        var types = Array.from(new Set(nodes.map(d => d.id))),
            colour = d3.scaleOrdinal(types,colourArray);
    };
         
    // define coordinates array
    const coordinates = %%coordinates%%;
    
    // run simulation to append positions onto nodes if coordinates not given
    if (coordinates == null){
        const simulation = d3.forceSimulation(nodesData[0],d=>d.id)
                        .force("link", d3.forceLink().links(linksData[0],d=>d.id)
                               .distance(d => link_distance-d.weight*150)
                               .strength(function(d){
                                            if (d.weight<=0){return 0} //strength adjusted to 0 for 0 probabilities
                                            else{return 1}}))
                        .force("charge", d3.forceManyBody().strength(link_charge))
                        .force('collision', d3.forceCollide().radius(collision_scale * node_radius))
                        .force("center", d3.forceCenter(width / 2, height / 2))
                        .stop();
    
        // allow simulation to run for set duration
        simulation.tick(%%ticks%%);
    }else{
        // append positions if coordinates given
        for (let i = 0; i < nodes.length; i++) {
                  nodes[i].x = coordinates[i][0];
                  nodes[i].y = coordinates[i][1];
                }
            
        // update link sources and targets
        for (let i = 0; i < links.length; i++) {
                  links[i].source = nodes[links[i].source];
                  links[i].target = nodes[links[i].target];
                }
        }
                    
    // select HTML element and attach SVG to it
    var svg = d3.select("#d3-container-%%unique-id%%")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("id","SVG");     
    
    // define d3.zoom                
    const zoom = d3.zoom()
                 .extent([[0, 0], [width, height]])
                 .scaleExtent([0.2, 10])
                 .on("zoom", zoomed);
    
    //set zoom for model
    function zoomed({transform}) {
                    node.attr("transform",transform); 
                    link.attr("transform",transform);
                    group.attr("transform",transform);
                    };
    
    // setting zoom booleans to disable zoom
    if (zoomBoolean) {
            svg.call(zoom);
        } else {
            svg.on('.zoom', null);
        }
    
    // <ARROWS> //
    // add arrow marker to links
    const arrows = svg.selectAll('.arrows') //set arrow marker
                        .data(types)
                        .enter();
         
    //for loops away from self
    const arrow_away = arrows.append("defs")
                       .attr("class", "arrow")
                       .append("marker")
                        .attr("id", d => `arrow-${d}`)
                        .attr("viewBox", "0 -10 20 20")
                        .attr("refX", 1)
                        .attr("refY", 0)
                        .attr("markerWidth", 3)
                        .attr("markerHeight", 3)
                        .attr("orient", "auto-start-reverse")
                        .append("path")
                        .attr("fill", colour)
                        .attr("d", "M0,-10L20,0L0,10");
       
    //for self loops
    const arrow_self = arrows.append("defs")
                       .attr("class", "arrow")
                       .append("marker")
                        .attr("id", d =>`arrow2-${d}`)
                        .attr("viewBox", "0 -10 20 20")
                        .attr("refX", 10)
                        .attr("refY", 2)
                        .attr("markerWidth", 3)
                        .attr("markerHeight", 3)
                        .attr("orient", "auto-start-reverse")
                      .append("path")
                        .attr("fill", colour)
                        .attr("d", "M0,-10L20,0L0,10"); 
    // <ARROWS END> //

    // <LINKS> //
    // set threshold for links
    var threshold = 0;
    
    // add links to svg element
    const link = svg.append("g")
            .attr("class", "links")
            .selectAll(".connections")
            .data(links,d=> d.id)
            .enter().append("g");
    
    // create visual links
    var path = link.append("path")
                .attr('class','connections')
                .attr('id',d=>d.source.id+"path")
                .attr('fill','none')
                .attr('stroke-width',function(d){
                    if (d.weight <= threshold){return 0}
                    else{return 2+link_width_scale*d.weight}}) //set width to 0 if link has 0 probability
                .attr('opacity',0.3)
                .attr('marker-end', markerType)
                .attr('d',curvepath)
                .attr('d',shortenedpath)
                .attr('stroke',d=>colour(d.source.id))
                .on('mouseover', motionInLink)
                .on('mouseout', motionOutLink);

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
                
            // enlarge link when hovering
            d3.select(this).transition()
                           .attr('opacity', function(d){
                                probability = Math.round((d.weight + Number.EPSILON) * 100) / 100
                                length = 10 + 8 * probability.toString().length
                                
                                if(d.source == d.target){ //set position arguments
                                   dxx = ((d.source.x+d.target.x)/2)+40
                                   dyy = ((d.source.y+d.target.y)/2)-40}else{
                                   dxx = (d.source.x+d.target.x)/2
                                   dyy = (d.source.y+d.target.y)/2-10}return 1})
                           .attr('stroke-width',2+link_width_scale);

            // hover text box
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

            // hover text
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
    
    //function to define curved link path
    function curvepath(d){
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx **2 + dy **2);
            return "M" + d.source.x + "," + d.source.y + "A" + dr + "," 
                       + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
            };

    //function to define link path 2.0
    function shortenedpath(d){
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
    // <LINKS END> //
    
    // <NODES> //
    
    // add nodes to svg element
    const node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(nodes)
            .enter().append("g");

    if (nodes[0].image == null){
        // add images to nodes if given
        var rectangles = node.append("rect")
               .attr("rx", 6)
               .attr("ry", 6)
               .attr('stroke','white')
               .attr('stroke-width',1)
               .attr('height',15)
               .attr('width',d=>5*d.id.length)
               .attr('fill',d=>colour(d.id))
               .attr('x',d=>d.x-(5*d.id.length)/2)
               .attr('y',d=>d.y-7)
               .on('mouseover', motionInNode)
               .on('mouseout', motionOutNode);
        
        const text = node.append("text")
            .attr('font-size',8)
            .attr("font-family","sans-serif")
            .attr('fill','white')
            .attr('stroke-width',0.6)
            .attr("dx", 0)
            .attr("dy", 3.5)
            .attr('text-anchor','middle')
            .attr("x", d => d.x)
            .attr("y", d => d.y)
            .text(d => d.id);
    }else{
        var image = node.append("svg:image") //set image on nodes if exist
            .attr('class','images')
            .attr("xlink:href",d => d.image)
            .attr("id", d =>`image-${d.id}`)
            .attr("x", d => d.x-10)
            .attr("y", d => d.y-10)
            .attr("height", 20)
            .attr("width", 20)
            .on('mouseover', motionInImage)
            .on('mouseout', motionOutImage);
    }
    
    //hover in animation for Nodes
    function motionInNode(d){
            var name,locx,locy;
            var targets = [],strength = [];
                
            // adjust image position if given
            d3.select(this).transition()
              .attr('height',function(d){
                  name = d.id, locx = d.x, locy = d.y
                  return 15});
            hover_in(name,targets,strength,locx,locy);
            };
    
    //hover out animation for Nodes   
    function motionOutNode(d) {
            var  name;
            d3.select(this).transition()
              .attr('height',function(d){
                  name = d.id;
                  return 15});
            
            // remove text and text box
            d3.selectAll('.stateshow').remove();
            d3.select('#stateRect').remove();
        
            // rescale path to normal size
            d3.selectAll("#"+name+"path")
              .transition()
              .duration(200)
              .attr('opacity',0.3)
              .attr('stroke-width',function(d){
                                   if (d.weight <= threshold){return 0}
                                   else{return 2+link_width_scale*d.weight}})
            };
    
    //hover in animation for Images
    function motionInImage(d){
            var name,locx,locy;
            var targets = [],strength = [];
                
            // adjust image position if given
            d3.select(this).transition()
              .attr("x",d=>d.x-15)
              .attr("y",d=>d.y-15)
              .attr('width',30)
              .attr('height',function(d){
                  name = d.id, locx = d.x, locy = d.y
                  return 30});
            
            hover_in(name,targets,strength,locx,locy);
            };
    
    //hover out animation for Images
    function motionOutImage(d) {
            var name;
            // adjust image position if given
            d3.select(this).transition()
                           .attr("x",d=>d.x-10)
                           .attr("y",d=>d.y-10)
                           .attr('height',function(d){
                                name = d.id
                            return 20})
                           .attr('width',20);
        
            // remove text and text box
            d3.selectAll('.stateshow').remove();
            d3.select('#stateRect').remove();
        
            // rescale path to normal size
            d3.selectAll("#"+name+"path")
              .transition()
              .duration(200)
              .attr('opacity',0.3)
              .attr('stroke-width',function(d){
                                   if (d.weight <= threshold){return 0}
                                   else{return 2+link_width_scale*d.weight}})
            };
    
    //function to show data box on hover in
    function hover_in(name,targets,strength,locx,locy) {
            // path hover animation
            d3.selectAll("#"+name+"path")
              .transition()
              .duration(200)
              .attr('opacity',1)
              .attr('stroke-width',function(d){
                                   targets.push(d.target.id);
                                   strength.push(Math.round((d.weight + Number.EPSILON) * 100) / 100);
                                   if (d.weight <= threshold){return 0}
                                   else{return 2+(4+link_width_scale)*d.weight}})
            
            // show data box
            var nodeInfo = [name];
            for (let i = 0; i < targets.length; i++) {
                nodeInfo.push("To "+targets[i]+": "+strength[i]) ;
                };
            var length = 5.2*longest_string(nodeInfo)
            // hover text box
            group.append("rect")
               .attr("rx", 6)
               .attr("ry", 6)
               .attr('height',18*targets.length)
               .attr('width',length)
               .attr('id','stateRect')
               .attr('fill','black')
               .attr('opacity',0.5)
               .attr('x',locx-length*0.5)
               .attr('y',locy+22)

            // hover text
            group.selectAll('.stateshow')
               .data(nodeInfo)
               .enter()
               .append("text")
               .attr('class','stateshow')
               .attr('font-size',10)
               .attr('fill','white')
               .attr('x',locx-length*0.45)
               .attr('y',function(d,i){
                return i*15+locy+36})
               .attr('text-anchor','left')
               .text(d=>d)
            }
    
    // To compute longest string in the array for width of text box
    function longest_string(str_ara) {
                  let max = str_ara[0].length;
                  str_ara.map(v => max = Math.max(max, v.length));
                  var result = str_ara.filter(v => v.length == max)[0].length;
                  return result;
            }
    // <NODES END> //   
    
    //setting initial zoom level (zoom to fit)
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
    }
    
    // call zoom to fit upon initialisation
    lapsedZoomFit();
    
    // create a 'g' element for hovering elements
    // positioned here to bring element to front
    const group = svg.append("g");
    
    // <SLIDER EVENT> //
    var sliderDataValue=0;
    // initialise slider text
    d3.select("output#dataIndexOutput").text("Data set index : " + 0);
    d3.select("output#dataDateOutput").text("Data set date : " + date_list[0]);
    
    // update chart when slider is moved
    d3.select("input[type=range]#dataSelect").on("input", function() {
               sliderDataValue = this.value;
               nodes = nodesData[0];
               links = linksData[sliderDataValue];

               // update source and target of links
               for (let i = 0; i < links.length; i++) {
                  links[i].source = nodes[links[i].source];
                  links[i].target = nodes[links[i].target];
                }
        
               // update width of links
               var updateLink = d3.selectAll('.connections') //selectAll class doesnt work
                               .data(links,d=>d.id)

               updateLink.transition()
                         .duration(800)
                         .attr('stroke-width',function(d){
                                               if (d.weight <= threshold){return 0}
                                               else{return 2+link_width_scale*d.weight}})
               
               // disable interactive events for 800 ms to prevent bugging out
               if (nodes[0].image == null){
                   rectangles.on('mouseover', null);
                   rectangles.on('mouseout', null);
               }else{
                   image.on('mouseover', null);
                   image.on('mouseout', null);}
               path.on('mouseover', null);
               path.on('mouseout', null);
        
               setTimeout(function(){
               if (nodes[0].image == null){
                   rectangles.on('mouseover', motionInNode);
                   rectangles.on('mouseout', motionOutNode);
               }else{
                   image.on('mouseover', motionInImage);
                   image.on('mouseout', motionOutImage);
                   }
               path.on('mouseover', motionInLink);
               path.on('mouseout', motionOutLink);
               }, 800);
                
               // update slider text
               d3.select("output#dataIndexOutput").text("Data set index : " + sliderDataValue);
               d3.select("output#dataDateOutput").text("Data set date : " + date_list[sliderDataValue]);
    });
    
    // update chart when link pruning slider is moved
    d3.select("input[type=range]#linkThreshold").on("input", function() {
               threshold = this.value;
        
               // select all links
               var updateLink = d3.selectAll('.connections') //selectAll class doesnt work
                               .data(links,d=>d.id)
               
               // change link width to 0 if weight is below threshold
               updateLink.transition()
                         .duration(800)
                         .attr('stroke-width',function(d){
                                               if (d.weight <= threshold){return 0}
                                               else{return 2+link_width_scale*d.weight}})
        
               //  update slidert text
               d3.select("#dataDateOutput").text("Link Threshold : " + threshold);
    });   
    // <SLIDER EVENT END> //

    // <BUTTON EVENT> //
    d3.select("#saveButton").on("click", function(){
      var html = d3.select("#SVG")
        .attr("version", 1.1)
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .node().parentNode.innerHTML;

      // console.log(html);
      var imgsrc = 'data:image/svg+xml;base64,'+ btoa(html);
      var img = '<img src="'+imgsrc+'">'; 
          d3.select("#svgdataurl").html(img);

      var canvas = document.createElement("canvas"),
          context = canvas.getContext("2d");

      // default setting around 1.8, set to 7.2 for higher resolution
      // const pixelRatio = window.devicePixelRatio || 1;
      const pixelRatio = 7.2;

          canvas.width = width * pixelRatio;
          canvas.height = height * pixelRatio;
          canvas.style.width = `${canvas.width}px`;
          canvas.style.height = `${canvas.height}px`;
          context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        
      var image = new Image;
          image.src = imgsrc;
          image.onload = function() {
          context.drawImage(image, 0, 0);

      var canvasdata = canvas.toDataURL("image/png",1.0);

      var pngimg = '<img src="'+canvasdata+'">'; 
          d3.select("#pngdataurl").html(pngimg);

      var a = document.createElement("a");
          a.download = 'diagram_'+date_list[sliderDataValue]+'.png';
          a.href = canvasdata;
          a.click();
      };
    });
    // <BUTTON EVENT END> //
    
    // to inspect
//     console.log(document.getElementById('SVG'));
});
