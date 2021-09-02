from IPython.display import display, Javascript, HTML, clear_output
from pathlib import Path
import IPython.core.display
import numpy as np
import string
import json
import uuid
    
def plot_force_directed_graph(transitionMatrix: dict = None, state_name=None, image=None, colour=None, zoom=True, **kwargs):
    """[summary]
    Parameters
    ----------
    transitionMatrix : dict, required
        [description], by default float = None
    state_name : list, optional
        [description], by default None
    image : list, optional
        [description], by default None
    colour : list, optional
        [description], by default None
    zoom : boolean, optional
        [description], by default True
        
    Returns
    -------
    [type]
        [description], network graph
    
    Functions
    ---------    
    Binds CSS and Javascript files into one output
    Plotting a network graph
    """
    # generate random identifier for SVG element, to avoid name clashes if used multiple times in a notebook
    uid = str(uuid.uuid4())
    
    # compute size of matrix data set
    matrixLength = len(transitionMatrix)

    # load html template file
    html = Path('d3fdgraph.html').read_text().replace('%%unique-id%%', uid).replace('%%matrixLength%%', str(matrixLength-1))

    # convert graph nodes and links to json, ready for d3
    json_nodes = json.dumps(nodesCalibration(transitionMatrix,state_name,image))
    json_links = json.dumps(linksCalibration(transitionMatrix))
    
    # convert zoom boolean into json format
    zoomBoolean = json.dumps(zoom)
    
    # if colour is given, change variable to true
    colourGiven = False
    colourArray = colour
    if type(colour) != type(None):
        colourGiven = True
    colourGiven = json.dumps(colourGiven)
    colourArray = json.dumps(colourArray)
    
    # Use different adjustable configuration values
    config =    {'width': 1000,
                 'height': 600,
                 'noderadius': 10,
                 'linkcharge': -200,
                 'linkdistance': 180,
                 'collisionscale': 4,
                 'linkwidthscale': 4,
                 'ticks': 200,
                 'matrixLength':matrixLength,
                 'nodes': json_nodes,
                 'links': json_links,
                 'zoomBoolean': zoomBoolean,
                 'colourGiven': colourGiven,
                 'colourArray': colourArray}

    config.update(kwargs)
    js_code = create_d3_fdgraph(uid, config)

    # display html in notebook cell
    IPython.core.display.display_html(IPython.core.display.HTML(html))
    
    # display (run) javascript in notebook cell
    IPython.core.display.display_javascript(IPython.core.display.Javascript(data=js_code))
    pass

def create_d3_fdgraph(uid, config):
    """[summary]
    Parameters
    ----------
    uid : string, required
        [description], identifier of svg element
    config : dict, required
        [description], configuration values for js file
        
    Returns
    -------
    [type]
        [description], replaces keywords of js file
    
    Functions
    ---------    
    Replaces keywords of Javascript and CSS files with
    given configuration values.
        """
    js_code = Path('d3fdgraph.js').read_text()
    js_code = js_code.replace('%%unique-id%%', uid)
    for key, value in config.items():
        js_code = js_code.replace(f'%%{key}%%', str(value))

    return js_code

def nodesCalibration(transitionMatrix, state_name, image):
    """[summary]
    Parameters
    ----------
    transitionMatrix : dict, required
    state_name : list, optional
    image : list, optional
        
    Returns
    -------
    [type]
        [description], a dictionary of lists of nodes with attributes
    
    Functions
    ---------
    Computes the nodes of the network graph
    
    """
    lengthMatrix = len(transitionMatrix[0])
    lengthDict = len(transitionMatrix)
    
    # if state_name is not given, returns a list of alphabets
    if type(state_name) == type(None):
        state_name = string.ascii_uppercase[:lengthMatrix]
        
    # if image is not given, returns a list of Nones
    if  type(image) == type(None):
        image = [None]*lengthMatrix
        
    nodes = {}
    for i in range(lengthDict):
        nodes[i]=[]
        for j in range(lengthMatrix):
            nodes[i].append({"id":state_name[j],"index":j,"image":image[j]})
    return nodes

def linksCalibration(transitionMatrix):
    """[summary]
    Parameters
    ----------
    transitionMatrix : dict, required
        
    Returns
    -------
    [type]
        [description], a dictionary of lists of links with attributes
    
    Functions
    ---------
    Computes the links of the network graph
    
    """
    lengthDict = len(transitionMatrix)
    lengthMatrix = len(transitionMatrix[0])
    links = {}
    
    for k in range(lengthDict):
        links[k]=[]
        for j in range(lengthMatrix):
            for i in range(lengthMatrix):
                links[k].append({"source": i,"target": j,"id": str(i)+str(j),
                                 "weight": transitionMatrix[k][j][i]})
    return links
