from IPython.display import display, Javascript, HTML
from pathlib import Path
import IPython.core.display
import numpy as np
import string
import json
import uuid

def plot_force_directed_graph(data_set: list = None, state_name=None, image=None, colour=None, zoom=True, coordinates=None, **kwargs):
    """[summary]
    Parameters
    ----------
    data_set : list, required
        [description], by default list = None
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
    dataLength = len(data_set)

    # load html template file
    html = Path('d3fdgraph_lab.html').read_text().replace('%%unique-id%%', uid).replace('%%dataLength%%', str(dataLength-1))

    # convert graph nodes, links and list of dates to json, ready for d3
    json_nodes = json.dumps(nodesCalibration(data_set,state_name,image))
    json_links = json.dumps(linksCalibration(data_set))
    json_dates = json.dumps(date_list(data_set))
    
    # convert zoom boolean into json format
    zoomBoolean = json.dumps(zoom)
    
    # convert colour array to json
    colourArray = json.dumps(colour)
    
    # convert coordinates array to json
    coordinates = json.dumps(coordinates)
    
    # Use different adjustable configuration values
    config =    {'width': 1000,
                 'height': 600,
                 'noderadius': 10,
                 'linkcharge': -200,
                 'linkdistance': 180,
                 'collisionscale': 4,
                 'linkwidthscale': 4,
                 'ticks': 200,
                 'dataLength':dataLength,
                 'nodes': json_nodes,
                 'links': json_links,
                 'date_list':json_dates,
                 'zoomBoolean': zoomBoolean,
                 'colourArray': colourArray,
                 'coordinates': coordinates}

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
    js_code = Path('d3fdgraph_lab.js').read_text()
    js_code = js_code.replace('%%unique-id%%', uid)
    for key, value in config.items():
        js_code = js_code.replace(f'%%{key}%%', str(value))

    return js_code

def nodesCalibration(data_set, state_name, image):
    """[summary]
    Parameters
    ----------
    data_set : list, required
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
    matrixLength = len(data_set[0][1])
    dataLength = len(data_set)
    
    # if state_name is not given, returns a list of alphabets
    if type(state_name) == type(None):
        state_name = string.ascii_uppercase[:matrixLength]
        
    # if image is not given, returns a list of Nones
    if  type(image) == type(None):
        image = [None]*matrixLength
        
    nodes = {}
    for i in range(dataLength):
        nodes[i]=[]
        for j in range(matrixLength):
            nodes[i].append({"id":state_name[j],"image":image[j]})
    return nodes

def linksCalibration(data_set):
    """[summary]
    Parameters
    ----------
    data_set : list, required
        
    Returns
    -------
    [type]
        [description], a dictionary of lists of links with attributes
    
    Functions
    ---------
    Computes the links of the network graph
    
    """
    dataLength = len(data_set)
    matrixLength = len(data_set[0][1])
    links = {}
    
    for k in range(dataLength):
        links[k]=[]
        for j in range(matrixLength):
            for i in range(matrixLength):
                links[k].append({"source": i,"target": j,"id": str(i)+str(j),
                                 "weight": data_set[k][1][j][i]})
    return links

def date_list(data_set):
    """[summary]
    Parameters
    ----------
    data_set : list, required
        
    Returns
    -------
    [type]
        [description], a dictionary of lists of links with attributes
    
    Functions
    ---------
    Computes the links of the network graph
    
    """
    date_list = []
    dataLength = len(data_set)
    for data in data_set:
        date_list.append(data[0])
    
    return date_list
