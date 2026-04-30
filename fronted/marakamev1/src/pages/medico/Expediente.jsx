import ExpedienteClinico from "../expediente/ExpedienteClinico";

export default function Expediente({ id_paciente, onVolver }) {
  return (
    <ExpedienteClinico
      id_paciente={id_paciente}
      onVolver={onVolver}
    />
  );
}
