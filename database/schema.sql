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
    FOREIGN KEY (id_paciente) REFERENCES Paciente(id_paciente)
);

-- =========================
-- CUESTIONARIO CLINICO
-- =========================
CREATE TABLE Cuestionario (
    id_cuestionario INT IDENTITY PRIMARY KEY,
    id_paciente INT,
    pregunta NVARCHAR(255),
    respuesta NVARCHAR(255),
    FOREIGN KEY (id_paciente) REFERENCES Paciente(id_paciente)
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
    FOREIGN KEY (id_paciente) REFERENCES Paciente(id_paciente)
);

-- =========================
-- EXPEDIENTE
-- =========================
CREATE TABLE Expediente (
    id_expediente INT IDENTITY PRIMARY KEY,
    id_paciente INT,
    estado NVARCHAR(50),
    fecha_apertura DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (id_paciente) REFERENCES Paciente(id_paciente)
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
    FOREIGN KEY (id_paciente) REFERENCES Paciente(id_paciente)
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
    FOREIGN KEY (id_paciente) REFERENCES Paciente(id_paciente)
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


DROP TABLE Cuestionario;

CREATE TABLE Pregunta (
    id_pregunta INT IDENTITY PRIMARY KEY,
    texto NVARCHAR(255),
    tipo NVARCHAR(50)
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

ALTER TABLE Pregunta
ADD CONSTRAINT UQ_Pregunta UNIQUE (texto);

CREATE TABLE Usuario (
    id_usuario INT IDENTITY PRIMARY KEY,
    nombre NVARCHAR(100),
    correo NVARCHAR(100) UNIQUE,
    password NVARCHAR(255),
    rol NVARCHAR(50)
);

CREATE TABLE Rol (
    id_rol INT IDENTITY PRIMARY KEY,
    nombre NVARCHAR(50) UNIQUE
);

INSERT INTO Rol (nombre) VALUES 
('director'),
('administrador'),
('admision'),
('medico'),
('clinico');

ALTER TABLE Usuario
ADD id_rol INT;

ALTER TABLE Usuario
ADD CONSTRAINT FK_Usuario_Rol
FOREIGN KEY (id_rol) REFERENCES Rol(id_rol);

ALTER TABLE Usuario
ADD subrol NVARCHAR(50);

INSERT INTO Usuario (nombre, correo, password, id_rol, subrol)
VALUES ('Diegodire', 'diego@dire.com', '1234', 1, NULL);

SELECT u.nombre, r.nombre AS rol
FROM Usuario u
JOIN Rol r ON u.id_rol = r.id_rol;

SELECT * FROM Usuario


CREATE LOGIN diego WITH PASSWORD = '1234';
GO

USE MARAKAMEV1;
GO

CREATE USER diego FOR LOGIN diego;
GO

ALTER ROLE db_owner ADD MEMBER diego;

DROP USER diego;
DROP LOGIN diego;



ALTER TABLE Expediente
ADD estado_admision NVARCHAR(50),
    estado_tratamiento NVARCHAR(50),
    motivo_egreso NVARCHAR(255),
    fecha_ingreso DATETIME,
    fecha_egreso DATETIME;



    INSERT INTO Pregunta (texto, tipo) VALUES

-- SECCIÓN 1
('Fecha en la que se atiende al solicitante', 'seguimiento'),
('Nombre completo de quien atiende al solicitante', 'seguimiento'),
('Día en el que se atendió al solicitante', 'seguimiento'),

-- SECCIÓN 2 (SOLICITANTE)
('Nombre completo del solicitante', 'solicitante'),
('Lugar de procedencia del solicitante', 'solicitante'),
('Domicilio particular del solicitante', 'solicitante'),
('Teléfono del solicitante', 'solicitante'),
('Celular del solicitante', 'solicitante'),
('Ocupación del solicitante', 'solicitante'),
('Parentesco con el paciente', 'solicitante'),

-- SECCIÓN 3 (PACIENTE)
('Nombre completo del paciente', 'paciente'),
('Edad del paciente', 'paciente'),
('Estado civil del paciente', 'paciente'),
('Número de hijos del paciente', 'paciente'),
('Domicilio particular del paciente', 'paciente'),
('Escolaridad del paciente', 'paciente'),
('Lugar de origen del paciente', 'paciente'),
('Teléfono del paciente', 'paciente'),
('Ocupación del paciente', 'paciente'),

-- SECCIÓN 4 (VALORACIÓN)
('Drogas que consume el paciente', 'valoracion'),
('Acepta internarse', 'valoracion'),
('Requiere intervención para internarse', 'valoracion'),
('Internamientos previos', 'valoracion'),
('Posibilidades económicas', 'valoracion'),
('Llamar al paciente', 'valoracion'),
('Acuerdos para internamiento', 'valoracion'),

-- SECCIÓN 5 (ESTATUS)
('En espera de llamada', 'estatus'),
('En espera de visita', 'estatus'),
('Fecha y hora de internamiento', 'estatus'),
('Médico que valoró al paciente', 'estatus'),
('Observaciones médicas', 'estatus');


        WHERE tipo = 'paciente';

        select * from Paciente
        select * from Pregunta
        select  * from Cuestionario
        select * from RespuestaCuestionario

        select * from Usuario


-----09/04/2026
-- PASO 1: Quitar columna duplicada de Usuario
ALTER TABLE Usuario DROP COLUMN rol;

-- PASO 2: Trazabilidad en ValoracionMedica
ALTER TABLE ValoracionMedica ADD id_usuario INT;
ALTER TABLE ValoracionMedica ADD CONSTRAINT FK_Val_Usuario 
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario);

-- PASO 3: Médico asignado en Cita
ALTER TABLE Cita ADD id_usuario INT;
ALTER TABLE Cita ADD notas NVARCHAR(MAX);
ALTER TABLE Cita ADD duracion INT;
ALTER TABLE Cita ADD CONSTRAINT FK_Cita_Usuario 
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario);

-- PASO 4: Concepto y contrato en Pago
ALTER TABLE Pago ADD concepto NVARCHAR(100);
ALTER TABLE Pago ADD id_contrato INT;
ALTER TABLE Pago ADD CONSTRAINT FK_Pago_Contrato 
    FOREIGN KEY (id_contrato) REFERENCES Contrato(id_contrato);

-- PASO 5: Fecha y autor en HistoriaClinica
ALTER TABLE HistoriaClinica ADD fecha DATETIME DEFAULT GETDATE();
ALTER TABLE HistoriaClinica ADD id_usuario INT;
ALTER TABLE HistoriaClinica ADD CONSTRAINT FK_Historia_Usuario 
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario);

-- PASO 6: Quién abrió el Expediente
ALTER TABLE Expediente ADD id_usuario INT;
ALTER TABLE Expediente ADD CONSTRAINT FK_Expediente_Usuario 
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario);

-- PASO 7: Tabla NotaClinica nueva
CREATE TABLE NotaClinica (
    id_nota INT IDENTITY PRIMARY KEY,
    id_paciente INT,
    id_usuario INT,
    contenido NVARCHAR(MAX),
    fecha DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (id_paciente) REFERENCES Paciente(id_paciente),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario)
);



select * from Usuario

SELECT u.id_usuario, u.nombre, u.correo, r.nombre AS rol
FROM Usuario u
JOIN Rol r ON u.id_rol = r.id_rol

-- 17 de abril del 2024 
SELECT * FROM Paciente
SELECT * FROM Cuestionario
SELECT * FROM RespuestaCuestionario where id_cuestionario = 5
Select * FROM Familiar