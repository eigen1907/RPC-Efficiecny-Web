#!/usr/bin/env python
import pandas as pd
import sys, os

finName = "../data/common/rpcGeom.txt"
doutName = "../data/common"

df = pd.read_table(finName, sep="\s+", header=0)
df.rename({"#RollName":"RollName"}, axis=1, inplace=True)

detTree = {
    "Barrel":{
        "W-2":[], "W-1":[], "W0":[], "W1":[], "W2":[]
    }, 
    "Endcap":{
        "RE-4":[], "RE-3":[], "RE-2":[], "RE-1":[],
        "RE4":[], "RE3":[], "RE2":[], "RE1":[],
    },
    "BarrelLayer":{
        "RB1in":[], "RB1out":[], "RB2in":[], "RB2out":[], "RB3":[], "RB4":[],
    },
}

detGeoms = {}
detProperties = {}

for item in df.values:
    name = item[0]
    x1, y1, z1 = item[ 3: 6]
    x2, y2, z2 = item[ 6: 9]
    x3, y3, z3 = item[ 9:12]
    x4, y4, z4 = item[12:15]

    detGeoms[name] = [ [x1, y1, z1], [x2, y2, z2], [x3, y3, z3], [x4, y4, z4], ]

    if name.startswith("W"):
        prefix = 'W%d' % int(name[1:3])
        detTree["Barrel"][prefix].append(name)

        wheel, stla, sector, roll = name.split('_')
        wheel = int(wheel[1:])
        sector = int(sector[1:].lstrip('0'))
        station = int(stla[2])
        layer = 2 if stla.endswith('out') else 1
        stla = stla.rstrip('-').rstrip('+')

        detTree["BarrelLayer"][stla].append(name)

        detProperties[name] = {
            'region':0, 'wheel':wheel, 'sector':sector, 
            'station':station, 'layer':layer,
        }
    else:
        prefix = 'RE%d' % int(name[2:4])
        detTree["Endcap"][prefix].append(name)

        disk, ring, sector, roll = name.split('_')
        disk = int(disk[2:])
        ring = int(ring[1:])
        sector = int(sector[2:].lstrip('0'))
        region = int(disk/abs(disk))

        detProperties[name] = {
            'region':region, 'disk':disk, 
            'sector':sector, 'ring':ring,
        }

import json
outdata = {
    'structure':detTree,
    'geometry':detGeoms,
    'properties':detProperties,
}
#json.dump(outdata, open("%s/rpcGeom.json" % doutName, 'w'), indent=4)
json.dump(outdata, open("%s/rpcGeom.json" % doutName, 'w'))
