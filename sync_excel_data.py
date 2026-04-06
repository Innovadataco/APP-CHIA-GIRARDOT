import pandas as pd
import json
import math

def clean_val(x):
    if pd.isna(x): return ""
    return str(x).strip()

def sync():
    print("Reading Excel...")
    xl = pd.ExcelFile('EVO_TOTAL_V0.xlsx')
    
    df_listas = pd.read_excel(xl, sheet_name='Listas', header=2)
    
    no_list, dom_list, as_list, se_list, sub_list, fn_list, cc_list = [], [], [], [], [], [], []
    
    for _, row in df_listas.iterrows():
        # NO - Necesidad Operacional (index 1, 2, 3)
        if clean_val(row.iloc[1]): 
            no_list.append({"cod": clean_val(row.iloc[1]), "name": clean_val(row.iloc[2]), "desc": clean_val(row.iloc[3])})
        # DOM (index 5, 6, 7)
        if clean_val(row.iloc[5]): 
            dom_list.append({"cod": clean_val(row.iloc[5]), "name": clean_val(row.iloc[6]), "desc": clean_val(row.iloc[7])})
        # AS (index 9, 10, 11)
        if clean_val(row.iloc[9]): 
            as_list.append({"cod": clean_val(row.iloc[9]), "name": clean_val(row.iloc[10]), "desc": clean_val(row.iloc[11])})
        # SE (index 13, 14, 15)
        if clean_val(row.iloc[13]): 
            se_list.append({"cod": clean_val(row.iloc[13]), "name": clean_val(row.iloc[14]), "cat": clean_val(row.iloc[15])})
        # SUB (index 17, 18, 19, 20)
        if clean_val(row.iloc[17]): 
            sub_list.append({"cod": clean_val(row.iloc[17]), "sigla": clean_val(row.iloc[18]), "name": clean_val(row.iloc[19]), "desc": clean_val(row.iloc[20])})
        # FN (index 22, 23, 24) -> uses 'id' instead of 'cod'
        if clean_val(row.iloc[22]): 
            fn_list.append({"id": clean_val(row.iloc[22]), "name": clean_val(row.iloc[23]), "desc": clean_val(row.iloc[24])})
        # CC (index 26, 27, 28, 29) -> uses 'id' instead of 'cod'
        if clean_val(row.iloc[26]): 
            cc_list.append({"id": clean_val(row.iloc[26]), "sigla": clean_val(row.iloc[27]), "name": clean_val(row.iloc[28]), "cap": clean_val(row.iloc[29])})
        
    eovs = []
    # Parse EOVs
    for s_name in xl.sheet_names:
        if s_name.startswith('EOV-'):
            df_e = pd.read_excel(xl, sheet_name=s_name, header=None)
            e = {"id": s_name, "ico": "🚀", "type": "p"}
            current_section = None
            last_field = None
            
            for _, row in df_e.iterrows():
                raw_k = row.iloc[0]
                k = clean_val(raw_k).lower().strip()
                v = clean_val(row.iloc[1])
                
                # Check if this row is a section header (it has no value in col 1, or col 0 is all caps)
                if "alertas del sistema" in k: current_section = "alertas"; e["alertas"] = []; continue
                if "contingencia" in k: current_section = "contingencia"; e["contingencia"] = []; continue
                if "criterios de aceptación" in k: current_section = "criterios"; e["criterios"] = []; continue
                if "evolución tecnológica" in k: current_section = "evolucion"; e["evolucion"] = []; continue
                if "indicadores de desempeño" in k: current_section = "kpis"; e["kpis"] = []; continue
                if "información al usuario" in k: current_section = "usuario"; last_field = None; continue
                
                # If the key is numbered and we are in an array section
                if current_section in ["alertas", "contingencia", "criterios", "evolucion", "kpis"]:
                    if k in ["1", "2", "3", "4", "5", "1.0", "2.0", "3.0", "4.0", "5.0"]:
                        if v: e[current_section].append(v)
                        continue
                    elif not k and v:
                        if len(e[current_section]) > 0:
                            e[current_section][-1] += f" - {v}"
                        continue
                    elif not v and k not in ["1", "2", "3", "4", "5", "1.0", "2.0", "3.0", "4.0", "5.0"]:
                        current_section = None
                        
                if not k:
                    if v and last_field and last_field in e:
                        e[last_field] += f"\n- {v}"
                    continue
                
                if not v: continue
                
                # Normal key-value parsing
                mapped_key = None
                if "código" in k or "codigo" in k: mapped_key = "id"
                elif "nombre" in k: mapped_key = "name"
                elif "contexto" in k: mapped_key = "ctx"
                elif "motivación" in k or "motivacion" in k: mapped_key = "mot"
                elif "¿qué es?" in k or "que es" in k: mapped_key = "que"
                elif "¿para qué sirve?" in k or "para que sirve" in k: mapped_key = "para"
                elif "¿en dónde ocurre?" in k or "donde ocurre" in k: mapped_key = "donde"
                elif "¿cuándo ocurre?" in k or "cuando ocurre" in k: mapped_key = "cuando"
                elif "justificación" in k: mapped_key = "just"
                elif "despliegue" in k: mapped_key = "desp"
                elif "beneficio social" in k or "beneficio" in k: mapped_key = "beneficio"
                elif "actores estratégicos" in k or "actores" in k: mapped_key = "actores"
                elif "grupo de interés" in k: mapped_key = "grupo"
                elif "dominio" in k: mapped_key = "dominio"
                elif "área" in k or "areas de" in k: mapped_key = "area"
                elif "subsistema" in k: mapped_key = "sub"
                elif "servicio estratégico" in k: mapped_key = "se"
                elif "función" in k or "funciones" in k: mapped_key = "fn"
                elif "componente" in k: mapped_key = "cc"
                elif "estándar" in k: mapped_key = "std"
                elif "ciberseguridad" in k: mapped_key = "cyber"
                elif "marco normativo" in k: mapped_key = "marco"
                elif "e.5" in k: mapped_key = "e5"
                elif "e.4" in k: mapped_key = "e4"
                elif "e.3" in k: mapped_key = "e3"
                elif "e.2" in k: mapped_key = "e2"
                elif "e.1" in k: mapped_key = "e1"
                elif "reflejo" in k: mapped_key = "reflejo"
                elif "conciencia" in k: mapped_key = "conciencia"
                elif "estadio" in k: mapped_key = "estadio"
                elif "publicación" in k: mapped_key = "publicacion"
                elif "canales" in k: mapped_key = "canales"
                
                if mapped_key:
                    e[mapped_key] = v
                    last_field = mapped_key

            # Icons
            nm = e.get("name", "")
            if "Seguridad Vial" in nm: e["ico"] = "🚨"
            elif "Tráfico" in nm or "Vehículo" in nm or "Movilidad" in nm: e["ico"] = "🚥"
            elif "Carga" in nm: e["ico"] = "⚖️"
            elif "Electromovilidad" in nm: e["ico"] = "⚡"; e["type"] = "c"
            elif "Telegestión" in nm: e["ico"] = "💡"; e["type"] = "c"
            
            eovs.append(e)

    official_data = {
        "no": no_list,
        "dom": dom_list,
        "as": as_list,
        "se": se_list,
        "sub": sub_list,
        "fn": fn_list,
        "cc": cc_list,
        "eov": eovs
    }

    with open('official_data.json', 'w') as f:
        json.dump(official_data, f, indent=2)
    
    with open('official_data.js', 'w') as f:
        f.write("window.ITS_OFFICIAL_DATA = ")
        json.dump(official_data, f, indent=2)
        f.write(";\n")

    print(f"✅ Excel sync completed. Processed {len(eovs)} EOVs and mapped NO, DOM, AS, SE, SUB, FN, CC tables.")

if __name__ == '__main__':
    sync()
