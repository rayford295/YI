from pathlib import Path
import json
DIGITS='0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
def check(body):
 p=36
 for c in body:p=(((p+DIGITS.index(c))%36 or 36)*2)%37
 return DIGITS[(37-p)%36]
def base36(number):
 result=''
 while number:result=DIGITS[number%36]+result;number//=36
 return result or '0'
def decode(code):
 if len(code)<3 or check(code[:-1])!=code[-1] or code[0] not in 'JY':return None
 mask=int(code[1:-1],36)
 return (code[0],mask) if mask<512 else None
codes=[p+base36(mask)+check(p+base36(mask)) for p in 'JY' for mask in range(512)]
substitutions=swaps=0;accepted_substitutions=[];accepted_swaps=[];checksum_swaps=[]
for code in codes:
 for i,c in enumerate(code):
  for d in DIGITS:
   if d!=c:
    substitutions+=1;candidate=code[:i]+d+code[i+1:]
    if decode(candidate) is not None:accepted_substitutions.append([code,candidate])
 for i in range(len(code)-1):
  if code[i]!=code[i+1]:
   swaps+=1;candidate=code[:i]+code[i+1]+code[i]+code[i+2:]
   if check(candidate[:-1])==candidate[-1]:checksum_swaps.append([code,candidate])
   if decode(candidate) is not None:accepted_swaps.append([code,candidate])
report={'codes':len(codes),'single_character_substitution_attempts':substitutions,'accepted_substitutions':accepted_substitutions,'adjacent_unequal_swap_attempts':swaps,'checksum_accepted_swaps':checksum_swaps,'decoder_accepted_swaps':accepted_swaps}
(Path(__file__).parent/'checksum-audit.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report,indent=2))
