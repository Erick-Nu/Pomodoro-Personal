import db from './db_pomodoro';

export const crearTarea = (nombre, descripcion, fecha, tiempoRegistrado) => {
  return db.runSync(
    'INSERT INTO tareas (nombre, descripcion, fecha, tiempo_registrado) VALUES (?, ?, ?, ?)',
    [nombre, descripcion, fecha, tiempoRegistrado]
  );
};

export const obtenerTareasPorFecha = (fecha) => {
  return db.getAllSync('SELECT * FROM tareas WHERE fecha = ?', [fecha]);
};

export const actualizarProgresoTarea = (tareaId, minutos) => {
  db.runSync(
    'UPDATE tareas SET tiempo_acumulado = tiempo_acumulado + ? WHERE id = ?',
    [minutos, tareaId]
  );
  
  db.runSync(
    'INSERT INTO sesiones (tarea_id, minutos_aportados) VALUES (?, ?)',
    [tareaId, minutos]
  );
};


export const agregarNota = (tareaId, titulo, contenido, etiqueta = 'importante') => {
  return db.runSync(
    'INSERT INTO notas (tarea_id, titulo, contenido, etiqueta) VALUES (?, ?, ?, ?)',
    [tareaId, titulo, contenido, etiqueta]
  );
};

export const obtenerNotasDeTarea = (tareaId) => {
  return db.getAllSync('SELECT * FROM notas WHERE tarea_id = ? ORDER BY fecha_registro DESC', [tareaId]);
};