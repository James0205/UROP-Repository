#Markov Chain with n States (memoryless)
import numpy as np
import random


#Defining all the variables
#When changing length of state space, the probability of transition has to be altered accordingly

#define state space
state_space =["A","B","C","D"]

#define initial state
current_state = "C"

#define time period
period = 500

#define probability of transition
P_0 = np.array([[0.1,0.4,0.3,0.2],[0.4,0.2,0.2,0.2],[0.3,0.2,0.2,0.3],[0.2,0.2,0.3,0.3]])

#To check that the columns of initial matrix adds up to 1
col_sum1 = P_0.sum(axis=0)
for i in range(len(P_0[0])):
    if col_sum1[i] != 1:
        print("True transition probability matrix column sum does not add up to 1")
        print("The column sum for column {x} is".format(x=i),col_sum1[i+1])
    else:
        pass

#define noise (Last row of noise is dependent on the previous rows)
#to give a sum of 0 for each column
print()
rows, columns = P_0.shape

noise_ini = np.random.normal(0,0.01,(rows-1,columns))
ncol_sum = noise_ini.sum(axis=0)*(-1)

noise_fin = np.append(noise_ini,[ncol_sum],axis= 0)
ncol_fsum = noise_fin.sum(axis=0)

#check if the noise adds up to 0 for each column
for ele in range(len(ncol_fsum)):
    if ncol_fsum[ele] == 0:
        pass
    else:
        print("Noise column {colnum} doesn't sum up to 0, check the values".format(colnum = ele+1))

              
#include noise in the transition probability matrix
print()
P = P_0 + noise_fin

#if probability after including noise is negative, make it 0
for a in range(len(P_0[0])):
    for b in range(len(P_0[0])):
        if P[a,b] < 0:
            P[a,b] = 0
        else:
            pass

#if there exist probabilities that are made to 0, the column has to be normalised
col_sum2 = P.sum(axis=0) #column sum

#if any element in matrix = 0, divide column by column sum
for i in range(len(P[0])):
    for j in range(len(P[0])):
        if P[j,i] == 0:
            P[:,i] /= col_sum2[i]
            break
        else:
            pass
        
#getting the column sum
col_sum3 = P.sum(axis=0)            

#To check that the probability adds up to 1
for i in range(len(P_0[0])):
    if col_sum3[i] != 1:
        print("Transition probability matrix with noise column sum does not add up to 1")
        print("The column sum for column {x} is".format(x=i+1),col_sum3[i])
    else:
        pass
    
#define matrix of transition of states
M_array = []
for a in range(len(state_space)):
    for b in range(len(state_space)):
        M_array.append(state_space[b][0]+state_space[a][0])

#reshaping the array into a n by n matrix
M = np.reshape(M_array,(len(state_space),len(state_space)))
# print(M)
#define a list of state sequence
states = [current_state] #Since initial state is Rest

i = 1
transition_list = []
#transitions
while i != period:
    for j in range(len(state_space)):        
        if current_state == state_space[j]:
            transition = np.random.choice(M[:,j], replace = True, p = P[:,j])
            transition_list.append(transition)
            for k in range(len(state_space)):                
                if transition == M[k][j]:
                    current_state = state_space[k]
                    states.append(state_space[k])
                    break      
                else:
                    pass
            break
        else:
            pass
    i += 1
          
print("Markov Chain of {} states".format(len(state_space)))
#number of each element
print()
num_ele = []
for i in range(len(state_space)):
    num_ele.append(states.count(state_space[i]))
    print("Number of times in state " + state_space[i] + " is",num_ele[i])

#Final limiting probability distribution
print()
num_dis = np.reshape(num_ele, (len(num_ele),1))
p_dis = num_dis/period
print(p_dis)

#To calculate number of transitions
num_trans_array = []
for i in range(len(M[0])):
    for j in range(len(M[0])):
        num_trans_array.append(transition_list.count(M[j,i]))

num_obs_trans = np.reshape(num_trans_array,(len(M[0]),len(M[0])))
col_sum_trans = num_obs_trans.sum(axis=0)            

print()
print(num_obs_trans)

print()
print(P)
