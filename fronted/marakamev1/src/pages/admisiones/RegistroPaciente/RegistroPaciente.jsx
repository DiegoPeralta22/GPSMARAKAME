import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegistroPaciente.css";

export default function RegistroPaciente() {

  const navigate = useNavigate();
  const today = new Date().toISOString().slice(0, 16);
  const usuario = JSON.parse(localStorage.getItem("usuario"));

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

  // SECCIÓN 3 - PACIENTE
  const [nombrePaciente, setNombrePaciente] = useState("");
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

  const handleSustancias = (e) => {
    const seleccionadas = Array.from(e.target.selectedOptions).map(o => o.value);
    setSustancias(seleccionadas);
  };

  const toggleSustancia = (sustancia) => {
  setSustancias(prev =>
    prev.includes(sustancia)
      ? prev.filter(s => s !== sustancia)
      : [...prev, sustancia]
  );
};
  const handleSubmit = async () => {
    try {
      // 1. Crear paciente
      const resPaciente = await fetch("http://localhost:3000/pacientes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombrePaciente.split(" ")[0],
          apellido: nombrePaciente.split(" ").slice(1).join(" "),
          edad,
          estado_civil: estadoCivil,
          direccion: domicilioPaciente,
          escolaridad,
          telefono: telefonoPaciente,
          ocupacion: ocupacionPaciente,
          fecha_nacimiento: null,
          genero: null
        })
      });
      const paciente = await resPaciente.json();
      const id_paciente = paciente.id_paciente;

      // 2. Guardar familiar
      await fetch("http://localhost:3000/familiar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_paciente,
          nombre: nombreSolicitante,
          parentesco,
          telefono: telefonoSolicitante || celularSolicitante,
          direccion: domicilioSolicitante
        })
      });

      // 3. Crear cuestionario
      const resCuestionario = await fetch("http://localhost:3000/cuestionario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_paciente })
      });
      const cuestionario = await resCuestionario.json();
      const id_cuestionario = cuestionario.id_cuestionario;

      // 3. Armar respuestas por id_pregunta
      const todasLasSustancias = otraSustancia
        ? [...sustancias, otraSustancia].join(", ")
        : sustancias.join(", ");

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
        { id_pregunta: 11, respuesta: nombrePaciente },
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
        { id_pregunta: 27, respuesta: fechaInternamiento },
        { id_pregunta: 28, respuesta: medicoValoro },
        { id_pregunta: 29, respuesta: observacionesMedicas },
      ];

      // 4. Guardar respuestas
      const resIngreso = await fetch("http://localhost:3000/ingreso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_cuestionario, respuestas })
      });

      if (resIngreso.ok) {
        alert("Registro guardado correctamente");
        navigate("/admisiones");
      } else {
        alert("Error al guardar el ingreso");
      }

    } catch (error) {
      console.error(error);
      alert("Error en el servidor");
    }
  };

  return (
    <div className="layout">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2>MARAKAME</h2>
        <p>GESTIÓN CLÍNICA</p>
        <ul>
          <li onClick={() => navigate("/")}>Inicio</li>
          <li onClick={() => navigate("/admisiones")}>Admisiones</li>
          <li className="active">Agregar Paciente</li>
          <li onClick={() => navigate("/historial")}>Historial clínico</li>
          <li onClick={() => navigate("/estudio")}>Estudio Socioeconómico</li>
          <li onClick={() => navigate("/citas")}>Agenda de Citas</li>
          <li onClick={() => navigate("/validacion")}>Validación de Ingreso</li>
          <li onClick={() => navigate("/contratos")}>Contratos</li>
          <li onClick={() => navigate("/expedientes")}>Expedientes</li>
        </ul>
      </aside>

      {/* MAIN */}
      <main className="main">

        {/* HEADER */}
        <div className="topbar">
          <h2>Registro Inicial MARAKAME</h2>
          <div className="actions">
            <button className="btn-cancel" onClick={() => navigate("/")}>Cancelar</button>
            <button className="btn-save" onClick={handleSubmit}>Guardar y Notificar a Médico</button>
          </div>
        </div>

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
            <input placeholder="Nombre del paciente" value={nombrePaciente} onChange={e => setNombrePaciente(e.target.value)} />
            <input placeholder="Edad" value={edad} onChange={e => setEdad(e.target.value)} />
            <select value={estadoCivil} onChange={e => setEstadoCivil(e.target.value)}>
              <option value="">Estado civil</option>
              <option>Soltero</option>
              <option>Casado</option>
            </select>
            <input placeholder="Número de hijos" value={numHijos} onChange={e => setNumHijos(e.target.value)} />
            <input placeholder="Domicilio" value={domicilioPaciente} onChange={e => setDomicilioPaciente(e.target.value)} />
            <select value={escolaridad} onChange={e => setEscolaridad(e.target.value)}>
              <option value="">Escolaridad</option>
              <option>Primaria</option>
              <option>Secundaria</option>
              <option>Preparatoria</option>
              <option>Universidad</option>
            </select>
            <input placeholder="Lugar de origen" value={lugarOrigen} onChange={e => setLugarOrigen(e.target.value)} />
            <input placeholder="Teléfono" value={telefonoPaciente} onChange={e => setTelefonoPaciente(e.target.value)} />
            <input placeholder="Ocupación" value={ocupacionPaciente} onChange={e => setOcupacionPaciente(e.target.value)} />
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
          <textarea placeholder="Conclusión / Observaciones" value={observacionesValoracion} onChange={e => setObservacionesValoracion(e.target.value)}></textarea>
        </div>

        {/* SECCIÓN 5 */}
        <div className="card">
          <h3>SECCIÓN 5: ESTATUS Y PROGRAMACIÓN</h3>
          <div className="grid-3">
            <select value={estado} onChange={e => setEstado(e.target.value)}>
              <option value="">Estado</option>
              <option>En espera de llamada</option>
              <option>En espera de visita</option>
            </select>
            <input type="datetime-local" value={fechaInternamiento} onChange={e => setFechaInternamiento(e.target.value)} />
            <input placeholder="Médico que valoró" value={medicoValoro} onChange={e => setMedicoValoro(e.target.value)} />
          </div>
          <textarea placeholder="Observaciones médicas" value={observacionesMedicas} onChange={e => setObservacionesMedicas(e.target.value)}></textarea>
        </div>

        {/* FOOTER */}
        <div className="footer">
          <button className="btn-cancel" onClick={() => navigate("/admisiones")}>Descartar Borrador</button>
          <button className="btn-save" onClick={handleSubmit}>Finalizar Registro y Notificar</button>
        </div>

      </main>
    </div>
  );
}