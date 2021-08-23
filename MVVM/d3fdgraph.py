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

def plot_force_directed_graph(transitionMatrix: dict=None, state_name=None, image=None, colour=None,
                              start_date=datetime(2021, 8, 20),end_date=datetime(2021, 8, 21),interval='120min'):
    
    # creating a list of dates and times for slider options
    dates = pd.date_range(start_date, end_date, freq=interval)[:-1]
    options = [(date.strftime(' %d %b %Y, %H:%M:%S '),index) for index, date in enumerate(dates)]
    
    # make variables global and accessible by dataSelect function
    global matrixData,stateNameData,imageData,colourData,selection_slider
    
    # setting variables values
    matrixData = transitionMatrix
    stateNameData = state_name
    imageData = image
    colourData = colour
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
    # clear output cell
    clear_output(wait=True)
    
    # show slider and graph
    display(selection_slider)
    force_directed_graph(matrixData[change.new],stateNameData,imageData,colourData)
    
def force_directed_graph(transitionMatrix: float = None, state_name=None, images=None, colour=None, **kwargs):
    # generate random identifier for SVG element, to avoid name clashes if used multiple times in a notebook
    uid = str(uuid.uuid4())

    # load html template file
    html = Path('d3fdgraph.html').read_text().replace('%%unique-id%%', uid)

    # convert graph nodes and links to json, ready for d3
    json_nodes = json.dumps(nodesCalibration(transitionMatrix,state_name,images))
    json_links = json.dumps(linksCalibration(transitionMatrix))
    
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
                 'colourGiven':colourGiven,
                 'colourArray':colourArray}

    config.update(kwargs)
    js_code = create_d3_fdgraph(uid, config)

    # display html in notebook cell
    IPython.core.display.display_html(IPython.core.display.HTML(html))
    
    # display (run) javascript in notebook cell
    IPython.core.display.display_javascript(IPython.core.display.Javascript(data=js_code))
    pass

def create_d3_fdgraph(uid, config):
    js_code = Path('d3fdgraph.js').read_text()
    js_code = js_code.replace('%%unique-id%%', uid)
    for key, value in config.items():
        js_code = js_code.replace(f'%%{key}%%', str(value))

    return js_code

def nodesCalibration(transitionMatrix, state_name, images):
    length = len(transitionMatrix[0])
    
    # if state_name is not given, returns a list of alphabets
    if type(state_name) == type(None):
        state_name = string.ascii_uppercase[:length]
        
    # if image is not given, returns a list of Nones
    if  type(images) == type(None):
        images = [None]*length
        
    nodes = []    
    for i in range(length):
        nodes.append({"id":state_name[i],"index":i,"image":images[i]})
    return nodes

def linksCalibration(transitionMatrix):
    length = len(transitionMatrix[0])
    links = []
    for j in range(length):
        for i in range(length):
            if transitionMatrix[i][j] != 0:
                links.append({"source": i,"target": j,"type": i,"weight": transitionMatrix[i][j]})
    return links
