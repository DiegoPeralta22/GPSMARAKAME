import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./RegistroPaciente.css";

const IcoGrid   = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
const IcoHome   = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21V12h6v9"/></svg>;
const IcoUser   = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="9" cy="7" r="4"/><path d="M3 21v-2a4 4 0 0 1 4-4h4"/><line x1="16" y1="11" x2="16" y2="17"/><line x1="13" y1="14" x2="19" y2="14"/></svg>;
const IcoFile   = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="13" x2="12" y2="17"/><line x1="10" y1="15" x2="14" y2="15"/></svg>;
const IcoMoney  = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/><circle cx="12" cy="14" r="2"/></svg>;
const IcoCal    = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IcoShield = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M12 2L3 7v5c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V7z"/><polyline points="9 12 11 14 15 10"/></svg>;
const IcoDoc    = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>;
const IcoFolder = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>;

export default function RegistroPaciente() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");
  const today = new Date().toISOString().slice(0, 16);
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const [guardando, setGuardando] = useState(false);
  const [editCuestionarioId, setEditCuestionarioId] = useState(null);

  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const [pacRes, respRes] = await Promise.all([
          fetch(`http://localhost:3000/validar-ingreso/${editId}`),
          fetch(`http://localhost:3000/cuestionario-respuestas/${editId}`)
        ]);
        if (!pacRes.ok || !respRes.ok) return;
        const pacData = await pacRes.json();
        const respData = await respRes.json();
        const pac = pacData.paciente;
        if (pac) {
          setNombrePaciente(pac.nombre || "");
          setApellidoPaciente(pac.apellido || "");
          setEdad(String(pac.edad ?? ""));
          setEstadoCivil(pac.estado_civil || "");
          setDomicilioPaciente(pac.direccion || "");
          setEscolaridad(pac.escolaridad || "");
          setTelefonoPaciente(pac.telefono || "");
          setOcupacionPaciente(pac.ocupacion || "");
          setOrientacionSexual(pac.orientacion_sexual || "");
          setGruposVulnerables(pac.grupos_vulnerables || "");
        }
        setEditCuestionarioId(respData.id_cuestionario);
        const r = {};
        (respData.respuestas || []).forEach(x => { r[x.id_pregunta] = x.respuesta || ""; });
        if (r[3]) setFuente(r[3]);
        if (r[4]) setNombreSolicitante(r[4]);
        if (r[5]) setProcedencia(r[5]);
        if (r[6]) setDomicilioSolicitante(r[6]);
        if (r[7]) setTelefonoSolicitante(r[7]);
        if (r[8]) setCelularSolicitante(r[8]);
        if (r[9]) setOcupacionSolicitante(r[9]);
        if (r[10]) setParentesco(r[10]);
        if (r[20] && r[20].trim()) {
          const knowns = ["Alcohol","Cocaína","Marihuana","Base","Éxtasis","Tabaco","BZD","Inhalantes","TCA","Ludopatía","Ácidos"];
          const parts = r[20].split(", ");
          setSustancias(parts.filter(s => knowns.includes(s)));
          const other = parts.filter(s => !knowns.includes(s)).join(", ");
          if (other) setOtraSustancia(other);
        }
        if (r[21]) setAceptaInternarse(r[21]);
        if (r[22]) setRequiereIntervencion(r[22]);
        if (r[23]) setTratamientoPrevio(r[23]);
        if (r[24]) setDonde(r[24]);
        if (r[25]) setObservacionesValoracion(r[25]);
        if (r[26]) setEstado(r[26]);
        if (r[29]) setFechaInternamiento(r[29]);
      } catch(e) { console.error("Error cargando cuestionario:", e); }
    })();
  }, [editId]);

  // SECCIÓN 1
  const [fuente, setFuente] = useState("");

  // SECCIÓN 2 - SOLICITANTE
  const [nombreSolicitante, setNombreSolicitante] = useState("");
  const [parentesco, setParentesco] = useState("");
  const [procedencia, setProcedencia] = useState("");
  const [domicilioSolicitante, setDomicilioSolicitante] = useState("");
  const [telefonoSolicitante, setTelefonoSolicitante] = useState("");
  const [celularSolicitante, setCelularSolicitante] = useState("");
  const [ocupacionSolicitante, setOcupacionSolicitante] = useState("");
  const [fechaNacimientoSolicitante, setFechaNacimientoSolicitante] = useState("");
  const [generoSolicitante, setGeneroSolicitante] = useState("");

  // SECCIÓN 3 - PACIENTE
  const [nombrePaciente, setNombrePaciente] = useState("");
  const [apellidoPaciente, setApellidoPaciente] = useState("");
  const [fechaNacimientoPaciente, setFechaNacimientoPaciente] = useState("");
  const [generoPaciente, setGeneroPaciente] = useState("");
  const [orientacionSexual, setOrientacionSexual] = useState("");
  const [gruposVulnerables, setGruposVulnerables] = useState("");
  const [edad, setEdad] = useState("");
  const [estadoCivil, setEstadoCivil] = useState("");
  const [numHijos, setNumHijos] = useState("");
  const [domicilioPaciente, setDomicilioPaciente] = useState("");
  const [escolaridad, setEscolaridad] = useState("");
  const [lugarOrigen, setLugarOrigen] = useState("");
  const [telefonoPaciente, setTelefonoPaciente] = useState("");
  const [ocupacionPaciente, setOcupacionPaciente] = useState("");

  // SECCIÓN 4 - VALORACIÓN
  const [sustancias, setSustancias] = useState([]);
  const [otraSustancia, setOtraSustancia] = useState("");
  const [aceptaInternarse, setAceptaInternarse] = useState("");
  const [requiereIntervencion, setRequiereIntervencion] = useState("");
  const [tratamientoPrevio, setTratamientoPrevio] = useState("");
  const [donde, setDonde] = useState("");
  const [observacionesValoracion, setObservacionesValoracion] = useState("");

  // SECCIÓN 5 - ESTATUS
  const [estado, setEstado] = useState("");
  const [fechaInternamiento, setFechaInternamiento] = useState("");
  const [medicoValoro, setMedicoValoro] = useState("");
  const [observacionesMedicas, setObservacionesMedicas] = useState("");

  const toggleSustancia = (sustancia) => {
    setSustancias(prev =>
      prev.includes(sustancia)
        ? prev.filter(s => s !== sustancia)
        : [...prev, sustancia]
    );
  };

  const handleSubmit = async () => {
    if (!nombrePaciente.trim()) {
      alert("El nombre del paciente es requerido");
      return;
    }
    setGuardando(true);
    try {
      const todasLasSustancias = otraSustancia
        ? [...sustancias, otraSustancia].join(", ")
        : sustancias.join(", ");

      let id_cuestionario;
      let id_paciente_creado = editId ? parseInt(editId) : null;

      if (editId) {
        // MODO EDICIÓN: actualizar paciente existente
        await fetch(`http://localhost:3000/pacientes/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: nombrePaciente, apellido: apellidoPaciente, edad,
            estado_civil: estadoCivil, direccion: domicilioPaciente, escolaridad,
            telefono: telefonoPaciente, ocupacion: ocupacionPaciente,
            fecha_nacimiento: fechaNacimientoPaciente || null, genero: generoPaciente || null,
            orientacion_sexual: orientacionSexual || null,
            grupos_vulnerables: gruposVulnerables || null,
          })
        });
        if (editCuestionarioId) {
          id_cuestionario = editCuestionarioId;
        } else {
          const resCuest = await fetch("http://localhost:3000/cuestionario", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_paciente: parseInt(editId) })
          });
          if (!resCuest.ok) throw new Error("Error al crear cuestionario");
          id_cuestionario = (await resCuest.json()).id_cuestionario;
        }
      } else {
        // MODO CREACIÓN: nuevo paciente + cuestionario
        const resPaciente = await fetch("http://localhost:3000/pacientes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: nombrePaciente, apellido: apellidoPaciente, edad,
            estado_civil: estadoCivil, direccion: domicilioPaciente, escolaridad,
            telefono: telefonoPaciente, ocupacion: ocupacionPaciente,
            fecha_nacimiento: fechaNacimientoPaciente || null, genero: generoPaciente || null
          })
        });
        if (!resPaciente.ok) throw new Error("Error al crear paciente");
        const paciente = await resPaciente.json();
        const id_paciente = paciente.id_paciente;
        id_paciente_creado = id_paciente;

        await fetch("http://localhost:3000/familiar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id_paciente, nombre: nombreSolicitante, parentesco,
            telefono: telefonoSolicitante || celularSolicitante, direccion: domicilioSolicitante
          })
        });

        const resCuestionario = await fetch("http://localhost:3000/cuestionario", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_paciente })
        });
        if (!resCuestionario.ok) throw new Error("Error al crear cuestionario");
        id_cuestionario = (await resCuestionario.json()).id_cuestionario;
      }

      const respuestas = [
        { id_pregunta: 1,  respuesta: today },
        { id_pregunta: 2,  respuesta: usuario?.nombre || "" },
        { id_pregunta: 3,  respuesta: fuente },
        { id_pregunta: 4,  respuesta: nombreSolicitante },
        { id_pregunta: 5,  respuesta: procedencia },
        { id_pregunta: 6,  respuesta: domicilioSolicitante },
        { id_pregunta: 7,  respuesta: telefonoSolicitante },
        { id_pregunta: 8,  respuesta: celularSolicitante },
        { id_pregunta: 9,  respuesta: ocupacionSolicitante },
        { id_pregunta: 10, respuesta: parentesco },
        { id_pregunta: 11, respuesta: `${nombrePaciente} ${apellidoPaciente}`.trim() },
        { id_pregunta: 12, respuesta: edad },
        { id_pregunta: 13, respuesta: estadoCivil },
        { id_pregunta: 14, respuesta: numHijos },
        { id_pregunta: 15, respuesta: domicilioPaciente },
        { id_pregunta: 16, respuesta: escolaridad },
        { id_pregunta: 17, respuesta: lugarOrigen },
        { id_pregunta: 18, respuesta: telefonoPaciente },
        { id_pregunta: 19, respuesta: ocupacionPaciente },
        { id_pregunta: 20, respuesta: todasLasSustancias },
        { id_pregunta: 21, respuesta: aceptaInternarse },
        { id_pregunta: 22, respuesta: requiereIntervencion },
        { id_pregunta: 23, respuesta: tratamientoPrevio },
        { id_pregunta: 24, respuesta: donde },
        { id_pregunta: 25, respuesta: observacionesValoracion },
        { id_pregunta: 26, respuesta: estado },
        { id_pregunta: 27, respuesta: estado === "En espera de llamada" ? "Sí" : "No" },
        { id_pregunta: 28, respuesta: estado === "En espera de visita" ? "Sí" : "No" },
        { id_pregunta: 29, respuesta: fechaInternamiento },
        { id_pregunta: 30, respuesta: medicoValoro },
        { id_pregunta: 31, respuesta: observacionesMedicas },
      ];

      const resIngreso = await fetch("http://localhost:3000/ingreso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_cuestionario, respuestas })
      });

      if (resIngreso.ok) {
        // Si hay fecha de internamiento, crear una cita en el módulo de Agenda
        if (fechaInternamiento && id_paciente_creado) {
          await fetch("http://localhost:3000/citas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id_paciente: id_paciente_creado,
              fecha: fechaInternamiento.length === 16 ? fechaInternamiento + ":00" : fechaInternamiento,
              tipo: "Primera vez",
              familiar_nombre: nombreSolicitante || null,
              id_usuario: usuario?.id_usuario || null,
            }),
          }).catch(() => {});
        }
        alert(editId ? "Cuestionario actualizado correctamente" : "Registro guardado correctamente");
        navigate(editId ? "/validacion" : "/admisiones");
      } else {
        alert("Error al guardar: " + await resIngreso.text());
      }
    } catch (error) {
      console.error(error);
      alert("Error: " + error.message);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="layout">

      {/* SIDEBAR */}
      <aside className="reg-sidebar">
        <h2>MARAKAME</h2>
        <p>GESTIÓN CLÍNICA</p>
        <ul>
          <li onClick={() => navigate("/")}><IcoGrid />Inicio</li>
          <li onClick={() => navigate("/admisiones")}><IcoHome />Admisiones</li>
          <li className="active"><IcoUser />Agregar Paciente</li>
          <li onClick={() => navigate("/historial")}><IcoFile />Historial clínico</li>
          <li onClick={() => navigate("/estudio")}><IcoMoney />Estudio Socioeconómico</li>
          <li onClick={() => navigate("/citas")}><IcoCal />Agenda de Citas</li>
          <li onClick={() => navigate("/validacion")}><IcoShield />Validación de Ingreso</li>
          <li onClick={() => navigate("/preingreso")}><IcoDoc />Preingreso</li>
          <li onClick={() => navigate("/expedientes")}><IcoFolder />Expedientes</li>
        </ul>
      </aside>

      {/* MAIN */}
      <main className="main">

        {/* TOPBAR - sticky */}
        <div className="topbar">
          <h2>{editId ? "Completar Cuestionario" : "Registro Inicial MARAKAME"}</h2>
          <div className="actions">
            <button className="btn-cancel" onClick={() => navigate(editId ? "/validacion" : "/admisiones")}>Cancelar</button>
            <button className="btn-save" onClick={handleSubmit} disabled={guardando}>
              {guardando ? "Guardando..." : editId ? "Guardar Cuestionario" : "Guardar y Notificar a Médico"}
            </button>
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="content">

          {/* SECCIÓN 1 */}
          <div className="card">
            <h3>SECCIÓN 1: ATENCIÓN Y SEGUIMIENTO</h3>
            <div className="grid-3">
              <input type="datetime-local" value={today} readOnly />
              <input value={usuario?.nombre || "Sin sesión"} readOnly />
              <select value={fuente} onChange={e => setFuente(e.target.value)}>
                <option value="">Fuente de referencia</option>
                <option>Internet</option>
                <option>Expaciente</option>
                <option>Familiar</option>
                <option>Revista</option>
                <option>Anuncio</option>
                <option>Profesional de salud</option>
                <option>Otro</option>
              </select>
            </div>
          </div>

          {/* SECCIÓN 2 */}
          <div className="card">
            <h3>SECCIÓN 2: DATOS DEL SOLICITANTE</h3>
            <div className="grid-2">
              <input placeholder="Nombre completo del solicitante" value={nombreSolicitante} onChange={e => setNombreSolicitante(e.target.value)} />
              <input type="date" placeholder="Fecha de nacimiento del solicitante" value={fechaNacimientoSolicitante} onChange={e => setFechaNacimientoSolicitante(e.target.value)} />
              <select value={generoSolicitante} onChange={e => setGeneroSolicitante(e.target.value)}>
                <option value="">Género del solicitante</option>
                <option>Masculino</option>
                <option>Femenino</option>
                <option>Otro</option>
              </select>
              <select value={parentesco} onChange={e => setParentesco(e.target.value)}>
                <option value="">Parentesco</option>
                <option>Papá</option>
                <option>Mamá</option>
                <option>Espos@</option>
                <option>Hij@</option>
                <option>Tí@</option>
                <option>Sobrin@</option>
                <option>Amigo</option>
                <option>Prim@</option>
                <option>Abuel@</option>
                <option>El mism@</option>
                <option>Otro</option>
              </select>
              <input placeholder="Lugar de procedencia" value={procedencia} onChange={e => setProcedencia(e.target.value)} />
              <input placeholder="Domicilio particular" value={domicilioSolicitante} onChange={e => setDomicilioSolicitante(e.target.value)} />
              <input placeholder="Teléfono" value={telefonoSolicitante} onChange={e => setTelefonoSolicitante(e.target.value)} />
              <input placeholder="Celular" value={celularSolicitante} onChange={e => setCelularSolicitante(e.target.value)} />
              <input placeholder="Ocupación" value={ocupacionSolicitante} onChange={e => setOcupacionSolicitante(e.target.value)} />
            </div>
          </div>

          {/* SECCIÓN 3 */}
          <div className="card">
            <h3>SECCIÓN 3: INFORMACIÓN DEL PACIENTE</h3>
            <div className="grid-3">
              <input placeholder="Nombre(s) del paciente *" value={nombrePaciente} onChange={e => setNombrePaciente(e.target.value)} />
              <input placeholder="Apellidos del paciente" value={apellidoPaciente} onChange={e => setApellidoPaciente(e.target.value)} />
              <input type="date" placeholder="Fecha de nacimiento del paciente" value={fechaNacimientoPaciente} onChange={e => setFechaNacimientoPaciente(e.target.value)} />
              <select value={generoPaciente} onChange={e => setGeneroPaciente(e.target.value)}>
                <option value="">Género del paciente</option>
                <option>Masculino</option>
                <option>Femenino</option>
                <option>No binario</option>
                <option>Prefiero no decir</option>
                <option>Otro</option>
              </select>
              <select value={orientacionSexual} onChange={e => setOrientacionSexual(e.target.value)}>
                <option value="">Orientación sexual</option>
                <option>Heterosexual</option>
                <option>Gay / Lesbiana</option>
                <option>Bisexual</option>
                <option>Pansexual</option>
                <option>Asexual</option>
                <option>Prefiero no decir</option>
                <option>Otro</option>
              </select>
              <input placeholder="Edad" type="number" min="0" value={edad} onChange={e => setEdad(e.target.value)} />
              <select value={estadoCivil} onChange={e => setEstadoCivil(e.target.value)}>
                <option value="">Estado civil</option>
                <option>Soltero</option>
                <option>Casado</option>
                <option>Divorciado</option>
                <option>Viudo</option>
                <option>Unión libre</option>
              </select>
              <input placeholder="Número de hijos" type="number" min="0" value={numHijos} onChange={e => setNumHijos(e.target.value)} />
              <input placeholder="Domicilio" value={domicilioPaciente} onChange={e => setDomicilioPaciente(e.target.value)} />
              <select value={escolaridad} onChange={e => setEscolaridad(e.target.value)}>
                <option value="">Escolaridad</option>
                <option>Sin estudios</option>
                <option>Primaria</option>
                <option>Secundaria</option>
                <option>Preparatoria</option>
                <option>Universidad</option>
                <option>Posgrado</option>
              </select>
              <input placeholder="Lugar de origen" value={lugarOrigen} onChange={e => setLugarOrigen(e.target.value)} />
              <input placeholder="Teléfono" value={telefonoPaciente} onChange={e => setTelefonoPaciente(e.target.value)} />
              <input placeholder="Ocupación" value={ocupacionPaciente} onChange={e => setOcupacionPaciente(e.target.value)} />
              <select value={gruposVulnerables} onChange={e => setGruposVulnerables(e.target.value)}>
                <option value="">¿Pertenece a grupos vulnerables?</option>
                <option>No</option>
                <option>Adulto mayor</option>
                <option>Discapacidad física</option>
                <option>Discapacidad mental</option>
                <option>Migrante</option>
                <option>Indígena</option>
                <option>Comunidad LGBTQ+</option>
                <option>Situación de calle</option>
                <option>Violencia familiar</option>
                <option>Otro</option>
              </select>
            </div>
          </div>

          {/* SECCIÓN 4 */}
          <div className="card">
            <h3>SECCIÓN 4: VALORACIÓN INICIAL</h3>
            <div className="sustancias-container">
              {["Alcohol","Cocaína","Marihuana","Base","Éxtasis","Tabaco","BZD","Inhalantes","TCA","Ludopatía","Ácidos"].map(s => (
                <button
                  key={s}
                  type="button"
                  className={`chip ${sustancias.includes(s) ? "chip-active" : ""}`}
                  onClick={() => toggleSustancia(s)}
                >
                  {s} {sustancias.includes(s) ? "×" : "+"}
                </button>
              ))}
              <input placeholder="Otra sustancia (opcional)" value={otraSustancia} onChange={e => setOtraSustancia(e.target.value)} />
            </div>
            <div className="grid-2">
              <select value={aceptaInternarse} onChange={e => setAceptaInternarse(e.target.value)}>
                <option value="">Acepta internarse</option>
                <option>Sí</option>
                <option>No</option>
                <option>Duda</option>
              </select>
              <select value={requiereIntervencion} onChange={e => setRequiereIntervencion(e.target.value)}>
                <option value="">¿Requiere intervención?</option>
                <option>Sí</option>
                <option>No</option>
              </select>
              <select value={tratamientoPrevio} onChange={e => setTratamientoPrevio(e.target.value)}>
                <option value="">¿Ha estado en tratamiento?</option>
                <option>Sí</option>
                <option>No</option>
              </select>
              <input placeholder="¿Dónde?" value={donde} onChange={e => setDonde(e.target.value)} />
            </div>
            <textarea style={{marginTop: "14px"}} placeholder="Conclusión / Observaciones" value={observacionesValoracion} onChange={e => setObservacionesValoracion(e.target.value)} />
          </div>

          {/* SECCIÓN 5 */}
          <div className="card">
            <h3>SECCIÓN 5: ESTATUS Y PROGRAMACIÓN</h3>
            <div className="grid-3">
              <select value={estado} onChange={e => setEstado(e.target.value)}>
                <option value="">Estado del paciente</option>
                <option value="solicitante">Solicitante</option>
                <option value="espera">En espera</option>
                <option value="En espera de llamada">En espera de llamada</option>
                <option value="En espera de visita">En espera de visita</option>
                <option value="revaloracion">Revaloración</option>
                <option value="paciente">Paciente (en tratamiento)</option>
                <option value="egresado">Egresado</option>
                <option value="rechazado_adm">Rechazado</option>
              </select>
              <input type="datetime-local" value={fechaInternamiento} onChange={e => setFechaInternamiento(e.target.value)} />
              <input placeholder="Médico que valoró" value={medicoValoro} readOnly style={{background:"#f3f4f6", color:"#9ca3af", cursor:"not-allowed"}} />
            </div>
            <textarea style={{marginTop:"14px", background:"#f3f4f6", color:"#9ca3af", cursor:"not-allowed"}} placeholder="Pendiente de valoración médica" value={observacionesMedicas} readOnly />
          </div>

          {/* FOOTER */}
          <div className="footer">
            <button className="btn-cancel" onClick={() => navigate(editId ? "/validacion" : "/admisiones")}>{editId ? "Cancelar" : "Descartar Borrador"}</button>
            <button className="btn-save" onClick={handleSubmit} disabled={guardando}>
              {guardando ? "Guardando..." : editId ? "Guardar Cuestionario" : "Finalizar Registro y Notificar"}
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
