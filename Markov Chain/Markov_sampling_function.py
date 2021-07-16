import string
import numpy as np
import random


def alternative_sample(states_num: int = 4,
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
        [description]
    """
    rng = np.random.default_rng(seed)
    if type(transition_prob)==type(None):
        transition_prob = softmax(rng.normal(size=(states_num,states_num)))
    noise = rng.normal(0,noise_scale,(states_num,states_num))
    sample_prob = transition_prob + noise
    negative_noise = sample_prob.min(axis=0)
    sample_prob = sample_prob + (negative_noise>0)*np.sign(negative_noise)*negative_noise
    sample_prob = sample_prob/sample_prob.sum(axis=0)
    return sample_prob


def softmax(x):
    """Compute softmax values for each sets of scores in x."""
    return np.exp(x) / np.sum(np.exp(x), axis=0)



#define initial transition probability matrix
p = np.array([[0.7,0.7,0.7,0.7],[0.1,0.1,0.1,0.1],[0.1,0.1,0.1,0.1],[0.1,0.1,0.1,0.1]])

#columns are froms (current state), rows are tos (next state)

def sample(n,m,p,nd): #num of states, num of observations, probability of transition, noise standard deviation
    
    rows, columns = p.shape
    #define noise distribution matrix
    noise_ini = np.random.normal(0,nd,(rows-1,columns))
    ncol_sum = noise_ini.sum(axis=0)*(-1)
    noise = np.append(noise_ini,[ncol_sum],axis= 0)
    
    current_state = random.randrange(n) #randomly choosing the current state
    
    z = np.zeros((n,n))
    
    p_fin = np.clip(p+noise,0,2) #clipping negative values to 0
    p_fin /= p_fin.sum(axis=0,keepdims=1) #this should give p of col sum 1
    
    for i in range(m):
        transition = np.random.choice(list(range(n)), replace = True, p = p_fin[:,n-1])
        z[transition,current_state] += 1
        current_state = transition
        
    zcol_sum = z.sum(axis=0)
    for i in range(len(zcol_sum)):
        if zcol_sum[i] == 0: #to prevent dividing by 0 if column sum is 0
            zcol_sum[i] = 1

    z /= zcol_sum #generating probability matrix
    return z

print(sample(4,1000,p,0.01))
