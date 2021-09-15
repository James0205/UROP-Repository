import numpy as np

def compiled_list(data_set):
    shape = np.array(data_set[0][1]).shape
    month_sum = np.ones(shape)
    column_sum = []
    month = "0"
    compiled_list = []
    for date,matrix in data_set:
        if month == date[:7] and date != data_set[-1][0]:
            month_sum+=np.array(matrix)
            
        elif month == date[:7] and date == data_set[-1][0]:
            month_sum+=np.array(matrix)
            column_sum = month_sum.sum(axis=0)
            column_sum = np.where(column_sum <= 0,1,column_sum) #replace 0 with 1
            month_sum /= column_sum #normalise column
            compiled_list.append([month,month_sum])
            
        else:
            column_sum = month_sum.sum(axis=0)
            column_sum = np.where(column_sum <= 0,1,column_sum) #replace 0 with 1
            month_sum /= column_sum #normalise column
            compiled_list.append([month,month_sum])
            month = date[:7]
            month_sum = np.array(matrix)
    compiled_list.pop(0)
    return compiled_list

def subject_average(compiled_list):
    shape = compiled_list[0][1].shape
    subject_average = np.zeros(shape)
    for date,matrix in compiled_list:
        subject_average += matrix
    column_sum = subject_average.sum(axis=0)
    column_sum = np.where(column_sum <= 0,1,column_sum) #replace 0 with 1
    subject_average /= column_sum #normalise column
    return subject_average
