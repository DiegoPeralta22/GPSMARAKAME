import { useState, useEffect } from "react";
import {
  obtenerEstadisticas,
  obtenerPacientesRecientes,
  obtenerTareasPendientes,
  obtenerNotificaciones,
  marcarNotificacionLeida,
  marcarTodasLeidas,
  obtenerMedicamentos,
  crearMedicamento,
  actualizarControlado,
  registrarMovimiento,
  obtenerMovimientos,
  obtenerPersonal,
  obtenerSolicitudesCambio,
  resolverSolicitud,
  obtenerSolicitudesMedicamento,
  aprobarSolicitudMedicamento,
  verificarIngresoExterno,
} from "../../services/medicoService";
import Pacientes from "../medico/Pacientes";
import Expediente from "../medico/Expediente";
import Valoracion from "../medico/Valoracion";
import Desintoxicacion from "../medico/Desintoxicacion";
import Indicaciones from "../medico/Indicaciones";
import Laboratorio from "../medico/Laboratorio";
import Evolucion from "../medico/Evolucion";
import Diagnostico from "../medico/Diagnostico";
import Actividades from "../medico/Actividades";

const BASE_URL = "http://localhost:3000/medico";

const actualizarMedicamento = async (id_medicamento, datos) => {
  const res = await fetch(`${BASE_URL}/medicamentos/${id_medicamento}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos),
  });
  return res.json();
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  .jefe-app { display: flex; min-height: 100vh; font-family: 'Inter', sans-serif; background: #eef2f7; color: #0f1e3d; }
  .jefe-sidebar { width: 210px; background: #0f2d6b; display: flex; flex-direction: column; position: fixed; left: 0; top: 0; bottom: 0; z-index: 100; }
  .jefe-sidebar-header { padding: 0 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.1); flex-shrink: 0; }
  .jefe-sidebar-header h2 { color: #fff; font-size: 14px; font-weight: 700; }
  .jefe-sidebar-header p { color: rgba(255,255,255,0.5); font-size: 11px; margin-top: 2px; }
  .jefe-nav { flex: 1; padding: 12px 0; overflow-y: auto; min-height: 0; }
  .jefe-nav-section { padding: 8px 16px 4px; font-size: 10px; font-weight: 700; color: rgba(255,255,255,0.3); text-transform: uppercase; letter-spacing: 1px; }
  .jefe-nav-item { display: flex; align-items: center; gap: 10px; padding: 9px 16px; color: rgba(255,255,255,0.6); font-size: 13px; cursor: pointer; transition: all 0.15s; border: none; background: none; width: 100%; text-align: left; }
  .jefe-nav-item:hover { background: rgba(255,255,255,0.08); color: #fff; }
  .jefe-nav-item.active { background: rgba(96,165,250,0.2); color: #93c5fd; border-left: 3px solid #3b82f6; }
  .jefe-nav-item svg { width: 16px; height: 16px; flex-shrink: 0; }
  .jefe-sidebar-footer { padding: 16px; border-top: 1px solid rgba(255,255,255,0.1); flex-shrink: 0; }
  .jefe-sidebar-footer-user { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .jefe-avatar { width: 34px; height: 34px; border-radius: 50%; background: #1d4ed8; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; font-weight: 700; flex-shrink: 0; }
  .jefe-sidebar-footer-info h4 { color: #fff; font-size: 12px; font-weight: 600; }
  .jefe-sidebar-footer-info p { color: rgba(255,255,255,0.4); font-size: 10px; }
  .jefe-logout-btn { display: flex; align-items: center; gap: 8px; padding: 8px 12px; color: rgba(255,255,255,0.5); font-size: 12px; cursor: pointer; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; font-family: 'Inter', sans-serif; width: 100%; transition: all 0.15s; }
  .jefe-logout-btn:hover { background: rgba(239,68,68,0.2); color: #fca5a5; border-color: rgba(239,68,68,0.3); }
  .jefe-logout-btn svg { width: 14px; height: 14px; }
  .jefe-topbar { background: #0f2d6b; position: fixed; top: 0; left: 0; right: 0; height: 36px; display: flex; align-items: center; justify-content: space-between; padding: 0 16px; z-index: 200; }
  .jefe-topbar span { color: rgba(255,255,255,0.5); font-size: 11px; }
  .jefe-main { margin-left: 210px; flex: 1; padding: 28px 32px; margin-top: 36px; }
  .jefe-page-title { font-size: 24px; font-weight: 700; color: #0f1e3d; letter-spacing: -0.4px; }
  .jefe-page-subtitle { font-size: 13px; color: #6b7280; margin-top: 2px; }
  .jefe-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 24px 0; }
  .jefe-stat-card { background: #fff; border-radius: 10px; padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e8eef5; }
  .jefe-stat-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; }
  .jefe-stat-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
  .jefe-stat-icon.blue { background: #dbeafe; color: #1d4ed8; }
  .jefe-stat-icon.green { background: #d1fae5; color: #059669; }
  .jefe-stat-icon.red { background: #fee2e2; color: #dc2626; }
  .jefe-stat-icon.orange { background: #ffedd5; color: #ea580c; }
  .jefe-stat-number { font-size: 28px; font-weight: 700; color: #0f1e3d; letter-spacing: -0.5px; }
  .jefe-stat-label { font-size: 12px; color: #6b7280; margin-top: 2px; }
  .jefe-card { background: #fff; border-radius: 10px; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); border: 1px solid #e8eef5; margin-bottom: 16px; }
  .jefe-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .jefe-card-title { font-size: 15px; font-weight: 600; color: #0f1e3d; }
  .jefe-card-action { font-size: 12px; color: #1d4ed8; cursor: pointer; font-weight: 500; }
  .jefe-card-badge { font-size: 12px; color: #6b7280; }
  .jefe-two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .jefe-patient-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f3f4f6; cursor: pointer; }
  .jefe-patient-item:last-child { border-bottom: none; }
  .jefe-patient-name { font-size: 14px; font-weight: 600; color: #0f1e3d; }
  .jefe-patient-status { font-size: 11px; color: #6b7280; margin-top: 2px; }
  .jefe-patient-days { font-size: 13px; font-weight: 600; color: #0f1e3d; }
  .jefe-patient-exp { font-size: 11px; color: #9ca3af; margin-top: 1px; }
  .jefe-badge { font-size: 10px; font-weight: 600; padding: 2px 7px; border-radius: 20px; }
  .jefe-badge.urgente { background: #fee2e2; color: #dc2626; }
  .jefe-badge.normal { background: #fef9c3; color: #ca8a04; }
  .jefe-task-item { padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
  .jefe-task-item:last-child { border-bottom: none; }
  .jefe-task-name { font-size: 13px; color: #374151; margin-bottom: 5px; font-weight: 500; }
  .jefe-empty { text-align: center; padding: 24px; color: #9ca3af; font-size: 13px; }
  .jefe-loading { text-align: center; padding: 24px; color: #9ca3af; font-size: 13px; }
  .jefe-notif-btn { position: relative; background: none; border: none; cursor: pointer; padding: 4px; display: flex; align-items: center; justify-content: center; }
  .jefe-notif-btn svg { width: 18px; height: 18px; color: rgba(255,255,255,0.6); }
  .jefe-notif-btn:hover svg { color: #fff; }
  .jefe-notif-counter { position: absolute; top: -2px; right: -2px; background: #ef4444; color: #fff; font-size: 9px; font-weight: 700; width: 16px; height: 16px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }
  .jefe-notif-panel { position: fixed; top: 36px; right: 0; width: 360px; height: calc(100vh - 36px); background: #fff; box-shadow: -4px 0 24px rgba(0,0,0,0.12); z-index: 300; display: flex; flex-direction: column; border-left: 1px solid #e5e7eb; }
  .jefe-notif-panel-header { padding: 16px 20px; border-bottom: 1px solid #f3f4f6; display: flex; align-items: center; justify-content: space-between; }
  .jefe-notif-panel-title { font-size: 15px; font-weight: 600; color: #111827; }
  .jefe-notif-panel-actions { display: flex; align-items: center; gap: 10px; }
  .jefe-notif-marcar-todas { font-size: 11px; color: #1d4ed8; cursor: pointer; background: none; border: none; font-family: 'Inter', sans-serif; font-weight: 500; }
  .jefe-notif-close { background: none; border: none; cursor: pointer; color: #9ca3af; font-size: 18px; line-height: 1; }
  .jefe-notif-list { flex: 1; overflow-y: auto; }
  .jefe-notif-item { padding: 14px 20px; border-bottom: 1px solid #f3f4f6; cursor: pointer; display: flex; gap: 12px; align-items: flex-start; }
  .jefe-notif-item:hover { background: #f9fafb; }
  .jefe-notif-item.no-leida { background: #eff6ff; border-left: 3px solid #1d4ed8; }
  .jefe-notif-icon { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 14px; background: #dbeafe; }
  .jefe-notif-msg { font-size: 13px; color: #374151; line-height: 1.4; }
  .jefe-notif-fecha { font-size: 11px; color: #9ca3af; margin-top: 4px; }
  .jefe-notif-dot { width: 8px; height: 8px; border-radius: 50%; background: #1d4ed8; flex-shrink: 0; margin-top: 4px; }
  .jefe-notif-empty { text-align: center; padding: 48px 20px; color: #9ca3af; font-size: 13px; }
  .jefe-notif-overlay { position: fixed; inset: 0; z-index: 250; }
  .jefe-tabs { display: flex; gap: 4px; background: #f3f4f6; padding: 4px; border-radius: 8px; margin-bottom: 20px; width: fit-content; }
  .jefe-tab { padding: 7px 16px; border: none; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; color: #6b7280; background: none; transition: all 0.15s; }
  .jefe-tab.active { background: #fff; color: #0f1e3d; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
  .jefe-med-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px; }
  .jefe-med-card { background: #fff; border: 1px solid #e8eef5; border-radius: 10px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); position: relative; }
  .jefe-med-tipo-badge { position: absolute; top: 12px; right: 12px; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 20px; }
  .jefe-med-tipo-badge.controlado { background: #fee2e2; color: #dc2626; }
  .jefe-med-tipo-badge.no_controlado { background: #d1fae5; color: #059669; }
  .jefe-med-tipo-badge.insumo { background: #dbeafe; color: #1d4ed8; }
  .jefe-med-nombre { font-size: 14px; font-weight: 600; color: #0f1e3d; margin-bottom: 2px; padding-right: 80px; }
  .jefe-med-presentacion { font-size: 11px; color: #6b7280; margin-bottom: 4px; }
  .jefe-med-cat { font-size: 11px; color: #9ca3af; margin-bottom: 12px; }
  .jefe-med-stock { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
  .jefe-med-stock-num { font-size: 24px; font-weight: 700; color: #0f1e3d; }
  .jefe-med-stock-label { font-size: 11px; color: #9ca3af; }
  .jefe-med-stock-badge { font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 20px; }
  .jefe-med-stock-badge.ok { background: #d1fae5; color: #059669; }
  .jefe-med-stock-badge.bajo { background: #fee2e2; color: #dc2626; }
  .jefe-med-exclusivo { font-size: 10px; color: #7c3aed; font-weight: 600; background: #ede9fe; padding: 2px 8px; border-radius: 20px; display: inline-block; margin-bottom: 8px; }
  .jefe-med-actions { display: flex; gap: 5px; margin-top: 10px; flex-wrap: wrap; }
  .jefe-med-btn { flex: 1; padding: 7px 4px; border: none; border-radius: 6px; font-size: 11px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; min-width: 0; }
  .jefe-med-btn.entrada { background: #d1fae5; color: #059669; }
  .jefe-med-btn.entrada:hover { background: #a7f3d0; }
  .jefe-med-btn.salida { background: #fee2e2; color: #dc2626; }
  .jefe-med-btn.salida:hover { background: #fecaca; }
  .jefe-med-btn.historial { background: #dbeafe; color: #1d4ed8; }
  .jefe-med-btn.historial:hover { background: #bfdbfe; }
  .jefe-med-btn.editar { background: #fef9c3; color: #92400e; }
  .jefe-med-btn.editar:hover { background: #fde68a; }
  .jefe-toggle-controlado { display: flex; align-items: center; gap: 6px; font-size: 11px; color: #6b7280; cursor: pointer; margin-top: 8px; }
  .jefe-toggle-controlado input { cursor: pointer; }
  .jefe-solmed-item { background: #fff; border: 1px solid #e8eef5; border-radius: 10px; padding: 16px; margin-bottom: 12px; }
  .jefe-solmed-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
  .jefe-solmed-paciente { font-size: 14px; font-weight: 600; color: #0f1e3d; }
  .jefe-solmed-medico { font-size: 11px; color: #6b7280; margin-top: 2px; }
  .jefe-solmed-estado { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
  .jefe-solmed-estado.pendiente { background: #fef9c3; color: #ca8a04; }
  .jefe-solmed-estado.aprobado { background: #d1fae5; color: #059669; }
  .jefe-solmed-estado.listo_recoger { background: #dbeafe; color: #1d4ed8; }
  .jefe-solmed-estado.entregado { background: #f3f4f6; color: #6b7280; }
  .jefe-solmed-estado.rechazado { background: #fee2e2; color: #dc2626; }
  .jefe-solmed-info { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 14px; margin-bottom: 10px; }
  .jefe-solmed-nombre { font-size: 14px; font-weight: 600; color: #0f1e3d; }
  .jefe-solmed-detalle { font-size: 12px; color: #6b7280; margin-top: 4px; }
  .jefe-solmed-externo { background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 10px 14px; margin-bottom: 10px; }
  .jefe-solmed-externo-title { font-size: 11px; font-weight: 700; color: #ea580c; margin-bottom: 6px; }
  .jefe-solmed-actions { display: flex; gap: 8px; flex-wrap: wrap; }
  .jefe-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); z-index: 500; display: flex; align-items: center; justify-content: center; padding: 20px; }
  .jefe-modal { background: #fff; border-radius: 12px; padding: 24px; width: 540px; max-width: 95vw; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2); }
  .jefe-modal-title { font-size: 16px; font-weight: 600; color: #0f1e3d; margin-bottom: 16px; }
  .jefe-modal-footer { display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px; }
  .jefe-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 14px; }
  .jefe-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .jefe-label { font-size: 12px; color: #374151; font-weight: 500; }
  .jefe-label span { color: #ef4444; }
  .jefe-input { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; width: 100%; }
  .jefe-input:focus { border-color: #1d4ed8; box-shadow: 0 0 0 3px rgba(29,78,216,0.1); }
  .jefe-input.error { border-color: #ef4444; }
  .jefe-select { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; width: 100%; background: #fff; }
  .jefe-select:focus { border-color: #1d4ed8; }
  .jefe-select.error { border-color: #ef4444; }
  .jefe-textarea { padding: 9px 12px; border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: 'Inter', sans-serif; outline: none; resize: vertical; min-height: 70px; width: 100%; }
  .jefe-textarea:focus { border-color: #1d4ed8; }
  .jefe-error-msg { font-size: 11px; color: #ef4444; }
  .jefe-section-divider { font-size: 11px; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; margin: 16px 0 10px; padding-bottom: 6px; border-bottom: 1px solid #f3f4f6; }
  .jefe-switch-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 14px; }
  .jefe-switch-label { font-size: 13px; font-weight: 500; color: #374151; }
  .jefe-switch-desc { font-size: 11px; color: #9ca3af; margin-top: 2px; }
  .jefe-switch { position: relative; width: 36px; height: 20px; flex-shrink: 0; }
  .jefe-switch input { opacity: 0; width: 0; height: 0; }
  .jefe-switch-slider { position: absolute; cursor: pointer; inset: 0; background: #d1d5db; border-radius: 20px; transition: 0.2s; }
  .jefe-switch-slider:before { content: ''; position: absolute; width: 14px; height: 14px; left: 3px; bottom: 3px; background: white; border-radius: 50%; transition: 0.2s; }
  input:checked + .jefe-switch-slider { background: #dc2626; }
  input:checked + .jefe-switch-slider:before { transform: translateX(16px); }
  .jefe-btn-cancel { padding: 9px 20px; border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; color: #374151; }
  .jefe-btn-save { padding: 9px 20px; border: none; border-radius: 8px; background: #1d4ed8; color: #fff; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; }
  .jefe-btn-save:hover { background: #1e40af; }
  .jefe-btn-save:disabled { background: #93c5fd; cursor: not-allowed; }
  .jefe-btn-primary { padding: 10px 20px; border: none; border-radius: 8px; background: #1d4ed8; color: #fff; font-size: 13px; font-weight: 500; cursor: pointer; font-family: 'Inter', sans-serif; display: flex; align-items: center; gap: 6px; }
  .jefe-btn-primary:hover { background: #1e40af; }
  .jefe-btn-aprobar { padding: 7px 16px; border: none; border-radius: 6px; background: #d1fae5; color: #059669; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; }
  .jefe-btn-aprobar:hover { background: #a7f3d0; }
  .jefe-btn-rechazar { padding: 7px 16px; border: none; border-radius: 6px; background: #fee2e2; color: #dc2626; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; }
  .jefe-btn-rechazar:hover { background: #fecaca; }
  .jefe-btn-verificar { padding: 7px 16px; border: none; border-radius: 6px; background: #dbeafe; color: #1d4ed8; font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'Inter', sans-serif; }
  .jefe-btn-verificar:hover { background: #bfdbfe; }
  .jefe-personal-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .jefe-personal-card { background: #fff; border: 1px solid #e8eef5; border-radius: 10px; padding: 16px; display: flex; align-items: center; gap: 12px; }
  .jefe-personal-avatar { width: 40px; height: 40px; border-radius: 50%; background: #1d4ed8; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 14px; font-weight: 700; flex-shrink: 0; }
  .jefe-personal-avatar.enfermera { background: #7c3aed; }
  .jefe-personal-avatar.nutriologo { background: #059669; }
  .jefe-personal-avatar.jefe { background: #0f2d6b; }
  .jefe-personal-nombre { font-size: 13px; font-weight: 600; color: #0f1e3d; }
  .jefe-personal-correo { font-size: 11px; color: #9ca3af; margin-top: 1px; }
  .jefe-rol-badge { font-size: 10px; font-weight: 600; padding: 2px 8px; border-radius: 20px; margin-top: 4px; display: inline-block; }
  .jefe-rol-badge.medico { background: #dbeafe; color: #1d4ed8; }
  .jefe-rol-badge.enfermera { background: #ede9fe; color: #7c3aed; }
  .jefe-rol-badge.nutriologo { background: #d1fae5; color: #059669; }
  .jefe-rol-badge.jefe_medico { background: #e0e7ff; color: #0f2d6b; }
  .jefe-sol-item { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 10px; padding: 16px; margin-bottom: 12px; }
  .jefe-sol-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
  .jefe-sol-paciente { font-size: 14px; font-weight: 600; color: #0f1e3d; }
  .jefe-sol-tipo { font-size: 11px; font-weight: 600; padding: 3px 10px; border-radius: 20px; }
  .jefe-sol-tipo.edicion { background: #fef9c3; color: #ca8a04; }
  .jefe-sol-tipo.eliminacion { background: #fee2e2; color: #dc2626; }
  .jefe-sol-dx { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 14px; margin-bottom: 10px; }
  .jefe-sol-codigo { font-size: 12px; font-weight: 700; color: #1d4ed8; }
  .jefe-sol-desc { font-size: 13px; color: #374151; }
  .jefe-sol-motivo { font-size: 12px; color: #6b7280; margin-bottom: 10px; }
  .jefe-sol-solicitante { font-size: 11px; color: #9ca3af; margin-bottom: 10px; }
  .jefe-sol-actions { display: flex; gap: 8px; }
  .jefe-mov-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
  .jefe-mov-item:last-child { border-bottom: none; }
  .jefe-mov-tipo { font-size: 12px; font-weight: 600; }
  .jefe-mov-tipo.entrada { color: #059669; }
  .jefe-mov-tipo.salida { color: #dc2626; }
  .jefe-mov-cantidad { font-size: 15px; font-weight: 700; }
  .jefe-mov-cantidad.entrada { color: #059669; }
  .jefe-mov-cantidad.salida { color: #dc2626; }
  .jefe-mov-meta { font-size: 11px; color: #9ca3af; }
  .jefe-success { background: #d1fae5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 12px 16px; color: #059669; font-size: 13px; margin-bottom: 16px; }
`;

const NAV_ITEMS = [
  { section: "ÁREA MÉDICA" },
  { id: "dashboard", label: "Inicio", icon: "chart" },
  { id: "pacientes", label: "Pacientes", icon: "users" },
  { id: "valoracion", label: "Valoración", icon: "heart" },
  { id: "diagnostico", label: "Diagnóstico", icon: "file" },
  { id: "indicaciones", label: "Indicaciones", icon: "pill" },
  { id: "desintoxicacion", label: "Desintoxicación", icon: "drop" },
  { id: "evolucion", label: "Evolución", icon: "activity" },
  { id: "laboratorio", label: "Laboratorio", icon: "flask" },
  { id: "actividades", label: "Actividades", icon: "calendar" },
  { section: "JEFATURA" },
  { id: "medicamentos", label: "Medicamentos", icon: "medicine" },
  { id: "solicitudes-med", label: "Sol. Medicamentos", icon: "clipboard" },
  { id: "requisiciones", label: "Requisiciones", icon: "cart" },
  { id: "personal", label: "Personal", icon: "team" },
  { id: "solicitudes", label: "Solicitudes Dx", icon: "check" },
];

const ICONS = {
  chart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  heart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  file: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
  pill: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.5 20H4a2 2 0 0 1-2-2V5c0-1.1.9-2 2-2h3.93a2 2 0 0 1 1.66.9l.82 1.2a2 2 0 0 0 1.66.9H20a2 2 0 0 1 2 2v2"/><circle cx="18" cy="18" r="4"/><path d="m15.5 15.5 5 5"/></svg>,
  drop: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>,
  activity: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  flask: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 3h6l1 9H8L9 3z"/><path d="M6.5 21a5 5 0 0 0 11 0c0-3-2.5-5.5-5.5-8.5C9 15.5 6.5 18 6.5 21z"/></svg>,
  calendar: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  medicine: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>,
  cart: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>,
  clipboard: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>,
  team: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  check: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>,
  bell: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  logout: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
};

function formatFecha(fecha) {
  if (!fecha) return "—";
  const d = new Date(fecha);
  const ahora = new Date();
  const diff = Math.floor((ahora - d) / 1000 / 60);
  if (diff < 1) return "Ahora mismo";
  if (diff < 60) return `Hace ${diff} min`;
  if (diff < 1440) return `Hace ${Math.floor(diff / 60)}h`;
  return d.toLocaleDateString();
}

// ===== MODAL FORMULARIO (NUEVO Y EDITAR) =====
function ModalFormMed({ med, onClose, onExito, usuario }) {
  const esEdicion = !!med;
  const [form, setForm] = useState({
    tipo: med?.tipo || "no_controlado",
    nombre: med?.nombre || "",
    descripcion: med?.descripcion || "",
    categoria: med?.categoria || "",
    presentacion: med?.presentacion || "",
    concentracion: med?.concentracion || "",
    unidad_minima: med?.unidad_minima || "",
    unidad_empaque: med?.unidad_empaque || "",
    cantidad_por_empaque: med?.cantidad_por_empaque || "",
    stock_minimo: med?.stock_minimo || "5",
    stock_actual: med?.stock_actual || "0",
    es_controlado: !!med?.es_controlado,
    es_externo_familiar: false,
  });
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);

  // Buscador de paciente para medicamento exclusivo del familiar
  const [busquedaPac, setBusquedaPac] = useState(med?.nombre_paciente_exclusivo ? `${med.nombre_paciente_exclusivo} ${med.apellido_paciente_exclusivo || ""}` : "");
  const [resultadosPac, setResultadosPac] = useState([]);
  const [pacienteExclusivo, setPacienteExclusivo] = useState(
    med?.id_paciente_exclusivo ? { id_paciente: med.id_paciente_exclusivo, nombre: med.nombre_paciente_exclusivo, apellido: med.apellido_paciente_exclusivo } : null
  );
  const [buscandoPac, setBuscandoPac] = useState(false);

  useEffect(() => {
    if (!form.es_externo_familiar) { setPacienteExclusivo(null); setBusquedaPac(""); }
  }, [form.es_externo_familiar]);

  useEffect(() => {
    if (busquedaPac.length < 2) { setResultadosPac([]); return; }
    const timer = setTimeout(async () => {
      try {
        setBuscandoPac(true);
        const { obtenerPacientes } = await import("../../services/medicoService");
        const data = await obtenerPacientes("todos", busquedaPac);
        setResultadosPac(data.filter(p => p.id_expediente));
      } catch (e) { console.error(e); }
      finally { setBuscandoPac(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [busquedaPac]);

  const validar = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "Requerido";
    if (!form.unidad_minima) e.unidad_minima = "Requerido";
    if (form.es_externo_familiar && !pacienteExclusivo) e.paciente = "Selecciona el paciente al que pertenece este medicamento";
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) return;
    try {
      setGuardando(true);
      const datos = {
        ...form,
        stock_minimo: parseInt(form.stock_minimo) || 5,
        stock_actual: parseInt(form.stock_actual) || 0,
        cantidad_por_empaque: form.cantidad_por_empaque ? parseInt(form.cantidad_por_empaque) : null,
        es_controlado: form.tipo === "controlado" ? true : form.es_controlado,
        id_paciente_exclusivo: form.es_externo_familiar && pacienteExclusivo ? pacienteExclusivo.id_paciente : null,
        id_usuario: usuario.id_usuario,
      };
      if (esEdicion) {
        await actualizarMedicamento(med.id_medicamento, datos);
        onExito("✅ Producto actualizado correctamente.");
      } else {
        const { crearMedicamento: crear } = await import("../../services/medicoService");
        await crear(datos);
        const msg = form.es_externo_familiar && pacienteExclusivo
          ? `✅ Medicamento registrado exclusivamente para ${pacienteExclusivo.nombre} ${pacienteExclusivo.apellido}.`
          : "✅ Producto registrado correctamente en el inventario.";
        onExito(msg);
      }
      onClose();
    } catch (e) { console.error(e); }
    finally { setGuardando(false); }
  };

  const esMedicamento = form.tipo !== "insumo";

  return (
    <div className="jefe-modal-overlay" onClick={onClose}>
      <div className="jefe-modal" onClick={e => e.stopPropagation()}>
        <div className="jefe-modal-title">{esEdicion ? "✏️ Editar Producto" : "💊 Nuevo Producto en Inventario"}</div>

        <div className="jefe-field">
          <label className="jefe-label">Tipo de Producto <span>*</span></label>
          <select className="jefe-select" value={form.tipo}
            onChange={e => setForm({ ...form, tipo: e.target.value, es_controlado: e.target.value === "controlado" })}>
            <option value="no_controlado">💊 Medicamento No Controlado</option>
            <option value="controlado">⚠️ Medicamento Controlado</option>
            <option value="insumo">🩺 Insumo Médico</option>
          </select>
        </div>

        {esMedicamento && (
          <div className="jefe-switch-row">
            <div>
              <div className="jefe-switch-label">🔒 Requiere Autorización</div>
              <div className="jefe-switch-desc">Medicamentos controlados necesitan aprobación del jefe médico</div>
            </div>
            <label className="jefe-switch">
              <input type="checkbox" checked={form.tipo === "controlado" || form.es_controlado}
                onChange={e => setForm({ ...form, es_controlado: e.target.checked, tipo: e.target.checked ? "controlado" : "no_controlado" })} />
              <span className="jefe-switch-slider"></span>
            </label>
          </div>
        )}

        {/* SWITCH EXCLUSIVO DE PACIENTE — solo en nuevos, no en edición */}
        {!esEdicion && (
          <>
            <div className="jefe-switch-row" style={{ borderColor: form.es_externo_familiar ? "#fed7aa" : "#e5e7eb", background: form.es_externo_familiar ? "#fff7ed" : "#f9fafb" }}>
              <div>
                <div className="jefe-switch-label">🔒 Medicamento Exclusivo del Familiar</div>
                <div className="jefe-switch-desc">Solo este paciente puede disponer de este medicamento</div>
              </div>
              <label className="jefe-switch">
                <input type="checkbox" checked={form.es_externo_familiar}
                  onChange={e => setForm({ ...form, es_externo_familiar: e.target.checked })} />
                <span className="jefe-switch-slider" style={form.es_externo_familiar ? { background: "#ea580c" } : {}}></span>
              </label>
            </div>

            {form.es_externo_familiar && (
              <div className="jefe-field" style={{ marginBottom: 14 }}>
                <label className="jefe-label">Paciente al que pertenece <span>*</span></label>
                {pacienteExclusivo ? (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, padding: "10px 14px" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#92400e" }}>{pacienteExclusivo.nombre} {pacienteExclusivo.apellido}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>Exp. #{String(pacienteExclusivo.id_expediente || "").padStart(3, "0")}</div>
                    </div>
                    <button onClick={() => { setPacienteExclusivo(null); setBusquedaPac(""); }}
                      style={{ background: "none", border: "none", color: "#ea580c", cursor: "pointer", fontSize: 12 }}>Cambiar</button>
                  </div>
                ) : (
                  <div style={{ position: "relative" }}>
                    <input className={`jefe-input ${errores.paciente ? "error" : ""}`}
                      placeholder="Buscar paciente por nombre..."
                      value={busquedaPac}
                      onChange={e => setBusquedaPac(e.target.value)} />
                    {busquedaPac.length >= 2 && (
                      <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 50, maxHeight: 180, overflowY: "auto" }}>
                        {buscandoPac ? <div style={{ padding: "10px 14px", fontSize: 13, color: "#9ca3af" }}>Buscando...</div>
                          : resultadosPac.length === 0 ? <div style={{ padding: "10px 14px", fontSize: 13, color: "#9ca3af" }}>No se encontraron pacientes</div>
                          : resultadosPac.map((p, i) => (
                            <div key={i} onClick={() => { setPacienteExclusivo(p); setBusquedaPac(`${p.nombre} ${p.apellido}`); setResultadosPac([]); }}
                              style={{ padding: "10px 14px", cursor: "pointer", fontSize: 13, borderBottom: "1px solid #f3f4f6" }}
                              onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
                              onMouseLeave={e => e.currentTarget.style.background = ""}>
                              <strong>{p.nombre} {p.apellido}</strong> — {p.edad} años • Exp. #{String(p.id_expediente).padStart(3, "0")}
                            </div>
                          ))}
                      </div>
                    )}
                    {errores.paciente && <span className="jefe-error-msg">{errores.paciente}</span>}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        <div className="jefe-section-divider">Información General</div>

        <div className="jefe-field">
          <label className="jefe-label">Nombre <span>*</span></label>
          <input className={`jefe-input ${errores.nombre ? "error" : ""}`}
            placeholder={esMedicamento ? "ej. Paracetamol, Diazepam" : "ej. Guantes de látex, Gasas"}
            value={form.nombre} onChange={e => { setForm({ ...form, nombre: e.target.value }); setErrores(p => ({ ...p, nombre: undefined })); }} />
          {errores.nombre && <span className="jefe-error-msg">{errores.nombre}</span>}
        </div>

        {esMedicamento && (
          <>
            <div className="jefe-section-divider">Presentación del Medicamento</div>
            <div className="jefe-grid-2">
              <div className="jefe-field" style={{ marginBottom: 0 }}>
                <label className="jefe-label">Presentación</label>
                <select className="jefe-select" value={form.presentacion} onChange={e => setForm({ ...form, presentacion: e.target.value })}>
                  <option value="">Seleccionar...</option>
                  <option value="Cápsula">Cápsula</option>
                  <option value="Tableta">Tableta</option>
                  <option value="Jarabe">Jarabe</option>
                  <option value="Ampolleta">Ampolleta</option>
                  <option value="Solución">Solución</option>
                  <option value="Crema">Crema</option>
                  <option value="Parche">Parche</option>
                  <option value="Supositorio">Supositorio</option>
                  <option value="Polvo">Polvo</option>
                </select>
              </div>
              <div className="jefe-field" style={{ marginBottom: 0 }}>
                <label className="jefe-label">Concentración</label>
                <input className="jefe-input" placeholder="ej. 500mg, 300ml, 10mg/5ml"
                  value={form.concentracion} onChange={e => setForm({ ...form, concentracion: e.target.value })} />
              </div>
            </div>
            <div style={{ marginTop: 14 }} />
          </>
        )}

        <div className="jefe-section-divider">Unidades de Manejo</div>

        <div className="jefe-grid-2">
          <div className="jefe-field" style={{ marginBottom: 0 }}>
            <label className="jefe-label">Unidad Mínima <span>*</span></label>
            <select className={`jefe-select ${errores.unidad_minima ? "error" : ""}`} value={form.unidad_minima}
              onChange={e => { setForm({ ...form, unidad_minima: e.target.value }); setErrores(p => ({ ...p, unidad_minima: undefined })); }}>
              <option value="">Seleccionar...</option>
              {esMedicamento ? (
                <>
                  <option value="cápsula">Cápsula</option>
                  <option value="tableta">Tableta</option>
                  <option value="ampolleta">Ampolleta</option>
                  <option value="ml">ml</option>
                  <option value="mg">mg</option>
                  <option value="frasco">Frasco</option>
                </>
              ) : (
                <>
                  <option value="pieza">Pieza</option>
                  <option value="par">Par</option>
                  <option value="rollo">Rollo</option>
                  <option value="paquete">Paquete</option>
                  <option value="caja">Caja</option>
                </>
              )}
            </select>
            {errores.unidad_minima && <span className="jefe-error-msg">{errores.unidad_minima}</span>}
          </div>
          <div className="jefe-field" style={{ marginBottom: 0 }}>
            <label className="jefe-label">Unidad de Empaque</label>
            <select className="jefe-select" value={form.unidad_empaque} onChange={e => setForm({ ...form, unidad_empaque: e.target.value })}>
              <option value="">Seleccionar...</option>
              <option value="caja">Caja</option>
              <option value="frasco">Frasco</option>
              <option value="botella">Botella</option>
              <option value="paquete">Paquete</option>
              <option value="bolsa">Bolsa</option>
              <option value="ampolleta">Ampolleta</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: 14 }} />

        <div className="jefe-grid-2">
          <div className="jefe-field" style={{ marginBottom: 0 }}>
            <label className="jefe-label">Cantidad por Empaque</label>
            <input className="jefe-input" type="number" min="1"
              placeholder="ej. 30 cápsulas por caja"
              value={form.cantidad_por_empaque} onChange={e => setForm({ ...form, cantidad_por_empaque: e.target.value })} />
          </div>
          <div className="jefe-field" style={{ marginBottom: 0 }}>
            <label className="jefe-label">Stock Mínimo</label>
            <input className="jefe-input" type="number" min="0" placeholder="5"
              value={form.stock_minimo} onChange={e => setForm({ ...form, stock_minimo: e.target.value })} />
          </div>
        </div>

        <div style={{ marginTop: 14 }} />

        {/* STOCK ACTUAL — solo en edición */}
        {esEdicion && (
          <>
            <div className="jefe-section-divider">Corrección de Stock</div>
            <div className="jefe-field">
              <label className="jefe-label">Stock Actual <span style={{ color: "#ea580c", fontSize: 11 }}>— Corrección directa por error o merma</span></label>
              <input className="jefe-input" type="number" min="0"
                value={form.stock_actual} onChange={e => setForm({ ...form, stock_actual: e.target.value })} />
            </div>
          </>
        )}

        <div className="jefe-section-divider">Clasificación</div>

        <div className="jefe-field">
          <label className="jefe-label">Categoría</label>
          <select className="jefe-select" value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
            <option value="">Seleccionar...</option>
            {esMedicamento ? (
              <>
                <option value="Ansiolítico">Ansiolítico</option>
                <option value="Antipsicótico">Antipsicótico</option>
                <option value="Antidepresivo">Antidepresivo</option>
                <option value="Vitamina / Suplemento">Vitamina / Suplemento</option>
                <option value="Analgésico">Analgésico</option>
                <option value="Anticonvulsivo">Anticonvulsivo</option>
                <option value="Gastroprotector">Gastroprotector</option>
                <option value="Antibiótico">Antibiótico</option>
                <option value="Otro">Otro</option>
              </>
            ) : (
              <>
                <option value="Material de curación">Material de curación</option>
                <option value="Protección personal">Protección personal</option>
                <option value="Inyección / Venopunción">Inyección / Venopunción</option>
                <option value="Diagnóstico">Diagnóstico</option>
                <option value="Otro">Otro</option>
              </>
            )}
          </select>
        </div>

        <div className="jefe-field">
          <label className="jefe-label">Descripción</label>
          <textarea className="jefe-textarea" placeholder="Descripción o notas adicionales..."
            value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
        </div>

        <div className="jefe-modal-footer">
          <button className="jefe-btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="jefe-btn-save" onClick={handleGuardar} disabled={guardando}>
            {guardando ? "Guardando..." : esEdicion ? "✏️ Actualizar" : "💾 Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalMovimiento({ med, tipo, onClose, onExito, usuario }) {
  const [cantidad, setCantidad] = useState("");
  const [motivo, setMotivo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const handleGuardar = async () => {
    if (!cantidad || isNaN(cantidad) || Number(cantidad) <= 0) { setError("Ingresa una cantidad válida"); return; }
    if (!motivo.trim()) { setError("El motivo es requerido"); return; }
    try {
      setGuardando(true);
      const res = await registrarMovimiento({ id_medicamento: med.id_medicamento, id_usuario: usuario.id_usuario, tipo, cantidad: parseInt(cantidad), motivo });
      if (res?.error) { setError(res.error); return; }
      onExito(`✅ ${tipo === "entrada" ? "Entrada" : "Salida"} de ${cantidad} ${med.unidad_minima || "unidades"} registrada.`);
      onClose();
    } catch (e) { console.error(e); setError("Error al registrar"); }
    finally { setGuardando(false); }
  };

  return (
    <div className="jefe-modal-overlay" onClick={onClose}>
      <div className="jefe-modal" onClick={e => e.stopPropagation()}>
        <div className="jefe-modal-title">{tipo === "entrada" ? "➕ Registrar Entrada" : "➖ Registrar Salida"} — {med.nombre}</div>
        <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
          <div style={{ fontSize: 11, color: "#9ca3af" }}>STOCK ACTUAL</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#0f1e3d" }}>{med.stock_actual} {med.unidad_minima || "unidades"}</div>
          {med.presentacion && <div style={{ fontSize: 11, color: "#6b7280" }}>{med.presentacion} {med.concentracion}</div>}
        </div>
        <div className="jefe-field">
          <label className="jefe-label">Cantidad *</label>
          <input className="jefe-input" type="number" min="1" placeholder="ej. 30" value={cantidad} onChange={e => { setCantidad(e.target.value); setError(""); }} />
        </div>
        <div className="jefe-field">
          <label className="jefe-label">Motivo *</label>
          <textarea className="jefe-textarea" placeholder={tipo === "entrada" ? "ej. Compra, donación..." : "ej. Dispensado, vencido..."} value={motivo} onChange={e => { setMotivo(e.target.value); setError(""); }} />
        </div>
        {error && <div style={{ fontSize: 12, color: "#ef4444", marginBottom: 10 }}>⚠️ {error}</div>}
        <div className="jefe-modal-footer">
          <button className="jefe-btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="jefe-btn-save" onClick={handleGuardar} disabled={guardando} style={{ background: tipo === "entrada" ? "#059669" : "#dc2626" }}>
            {guardando ? "Guardando..." : tipo === "entrada" ? "➕ Registrar Entrada" : "➖ Registrar Salida"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalHistorial({ med, onClose }) {
  const [movimientos, setMovimientos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    obtenerMovimientos(med.id_medicamento).then(data => setMovimientos(Array.isArray(data) ? data : [])).catch(console.error).finally(() => setCargando(false));
  }, []);

  return (
    <div className="jefe-modal-overlay" onClick={onClose}>
      <div className="jefe-modal" style={{ width: 520 }} onClick={e => e.stopPropagation()}>
        <div className="jefe-modal-title">📋 Historial — {med.nombre}</div>
        {cargando ? <div style={{ textAlign: "center", padding: 24, color: "#9ca3af" }}>Cargando...</div>
          : movimientos.length === 0 ? <div style={{ textAlign: "center", padding: 24, color: "#9ca3af" }}>Sin movimientos registrados</div>
          : movimientos.map((m, i) => (
            <div className="jefe-mov-item" key={i}>
              <div>
                <div className={`jefe-mov-tipo ${m.tipo}`}>{m.tipo === "entrada" ? "⬆️ Entrada" : "⬇️ Salida"}</div>
                <div className="jefe-mov-meta">{m.nombre_usuario} • {m.fecha ? new Date(m.fecha).toLocaleString() : "—"}</div>
                {m.nombre_paciente && <div className="jefe-mov-meta">👤 Paciente: {m.nombre_paciente}</div>}
                {m.motivo && <div className="jefe-mov-meta">💬 {m.motivo}</div>}
              </div>
              <div className={`jefe-mov-cantidad ${m.tipo}`}>{m.tipo === "entrada" ? "+" : "-"}{m.cantidad} {med.unidad_minima || "u"}</div>
            </div>
          ))}
        <div className="jefe-modal-footer"><button className="jefe-btn-cancel" onClick={onClose}>Cerrar</button></div>
      </div>
    </div>
  );
}

function ModalResolver({ solicitud, decision, onClose, onExito, usuario }) {
  const [comentario, setComentario] = useState("");
  const [guardando, setGuardando] = useState(false);

  const handleResolver = async () => {
    try {
      setGuardando(true);
      await resolverSolicitud(solicitud.id_solicitud, { decision, id_usuario_aprobador: usuario.id_usuario, comentario_resolucion: comentario || null });
      onExito(`✅ Solicitud ${decision === "aprobado" ? "aprobada" : "rechazada"} correctamente.`);
      onClose();
    } catch (e) { console.error(e); }
    finally { setGuardando(false); }
  };

  return (
    <div className="jefe-modal-overlay" onClick={onClose}>
      <div className="jefe-modal" onClick={e => e.stopPropagation()}>
        <div className="jefe-modal-title">{decision === "aprobado" ? "✅ Aprobar Solicitud" : "❌ Rechazar Solicitud"}</div>
        <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#1d4ed8" }}>{solicitud.codigo_cie10}</div>
          <div style={{ fontSize: 13, color: "#374151" }}>{solicitud.descripcion_diagnostico}</div>
          <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>Paciente: {solicitud.nombre_paciente} {solicitud.apellido_paciente}</div>
          <div style={{ fontSize: 11, color: "#9ca3af" }}>Solicitado por: {solicitud.nombre_solicitante}</div>
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 6 }}>Motivo: {solicitud.motivo}</div>
        </div>
        <div className="jefe-field">
          <label className="jefe-label">Comentario (opcional)</label>
          <textarea className="jefe-textarea" placeholder="Comentario sobre la decisión..." value={comentario} onChange={e => setComentario(e.target.value)} />
        </div>
        <div className="jefe-modal-footer">
          <button className="jefe-btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="jefe-btn-save" onClick={handleResolver} disabled={guardando} style={{ background: decision === "aprobado" ? "#059669" : "#dc2626" }}>
            {guardando ? "Guardando..." : decision === "aprobado" ? "✅ Aprobar" : "❌ Rechazar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalAprobarSolMed({ solicitud, decision, onClose, onExito, usuario }) {
  const [comentario, setComentario] = useState("");
  const [guardando, setGuardando] = useState(false);

  const handleResolver = async () => {
    try {
      setGuardando(true);
      await aprobarSolicitudMedicamento(solicitud.id_solicitud, { decision, comentario, id_usuario_jefe: usuario.id_usuario });
      onExito(`✅ Solicitud de medicamento ${decision === "aprobado" ? "aprobada" : "rechazada"}.`);
      onClose();
    } catch (e) { console.error(e); }
    finally { setGuardando(false); }
  };

  return (
    <div className="jefe-modal-overlay" onClick={onClose}>
      <div className="jefe-modal" onClick={e => e.stopPropagation()}>
        <div className="jefe-modal-title">{decision === "aprobado" ? "✅ Aprobar Medicamento" : "❌ Rechazar Medicamento"}</div>
        <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#0f1e3d" }}>{solicitud.nombre_medicamento}</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Dosis: {solicitud.dosis || "—"} • Cantidad: {solicitud.cantidad} • Vía: {solicitud.via || "—"}</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Paciente: {solicitud.nombre_paciente} {solicitud.apellido_paciente}</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Médico: {solicitud.nombre_medico}</div>
          {solicitud.es_externo && (
            <div style={{ marginTop: 8, padding: "8px 10px", background: "#fff7ed", borderRadius: 6, fontSize: 11, color: "#ea580c", fontWeight: 600 }}>
              ⚠️ Medicamento EXTERNO — traído por el familiar de: {solicitud.farmacia_lugar || solicitud.procedencia || "—"}
            </div>
          )}
        </div>
        <div className="jefe-field">
          <label className="jefe-label">Comentario (opcional)</label>
          <textarea className="jefe-textarea" placeholder="Instrucciones o comentario..." value={comentario} onChange={e => setComentario(e.target.value)} />
        </div>
        <div className="jefe-modal-footer">
          <button className="jefe-btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="jefe-btn-save" onClick={handleResolver} disabled={guardando} style={{ background: decision === "aprobado" ? "#059669" : "#dc2626" }}>
            {guardando ? "Guardando..." : decision === "aprobado" ? "✅ Aprobar" : "❌ Rechazar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalVerificarExterno({ solicitud, onClose, onExito, usuario }) {
  const [guardando, setGuardando] = useState(false);

  const handleVerificar = async () => {
    try {
      setGuardando(true);
      await verificarIngresoExterno(solicitud.id_solicitud, { id_usuario_jefe: usuario.id_usuario });
      onExito("✅ Medicamento externo verificado e ingresado al almacén. Enfermera notificada.");
      onClose();
    } catch (e) { console.error(e); }
    finally { setGuardando(false); }
  };

  return (
    <div className="jefe-modal-overlay" onClick={onClose}>
      <div className="jefe-modal" onClick={e => e.stopPropagation()}>
        <div className="jefe-modal-title">🔍 Verificar Ingreso de Medicamento Externo</div>
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "12px 14px", marginBottom: 16 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#065f46" }}>{solicitud.nombre_medicamento}</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>Cantidad: {solicitud.cantidad} unidades</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Paciente: {solicitud.nombre_paciente} {solicitud.apellido_paciente}</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Familiar: {solicitud.nombre_familiar || "—"} ({solicitud.parentesco || "—"})</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Procedencia: {solicitud.farmacia_lugar || solicitud.procedencia || "—"}</div>
        </div>
        <p style={{ fontSize: 13, color: "#374151", marginBottom: 16 }}>
          Al verificar, el medicamento se ingresará al almacén como <strong>exclusivo de este paciente</strong> y se notificará a la enfermera para que lo recoja.
        </p>
        <div className="jefe-modal-footer">
          <button className="jefe-btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="jefe-btn-save" onClick={handleVerificar} disabled={guardando} style={{ background: "#059669" }}>
            {guardando ? "Verificando..." : "✅ Verificar e Ingresar al Almacén"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalNuevaRequisicion({ usuario, medicamentos, onClose, onExito }) {
  const [form, setForm] = useState({ tipo: "medicamento", descripcion: "", cantidad: "", unidad: "", motivo: "", id_medicamento: "" });
  const [guardando, setGuardando] = useState(false);
  const [errores, setErrores] = useState({});

  const validar = () => {
    const e = {};
    if (!form.descripcion.trim()) e.descripcion = "Requerido";
    if (!form.cantidad || Number(form.cantidad) <= 0) e.cantidad = "Requerido";
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) return;
    try {
      setGuardando(true);
      await fetch("http://localhost:3000/medico/requisiciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_usuario_jefe: usuario.id_usuario,
          tipo: form.tipo,
          descripcion: form.descripcion,
          cantidad: parseInt(form.cantidad),
          unidad: form.unidad || null,
          motivo: form.motivo || null,
          id_medicamento: form.id_medicamento || null,
        })
      });
      onExito("✅ Requisición enviada a administración correctamente.");
      onClose();
    } catch (e) { console.error(e); }
    finally { setGuardando(false); }
  };

  return (
    <div className="jefe-modal-overlay" onClick={onClose}>
      <div className="jefe-modal" onClick={e => e.stopPropagation()}>
        <div className="jefe-modal-title">📋 Nueva Requisición</div>

        <div className="jefe-field">
          <label className="jefe-label">Tipo <span>*</span></label>
          <select className="jefe-select" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
            <option value="medicamento">💊 Medicamento</option>
            <option value="insumo">🩺 Insumo Médico</option>
          </select>
        </div>

        {form.tipo === "medicamento" && medicamentos.length > 0 && (
          <div className="jefe-field">
            <label className="jefe-label">Medicamento del Inventario (opcional)</label>
            <select className="jefe-select" value={form.id_medicamento} onChange={e => {
              const med = medicamentos.find(m => m.id_medicamento === parseInt(e.target.value));
              setForm({ ...form, id_medicamento: e.target.value, descripcion: med ? med.nombre : form.descripcion, unidad: med ? (med.unidad_minima || "") : form.unidad });
            }}>
              <option value="">Seleccionar del inventario...</option>
              {medicamentos.filter(m => m.tipo !== "insumo").map((m, i) => (
                <option key={i} value={m.id_medicamento}>{m.nombre} — Stock: {m.stock_actual} {m.unidad_minima}</option>
              ))}
            </select>
          </div>
        )}

        <div className="jefe-field">
          <label className="jefe-label">Descripción <span>*</span></label>
          <input className={`jefe-input ${errores.descripcion ? "error" : ""}`}
            placeholder={form.tipo === "medicamento" ? "ej. Paracetamol 500mg tabletas" : "ej. Guantes de látex talla M"}
            value={form.descripcion} onChange={e => { setForm({ ...form, descripcion: e.target.value }); setErrores(p => ({ ...p, descripcion: undefined })); }} />
          {errores.descripcion && <span className="jefe-error-msg">{errores.descripcion}</span>}
        </div>

        <div className="jefe-grid-2">
          <div className="jefe-field" style={{ marginBottom: 0 }}>
            <label className="jefe-label">Cantidad <span>*</span></label>
            <input className={`jefe-input ${errores.cantidad ? "error" : ""}`} type="number" min="1" placeholder="ej. 100"
              value={form.cantidad} onChange={e => { setForm({ ...form, cantidad: e.target.value }); setErrores(p => ({ ...p, cantidad: undefined })); }} />
            {errores.cantidad && <span className="jefe-error-msg">{errores.cantidad}</span>}
          </div>
          <div className="jefe-field" style={{ marginBottom: 0 }}>
            <label className="jefe-label">Unidad</label>
            <input className="jefe-input" placeholder="ej. tabletas, cajas, pares"
              value={form.unidad} onChange={e => setForm({ ...form, unidad: e.target.value })} />
          </div>
        </div>

        <div style={{ marginTop: 14 }} />

        <div className="jefe-field">
          <label className="jefe-label">Motivo / Justificación</label>
          <textarea className="jefe-textarea" placeholder="ej. Stock bajo, alta demanda de pacientes..."
            value={form.motivo} onChange={e => setForm({ ...form, motivo: e.target.value })} />
        </div>

        <div className="jefe-modal-footer">
          <button className="jefe-btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="jefe-btn-save" onClick={handleGuardar} disabled={guardando}>
            {guardando ? "Enviando..." : "📤 Enviar Requisición"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function JefeMedico() {
  const [seccionActiva, setSeccionActiva] = useState("dashboard");
  const [tabMeds, setTabMeds] = useState("todos");
  const [usuario, setUsuario] = useState(null);
  const [estadisticas, setEstadisticas] = useState(null);
  const [pacientesRecientes, setPacientesRecientes] = useState([]);
  const [tareasPendientes, setTareasPendientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [pacienteActivo, setPacienteActivo] = useState(null);
  const [notificaciones, setNotificaciones] = useState([]);
  const [panelAbierto, setPanelAbierto] = useState(false);
  const [medicamentos, setMedicamentos] = useState([]);
  const [cargandoMeds, setCargandoMeds] = useState(false);
  const [modalMov, setModalMov] = useState(null);
  const [modalFormMed, setModalFormMed] = useState(null); // null = cerrado, false = nuevo, obj = editar
  const [modalHistorial, setModalHistorial] = useState(null);
  const [exitoMed, setExitoMed] = useState(null);
  const [personal, setPersonal] = useState([]);
  const [cargandoPersonal, setCargandoPersonal] = useState(false);
  const [solicitudes, setSolicitudes] = useState([]);
  const [cargandoSol, setCargandoSol] = useState(false);
  const [modalResolver, setModalResolver] = useState(null);
  const [exitoSol, setExitoSol] = useState(null);
  const [solicitudesMed, setSolicitudesMed] = useState([]);
  const [cargandoSolMed, setCargandoSolMed] = useState(false);
  const [modalAprobarMed, setModalAprobarMed] = useState(null);
  const [modalVerificarExt, setModalVerificarExt] = useState(null);
  const [exitoSolMed, setExitoSolMed] = useState(null);
  const [requisiciones, setRequisiciones] = useState([]);
  const [cargandoReq, setCargandoReq] = useState(false);
  const [modalNuevaReq, setModalNuevaReq] = useState(false);
  const [exitoReq, setExitoReq] = useState(null);

  const noLeidas = notificaciones.filter(n => !n.leida).length;
  const solMedPendientes = solicitudesMed.filter(s => s.estado === "pendiente").length;

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("usuario") || "{}");
    setUsuario(u);
    cargarDashboard();
    if (u?.id_usuario) cargarNotificaciones(u.id_usuario);
  }, []);

  useEffect(() => {
    if (seccionActiva === "medicamentos") cargarMedicamentos();
    if (seccionActiva === "personal") cargarPersonal();
    if (seccionActiva === "solicitudes") cargarSolicitudes();
    if (seccionActiva === "solicitudes-med") cargarSolicitudesMed();
    if (seccionActiva === "requisiciones") cargarRequisiciones();
  }, [seccionActiva]);

  const cargarDashboard = async () => {
    try {
      setCargando(true);
      const [stats, pacientes, tareas] = await Promise.all([obtenerEstadisticas(), obtenerPacientesRecientes(), obtenerTareasPendientes()]);
      setEstadisticas(stats); setPacientesRecientes(pacientes); setTareasPendientes(tareas);
    } catch (e) { console.error(e); }
    finally { setCargando(false); }
  };

  const cargarNotificaciones = async (id) => {
    try { const data = await obtenerNotificaciones(id); setNotificaciones(Array.isArray(data) ? data : []); } catch (e) { console.error(e); }
  };

  const cargarMedicamentos = async () => {
    try { setCargandoMeds(true); const data = await obtenerMedicamentos(); setMedicamentos(Array.isArray(data) ? data : []); } catch (e) { console.error(e); } finally { setCargandoMeds(false); }
  };

  const cargarPersonal = async () => {
    try { setCargandoPersonal(true); const data = await obtenerPersonal(); setPersonal(Array.isArray(data) ? data : []); } catch (e) { console.error(e); } finally { setCargandoPersonal(false); }
  };

  const cargarSolicitudes = async () => {
    try { setCargandoSol(true); const data = await obtenerSolicitudesCambio(); setSolicitudes(Array.isArray(data) ? data : []); } catch (e) { console.error(e); } finally { setCargandoSol(false); }
  };

  const cargarSolicitudesMed = async () => {
    try { setCargandoSolMed(true); const data = await obtenerSolicitudesMedicamento(); setSolicitudesMed(Array.isArray(data) ? data : []); } catch (e) { console.error(e); } finally { setCargandoSolMed(false); }
  };

  const cargarRequisiciones = async () => {
    try {
      setCargandoReq(true);
      const data = await fetch("http://localhost:3000/medico/requisiciones").then(r => r.json());
      setRequisiciones(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); } finally { setCargandoReq(false); }
  };

  const handleToggleControlado = async (med) => {
    try {
      await actualizarControlado(med.id_medicamento, !med.es_controlado);
      cargarMedicamentos();
    } catch (e) { console.error(e); }
  };

  const handleMarcarLeida = async (notif) => {
    if (notif.leida) return;
    await marcarNotificacionLeida(notif.id_notificacion);
    setNotificaciones(prev => prev.map(n => n.id_notificacion === notif.id_notificacion ? { ...n, leida: 1 } : n));
  };

  const handleMarcarTodas = async () => {
    if (!usuario?.id_usuario) return;
    await marcarTodasLeidas(usuario.id_usuario);
    setNotificaciones(prev => prev.map(n => ({ ...n, leida: 1 })));
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem("usuario");
    window.location.href = "/";
  };

  const iniciales = usuario?.nombre ? usuario.nombre.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "JM";
  const handleNav = (id) => { setSeccionActiva(id); if (!["expediente"].includes(id)) setPacienteActivo(null); };
  const handleVerExpediente = (id) => { setPacienteActivo(id); setSeccionActiva("expediente"); };
  const rol = "jefe_medico";
  const getLabel = () => NAV_ITEMS.find(n => n.id === seccionActiva)?.label || "Inicio";
  const getAvatarClass = (rolPersonal) => {
    if (rolPersonal === "enfermera") return "jefe-personal-avatar enfermera";
    if (rolPersonal === "nutriologo") return "jefe-personal-avatar nutriologo";
    if (rolPersonal === "jefe_medico") return "jefe-personal-avatar jefe";
    return "jefe-personal-avatar";
  };

  const medicamentosFiltrados = tabMeds === "todos" ? medicamentos : medicamentos.filter(m => m.tipo === tabMeds);

  const getEstadoLabel = (estado) => {
    const map = { pendiente: "Pendiente", aprobado: "Aprobado", rechazado: "Rechazado", listo_recoger: "Listo p/ Recoger", entregado: "Entregado" };
    return map[estado] || estado;
  };

  const handleExitoMed = (msg) => { setExitoMed(msg); cargarMedicamentos(); setTimeout(() => setExitoMed(null), 5000); };

  return (
    <>
      <style>{styles}</style>
      <div className="jefe-app">
        {panelAbierto && <div className="jefe-notif-overlay" onClick={() => setPanelAbierto(false)} />}

        <div className="jefe-topbar">
          <span>{getLabel()}</span>
          <button className="jefe-notif-btn" onClick={() => setPanelAbierto(!panelAbierto)}>
            {ICONS.bell}
            {noLeidas > 0 && <span className="jefe-notif-counter">{noLeidas > 9 ? "9+" : noLeidas}</span>}
          </button>
        </div>

        {panelAbierto && (
          <div className="jefe-notif-panel">
            <div className="jefe-notif-panel-header">
              <span className="jefe-notif-panel-title">🔔 Notificaciones {noLeidas > 0 && <span style={{ fontSize: 12, color: "#1d4ed8", fontWeight: 700 }}>({noLeidas} nuevas)</span>}</span>
              <div className="jefe-notif-panel-actions">
                {noLeidas > 0 && <button className="jefe-notif-marcar-todas" onClick={handleMarcarTodas}>Marcar todas como leídas</button>}
                <button className="jefe-notif-close" onClick={() => setPanelAbierto(false)}>✕</button>
              </div>
            </div>
            <div className="jefe-notif-list">
              {notificaciones.length === 0 ? (
                <div className="jefe-notif-empty"><div style={{ fontSize: 32, marginBottom: 8 }}>🔔</div>No tienes notificaciones</div>
              ) : notificaciones.map((n, i) => (
                <div key={i} className={`jefe-notif-item ${!n.leida ? "no-leida" : ""}`} onClick={() => handleMarcarLeida(n)}>
                  <div className="jefe-notif-icon">🔔</div>
                  <div style={{ flex: 1 }}>
                    <div className="jefe-notif-msg">{n.mensaje}</div>
                    <div className="jefe-notif-fecha">{formatFecha(n.fecha)}</div>
                  </div>
                  {!n.leida && <div className="jefe-notif-dot" />}
                </div>
              ))}
            </div>
          </div>
        )}

        <aside className="jefe-sidebar">
          <div className="jefe-sidebar-header" style={{ marginTop: 36 }}>
            <h2>Jefatura Médica</h2>
            <p>{usuario?.nombre || "Dr. Director"} · Jefe de Área</p>
          </div>
          <nav className="jefe-nav">
            {NAV_ITEMS.map((item, i) => (
              item.section ? (
                <div key={i} className="jefe-nav-section">{item.section}</div>
              ) : (
                <button key={item.id} className={`jefe-nav-item ${seccionActiva === item.id ? "active" : ""}`} onClick={() => handleNav(item.id)}>
                  {ICONS[item.icon]}
                  {item.label}
                  {item.id === "solicitudes" && solicitudes.length > 0 && (
                    <span style={{ marginLeft: "auto", background: "#dc2626", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 20 }}>{solicitudes.length}</span>
                  )}
                  {item.id === "solicitudes-med" && solMedPendientes > 0 && (
                    <span style={{ marginLeft: "auto", background: "#ea580c", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 6px", borderRadius: 20 }}>{solMedPendientes}</span>
                  )}
                </button>
              )
            ))}
          </nav>
          <div className="jefe-sidebar-footer">
            <div className="jefe-sidebar-footer-user">
              <div className="jefe-avatar">{iniciales}</div>
              <div className="jefe-sidebar-footer-info">
                <h4>{usuario?.nombre || "Dr. Director"}</h4>
                <p>Jefe Médico</p>
              </div>
            </div>
            <button className="jefe-logout-btn" onClick={handleCerrarSesion}>
              {ICONS.logout}
              Cerrar Sesión
            </button>
          </div>
        </aside>

        <main className="jefe-main">
          {/* MODALES */}
          {modalFormMed !== null && (
            <ModalFormMed
              med={modalFormMed || null}
              usuario={usuario}
              onClose={() => setModalFormMed(null)}
              onExito={handleExitoMed}
            />
          )}
          {modalMov && <ModalMovimiento med={modalMov.med} tipo={modalMov.tipo} usuario={usuario} onClose={() => setModalMov(null)} onExito={handleExitoMed} />}
          {modalHistorial && <ModalHistorial med={modalHistorial} onClose={() => setModalHistorial(null)} />}
          {modalResolver && <ModalResolver solicitud={modalResolver.sol} decision={modalResolver.decision} usuario={usuario} onClose={() => setModalResolver(null)} onExito={(msg) => { setExitoSol(msg); cargarSolicitudes(); setTimeout(() => setExitoSol(null), 5000); }} />}
          {modalAprobarMed && <ModalAprobarSolMed solicitud={modalAprobarMed.sol} decision={modalAprobarMed.decision} usuario={usuario} onClose={() => setModalAprobarMed(null)} onExito={(msg) => { setExitoSolMed(msg); cargarSolicitudesMed(); setTimeout(() => setExitoSolMed(null), 5000); }} />}
          {modalVerificarExt && <ModalVerificarExterno solicitud={modalVerificarExt} usuario={usuario} onClose={() => setModalVerificarExt(null)} onExito={(msg) => { setExitoSolMed(msg); cargarSolicitudesMed(); setTimeout(() => setExitoSolMed(null), 5000); }} />}

          {/* DASHBOARD */}
          {seccionActiva === "dashboard" && (
            <>
              <h1 className="jefe-page-title">Jefatura Médica</h1>
              <p className="jefe-page-subtitle">Vista general del área médica</p>
              <div className="jefe-stats-grid">
                {[
                  { label: "Total Pacientes", value: estadisticas?.total_pacientes ?? 0, iconKey: "users", iconClass: "blue" },
                  { label: "En Tratamiento", value: estadisticas?.en_tratamiento ?? 0, iconKey: "heart", iconClass: "green" },
                  { label: "En Desintoxicación", value: estadisticas?.en_desintoxicacion ?? 0, iconKey: "activity", iconClass: "red" },
                  { label: "Valoraciones Pendientes", value: estadisticas?.valoraciones_pendientes ?? 0, iconKey: "calendar", iconClass: "orange" },
                ].map((s, i) => (
                  <div className="jefe-stat-card" key={i}>
                    <div className="jefe-stat-card-header"><div className={`jefe-stat-icon ${s.iconClass}`}>{ICONS[s.iconKey]}</div></div>
                    <div className="jefe-stat-number">{cargando ? "—" : s.value}</div>
                    <div className="jefe-stat-label">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="jefe-two-col">
                <div className="jefe-card">
                  <div className="jefe-card-header">
                    <span className="jefe-card-title">Pacientes Recientes</span>
                    <span className="jefe-card-action" onClick={() => handleNav("pacientes")}>Ver todos</span>
                  </div>
                  {cargando ? <div className="jefe-loading">Cargando...</div>
                    : pacientesRecientes.length === 0 ? <div className="jefe-empty">No hay pacientes aún</div>
                    : pacientesRecientes.map((p, i) => (
                      <div className="jefe-patient-item" key={i} onClick={() => handleVerExpediente(p.id_paciente)}>
                        <div>
                          <div className="jefe-patient-name">{p.nombre} {p.apellido}</div>
                          <div className="jefe-patient-status">{p.estado || "Sin estado"}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div className="jefe-patient-days">{p.dias_tratamiento ?? 0} días</div>
                          <div className="jefe-patient-exp">Expediente {String(p.id_expediente || "—").padStart(3, "0")}</div>
                        </div>
                      </div>
                    ))}
                </div>
                <div className="jefe-card">
                  <div className="jefe-card-header">
                    <span className="jefe-card-title">Tareas Pendientes</span>
                    <span className="jefe-card-badge">{tareasPendientes.length} pendientes</span>
                  </div>
                  {cargando ? <div className="jefe-loading">Cargando...</div>
                    : tareasPendientes.length === 0 ? <div className="jefe-empty">No hay tareas pendientes</div>
                    : tareasPendientes.map((t, i) => (
                      <div className="jefe-task-item" key={i}>
                        <div className="jefe-task-name">{t.descripcion} - {t.paciente}</div>
                        <span className={`jefe-badge ${t.prioridad}`}>{t.prioridad === "urgente" ? "Urgente" : "Normal"}</span>
                      </div>
                    ))}
                </div>
              </div>
            </>
          )}

          {seccionActiva === "pacientes" && <Pacientes onVerExpediente={handleVerExpediente} />}
          {seccionActiva === "expediente" && pacienteActivo && <Expediente id_paciente={pacienteActivo} onVolver={() => setSeccionActiva("pacientes")} onNavegar={handleNav} />}
          {seccionActiva === "valoracion" && <Valoracion rol={rol} />}
          {seccionActiva === "diagnostico" && <Diagnostico rol={rol} />}
          {seccionActiva === "indicaciones" && <Indicaciones rol={rol} />}
          {seccionActiva === "desintoxicacion" && <Desintoxicacion rol={rol} />}
          {seccionActiva === "evolucion" && <Evolucion rol={rol} />}
          {seccionActiva === "laboratorio" && <Laboratorio rol={rol} />}
          {seccionActiva === "actividades" && <Actividades rol={rol} />}

          {/* MEDICAMENTOS */}
          {seccionActiva === "medicamentos" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <h1 className="jefe-page-title">Inventario</h1>
                  <p className="jefe-page-subtitle">Medicamentos e insumos médicos</p>
                </div>
                <button className="jefe-btn-primary" onClick={() => setModalFormMed(false)}>➕ Nuevo Producto</button>
              </div>

              <div className="jefe-tabs">
                {[
                  { key: "todos", label: "Todos" },
                  { key: "controlado", label: "⚠️ Controlados" },
                  { key: "no_controlado", label: "💊 No Controlados" },
                  { key: "insumo", label: "🩺 Insumos" },
                ].map(t => (
                  <button key={t.key} className={`jefe-tab ${tabMeds === t.key ? "active" : ""}`} onClick={() => setTabMeds(t.key)}>{t.label}</button>
                ))}
              </div>

              {exitoMed && <div className="jefe-success">{exitoMed}</div>}

              {cargandoMeds ? <div className="jefe-card"><div className="jefe-loading">Cargando inventario...</div></div>
                : medicamentosFiltrados.length === 0 ? <div className="jefe-card"><div className="jefe-empty">No hay productos en esta categoría</div></div>
                : <div className="jefe-med-grid">
                  {medicamentosFiltrados.map((m, i) => (
                    <div className="jefe-med-card" key={i}>
                      <span className={`jefe-med-tipo-badge ${m.tipo}`}>
                        {m.tipo === "controlado" ? "⚠️ Controlado" : m.tipo === "insumo" ? "🩺 Insumo" : "💊"}
                      </span>
                      <div className="jefe-med-nombre">{m.nombre}</div>
                      {m.presentacion && <div className="jefe-med-presentacion">{m.presentacion} {m.concentracion}</div>}
                      <div className="jefe-med-cat">{m.categoria || "Sin categoría"}</div>
                      {m.id_paciente_exclusivo && (
                        <div className="jefe-med-exclusivo">🔒 Exclusivo: {m.nombre_paciente_exclusivo} {m.apellido_paciente_exclusivo}</div>
                      )}
                      <div className="jefe-med-stock">
                        <div>
                          <div className="jefe-med-stock-num">{m.stock_actual}</div>
                          <div className="jefe-med-stock-label">{m.unidad_minima || "unidades"}</div>
                        </div>
                        <span className={`jefe-med-stock-badge ${m.stock_actual <= m.stock_minimo ? "bajo" : "ok"}`}>
                          {m.stock_actual <= m.stock_minimo ? "⚠️ Stock bajo" : "✅ OK"}
                        </span>
                      </div>
                      {m.unidad_empaque && m.cantidad_por_empaque && (
                        <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>
                          {m.cantidad_por_empaque} {m.unidad_minima} por {m.unidad_empaque}
                        </div>
                      )}
                      <div style={{ fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>Mínimo: {m.stock_minimo} {m.unidad_minima || "u"}</div>
                      <label className="jefe-toggle-controlado">
                        <input type="checkbox" checked={!!m.es_controlado} onChange={() => handleToggleControlado(m)} />
                        🔒 Requiere autorización
                      </label>
                      <div className="jefe-med-actions">
                        <button className="jefe-med-btn entrada" onClick={() => setModalMov({ med: m, tipo: "entrada" })}>⬆ Entrada</button>
                        <button className="jefe-med-btn salida" onClick={() => setModalMov({ med: m, tipo: "salida" })}>⬇ Salida</button>
                        <button className="jefe-med-btn historial" onClick={() => setModalHistorial(m)}>📋</button>
                        <button className="jefe-med-btn editar" onClick={() => setModalFormMed(m)}>✏️ Editar</button>
                      </div>
                    </div>
                  ))}
                </div>}
            </>
          )}

          {/* SOLICITUDES DE MEDICAMENTO */}
          {seccionActiva === "solicitudes-med" && (
            <>
              <h1 className="jefe-page-title">Solicitudes de Medicamento</h1>
              <p className="jefe-page-subtitle" style={{ marginBottom: 24 }}>Aprobar, rechazar y verificar solicitudes del médico</p>
              {exitoSolMed && <div className="jefe-success">{exitoSolMed}</div>}
              {cargandoSolMed ? <div className="jefe-card"><div className="jefe-loading">Cargando...</div></div>
                : solicitudesMed.length === 0 ? <div className="jefe-card"><div className="jefe-empty">✅ No hay solicitudes de medicamento</div></div>
                : solicitudesMed.map((s, i) => (
                  <div className="jefe-solmed-item" key={i}>
                    <div className="jefe-solmed-header">
                      <div>
                        <div className="jefe-solmed-paciente">{s.nombre_paciente} {s.apellido_paciente}</div>
                        <div className="jefe-solmed-medico">Dr. {s.nombre_medico} • {formatFecha(s.fecha_solicitud)}</div>
                      </div>
                      <span className={`jefe-solmed-estado ${s.estado}`}>{getEstadoLabel(s.estado)}</span>
                    </div>
                    <div className="jefe-solmed-info">
                      <div className="jefe-solmed-nombre">{s.es_controlado && "⚠️ "}{s.es_externo && "🏪 "}{s.nombre_medicamento}</div>
                      <div className="jefe-solmed-detalle">Dosis: {s.dosis || "—"} • Cantidad: {s.cantidad} • Frecuencia: {s.frecuencia || "—"} • Vía: {s.via || "—"}</div>
                      {s.observaciones && <div className="jefe-solmed-detalle">💬 {s.observaciones}</div>}
                    </div>
                    {s.es_externo && (
                      <div className="jefe-solmed-externo">
                        <div className="jefe-solmed-externo-title">📦 Medicamento Externo — Traído por el Familiar</div>
                        <div style={{ fontSize: 12, color: "#374151" }}>Familiar: {s.nombre_familiar || "—"} ({s.parentesco || "—"}) • Tel: {s.telefono || "—"}</div>
                        <div style={{ fontSize: 12, color: "#374151" }}>Procedencia: {s.farmacia_lugar || s.procedencia || "—"}</div>
                        {s.fecha_entrega_estimada && <div style={{ fontSize: 12, color: "#374151" }}>Entrega estimada: {new Date(s.fecha_entrega_estimada).toLocaleDateString()}</div>}
                      </div>
                    )}
                    {s.decision_jefe && (
                      <div style={{ fontSize: 12, color: s.decision_jefe === "aprobado" ? "#059669" : "#dc2626", marginBottom: 8 }}>
                        {s.decision_jefe === "aprobado" ? "✅" : "❌"} {s.nombre_jefe}: {s.comentario_jefe || "Sin comentario"}
                      </div>
                    )}
                    <div className="jefe-solmed-actions">
                      {s.estado === "pendiente" && (
                        <>
                          <button className="jefe-btn-aprobar" onClick={() => setModalAprobarMed({ sol: s, decision: "aprobado" })}>✅ Aprobar</button>
                          <button className="jefe-btn-rechazar" onClick={() => setModalAprobarMed({ sol: s, decision: "rechazado" })}>❌ Rechazar</button>
                        </>
                      )}
                      {s.estado === "aprobado" && s.es_externo && (
                        <button className="jefe-btn-verificar" onClick={() => setModalVerificarExt(s)}>🔍 Verificar Ingreso del Familiar</button>
                      )}
                    </div>
                  </div>
                ))}
            </>
          )}

          {/* PERSONAL */}
          {seccionActiva === "personal" && (
            <>
              <h1 className="jefe-page-title">Personal Médico</h1>
              <p className="jefe-page-subtitle" style={{ marginBottom: 24 }}>Médicos, enfermeras y nutriólogos del área</p>
              {cargandoPersonal ? <div className="jefe-card"><div className="jefe-loading">Cargando personal...</div></div>
                : personal.length === 0 ? <div className="jefe-card"><div className="jefe-empty">No hay personal registrado</div></div>
                : ["jefe_medico", "medico", "enfermera", "nutriologo"].map(rolTipo => {
                  const grupo = personal.filter(p => p.rol === rolTipo);
                  if (grupo.length === 0) return null;
                  return (
                    <div key={rolTipo} style={{ marginBottom: 24 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#0f1e3d", marginBottom: 12 }}>
                        {rolTipo === "jefe_medico" ? "👔 Jefe Médico" : rolTipo === "medico" ? "🩺 Médicos" : rolTipo === "enfermera" ? "💉 Enfermeras" : "🥗 Nutriólogos"} ({grupo.length})
                      </div>
                      <div className="jefe-personal-grid">
                        {grupo.map((p, i) => (
                          <div className="jefe-personal-card" key={i}>
                            <div className={getAvatarClass(p.rol)}>{p.nombre.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}</div>
                            <div>
                              <div className="jefe-personal-nombre">{p.nombre}</div>
                              <div className="jefe-personal-correo">{p.correo}</div>
                              <span className={`jefe-rol-badge ${p.rol}`}>{p.rol.charAt(0).toUpperCase() + p.rol.slice(1)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
            </>
          )}

          {/* SOLICITUDES DE CAMBIO DX */}
          {seccionActiva === "solicitudes" && (
            <>
              <h1 className="jefe-page-title">Solicitudes de Cambio en Diagnóstico</h1>
              <p className="jefe-page-subtitle" style={{ marginBottom: 24 }}>Aprobar o rechazar cambios solicitados por el médico</p>
              {exitoSol && <div className="jefe-success">{exitoSol}</div>}
              {cargandoSol ? <div className="jefe-card"><div className="jefe-loading">Cargando solicitudes...</div></div>
                : solicitudes.length === 0 ? <div className="jefe-card"><div className="jefe-empty">✅ No hay solicitudes pendientes</div></div>
                : solicitudes.map((s, i) => (
                  <div className="jefe-sol-item" key={i}>
                    <div className="jefe-sol-header">
                      <div>
                        <div className="jefe-sol-paciente">{s.nombre_paciente} {s.apellido_paciente}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>{s.fecha_solicitud ? new Date(s.fecha_solicitud).toLocaleString() : "—"}</div>
                      </div>
                      <span className={`jefe-sol-tipo ${s.tipo_solicitud}`}>{s.tipo_solicitud === "edicion" ? "✏️ Edición" : "🗑️ Eliminación"}</span>
                    </div>
                    <div className="jefe-sol-dx">
                      <div className="jefe-sol-codigo">{s.codigo_cie10}</div>
                      <div className="jefe-sol-desc">{s.descripcion_diagnostico}</div>
                    </div>
                    <div className="jefe-sol-solicitante">👤 Solicitado por: {s.nombre_solicitante}</div>
                    <div className="jefe-sol-motivo">💬 Motivo: {s.motivo}</div>
                    <div className="jefe-sol-actions">
                      <button className="jefe-btn-aprobar" onClick={() => setModalResolver({ sol: s, decision: "aprobado" })}>✅ Aprobar</button>
                      <button className="jefe-btn-rechazar" onClick={() => setModalResolver({ sol: s, decision: "rechazado" })}>❌ Rechazar</button>
                    </div>
                  </div>
                ))}
            </>
          )}
          {/* REQUISICIONES */}
          {seccionActiva === "requisiciones" && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <div>
                  <h1 className="jefe-page-title">Requisiciones</h1>
                  <p className="jefe-page-subtitle">Solicitudes de medicamentos e insumos a administración</p>
                </div>
                <button className="jefe-btn-primary" onClick={() => setModalNuevaReq(true)}>➕ Nueva Requisición</button>
              </div>
              {exitoReq && <div className="jefe-success">{exitoReq}</div>}

              {/* MODAL NUEVA REQUISICIÓN */}
              {modalNuevaReq && (
                <ModalNuevaRequisicion
                  usuario={usuario}
                  medicamentos={medicamentos}
                  onClose={() => setModalNuevaReq(false)}
                  onExito={(msg) => { setExitoReq(msg); cargarRequisiciones(); setTimeout(() => setExitoReq(null), 5000); }}
                />
              )}

              {cargandoReq ? <div className="jefe-card"><div className="jefe-loading">Cargando requisiciones...</div></div>
                : requisiciones.length === 0 ? <div className="jefe-card"><div className="jefe-empty">No hay requisiciones registradas</div></div>
                : requisiciones.map((r, i) => (
                  <div key={i} style={{ background: "#fff", border: "1px solid #e8eef5", borderRadius: 10, padding: 16, marginBottom: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#0f1e3d" }}>
                          {r.tipo === "medicamento" ? "💊" : "🩺"} {r.descripcion}
                        </div>
                        <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>
                          {r.nombre_jefe} • {r.fecha ? new Date(r.fecha).toLocaleDateString("es-MX") : "—"}
                        </div>
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20,
                        background: r.estado === "aprobado" ? "#d1fae5" : r.estado === "rechazado" ? "#fee2e2" : "#fef9c3",
                        color: r.estado === "aprobado" ? "#059669" : r.estado === "rechazado" ? "#dc2626" : "#ca8a04"
                      }}>
                        {r.estado === "aprobado" ? "✅ Aprobado" : r.estado === "rechazado" ? "❌ Rechazado" : "⏳ Pendiente"}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 20, fontSize: 12, color: "#6b7280", flexWrap: "wrap" }}>
                      <span>Cantidad: <strong>{r.cantidad} {r.unidad || ""}</strong></span>
                      <span>Tipo: <strong>{r.tipo === "medicamento" ? "Medicamento" : "Insumo"}</strong></span>
                      {r.nombre_medicamento_ref && <span>Ref: <strong>{r.nombre_medicamento_ref}</strong></span>}
                    </div>
                    {r.motivo && <div style={{ fontSize: 12, color: "#374151", marginTop: 8, padding: "6px 10px", background: "#f9fafb", borderRadius: 6 }}>💬 {r.motivo}</div>}
                    {r.respuesta && <div style={{ fontSize: 12, color: r.estado === "aprobado" ? "#059669" : "#dc2626", marginTop: 8 }}>📋 Respuesta: {r.respuesta}</div>}
                  </div>
                ))}
            </>
          )}
        </main>
      </div>
    </>
  );
}