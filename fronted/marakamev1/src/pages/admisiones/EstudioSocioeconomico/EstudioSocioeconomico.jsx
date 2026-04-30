import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./EstudioSocioeconomico.css";
import "../Admisiones.css";

const IcoGrid   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
const IcoHome   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21V12h6v9"/></svg>;
const IcoUser   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4"/><line x1="16" y1="11" x2="16" y2="17"/><line x1="13" y1="14" x2="19" y2="14"/></svg>;
const IcoFile   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="13" x2="12" y2="17"/><line x1="10" y1="15" x2="14" y2="15"/></svg>;
const IcoMoney  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/><circle cx="12" cy="14" r="2"/></svg>;
const IcoCal    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoShield = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 2L3 7v5c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7z"/><polyline points="9 12 11 14 15 10"/></svg>;
const IcoDoc    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>;
const IcoFolder = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>;
const IcoUsers  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;

const PASOS = [
  "Datos Solicitante","Datos Beneficiario","Estructura Familiar",
  "Situación Económica","Bienes y Transporte","Asistencia Médica",
  "Vivienda","Materiales","Alimentación","Referencias","Observaciones y Firma"
];

const ALIMENTOS = ["Carne de Res","Carne de Pollo","Carne de Cerdo","Pescado","Leche","Cereales","Huevo","Frutas","Verduras / Leguminosos"];
const FRECUENCIAS = ["Diario","C/3 Días","1 vez a la semana","1 vez al mes","Ocasionalmente"];

const emptyPersona = () => ({ nombre:"", fechaNac:"", edad:"", sexo:"", estadoCivil:"", ocupacion:"", domicilio:"", telefono:"", escolaridad:"", lugarNac:"" });
const emptyFamiliar = () => ({ nombre:"", parentesco:"", edad:"", ocupacion:"", estadoCivil:"", sexo:"" });

export default function EstudioSocioeconomico() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const idPaciente = searchParams.get("id");
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  // --- Buscador de paciente cuando no hay ?id ---
  const [todosLosAptos, setTodosLosAptos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [buscando, setBuscando] = useState(false);
  const [filtroLista, setFiltroLista] = useState("todos");

  useEffect(() => {
    if (idPaciente) return;
    setBuscando(true);
    fetch("http://localhost:3000/pacientes-admision")
      .then(r => r.json())
      .then(data => setTodosLosAptos(Array.isArray(data) ? data.filter(p => p.apto === 1) : []))
      .catch(() => setTodosLosAptos([]))
      .finally(() => setBuscando(false));
  }, [idPaciente]);

  const resultados = (() => {
    let lista = busqueda.trim()
      ? todosLosAptos.filter(p => `${p.nombre} ${p.apellido}`.toLowerCase().includes(busqueda.toLowerCase()))
      : todosLosAptos;
    if (filtroLista === "listo")    lista = lista.filter(p => p.estudio_status === "enviado");
    if (filtroLista === "borrador") lista = lista.filter(p => p.id_estudio && p.estudio_status !== "enviado");
    if (filtroLista === "pendiente")lista = lista.filter(p => !p.id_estudio);
    return lista;
  })();

  const [paso, setPaso] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [folio, setFolio] = useState("");
  const today = new Date().toLocaleDateString("es-MX", { day:"2-digit", month:"long", year:"numeric" });

  // Datos por sección
  const [solicitante, setSolicitante] = useState({ ...emptyPersona(), tarjeta:"", referencias:"" });
  const [beneficiario, setBeneficiario] = useState(emptyPersona());
  const [familiares, setFamiliares] = useState([emptyFamiliar()]);
  const [economia, setEconomia] = useState({
    tieneEmpleo:"", puestoSolicitante:"", empresa:"", horario:"", antiguedad:"",
    tieneConyuge: false,
    ocupacionConjuge:"", empresaConjuge:"", ingresoConjuge:"", antiguedadConjuge:"",
    ingresos:{ solicitante:"", esposo:"", hijos:"", otras:"" },
    egresos:{ alimentacion:"", servicios:"", educacion:"", vivienda:"" }
  });
  const [bienes, setBienes] = useState({ numAutos:0, autos:[] });
  const [salud, setSalud] = useState({
    tipoSeguro:"", montoConsultas:"", otrosSalud:"", miembrosSalud:"",
    adicciones:[
      { tipo:"Alcoholismo",       cantidad:"", frecuencia:"" },
      { tipo:"Tabaco / Nicotina", cantidad:"", frecuencia:"" },
      { tipo:"Drogas ilícitas",   cantidad:"", frecuencia:"" },
      { tipo:"Otras sustancias",  cantidad:"", frecuencia:"" },
    ],
    relacionFamiliar:""
  });
  const [vivienda, setVivienda] = useState({
    regimen:"", tipoVivienda:"", espacio:"", sala:false, comedor:false, cocina:false, jardin:false, banos:"", otrosVivienda:""
  });
  const [materiales, setMateriales] = useState({ piso:"", muros:"", techo:"" });
  const [alimentacion, setAlimentacion] = useState(() => {
    const a = {};
    ALIMENTOS.forEach(al => { a[al] = ""; });
    return a;
  });
  const [referencias, setReferencias] = useState([
    { nombre:"", telefono:"", relacion:"", tiempoConocer:"" },
    { nombre:"", telefono:"", relacion:"", tiempoConocer:"" },
    { nombre:"", telefono:"", relacion:"", tiempoConocer:"" },
  ]);
  const [diagnostico, setDiagnostico] = useState("");
  const [obsTrabajador, setObsTrabajador] = useState("");
  const [obsVisita, setObsVisita] = useState("");
  const [firmaSolicitante, setFirmaSolicitante] = useState("");
  const [firmaTrabajador, setFirmaTrabajador] = useState("");
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    if (idPaciente) cargarEstudio();
  }, [idPaciente]);

  const cargarEstudio = async () => {
    try {
      const [estudioRes, ingresoRes, cuestionarioRes] = await Promise.all([
        fetch(`http://localhost:3000/estudio/${idPaciente}`),
        fetch(`http://localhost:3000/validar-ingreso/${idPaciente}`).catch(() => null),
        fetch(`http://localhost:3000/cuestionario-respuestas/${idPaciente}`).catch(() => null),
      ]);

      const data = await estudioRes.json();
      const ingreso = ingresoRes ? await ingresoRes.json().catch(() => null) : null;
      const cuestionario = cuestionarioRes ? await cuestionarioRes.json().catch(() => null) : null;

      const pac = ingreso?.paciente || null;
      const r = {};
      (cuestionario?.respuestas || []).forEach(x => { r[x.id_pregunta] = x.respuesta || ""; });

      if (data?.datos_json) {
        const parsed = JSON.parse(data.datos_json);
        if (parsed.solicitante) setSolicitante(prev => {
          const merged = { ...prev, ...parsed.solicitante };
          if (!merged.nombre && r[4]) merged.nombre = r[4];
          if (!merged.domicilio && r[6]) merged.domicilio = r[6];
          if (!merged.telefono && (r[7] || r[8])) merged.telefono = r[7] || r[8];
          if (!merged.ocupacion && r[9]) merged.ocupacion = r[9];
          return merged;
        });
        if (parsed.beneficiario) setBeneficiario(prev => {
          const merged = { ...prev, ...parsed.beneficiario };
          if (pac) {
            const nomPac = `${pac.nombre || ""} ${pac.apellido || ""}`.trim();
            if (!merged.nombre && nomPac) merged.nombre = nomPac;
            if (!merged.edad && pac.edad) merged.edad = String(pac.edad);
            if (!merged.estadoCivil && pac.estado_civil) merged.estadoCivil = pac.estado_civil;
            if (!merged.domicilio && pac.direccion) merged.domicilio = pac.direccion;
            if (!merged.ocupacion && pac.ocupacion) merged.ocupacion = pac.ocupacion;
            if (!merged.escolaridad && pac.escolaridad) merged.escolaridad = pac.escolaridad;
          }
          return merged;
        });
        if (parsed.familiares) setFamiliares(parsed.familiares);
        if (parsed.economia) setEconomia(parsed.economia);
        if (parsed.bienes) setBienes(parsed.bienes);
        if (parsed.salud) setSalud(parsed.salud);
        if (parsed.vivienda) setVivienda(parsed.vivienda);
        if (parsed.materiales) setMateriales(parsed.materiales);
        if (parsed.alimentacion) setAlimentacion(parsed.alimentacion);
        if (parsed.referencias) setReferencias(parsed.referencias);
        if (parsed.diagnostico) setDiagnostico(parsed.diagnostico);
        if (parsed.obsTrabajador) setObsTrabajador(parsed.obsTrabajador);
        if (parsed.obsVisita) setObsVisita(parsed.obsVisita);
        if (parsed.firmas?.solicitante) setFirmaSolicitante(parsed.firmas.solicitante);
        if (parsed.firmas?.trabajador) setFirmaTrabajador(parsed.firmas.trabajador);
      } else {
        // Estudio nuevo: pre-llenar desde cuestionario y paciente
        setSolicitante(prev => ({
          ...prev,
          nombre: r[4] || prev.nombre,
          domicilio: r[6] || prev.domicilio,
          telefono: r[7] || r[8] || prev.telefono,
          ocupacion: r[9] || prev.ocupacion,
        }));
        if (pac) {
          setBeneficiario(prev => ({
            ...prev,
            nombre: `${pac.nombre || ""} ${pac.apellido || ""}`.trim() || prev.nombre,
            edad: pac.edad ? String(pac.edad) : prev.edad,
            estadoCivil: pac.estado_civil || prev.estadoCivil,
            domicilio: pac.direccion || prev.domicilio,
            ocupacion: pac.ocupacion || prev.ocupacion,
            escolaridad: pac.escolaridad || prev.escolaridad,
          }));
        }
      }

      if (data?.folio) setFolio(data.folio);
    } catch (e) { console.error(e); }
  };

  const buildPayload = (status = "borrador") => {
    const meta = {
      guardado_por: usuario.nombre || "—",
      id_usuario: usuario.id_usuario || null,
      id_paciente: idPaciente,
      fecha_guardado: new Date().toISOString(),
    };
    const datos = { meta, solicitante, beneficiario, familiares, economia, bienes, salud, vivienda, materiales, alimentacion, referencias, diagnostico, obsTrabajador, obsVisita, firmas: { solicitante: firmaSolicitante, trabajador: firmaTrabajador } };
    const ingresos = economia.ingresos;
    const total = Object.values(ingresos).reduce((s, v) => s + (parseFloat(v) || 0), 0);
    const egresos = economia.egresos;
    const totalEg = Object.values(egresos).reduce((s, v) => s + (parseFloat(v) || 0), 0);
    return {
      id_paciente: idPaciente,
      id_usuario: usuario.id_usuario,
      datos_json: JSON.stringify(datos),
      ingreso_mensual: total || null,
      egreso_mensual: totalEg || null,
      tipo_vivienda: vivienda.tipoVivienda || null,
      nivel_economico: null,
      observaciones: diagnostico || null,
      status
    };
  };

  const guardar = async (status = "borrador") => {
    if (!idPaciente) { alert("No se especificó paciente."); return; }
    setGuardando(true);
    try {
      const res = await fetch("http://localhost:3000/estudio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(status))
      });
      const data = await res.json();
      if (data.folio) setFolio(data.folio);
      if (status === "enviado") {
        alert("Estudio enviado correctamente.");
        navigate("/admisiones");
      } else {
        setSavedMsg(true);
        setTimeout(() => setSavedMsg(false), 2500);
      }
    } catch (e) { alert("Error al guardar: " + e.message); }
    finally { setGuardando(false); }
  };

  const inp = (val, set, field) => e => set(prev => ({ ...prev, [field]: e.target.value }));

  const renderHeader = () => (
    <div className="est-header">
      <div className="est-header-left">
        <div className="est-foto-box">
          <span>📷</span>
        </div>
        <div>
          <h2 className="est-titulo">Estudio Socioeconómico</h2>
          <p className="est-subtitulo">Centro de Rehabilitación y Recuperación Marakame</p>
          <div className="est-badges">
            <span className="est-badge">FECHA {today}</span>
            {folio && <span className="est-badge est-badge-folio">FOLIO #{folio}</span>}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {savedMsg && (
          <span style={{ fontSize: 12, color: "#0b5d5b", fontWeight: 600, background: "#e6f4f3", padding: "4px 12px", borderRadius: 8 }}>
            ✓ Guardado
          </span>
        )}
        <button
          onClick={() => window.print()}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 12, fontWeight: 600, color: "#374151", cursor: "pointer" }}
        >
          🖨️ Imprimir / PDF
        </button>
        <button className="est-btn-borrador" onClick={() => guardar("borrador")} disabled={guardando}>
          💾 GUARDAR BORRADOR
        </button>
      </div>
    </div>
  );

  const renderPasos = () => (
    <div className="est-steps">
      {PASOS.map((p, i) => (
        <button key={i} className={`est-step ${i === paso ? "active" : i < paso ? "done" : ""}`} onClick={() => setPaso(i)}>
          {i < paso ? "✓" : i + 1}
        </button>
      ))}
    </div>
  );

  // ─── SECCIONES ──────────────────────────────────────────
  const renderSolicitante = () => (
    <div className="est-card">
      <h3 className="est-section-title">1. DATOS DEL SOLICITANTE</h3>
      <div className="est-grid-3">
        <div className="est-field"><label>NOMBRE COMPLETO</label><input placeholder="Nombre completo" value={solicitante.nombre} onChange={inp(solicitante, setSolicitante, "nombre")} /></div>
        <div className="est-field"><label>FECHA DE NACIMIENTO</label><input type="date" value={solicitante.fechaNac} onChange={inp(solicitante, setSolicitante, "fechaNac")} /></div>
        <div className="est-field"><label>EDAD</label><input type="number" placeholder="00" value={solicitante.edad} onChange={inp(solicitante, setSolicitante, "edad")} /></div>
      </div>
      <div className="est-grid-3">
        <div className="est-field"><label>SEXO</label>
          <select value={solicitante.sexo} onChange={inp(solicitante, setSolicitante, "sexo")}>
            <option value="">Seleccionar</option><option>Masculino</option><option>Femenino</option><option>Otro</option>
          </select>
        </div>
        <div className="est-field"><label>ESTADO CIVIL</label>
          <select value={solicitante.estadoCivil} onChange={inp(solicitante, setSolicitante, "estadoCivil")}>
            <option value="">Seleccionar</option><option>Soltero/a</option><option>Casado/a</option><option>Divorciado/a</option><option>Viudo/a</option><option>Unión libre</option>
          </select>
        </div>
        <div className="est-field"><label>OCUPACIÓN</label><input placeholder="Profesión u oficio" value={solicitante.ocupacion} onChange={inp(solicitante, setSolicitante, "ocupacion")} /></div>
      </div>
      <div className="est-field"><label>DOMICILIO ACTUAL</label><input placeholder="Calle, Número, Colonia, CP, Municipio, Estado" value={solicitante.domicilio} onChange={inp(solicitante, setSolicitante, "domicilio")} /></div>
      <div className="est-grid-3">
        <div className="est-field"><label>TELÉFONO</label><input placeholder="10 dígitos" value={solicitante.telefono} onChange={inp(solicitante, setSolicitante, "telefono")} /></div>
        <div className="est-field"><label>ESCOLARIDAD</label>
          <select value={solicitante.escolaridad} onChange={inp(solicitante, setSolicitante, "escolaridad")}>
            <option value="">Seleccionar</option><option>Sin estudios</option><option>Primaria</option><option>Secundaria</option><option>Preparatoria</option><option>Universidad</option><option>Posgrado</option>
          </select>
        </div>
        <div className="est-field"><label>LUGAR DE NACIMIENTO</label><input placeholder="Estado, Municipio" value={solicitante.lugarNac} onChange={inp(solicitante, setSolicitante, "lugarNac")} /></div>
      </div>
      <div className="est-grid-2">
        <div className="est-field"><label>¿CUENTA CON ALGUNA TARJETA?</label><input placeholder="Crédito, débito, ahorro" value={solicitante.tarjeta} onChange={inp(solicitante, setSolicitante, "tarjeta")} /></div>
        <div className="est-field"><label>REFERENCIAS</label><input placeholder="Referencias para poder llegar" value={solicitante.referencias} onChange={inp(solicitante, setSolicitante, "referencias")} /></div>
      </div>
    </div>
  );

  const renderBeneficiario = () => (
    <div className="est-card">
      <h3 className="est-section-title">2.- DATOS GENERALES DEL BENEFICIARIO</h3>
      <div className="est-grid-3">
        <div className="est-field"><label>NOMBRE COMPLETO</label><input placeholder="Nombre completo" value={beneficiario.nombre} onChange={inp(beneficiario, setBeneficiario, "nombre")} /></div>
        <div className="est-field"><label>FECHA DE NACIMIENTO</label><input type="date" value={beneficiario.fechaNac} onChange={inp(beneficiario, setBeneficiario, "fechaNac")} /></div>
        <div className="est-field"><label>EDAD</label><input type="number" placeholder="00" value={beneficiario.edad} onChange={inp(beneficiario, setBeneficiario, "edad")} /></div>
      </div>
      <div className="est-grid-3">
        <div className="est-field"><label>SEXO</label>
          <select value={beneficiario.sexo} onChange={inp(beneficiario, setBeneficiario, "sexo")}>
            <option value="">Seleccionar</option><option>Masculino</option><option>Femenino</option><option>Otro</option>
          </select>
        </div>
        <div className="est-field"><label>ESTADO CIVIL</label>
          <select value={beneficiario.estadoCivil} onChange={inp(beneficiario, setBeneficiario, "estadoCivil")}>
            <option value="">Seleccionar</option><option>Soltero/a</option><option>Casado/a</option><option>Divorciado/a</option><option>Viudo/a</option><option>Unión libre</option>
          </select>
        </div>
        <div className="est-field"><label>OCUPACIÓN</label><input placeholder="Profesión u oficio" value={beneficiario.ocupacion} onChange={inp(beneficiario, setBeneficiario, "ocupacion")} /></div>
      </div>
      <div className="est-field"><label>DOMICILIO ACTUAL</label><input placeholder="Calle, Número, Colonia, CP, Municipio, Estado" value={beneficiario.domicilio} onChange={inp(beneficiario, setBeneficiario, "domicilio")} /></div>
      <div className="est-grid-3">
        <div className="est-field"><label>TELÉFONO</label><input placeholder="10 dígitos" value={beneficiario.telefono} onChange={inp(beneficiario, setBeneficiario, "telefono")} /></div>
        <div className="est-field"><label>ESCOLARIDAD</label>
          <select value={beneficiario.escolaridad} onChange={inp(beneficiario, setBeneficiario, "escolaridad")}>
            <option value="">Seleccionar</option><option>Sin estudios</option><option>Primaria</option><option>Secundaria</option><option>Preparatoria</option><option>Universidad</option><option>Posgrado</option>
          </select>
        </div>
        <div className="est-field"><label>LUGAR DE NACIMIENTO</label><input placeholder="Estado, Municipio" value={beneficiario.lugarNac} onChange={inp(beneficiario, setBeneficiario, "lugarNac")} /></div>
      </div>
    </div>
  );

  const renderFamiliares = () => (
    <div className="est-card">
      <div className="est-section-header">
        <h3 className="est-section-title">3. ESTRUCTURA FAMILIAR</h3>
        <button className="est-btn-add" onClick={() => setFamiliares(p => [...p, emptyFamiliar()])}>+ AGREGAR INTEGRANTE</button>
      </div>
      <table className="est-table">
        <thead><tr><th>NOMBRE</th><th>PARENTESCO</th><th>EDAD</th><th>OCUPACIÓN</th><th>ESTADO CIVIL</th><th>SEXO</th><th></th></tr></thead>
        <tbody>
          {familiares.map((f, i) => (
            <tr key={i}>
              <td><input value={f.nombre} onChange={e => setFamiliares(p => p.map((x,j) => j===i?{...x,nombre:e.target.value}:x))} /></td>
              <td><input value={f.parentesco} onChange={e => setFamiliares(p => p.map((x,j) => j===i?{...x,parentesco:e.target.value}:x))} /></td>
              <td><input type="number" value={f.edad} onChange={e => setFamiliares(p => p.map((x,j) => j===i?{...x,edad:e.target.value}:x))} /></td>
              <td><input value={f.ocupacion} onChange={e => setFamiliares(p => p.map((x,j) => j===i?{...x,ocupacion:e.target.value}:x))} /></td>
              <td>
                <select value={f.estadoCivil} onChange={e => setFamiliares(p => p.map((x,j) => j===i?{...x,estadoCivil:e.target.value}:x))}>
                  <option value="">-</option><option>Soltero</option><option>Casado</option><option>Divorciado</option><option>Viudo</option>
                </select>
              </td>
              <td>
                <select value={f.sexo} onChange={e => setFamiliares(p => p.map((x,j) => j===i?{...x,sexo:e.target.value}:x))}>
                  <option value="">-</option><option>Hombre</option><option>Mujer</option><option>Otro</option>
                </select>
              </td>
              <td><button className="est-btn-remove" onClick={() => setFamiliares(p => p.filter((_,j)=>j!==i))}>✕</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderEconomia = () => {
    const tot = Object.values(economia.ingresos).reduce((s,v)=>s+(parseFloat(v)||0),0);
    const totE = Object.values(economia.egresos).reduce((s,v)=>s+(parseFloat(v)||0),0);
    const tieneEmpleo = economia.tieneEmpleo === "Sí";
    const noEmpleo    = economia.tieneEmpleo === "No";
    const disStyle = { opacity: .45, pointerEvents: "none" };
    return (
      <div className="est-card">
        <h3 className="est-section-title">4. SITUACIÓN ECONÓMICA FAMILIAR</h3>
        <div className="est-grid-3">
          <div className="est-field"><label>¿CUENTA CON EMPLEO?</label>
            <select value={economia.tieneEmpleo} onChange={e => setEconomia(p=>({...p,tieneEmpleo:e.target.value}))}>
              <option value="">Seleccionar</option><option>Sí</option><option>No</option>
            </select>
          </div>
          <div className="est-field" style={noEmpleo ? disStyle : {}}><label>PUESTO</label><input placeholder="Puesto" value={economia.puestoSolicitante} onChange={e=>setEconomia(p=>({...p,puestoSolicitante:e.target.value}))} disabled={noEmpleo} /></div>
          <div className="est-field" style={noEmpleo ? disStyle : {}}><label>EMPRESA/INSTITUCIÓN</label><input placeholder="Empresa" value={economia.empresa} onChange={e=>setEconomia(p=>({...p,empresa:e.target.value}))} disabled={noEmpleo} /></div>
          <div className="est-field" style={noEmpleo ? disStyle : {}}><label>HORARIO</label><input placeholder="lunes-viernes 8am-8pm" value={economia.horario} onChange={e=>setEconomia(p=>({...p,horario:e.target.value}))} disabled={noEmpleo} /></div>
          <div className="est-field" style={noEmpleo ? disStyle : {}}><label>ANTIGÜEDAD</label><input placeholder="Años" value={economia.antiguedad} onChange={e=>setEconomia(p=>({...p,antiguedad:e.target.value}))} disabled={noEmpleo} /></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 16, marginBottom: 8 }}>
          <h4 style={{ margin: 0, color: "#374151", fontSize: 13, fontWeight: 600 }}>CÓNYUGE</h4>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#6b7280", cursor: "pointer", fontWeight: 500 }}>
            <input type="checkbox" checked={!!economia.tieneConyuge} onChange={e=>setEconomia(p=>({...p,tieneConyuge:e.target.checked}))} />
            ¿Tiene cónyuge?
          </label>
        </div>
        {economia.tieneConyuge ? (
          <div className="est-grid-3">
            <div className="est-field"><label>OCUPACIÓN</label><input placeholder="Escribirla" value={economia.ocupacionConjuge} onChange={e=>setEconomia(p=>({...p,ocupacionConjuge:e.target.value}))} /></div>
            <div className="est-field"><label>EMPRESA/INSTITUCIÓN</label><input placeholder="Empresa" value={economia.empresaConjuge} onChange={e=>setEconomia(p=>({...p,empresaConjuge:e.target.value}))} /></div>
            <div className="est-field"><label>INGRESO NETO MENSUAL</label><input placeholder="$0" value={economia.ingresoConjuge} onChange={e=>setEconomia(p=>({...p,ingresoConjuge:e.target.value}))} /></div>
            <div className="est-field"><label>ANTIGÜEDAD</label><input placeholder="Años" value={economia.antiguedadConjuge} onChange={e=>setEconomia(p=>({...p,antiguedadConjuge:e.target.value}))} /></div>
          </div>
        ) : (
          <div style={{ padding: "12px 14px", background: "#f9fafb", borderRadius: 8, fontSize: 12, color: "#9ca3af" }}>
            Activa la opción "¿Tiene cónyuge?" para llenar estos datos.
          </div>
        )}
        <div className="est-ingresos-grid">
          <div className="est-card-inner">
            <h4>INGRESOS MENSUALES</h4>
            {[["solicitante","Solicitante"],["esposo","Esposo(a)"],["hijos","Hijos(as)"],["otras","Otras"]].map(([k,l])=>(
              <div key={k} className="est-ingreso-row"><span>{l}</span><input placeholder="$0" value={economia.ingresos[k]} onChange={e=>setEconomia(p=>({...p,ingresos:{...p.ingresos,[k]:e.target.value}}))} /></div>
            ))}
            <div className="est-total" style={{color:"#ef4444"}}>TOTAL: ${tot.toLocaleString()}</div>
          </div>
          <div className="est-card-inner">
            <h4>EGRESOS MENSUALES</h4>
            {[["alimentacion","Alimentación"],["servicios","Servicios"],["educacion","Educación"],["vivienda","Vivienda/Renta"]].map(([k,l])=>(
              <div key={k} className="est-ingreso-row"><span>{l}</span><input placeholder="$0" value={economia.egresos[k]} onChange={e=>setEconomia(p=>({...p,egresos:{...p.egresos,[k]:e.target.value}}))} /></div>
            ))}
            <div className="est-total" style={{color:"#ef4444"}}>TOTAL: ${totE.toLocaleString()}</div>
          </div>
          <div className="est-balance" style={{background: tot-totE >= 0 ? "#0b5d5b" : "#ef4444"}}>
            <span style={{fontSize:12,opacity:.8}}>BALANCE MENSUAL</span>
            <span style={{fontSize:28,fontWeight:700}}>{tot-totE >= 0 ? "+" : ""}${(tot-totE).toLocaleString()}</span>
            <span className="est-balance-badge">{tot-totE >= 0 ? "SUPERÁVIT" : "DÉFICIT"}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderBienes = () => (
    <div className="est-card">
      <h3 className="est-section-title">5. BIENES Y TRANSPORTE</h3>
      <div className="est-field" style={{marginBottom:16}}>
        <label>NÚMERO DE VEHÍCULOS</label>
        <input type="number" min="0" max="10" value={bienes.numAutos} onChange={e=>{
          const n = parseInt(e.target.value)||0;
          setBienes(p=>({ numAutos:n, autos: Array.from({length:n},(_,i)=>p.autos[i]||{modelo:"",anio:"",uso:"",cantidad:1}) }));
        }} style={{width:80}} />
      </div>
      {bienes.autos.map((a,i)=>(
        <div key={i} className="est-auto-card">
          <div className="est-grid-3">
            <div className="est-field"><label>MODELO</label><input placeholder="Nissan Sentra" value={a.modelo} onChange={e=>setBienes(p=>({...p,autos:p.autos.map((x,j)=>j===i?{...x,modelo:e.target.value}:x)}))} /></div>
            <div className="est-field"><label>AÑO</label><input placeholder="2018" value={a.anio} onChange={e=>setBienes(p=>({...p,autos:p.autos.map((x,j)=>j===i?{...x,anio:e.target.value}:x)}))} /></div>
            <div className="est-field"><label>USO</label>
              <select value={a.uso} onChange={e=>setBienes(p=>({...p,autos:p.autos.map((x,j)=>j===i?{...x,uso:e.target.value}:x)}))}>
                <option value="">Seleccionar</option><option>Particular</option><option>Cónyuge</option><option>Trabajo</option>
              </select>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSalud = () => (
    <div className="est-card">
      <h3 className="est-section-title">ASISTENCIA MÉDICA</h3>
      <div className="est-grid-3" style={{marginBottom:16}}>
        <div className="est-field"><label>USTED TIENE</label>
          <select value={salud.tipoSeguro} onChange={e=>setSalud(p=>({...p,tipoSeguro:e.target.value}))}>
            <option value="">Seleccionar</option><option>IMSS</option><option>ISSSTE</option><option>Seguro Privado</option><option>Ninguno</option>
          </select>
        </div>
        <div className="est-field"><label>MONTO CONSULTAS</label><input placeholder="$$$$$" value={salud.montoConsultas} onChange={e=>setSalud(p=>({...p,montoConsultas:e.target.value}))} /></div>
        <div className="est-field"><label>OTROS</label><input placeholder="00" value={salud.otrosSalud} onChange={e=>setSalud(p=>({...p,otrosSalud:e.target.value}))} /></div>
      </div>
      <h3 className="est-section-title" style={{marginTop:20}}>ADICCIONES</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}}>
        {salud.adicciones.map((a,i)=>(
          <div key={i} className="est-card-inner">
            <div className="est-field"><label>{a.tipo}</label>
              <select value={a.cantidad} onChange={e=>setSalud(p=>({...p,adicciones:p.adicciones.map((x,j)=>j===i?{...x,cantidad:e.target.value}:x)}))}>
                <option value="">Cantidad</option><option>Poca</option><option>Moderada</option><option>Mucha</option>
              </select>
            </div>
            <div className="est-field">
              <select value={a.frecuencia} onChange={e=>setSalud(p=>({...p,adicciones:p.adicciones.map((x,j)=>j===i?{...x,frecuencia:e.target.value}:x)}))}>
                <option value="">Frecuencia</option><option>Diario</option><option>Semanal</option><option>Mensual</option><option>Ocasional</option>
              </select>
            </div>
          </div>
        ))}
      </div>
      <div className="est-field"><label>RELACIÓN FAMILIAR</label><textarea placeholder="(Describa):" value={salud.relacionFamiliar} onChange={e=>setSalud(p=>({...p,relacionFamiliar:e.target.value}))} /></div>
    </div>
  );

  const renderVivienda = () => (
    <div className="est-card">
      <h3 className="est-section-title">7. VIVIENDA</h3>
      <div className="est-grid-3" style={{marginBottom:16}}>
        <div className="est-field"><label>RÉGIMEN DE VIVIENDA</label>
          <select value={vivienda.regimen} onChange={e=>setVivienda(p=>({...p,regimen:e.target.value}))}>
            <option value="">Seleccionar</option><option>Sin vivienda</option><option>Familiar/Prestada/Rentada</option><option>Propia</option><option>Más de 1 vivienda</option>
          </select>
        </div>
        <div className="est-field"><label>TIPO DE VIVIENDA</label>
          <select value={vivienda.tipoVivienda} onChange={e=>setVivienda(p=>({...p,tipoVivienda:e.target.value}))}>
            <option value="">Seleccionar</option><option>Vecindad</option><option>Condominio</option><option>Interés Social</option><option>Casa Habitación</option><option>Residencial M.</option><option>Residencial A.</option>
          </select>
        </div>
        <div className="est-field"><label>ESPACIO/HABITACIONES</label>
          <select value={vivienda.espacio} onChange={e=>setVivienda(p=>({...p,espacio:e.target.value}))}>
            <option value="">Seleccionar</option><option>1 Solo Cuarto</option><option>2 Dormitorios</option><option>3-4 Dormitorios</option><option>Residencial A.</option>
          </select>
        </div>
      </div>
      <h4 style={{marginBottom:12,color:"#374151",fontSize:13,fontWeight:600}}>CARACTERÍSTICAS DE LA VIVIENDA</h4>
      <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:16}}>
        {["sala","comedor","cocina","jardin"].map(c=>(
          <label key={c} className={`est-chip ${vivienda[c]?"est-chip-active":""}`} onClick={()=>setVivienda(p=>({...p,[c]:!p[c]}))}>
            {c.charAt(0).toUpperCase()+c.slice(1)} {vivienda[c]?"✓":""}
          </label>
        ))}
        <div className="est-field" style={{display:"inline-flex",alignItems:"center",gap:8,margin:0}}>
          <label style={{margin:0}}>Baños:</label>
          <input type="number" min="0" value={vivienda.banos} onChange={e=>setVivienda(p=>({...p,banos:e.target.value}))} style={{width:60}} />
        </div>
      </div>
      <div className="est-field"><label>OTROS (ESPECIFIQUE)</label><textarea placeholder="(Describa):" value={vivienda.otrosVivienda} onChange={e=>setVivienda(p=>({...p,otrosVivienda:e.target.value}))} /></div>
    </div>
  );

  const renderMateriales = () => (
    <div className="est-card">
      <h3 className="est-section-title">8. MATERIALES DE CONSTRUCCIÓN</h3>
      <div className="est-grid-3">
        <div className="est-field"><label>PISO</label>
          <select value={materiales.piso} onChange={e=>setMateriales(p=>({...p,piso:e.target.value}))}>
            <option value="">Seleccionar</option><option>Tierra / Concreto / Mosaico</option><option>Vitropiso</option><option>Otros</option>
          </select>
        </div>
        <div className="est-field"><label>MUROS</label>
          <select value={materiales.muros} onChange={e=>setMateriales(p=>({...p,muros:e.target.value}))}>
            <option value="">Seleccionar</option><option>Adobe / Tabique</option><option>Concreto</option><option>Otros</option>
          </select>
        </div>
        <div className="est-field"><label>TECHO</label>
          <select value={materiales.techo} onChange={e=>setMateriales(p=>({...p,techo:e.target.value}))}>
            <option value="">Seleccionar</option><option>Lámina / Cartón / Asbesto</option><option>Concreto</option><option>Otros</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderAlimentacion = () => (
    <div className="est-card">
      <h3 className="est-section-title">8. ALIMENTACIÓN (FRECUENCIA SEMANAL)</h3>
      <table className="est-table">
        <thead>
          <tr><th>TIPO DE ALIMENTO</th>{FRECUENCIAS.map(f=><th key={f}>{f}</th>)}</tr>
        </thead>
        <tbody>
          {ALIMENTOS.map(al=>(
            <tr key={al}>
              <td>{al}</td>
              {FRECUENCIAS.map(f=>(
                <td key={f}>
                  <input type="radio" name={al} checked={alimentacion[al]===f} onChange={()=>setAlimentacion(p=>({...p,[al]:f}))} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderReferencias = () => (
    <div className="est-card">
      <h3 className="est-section-title">REFERENCIAS PERSONALES</h3>
      <table className="est-table">
        <thead><tr><th>Nombre</th><th>Teléfono</th><th>Relación</th><th>Tiempo de Conocerse</th></tr></thead>
        <tbody>
          {referencias.map((r,i)=>(
            <tr key={i}>
              <td><input value={r.nombre} onChange={e=>setReferencias(p=>p.map((x,j)=>j===i?{...x,nombre:e.target.value}:x))} /></td>
              <td><input value={r.telefono} onChange={e=>setReferencias(p=>p.map((x,j)=>j===i?{...x,telefono:e.target.value}:x))} /></td>
              <td><input value={r.relacion} onChange={e=>setReferencias(p=>p.map((x,j)=>j===i?{...x,relacion:e.target.value}:x))} /></td>
              <td><input value={r.tiempoConocer} onChange={e=>setReferencias(p=>p.map((x,j)=>j===i?{...x,tiempoConocer:e.target.value}:x))} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="est-field" style={{marginTop:20}}><label>DIAGNÓSTICO</label><textarea value={diagnostico} onChange={e=>setDiagnostico(e.target.value)} rows={4} /></div>
    </div>
  );

  const renderFirmas = () => (
    <div className="est-card">
      <div className="est-field" style={{marginBottom:20}}><label>OBSERVACIONES DEL TRABAJADOR SOCIAL</label><textarea value={obsTrabajador} onChange={e=>setObsTrabajador(e.target.value)} rows={4} /></div>
      <div className="est-field" style={{marginBottom:20}}><label>OBSERVACIONES DE LA VISITA DOMICILIARIA</label><textarea value={obsVisita} onChange={e=>setObsVisita(e.target.value)} rows={4} /></div>
      <div className="est-firmas">
        <div className="est-firma-box">
          {firmaSolicitante
            ? <img src={firmaSolicitante} alt="Firma solicitante" style={{ maxHeight: 80, maxWidth: "100%", border: "1px solid #e5e7eb", borderRadius: 6, marginBottom: 6 }} />
            : <div className="est-firma-linea" />}
          <span>FIRMA DEL SOLICITANTE</span>
          <label style={{ marginTop: 6, fontSize: 11, color: "#0b5d5b", cursor: "pointer", fontWeight: 600 }}>
            {firmaSolicitante ? "Cambiar archivo" : "Subir firma (imagen/PDF)"}
            <input type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={e => {
              const f = e.target.files[0];
              if (!f) return;
              const reader = new FileReader();
              reader.onload = ev => setFirmaSolicitante(ev.target.result);
              reader.readAsDataURL(f);
            }} />
          </label>
          {firmaSolicitante && (
            <button onClick={() => setFirmaSolicitante("")} style={{ marginTop: 4, fontSize: 11, color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>
              Eliminar
            </button>
          )}
        </div>
        <div className="est-firma-box">
          {firmaTrabajador
            ? <img src={firmaTrabajador} alt="Firma trabajador" style={{ maxHeight: 80, maxWidth: "100%", border: "1px solid #e5e7eb", borderRadius: 6, marginBottom: 6 }} />
            : <div className="est-firma-linea" style={{ borderColor: "#0b5d5b" }} />}
          <span>FIRMA DEL TRABAJADOR SOCIAL</span>
          <small style={{ marginTop: 2 }}>{usuario.nombre || ""}</small>
          <label style={{ marginTop: 6, fontSize: 11, color: "#0b5d5b", cursor: "pointer", fontWeight: 600 }}>
            {firmaTrabajador ? "Cambiar archivo" : "Subir firma (imagen/PDF)"}
            <input type="file" accept="image/*,.pdf" style={{ display: "none" }} onChange={e => {
              const f = e.target.files[0];
              if (!f) return;
              const reader = new FileReader();
              reader.onload = ev => setFirmaTrabajador(ev.target.result);
              reader.readAsDataURL(f);
            }} />
          </label>
          {firmaTrabajador && (
            <button onClick={() => setFirmaTrabajador("")} style={{ marginTop: 4, fontSize: 11, color: "#ef4444", background: "none", border: "none", cursor: "pointer" }}>
              Eliminar
            </button>
          )}
        </div>
      </div>
      <div className="est-footer-actions">
        <button className="est-btn-cancel" onClick={()=>navigate("/admisiones")}>Cancelar</button>
        <button className="est-btn-save" onClick={()=>guardar("enviado")} disabled={guardando}>
          {guardando ? "Enviando..." : "ENVIAR ESTUDIO FINAL"}
        </button>
      </div>
    </div>
  );

  const RENDERS = [renderSolicitante, renderBeneficiario, renderFamiliares, renderEconomia, renderBienes, renderSalud, renderVivienda, renderMateriales, renderAlimentacion, renderReferencias, renderFirmas];

  // ─── Pantalla de selección de paciente ──────────────────
  if (!idPaciente) {
    return (
      <div className="dashboard">
        <div className="adm-sidebar">
          <h2>MARAKAME</h2>
          <p className="user">ADMISIONES: {usuario.nombre || "—"}</p>
          <ul>
            <li onClick={() => navigate("/")}><IcoGrid />Inicio</li>
            <li onClick={() => navigate("/admisiones")}><IcoHome />Admisiones</li>
            <li onClick={() => navigate("/pacientes")}><IcoUsers />Pacientes</li>
            <li onClick={() => navigate("/registro")}><IcoUser />Agregar Paciente</li>
            <li onClick={() => navigate("/historial")}><IcoFile />Historial clínico</li>
            <li className="active"><IcoMoney />Estudio Socioeconómico</li>
            <li onClick={() => navigate("/citas")}><IcoCal />Agenda de Citas</li>
            <li onClick={() => navigate("/validacion")}><IcoShield />Validación de Ingreso</li>
            <li onClick={() => navigate("/preingreso")}><IcoDoc />Preingreso</li>
            <li onClick={() => navigate("/expedientes")}><IcoFolder />Expedientes</li>
          </ul>
        </div>
        <div className="main">
          <div className="header">
            <h3>Estudio Socioeconómico</h3>
          </div>
          <div style={{ padding: "24px 28px" }}>
            <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 4 }}>
              Solo se muestran pacientes con valoración médica <strong>Apto</strong>.
            </p>
            <p style={{ fontSize: 12, color: "#9ca3af", marginBottom: 16 }}>
              El médico debe aprobar primero antes de llenar el estudio.
            </p>
            <div style={{ position: "relative", maxWidth: 440, marginBottom: 16 }}>
              <input
                style={{ width: "100%", padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, outline: "none" }}
                placeholder="Buscar paciente por nombre..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
              />
              {buscando && <span style={{ position: "absolute", right: 12, top: 11, fontSize: 12, color: "#9ca3af" }}>Cargando...</span>}
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
              {[
                ["todos",    "Todos",    "#9ca3af"],
                ["listo",    "Listo",    "#0b5d5b"],
                ["borrador", "Borrador", "#d97706"],
                ["pendiente","Pendiente","#6b7280"],
              ].map(([val, label, dot]) => (
                <button
                  key={val}
                  onClick={() => setFiltroLista(val)}
                  style={{
                    padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
                    background: filtroLista === val ? "#0b5d5b" : "#fff",
                    color: filtroLista === val ? "#fff" : "#374151",
                    border: `1px solid ${filtroLista === val ? "#0b5d5b" : "#e5e7eb"}`,
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: filtroLista === val ? "#fff" : dot, display: "inline-block" }} />
                  {label}
                  <span style={{ fontSize: 11, opacity: .7 }}>
                    ({val === "todos" ? todosLosAptos.length :
                      val === "listo" ? todosLosAptos.filter(p => p.estudio_status === "enviado").length :
                      val === "borrador" ? todosLosAptos.filter(p => p.id_estudio && p.estudio_status !== "enviado").length :
                      todosLosAptos.filter(p => !p.id_estudio).length})
                  </span>
                </button>
              ))}
            </div>
            {!buscando && resultados.length === 0 && (
              <p style={{ fontSize: 13, color: "#9ca3af" }}>
                {busqueda.trim() ? "No hay coincidencias." : "No hay pacientes con valoración médica Apto aún."}
              </p>
            )}
            {resultados.length > 0 && (() => {
              const listos    = resultados.filter(p => p.estudio_status === "enviado");
              const borradores= resultados.filter(p => p.id_estudio && p.estudio_status !== "enviado");
              const pendientes= resultados.filter(p => !p.id_estudio);
              const PacCard = ({ p, bg, badgeBg, badgeColor, badgeText, accion }) => (
                <div
                  key={p.id_paciente}
                  onClick={() => navigate(`/estudio?id=${p.id_paciente}`)}
                  style={{ background: bg || "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 18, cursor: "pointer", transition: "all .15s" }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,.08)"; e.currentTarget.style.borderColor = "#0b5d5b"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#e5e7eb"; }}
                >
                  <div style={{ fontWeight: 700, fontSize: 15, color: "#111827", marginBottom: 4 }}>{p.nombre} {p.apellido}</div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>{p.edad} años</div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 8, background: badgeBg, color: badgeColor }}>{badgeText}</span>
                  <div style={{ marginTop: 10, fontSize: 12, color: "#0b5d5b", fontWeight: 600 }}>{accion}</div>
                </div>
              );
              const Section = ({ title, dot, items, badgeBg, badgeColor, badgeText, accion }) => items.length === 0 ? null : (
                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <span style={{ width: 10, height: 10, borderRadius: "50%", background: dot, display: "inline-block" }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#374151" }}>{title}</span>
                    <span style={{ fontSize: 11, color: "#9ca3af" }}>({items.length})</span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
                    {items.map(p => <PacCard key={p.id_paciente} p={p} badgeBg={badgeBg} badgeColor={badgeColor} badgeText={badgeText} accion={accion} />)}
                  </div>
                </div>
              );
              return (
                <>
                  <Section title="Listo" dot="#0b5d5b" items={listos} badgeBg="#e6f4f3" badgeColor="#0b5d5b" badgeText="✓ Enviado" accion="Ver Estudio →" />
                  <Section title="Borrador" dot="#d97706" items={borradores} badgeBg="#fff7ed" badgeColor="#d97706" badgeText="Borrador" accion="Continuar →" />
                  <Section title="Pendiente" dot="#9ca3af" items={pendientes} badgeBg="#e6f4f3" badgeColor="#0b5d5b" badgeText="✓ Médico: Apto" accion="Iniciar Estudio →" />
                </>
              );
            })()}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="adm-sidebar">
        <h2>MARAKAME</h2>
        <p className="user">ADMISIONES: {usuario.nombre || "—"}</p>
        <ul>
          <li onClick={() => navigate("/")}><IcoGrid />Inicio</li>
          <li onClick={() => navigate("/admisiones")}><IcoHome />Admisiones</li>
          <li onClick={() => navigate("/pacientes")}><IcoUsers />Pacientes</li>
          <li onClick={() => navigate("/registro")}><IcoUser />Agregar Paciente</li>
          <li onClick={() => navigate("/historial")}><IcoFile />Historial clínico</li>
          <li className="active"><IcoMoney />Estudio Socioeconómico</li>
          <li onClick={() => navigate("/citas")}><IcoCal />Agenda de Citas</li>
          <li onClick={() => navigate("/validacion")}><IcoShield />Validación de Ingreso</li>
          <li onClick={() => navigate("/contratos")}><IcoDoc />Contratos</li>
          <li onClick={() => navigate("/expedientes")}><IcoFolder />Expedientes</li>
        </ul>
      </div>
      <div className="main" style={{ overflowY: "auto", padding: 0 }}>
        <div className="est-layout">
          {renderHeader()}
          {renderPasos()}
          <div className="est-content">
            <h3 className="est-paso-titulo">{PASOS[paso]}</h3>
            {RENDERS[paso]()}
            <div className="est-nav">
              {paso > 0 && <button className="est-btn-ant" onClick={()=>setPaso(p=>p-1)}>← Anterior</button>}
              {paso < PASOS.length - 1 && <button className="est-btn-sig" onClick={()=>setPaso(p=>p+1)}>Siguiente →</button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
