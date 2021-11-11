import json
from pprint import pprint

with open("/Users/mainroot/CMS-RPC/RPC_efficiency_web/Web/Data/rpcGeom.json", "r") as rpcGeomJson:

    rpcGeomDict = json.load(rpcGeomJson)

geometryDict = rpcGeomDict["geometry"]
propertiesDict = rpcGeomDict["properties"]
structureDict = rpcGeomDict["structure"]


print((geometryDict.keys()))



