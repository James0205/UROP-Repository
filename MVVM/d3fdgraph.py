import IPython.core.display
import pkg_resources
import numpy as np
import string
import json
import random


def plot_force_directed_graph(transitionMatrix: float=None, state_name=None, images=None, node_radius=10, link_distance=180, collision_scale=4, link_width_scale=4, ticks=200):

    # convert graph nodes and links to json, ready for d3
    graph_json_nodes = json.dumps(nodesCalibration(transitionMatrix,state_name,images))
    graph_json_links = json.dumps(linksCalibration(transitionMatrix))

    # load html and javascript from template files
    resource_package = __name__ 
    html_template = 'd3fdgraph.html'
    html = pkg_resources.resource_string(resource_package, html_template).decode('utf-8')
    javascript_template = 'd3fdgraph.js'
    js_code = pkg_resources.resource_string(resource_package, javascript_template).decode('utf-8')

    # generate random identifier for SVG element, to avoid name clashes if used multiple times in a notebook
    random_id_string = str(random.randrange(1000000,9999999))
    # replace placeholder in both html and js templates
    html = html.replace('%%unique-id%%', random_id_string)
    js_code = js_code.replace('%%unique-id%%', random_id_string)

    # substitute configuration values
    js_code = js_code.replace('%%noderadius%%', str(node_radius))
    js_code = js_code.replace('%%linkdistance%%', str(link_distance))
    js_code = js_code.replace('%%collisionscale%%', str(collision_scale))
    js_code = js_code.replace('%%linkwidthscale%%', str(link_width_scale))
    js_code = js_code.replace('%%ticks%%', str(ticks))

    # substitute links and data
    js_code = js_code.replace('%%links%%', str(graph_json_links))
    js_code = js_code.replace('%%nodes%%', str(graph_json_nodes))

    # display html in notebook cell
    IPython.core.display.display_html(IPython.core.display.HTML(html))
    
    # display (run) javascript in notebook cell
    IPython.core.display.display_javascript(IPython.core.display.Javascript(data=js_code))
    pass

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
