import db from './db_pomodoro';

const SQL_INSERT = 'INSERT INTO tareas (nombre, descripcion, fecha, tiempo_registrado) VALUES (?, ?, ?, ?)';
export const createTask = (nombre, descripcion, fecha, tiempoRegistrado) => {
  return db.runSync(SQL_INSERT, [nombre, descripcion, fecha, tiempoRegistrado]);
}

const SQL_DELETE = 'DELETE FROM tareas WHERE id = ?';
export const deleteTask = (id) => {
  return db.runSync(SQL_DELETE, [id]);
};

const SQL_SELECT_ALL = 'SELECT * FROM tareas';
export const getAllTasks = () => {
  return db.getAllSync(SQL_SELECT_ALL);
};

const SQL_UPDATE = 'UPDATE tareas SET nombre = ?, descripcion = ?, fecha = ?, tiempo_registrado = ? WHERE id = ?';
export const updateTask = (id, nombre, descripcion, fecha, tiempoRegistrado) => {
  return db.runSync(SQL_UPDATE, [nombre, descripcion, fecha, tiempoRegistrado, id]);
};

const SQL_SELECT_BY_DATE = 'SELECT * FROM tareas WHERE fecha = ?';
export const getTasksByDate = (fecha) => {
  return db.getAllSync(SQL_SELECT_BY_DATE, [fecha]);
};


const SQL_UPDATE_PROGRESS = 'UPDATE tareas SET tiempo_acumulado = tiempo_acumulado + ? WHERE id = ?';
const SQL_INSERT_SESSION = 'INSERT INTO sesiones (tarea_id, minutos_aportados) VALUES (?, ?)';
export const updateProgressTask = (tareaId, minutos) => {
  db.runSync(
    SQL_UPDATE_PROGRESS,
    [minutos, tareaId]
  );
  
  db.runSync(
    SQL_INSERT_SESSION,
    [tareaId, minutos]
  );
};
