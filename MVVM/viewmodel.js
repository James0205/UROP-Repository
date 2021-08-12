require.undef('viewmodel');

define('viewmodel', ['d3'], function (d3) {
    function calculations(nodes,links) {
        var width = 1000, height = 750;
        var    nodes = nodes,
               links = links;
            
        var simulation = d3.forceSimulation(nodes)
                   .force("charge", d3.forceManyBody().strength(-100))
                   .force('center', d3.forceCenter(width/2, height/2))
                   .force('link', d3.forceLink().links(links).distance(function(d){
                            return 180-d.stroke*150}))
                   .stop();
        
        simulation.tick(200);
        return [nodes,links]
    };
return calculations;
});
