import json

def sync():
    with open('._temp_docx/tables.json', 'r') as f:
        tables = json.load(f)

    # 1. DOMINIOS (Table 9)
    doms = {r[0]: {"cod": r[0], "name": r[1], "desc": r[2]} for r in tables[9][1:] if len(r) >= 3}

    # 2. AREAS (Table 10) - Extended with Legacy for completeness (AS-07 to AS-12)
    legacy_as = {
        "AS-07": {"cod": "AS-07", "name": "Transporte P\u00fablico", "desc": "Gesti\u00f3n de operaciones masivas e intermodalidad."},
        "AS-08": {"cod": "AS-08", "name": "Carga y Log\u00edstica", "desc": "Administraci\u00f3n de veh\u00edculos comerciales y control de flotas."},
        "AS-09": {"cod": "AS-09", "name": "Fiscalizaci\u00f3n Vial", "desc": "Control de infracciones y cumplimiento de restricciones."},
        "AS-10": {"cod": "AS-10", "name": "Gesti\u00f3n Multimodal", "desc": "Integraci\u00f3n de m\u00faltiples modos de transporte."},
        "AS-11": {"cod": "AS-11", "name": "Infraestructura y Activos", "desc": "Monitoreo de salud estructural de puentes, t\u00faneles y taludes."},
        "AS-12": {"cod": "AS-12", "name": "Soberan\u00eda Digital y Continuidad", "desc": "Gobernanza del dato y ciberseguridad industrial."}
    }
    ass = {r[0]: {"cod": r[0], "name": r[1], "desc": r[2]} for r in tables[10][1:] if len(r) >= 3}
    for k, v in legacy_as.items():
        if k not in ass: ass[k] = v

    # 3. SE (Table 11)
    ses = {r[0]: {"cod": r[0], "name": r[1], "cat": r[2]} for r in tables[11][1:] if len(r) >= 3}

    # 4. SUB (Table 12) - Extended with Legacy (SUB-08 to SUB-12)
    legacy_sub = {
        "SUB-08": {"cod": "SUB-08", "sigla": "TES", "name": "Traffic Enforcement System", "desc": "Sistemas de foto-detecci\u00f3n e infracciones."},
        "SUB-09": {"cod": "SUB-09", "sigla": "ESS-M", "name": "Environmental Sensor Management", "desc": "Gesti\u00f3n de sensores clim\u00e1ticos y ambientales."},
        "SUB-10": {"cod": "SUB-10", "sigla": "ESB", "name": "Enterprise Service Bus", "desc": "Middleware de integraci\u00f3n y orquestaci\u00f3n de datos."},
        "SUB-11": {"cod": "SUB-11", "sigla": "BIM-DT", "name": "Digital Twin Framework", "desc": "Plataforma de Gemelo Digital e integraci\u00f3n GIS."},
        "SUB-12": {"cod": "SUB-12", "sigla": "NMS", "name": "Network Management System", "desc": "Gesti\u00f3n de infraestructura de red y ciberseguridad."}
    }
    subs = {r[0]: {"cod": r[0], "sigla": r[1], "name": r[2], "desc": r[3]} for r in tables[12][1:] if len(r) >= 4}
    for k, v in legacy_sub.items():
        if k not in subs: subs[k] = v

    # 5. FN (Table 13)
    fns = {r[0]: {"id": r[0], "name": r[1], "desc": r[2]} for r in tables[13][1:] if len(r) >= 3}

    # 6. CC (Table 14)
    ccs = {r[0]: {"id": r[0], "sigla": r[1], "name": r[2], "cap": r[3]} for r in tables[14][1:] if len(r) >= 4}

    import re

    # 7. EOVs (Tables 16-30)
    eovs = []
    for i in range(16, 31):
        tbl = tables[i]
        e = {"id": "", "ico": "🚀", "type": "p"} # Default
        alertas = []
        kpis = []
        
        current_section = None
        for row in tbl:
            if len(row) < 1: continue
            raw_k = row[0].strip()
            k = raw_k.lower()
            v = row[1].strip() if len(row) > 1 else ""

            if "alertas del sistema" in k: current_section = "alertas"; continue
            if "contingencia" in k: current_section = "contingencia"; continue
            if "criterios de" in k: current_section = "criterios"; continue
            if "evolución tecnológica" in k or "evolucion" in k: current_section = "evolucion"; continue
            if "indicadores" in k or "kpi" in k: current_section = "kpis"; continue
            if "información al usuario" in k or "informacion" in k: current_section = "usuario"; continue

            if current_section in ["alertas", "kpis"]:
                if raw_k in ["1", "2", "3", "4", "5"]:
                    if current_section == "alertas" and v: alertas.append(v)
                    if current_section == "kpis" and v: kpis.append(v)
                elif v and raw_k not in ["1", "2", "3", "4", "5"]:
                    current_section = None
            
            if not v: continue
            
            if "código" in k or "codigo" in k: e["id"] = v
            elif "nombre" in k: e["name"] = v
            elif "contexto" in k: e["ctx"] = v
            elif "motivación" in k or "motivacion" in k: e["mot"] = v
            elif "¿qué es?" in k or "que es" in k: e["que"] = v
            elif "¿para qué sirve?" in k or "para que sirve" in k: e["para"] = v
            elif "¿en dónde ocurre?" in k or "donde ocurre" in k: e["donde"] = v
            elif "¿cuándo ocurre?" in k or "cuando ocurre" in k: e["cuando"] = v
            elif "justificación" in k: e["just"] = v
            elif "despliegue" in k: e["desp"] = v
            elif "beneficio" in k: e["beneficio"] = v
            elif "actores" in k: e["actores"] = v
            elif "dominio its" in k: e["dominio"] = re.findall(r'DOM-\d+', v)
            elif "áreas de servicios" in k or "areas de" in k: e["area"] = re.findall(r'AS-\d+', v)
            elif "subsistemas" in k: e["sub"] = re.findall(r'SUB-\d+', v)
            elif "servicio estratégico" in k: e["se"] = re.findall(r'SE-ITS-\d+', v)
            elif "función" in k: e["fn"] = re.findall(r'F-\d+', v)
            elif "componentes" in k: e["cc"] = re.findall(r'CC-\d+', v)
            elif "marco normativo" in k: e["marco"] = v
            elif "e.1" in k: e["e1"] = v
            elif "e.2" in k: e["e2"] = v
            elif "e.3" in k: e["e3"] = v
            elif "e.4" in k: e["e4"] = v
            elif "e.5" in k: e["e5"] = v

        if alertas: e["alertas"] = alertas
        if kpis: e["kpis"] = kpis

        # Icons for UI
        nm = e.get("name", "")
        if "Seguridad Vial" in nm: e["ico"] = "\ud83d\udea8"
        elif "Tráfico" in nm: e["ico"] = "\ud83d\udea6"
        elif "Carga" in nm: e["ico"] = "⚖️"
        elif "Electromovilidad" in nm: e["ico"] = "⚡"; e["type"] = "c"
        elif "Telegestión" in nm: e["ico"] = "💡"; e["type"] = "c"
        
        eovs.append(e)

    # Empty NO array since we don't extract it but DB expects it
    nos = []

    official_data = {
        "no": nos,
        "dom": list(doms.values()),
        "as": list(ass.values()),
        "se": list(ses.values()),
        "sub": list(subs.values()),
        "fn": list(fns.values()),
        "cc": list(ccs.values()),
        "eov": eovs
    }

    # Write as JSON
    with open('official_data.json', 'w') as f:
        json.dump(official_data, f, indent=2)
    
    # Write as JS for local browser loading (bypass CORS on file://)
    with open('official_data.js', 'w') as f:
        f.write("window.ITS_OFFICIAL_DATA = ")
        json.dump(official_data, f, indent=2)
        f.write(";")

    print("✅ Official data synced (JSON & JS).")

    # Write as JSON
    with open('official_data.json', 'w') as f:
        json.dump(official_data, f, indent=2)
    
    # Write as JS for local browser loading (bypass CORS on file://)
    with open('official_data.js', 'w') as f:
        f.write("window.ITS_OFFICIAL_DATA = ")
        json.dump(official_data, f, indent=2)
        f.write(";")

    print("✅ Official data synced (JSON & JS).")

if __name__ == "__main__":
    sync()
