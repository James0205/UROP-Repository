def simulator(n,num): #number of states, number of samples
    x = np.zeros((n,n))
    for i in range(f):
        k = markov(n,1000,p,noise)
        x += k

    zcol_sum1 = x.sum(axis=0)
    x/=x.sum(axis=0)
    
    return x
 
#  print(simulator(4,20))
