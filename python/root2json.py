#!/usr/bin/env python
from ROOT import *
import sys, os

finName = sys.argv[1]
if not os.path.exists(finName):
    print("Cannot find input file\"", finName, '"')
    os.exit()

foutName = sys.argv[2]

## Histograms
titles = ["Cluster Size Mean Value", "Residuals Mean Value", "Average Strip Efficiency", "Expected Occupancy",
          "Fiducial Cut Efficiency", "RPC Occupancy from DT", "RPC Occupancy", "Total Efficiency"]
prefixes = ["AverageCLS", "AverageResiduals", "AverageStripEff", "ExpOcc",
            "FiducialCutEff", "RPCOcc", "RPCRealOcc", "TotalEff"]

## Open the root file to analyze
f = TFile(finName)
rollNames = []
values = []

## Start from the rolls in the Barrel region
d = f.Get("Barrel")
suffixes = ["W%d" % wheel for wheel in range(-2,3)]

hists = {}
for suffix in suffixes:
    hs = []
    for title, prefix in zip(titles, prefixes):
        name = "%s%s" % (prefix, suffix)
        h = d.Get(name)
        hs.append(h)
    hists[suffix] = hs

##sec2nRolls:    S1  S2  S3  S4  S5  S6  S7  S8  S9 S10 S11 S12
sec2nRolls = [0, 17, 17, 17, 21, 17, 17, 17, 17, 15, 17, 15, 17]
for wheel in range(-2, 3):
    hs = hists["W%d" % wheel]
    for sector in range(1, 13):
        nRolls = sec2nRolls[sector]

        xlabel = hs[0].GetXaxis().GetBinLabel(sector)
        for iRoll in range(1, nRolls+1):
            ylabel = hs[0].GetYaxis().GetBinLabel(iRoll)
            #rollName = "Wheel%d  S%s_%s" % (wheel, xlabel, ylabel)
            l1, l2 = ylabel.replace(",","").split('_')
            ## Special case to convert DQM axis label to the standard nomenclature: there's no +/- for W0 RB4 S09 and S11
            if (sector in (9, 11)) and l1.startswith("RB4"): l1 = "RB4"
            l2 = l2.replace('F','Forward').replace('B','Backward').replace('M', 'Middle')
            rollName = "W%+d_%s_S%02d_%s" % (wheel, l1, sector, l2)
            rollNames.append(rollName)
            values.append([rollName]+[h.GetBinContent(sector,iRoll) for h in hs])

## Continue to the rolls in the Endcap region
d = f.Get("Endcap")
suffixes = ["D%d" % disk for disk in range(-4, 5) if d != 0]

hists = {}
for suffix in suffixes:
    hs = []
    for title, prefix in zip(titles, prefixes):
        name = "%s%s" % (prefix, suffix)
        h = d.Get(name)
        hs.append(h)
    hists[suffix] = hs

for disk in range(-4, 5):
    if disk == 0: continue
    hs = hists["D%d" % disk]
    for sector in range(1,37):
        ## Ring2
        for iRoll, roll in enumerate(["Ring2 C", "Ring2 B", "Ring2 A", "Ring3 C", "Ring3 B", "Ring3 A"]):
            iRoll += 1
            #rollName = "RE%d %s %d" % (disk, roll, sector)
            ring, roll = roll.split()
            rollName = "RE%+d_R%s_CH%02d_%s" % (disk, ring[-1], sector, roll)

            rollNames.append(rollName)
            values.append([rollName]+[h.GetBinContent(sector,iRoll) for h in hs])

## Put into the pandas dataframe and export to any convenient format
import pandas as pd
import gzip
df = pd.DataFrame(values, columns=(['Chamber']+titles))
dff = df.set_index("Chamber")

if foutName.endswith('json'):
    dff.to_json(foutName, orient="split")

elif foutName.endswith('json.gz'):
    with gzip.open(foutName, 'wb') as fout:
        fout.write(dff.to_json(orient="split"))

elif foutName.endswith('tex'):
    df.to_latex(foutName, column_format=("|".join(["l"]+(["c"]*len(prefix)))))

"""with open("out_Wheel.tex", 'w') as fout:
    df_W = df[df["Chamber"].str.startswith("Wheel")]
    fout.write(df_W.to_latex(column_format=("|".join(["l"]+(["c"]*len(prefix)))),
                             index=False))
with open("out_Disk.tex", 'w') as fout:
    df_D = df[df["Chamber"].str.startswith("RE")]
    fout.write(df_D.to_latex(column_format=("|".join(["l"]+(["c"]*len(prefix)))),
                             index=False))
"""
