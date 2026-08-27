import os
import sys
import re
import json
import httpx

if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

client = httpx.Client(verify=False, timeout=25.0, follow_redirects=True)
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "*/*",
}

js_files = [
    "/libs/simplegrid/rajyasaba.js",
    "/libs/simplegrid/loksaba.js",
    "/libs/simplegrid/preLoginDashboard.js",
]

for rel_js in js_files:
    url = f"https://www.mplads.mospi.gov.in{rel_js}"
    print(f"Fetching {url} ...")
    try:
        r = client.get(url, headers=headers)
        print(f"  Status: {r.status_code}, Length: {len(r.text)} bytes")
        filename = os.path.basename(rel_js)
        out_path = os.path.join("data/raw/rajya_sabha", filename)
        with open(out_path, "w", encoding="utf-8") as f:
            f.write(r.text)
            
        # Search for URLs in this JS file
        ajax_urls = re.findall(r'url:\s*["\']([^"\']+)["\']', r.text)
        post_urls = re.findall(r'\$\.post\(["\']([^"\']+)["\']', r.text)
        get_urls = re.findall(r'\$\.get\(["\']([^"\']+)["\']', r.text)
        ajax_raw = re.findall(r'\$\.ajax\(\s*["\']([^"\']+)["\']', r.text)
        
        # Check reversed strings
        rev_matches = re.findall(r'"([^"]+)"\.split\(""\)\.reverse\(\)\.join\(""\)', r.text)
        deobfuscated = [s[::-1] for s in rev_matches]
        
        all_endpoints = list(set(ajax_urls + post_urls + get_urls + ajax_raw + deobfuscated))
        print(f"  Endpoints found in {filename} ({len(all_endpoints)}):")
        for u in sorted(all_endpoints):
            print(f"    -> {u}")
            
    except Exception as e:
        print(f"  Error fetching {url}: {e}")
