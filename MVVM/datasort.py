import pandas as pd 
import numpy as np

def data_sorter(file,subject):
    # Read file and produce data frame for intended subject only
    df = pd.read_csv(file) 
    df = df.loc[df['subject'] == subject]

    # Compute number of states
    num_states = int(np.sqrt(len(df.columns)-2))
    
    # Manipulating dataframe values into intended format
    for i in range (num_states):
        # compute column sum for each node
        df['Node '+str(i)+' Total']= df.iloc[:, (2+i*num_states):(2+(i+1)*num_states)].sum(axis=1)

        # Compute probability of each column
        for j in range(num_states):
            # Divide columns with column sums
            df.iloc[:,2+j+i*num_states]= df.iloc[:,2+j+i*num_states]/df.iloc[:,-1]
    
            # Replace NaN with 0 (due to dividing by 0)
            df.iloc[:,2+j+i*num_states]= df.iloc[:,2+j+i*num_states].fillna(0)
            
    data_set = []

    # Iterate over rows
    for index in range(len(df.index)):
    # for index in range(1):
        matrix_list = []
    
        # Wrapping elements into matrix form
        for i in range(num_states):
            # Add matrix into correct subjects with date keys
            matrix_list.append(df.iloc[index][2+i*num_states:2+(i+1)*num_states].to_list())
    
        # Transpose to fit data format
        matrix_list = np.transpose(matrix_list).tolist()
    
        # Append list onto list
        data_set.append([df.iloc[index][1],matrix_list])
    
    return data_set

def subject_list(file):
    # Read file to make dataframe
    df = pd.read_csv(file) 
    
    # Obtain list of subjects
    states_column = list(df['subject'])

    # Remove duplicates
    states_list = list(dict.fromkeys(states_column,[]))
    
    return states_list

def state_name(file,subject):
    # Read file to make dataframe
    df = pd.read_csv(file) 
    df = df.loc[df['subject'] == subject]
    
    # Compute number of states
    num_states = int(np.sqrt(len(df.columns)-2))
    
    # Get column names
    states = list(df.columns)[2:]
    state_name = []
    
    # Append extracted name to list
    for i in range(num_states):
        name = states[i*num_states]
        end_index = name.find('>')
        state_name.append(name[:end_index])
    
    return state_name
