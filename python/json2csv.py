import json
import pandas as pd
import os


def json2csv(jsonPath, csvPath, fileName):
    with open(jsonPath + fileName, "r") as f:
        json_data = json.load(f)
        df = pd.DataFrame(data=json_data["data"], index=json_data["index"], columns=list(map(lambda x: x.replace(' ', '_'), json_data["columns"])))
        df.to_csv(csvPath + fileName[0:-5] + ".tsv", index_label="Chamber_Name", sep="\t")

path = "/Users/mainroot/CMS-RPC/RPC_efficiency_web/Web/space/data/"

json343Path = path + "json/343/"
csv343Path = path + "tsv/343/"

json344Path = path + "json/344/"
csv344Path = path + "tsv/344/"

fileNames = os.listdir(json343Path)
for fileName in fileNames:
    try:
        json2csv(json343Path, csv343Path, fileName)
    except:
        print(fileName)

fileNames = os.listdir(json344Path)
for fileName in fileNames:
    try:
        json2csv(json344Path, csv344Path, fileName)
    except:
        print(fileName)