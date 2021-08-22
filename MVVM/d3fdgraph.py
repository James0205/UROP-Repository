import IPython.core.display
from pathlib import Path
import uuid
import numpy as np
import string
import json


def plot_force_directed_graph(transitionMatrix: float = None, state_name=None, images=None, **kwargs):

    # generate random identifier for SVG element, to avoid name clashes if used multiple times in a notebook
    uid = str(uuid.uuid1())

    # load html template file
    html = Path('d3fdgraph.html').read_text().replace('%%unique-id%%', uid)

    # convert graph nodes and links to json, ready for d3
    json_nodes = json.dumps(nodesCalibration(transitionMatrix,state_name,images))
    json_links = json.dumps(linksCalibration(transitionMatrix))
    
    # Use different adjustable configuration values
    config =    {'width': 800,
                'height': 400,
                'noderadius': 10,
                'linkcharge': 600,
                'linkdistance': 180,
                'collisionscale': 4,
                'linkwidthscale': 4,
                'ticks': 200,
                'nodes': json_nodes,
                'links': json_links}

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


def nodesCalibration(transitionMatrix: float=None, state_name=None, images=None):
    if type(transitionMatrix) == type(None):
        transitionMatrix = sample()
    length = len(transitionMatrix[0])
    nodes = []
    if type(state_name) == type(None):
        if type(images) == type(None):
            for i in range(length):
                nodes.append({"id":string.ascii_uppercase[i],"index":i,"image": None})
        else:
            for i in range(length):
                nodes.append({"id":string.ascii_uppercase[i],"index":i,"image":images[i]})
    else:
        if type(images) == type(None):
            for i in range(length):
                nodes.append({"id":state_name[i],"index":i,"image": None})
        else:
            for i in range(length):
                nodes.append({"id":state_name[i],"index":i,"image":images[i]})
    return nodes

def linksCalibration(transitionMatrix: float=None, state_name=None, images=None):
    if type(transitionMatrix) == type(None):
        transitionMatrix = sample()
    length = len(transitionMatrix[0])
    transitionMatrix = np.matrix(transitionMatrix)
    data = np.ndarray.tolist(np.matrix.transpose(transitionMatrix))
    links = []
    for i in range(length):
        for j in range(length):
            if data[i][j] != 0:
                links.append({"source": i,"target": j,"type": i,"weight": data[i][j]})
    return links
                
                
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
