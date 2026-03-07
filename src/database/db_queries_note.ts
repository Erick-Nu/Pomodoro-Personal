import db from './db_pomodoro';
import { Nota } from '../types';

export const createNote = (tareaId: number, titulo: string, contenido: string, etiqueta: string) => {
  return db.runSync(
    'INSERT INTO notas (tarea_id, titulo, contenido, etiqueta) VALUES (?, ?, ?, ?)', 
    [tareaId, titulo, contenido, etiqueta]
  );
};

export const deleteNote = (id: number) => {
  return db.runSync('DELETE FROM notas WHERE id = ?', [id]);
};

export const updateNote = (id: number, titulo: string, contenido: string, etiqueta: string) => {
  return db.runSync(
    'UPDATE notas SET titulo = ?, contenido = ?, etiqueta = ? WHERE id = ?', 
    [titulo, contenido, etiqueta, id]
  );
};

export const getNotesByTaskId = (tareaId: number): Nota[] => {
  return db.getAllSync<Nota>('SELECT * FROM notas WHERE tarea_id = ? ORDER BY fecha_registro DESC', [tareaId]);
};
