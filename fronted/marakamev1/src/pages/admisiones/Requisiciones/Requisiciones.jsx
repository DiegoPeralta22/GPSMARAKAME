import { useState, useEffect } from "react";

const IcoPlus = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const IcoX    = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const IcoList = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>;
const IcoSend = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;

const UNIDADES = ["Pieza", "Caja", "Paquete", "Litro", "Kilogramo", "Metro", "Rollo", "Par", "Juego", "Otro"];

const ESTADO_CFG = {
  pendiente:  { bg: "#fff7ed", color: "#d97706", label: "Pendiente" },
  aprobada:   { bg: "#e6f4f3", color: "#0b5d5b", label: "Aprobada" },
  rechazada:  { bg: "#fff1f2", color: "#ef4444", label: "Rechazada" },
};

const fmtFecha = (iso) => {
  if (!iso) return "—";
  const d = new Date(String(iso).replace(/Z$/, "").replace(/\+.*/, ""));
  return d.toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtMXN = (n) => Number(n || 0).toLocaleString("es-MX", { style: "currency", currency: "MXN" });

const itemVacio = () => ({ descripcion: "", cantidad: "", unidad: "Pieza", valor_unitario: "" });

export default function Requisiciones() {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "{}");

  const [vista, setVista]           = useState("historial"); // "historial" | "nueva"
  const [requisiciones, setReqs]    = useState([]);
  const [cargando, setCargando]     = useState(true);
  const [enviando, setEnviando]     = useState(false);
  const [detalle, setDetalle]       = useState(null);

  const [observaciones, setObs]     = useState("");
  const [items, setItems]           = useState([itemVacio()]);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    setCargando(true);
    try {
      const r = await fetch("http://localhost:3000/requisiciones?area=Admisiones");
      const d = await r.json();
      setReqs(Array.isArray(d) ? d : []);
    } catch { setReqs([]); }
    finally { setCargando(false); }
  };

  const totalCalc = items.reduce((s, it) => {
    const q = parseFloat(it.cantidad) || 0;
    const v = parseFloat(it.valor_unitario) || 0;
    return s + q * v;
  }, 0);

  const setItem = (i, field, val) =>
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [field]: val } : it));

  const agregarRenglon = () => setItems(prev => [...prev, itemVacio()]);

  const eliminarRenglon = (i) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter((_, idx) => idx !== i));
  };

  const resetForm = () => { setItems([itemVacio()]); setObs(""); };

  const enviar = async () => {
    const validos = items.filter(it => it.descripcion.trim() && parseFloat(it.cantidad) > 0);
    if (validos.length === 0) { alert("Agrega al menos un artículo con descripción y cantidad."); return; }
    setEnviando(true);
    try {
      const res = await fetch("http://localhost:3000/requisiciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario: usuario.id_usuario,
          nombre_solicitante: usuario.nombre || "Admisiones",
          area: "Admisiones",
          observaciones,
          total: totalCalc,
          items: validos,
        }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      alert(`Requisición ${data.folio} enviada correctamente.`);
      resetForm();
      setVista("historial");
      cargar();
    } catch { alert("Error al enviar la requisición. Intenta de nuevo."); }
    finally { setEnviando(false); }
  };

  /* ── DETALLE MODAL ─────────────────────────────── */
  const ModalDetalle = () => {
    if (!detalle) return null;
    const its = (() => { try { return JSON.parse(detalle.items_json || "[]"); } catch { return []; } })();
    const cfg = ESTADO_CFG[detalle.estado] || ESTADO_CFG.pendiente;
    return (
      <>
        <div onClick={() => setDetalle(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 800 }} />
        <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "#fff", borderRadius: 14, boxShadow: "0 20px 60px rgba(0,0,0,0.2)", width: "min(700px,95vw)", maxHeight: "90vh", overflowY: "auto", zIndex: 801, padding: "28px 32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>{detalle.folio}</div>
              <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{fmtFecha(detalle.fecha)} · {detalle.nombre_solicitante}</div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20 }}>{cfg.label}</span>
              <button onClick={() => setDetalle(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af" }}><IcoX /></button>
            </div>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 16 }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["Descripción", "Cantidad", "Unidad", "Valor unitario", "Total"].map(h => (
                  <th key={h} style={{ padding: "8px 10px", textAlign: "left", fontWeight: 600, color: "#374151", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.4px", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {its.map((it, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "8px 10px", color: "#111827" }}>{it.descripcion}</td>
                  <td style={{ padding: "8px 10px", color: "#374151" }}>{it.cantidad}</td>
                  <td style={{ padding: "8px 10px", color: "#374151" }}>{it.unidad}</td>
                  <td style={{ padding: "8px 10px", color: "#374151" }}>{fmtMXN(it.valor_unitario)}</td>
                  <td style={{ padding: "8px 10px", color: "#111827", fontWeight: 600 }}>{fmtMXN((parseFloat(it.cantidad)||0)*(parseFloat(it.valor_unitario)||0))}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={4} style={{ padding: "10px 10px", textAlign: "right", fontWeight: 700, fontSize: 13, color: "#374151" }}>Total:</td>
                <td style={{ padding: "10px 10px", fontWeight: 700, color: "#0b5d5b", fontSize: 14 }}>{fmtMXN(detalle.total)}</td>
              </tr>
            </tfoot>
          </table>

          {detalle.observaciones && (
            <div style={{ background: "#f9fafb", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#374151" }}>
              <span style={{ fontWeight: 600 }}>Observaciones: </span>{detalle.observaciones}
            </div>
          )}
        </div>
      </>
    );
  };

  /* ── HISTORIAL ─────────────────────────────────── */
  const renderHistorial = () => (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#111827" }}>Requisiciones de Compra</h2>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>Solicitudes enviadas por el área de Admisiones</p>
        </div>
        <button onClick={() => { resetForm(); setVista("nueva"); }}
          style={{ display: "flex", alignItems: "center", gap: 7, background: "#0b5d5b", color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
          <IcoPlus /> Nueva solicitud
        </button>
      </div>

      {cargando ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af", fontSize: 14 }}>Cargando...</div>
      ) : requisiciones.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "#9ca3af" }}>
          <IcoList />
          <p style={{ marginTop: 12, fontSize: 14 }}>No hay requisiciones registradas</p>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["Folio", "Fecha", "Solicitante", "Total", "Estado", ""].map(h => (
                  <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.4px", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requisiciones.map(r => {
                const cfg = ESTADO_CFG[r.estado] || ESTADO_CFG.pendiente;
                return (
                  <tr key={r.id_requisicion} style={{ borderBottom: "1px solid #f3f4f6" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                    onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                    <td style={{ padding: "12px 16px", fontWeight: 700, color: "#111827" }}>{r.folio}</td>
                    <td style={{ padding: "12px 16px", color: "#374151" }}>{fmtFecha(r.fecha)}</td>
                    <td style={{ padding: "12px 16px", color: "#374151" }}>{r.nombre_solicitante}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0b5d5b" }}>{fmtMXN(r.total)}</td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 20 }}>{cfg.label}</span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <button onClick={() => setDetalle(r)}
                        style={{ background: "none", border: "1px solid #e5e7eb", borderRadius: 6, padding: "5px 12px", fontSize: 12, color: "#374151", cursor: "pointer", fontWeight: 500 }}>
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  /* ── FORMULARIO NUEVA ──────────────────────────── */
  const renderNueva = () => (
    <div style={{ padding: "28px 32px", maxWidth: 860 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => setVista("historial")}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
          ← Volver
        </button>
        <div style={{ width: 1, height: 18, background: "#e5e7eb" }} />
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827" }}>Nueva Requisición</h2>
      </div>

      {/* Info auto */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24, background: "#f9fafb", borderRadius: 10, padding: 16 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: 4 }}>Solicitante</div>
          <div style={{ fontSize: 14, color: "#111827", fontWeight: 500 }}>{usuario.nombre || "—"}</div>
        </div>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", marginBottom: 4 }}>Área</div>
          <div style={{ fontSize: 14, color: "#111827", fontWeight: 500 }}>Admisiones</div>
        </div>
      </div>

      {/* Tabla de artículos */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 10 }}>Artículos solicitados</div>
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f9fafb" }}>
                {["Descripción del artículo", "Cantidad", "Unidad", "Valor unitario", "Total", ""].map(h => (
                  <th key={h} style={{ padding: "9px 12px", textAlign: "left", fontWeight: 600, color: "#6b7280", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.4px", borderBottom: "1px solid #e5e7eb" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => {
                const subtotal = (parseFloat(it.cantidad) || 0) * (parseFloat(it.valor_unitario) || 0);
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "6px 8px" }}>
                      <input value={it.descripcion} onChange={e => setItem(i, "descripcion", e.target.value)}
                        placeholder="Nombre del artículo"
                        style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 8px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                    </td>
                    <td style={{ padding: "6px 8px", width: 80 }}>
                      <input type="number" min="1" value={it.cantidad} onChange={e => setItem(i, "cantidad", e.target.value)}
                        placeholder="0"
                        style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 8px", fontSize: 13, outline: "none", textAlign: "center", boxSizing: "border-box" }} />
                    </td>
                    <td style={{ padding: "6px 8px", width: 110 }}>
                      <select value={it.unidad} onChange={e => setItem(i, "unidad", e.target.value)}
                        style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 8px", fontSize: 13, outline: "none", background: "#fff" }}>
                        {UNIDADES.map(u => <option key={u}>{u}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: "6px 8px", width: 120 }}>
                      <input type="number" min="0" step="0.01" value={it.valor_unitario} onChange={e => setItem(i, "valor_unitario", e.target.value)}
                        placeholder="$0.00"
                        style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 6, padding: "6px 8px", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                    </td>
                    <td style={{ padding: "6px 12px", width: 100, fontWeight: 600, color: "#0b5d5b", whiteSpace: "nowrap" }}>
                      {fmtMXN(subtotal)}
                    </td>
                    <td style={{ padding: "6px 8px", width: 36 }}>
                      <button onClick={() => eliminarRenglon(i)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", display: "flex", alignItems: "center", padding: 4 }}>
                        <IcoX />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={6} style={{ padding: "8px 12px" }}>
                  <button onClick={agregarRenglon}
                    style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "1px dashed #d1d5db", borderRadius: 6, padding: "6px 14px", fontSize: 12, color: "#6b7280", cursor: "pointer", fontWeight: 500 }}>
                    <IcoPlus /> Agregar artículo
                  </button>
                </td>
              </tr>
              <tr style={{ background: "#f9fafb", borderTop: "1px solid #e5e7eb" }}>
                <td colSpan={4} style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "#374151" }}>Total general:</td>
                <td colSpan={2} style={{ padding: "10px 12px", fontWeight: 700, fontSize: 15, color: "#0b5d5b" }}>{fmtMXN(totalCalc)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Observaciones */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Observaciones / Justificación</label>
        <textarea value={observaciones} onChange={e => setObs(e.target.value)} rows={3}
          placeholder="Motivo de la solicitud, urgencia, etc."
          style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 12px", fontSize: 13, resize: "vertical", outline: "none", boxSizing: "border-box" }} />
      </div>

      {/* Botones */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => setVista("historial")}
          style={{ padding: "10px 20px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 13, color: "#374151", cursor: "pointer", fontWeight: 500 }}>
          Cancelar
        </button>
        <button onClick={enviar} disabled={enviando}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 24px", background: enviando ? "#9ca3af" : "#0b5d5b", color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: enviando ? "not-allowed" : "pointer" }}>
          <IcoSend /> {enviando ? "Enviando..." : "Enviar requisición"}
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc" }}>
      {vista === "historial" ? renderHistorial() : renderNueva()}
      <ModalDetalle />
    </div>
  );
}
