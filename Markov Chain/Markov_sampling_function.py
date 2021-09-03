import numpy as np
import random
import json


def sample(states_num: int = 4,
                       transition_prob: float = None,
                       noise_scale: float = 0.01,
                       seed: int = 2021):
    """[summary]

    Parameters
    ----------
    states_num : int, optional
        [description], by default 4
    transition_prob : float, optional
        [description], by default None
    noise_scale : float, optional
        [description], by default 0.01
    seed : int, optional
        [description], by default 2021

    Returns
    -------
    [type]
        [description], sample transition probability matrix
    
    Functions
    ---------
    Takes 4 parameters to return a
    sample transition probability matrix
    
    If unspecified, default parameters as shown.
    Transition probability matrix is randomly generated.
    """
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
