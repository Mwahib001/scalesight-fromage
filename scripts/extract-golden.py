import json,re,pathlib
from pypdf import PdfReader
root=pathlib.Path(__file__).resolve().parents[1]
s=(root/'docs/spec.txt').read_text()
a=s[s.rindex('17.A Expanded shipment records'):s.rindex('17.B Complete weekly net projections')]
ship=[dict(week_start=d,account_id=a,sku_id=k,shipped_packs=int(q)) for d,a,k,q in re.findall(r'(2026-\d\d-\d\d)\s+(AC-0[123])\s+(FR-\w+)\s+(\d+)',a)]
b=s[s.rindex('17.B Complete weekly net projections'):s.rindex('17.C Full physical-stock and backlog')]
nets=[]
for case,body in re.findall(r'\n(S[0-7])\s*\n(.*?)(?=\nS[0-7]\s*\n|Machine-readable expected summaries)',b,re.S):
 for w,x,y,z in re.findall(r'\n W(\d+)\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)',body):
  for sku,n in zip(['FR-MC','FR-VB','FR-SC'],[x,y,z]): nets.append(dict(scenario=case,week=int(w),sku=sku,net=int(n)))
c=s[s.rindex('17.C Full physical-stock and backlog'):s.rindex('17.D Phase-by-phase section')]
ledger=[]
parts=re.split(r'\n(S[0-7]) — SKU/week detail',c)
for i in range(1,len(parts),2):
 for row in re.findall(r'\n W(\d+)\s+(FR-\w+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)',parts[i+1]):
  w,sku,*values=row
  ledger.append(dict(scenario=parts[i],week=int(w),sku=sku,**dict(zip(['requirement','receipt','net','physical','backlog','buffer'],map(float,values)))))
assert (len(ship),len(nets),len(ledger))==(72,288,288),(len(ship),len(nets),len(ledger))
for name,data in [('shipments',ship),('net',nets),('ledger',ledger)]: (root/f'tests/golden/{name}.json').write_text(json.dumps(data,indent=2)+'\n')
links=[]
for page in PdfReader(root/'docs/ScaleSight_Fromage_Technical_Specification_Wahib_v1.pdf').pages:
 for a in page.get('/Annots',[]):
  obj=a.get_object(); uri=obj.get('/A',{}).get('/URI')
  if uri and uri not in links: links.append(uri)
(root/'docs/source-links.json').write_text(json.dumps(links,indent=2)+'\n')
print('Extracted 72 shipments, 288 net positions, 1,728 ledger cells.');print(json.dumps(links,indent=2))
