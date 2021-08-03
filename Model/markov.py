from IPython.display import display, Javascript, HTML
import json
import ipywidgets as widgets
import pandas as pd
from datetime import datetime
import numpy as np
import string
import random
import json

def sample(states_num: int = 4,
                       transition_prob: float = None,
                       noise_scale: float = 0.01,
                       seed: int = 2021):

    rng = np.random.default_rng(seed)
    if type(transition_prob)==type(None):
        transition_prob = softmax(rng.normal(size=(states_num,states_num)))
    noise = rng.normal(0,noise_scale,(states_num,states_num))
    sample_prob = transition_prob + noise
    negative_noise = sample_prob.min(axis=0)
    sample_prob = sample_prob + (negative_noise<0)*np.sign(negative_noise)*negative_noise
    sample_prob = sample_prob/sample_prob.sum(axis=0)
    return sample_prob

def softmax(x):
    """Compute softmax values for each sets of scores in x."""
    return np.exp(x) / np.sum(np.exp(x), axis=0)

def saveData(sample_matrix: float = sample(),
             profile: dict = None):
    """Saving data into json files"""
    data = np.ndarray.tolist(np.matrix.transpose(sample_matrix))
    length =len(sample_matrix[0])
    nodes = []
    links = []
        
    for i in range(length):
        if i in profile:
            nodes.append({"name":profile[i][0],
                          "type":i,
                          "image":profile[i][1]})
        else:
            nodes.append({"name":string.ascii_uppercase[i],
                          "type":i,
                          "image":None})

    for i in range(length):
        for j in range(length):
            if data[i][j] != 0:
                links.append({"source": i, 
                          "target": j,
                          "type": i,
                          "stroke": data[i][j]})
    return data, nodes, links

def slider(start_date,end_date):
    dates = pd.date_range(start_date, end_date, freq='D')

    options = [(date.strftime(' %d %b %Y '), date) for date in dates]

    selection_slider = widgets.SelectionSlider(
        options=options,
        description='Dates',
        orientation='horizontal',
        layout={'width': '600px'},
        readout = True
    )
    return selection_slider

def visualise(transitionMatrix,nodes,links,transitionTime):
    display(Javascript("""
        (function(element){
            require(['visualisation'], function(visualisation) {
                visualisation(element.get(0), %s, %s, %s, %d)
            });
        })(element);
    """ % (json.dumps(transitionMatrix),json.dumps(nodes),json.dumps(links),transitionTime)))
