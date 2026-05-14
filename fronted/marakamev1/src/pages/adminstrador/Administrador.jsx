import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const fmt = (v) => {
  if (!v) return "—";
  return new Date(String(v).replace(/Z$/,"").replace(/\+.*/,""))
    .toLocaleDateString("es-MX", { day:"numeric", month:"short", year:"numeric" });
};
const money = (v) => `$${(parseFloat(v)||0).toLocaleString("es-MX", { minimumFractionDigits:2, maximumFractionDigits:2 })}`;

export default function Administrador() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  // Recibos
  const [recibos, setRecibos]         = useState([]);
  const [cargando, setCargando]       = useState(false);
  const [detalle, setDetalle]         = useState(null);
  const [obsAdmin, setObsAdmin]       = useState("");
  const [procesando, setProcesando]   = useState(false);
  const [historial, setHistorial]     = useState([]);
  const [cargandoH, setCargandoH]     = useState(false);

  // Requisiciones
  const [requisiciones, setRequisiciones]       = useState([]);
  const [cargandoReq, setCargandoReq]           = useState(false);
  const [detalleReq, setDetalleReq]             = useState(null);
  const [respuestaReq, setRespuestaReq]         = useState("");
  const [procesandoReq, setProcesandoReq]       = useState(false);
  const [historialReq, setHistorialReq]         = useState([]);
  const [cargandoHistReq, setCargandoHistReq]   = useState(false);

  const [tab, setTab] = useState("pendientes");
  const [tabReq, setTabReq] = useState("pendientes");

  // Sección activa: 'recibos' | 'requisiciones'
  const [seccion, setSeccion] = useState("recibos");

  useEffect(() => { cargarPendientes(); cargarReqPendientes(); }, []);
  useEffect(() => { if (tab === "historial") cargarHistorial(); }, [tab]);
  useEffect(() => { if (tabReq === "historial") cargarHistorialReq(); }, [tabReq]);

  const cargarPendientes = async () => {
    setCargando(true);
    try {
      const res = await fetch("http://localhost:3000/recibos/pendientes");
      const data = await res.json();
      setRecibos(Array.isArray(data) ? data : []);
    } catch { setRecibos([]); }
    finally { setCargando(false); }
  };

  const cargarHistorial = async () => {
    setCargandoH(true);
    try {
      const res = await fetch("http://localhost:3000/recibos");
      const data = await res.json();
      setHistorial(Array.isArray(data) ? data.filter(r => r.estado && r.estado !== "pendiente") : []);
    } catch { setHistorial([]); }
    finally { setCargandoH(false); }
  };

  const cargarReqPendientes = async () => {
    setCargandoReq(true);
    try {
      const res = await fetch("http://localhost:3000/recibos/requisiciones/pendientes");
      const data = await res.json();
      setRequisiciones(Array.isArray(data) ? data : []);
    } catch { setRequisiciones([]); }
    finally { setCargandoReq(false); }
  };

  const cargarHistorialReq = async () => {
    setCargandoHistReq(true);
    try {
      const res = await fetch("http://localhost:3000/recibos/requisiciones");
      const data = await res.json();
      setHistorialReq(Array.isArray(data) ? data.filter(r => r.estado !== "pendiente") : []);
    } catch { setHistorialReq([]); }
    finally { setCargandoHistReq(false); }
  };

  const aprobar = async () => {
    if (!detalle) return;
    setProcesando(true);
    try {
      const res = await fetch(`http://localhost:3000/recibos/${detalle.id_recibo}/aprobar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario: usuario.id_usuario, observaciones: obsAdmin })
      });
      if (!res.ok) throw new Error("Error del servidor");
      setDetalle(null); setObsAdmin("");
      await cargarPendientes();
      alert("Recibo aprobado. El paciente ha sido admitido y se notificó al área clínica.");
    } catch (e) { alert("Error al aprobar: " + e.message); }
    finally { setProcesando(false); }
  };

  const rechazar = async () => {
    if (!obsAdmin.trim()) { alert("Por favor indique el motivo del rechazo."); return; }
    if (!detalle) return;
    setProcesando(true);
    try {
      const res = await fetch(`http://localhost:3000/recibos/${detalle.id_recibo}/rechazar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario: usuario.id_usuario, observaciones: obsAdmin })
      });
      if (!res.ok) throw new Error("Error del servidor");
      setDetalle(null); setObsAdmin("");
      await cargarPendientes();
      alert("Recibo rechazado.");
    } catch (e) { alert("Error al rechazar: " + e.message); }
    finally { setProcesando(false); }
  };

  const responderRequisicion = async (decision) => {
    if (!detalleReq) return;
    if (decision === 'rechazado' && !respuestaReq.trim()) {
      alert("Por favor indica el motivo del rechazo."); return;
    }
    setProcesandoReq(true);
    try {
      const res = await fetch(`http://localhost:3000/recibos/requisiciones/${detalleReq.id_requisicion}/responder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision, respuesta: respuestaReq, id_usuario: usuario.id_usuario })
      });
      if (!res.ok) throw new Error("Error del servidor");
      setDetalleReq(null); setRespuestaReq("");
      await cargarReqPendientes();
      alert(`Requisición ${decision === 'aprobado' ? 'aprobada' : 'rechazada'} correctamente. Se notificó al jefe médico.`);
    } catch (e) { alert("Error: " + e.message); }
    finally { setProcesandoReq(false); }
  };

  const Row = ({ label, value }) => (
    <div style={{ display:"flex", gap:8, padding:"6px 0", borderBottom:"1px solid #f3f4f6" }}>
      <span style={{ fontSize:11, fontWeight:700, color:"#6b7280", textTransform:"uppercase", minWidth:160, flexShrink:0 }}>{label}</span>
      <span style={{ fontSize:13, color:"#111827" }}>{value || "—"}</span>
    </div>
  );

  const reqPendientes = requisiciones.length;

  return (
    <div style={{ minHeight:"100vh", background:"#f3f4f6", fontFamily:"system-ui,sans-serif" }}>
      {/* Header */}
      <div style={{ background:"#0b5d5b", color:"#fff", padding:"0 32px", display:"flex", alignItems:"center", justifyContent:"space-between", height:64 }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <span style={{ fontSize:20, fontWeight:800, letterSpacing:1 }}>MARAKAME</span>
          <span style={{ fontSize:13, opacity:.7 }}>/ Administración</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <span style={{ fontSize:13, opacity:.8 }}>{usuario.nombre || "Administrador"}</span>
          <button onClick={() => { localStorage.clear(); navigate("/"); }}
            style={{ padding:"6px 16px", background:"rgba(255,255,255,.15)", color:"#fff", border:"none", borderRadius:8, fontSize:12, cursor:"pointer", fontWeight:600 }}>
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Nav secciones */}
      <div style={{ background:"#fff", borderBottom:"1px solid #e5e7eb", padding:"0 32px", display:"flex", gap:4 }}>
        {[
          { id:"recibos", label:"💳 Recibos de Pago" },
          { id:"requisiciones", label:`📋 Requisiciones${reqPendientes > 0 ? ` (${reqPendientes})` : ""}` },
        ].map(s => (
          <button key={s.id} onClick={() => setSeccion(s.id)}
            style={{ padding:"14px 20px", fontSize:13, fontWeight:600, border:"none", background:"none", cursor:"pointer",
              color: seccion === s.id ? "#0b5d5b" : "#6b7280",
              borderBottom: seccion === s.id ? "2px solid #0b5d5b" : "2px solid transparent" }}>
            {s.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto", padding:28 }}>

        {/* ==================== RECIBOS ==================== */}
        {seccion === "recibos" && (
          <>
            <h2 style={{ fontSize:22, fontWeight:800, color:"#111827", margin:"0 0 6px" }}>Recibos de Pago</h2>
            <p style={{ fontSize:13, color:"#6b7280", margin:"0 0 24px" }}>Aprobación de recibos de pago de pacientes</p>

            <div style={{ display:"flex", gap:4, marginBottom:20, borderBottom:"2px solid #e5e7eb" }}>
              {[["pendientes","⏳ Pendientes"+(recibos.length ? ` (${recibos.length})` : "")],["historial","📋 Historial"]].map(([v,l]) => (
                <button key={v} onClick={() => setTab(v)}
                  style={{ padding:"10px 20px", fontSize:13, fontWeight:600, border:"none", background:"none", cursor:"pointer",
                    color: tab===v ? "#0b5d5b" : "#6b7280",
                    borderBottom: tab===v ? "2px solid #0b5d5b" : "2px solid transparent", marginBottom:-2 }}>
                  {l}
                </button>
              ))}
            </div>

            {tab === "pendientes" && (
              cargando ? <div style={{ textAlign:"center", padding:60, color:"#9ca3af" }}>Cargando...</div>
              : recibos.length === 0 ? (
                <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e5e7eb", padding:60, textAlign:"center" }}>
                  <div style={{ fontSize:40, marginBottom:12 }}>✓</div>
                  <div style={{ fontSize:16, fontWeight:700, color:"#0b5d5b" }}>No hay recibos pendientes</div>
                  <div style={{ fontSize:13, color:"#9ca3af", marginTop:6 }}>Todos los recibos han sido procesados</div>
                </div>
              ) : (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(340px,1fr))", gap:16 }}>
                  {recibos.map((r, i) => (
                    <div key={i} style={{ background:"#fff", borderRadius:12, border:"1px solid #e5e7eb", padding:20, boxShadow:"0 1px 4px rgba(0,0,0,.06)" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                        <div>
                          <div style={{ fontSize:10, fontWeight:700, color:"#0b5d5b", textTransform:"uppercase", marginBottom:2 }}>Nº {String(r.id_recibo).padStart(4,"0")}</div>
                          <div style={{ fontSize:16, fontWeight:800, color:"#111827" }}>{r.nombre_paciente_db || r.nombre_paciente_recibo || "—"}</div>
                          <div style={{ fontSize:12, color:"#6b7280" }}>Pagador: {r.nombre_pagador || "—"}</div>
                        </div>
                        <span style={{ fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:20, background:"#fff7ed", color:"#d97706" }}>⏳ Pendiente</span>
                      </div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:12 }}>
                        <div style={{ background:"#f9fafb", borderRadius:8, padding:"8px 12px" }}>
                          <div style={{ fontSize:10, color:"#9ca3af", fontWeight:600, textTransform:"uppercase" }}>Tratamiento</div>
                          <div style={{ fontSize:15, fontWeight:700, color:"#0b5d5b" }}>{money(r.monto_tratamiento)}</div>
                        </div>
                        <div style={{ background:"#f9fafb", borderRadius:8, padding:"8px 12px" }}>
                          <div style={{ fontSize:10, color:"#9ca3af", fontWeight:600, textTransform:"uppercase" }}>Prog. Familiar</div>
                          <div style={{ fontSize:15, fontWeight:700, color:"#0b5d5b" }}>{money(r.monto_familiar)}</div>
                        </div>
                      </div>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14, padding:"8px 12px", background:"#e6f4f3", borderRadius:8 }}>
                        <span style={{ fontSize:12, color:"#0b5d5b", fontWeight:600 }}>Total</span>
                        <span style={{ fontSize:16, fontWeight:800, color:"#0b5d5b" }}>{money(r.total)}</span>
                      </div>
                      <div style={{ fontSize:11, color:"#9ca3af", marginBottom:14 }}>Creado: {fmt(r.fecha)} · Por: {r.nombre_creador || "—"}</div>
                      <button onClick={() => { setDetalle(r); setObsAdmin(""); }}
                        style={{ width:"100%", padding:"10px", background:"#0b5d5b", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer" }}>
                        Ver recibo completo →
                      </button>
                    </div>
                  ))}
                </div>
              )
            )}

            {tab === "historial" && (
              cargandoH ? <div style={{ textAlign:"center", padding:60, color:"#9ca3af" }}>Cargando...</div>
              : historial.length === 0 ? (
                <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e5e7eb", padding:60, textAlign:"center", color:"#9ca3af" }}>Sin historial</div>
              ) : (
                <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e5e7eb", overflow:"hidden" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                    <thead>
                      <tr style={{ background:"#f9fafb" }}>
                        {["Nº","Paciente","Pagador","Total","Estado","Fecha"].map((h,i) => (
                          <th key={i} style={{ padding:"10px 14px", textAlign:"left", fontSize:11, fontWeight:700, color:"#6b7280", textTransform:"uppercase", borderBottom:"1px solid #e5e7eb" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {historial.map((r,i) => {
                        const isAp = r.estado === "aprobado";
                        return (
                          <tr key={i} style={{ borderBottom:"1px solid #f3f4f6" }}>
                            <td style={{ padding:"12px 14px", color:"#9ca3af" }}>{String(r.id_recibo).padStart(4,"0")}</td>
                            <td style={{ padding:"12px 14px", fontWeight:600 }}>{r.nombre_paciente_db || r.nombre_paciente_recibo || "—"}</td>
                            <td style={{ padding:"12px 14px", color:"#6b7280" }}>{r.nombre_pagador || "—"}</td>
                            <td style={{ padding:"12px 14px", fontWeight:700, color:"#0b5d5b" }}>{money(r.total)}</td>
                            <td style={{ padding:"12px 14px" }}>
                              <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:isAp?"#e6f4f3":"#fff1f2", color:isAp?"#0b5d5b":"#ef4444" }}>
                                {isAp ? "✓ Aprobado" : "✗ Rechazado"}
                              </span>
                            </td>
                            <td style={{ padding:"12px 14px", color:"#6b7280" }}>{fmt(r.fecha_validacion)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </>
        )}

        {/* ==================== REQUISICIONES ==================== */}
        {seccion === "requisiciones" && (
          <>
            <h2 style={{ fontSize:22, fontWeight:800, color:"#111827", margin:"0 0 6px" }}>Requisiciones</h2>
            <p style={{ fontSize:13, color:"#6b7280", margin:"0 0 24px" }}>Solicitudes de medicamentos e insumos del área médica</p>

            <div style={{ display:"flex", gap:4, marginBottom:20, borderBottom:"2px solid #e5e7eb" }}>
              {[
                ["pendientes", `⏳ Pendientes${requisiciones.length ? ` (${requisiciones.length})` : ""}`],
                ["historial", "📋 Historial"]
              ].map(([v,l]) => (
                <button key={v} onClick={() => setTabReq(v)}
                  style={{ padding:"10px 20px", fontSize:13, fontWeight:600, border:"none", background:"none", cursor:"pointer",
                    color: tabReq===v ? "#0b5d5b" : "#6b7280",
                    borderBottom: tabReq===v ? "2px solid #0b5d5b" : "2px solid transparent", marginBottom:-2 }}>
                  {l}
                </button>
              ))}
            </div>

            {tabReq === "pendientes" && (
              cargandoReq ? <div style={{ textAlign:"center", padding:60, color:"#9ca3af" }}>Cargando...</div>
              : requisiciones.length === 0 ? (
                <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e5e7eb", padding:60, textAlign:"center" }}>
                  <div style={{ fontSize:40, marginBottom:12 }}>✓</div>
                  <div style={{ fontSize:16, fontWeight:700, color:"#0b5d5b" }}>No hay requisiciones pendientes</div>
                  <div style={{ fontSize:13, color:"#9ca3af", marginTop:6 }}>El área médica no tiene solicitudes pendientes</div>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {requisiciones.map((r, i) => (
                    <div key={i} style={{ background:"#fff", borderRadius:12, border:"1px solid #e5e7eb", padding:20, boxShadow:"0 1px 4px rgba(0,0,0,.06)" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
                        <div>
                          <div style={{ fontSize:10, fontWeight:700, color:"#6b7280", textTransform:"uppercase", marginBottom:4 }}>
                            {r.tipo === "medicamento" ? "💊 Medicamento" : "🩺 Insumo médico"}
                          </div>
                          <div style={{ fontSize:16, fontWeight:800, color:"#111827" }}>{r.descripcion}</div>
                          <div style={{ fontSize:12, color:"#6b7280", marginTop:2 }}>
                            Solicitado por: <strong>{r.nombre_jefe}</strong> · {fmt(r.fecha)}
                          </div>
                        </div>
                        <span style={{ fontSize:10, fontWeight:700, padding:"3px 10px", borderRadius:20, background:"#fff7ed", color:"#d97706", flexShrink:0 }}>⏳ Pendiente</span>
                      </div>

                      <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:12, padding:"10px 14px", background:"#f9fafb", borderRadius:8 }}>
                        <div>
                          <div style={{ fontSize:10, color:"#9ca3af", fontWeight:600, textTransform:"uppercase" }}>Cantidad</div>
                          <div style={{ fontSize:15, fontWeight:700, color:"#111827" }}>{r.cantidad} {r.unidad || ""}</div>
                        </div>
                        {r.nombre_medicamento_ref && (
                          <div>
                            <div style={{ fontSize:10, color:"#9ca3af", fontWeight:600, textTransform:"uppercase" }}>Referencia inventario</div>
                            <div style={{ fontSize:13, fontWeight:600, color:"#0b5d5b" }}>{r.nombre_medicamento_ref}</div>
                          </div>
                        )}
                      </div>

                      {r.motivo && (
                        <div style={{ fontSize:12, color:"#374151", marginBottom:12, padding:"8px 12px", background:"#f0fdf4", borderRadius:6, borderLeft:"3px solid #0b5d5b" }}>
                          💬 <strong>Justificación:</strong> {r.motivo}
                        </div>
                      )}

                      <div style={{ display:"flex", gap:10 }}>
                        <button onClick={() => { setDetalleReq(r); setRespuestaReq(""); }}
                          style={{ flex:1, padding:"10px", background:"#0b5d5b", color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer" }}>
                          Responder requisición →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}

            {tabReq === "historial" && (
              cargandoHistReq ? <div style={{ textAlign:"center", padding:60, color:"#9ca3af" }}>Cargando...</div>
              : historialReq.length === 0 ? (
                <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e5e7eb", padding:60, textAlign:"center", color:"#9ca3af" }}>Sin historial de requisiciones</div>
              ) : (
                <div style={{ background:"#fff", borderRadius:12, border:"1px solid #e5e7eb", overflow:"hidden" }}>
                  <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                    <thead>
                      <tr style={{ background:"#f9fafb" }}>
                        {["Tipo","Descripción","Cantidad","Jefe Médico","Estado","Respuesta","Fecha"].map((h,i) => (
                          <th key={i} style={{ padding:"10px 14px", textAlign:"left", fontSize:11, fontWeight:700, color:"#6b7280", textTransform:"uppercase", borderBottom:"1px solid #e5e7eb" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {historialReq.map((r,i) => {
                        const isAp = r.estado === "aprobado";
                        return (
                          <tr key={i} style={{ borderBottom:"1px solid #f3f4f6" }}>
                            <td style={{ padding:"12px 14px" }}>{r.tipo === "medicamento" ? "💊" : "🩺"}</td>
                            <td style={{ padding:"12px 14px", fontWeight:600 }}>{r.descripcion}</td>
                            <td style={{ padding:"12px 14px", color:"#6b7280" }}>{r.cantidad} {r.unidad || ""}</td>
                            <td style={{ padding:"12px 14px", color:"#6b7280" }}>{r.nombre_jefe}</td>
                            <td style={{ padding:"12px 14px" }}>
                              <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, background:isAp?"#e6f4f3":"#fff1f2", color:isAp?"#0b5d5b":"#ef4444" }}>
                                {isAp ? "✓ Aprobada" : "✗ Rechazada"}
                              </span>
                            </td>
                            <td style={{ padding:"12px 14px", color:"#6b7280", fontSize:12 }}>{r.respuesta || "—"}</td>
                            <td style={{ padding:"12px 14px", color:"#6b7280" }}>{fmt(r.fecha_respuesta)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </>
        )}
      </div>

      {/* Modal detalle recibo */}
      {detalle && (
        <>
          <div onClick={() => setDetalle(null)} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:900 }} />
          <div style={{ position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:"min(700px,95vw)",maxHeight:"90vh",overflowY:"auto",background:"#fff",borderRadius:14,zIndex:901,padding:28 }}>
            <div style={{ textAlign:"center", marginBottom:20, paddingBottom:16, borderBottom:"2px solid #0b5d5b" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div style={{ textAlign:"left" }}>
                  <div style={{ fontSize:18, fontWeight:800, color:"#0b5d5b" }}>INSTITUTO MARAKAME</div>
                  <div style={{ fontSize:11, color:"#6b7280" }}>R.F.C. MAR-080325-RRA</div>
                  <div style={{ fontSize:11, color:"#6b7280" }}>Carretera Presa Aguamilpa Km 7 No. 10</div>
                  <div style={{ fontSize:11, color:"#6b7280" }}>Tel: 211 81 86 y 219 72 63 Tepic, Nayarit</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ border:"2px solid #0b5d5b", borderRadius:6, padding:"6px 16px" }}>
                    <div style={{ fontSize:10, fontWeight:700, color:"#0b5d5b" }}>RECIBO</div>
                    <div style={{ fontSize:18, fontWeight:800, color:"#0b5d5b" }}>Nº {String(detalle.id_recibo).padStart(4,"0")}</div>
                  </div>
                </div>
              </div>
            </div>

            <Row label="1. Nombre (pagador)" value={detalle.nombre_pagador} />
            <Row label="2. Fecha de pago" value={fmt(detalle.fecha_pago || detalle.fecha)} />
            <Row label="3. Domicilio" value={detalle.domicilio} />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
              <Row label="4. C.P." value={detalle.cp} />
              <Row label="5. RFC" value={detalle.rfc} />
              <Row label="6. Teléfono" value={detalle.telefono} />
            </div>
            <Row label="7. Nombre del paciente" value={detalle.nombre_paciente_db || detalle.nombre_paciente_recibo} />
            <Row label="8. Clave del paciente" value={detalle.clave_paciente} />
            <Row label="9. Concepto" value={detalle.concepto} />

            <div style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:8, padding:14, margin:"12px 0" }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#6b7280", textTransform:"uppercase", marginBottom:10 }}>10. Pagos</div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:8 }}>
                <div><span style={{ fontSize:12, color:"#6b7280" }}>Tratamiento: </span><span style={{ fontWeight:700 }}>{money(detalle.monto_tratamiento)}</span></div>
                <div><span style={{ fontSize:12, color:"#6b7280" }}>Prog. Familiar: </span><span style={{ fontWeight:700 }}>{money(detalle.monto_familiar)}</span></div>
              </div>
              <Row label="11. Cantidad con letra" value={detalle.cantidad_letra} />
              <div style={{ marginTop:8, textAlign:"right", fontSize:16, fontWeight:800, color:"#0b5d5b" }}>
                12. Total: {money(detalle.total)}
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <Row label="13. Responsable Admisiones" value={detalle.firma_responsable} />
              <Row label="14. Aval (pagador)" value={detalle.firma_aval} />
            </div>

            <div style={{ marginTop:20, paddingTop:16, borderTop:"1px solid #e5e7eb" }}>
              <label style={{ fontSize:12, fontWeight:700, color:"#374151", display:"block", marginBottom:6 }}>
                Observaciones de Administración {detalle.estado !== "pendiente" ? "(leídas)" : "(requeridas para rechazar)"}
              </label>
              <textarea
                value={obsAdmin}
                onChange={e => setObsAdmin(e.target.value)}
                rows={3}
                placeholder="Observaciones o motivo de rechazo..."
                style={{ width:"100%", padding:"8px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, boxSizing:"border-box", resize:"vertical", fontFamily:"inherit" }}
              />
            </div>

            <div style={{ display:"flex", gap:10, marginTop:16 }}>
              <button onClick={() => setDetalle(null)} style={{ flex:1, padding:12, background:"#f3f4f6", color:"#374151", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer" }}>Cerrar</button>
              <button onClick={rechazar} disabled={procesando} style={{ flex:1, padding:12, background:"#fff1f2", color:"#ef4444", border:"1px solid #ef4444", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer" }}>
                {procesando ? "..." : "✗ Rechazar"}
              </button>
              <button onClick={aprobar} disabled={procesando} style={{ flex:2, padding:12, background:"#0b5d5b", color:"#fff", border:"none", borderRadius:8, fontSize:14, fontWeight:700, cursor:"pointer" }}>
                {procesando ? "Procesando..." : "✓ Aprobar ingreso"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal responder requisición */}
      {detalleReq && (
        <>
          <div onClick={() => setDetalleReq(null)} style={{ position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:900 }} />
          <div style={{ position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:"min(560px,95vw)",maxHeight:"90vh",overflowY:"auto",background:"#fff",borderRadius:14,zIndex:901,padding:28 }}>
            <div style={{ fontSize:18, fontWeight:800, color:"#111827", marginBottom:16 }}>📋 Responder Requisición</div>

            <div style={{ background:"#f9fafb", border:"1px solid #e5e7eb", borderRadius:10, padding:16, marginBottom:16 }}>
              <div style={{ fontSize:10, color:"#6b7280", fontWeight:700, textTransform:"uppercase", marginBottom:4 }}>
                {detalleReq.tipo === "medicamento" ? "💊 Medicamento" : "🩺 Insumo"}
              </div>
              <div style={{ fontSize:16, fontWeight:700, color:"#111827", marginBottom:4 }}>{detalleReq.descripcion}</div>
              <div style={{ fontSize:13, color:"#6b7280" }}>Cantidad: <strong>{detalleReq.cantidad} {detalleReq.unidad || ""}</strong></div>
              <div style={{ fontSize:13, color:"#6b7280" }}>Solicitado por: <strong>{detalleReq.nombre_jefe}</strong></div>
              <div style={{ fontSize:13, color:"#6b7280" }}>Fecha: {fmt(detalleReq.fecha)}</div>
              {detalleReq.motivo && (
                <div style={{ marginTop:8, fontSize:12, color:"#374151", padding:"8px 10px", background:"#e6f4f3", borderRadius:6 }}>
                  💬 {detalleReq.motivo}
                </div>
              )}
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:12, fontWeight:700, color:"#374151", display:"block", marginBottom:6 }}>
                Comentario / Respuesta <span style={{ color:"#ef4444" }}>(requerido para rechazar)</span>
              </label>
              <textarea
                value={respuestaReq}
                onChange={e => setRespuestaReq(e.target.value)}
                rows={3}
                placeholder="Ej: Aprobado, se procederá con la compra. / Rechazado por falta de presupuesto..."
                style={{ width:"100%", padding:"8px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, boxSizing:"border-box", resize:"vertical", fontFamily:"inherit" }}
              />
            </div>

            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setDetalleReq(null)} style={{ flex:1, padding:12, background:"#f3f4f6", color:"#374151", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer" }}>Cancelar</button>
              <button onClick={() => responderRequisicion('rechazado')} disabled={procesandoReq}
                style={{ flex:1, padding:12, background:"#fff1f2", color:"#ef4444", border:"1px solid #ef4444", borderRadius:8, fontSize:13, fontWeight:700, cursor:"pointer" }}>
                {procesandoReq ? "..." : "✗ Rechazar"}
              </button>
              <button onClick={() => responderRequisicion('aprobado')} disabled={procesandoReq}
                style={{ flex:2, padding:12, background:"#0b5d5b", color:"#fff", border:"none", borderRadius:8, fontSize:14, fontWeight:700, cursor:"pointer" }}>
                {procesandoReq ? "Procesando..." : "✓ Aprobar"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}