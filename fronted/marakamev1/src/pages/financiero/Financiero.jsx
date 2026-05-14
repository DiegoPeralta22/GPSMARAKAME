import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../admisiones/Admisiones.css";

const IcoGrid   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>;
const IcoHome   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z"/><path d="M9 21V12h6v9"/></svg>;
const IcoCash   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="3"/><path d="M6 12h.01M18 12h.01"/></svg>;
const IcoBell   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;

const fmt = (n) => Number(n || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" });
const fmtFecha = (iso) => {
  if (!iso) return "—";
  const s = String(iso).replace(/Z$/, "").replace(/\+\d{2}:\d{2}$/, "").split(".")[0];
  const [d, t = ""] = s.split("T");
  const [y, m, dd] = d.split("-");
  return `${dd}/${m}/${y}${t ? " " + t.slice(0, 5) : ""}`;
};

export default function Financiero() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const [notifs, setNotifs]         = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const notifNoLeidas = notifs.filter(n => !n.leida).length;

  useEffect(() => {
    if (usuario?.id_usuario) {
      fetch(`http://localhost:3000/clinico/notificaciones/${usuario.id_usuario}`)
        .then(r => r.json()).then(d => setNotifs(Array.isArray(d) ? d.slice(0,20) : [])).catch(() => {});
    }
  }, []);

  const irANotif = (notif) => {
    try { fetch(`http://localhost:3000/clinico/notificaciones/leer/${notif.id_notificacion}`, { method: "POST" }); } catch {}
    setNotifs(prev => prev.map(n => n.id_notificacion === notif.id_notificacion ? { ...n, leida: 1 } : n));
    setShowNotifs(false);
    const tipo = notif.tipo || "";
    const id = notif.id_referencia;
    if (tipo === "ingreso_aprobado" || tipo === "traslado_completado") { navigate(id ? `/expedientes?id=${id}` : "/expedientes"); return; }
    if (id) { navigate(`/validacion?pacienteId=${id}`); return; }
    navigate("/admisiones");
  };

  const [recibos, setRecibos]     = useState([]);
  const [cargando, setCargando]   = useState(false);
  const [filtro, setFiltro]       = useState("pendientes");
  const [busqueda, setBusqueda]   = useState("");
  const [validando, setValidando] = useState(null);
  const [detalle, setDetalle]     = useState(null);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setCargando(true);
    try {
      const res = await fetch("http://localhost:3000/recibos");
      const data = await res.json();
      setRecibos(Array.isArray(data) ? data : []);
    } catch { setRecibos([]); }
    finally { setCargando(false); }
  };

  const validar = async (id_recibo) => {
    setValidando(id_recibo);
    try {
      await fetch(`http://localhost:3000/recibos/${id_recibo}/validar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_usuario_valido: usuario.id_usuario }),
      });
      await cargar();
      if (detalle?.id_recibo === id_recibo) setDetalle(prev => ({ ...prev, validado: 1 }));
    } catch { alert("Error al validar"); }
    finally { setValidando(null); }
  };

  const filtrados = recibos.filter(r => {
    const q = busqueda.trim().toLowerCase();
    if (q && !`${r.nombre_paciente} ${r.nombre_pagador}`.toLowerCase().includes(q)) return false;
    if (filtro === "pendientes") return !r.validado;
    if (filtro === "validados")  return !!r.validado;
    return true;
  });

  const cnt = (f) => recibos.filter(r => f === "pendientes" ? !r.validado : !!r.validado).length;

  const sidebar = (
    <div className="adm-sidebar" onClick={e => e.stopPropagation()}>
      <div className="adm-sidebar-top">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0 }}>MARAKAME</h2>
          <div style={{ position: "relative" }}>
            <div className="adm-topbar-icon" onClick={() => setShowNotifs(s => !s)} style={{ cursor: "pointer", position: "relative" }}>
              <IcoBell />
              {notifNoLeidas > 0 && (
                <span style={{ position: "absolute", top: -4, right: -4, width: 16, height: 16, borderRadius: "50%", background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {notifNoLeidas}
                </span>
              )}
            </div>
            {showNotifs && (
              <>
                <div style={{ position: "fixed", inset: 0, zIndex: 499 }} onClick={() => setShowNotifs(false)} />
                <div style={{ position: "fixed", top: 68, left: 248, width: 360, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", zIndex: 500, overflow: "hidden" }} onClick={e => e.stopPropagation()}>
                  <div style={{ padding: "14px 18px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>Notificaciones</span>
                    {notifs.some(n => !n.leida) && (
                      <button onClick={async () => { try { await fetch(`http://localhost:3000/clinico/notificaciones/leer-todas/${usuario.id_usuario}`, { method: "POST" }); setNotifs(prev => prev.map(n => ({ ...n, leida: 1 }))); } catch {} }} style={{ fontSize: 11, color: "#0b5d5b", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>Marcar todas leídas</button>
                    )}
                  </div>
                  <div style={{ maxHeight: 340, overflowY: "auto" }}>
                    {notifs.length === 0 ? (
                      <div style={{ padding: "32px 18px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Sin notificaciones</div>
                    ) : notifs.map((n, i) => (
                      <div key={i} onClick={() => irANotif(n)} style={{ padding: "12px 18px", borderBottom: "1px solid #f9fafb", cursor: n.id_referencia ? "pointer" : "default", background: n.leida ? "#fff" : "#f0faf9", display: "flex", gap: 12, alignItems: "flex-start" }}
                        onMouseEnter={e => { if (n.id_referencia) e.currentTarget.style.background = "#e6f4f3"; }}
                        onMouseLeave={e => e.currentTarget.style.background = n.leida ? "#fff" : "#f0faf9"}
                      >
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: n.leida ? "#d1d5db" : "#0b5d5b", flexShrink: 0, marginTop: 5 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>{n.mensaje}</div>
                          <div style={{ fontSize: 10, color: "#9ca3af", marginTop: 3 }}>{n.fecha ? new Date(String(n.fecha).replace(/Z$/,'').replace(/\+.*/,'')).toLocaleDateString("es-MX", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" }) : ""}</div>
                          {n.id_referencia && <div style={{ fontSize: 10, color: "#0b5d5b", fontWeight: 600, marginTop: 2 }}>Ver paciente →</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <p className="user">FINANCIERO: {usuario.nombre || "—"}</p>
      </div>
      <nav>
        <ul>
          <li onClick={() => navigate("/")}><IcoGrid />Inicio</li>
          <li onClick={() => navigate("/admisiones")}><IcoHome />Admisiones</li>
          <li className="active"><IcoCash />Recibos de Pago</li>
        </ul>
      </nav>
    </div>
  );

  if (detalle) {
    return (
      <div className="dashboard">
        {sidebar}
        <div className="main" style={{ overflowY: "auto" }}>
          <div className="header">
            <button onClick={() => setDetalle(null)} style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 8, padding: "6px 14px", fontSize: 13, cursor: "pointer", fontWeight: 600, color: "#374151" }}>← Volver</button>
            <h3>Recibo #{String(detalle.id_recibo).padStart(4, "0")}</h3>
          </div>

          <div style={{ padding: "16px 24px" }}>
            <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", padding: 24, maxWidth: 680, margin: "0 auto" }}>
              {/* Encabezado estilo recibo */}
              <div style={{ textAlign: "center", borderBottom: "2px solid #0b5d5b", paddingBottom: 16, marginBottom: 20 }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: "#0b5d5b" }}>INSTITUTO MARAKAME</div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>R.F.C. MAR-080325-RRA</div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>CARRETERA PRESA AGUAMILPA KM 7 NO. 10 COL. VISTAS DE LA CANTERA C.P. 63173</div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>TELÉFONOS: 211 81 86 Y 219 72 63 TEPIC, NAYARIT.</div>
                <div style={{ marginTop: 8, display: "inline-block", border: "2px solid #0b5d5b", padding: "4px 16px", borderRadius: 4 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "#0b5d5b" }}>RECIBO</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: "#0b5d5b" }}>N° {String(detalle.id_recibo).padStart(4, "0")}</div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13, marginBottom: 16 }}>
                <div><span style={{ fontWeight: 700 }}>Nombre: </span>{detalle.nombre_pagador || "—"}</div>
                <div><span style={{ fontWeight: 700 }}>Fecha: </span>{fmtFecha(detalle.fecha)}</div>
                <div style={{ gridColumn: "1/-1" }}><span style={{ fontWeight: 700 }}>Domicilio: </span>{detalle.domicilio || "—"}</div>
                <div><span style={{ fontWeight: 700 }}>C.P.: </span>{detalle.cp || "—"}</div>
                <div><span style={{ fontWeight: 700 }}>R.F.C.: </span>{detalle.rfc || "—"}</div>
                <div><span style={{ fontWeight: 700 }}>Tel.: </span>{detalle.telefono || "—"}</div>
                <div><span style={{ fontWeight: 700 }}>Paciente: </span>{detalle.nombre_paciente || "—"}</div>
                <div><span style={{ fontWeight: 700 }}>Clave: </span>{detalle.clave_paciente || "—"}</div>
              </div>

              <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: 14, marginBottom: 16 }}>
                <div style={{ fontWeight: 700, fontSize: 12, color: "#374151", marginBottom: 6 }}>CONCEPTO:</div>
                <div style={{ fontSize: 13, color: "#111827" }}>{detalle.concepto || "—"}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, fontSize: 13, marginBottom: 8 }}>
                <div><span style={{ fontWeight: 700 }}>Tratamiento: </span>{fmt(detalle.monto_tratamiento)}</div>
                <div><span style={{ fontWeight: 700 }}>Programa Familiar: </span>{fmt(detalle.monto_familiar)}</div>
              </div>
              <div style={{ textAlign: "right", fontSize: 15, fontWeight: 700, color: "#0b5d5b", borderTop: "1px solid #e5e7eb", paddingTop: 10, marginBottom: 8 }}>
                TOTAL: {fmt(detalle.total)}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 20 }}>
                <span style={{ fontWeight: 700 }}>Cantidad con letra: </span>{detalle.cantidad_letra || "—"}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: 180, borderBottom: "1px solid #374151", marginBottom: 4, height: 40 }} />
                  <div style={{ fontSize: 11, fontWeight: 700 }}>NOMBRE Y FIRMA</div>
                  <div style={{ fontSize: 10, color: "#6b7280" }}>RESPONSABLE DE ADMISIONES</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  {detalle.validado ? (
                    <div style={{ background: "#e6f4f3", border: "2px solid #0b5d5b", borderRadius: 8, padding: "8px 20px", color: "#0b5d5b", fontWeight: 700, fontSize: 13 }}>
                      ✓ PAGO VALIDADO<br />
                      <span style={{ fontSize: 11, fontWeight: 400 }}>{fmtFecha(detalle.fecha_validacion)}</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => validar(detalle.id_recibo)}
                      disabled={validando === detalle.id_recibo}
                      style={{ padding: "10px 24px", background: "#0b5d5b", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
                    >
                      {validando === detalle.id_recibo ? "Validando..." : "✓ Validar Pago"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {sidebar}
      <div className="main" style={{ overflowY: "auto" }}>
        <div className="header">
          <h3>Recibos de Pago — Financiero</h3>
          <input
            placeholder="Buscar por paciente o pagador..."
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            style={{ minWidth: 220 }}
          />
        </div>

        <div style={{ padding: "12px 24px 0", display: "flex", gap: 8 }}>
          {[["todos","Todos"], ["pendientes","Pendientes"], ["validados","Validados"]].map(([val, label]) => (
            <button key={val} onClick={() => setFiltro(val)} style={{
              padding: "6px 16px", borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: "pointer",
              background: filtro === val ? "#0b5d5b" : "#fff",
              color: filtro === val ? "#fff" : "#374151",
              border: `1px solid ${filtro === val ? "#0b5d5b" : "#e5e7eb"}`,
            }}>
              {label}{val !== "todos" ? ` (${cnt(val)})` : ` (${recibos.length})`}
            </button>
          ))}
        </div>

        <div style={{ padding: "16px 24px" }}>
          <div style={{ background: "#fff", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  {["N° Recibo", "Fecha", "Paciente", "Pagador", "Total", "Estado", ""].map((h, i) => (
                    <th key={i} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cargando ? (
                  <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>Cargando...</td></tr>
                ) : filtrados.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>
                    {filtro === "pendientes" ? "No hay recibos pendientes de validar" : "Sin resultados"}
                  </td></tr>
                ) : filtrados.map((r, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px 14px", fontWeight: 700, color: "#0b5d5b" }}>#{String(r.id_recibo).padStart(4, "0")}</td>
                    <td style={{ padding: "12px 14px", color: "#6b7280", fontSize: 12 }}>{fmtFecha(r.fecha)}</td>
                    <td style={{ padding: "12px 14px", fontWeight: 600, color: "#111827" }}>{r.nombre_paciente || "—"}</td>
                    <td style={{ padding: "12px 14px", color: "#374151" }}>{r.nombre_pagador || "—"}</td>
                    <td style={{ padding: "12px 14px", fontWeight: 700 }}>{fmt(r.total)}</td>
                    <td style={{ padding: "12px 14px" }}>
                      {r.validado
                        ? <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 10, background: "#e6f4f3", color: "#0b5d5b" }}>✓ Validado</span>
                        : <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 10, background: "#fff7ed", color: "#d97706" }}>⏳ Pendiente</span>}
                    </td>
                    <td style={{ padding: "12px 14px", display: "flex", gap: 8 }}>
                      <button onClick={() => setDetalle(r)} style={{ padding: "5px 12px", background: "#f3f4f6", border: "1px solid #e5e7eb", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer", color: "#374151" }}>
                        Ver
                      </button>
                      {!r.validado && (
                        <button
                          onClick={() => validar(r.id_recibo)}
                          disabled={validando === r.id_recibo}
                          style={{ padding: "5px 12px", background: "#0b5d5b", color: "#fff", border: "none", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                        >
                          {validando === r.id_recibo ? "..." : "Validar"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
