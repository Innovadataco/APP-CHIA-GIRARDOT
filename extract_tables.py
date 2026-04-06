import xml.etree.ElementTree as ET
import json

def extract_tables(xml_path):
    tree = ET.parse(xml_path)
    root = tree.getroot()
    ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
    
    tables = []
    for tbl in root.findall('.//w:tbl', ns):
        rows = []
        for tr in tbl.findall('.//w:tr', ns):
            cells = []
            for tc in tr.findall('.//w:tc', ns):
                # Extract text from all paragraphs in the cell
                text = "".join([t.text for t in tc.findall('.//w:t', ns) if t.text])
                cells.append(text.strip())
            rows.append(cells)
        tables.append(rows)
    return tables

if __name__ == "__main__":
    data = extract_tables('._temp_docx/document.xml')
    with open('._temp_docx/tables.json', 'w') as f:
        json.dump(data, f, indent=2)
    print(f"Extracted {len(data)} tables.")
