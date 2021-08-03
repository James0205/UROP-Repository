from IPython.display import display, Javascript, HTML
from datetime import datetime
import ipywidgets as widgets
import pandas as pd
import json

# call function to show model
def visualise(transitionMatrix,nodes,links,transitionTime):
    display(Javascript("""
        (function(element){
            require(['visualisation'], function(visualisation) {
                visualisation(element.get(0), %s, %s, %s, %d)
            });
        })(element);
    """ % (json.dumps(transitionMatrix),json.dumps(nodes),json.dumps(links),transitionTime)))
    
# call function for slider 
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
