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

    # 7. EOVs (Tables 16-30)
    eovs = []
    for i in range(16, 31):
        tbl = tables[i]
        e = {"id": "", "ico": "🚀", "type": "p"} # Default
        for row in tbl:
            if len(row) < 2: continue
            k = row[0].lower().strip()
            v = row[1].strip()
            if "c\u00f3digo" in k or "codigo" in k: e["id"] = v
            elif "nombre" in k: e["name"] = v
            elif "contexto" in k: e["ctx"] = v
            elif "motivaci\u00f3n" in k or "motivacion" in k: e["mot"] = v
            elif "\u00bfqu\u00e9 es?" in k or "que es" in k: e["que"] = v
            elif "\u00bfpara qu\u00e9 sirve?" in k or "para que sirve" in k: e["para"] = v
            elif "\u00bfen d\u00f3nde ocurre?" in k or "donde ocurre" in k: e["donde"] = v
            elif "\u00bfcu\u00e1ndo ocurre?" in k or "cuando ocurre" in k: e["cuando"] = v
            elif "justificaci\u00f3n" in k: e["just"] = v
            elif "despliegue" in k: e["desp"] = v
            elif "beneficio" in k: e["beneficio"] = v
            elif "actores" in k: e["actores"] = v
            elif "dominio its" in k: e["dominio"] = v
            elif "\u00e1reas de servicios" in k or "areas de" in k: e["area"] = v
            elif "subsistemas" in k: e["sub"] = v
            elif "servicio estrat\u00e9gico" in k: e["se"] = v
            elif "funci\u00f3n" in k: e["fn"] = v
            elif "componentes" in k: e["cc"] = v
            elif "est\u00e1ndares" in k: e["std"] = v
            elif "ciberseguridad" in k: e["cyber"] = v
            elif "e.1" in k: e["e1"] = v
            elif "e.2" in k: e["e2"] = v
            elif "e.3" in k: e["e3"] = v
            elif "e.4" in k: e["e4"] = v
            elif "e.5" in k: e["e5"] = v
            elif "reflejo" in k: e["reflejo"] = v
            elif "conciencia" in k: e["conciencia"] = v
            elif "estadio" in k: e["estadio"] = v

        # Icons for UI
        nm = e.get("name", "")
        if "Seguridad Vial" in nm: e["ico"] = "\ud83d\udea8"
        elif "Tr\u00e1fico" in nm: e["ico"] = "\ud83d\udea6"
        elif "Carga" in nm: e["ico"] = "\u2696\ufe0f"
        elif "Electromovilidad" in nm: e["ico"] = "\u26a1"; e["type"] = "c"
        elif "Telegesti\u00f3n" in nm: e["ico"] = "\ud83d\udca1"; e["type"] = "c"
        
        eovs.append(e)

    official_data = {
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
