import pandas as pd
import json

def clean_val(x):
    if pd.isna(x): return ""
    return str(x).strip()

xl = pd.ExcelFile('EVO_TOTAL_V0.xlsx')
df = pd.read_excel(xl, sheet_name='EOV-01', header=None)

e = {"id": "EOV-01"}
current_section = None

for _, row in df.iterrows():
    raw_k = row.iloc[0]
    k = clean_val(raw_k).lower().strip()
    v = clean_val(row.iloc[1])
    
    if not k:
        continue
    
    # Check if this row is a section header (it has no value in col 1, or col 0 is all caps)
    if "alertas del sistema" in k: current_section = "alertas"; e["alertas"] = []; continue
    if "contingencia" in k: current_section = "contingencia"; e["contingencia"] = []; continue
    if "criterios de aceptación" in k: current_section = "criterios"; e["criterios"] = []; continue
    if "evolución tecnológica" in k: current_section = "evolucion"; e["evolucion"] = []; continue
    if "indicadores de desempeño" in k: current_section = "kpis"; e["kpis"] = []; continue
    if "información al usuario" in k: current_section = "usuario"; continue
    
    # If it's a numbered row underneath an array section
    if current_section in ["alertas", "contingencia", "criterios", "evolucion", "kpis"]:
        if k in ["1", "2", "3", "4", "5", "1.0", "2.0", "3.0", "4.0", "5.0"] and v:
            e[current_section].append(v)
            continue
        elif not v and k not in ["1", "2", "3", "4", "5", "1.0", "2.0", "3.0", "4.0", "5.0"]:
            # Maybe the section ended?
            current_section = None
    
    if not v: continue
    
    # Normal key-value parsing
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
    elif "beneficio social" in k: e["beneficio"] = v
    elif "actores estratégicos" in k: e["actores"] = v
    elif "grupo de interés" in k: e["grupo"] = v
    elif "dominio" in k: e["dominio"] = v
    elif "área" in k or "areas de" in k: e["area"] = v
    elif "subsistema" in k: e["sub"] = v
    elif "servicio estratégico" in k: e["se"] = v
    elif "función" in k or "funciones" in k: e["fn"] = v
    elif "componente" in k: e["cc"] = v
    elif "estándar" in k: e["std"] = v
    elif "ciberseguridad" in k: e["cyber"] = v
    elif "marco normativo" in k: e["marco"] = v
    elif "e.5" in k: e["e5"] = v
    elif "e.4" in k: e["e4"] = v
    elif "e.3" in k: e["e3"] = v
    elif "e.2" in k: e["e2"] = v
    elif "e.1" in k: e["e1"] = v
    elif "reflejo" in k: e["reflejo"] = v
    elif "conciencia" in k: e["conciencia"] = v
    elif "estadio" in k: e["estadio"] = v
    elif "publicación" in k: e["publicacion"] = v
    elif "canales" in k: e["canales"] = v

print(json.dumps(e, indent=2))
