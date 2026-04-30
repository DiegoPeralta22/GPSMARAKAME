import { useState, useEffect } from "react";

const styles = `
  .rp-container { padding: 0; }
  .rp-title { font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.4px; }
  .rp-subtitle { font-size: 13px; color: #6b7280; margin-top: 2px; margin-bottom: 24px; }
  .rp-stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; margin-bottom: 24px; }
  .rp-stat { background: #fff; border-radius: 10px; padding: 18px 20px; border: 1px solid #f0f0f0; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
  .rp-stat-num { font-size: 28px; font-weight: 700; color: #111827; }
  .rp-stat-label { font-size: 12px; color: #6b7280; margin-top: 4px; }
  .rp-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 16px; }
  .rp-card { background: #fff; border-radius: 10px; padding: 20px; border: 1px solid #f0f0f0; box-shadow: 0 1px 3px rgba(0,0,0,0.06); cursor: pointer; transition: all .15s; }
  .rp-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,.08); transform: translateY(-1px); border-color: #3b82f6; }
  .rp-card-name { font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 4px; }
  .rp-card-info { font-size: 12px; color: #6b7280; }
  .rp-badge-pend { display: inline-block; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; background: #fff7ed; color: #f97316; margin-top: 10px; }
  .rp-badge-done { display: inline-block; font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; background: #e6f4f3; color: #0b5d5b; margin-top: 10px; }
  .rp-empty { text-align: center; padding: 60px; color: #9ca3af; font-size: 14px; grid-column: 1/-1; }
  .rp-back { background: none; border: none; color: #3b82f6; font-size: 13px; font-weight: 600; cursor: pointer; margin-bottom: 16px; display: flex; align-items: center; gap: 6px; font-family: 'Inter',sans-serif; padding: 0; }
  .rp-card-section { background: #fff; border-radius: 10px; padding: 20px; border: 1px solid #f0f0f0; box-shadow: 0 1px 3px rgba(0,0,0,0.06); margin-bottom: 16px; }
  .rp-section-title { font-size: 11px; font-weight: 700; color: #3b82f6; text-transform: uppercase; letter-spacing: .6px; margin-bottom: 14px; padding-left: 8px; border-left: 3px solid #3b82f6; }
  .rp-signos-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 12px; }
  .rp-field { display: flex; flex-direction: column; gap: 5px; }
  .rp-label { font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: .3px; }
  .rp-input { padding: 8px 10px; border: 1px solid #e5e7eb; border-radius: 6px; font-size: 13px; font-family: 'Inter',sans-serif; outline: none; transition: border .15s; }
  .rp-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1); }
  .rp-input-unit { font-size: 10px; color: #9ca3af; margin-top: 2px; }
  .rp-toggle-row { display: flex; align-items: center; gap: 12px; padding: 14px 16px; background: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb; }
  .rp-toggle-label { font-size: 13px; font-weight: 600; color: #374151; flex: 1; }
  .rp-toggle-btns { display: flex; gap: 8px; }
  .rp-toggle-btn { padding: 7px 18px; border-radius: 6px; border: 1px solid #e5e7eb; background: #fff; font-size: 13px; font-weight: 600; cursor: pointer; font-family: 'Inter',sans-serif; transition: all .15s; color: #6b7280; }
  .rp-toggle-btn.estable-si { border-color: #16a34a; background: #f0fdf4; color: #16a34a; }
  .rp-toggle-btn.estable-no { border-color: #ef4444; background: #fff1f2; color: #ef4444; }
  .rp-tabs { display: flex; gap: 4px; margin-bottom: 16px; }
  .rp-tab { padding: 7px 16px; border: 1px solid #e5e7eb; border-radius: 6px; background: #fff; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'Inter',sans-serif; color: #6b7280; transition: all .15s; }
  .rp-tab.active { background: #eff6ff; border-color: #3b82f6; color: #3b82f6; }
  .rp-textarea { width: 100%; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'Inter',sans-serif; outline: none; resize: vertical; min-height: 110px; transition: border .15s; }
  .rp-textarea:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59,130,246,.1); }
  .rp-banner-edit { background: #eff6ff; border: 1px solid #93c5fd; border-radius: 8px; padding: 10px 16px; margin-bottom: 16px; font-size: 13px; color: #1d4ed8; font-weight: 500; }
  .rp-banner-alert { background: #fff7ed; border: 1px solid #fbbf24; border-radius: 8px; padding: 10px 16px; margin-bottom: 16px; font-size: 13px; color: #92400e; font-weight: 500; }
  .rp-save-btn { width: 100%; padding: 14px; background: #3b82f6; color: #fff; border: none; border-radius: 8px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: 'Inter',sans-serif; transition: background .15s; }
  .rp-save-btn:hover { background: #2563eb; }
  .rp-save-btn:disabled { background: #93c5fd; cursor: not-allowed; }
  .rp-saved-msg { display: inline-block; background: #f0fdf4; border: 1px solid #86efac; color: #16a34a; font-size: 13px; font-weight: 600; padding: 10px 20px; border-radius: 8px; margin-top: 12px; text-align: center; width: 100%; }
  .rp-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
`;

function fmtFecha(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
}

export default function RecepcionPaciente({ usuario }) {
  const [pacientes, setPacientes] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [seleccionado, setSeleccionado] = useState(null);
  const [recepcionExistente, setRecepcionExistente] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  // Signos vitales
  const [signos, setSignos] = useState({ pa_sistolica: "", pa_diastolica: "", fc: "", fr: "", temp: "", peso: "", talla: "" });
  const [esEstable, setEsEstable] = useState(null);
  const [habitacion, setHabitacion] = useState("");

  // Valoración integral
  const [tabVal, setTabVal] = useState("psiquiatrica");
  const [valPsiquiatrica, setValPsiquiatrica] = useState("");
  const [valNutricional, setValNutricional] = useState("");
  const [valSalud, setValSalud] = useState("");
  const [planTratamiento, setPlanTratamiento] = useState("");
  const [observaciones, setObservaciones] = useState("");

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    setCargando(true);
    try {
      const res = await fetch("http://localhost:3000/medico/pendientes-recepcion");
      const data = await res.json();
      setPacientes(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setCargando(false); }
  };

  const seleccionarPaciente = async (p) => {
    setSeleccionado(p);
    resetForm();
    try {
      const res = await fetch(`http://localhost:3000/medico/recepcion/${p.id_paciente}`);
      const data = await res.json();
      if (data) {
        setRecepcionExistente(data);
        if (data.signos_vitales) { try { setSignos(JSON.parse(data.signos_vitales)); } catch {} }
        if (data.es_estable !== null && data.es_estable !== undefined) setEsEstable(!!Number(data.es_estable));
        setHabitacion(data.habitacion || "");
        setValPsiquiatrica(data.valoracion_psiquiatrica || "");
        setValNutricional(data.valoracion_nutricional || "");
        setValSalud(data.valoracion_salud || "");
        setPlanTratamiento(data.plan_tratamiento || "");
        setObservaciones(data.observaciones || "");
      } else {
        setRecepcionExistente(null);
      }
    } catch (e) { console.error(e); }
  };

  const resetForm = () => {
    setSignos({ pa_sistolica: "", pa_diastolica: "", fc: "", fr: "", temp: "", peso: "", talla: "" });
    setEsEstable(null);
    setHabitacion("");
    setValPsiquiatrica(""); setValNutricional(""); setValSalud("");
    setPlanTratamiento(""); setObservaciones("");
    setRecepcionExistente(null);
  };

  const actualizarSigno = (campo, val) => setSignos(prev => ({ ...prev, [campo]: val }));

  const guardar = async () => {
    if (!seleccionado) return;
    setGuardando(true);
    try {
      const res = await fetch("http://localhost:3000/medico/recepcion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_paciente: seleccionado.id_paciente,
          id_usuario: usuario?.id_usuario,
          signos_vitales: JSON.stringify(signos),
          es_estable: esEstable,
          habitacion: habitacion || null,
          valoracion_psiquiatrica: valPsiquiatrica || null,
          valoracion_nutricional: valNutricional || null,
          valoracion_salud: valSalud || null,
          plan_tratamiento: planTratamiento || null,
          observaciones: observaciones || null,
        })
      });
      if (res.ok) {
        setSavedMsg(true);
        setTimeout(() => setSavedMsg(false), 3000);
        cargarPacientes();
      } else {
        alert("Error al guardar la recepción.");
      }
    } catch (e) { alert("Error: " + e.message); }
    finally { setGuardando(false); }
  };

  const pendientes = pacientes.filter(p => !p.id_recepcion);
  const completados = pacientes.filter(p => !!p.id_recepcion);

  return (
    <>
      <style>{styles}</style>
      <div className="rp-container">

        {/* LISTA */}
        {!seleccionado && (
          <>
            <h1 className="rp-title">Recepción Médica — Primeras 24 Horas</h1>
            <p className="rp-subtitle">Registro de signos vitales, valoración integral y plan de tratamiento al ingreso</p>

            <div className="rp-stats">
              <div className="rp-stat">
                <div className="rp-stat-num" style={{ color: "#f97316" }}>{pendientes.length}</div>
                <div className="rp-stat-label">Pendientes de recepción</div>
              </div>
              <div className="rp-stat">
                <div className="rp-stat-num" style={{ color: "#16a34a" }}>{completados.length}</div>
                <div className="rp-stat-label">Recepción completada</div>
              </div>
              <div className="rp-stat">
                <div className="rp-stat-num">{pacientes.length}</div>
                <div className="rp-stat-label">Total internados</div>
              </div>
            </div>

            {pendientes.length > 0 && (
              <div style={{ background: "#fff7ed", border: "1px solid #fbbf24", borderRadius: 10, padding: "12px 18px", marginBottom: 20, fontSize: 13, color: "#92400e", fontWeight: 600 }}>
                ⚠ Tienes {pendientes.length} paciente{pendientes.length > 1 ? "s" : ""} pendiente{pendientes.length > 1 ? "s" : ""} de recepción médica
              </div>
            )}

            <div className="rp-grid">
              {cargando ? (
                <div className="rp-empty">Cargando...</div>
              ) : pacientes.length === 0 ? (
                <div className="rp-empty">No hay pacientes con traslado completado</div>
              ) : (
                pacientes.map((p, i) => (
                  <div key={i} className="rp-card" onClick={() => seleccionarPaciente(p)}>
                    <div className="rp-card-name">{p.nombre} {p.apellido}</div>
                    <div className="rp-card-info">{p.edad} años</div>
                    <div className="rp-card-info">Traslado: {fmtFecha(p.fecha_traslado)}</div>
                    {p.id_recepcion
                      ? <span className="rp-badge-done">✓ Recepción registrada</span>
                      : <span className="rp-badge-pend">Pendiente de recepción</span>
                    }
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* FORMULARIO */}
        {seleccionado && (
          <>
            <button className="rp-back" onClick={() => { setSeleccionado(null); resetForm(); }}>
              ← Volver a la lista
            </button>
            <h1 className="rp-title">{seleccionado.nombre} {seleccionado.apellido}</h1>
            <p className="rp-subtitle">{seleccionado.edad} años · Recepción médica — primeras 24 horas</p>

            {recepcionExistente && (
              <div className="rp-banner-edit">✓ Este paciente ya tiene recepción registrada. Puedes modificarla.</div>
            )}

            {/* PASO 15: Signos Vitales */}
            <div className="rp-card-section">
              <p className="rp-section-title">Paso 16 — Signos Vitales</p>
              <div className="rp-signos-grid">
                {[
                  { key: "pa_sistolica", label: "PA Sistólica", unit: "mmHg" },
                  { key: "pa_diastolica", label: "PA Diastólica", unit: "mmHg" },
                  { key: "fc", label: "Frec. Cardíaca", unit: "lpm" },
                  { key: "fr", label: "Frec. Respiratoria", unit: "rpm" },
                  { key: "temp", label: "Temperatura", unit: "°C" },
                  { key: "peso", label: "Peso", unit: "kg" },
                  { key: "talla", label: "Talla", unit: "cm" },
                ].map(({ key, label, unit }) => (
                  <div key={key} className="rp-field">
                    <label className="rp-label">{label}</label>
                    <input
                      className="rp-input"
                      type="number"
                      placeholder="—"
                      value={signos[key]}
                      onChange={e => actualizarSigno(key, e.target.value)}
                    />
                    <span className="rp-input-unit">{unit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rp-layout">
              <div>
                {/* PASO 17: Estabilidad */}
                <div className="rp-card-section">
                  <p className="rp-section-title">Paso 17 — Estabilidad del Paciente</p>
                  <div className="rp-toggle-row">
                    <span className="rp-toggle-label">¿El paciente se encuentra estable?</span>
                    <div className="rp-toggle-btns">
                      <button
                        className={`rp-toggle-btn ${esEstable === true ? "estable-si" : ""}`}
                        onClick={() => setEsEstable(true)}
                      >
                        Sí, estable
                      </button>
                      <button
                        className={`rp-toggle-btn ${esEstable === false ? "estable-no" : ""}`}
                        onClick={() => setEsEstable(false)}
                      >
                        No estable
                      </button>
                    </div>
                  </div>
                  {esEstable === false && (
                    <div style={{ marginTop: 12 }}>
                      <div className="rp-banner-alert">⚠ Asigna habitación y notifica al médico en turno</div>
                      <div className="rp-field">
                        <label className="rp-label">Habitación asignada</label>
                        <input className="rp-input" placeholder="Ej: Hab. 3, Cama 2..." value={habitacion} onChange={e => setHabitacion(e.target.value)} />
                      </div>
                    </div>
                  )}
                  {esEstable === true && (
                    <div style={{ marginTop: 12, background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#16a34a", fontWeight: 500 }}>
                      ✓ Paciente estable — Proceder con valoración integral
                    </div>
                  )}
                </div>

                {/* Observaciones generales */}
                <div className="rp-card-section">
                  <p className="rp-section-title">Observaciones</p>
                  <textarea
                    className="rp-textarea"
                    placeholder="Notas generales sobre la recepción del paciente..."
                    value={observaciones}
                    onChange={e => setObservaciones(e.target.value)}
                  />
                </div>
              </div>

              <div>
                {/* PASO 18: Valoración Integral */}
                <div className="rp-card-section">
                  <p className="rp-section-title">Paso 18 — Valoración Médica Integral</p>
                  <div className="rp-tabs">
                    {[["psiquiatrica", "Psiquiátrica"], ["nutricional", "Nutricional"], ["salud", "Salud General"]].map(([val, label]) => (
                      <button key={val} className={`rp-tab ${tabVal === val ? "active" : ""}`} onClick={() => setTabVal(val)}>
                        {label}
                      </button>
                    ))}
                  </div>
                  {tabVal === "psiquiatrica" && (
                    <textarea
                      className="rp-textarea"
                      placeholder="Notas de valoración psiquiátrica..."
                      value={valPsiquiatrica}
                      onChange={e => setValPsiquiatrica(e.target.value)}
                    />
                  )}
                  {tabVal === "nutricional" && (
                    <textarea
                      className="rp-textarea"
                      placeholder="Notas de valoración nutricional..."
                      value={valNutricional}
                      onChange={e => setValNutricional(e.target.value)}
                    />
                  )}
                  {tabVal === "salud" && (
                    <textarea
                      className="rp-textarea"
                      placeholder="Notas de valoración de salud general..."
                      value={valSalud}
                      onChange={e => setValSalud(e.target.value)}
                    />
                  )}
                </div>

                {/* PASO 19: Plan de Tratamiento */}
                <div className="rp-card-section">
                  <p className="rp-section-title">Paso 19 — Plan de Tratamiento</p>
                  <textarea
                    className="rp-textarea"
                    placeholder="Describe el plan de atención que recibirá el paciente durante su estancia..."
                    value={planTratamiento}
                    onChange={e => setPlanTratamiento(e.target.value)}
                    style={{ minHeight: 130 }}
                  />
                </div>
              </div>
            </div>

            <button className="rp-save-btn" onClick={guardar} disabled={guardando}>
              {guardando ? "Guardando..." : "Guardar Recepción Médica"}
            </button>
            {savedMsg && <div className="rp-saved-msg">✓ Recepción guardada correctamente</div>}
          </>
        )}
      </div>
    </>
  );
}
