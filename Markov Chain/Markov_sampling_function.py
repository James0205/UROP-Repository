import string
import numpy as np
import random

#define initial transition probability matrix
p = np.array([[0.7,0.7,0.7,0.7],[0.1,0.1,0.1,0.1],[0.1,0.1,0.1,0.1],[0.1,0.1,0.1,0.1]])
rows, columns = p.shape

#define noise distribution matrix
noise_ini = np.random.normal(0,0.01,(rows-1,columns))
ncol_sum = noise_ini.sum(axis=0)*(-1)

noise = np.append(noise_ini,[ncol_sum],axis= 0)

#columns are froms (current state), rows are tos (next state)

def sample(n,m,p,noise): #num of states, num of observations, probability of transition, noise
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

print(sample(4,1000,p,noise))
