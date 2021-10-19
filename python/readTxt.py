import pandas as pd
from pprint import pprint

f = open("/Users/mainroot/CMS-RPC/RPC_efficiency_web/Web/Data/RPC_Chambers_coordinates_mine.txt", "r")

lines = f.readlines()

"""
for i in range(133):
    print(f"lines[0][0:{i}]: {lines[0][0:i]}")
"""

obj_lists = []


for line in lines:
    name = line[0:10]
    name = name.replace(" ", "")
    name = name.replace(",", "")

    sector = line[10:15]
    sector = sector.replace(" ", "")

    p1_x = line[40:49]
    p1_x = p1_x.replace(" ", "")
    
    p1_x = float(p1_x)

    
    p1_y = line[50:59]
    p1_y = p1_y.replace(" ", "")
    
    p1_y = float(p1_y)
    
    p2_x = line[64:73]
    p2_x = p2_x.replace(" ", "")
    
    p2_x = float(p2_x)
    
    p2_y = line[74:83]
    p2_y = p2_y.replace(" ", "")
    
    p2_y = float(p2_y)
    
    p3_x = line[88:97]
    p3_x = p3_x.replace(" ", "")
    
    p3_x = float(p3_x)
    
    p3_y = line[98:107]
    p3_y = p3_y.replace(" ", "")
    
    p3_y = float(p3_y)
    

    p4_x = line[112:121]
    p4_x = p4_x.replace(" ", "")
    
    p4_x = float(p4_x)
    
    p4_y = line[122:131]
    p4_y = p4_y.replace(" ", "")
    
    p4_y = float(p4_y)
    

    #obj_list = [name, sector, p1, p2, p3, p4]
    obj_list = [name + "_" + sector, [[p1_x, p1_y], [p2_x, p2_y], [p3_x, p3_y], [p4_x, p4_y]]]
    obj_lists.append(obj_list)


print(len(obj_lists))

geomdict = dict(obj_lists)

print(len(geomdict))

pprint(geomdict)