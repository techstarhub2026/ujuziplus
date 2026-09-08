import urllib.request
import json

url = "https://reau.proxy.rlwy.net:50268"

try:
    ctx = None
    try:
        import certifi
        ctx = ssl.create_default_context(cafile=certifi.where())
    except:
        pass
    
    req = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(req, timeout=2, context=ctx) as resp:
        print(f"Port is open: {resp.status}")
except Exception as e:
    print(f"Cannot reach (expected for raw DB port): {e}")
