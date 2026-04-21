-- =============================================
-- MARAKAMEV1 - Script de creación de base de datos
-- =============================================

USE MARAKAMEV1;
GO

-- =========================
-- PACIENTE
-- =========================
CREATE TABLE Paciente (
    id_paciente INT IDENTITY PRIMARY KEY,
    nombre NVARCHAR(100),
    apellido NVARCHAR(100),
    fecha_nacimiento DATE,
    edad INT,
    genero NVARCHAR(20),
    telefono NVARCHAR(20),
    direccion NVARCHAR(255),
    estado_civil NVARCHAR(50),
    escolaridad NVARCHAR(50),
    ocupacion NVARCHAR(100),
    fecha_registro DATETIME DEFAULT GETDATE()
);

-- =========================
-- FAMILIAR / CONTACTO
-- =========================
CREATE TABLE Familiar (
    id_familiar INT IDENTITY PRIMARY KEY,
    id_paciente INT,
    nombre NVARCHAR(100),
    parentesco NVARCHAR(50),
    telefono NVARCHAR(20),
    direccion NVARCHAR(255),
    FOREIGN KEY (id_paciente) REFERENCES Paciente(id_paciente)
);

-- =========================
-- ESTUDIO SOCIOECONOMICO
-- =========================
CREATE TABLE EstudioSocioeconomico (
    id_estudio INT IDENTITY PRIMARY KEY,
    id_paciente INT,
    ingreso_mensual DECIMAL(10,2),
    egreso_mensual DECIMAL(10,2),
    tipo_vivienda NVARCHAR(100),
    num_habitantes INT,
    nivel_economico NVARCHAR(50),
    observaciones NVARCHAR(MAX),
    fecha DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (id_paciente) REFERENCES Paciente(id_paciente)
);

-- =========================
-- DETALLE INGRESOS
-- =========================
CREATE TABLE IngresoDetalle (
    id_ingreso INT IDENTITY PRIMARY KEY,
    id_estudio INT,
    concepto NVARCHAR(100),
    monto DECIMAL(10,2),
    FOREIGN KEY (id_estudio) REFERENCES EstudioSocioeconomico(id_estudio)
);

-- =========================
-- DETALLE EGRESOS
-- =========================
CREATE TABLE EgresoDetalle (
    id_egreso INT IDENTITY PRIMARY KEY,
    id_estudio INT,
    concepto NVARCHAR(100),
    monto DECIMAL(10,2),
    FOREIGN KEY (id_estudio) REFERENCES EstudioSocioeconomico(id_estudio)
);

-- =========================
-- HISTORIA CLINICA
-- =========================
CREATE TABLE HistoriaClinica (
    id_historia INT IDENTITY PRIMARY KEY,
    id_paciente INT,
    enfermedades_previas NVARCHAR(MAX),
    adicciones NVARCHAR(MAX),
    tratamientos_previos NVARCHAR(MAX),
    observaciones NVARCHAR(MAX),
    fecha DATETIME DEFAULT GETDATE(),
    id_usuario INT,
    FOREIGN KEY (id_paciente) REFERENCES Paciente(id_paciente)
);

-- =========================
-- ROL
-- =========================
CREATE TABLE Rol (
    id_rol INT IDENTITY PRIMARY KEY,
    nombre NVARCHAR(50) UNIQUE
);

-- =========================
-- USUARIO
-- =========================
CREATE TABLE Usuario (
    id_usuario INT IDENTITY PRIMARY KEY,
    nombre NVARCHAR(100),
    correo NVARCHAR(100) UNIQUE,
    password NVARCHAR(255),
    id_rol INT,
    subrol NVARCHAR(50),
    FOREIGN KEY (id_rol) REFERENCES Rol(id_rol)
);

-- =========================
-- VALORACION MEDICA
-- =========================
CREATE TABLE ValoracionMedica (
    id_valoracion INT IDENTITY PRIMARY KEY,
    id_paciente INT,
    riesgo NVARCHAR(50),
    apto BIT,
    observaciones NVARCHAR(MAX),
    fecha DATETIME DEFAULT GETDATE(),
    id_usuario INT,
    FOREIGN KEY (id_paciente) REFERENCES Paciente(id_paciente),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

-- =========================
-- EXPEDIENTE
-- =========================
CREATE TABLE Expediente (
    id_expediente INT IDENTITY PRIMARY KEY,
    id_paciente INT,
    estado NVARCHAR(50),
    estado_admision NVARCHAR(50),
    estado_tratamiento NVARCHAR(50),
    motivo_egreso NVARCHAR(255),
    fecha_apertura DATETIME DEFAULT GETDATE(),
    fecha_ingreso DATETIME,
    fecha_egreso DATETIME,
    id_usuario INT,
    FOREIGN KEY (id_paciente) REFERENCES Paciente(id_paciente),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

-- =========================
-- CITAS
-- =========================
CREATE TABLE Cita (
    id_cita INT IDENTITY PRIMARY KEY,
    id_paciente INT,
    fecha DATETIME,
    tipo NVARCHAR(100),
    especialidad NVARCHAR(100),
    estado NVARCHAR(50),
    id_usuario INT,
    notas NVARCHAR(MAX),
    duracion INT,
    FOREIGN KEY (id_paciente) REFERENCES Paciente(id_paciente),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

-- =========================
-- CONTRATOS
-- =========================
CREATE TABLE Contrato (
    id_contrato INT IDENTITY PRIMARY KEY,
    id_paciente INT,
    tipo NVARCHAR(100),
    contenido NVARCHAR(MAX),
    firmado BIT,
    fecha DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (id_paciente) REFERENCES Paciente(id_paciente)
);

-- =========================
-- PAGOS
-- =========================
CREATE TABLE Pago (
    id_pago INT IDENTITY PRIMARY KEY,
    id_paciente INT,
    monto DECIMAL(10,2),
    fecha DATETIME,
    metodo NVARCHAR(50),
    concepto NVARCHAR(100),
    id_contrato INT,
    FOREIGN KEY (id_paciente) REFERENCES Paciente(id_paciente),
    FOREIGN KEY (id_contrato) REFERENCES Contrato(id_contrato)
);

-- =========================
-- PROVEEDORES
-- =========================
CREATE TABLE Proveedor (
    id_proveedor INT IDENTITY PRIMARY KEY,
    nombre NVARCHAR(100),
    telefono NVARCHAR(20),
    direccion NVARCHAR(255)
);

-- =========================
-- COTIZACIONES
-- =========================
CREATE TABLE Cotizacion (
    id_cotizacion INT IDENTITY PRIMARY KEY,
    id_proveedor INT,
    descripcion NVARCHAR(255),
    monto DECIMAL(10,2),
    fecha DATETIME,
    FOREIGN KEY (id_proveedor) REFERENCES Proveedor(id_proveedor)
);

-- =========================
-- ORDEN DE COMPRA
-- =========================
CREATE TABLE OrdenCompra (
    id_orden INT IDENTITY PRIMARY KEY,
    id_cotizacion INT,
    aprobado BIT,
    fecha DATETIME,
    FOREIGN KEY (id_cotizacion) REFERENCES Cotizacion(id_cotizacion)
);

-- =========================
-- CUESTIONARIO
-- =========================
CREATE TABLE Pregunta (
    id_pregunta INT IDENTITY PRIMARY KEY,
    texto NVARCHAR(255),
    tipo NVARCHAR(50),
    CONSTRAINT UQ_Pregunta UNIQUE (texto)
);

CREATE TABLE Cuestionario (
    id_cuestionario INT IDENTITY PRIMARY KEY,
    id_paciente INT,
    fecha DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (id_paciente) REFERENCES Paciente(id_paciente)
);

CREATE TABLE RespuestaCuestionario (
    id_cuestionario INT,
    id_pregunta INT,
    id_familiar INT NULL,
    respuesta NVARCHAR(255),
    PRIMARY KEY (id_cuestionario, id_pregunta),
    FOREIGN KEY (id_cuestionario) REFERENCES Cuestionario(id_cuestionario),
    FOREIGN KEY (id_pregunta) REFERENCES Pregunta(id_pregunta),
    FOREIGN KEY (id_familiar) REFERENCES Familiar(id_familiar)
);

-- =========================
-- NOTA CLINICA
-- =========================
CREATE TABLE NotaClinica (
    id_nota INT IDENTITY PRIMARY KEY,
    id_paciente INT,
    id_usuario INT,
    contenido NVARCHAR(MAX),
    fecha DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (id_paciente) REFERENCES Paciente(id_paciente),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);

-- =========================
-- DATOS INICIALES
-- =========================
INSERT INTO Rol (nombre) VALUES
('director'),
('administrador'),
('admision'),
('medico'),
('clinico');

INSERT INTO Pregunta (texto, tipo) VALUES
('Fecha en la que se atiende al solicitante', 'seguimiento'),
('Nombre completo de quien atiende al solicitante', 'seguimiento'),
('Día en el que se atendió al solicitante', 'seguimiento'),
('Nombre completo del solicitante', 'solicitante'),
('Lugar de procedencia del solicitante', 'solicitante'),
('Domicilio particular del solicitante', 'solicitante'),
('Teléfono del solicitante', 'solicitante'),
('Celular del solicitante', 'solicitante'),
('Ocupación del solicitante', 'solicitante'),
('Parentesco con el paciente', 'solicitante'),
('Nombre completo del paciente', 'paciente'),
('Edad del paciente', 'paciente'),
('Estado civil del paciente', 'paciente'),
('Número de hijos del paciente', 'paciente'),
('Domicilio particular del paciente', 'paciente'),
('Escolaridad del paciente', 'paciente'),
('Lugar de origen del paciente', 'paciente'),
('Teléfono del paciente', 'paciente'),
('Ocupación del paciente', 'paciente'),
('Drogas que consume el paciente', 'valoracion'),
('Acepta internarse', 'valoracion'),
('Requiere intervención para internarse', 'valoracion'),
('Internamientos previos', 'valoracion'),
('Posibilidades económicas', 'valoracion'),
('Llamar al paciente', 'valoracion'),
('Acuerdos para internamiento', 'valoracion'),
('En espera de llamada', 'estatus'),
('En espera de visita', 'estatus'),
('Fecha y hora de internamiento', 'estatus'),
('Médico que valoró al paciente', 'estatus'),
('Observaciones médicas', 'estatus');

-- Usuario administrador inicial
INSERT INTO Usuario (nombre, correo, password, id_rol, subrol)
VALUES ('Diegodire', 'diego@dire.com', '1234', 1, NULL);
