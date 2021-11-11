import pandas as pd

run_json = pd.read_json("/Users/mainroot/CMS-RPC/RPC_efficiency_web/Web/space/data/common/runs.json")

print(run_json.head())

run_json.to_csv("/Users/mainroot/CMS-RPC/RPC_efficiency_web/Web/space/data/common/runs.csv", index=False)

