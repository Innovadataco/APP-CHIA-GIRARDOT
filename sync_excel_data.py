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
            
            for _, row in df_e.iterrows():
                raw_k = row.iloc[0]
                k = clean_val(raw_k).lower().strip()
                v = clean_val(row.iloc[1])
                
                if not k:
                    continue
                
                if "alertas del sistema" in k: current_section = "alertas"; e["alertas"] = []; continue
                if "contingencia" in k: current_section = "contingencia"; e["contingencia"] = []; continue
                if "criterios de aceptación" in k: current_section = "criterios"; e["criterios"] = []; continue
                if "evolución tecnológica" in k: current_section = "evolucion"; e["evolucion"] = []; continue
                if "indicadores de desempeño" in k: current_section = "kpis"; e["kpis"] = []; continue
                if "información al usuario" in k: current_section = "usuario"; continue
                
                if current_section in ["alertas", "contingencia", "criterios", "evolucion", "kpis"]:
                    if k in ["1", "2", "3", "4", "5", "1.0", "2.0", "3.0", "4.0", "5.0"] and v:
                        e[current_section].append(v)
                        continue
                    elif not v and k not in ["1", "2", "3", "4", "5", "1.0", "2.0", "3.0", "4.0", "5.0"]:
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
                elif "beneficio social" in k or "beneficio" in k: e["beneficio"] = v
                elif "actores" in k: e["actores"] = v
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
