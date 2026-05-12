import { useState, useEffect, useRef } from "react";

const BASE = "http://localhost:3000";

const TABS = [
  "Datos Generales",
  "Antecedentes",
  "Historia Familiar",
  "Interrogatorio",
  "Exploración Física",
  "Estado Mental / Dx",
  "Firma",
];

const FORM0 = {
  fecha: new Date().toISOString().slice(0, 10),
  religion: "",
  lugar_origen: "",

  historia_consumo: "",

  alergias: "",
  enf_exantematicas: "", amigdalitis: "", f_reumatica: "",
  antec_otras: "", antec_quirurgicos: "", transfusiones: "",

  num_parejas: "", enf_venereas: "", metodos_contraceptivos: "",
  hiv_test: "", disfuncion_erectil: "", acepta_hiv: "",

  ideas_suicidas: "", planes_suicidas: "",

  fam: [
    { familiar: "Padre", patologia: "" },
    { familiar: "Madre", patologia: "" },
    { familiar: "Hermano/a", patologia: "" },
    { familiar: "Hermano/a", patologia: "" },
    { familiar: "Hermano/a", patologia: "" },
    { familiar: "Esposa", patologia: "" },
    { familiar: "Hijos", patologia: "" },
  ],

  cab_cefalea: "", cab_lentes: "", cab_fosfenos: "",
  cab_vision: "", cab_tinitus: "", cab_epistaxis: "",

  car_palpitaciones: "", car_dolor_precordial: "", car_edema: "", car_tos_seca: "",
  car_disnea: "", car_mareos: "", car_hipertension: "", car_expectoracion: "",

  gas_apetito: "", gas_intolerancias: "", gas_evacuaciones: "",
  gas_vomito: "", gas_gastritis: "", gas_dolor_abd: "", gas_melena: "",
  gas_nauseas: "", gas_colitis: "", gas_diarrea: "", gas_estrenimiento: "",

  gen_menarca: "", gen_dias: "", gen_vida_sexual: "", gen_activa: "",
  gen_gestas: "", gen_abortos: "", gen_cesareas: "", gen_fur: "",
  gen_menopausia: "", gen_partos: "",
  gen_secreciones: "", gen_disuria: "", gen_hematuria: "", gen_poliuria: "",

  end_intolerancia: "", end_perdida_conocimiento: "",
  end_convulsiones: "", end_alucinaciones: "",
  end_equilibrio: "", end_lagunas: "",
  end_pa: "", end_fc: "", end_fr: "", end_temp: "", end_peso: "", end_estatura: "",

  habitus: "",

  exp_normocefalo: "", exp_pupilas: "", exp_reflejos_luz: "", exp_acomodacion: "",
  exp_cicatrices: "", exp_isometricas: "", exp_mov_oculares: "", exp_fondo_ojo: "",

  orl_secrecion: "", orl_tapones: "", orl_nariz: "",
  oro_hiperemicas: "", oro_hipertrofia: "", oro_caries: "",
  cue_corto: "", cue_adenopatias: "",
  tor_normolineo: "", tor_deformidades: "", tor_cicatrices: "",
  pul_murmullo: "", pul_sibilancias: "", pul_crepitantes: "",
  cor_ritmo: "", cor_arritmias: "",
  abd_blando: "", abd_globoso: "", abd_dolor: "", abd_ascitis: "",
  abd_plano: "", abd_cicatrices: "", abd_tumoracion: "", abd_peristalsis: "",
  ext_isometricas: "", ext_edema: "", ext_cianosis: "", ext_varices: "",
  ext_deformidad: "", ext_pulso: "", ext_reflejos: "", ext_movimientos: "",
  neu_craneales: "", neu_tendinosos: "", neu_funcion: "",

  em_orientado: "", em_lenguaje: "", em_afecto: "",
  em_pensamiento: "", em_alteraciones: "", em_juicio: "", em_memoria: "", em_cognicion: "",

  diagnosticos: ["", "", "", "", "", "", "", "", "", "", ""],
  recomendaciones: ["", ""],

  cedula_medico: "",
};

const S = {
  input: {
    width: "100%", padding: "6px 10px", border: "1px solid #e5e7eb",
    borderRadius: 7, fontSize: 13, outline: "none", boxSizing: "border-box",
    background: "#fff", color: "#111827",
  },
  textarea: {
    width: "100%", padding: "8px 10px", border: "1px solid #e5e7eb",
    borderRadius: 7, fontSize: 13, outline: "none", boxSizing: "border-box",
    resize: "vertical", fontFamily: "inherit", color: "#111827",
  },
  label: { fontSize: 11, color: "#6b7280", display: "block", marginBottom: 3, fontWeight: 500 },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  row3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 12, paddingBottom: 6, borderBottom: "1px solid #f3f4f6" },
  sinoRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 7 },
  sinoLabel: { fontSize: 12, color: "#374151", flex: 1 },
};

const SiNo = ({ label, val, onChange }) => (
  <div style={S.sinoRow}>
    <span style={S.sinoLabel}>{label}</span>
    <select value={val} onChange={e => onChange(e.target.value)}
      style={{ padding: "4px 8px", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, outline: "none", background: "#fff" }}>
      <option value="">—</option>
      <option value="Si">Si</option>
      <option value="No">No</option>
    </select>
  </div>
);

const F = ({ label, val, onChange, rows, type = "text", placeholder = "" }) => (
  <div style={{ marginBottom: 10 }}>
    {label && <label style={S.label}>{label}</label>}
    {rows
      ? <textarea value={val} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder} style={S.textarea} />
      : <input type={type} value={val} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={S.input} />}
  </div>
);

export default function HistoriaMedica({ usuario }) {
  const [pacientes, setPacientes] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [pac, setPac] = useState(null);
  const [tab, setTab] = useState(0);
  const [form, setForm] = useState(FORM0);
  const [guardando, setGuardando] = useState(false);
  const [ok, setOk] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [firmaUrl, setFirmaUrl] = useState(null);
  const [cargando, setCargando] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    fetch(`${BASE}/medico/pacientes`).then(r => r.json()).then(setPacientes).catch(console.error);
  }, []);

  const seleccionar = (p) => {
    setPac(p);
    setTab(0);
    setFirmaUrl(null);
    setCargando(true);
    fetch(`${BASE}/medico/historia-medica/${p.id_paciente}`)
      .then(r => r.json())
      .then(data => {
        if (data?.datos_json) {
          try { setForm({ ...FORM0, ...JSON.parse(data.datos_json) }); } catch { setForm(FORM0); }
        } else {
          setForm({
            ...FORM0,
            fecha: new Date().toISOString().slice(0, 10),
          });
        }
        if (data?.firma_archivo) setFirmaUrl(`${BASE}/uploads/historias/${data.firma_archivo}`);
        setCargando(false);
      })
      .catch(() => { setForm(FORM0); setCargando(false); });
  };

  const upd = (campo, val) => setForm(prev => ({ ...prev, [campo]: val }));

  const updArr = (campo, idx, val) => setForm(prev => {
    const arr = [...prev[campo]];
    arr[idx] = val;
    return { ...prev, [campo]: arr };
  });

  const updFam = (idx, key, val) => setForm(prev => {
    const fam = prev.fam.map((f, i) => i === idx ? { ...f, [key]: val } : f);
    return { ...prev, fam };
  });

  const guardar = async () => {
    if (!pac) return;
    setGuardando(true);
    try {
      await fetch(`${BASE}/medico/historia-medica/guardar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_paciente: pac.id_paciente,
          id_usuario: usuario?.id_usuario,
          datos_json: JSON.stringify(form),
        }),
      });
      setOk(true);
      setTimeout(() => setOk(false), 2500);
    } catch { } finally { setGuardando(false); }
  };

  const subirFirma = async (file) => {
    if (!pac) return;
    const permitidos = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (!permitidos.includes(file.type)) return alert("Solo PDF, JPG o PNG");
    setSubiendo(true);
    const fd = new FormData();
    fd.append("archivo", file);
    fd.append("id_paciente", pac.id_paciente);
    fd.append("id_usuario", usuario?.id_usuario || "");
    try {
      const r = await fetch(`${BASE}/medico/historia-medica/firma`, { method: "POST", body: fd });
      const data = await r.json();
      setFirmaUrl(`${BASE}/uploads/historias/${data.archivo}`);
    } catch { } finally { setSubiendo(false); }
  };

  const renderTab = () => {
    if (!pac) return null;
    if (cargando) return <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Cargando...</div>;

    /* ── TAB 0: DATOS GENERALES ── */
    if (tab === 0) return (
      <div>
        <div style={S.section}>
          <div style={S.sectionTitle}>HISTORIA MÉDICA — Datos del Paciente</div>
          <div style={S.row3}>
            <F label="Fecha" val={form.fecha} onChange={v => upd("fecha", v)} type="date" />
            <F label="Nombre" val={`${pac.nombre} ${pac.apellido}`} onChange={() => {}} />
            <F label="Expediente" val={`EXP-${String(pac.id_paciente).padStart(4, "0")}`} onChange={() => {}} />
          </div>
          <div style={S.row3}>
            <F label="Edad" val={pac.edad || ""} onChange={() => {}} />
            <F label="Sexo / Género" val={pac.genero || ""} onChange={() => {}} />
            <F label="Estado Civil" val={pac.estado_civil || ""} onChange={() => {}} />
          </div>
          <div style={S.row3}>
            <F label="Religión" val={form.religion} onChange={v => upd("religion", v)} />
            <F label="Lugar de Residencia" val={pac.direccion || ""} onChange={() => {}} />
            <F label="Lugar de Origen" val={form.lugar_origen} onChange={v => upd("lugar_origen", v)} />
          </div>
          <div style={S.row2}>
            <F label="Ocupación" val={pac.ocupacion || ""} onChange={() => {}} />
            <F label="Escolaridad" val={pac.escolaridad || ""} onChange={() => {}} />
          </div>
        </div>

        <div style={S.section}>
          <div style={S.sectionTitle}>HISTORIA DE CONSUMO</div>
          <F val={form.historia_consumo} onChange={v => upd("historia_consumo", v)} rows={8} placeholder="Describe la historia de consumo del paciente..." />
        </div>
      </div>
    );

    /* ── TAB 1: ANTECEDENTES ── */
    if (tab === 1) return (
      <div>
        <div style={S.section}>
          <div style={S.sectionTitle}>ANTECEDENTES PERSONALES</div>
          <F label="Alergias" val={form.alergias} onChange={v => upd("alergias", v)} />
          <div style={{ display: "flex", gap: 20, marginBottom: 10 }}>
            <SiNo label="Enfermedades exantemáticas" val={form.enf_exantematicas} onChange={v => upd("enf_exantematicas", v)} />
            <SiNo label="Amigdalitis de repetición" val={form.amigdalitis} onChange={v => upd("amigdalitis", v)} />
            <SiNo label="F. Reumática" val={form.f_reumatica} onChange={v => upd("f_reumatica", v)} />
          </div>
          <F label="Otras" val={form.antec_otras} onChange={v => upd("antec_otras", v)} rows={2} />
          <F label="Antecedentes Quirúrgicos" val={form.antec_quirurgicos} onChange={v => upd("antec_quirurgicos", v)} rows={3} />
          <F label="Transfusiones Sanguíneas" val={form.transfusiones} onChange={v => upd("transfusiones", v)} rows={2} />
        </div>

        <div style={S.section}>
          <div style={S.sectionTitle}>ANTECEDENTES SEXUALES</div>
          <div style={S.row2}>
            <F label="Número de parejas (últimos 3 años)" val={form.num_parejas} onChange={v => upd("num_parejas", v)} />
            <F label="Enfermedades venéreas" val={form.enf_venereas} onChange={v => upd("enf_venereas", v)} />
          </div>
          <div style={S.row2}>
            <F label="Métodos contraceptivos" val={form.metodos_contraceptivos} onChange={v => upd("metodos_contraceptivos", v)} />
            <F label="HIV Test" val={form.hiv_test} onChange={v => upd("hiv_test", v)} />
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <F label="Disfunción Eréctil" val={form.disfuncion_erectil} onChange={v => upd("disfuncion_erectil", v)} />
            </div>
            <div style={{ flex: 1, paddingTop: 14 }}>
              <SiNo label="Acepta realizar el Test HIV" val={form.acepta_hiv} onChange={v => upd("acepta_hiv", v)} />
            </div>
          </div>
        </div>

        <div style={S.section}>
          <div style={S.sectionTitle}>ANTECEDENTES SUICIDAS</div>
          <F label="Ideas Suicidas" val={form.ideas_suicidas} onChange={v => upd("ideas_suicidas", v)} rows={2} />
          <F label="Planes Suicidas" val={form.planes_suicidas} onChange={v => upd("planes_suicidas", v)} rows={2} />
        </div>
      </div>
    );

    /* ── TAB 2: HISTORIA FAMILIAR ── */
    if (tab === 2) return (
      <div style={S.section}>
        <div style={S.sectionTitle}>HISTORIA FAMILIAR</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", padding: "8px 10px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", color: "#6b7280", fontWeight: 600, width: 140 }}>Familiar</th>
              <th style={{ textAlign: "left", padding: "8px 10px", background: "#f9fafb", borderBottom: "1px solid #e5e7eb", color: "#6b7280", fontWeight: 600 }}>Patología</th>
            </tr>
          </thead>
          <tbody>
            {form.fam.map((f, i) => (
              <tr key={i}>
                <td style={{ padding: "8px 10px", borderBottom: "1px solid #f3f4f6", color: "#374151", fontWeight: 500 }}>{f.familiar}</td>
                <td style={{ padding: "6px 10px", borderBottom: "1px solid #f3f4f6" }}>
                  <input
                    value={f.patologia}
                    onChange={e => updFam(i, "patologia", e.target.value)}
                    style={{ ...S.input, marginBottom: 0 }}
                    placeholder="Descripción de patología..."
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );

    /* ── TAB 3: INTERROGATORIO ── */
    if (tab === 3) return (
      <div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={S.section}>
            <div style={S.sectionTitle}>Cabeza</div>
            <SiNo label="Cefalea" val={form.cab_cefalea} onChange={v => upd("cab_cefalea", v)} />
            <SiNo label="Lentes" val={form.cab_lentes} onChange={v => upd("cab_lentes", v)} />
            <SiNo label="Fosfenos" val={form.cab_fosfenos} onChange={v => upd("cab_fosfenos", v)} />
            <SiNo label="Visión Borrosa" val={form.cab_vision} onChange={v => upd("cab_vision", v)} />
            <SiNo label="Tinitus" val={form.cab_tinitus} onChange={v => upd("cab_tinitus", v)} />
            <SiNo label="Epistaxis" val={form.cab_epistaxis} onChange={v => upd("cab_epistaxis", v)} />
          </div>

          <div style={S.section}>
            <div style={S.sectionTitle}>Cardiorrespiratorio</div>
            <SiNo label="Palpitaciones" val={form.car_palpitaciones} onChange={v => upd("car_palpitaciones", v)} />
            <SiNo label="Dolor Precordial" val={form.car_dolor_precordial} onChange={v => upd("car_dolor_precordial", v)} />
            <SiNo label="Edema Maleolar" val={form.car_edema} onChange={v => upd("car_edema", v)} />
            <SiNo label="Tos Seca" val={form.car_tos_seca} onChange={v => upd("car_tos_seca", v)} />
            <SiNo label="Disnea" val={form.car_disnea} onChange={v => upd("car_disnea", v)} />
            <SiNo label="Mareos" val={form.car_mareos} onChange={v => upd("car_mareos", v)} />
            <SiNo label="Hipertensión" val={form.car_hipertension} onChange={v => upd("car_hipertension", v)} />
            <SiNo label="Expectoración" val={form.car_expectoracion} onChange={v => upd("car_expectoracion", v)} />
          </div>
        </div>

        <div style={S.section}>
          <div style={S.sectionTitle}>Gastrointestinal</div>
          <div style={S.row3}>
            <F label="Apetito" val={form.gas_apetito} onChange={v => upd("gas_apetito", v)} />
            <F label="Intolerancias" val={form.gas_intolerancias} onChange={v => upd("gas_intolerancias", v)} />
            <F label="# de Evacuaciones" val={form.gas_evacuaciones} onChange={v => upd("gas_evacuaciones", v)} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <SiNo label="Vomito" val={form.gas_vomito} onChange={v => upd("gas_vomito", v)} />
              <SiNo label="Gastritis" val={form.gas_gastritis} onChange={v => upd("gas_gastritis", v)} />
              <SiNo label="Dolor Abdominal" val={form.gas_dolor_abd} onChange={v => upd("gas_dolor_abd", v)} />
              <SiNo label="Melena" val={form.gas_melena} onChange={v => upd("gas_melena", v)} />
            </div>
            <div>
              <SiNo label="Nauseas" val={form.gas_nauseas} onChange={v => upd("gas_nauseas", v)} />
              <SiNo label="Colitis" val={form.gas_colitis} onChange={v => upd("gas_colitis", v)} />
              <SiNo label="Diarrea" val={form.gas_diarrea} onChange={v => upd("gas_diarrea", v)} />
              <SiNo label="Estreñimiento" val={form.gas_estrenimiento} onChange={v => upd("gas_estrenimiento", v)} />
            </div>
          </div>
        </div>

        <div style={S.section}>
          <div style={S.sectionTitle}>Genitourinario</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10, marginBottom: 12 }}>
            {[
              ["Menarca", "gen_menarca"], ["Días", "gen_dias"], ["Vida Sexual", "gen_vida_sexual"],
              ["Activa", "gen_activa"], ["Gestas", "gen_gestas"],
              ["Abortos", "gen_abortos"], ["Cesáreas", "gen_cesareas"], ["FUR", "gen_fur"],
              ["Menopausia", "gen_menopausia"], ["Partos", "gen_partos"],
            ].map(([lbl, key]) => (
              <div key={key}>
                <label style={S.label}>{lbl}</label>
                <input value={form[key]} onChange={e => upd(key, e.target.value)} style={{ ...S.input, marginBottom: 0 }} />
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <SiNo label="Secreciones" val={form.gen_secreciones} onChange={v => upd("gen_secreciones", v)} />
              <SiNo label="Disuria" val={form.gen_disuria} onChange={v => upd("gen_disuria", v)} />
            </div>
            <div>
              <SiNo label="Hematuria" val={form.gen_hematuria} onChange={v => upd("gen_hematuria", v)} />
              <SiNo label="Poliuria" val={form.gen_poliuria} onChange={v => upd("gen_poliuria", v)} />
            </div>
          </div>
        </div>

        <div style={S.section}>
          <div style={S.sectionTitle}>Endocrino Neuropsiquiátrico</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <SiNo label="Intolerancia frío o calor" val={form.end_intolerancia} onChange={v => upd("end_intolerancia", v)} />
              <SiNo label="Pérdida del conocimiento" val={form.end_perdida_conocimiento} onChange={v => upd("end_perdida_conocimiento", v)} />
              <SiNo label="Convulsiones" val={form.end_convulsiones} onChange={v => upd("end_convulsiones", v)} />
              <SiNo label="Alucinaciones" val={form.end_alucinaciones} onChange={v => upd("end_alucinaciones", v)} />
            </div>
            <div>
              <F label="Pérdida del Equilibrio" val={form.end_equilibrio} onChange={v => upd("end_equilibrio", v)} />
              <F label="Lagunas Mentales" val={form.end_lagunas} onChange={v => upd("end_lagunas", v)} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 10, marginTop: 8 }}>
            {[
              ["Presión Arterial", "end_pa"], ["Frec. Cardiaca", "end_fc"],
              ["Frec. Respiratoria", "end_fr"], ["Temperatura °C", "end_temp"],
              ["Peso Kg", "end_peso"], ["Estatura Mts", "end_estatura"],
            ].map(([lbl, key]) => (
              <div key={key}>
                <label style={S.label}>{lbl}</label>
                <input value={form[key]} onChange={e => upd(key, e.target.value)} style={{ ...S.input, marginBottom: 0 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    /* ── TAB 4: EXPLORACIÓN FÍSICA ── */
    if (tab === 4) return (
      <div>
        <div style={S.section}>
          <div style={S.sectionTitle}>Habitus Exterior</div>
          <textarea value={form.habitus} onChange={e => upd("habitus", e.target.value)} rows={3} style={S.textarea} placeholder="Descripción del habitus exterior..." />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div>
            <div style={S.section}>
              <div style={S.sectionTitle}>Cabeza</div>
              <SiNo label="Normocéfalo" val={form.exp_normocefalo} onChange={v => upd("exp_normocefalo", v)} />
              <SiNo label="Pupilas Isocóricas" val={form.exp_pupilas} onChange={v => upd("exp_pupilas", v)} />
              <SiNo label="Reflejos a la luz" val={form.exp_reflejos_luz} onChange={v => upd("exp_reflejos_luz", v)} />
              <F label="Y acomodación" val={form.exp_acomodacion} onChange={v => upd("exp_acomodacion", v)} />
              <SiNo label="Cicatrices" val={form.exp_cicatrices} onChange={v => upd("exp_cicatrices", v)} />
              <SiNo label="Isométricas" val={form.exp_isometricas} onChange={v => upd("exp_isometricas", v)} />
              <F label="Movimientos Oculares" val={form.exp_mov_oculares} onChange={v => upd("exp_mov_oculares", v)} />
              <F label="Fondo de Ojo" val={form.exp_fondo_ojo} onChange={v => upd("exp_fondo_ojo", v)} />
            </div>

            <div style={S.section}>
              <div style={S.sectionTitle}>ORL</div>
              <SiNo label="Oídos Secreción Seropurulenta" val={form.orl_secrecion} onChange={v => upd("orl_secrecion", v)} />
              <SiNo label="Tapones en Conductos" val={form.orl_tapones} onChange={v => upd("orl_tapones", v)} />
              <SiNo label="Nariz con Mucosa Congestionada" val={form.orl_nariz} onChange={v => upd("orl_nariz", v)} />
            </div>

            <div style={S.section}>
              <div style={S.sectionTitle}>Orofaringe</div>
              <SiNo label="Hiperemicas" val={form.oro_hiperemicas} onChange={v => upd("oro_hiperemicas", v)} />
              <SiNo label="Hipertrofia amigdalina" val={form.oro_hipertrofia} onChange={v => upd("oro_hipertrofia", v)} />
              <SiNo label="Caries" val={form.oro_caries} onChange={v => upd("oro_caries", v)} />
            </div>

            <div style={S.section}>
              <div style={S.sectionTitle}>Cuello</div>
              <SiNo label="Corto" val={form.cue_corto} onChange={v => upd("cue_corto", v)} />
              <SiNo label="Adenopatías Cervicales" val={form.cue_adenopatias} onChange={v => upd("cue_adenopatias", v)} />
            </div>
          </div>

          <div>
            <div style={S.section}>
              <div style={S.sectionTitle}>Tórax</div>
              <SiNo label="Normolineo" val={form.tor_normolineo} onChange={v => upd("tor_normolineo", v)} />
              <SiNo label="Deformidades" val={form.tor_deformidades} onChange={v => upd("tor_deformidades", v)} />
              <SiNo label="Cicatrices" val={form.tor_cicatrices} onChange={v => upd("tor_cicatrices", v)} />
            </div>

            <div style={S.section}>
              <div style={S.sectionTitle}>Pulmones</div>
              <SiNo label="Murmullos claros, limpios y bien ventilados" val={form.pul_murmullo} onChange={v => upd("pul_murmullo", v)} />
              <SiNo label="Sibilancias" val={form.pul_sibilancias} onChange={v => upd("pul_sibilancias", v)} />
              <SiNo label="Crepitantes" val={form.pul_crepitantes} onChange={v => upd("pul_crepitantes", v)} />
            </div>

            <div style={S.section}>
              <div style={S.sectionTitle}>Corazón</div>
              <SiNo label="Ritmo Regular Sinusal" val={form.cor_ritmo} onChange={v => upd("cor_ritmo", v)} />
              <SiNo label="Arritmias" val={form.cor_arritmias} onChange={v => upd("cor_arritmias", v)} />
            </div>

            <div style={S.section}>
              <div style={S.sectionTitle}>Abdomen</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                <SiNo label="Blando" val={form.abd_blando} onChange={v => upd("abd_blando", v)} />
                <SiNo label="Plano" val={form.abd_plano} onChange={v => upd("abd_plano", v)} />
                <SiNo label="Globoso" val={form.abd_globoso} onChange={v => upd("abd_globoso", v)} />
                <SiNo label="Cicatrices" val={form.abd_cicatrices} onChange={v => upd("abd_cicatrices", v)} />
                <SiNo label="Dolor" val={form.abd_dolor} onChange={v => upd("abd_dolor", v)} />
                <SiNo label="Tumoración" val={form.abd_tumoracion} onChange={v => upd("abd_tumoracion", v)} />
                <SiNo label="Ascitis" val={form.abd_ascitis} onChange={v => upd("abd_ascitis", v)} />
                <SiNo label="Peristalsis" val={form.abd_peristalsis} onChange={v => upd("abd_peristalsis", v)} />
              </div>
            </div>

            <div style={S.section}>
              <div style={S.sectionTitle}>Extremidades</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                <SiNo label="Isométricas" val={form.ext_isometricas} onChange={v => upd("ext_isometricas", v)} />
                <SiNo label="Cianosis" val={form.ext_cianosis} onChange={v => upd("ext_cianosis", v)} />
                <SiNo label="Edema" val={form.ext_edema} onChange={v => upd("ext_edema", v)} />
                <SiNo label="Varices" val={form.ext_varices} onChange={v => upd("ext_varices", v)} />
              </div>
              <div style={S.row2}>
                <F label="Deformidad" val={form.ext_deformidad} onChange={v => upd("ext_deformidad", v)} />
                <F label="Pulso Periférico" val={form.ext_pulso} onChange={v => upd("ext_pulso", v)} />
                <F label="Reflejos" val={form.ext_reflejos} onChange={v => upd("ext_reflejos", v)} />
                <F label="Movimientos" val={form.ext_movimientos} onChange={v => upd("ext_movimientos", v)} />
              </div>
            </div>

            <div style={S.section}>
              <div style={S.sectionTitle}>Neurológico</div>
              <F label="Nervios Craneales Normales" val={form.neu_craneales} onChange={v => upd("neu_craneales", v)} />
              <F label="Reflejos Tendinosos Superficiales Profundo" val={form.neu_tendinosos} onChange={v => upd("neu_tendinosos", v)} />
              <F label="Función Cerebral" val={form.neu_funcion} onChange={v => upd("neu_funcion", v)} />
            </div>
          </div>
        </div>
      </div>
    );

    /* ── TAB 5: ESTADO MENTAL / DIAGNÓSTICO ── */
    if (tab === 5) return (
      <div>
        <div style={S.section}>
          <div style={S.sectionTitle}>EXAMEN DEL ESTADO MENTAL</div>
          <div style={S.row3}>
            <F label="Orientado" val={form.em_orientado} onChange={v => upd("em_orientado", v)} />
            <F label="Lenguaje" val={form.em_lenguaje} onChange={v => upd("em_lenguaje", v)} />
            <F label="Afecto" val={form.em_afecto} onChange={v => upd("em_afecto", v)} />
          </div>
          <div style={S.row3}>
            <F label="Pensamiento" val={form.em_pensamiento} onChange={v => upd("em_pensamiento", v)} />
            <F label="Alteraciones Sensoperceptivas" val={form.em_alteraciones} onChange={v => upd("em_alteraciones", v)} />
            <F label="Juicio" val={form.em_juicio} onChange={v => upd("em_juicio", v)} />
          </div>
          <div style={S.row2}>
            <F label="Memoria" val={form.em_memoria} onChange={v => upd("em_memoria", v)} />
            <F label="Cognición" val={form.em_cognicion} onChange={v => upd("em_cognicion", v)} />
          </div>
        </div>

        <div style={S.section}>
          <div style={S.sectionTitle}>DIAGNÓSTICO</div>
          {form.diagnosticos.map((d, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "#6b7280", width: 24, flexShrink: 0 }}>{i + 1}.-</span>
              <input value={d} onChange={e => updArr("diagnosticos", i, e.target.value)} style={{ ...S.input, marginBottom: 0 }} placeholder={`Diagnóstico ${i + 1}`} />
            </div>
          ))}
        </div>

        <div style={S.section}>
          <div style={S.sectionTitle}>RECOMENDACIONES Y PLAN</div>
          {form.recomendaciones.map((r, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: "#6b7280", width: 24, flexShrink: 0 }}>{i + 1}.-</span>
              <input value={r} onChange={e => updArr("recomendaciones", i, e.target.value)} style={{ ...S.input, marginBottom: 0 }} placeholder={`Recomendación ${i + 1}`} />
            </div>
          ))}
        </div>
      </div>
    );

    /* ── TAB 6: FIRMA ── */
    if (tab === 6) return (
      <div>
        <div style={S.section}>
          <div style={S.sectionTitle}>FIRMA DEL MÉDICO Y CÉDULA</div>
          <F label="Cédula del Médico" val={form.cedula_medico} onChange={v => upd("cedula_medico", v)} placeholder="Número de cédula profesional" />
        </div>

        <div style={S.section}>
          <div style={{ ...S.sectionTitle }}>Subir documento firmado (PDF, JPG o PNG)</div>
          <div
            onClick={() => !subiendo && inputRef.current?.click()}
            style={{
              border: "2px dashed #d1d5db", borderRadius: 12,
              padding: "36px 20px", textAlign: "center", cursor: "pointer",
              background: "#f9fafb", transition: "all 0.15s"
            }}
          >
            <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: "none" }}
              onChange={e => { const f = e.target.files[0]; if (f) subirFirma(f); e.target.value = ""; }} />
            {subiendo
              ? <div style={{ color: "#3b82f6", fontWeight: 600, fontSize: 14 }}>Subiendo...</div>
              : <>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" style={{ display: "block", margin: "0 auto 10px" }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>Haz clic para seleccionar el archivo</div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 4 }}>PDF, JPG o PNG · Máx. 10 MB</div>
                </>
            }
          </div>

          {firmaUrl && (
            <div style={{ marginTop: 16, padding: "14px 18px", background: "#f0fdf4", borderRadius: 10, border: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: 12 }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#166534" }}>Documento firmado subido correctamente</div>
              </div>
              <a href={firmaUrl} target="_blank" rel="noopener noreferrer"
                style={{ padding: "6px 16px", background: "#22c55e", color: "#fff", borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: "none" }}>
                Ver
              </a>
            </div>
          )}
        </div>
      </div>
    );

    return null;
  };

  const filtrados = pacientes.filter(p =>
    `${p.nombre} ${p.apellido}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{ display: "flex", gap: 20, height: "calc(100vh - 100px)" }}>

      {/* Lista pacientes */}
      <div style={{ width: 240, background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
        <div style={{ padding: "14px 12px 10px", borderBottom: "1px solid #f3f4f6" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Pacientes</div>
          <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Buscar..."
            style={{ width: "100%", padding: "6px 10px", border: "1px solid #e5e7eb", borderRadius: 7, fontSize: 12, outline: "none", boxSizing: "border-box" }} />
        </div>
        <div style={{ flex: 1, overflowY: "auto" }}>
          {filtrados.map(p => (
            <div key={p.id_paciente} onClick={() => seleccionar(p)}
              style={{ padding: "10px 12px", cursor: "pointer", borderBottom: "1px solid #f3f4f6",
                background: pac?.id_paciente === p.id_paciente ? "#eff6ff" : "#fff",
                borderLeft: pac?.id_paciente === p.id_paciente ? "3px solid #3b82f6" : "3px solid transparent" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{p.nombre} {p.apellido}</div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>{p.edad ? `${p.edad} años` : ""}</div>
            </div>
          ))}
          {filtrados.length === 0 && <div style={{ padding: 20, textAlign: "center", color: "#9ca3af", fontSize: 12 }}>Sin resultados</div>}
        </div>
      </div>

      {/* Formulario */}
      {!pac ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb" }}>
          <div style={{ textAlign: "center", color: "#9ca3af" }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" style={{ display: "block", margin: "0 auto 12px" }}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
              <line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="15" y2="17"/>
            </svg>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Historia Médica</div>
            <div style={{ fontSize: 13 }}>Selecciona un paciente para llenar el formulario</div>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Tabs */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "0 16px", marginBottom: 12, display: "flex", gap: 0, overflowX: "auto" }}>
            {TABS.map((t, i) => (
              <button key={i} onClick={() => setTab(i)}
                style={{ padding: "13px 14px", fontSize: 12, fontWeight: tab === i ? 700 : 500,
                  color: tab === i ? "#3b82f6" : "#6b7280", background: "none", border: "none",
                  borderBottom: tab === i ? "2px solid #3b82f6" : "2px solid transparent",
                  cursor: "pointer", whiteSpace: "nowrap", transition: "all 0.15s" }}>
                {t}
              </button>
            ))}
          </div>

          {/* Contenido */}
          <div style={{ flex: 1, background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "20px 24px", overflowY: "auto" }}>
            {renderTab()}
          </div>

          {/* Footer guardar */}
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: "12px 20px" }}>
            <span style={{ fontSize: 12, color: "#9ca3af" }}>
              {pac.nombre} {pac.apellido} · {TABS[tab]}
            </span>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {ok && <span style={{ fontSize: 12, color: "#22c55e", fontWeight: 600 }}>✓ Guardado</span>}
              {tab > 0 && (
                <button onClick={() => setTab(t => t - 1)}
                  style={{ padding: "7px 16px", background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, cursor: "pointer", color: "#374151" }}>
                  ← Anterior
                </button>
              )}
              <button onClick={guardar} disabled={guardando}
                style={{ padding: "7px 20px", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: guardando ? "default" : "pointer", opacity: guardando ? 0.7 : 1 }}>
                {guardando ? "Guardando..." : "Guardar"}
              </button>
              {tab < TABS.length - 1 && (
                <button onClick={() => setTab(t => t + 1)}
                  style={{ padding: "7px 16px", background: "#111827", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, cursor: "pointer" }}>
                  Siguiente →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
