from IPython.display import display, Javascript, HTML, clear_output
from ipywidgets import interact, fixed
from datetime import datetime
from pathlib import Path
import ipywidgets as widgets
import IPython.core.display
import pandas as pd
import numpy as np
import string
import json
import uuid

def plot_force_directed_graph(transitionMatrix: dict=None, state_name=None, image=None, colour=None, zoom=True,
                              start_date=datetime(2021, 8, 20),end_date=datetime(2021, 8, 21),interval='120min'):
    """[summary]
    Parameters
    ----------
    transitionMatrix : dict, required
        [description], by default dict = None
    state_name : list, optional
        [description], by default None
    image : list, optional
        [description], by default None
    colour : list, optional
        [description], by default None
    zoom : boolean, optional
        [description], by default True
    start_date : datetime, required for slider options
        [description], by default datetime(2021, 8, 20)
    end_date : datetime, required for slider options
        [description], by default datetime(2021, 8, 21)
    interval : string, required for slider options
        [description], by default '120min'
        
    Returns
    -------
    [type]
        [description], slider for data selection
    
    Functions
    ---------
    Main function to pass variables into graph plotting functions
    Calls a slider for data selection
    """
    
    # creating a list of dates and times for slider options
    dates = pd.date_range(start_date, end_date, freq=interval)[:-1]
    options = [(date.strftime(' %d %b %Y, %H:%M:%S '),index) for index, date in enumerate(dates)]
    
    # make variables global and accessible by dataSelect function
    global matrixData,stateNameData,imageData,colourData,zoomBool,selection_slider
    
    # setting variables values
    matrixData = transitionMatrix
    stateNameData = state_name
    imageData = image
    colourData = colour
    zoomBool = zoom
    selection_slider = widgets.SelectionSlider(
        options = options,
        description = 'Dates',
        orientation = 'horizontal',
        layout = {'width': '600px'}
    )
    
    # call function whenever slider moves
    selection_slider.observe(dataSelect,names ='value')
    
    # show slider
    display(selection_slider)

def dataSelect(change):
    """[summary]
    Parameters
    ----------
    change : handler, fixed
        
    Returns
    -------
    [type]
        [description], slider and plotting function
    
    Functions
    ---------
    Clears cell output and calls slider and plotting 
    function with selected data whenever slider value changes
    """
    # clear output cell
    clear_output(wait=True)
    
    # show slider and graph
    display(selection_slider)
    force_directed_graph(matrixData[change.new],stateNameData,imageData,colourData,zoomBool)
    
def force_directed_graph(transitionMatrix: float = None, state_name=None, image=None, colour=None, zoom=True, **kwargs):
    """[summary]
    Parameters
    ----------
    transitionMatrix : float, required
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

    # load html template file
    html = Path('d3fdgraph.html').read_text().replace('%%unique-id%%', uid)

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
                 'linkcharge': -100,
                 'linkdistance': 180,
                 'collisionscale': 4,
                 'linkwidthscale': 4,
                 'ticks': 200,
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
    transitionMatrix : float, required
    state_name : list, optional
    image : list, optional
        
    Returns
    -------
    [type]
        [description], a list of nodes with attributes
    
    Functions
    ---------
    Computes the nodes of the network graph
    
    """
    length = len(transitionMatrix[0])
    
    # if state_name is not given, returns a list of alphabets
    if type(state_name) == type(None):
        state_name = string.ascii_uppercase[:length]
        
    # if image is not given, returns a list of Nones
    if  type(image) == type(None):
        image = [None]*length
        
    nodes = []    
    for i in range(length):
        nodes.append({"id":state_name[i],"index":i,"image":image[i]})
    return nodes

def linksCalibration(transitionMatrix):
    """[summary]
    Parameters
    ----------
    transitionMatrix : float, required
        
    Returns
    -------
    [type]
        [description], a list of links with attributes
    
    Functions
    ---------
    Computes the links of the network graph
    
    """
    length = len(transitionMatrix[0])
    links = []
    for j in range(length):
        for i in range(length):
            if transitionMatrix[i][j] != 0:
                links.append({"source": i,"target": j,"type": i,"weight": transitionMatrix[i][j]})
    return links
