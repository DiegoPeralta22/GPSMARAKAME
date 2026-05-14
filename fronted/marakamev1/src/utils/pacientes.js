// Caché compartida entre todos los componentes — evita llamadas duplicadas
const TTL = 30000; // 30 segundos
let _cache = null, _ts = 0, _pending = null;

export const fetchPacientes = () => {
  if (_cache && Date.now() - _ts < TTL) return Promise.resolve(_cache);
  if (_pending) return _pending;
  _pending = fetch("http://localhost:3000/pacientes-admision")
    .then(r => r.json())
    .then(data => {
      _cache = Array.isArray(data) ? data : [];
      _ts = Date.now();
      _pending = null;
      return _cache;
    })
    .catch(() => { _pending = null; return []; });
  return _pending;
};

export const invalidatePacientes = () => { _cache = null; _ts = 0; };
