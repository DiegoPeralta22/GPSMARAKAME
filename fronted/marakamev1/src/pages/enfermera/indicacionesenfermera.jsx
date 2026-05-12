import { useState, useEffect } from "react";

const BASE = "http://localhost:3000/medico";

const styles = `
  .ie-wrap { padding: 0; font-family: 'Inter', sans-serif; }
  .ie-title { font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.4px; }
  .ie-subtitle { font-size: 13px; color: #6b7280; margin-top: 2px; margin-bottom: 24px; }
  .ie-filtros { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; align-items: center; }
  .ie-filtro-btn { padding: 6px 14px; border-radius: 20px; border: 1px solid #e5e7eb; background: #fff; font-size: 12px; font-weight: 500; cursor: pointer; font-family: inherit; color: #374151; transition: all 0.15s; }
  .ie-filtro-btn.active { background: #4c1d95; color: #fff; border-color: #4c1d95; }
  .ie-search { padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: inherit; outline: none; width: 220px; }
  .ie-search:focus { border-color: #7c3aed; }
  .ie-card { background: #fff; border-radius: 10px; padding: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e5e7eb; margin-bottom: 12px; overflow: hidden; }
  .ie-card-header { display: flex; align-items: flex-start; justify-content: space-between; padding: 16px 18px 12px; border-bottom: 1px solid #f3f4f6; }
  .ie-pac-nombre { font-size: 15px; font-weight: 700; color: #111827; }
  .ie-pac-info { font-size: 12px; color: #6b7280; margin-top: 2px; }
  .ie-med-list { padding: 12px 18px; }
  .ie-med-item { display: flex; align-items: flex-start; gap: 14px; padding: 12px 0; border-bottom: 1px solid #f9fafb; }
  .ie-med-item:last-child { border-bottom: none; }
  .ie-med-icon { width: 36px; height: 36px; border-radius: 8px; background: #ede9fe; display: flex; align-items: center; justify-content: center; font-size: 16px; flex-shrink: 0; }
  .ie-med-nombre { font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 2px; }
  .ie-med-detalle { font-size: 11px; color: #6b7280; }
  .ie-med-dosis-info { display: flex; align-items: center; gap: 10px; margin-top: 6px; flex-wrap: wrap; }
  .ie-dosis-badge { font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 20px; }
  .ie-dosis-badge.ok { background: #d1fae5; color: #065f46; }
  .ie-dosis-badge.pendiente { background: #fef9c3; color: #92400e; }
  .ie-dosis-badge.bloqueado { background: #fee2e2; color: #dc2626; }
  .ie-dosis-badge.completo { background: #f3f4f6; color: #6b7280; }
  .ie-med-actions { display: flex; flex-direction: column; gap: 6px; align-items: flex-end; flex-shrink: 0; margin-left: auto; }
  .ie-btn-administrar { padding: 8px 16px; border: none; border-radius: 8px; background: #7c3aed; color: #fff; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; white-space: nowrap; transition: all 0.15s; }
  .ie-btn-administrar:hover:not(:disabled) { background: #6d28d9; }
  .ie-btn-administrar:disabled { background: #e5e7eb; color: #9ca3af; cursor: not-allowed; }
  .ie-btn-administrar.bloqueado-ctrl { background: #fee2e2; color: #dc2626; }
  .ie-btn-historial { padding: 6px 12px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; color: #6b7280; font-size: 11px; font-weight: 500; cursor: pointer; font-family: inherit; white-space: nowrap; }
  .ie-btn-historial:hover { border-color: #7c3aed; color: #7c3aed; }
  .ie-tiempo-restante { font-size: 11px; color: #d97706; font-weight: 600; }
  .ie-tiempo-ok { font-size: 11px; color: #059669; font-weight: 600; }
  .ie-progreso-wrap { margin-top: 8px; }
  .ie-progreso-bar { height: 6px; background: #f3f4f6; border-radius: 3px; overflow: hidden; margin-top: 4px; }
  .ie-progreso-fill { height: 100%; background: #7c3aed; border-radius: 3px; transition: width 0.3s; }
  .ie-progreso-label { font-size: 10px; color: #9ca3af; }
  .ie-aviso-ctrl { font-size: 11px; color: #dc2626; background: #fff5f5; border: 1px solid #fecaca; padding: 4px 8px; border-radius: 6px; margin-top: 4px; text-align: center; }
  .ie-empty { text-align: center; padding: 48px; color: #9ca3af; font-size: 14px; }
  .ie-loading { text-align: center; padding: 48px; color: #9ca3af; font-size: 13px; }
  .ie-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 500; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .ie-modal { background: #fff; border-radius: 12px; padding: 24px; width: 480px; max-width: 95vw; max-height: 80vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
  .ie-modal-title { font-size: 15px; font-weight: 600; color: #111827; margin-bottom: 16px; }
  .ie-hist-item { display: flex; justify-content: space-between; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
  .ie-hist-item:last-child { border-bottom: none; }
  .ie-hist-dosis { font-size: 12px; font-weight: 600; color: #7c3aed; }
  .ie-hist-meta { font-size: 11px; color: #9ca3af; margin-top: 2px; }
  .ie-hist-obs { font-size: 11px; color: #6b7280; font-style: italic; margin-top: 2px; }
  .ie-modal-footer { display: flex; justify-content: flex-end; margin-top: 16px; gap: 10px; }
  .ie-btn-cerrar { padding: 8px 20px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-size: 13px; cursor: pointer; font-family: inherit; color: #374151; }
  .ie-confirm-med { background: #f5f3ff; border: 1px solid #ede9fe; border-radius: 8px; padding: 12px 14px; margin-bottom: 16px; }
  .ie-confirm-nombre { font-size: 14px; font-weight: 600; color: #4c1d95; }
  .ie-confirm-detalle { font-size: 12px; color: #6b7280; margin-top: 4px; }
  .ie-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 14px; }
  .ie-label { font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; }
  .ie-textarea { padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: inherit; outline: none; resize: vertical; min-height: 60px; width: 100%; }
  .ie-textarea:focus { border-color: #7c3aed; }
  .ie-btn-confirmar { padding: 9px 20px; border: none; border-radius: 8px; background: #7c3aed; color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; font-family: inherit; }
  .ie-btn-confirmar:disabled { background: #c4b5fd; cursor: not-allowed; }
  .ie-success-banner { background: #d1fae5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 12px 16px; color: #065f46; font-size: 13px; margin-bottom: 16px; font-weight: 500; }
`;

function parseFechaLocal(fechaStr) {
  if (!fechaStr) return null;
  const str = String(fechaStr).replace('T', ' ').split('.')[0];
  const parts = str.split(' ');
  if (parts.length < 2) return null;
  const [fecha, hora] = parts;
  const [y, m, d] = fecha.split('-').map(Number);
  const [hh, mm, ss] = hora.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm, ss || 0);
}

function formatTiempoRestante(minutos) {
  if (!minutos || minutos <= 0) return null;
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h > 0) return `${h}h ${m}min`;
  return `${m} min`;
}

export default function IndicacionesEnfermera({ usuario }) {
  const [indicaciones, setIndicaciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroPaciente, setFiltroPaciente] = useState("todos");
  const [modalHistorial, setModalHistorial] = useState(null);
  const [historialData, setHistorialData] = useState([]);
  const [cargandoHist, setCargandoHist] = useState(false);
  const [modalConfirmar, setModalConfirmar] = useState(null);
  const [obsAdmin, setObsAdmin] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [exito, setExito] = useState(null);

  useEffect(() => {
    cargarIndicaciones();
    const interval = setInterval(cargarIndicaciones, 15000);
    return () => clearInterval(interval);
  }, []);

  const cargarIndicaciones = async () => {
    try {
      setCargando(true);
      const res = await fetch(`${BASE}/indicaciones-enfermera`);
      const data = await res.json();
      setIndicaciones(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  };

  const abrirHistorial = async (ind) => {
    setModalHistorial(ind);
    setCargandoHist(true);
    try {
      const res = await fetch(`${BASE}/administraciones/${ind.id_indicacion_med}`);
      const data = await res.json();
      setHistorialData(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setCargandoHist(false);
    }
  };

  const handleAdministrar = async () => {
    if (!modalConfirmar) return;
    try {
      setGuardando(true);
      const numerosDosis = (modalConfirmar.dosis_administradas || 0) + 1;
      await fetch(`${BASE}/administraciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_indicacion_med: modalConfirmar.id_indicacion_med,
          id_usuario_enfermera: usuario?.id_usuario,
          numero_dosis: numerosDosis,
          observaciones: obsAdmin || null,
        })
      });
      setExito(`✅ Dosis ${numerosDosis} de ${modalConfirmar.nombre_medicamento} registrada correctamente.`);
      setModalConfirmar(null);
      setObsAdmin("");
      await cargarIndicaciones();
      setTimeout(() => setExito(null), 5000);
    } catch (e) {
      console.error(e);
    } finally {
      setGuardando(false);
    }
  };

  const pacientesUnicos = [...new Map(indicaciones.map(i => [i.id_paciente, {
    id: i.id_paciente,
    nombre: `${i.nombre_paciente} ${i.apellido_paciente}`
  }])).values()];

  const indicacionesFiltradas = indicaciones.filter(ind => {
    const matchBusqueda = busqueda === "" ||
      `${ind.nombre_paciente} ${ind.apellido_paciente}`.toLowerCase().includes(busqueda.toLowerCase()) ||
      ind.nombre_medicamento.toLowerCase().includes(busqueda.toLowerCase());
    const matchPaciente = filtroPaciente === "todos" || ind.id_paciente === parseInt(filtroPaciente);
    return matchBusqueda && matchPaciente;
  });

  const gruposPorPaciente = pacientesUnicos
    .filter(p => filtroPaciente === "todos" || p.id === parseInt(filtroPaciente))
    .map(p => ({
      ...p,
      meds: indicacionesFiltradas.filter(i => i.id_paciente === p.id)
    }))
    .filter(g => g.meds.length > 0);

  return (
    <>
      <style>{styles}</style>
      <div className="ie-wrap">
        <h1 className="ie-title">Administración de Medicamentos</h1>
        <p className="ie-subtitle">Indicaciones activas de todos los pacientes — registra cada administración</p>
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <button onClick={cargarIndicaciones} style={{ padding: "7px 16px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit", color: "#374151", display: "flex", alignItems: "center", gap: 6 }}>
            🔄 Actualizar
          </button>
        </div>

        {exito && <div className="ie-success-banner">{exito}</div>}

        <div className="ie-filtros">
          <input
            className="ie-search"
            placeholder="Buscar paciente o medicamento..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
          />
          <button
            className={`ie-filtro-btn ${filtroPaciente === "todos" ? "active" : ""}`}
            onClick={() => setFiltroPaciente("todos")}
          >
            Todos los pacientes
          </button>
          {pacientesUnicos.map(p => (
            <button
              key={p.id}
              className={`ie-filtro-btn ${filtroPaciente === p.id ? "active" : ""}`}
              onClick={() => setFiltroPaciente(p.id)}
            >
              {p.nombre}
            </button>
          ))}
        </div>

        {cargando ? (
          <div className="ie-loading">Cargando indicaciones...</div>
        ) : gruposPorPaciente.length === 0 ? (
          <div className="ie-empty">No hay medicamentos activos pendientes de administración</div>
        ) : (
          gruposPorPaciente.map(grupo => (
            <div className="ie-card" key={grupo.id}>
              <div className="ie-card-header">
                <div>
                  <div className="ie-pac-nombre">👤 {grupo.nombre}</div>
                  <div className="ie-pac-info">
                    Expediente #{String(grupo.meds[0]?.id_expediente || "").padStart(3, "0")} • {grupo.meds[0]?.estado_paciente || "—"}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "#6b7280" }}>
                  {grupo.meds.length} medicamento{grupo.meds.length > 1 ? "s" : ""} activo{grupo.meds.length > 1 ? "s" : ""}
                </div>
              </div>

              <div className="ie-med-list">
                {grupo.meds.map((med, i) => {
                  const dosisAdmin = med.dosis_administradas || 0;
                  const totalDosis = med.total_dosis;
                  const porcentaje = totalDosis ? Math.round((dosisAdmin / totalDosis) * 100) : null;
                  const completo = totalDosis && dosisAdmin >= totalDosis;

                  // Bloqueo por medicamento controlado sin aprobación del jefe
                  // El backend manda aprobado_jefe = 0/false cuando no está aprobado
                  const esControlado = med.requiere_receta === true || med.requiere_receta === 1;
                  const jefAprobo = med.aprobado_jefe === true || med.aprobado_jefe === 1 || Number(med.aprobado_jefe) === 1;
                  const bloqueadoPorControlado = esControlado && !jefAprobo;

                  // Bloqueo por tiempo entre dosis
                  const bloqueadoPorTiempo = !completo && !bloqueadoPorControlado &&
                    Number(med.puede_administrar) !== 1 && med.puede_administrar !== true;

                  const puede = !bloqueadoPorControlado && !bloqueadoPorTiempo && !completo;

                  const restante = formatTiempoRestante(med.minutos_restantes);
                  const proximaDosisLocal = parseFechaLocal(med.proxima_dosis);

                  return (
                    <div className="ie-med-item" key={i}>
                      <div className="ie-med-icon">
                        {bloqueadoPorControlado ? "🔴" : "💊"}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="ie-med-nombre">
                          {med.nombre_medicamento}
                          {esControlado && (
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 20, background: "#fee2e2", color: "#dc2626", marginLeft: 6 }}>
                              ⚠️ Controlado
                            </span>
                          )}
                        </div>
                        <div className="ie-med-detalle">
                          {med.dosis} • Vía {med.via} • Cada {med.frecuencia_horas}h • {med.duracion_dias} día{med.duracion_dias > 1 ? "s" : ""}
                        </div>
                        <div className="ie-med-dosis-info">
                          {completo ? (
                            <span className="ie-dosis-badge completo">✅ Tratamiento completo</span>
                          ) : bloqueadoPorControlado ? (
                            <span className="ie-dosis-badge bloqueado">🔴 Pendiente aprobación del jefe médico</span>
                          ) : (
                            <>
                              <span className={`ie-dosis-badge ${puede ? "ok" : "pendiente"}`}>
                                Dosis {dosisAdmin + 1}{totalDosis ? `/${totalDosis}` : ""}
                              </span>
                              {bloqueadoPorTiempo && restante && (
                                <span className="ie-tiempo-restante">⏱ Próxima en {restante}</span>
                              )}
                              {bloqueadoPorTiempo && proximaDosisLocal && (
                                <span style={{ fontSize: 11, color: "#6b7280" }}>
                                  ({proximaDosisLocal.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })} hrs)
                                </span>
                              )}
                              {puede && dosisAdmin > 0 && <span className="ie-tiempo-ok">✅ Lista para administrar</span>}
                              {puede && dosisAdmin === 0 && <span className="ie-tiempo-ok">🆕 Primera dosis</span>}
                            </>
                          )}
                        </div>
                        {totalDosis && !completo && (
                          <div className="ie-progreso-wrap">
                            <div className="ie-progreso-label">{dosisAdmin} de {totalDosis} dosis administradas ({porcentaje}%)</div>
                            <div className="ie-progreso-bar">
                              <div className="ie-progreso-fill" style={{ width: `${porcentaje}%` }} />
                            </div>
                          </div>
                        )}
                        {med.ultima_administracion && (
                          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                            Última administración: {parseFechaLocal(med.ultima_administracion)?.toLocaleString("es-MX")}
                          </div>
                        )}
                      </div>

                      <div className="ie-med-actions">
                        {!completo && (
                          <>
                            <button
                              className={`ie-btn-administrar${bloqueadoPorControlado ? " bloqueado-ctrl" : ""}`}
                              disabled={!puede}
                              onClick={() => puede && setModalConfirmar(med) && setObsAdmin("")}
                            >
                              {bloqueadoPorControlado
                                ? "🔴 Sin aprobación"
                                : bloqueadoPorTiempo
                                  ? "🔒 Esperar tiempo"
                                  : "💉 Administrar"}
                            </button>
                            {bloqueadoPorControlado && (
                              <div className="ie-aviso-ctrl">
                                Requiere aprobación del jefe médico
                              </div>
                            )}
                          </>
                        )}
                        <button className="ie-btn-historial" onClick={() => abrirHistorial(med)}>
                          📋 Historial
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}

        {/* MODAL CONFIRMAR */}
        {modalConfirmar && (
          <div className="ie-modal-overlay" onClick={() => setModalConfirmar(null)}>
            <div className="ie-modal" onClick={e => e.stopPropagation()}>
              <div className="ie-modal-title">💉 Confirmar Administración</div>
              <div className="ie-confirm-med">
                <div className="ie-confirm-nombre">{modalConfirmar.nombre_medicamento}</div>
                <div className="ie-confirm-detalle">
                  Paciente: {modalConfirmar.nombre_paciente} {modalConfirmar.apellido_paciente}<br />
                  Dosis: {modalConfirmar.dosis} • Vía: {modalConfirmar.via}<br />
                  Dosis número: <strong>{(modalConfirmar.dosis_administradas || 0) + 1}{modalConfirmar.total_dosis ? ` de ${modalConfirmar.total_dosis}` : ""}</strong>
                </div>
              </div>
              <div className="ie-field">
                <label className="ie-label">Observaciones (opcional)</label>
                <textarea
                  className="ie-textarea"
                  placeholder="ej. Paciente toleró bien la dosis..."
                  value={obsAdmin}
                  onChange={e => setObsAdmin(e.target.value)}
                />
              </div>
              <div className="ie-modal-footer">
                <button className="ie-btn-cerrar" onClick={() => setModalConfirmar(null)}>Cancelar</button>
                <button className="ie-btn-confirmar" onClick={handleAdministrar} disabled={guardando}>
                  {guardando ? "Registrando..." : "✅ Confirmar Administración"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL HISTORIAL */}
        {modalHistorial && (
          <div className="ie-modal-overlay" onClick={() => setModalHistorial(null)}>
            <div className="ie-modal" onClick={e => e.stopPropagation()}>
              <div className="ie-modal-title">📋 Historial — {modalHistorial.nombre_medicamento}</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 14 }}>
                Paciente: <strong>{modalHistorial.nombre_paciente} {modalHistorial.apellido_paciente}</strong>
              </div>
              {cargandoHist ? (
                <div style={{ textAlign: "center", padding: 24, color: "#9ca3af" }}>Cargando...</div>
              ) : historialData.length === 0 ? (
                <div style={{ textAlign: "center", padding: 24, color: "#9ca3af" }}>Sin administraciones registradas</div>
              ) : (
                historialData.map((h, i) => (
                  <div className="ie-hist-item" key={i}>
                    <div>
                      <div className="ie-hist-dosis">💊 Dosis #{h.numero_dosis}</div>
                      <div className="ie-hist-meta">👤 {modalHistorial.nombre_paciente} {modalHistorial.apellido_paciente}</div>
                      <div className="ie-hist-meta">💉 {h.nombre_enfermera}</div>
                      {h.observaciones && <div className="ie-hist-obs">💬 {h.observaciones}</div>}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="ie-hist-fecha" style={{ fontSize: 12, color: "#374151" }}>
                        {parseFechaLocal(h.fecha_hora)?.toLocaleDateString("es-MX")}
                      </div>
                      <div className="ie-hist-meta">
                        {parseFechaLocal(h.fecha_hora)?.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })} hrs
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div className="ie-modal-footer">
                <button className="ie-btn-cerrar" onClick={() => setModalHistorial(null)}>Cerrar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}