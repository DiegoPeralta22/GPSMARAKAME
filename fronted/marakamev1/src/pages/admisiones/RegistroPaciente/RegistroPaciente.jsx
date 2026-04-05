import { useNavigate } from "react-router-dom";
import "./RegistroPaciente.css";

export default function RegistroPaciente() {

  const navigate = useNavigate();

  return (
    <div className="layout">

      {/* SIDEBAR */}
      <aside className="sidebar">
        <h2>MARAKAME</h2>
        <p>GESTIÓN CLÍNICA</p>

        <ul>
          <li onClick={()=>navigate("/")}>Inicio</li>
          <li>Admisiones</li>
          <li className="active">Agregar Paciente</li>
          <li>Historial clínico</li>
          <li>Estudio Socioeconómico</li>
          <li>Agenda de Citas</li>
          <li>Validación de Ingreso</li>
          <li>Contratos</li>
          <li>Expedientes</li>
        </ul>
      </aside>

      {/* MAIN */}
      <main className="main">

        {/* HEADER */}
        <div className="topbar">
          <h2>Registro Inicial MARAKAME</h2>
          <div className="actions">
            <button className="btn-cancel" onClick={()=>navigate("/")}>Cancelar</button>
            <button className="btn-save">Guardar y Notificar a Médico</button>
          </div>
        </div>

        {/* SECCIÓN 1 */}
        <div className="card">
          <h3>SECCIÓN 1: ATENCIÓN Y SEGUIMIENTO</h3>

          <div className="grid-3">
            <input type="date" />
            <input placeholder="Nombre de quien atiende" />
            <select>
              <option>Fuente de referencia</option>
              <option>Internet</option>
              <option>Recomendación</option>
            </select>
          </div>
        </div>

        {/* SECCIÓN 2 */}
        <div className="card">
          <h3>SECCIÓN 2: DATOS DEL SOLICITANTE</h3>

          <div className="grid-2">
            <input placeholder="Nombre completo del solicitante" />
            <select>
              <option>Parentesco</option>
              <option>Padre</option>
              <option>Madre</option>
            </select>

            <input placeholder="Lugar de procedencia" />
            <input placeholder="Domicilio particular" />

            <input placeholder="Teléfono" />
            <input placeholder="Celular" />

            <input placeholder="Ocupación" />
          </div>
        </div>

        {/* SECCIÓN 3 */}
        <div className="card">
          <h3>SECCIÓN 3: INFORMACIÓN DEL PACIENTE</h3>

          <div className="grid-3">
            <input placeholder="Nombre del paciente" />
            <input placeholder="Edad" />
            <select>
              <option>Estado civil</option>
              <option>Soltero</option>
              <option>Casado</option>
            </select>

            <input placeholder="Número de hijos" />
            <input placeholder="Domicilio" />
            <select>
              <option>Escolaridad</option>
              <option>Primaria</option>
            </select>

            <input placeholder="Lugar de origen" />
            <input placeholder="Teléfono" />
            <input placeholder="Ocupación" />
          </div>
        </div>

        {/* SECCIÓN 4 */}
        <div className="card">
          <h3>SECCIÓN 4: VALORACIÓN INICIAL</h3>

          <div className="grid-2">
            <input placeholder="Drogas que consume" />

            <select>
              <option>Acepta internarse</option>
              <option>Si</option>
              <option>No</option>
            </select>

            <select>
              <option>Requiere intervención</option>
              <option>Si</option>
              <option>No</option>
            </select>

            <select>
              <option>Internamientos previos</option>
              <option>Si</option>
              <option>No</option>
            </select>

            <input placeholder="Posibilidades económicas" />
            <input placeholder="Llamar al paciente" />

            <textarea placeholder="Acuerdos para internamiento"></textarea>
          </div>
        </div>

        {/* SECCIÓN 5 */}
        <div className="card">
          <h3>SECCIÓN 5: ESTATUS Y PROGRAMACIÓN</h3>

          <div className="grid-3">
            <select>
              <option>Estado</option>
              <option>En espera de llamada</option>
              <option>En espera de visita</option>
            </select>

            <input type="datetime-local" />
            <input placeholder="Médico que valoró" />
          </div>

          <textarea placeholder="Observaciones médicas"></textarea>
        </div>

      </main>
    </div>
  );
}