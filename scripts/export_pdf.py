import os
import subprocess
import markdown

def generate_pdf():
    readme_path = os.path.abspath('README.md')
    html_path = os.path.abspath('temp_dossier.html')
    pdf_path = os.path.abspath('JanDrishti_SIH26102_Documentation.pdf')

    print(f"Reading {readme_path}...")
    with open(readme_path, 'r', encoding='utf-8') as f:
        md_content = f.read()

    print("Converting Markdown to HTML...")
    html_body = markdown.markdown(
        md_content,
        extensions=['tables', 'fenced_code', 'toc', 'attr_list', 'def_list', 'sane_lists']
    )

    full_html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>JanDrishti — SIH26102 Master Technical Dossier & Statutory Report</title>
<style>
  @page {{
    size: A4;
    margin: 15mm 14mm 15mm 14mm;
  }}
  * {{
    box-sizing: border-box;
  }}
  body {{
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #121316;
    line-height: 1.45;
    font-size: 9pt;
    background: #fff;
    margin: 0;
    padding: 0;
  }}
  h1, h2, h3, h4 {{
    font-family: Georgia, 'Times New Roman', serif;
    color: #121316;
    margin-top: 1.2em;
    margin-bottom: 0.4em;
    page-break-after: avoid;
    break-after: avoid;
  }}
  h1 {{
    font-size: 19pt;
    font-weight: 700;
    border-bottom: 2.5px solid #C85A32;
    padding-bottom: 6px;
    color: #121316;
    margin-top: 0.5em;
  }}
  h2 {{
    font-size: 13pt;
    font-weight: 600;
    border-bottom: 1px solid #E4E2DC;
    padding-bottom: 3px;
    margin-top: 1.6em;
    color: #C85A32;
  }}
  h3 {{
    font-size: 10.5pt;
    font-weight: 600;
    color: #121316;
    margin-top: 1em;
  }}
  p, li {{
    color: #27272a;
    font-size: 8.5pt;
  }}
  ul, ol {{
    margin: 4px 0 10px 0;
    padding-left: 20px;
  }}
  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 7.5pt;
    page-break-inside: avoid;
    break-inside: avoid;
  }}
  th, td {{
    border: 1px solid #d4d4d8;
    padding: 4px 6px;
    text-align: left;
    vertical-align: top;
  }}
  th {{
    background-color: #f4f4f5;
    font-weight: 600;
    color: #18181b;
  }}
  tr:nth-child(even) td {{
    background-color: #fafafa;
  }}
  pre, code {{
    font-family: 'Cascadia Code', Consolas, 'Courier New', monospace;
    font-size: 7.5pt;
  }}
  code {{
    background: #f4f4f5;
    padding: 1px 3px;
    border-radius: 3px;
    border: 1px solid #e4e4e7;
    color: #09090b;
  }}
  pre {{
    background: #18181b;
    color: #f4f4f5;
    padding: 8px 12px;
    border-radius: 4px;
    overflow-x: auto;
    page-break-inside: avoid;
    break-inside: avoid;
    line-height: 1.3;
  }}
  pre code {{
    background: transparent;
    border: none;
    color: inherit;
    padding: 0;
  }}
  blockquote {{
    border-left: 3.5px solid #C85A32;
    background: #faf8f5;
    margin: 10px 0;
    padding: 6px 12px;
    color: #3f3f46;
    font-style: italic;
    page-break-inside: avoid;
    break-inside: avoid;
  }}
  hr {{
    border: none;
    border-top: 1px solid #E4E2DC;
    margin: 16px 0;
  }}
  a {{
    color: #C85A32;
    text-decoration: none;
  }}
</style>
</head>
<body>
{html_body}
</body>
</html>"""

    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(full_html)
    print(f"Wrote temporary HTML to {html_path}")

    # Search for Chrome or Edge
    browser_candidates = [
        r"C:\Program Files\Google\Chrome\Application\chrome.exe",
        r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
        r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"
    ]
    browser_bin = None
    for b in browser_candidates:
        if os.path.exists(b):
            browser_bin = b
            break

    if not browser_bin:
        raise RuntimeError("Neither Chrome nor Edge was found on this system.")

    print(f"Using browser: {browser_bin}")
    cmd = [
        browser_bin,
        "--headless=new",
        "--disable-gpu",
        "--run-all-compositor-stages-before-draw",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_path}",
        html_path
    ]

    print("Running print-to-pdf command...")
    res = subprocess.run(cmd, capture_output=True, text=True, timeout=60)
    print("Browser exit code:", res.returncode)

    if os.path.exists(pdf_path):
        size_mb = os.path.getsize(pdf_path) / (1024 * 1024)
        print(f"SUCCESS: Generated PDF at {pdf_path} ({size_mb:.2f} MB)")
    else:
        print("ERROR: PDF was not generated. Stderr:", res.stderr)

    if os.path.exists(html_path):
        os.remove(html_path)
        print(f"Cleaned up {html_path}")

if __name__ == '__main__':
    generate_pdf()
