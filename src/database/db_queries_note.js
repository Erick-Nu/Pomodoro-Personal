import db from './db_pomodoro';

const SQL_INSERT = 'INSERT INTO notas (tarea_id, titulo, contenido, etiqueta) VALUES (?, ?, ?, ?)';
export const createNote = (tareaId, titulo, contenido, etiqueta) => {
  return db.runSync(SQL_INSERT, [tareaId, titulo, contenido, etiqueta]);
}

const SQL_DELETE = 'DELETE FROM notas WHERE id = ?';
export const deleteNote = (id) => {
  return db.runSync(SQL_DELETE, [id]);
};

const SQL_UPDATE = 'UPDATE notas SET titulo = ?, contenido = ?, etiqueta = ? WHERE id = ?';
export const updateNote = (id, titulo, contenido, etiqueta) => {
  return db.runSync(SQL_UPDATE, [titulo, contenido, etiqueta, id]);
};

const SQL_SELECT_BY_TASK = 'SELECT * FROM notas WHERE tarea_id = ? ORDER BY fecha_registro DESC';
export const getNotesByTaskId = (tareaId) => {
  return db.getAllSync(SQL_SELECT_BY_TASK, [tareaId]);
};