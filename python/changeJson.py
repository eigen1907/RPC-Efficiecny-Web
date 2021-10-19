import pandas as pd
from pprint import pprint
import json
import copy

f = open("/Users/mainroot/CMS-RPC/RPC_efficiency_web/Web/Data/RPC_Chambers_coordinates_mine.txt", "r")

lines = f.readlines()

txt_lists = []
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
    
    txt_list = [name + "_" + sector, [[p1_x, p1_y], [p2_x, p2_y], [p3_x, p3_y], [p4_x, p4_y]]]
    txt_lists.append(txt_list)

txt_geom_dict = dict(txt_lists)

txt_geom_dict_origin = copy.deepcopy(txt_geom_dict)

for i in range(1, 13):
    ### For RB2_out
    f_key = f"RB2out_F_{i}"
    b_key = f"RB2out_B_{i}"

    middle1_x = (txt_geom_dict[f_key][1][0] + txt_geom_dict[b_key][2][0]) / 2
    middle1_y = (txt_geom_dict[f_key][1][1] + txt_geom_dict[b_key][2][1]) / 2

    middle2_x = (txt_geom_dict[f_key][0][0] + txt_geom_dict[b_key][3][0]) / 2
    middle2_y = (txt_geom_dict[f_key][0][1] + txt_geom_dict[b_key][3][1]) / 2


    txt_geom_dict[f_key][1][0] = middle1_x
    txt_geom_dict[b_key][2][0] = middle1_x

    txt_geom_dict[f_key][1][1] = middle1_y
    txt_geom_dict[b_key][2][1] = middle1_y

    txt_geom_dict[f_key][0][0] = middle2_x
    txt_geom_dict[b_key][3][0] = middle2_x

    txt_geom_dict[f_key][0][1] = middle2_y
    txt_geom_dict[b_key][3][1] = middle2_y

    ### For RB2_in
    f_key = f"RB2in_F_{i}"
    b_key = f"RB2in_B_{i}"
    m_key = f"RB2in_M_{i}"

    new_p1_x = txt_geom_dict[f_key][3][0] + (txt_geom_dict[b_key][0][0] - txt_geom_dict[f_key][3][0])*2/3
    new_p1_y = txt_geom_dict[f_key][3][1] + (txt_geom_dict[b_key][0][1] - txt_geom_dict[f_key][3][1])*2/3

    new_p2_x = txt_geom_dict[f_key][2][0] + (txt_geom_dict[b_key][1][0] - txt_geom_dict[f_key][2][0])*2/3
    new_p2_y = txt_geom_dict[f_key][2][1] + (txt_geom_dict[b_key][1][1] - txt_geom_dict[f_key][2][1])*2/3

    new_p3_x = txt_geom_dict[f_key][2][0] + (txt_geom_dict[b_key][1][0] - txt_geom_dict[f_key][2][0])*1/3
    new_p3_y = txt_geom_dict[f_key][2][1] + (txt_geom_dict[b_key][1][1] - txt_geom_dict[f_key][2][1])*1/3

    new_p4_x = txt_geom_dict[f_key][3][0] + (txt_geom_dict[b_key][0][0] - txt_geom_dict[f_key][3][0])*1/3
    new_p4_y = txt_geom_dict[f_key][3][1] + (txt_geom_dict[b_key][0][1] - txt_geom_dict[f_key][3][1])*1/3

    txt_geom_dict[f_key][0][0] = new_p4_x
    txt_geom_dict[f_key][0][1] = new_p4_y

    txt_geom_dict[f_key][1][0] = new_p3_x
    txt_geom_dict[f_key][1][1] = new_p3_y

    txt_geom_dict[b_key][2][0] = new_p2_x
    txt_geom_dict[b_key][2][1] = new_p2_y
    
    txt_geom_dict[b_key][3][0] = new_p1_x
    txt_geom_dict[b_key][3][1] = new_p1_y

    txt_geom_dict[m_key] = [[new_p1_x, new_p1_y], [new_p2_x, new_p2_y], [new_p3_x, new_p3_y], [new_p4_x, new_p4_y]]


with open("/Users/mainroot/CMS-RPC/RPC_efficiency_web/Web/Data/rpcGeomMine.json", "r") as json_data:

    json_dict = json.load(json_data)

json_geom_dict = json_dict["geometry"]

new_dict = {}

for key, value in json_geom_dict.items():
    txt_key = ""
    # example key: 'W-2_RB4++_S09_Backward'
    if key[0:1] == "W":
        txt_key += key[4:7] # txt_key : RB4
        if key[7:8] == "-":
            if key[7:9] == "--":
                txt_key += "--" # txt_key : RB4--
                txt_key += "_" + key[14] + "_" # txt_key : RB4--_B_
                if key[11] != "0":
                    txt_key += key[11:13]   #txt_key : RB4--_B_09
                else:
                    txt_key += key[12]
            else:
                txt_key += "-"  # txt_key : RB4-
                txt_key += "_" + key[13] + "_" # txt_key : RB4-_B_
                if key[10] != "0":
                    txt_key += key[10:12]   #txt_key : RB4-_B_09
                else:
                    txt_key += key[11]
        
        if key[7:8] == "_":
            txt_key += "-" # txt_key : RB4-        ## "W+2_RB4_S11_Backward" should be matched by "RB4-" (sector 11)
            txt_key += "_" + key[12] + "_"   # txt_key : RB4-_B_
            if key[9] != "0":
                txt_key += key[9:11]   #txt_key : RB4-_B_11
            else:
                txt_key += key[10]
        
        if key[7:8] == "+":
            if key[7:9] == "++":
                txt_key += "++" # txt_key : RB4++
                txt_key += "_" + key[14] + "_" # txt_key : RB4++_B_
                if key[11] != "0":
                    txt_key += key[11:13]   #txt_key : RB4++_B_09
                else:
                    txt_key += key[12]
            else:
                txt_key += "+"  # txt_key : RB4+
                txt_key += "_" + key[13] + "_" # txt_key : RB4+_B_
                if key[10] != "0":
                    txt_key += key[10:12]   #txt_key : RB4+_B_09
                else:
                    txt_key += key[11]

        if key[7:9] == "in":
            txt_key += "in" # txt_key : RB2in
            txt_key += "_" + key[14] + "_" # txt_key : RB2in_F_
            if key[11] != "0":
                txt_key += key[11:13]   # txt_key : RB2in_F_06
            else:
                txt_key += key[12]

        if key[7:10] == "out":
            txt_key += "out"    #txt_key : RB2out
            txt_key += "_" + key[15] + "_" # txt_key : RB2out_F_
            if key[12] != "0":
                txt_key += key[12:14]   # txt_key : RB2out_F_06
            else:
                txt_key += key[13]

    if key[0:1] == "R":
        txt_key += "Ring"
        txt_key += key[6] + key[13] + "_" # txt_key : Ring3C_
        if key[10] != "0":
            txt_key += key[10:12]
        else:
            txt_key += key[11]


    ### try add new_dict's element
    if key[0:3] == "W-2" or key[0:3] == "W+2":
        new_dict[key] = txt_geom_dict_origin[txt_key]
    else:
        new_dict[key] = txt_geom_dict[txt_key]

json_dict["geomForInitBarrel"] = new_dict

with open('/Users/mainroot/CMS-RPC/RPC_efficiency_web/Web/Data/rpcGeomTest.json', 'w', encoding='utf-8') as make_file:

    json.dump(json_dict, make_file, indent="\t")


