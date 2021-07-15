def simulator(n,num): #number of states, number of samples
    x = np.zeros((n,n))
    for i in range(num):
        piece = sample(n,1000,p,0.01)
        x += piece      #adding samples together

    zcol_sum1 = x.sum(axis=0)
    x/=x.sum(axis=0)    #generating probability matrix
       
    return x
 
#  print(simulator(4,20))
