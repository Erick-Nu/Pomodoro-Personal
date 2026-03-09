import db from './db_pomodoro';
import { Tarea } from '../types';

export const createTask = (nombre: string, descripcion: string, fecha: string, tiempoRegistrado: number) => {
  return db.runSync(
    'INSERT INTO tareas (nombre, descripcion, fecha, tiempo_registrado) VALUES (?, ?, ?, ?)', 
    [nombre, descripcion, fecha, tiempoRegistrado]
  );
};

export const deleteTask = (id: number) => {
  return db.runSync('DELETE FROM tareas WHERE id = ?', [id]);
};

export const getAllTasks = (): Tarea[] => {
  return db.getAllSync<Tarea>('SELECT * FROM tareas');
};

export const updateTask = (id: number, nombre: string, descripcion: string, fecha: string, tiempoRegistrado: number) => {
  return db.runSync(
    'UPDATE tareas SET nombre = ?, descripcion = ?, fecha = ?, tiempo_registrado = ? WHERE id = ?', 
    [nombre, descripcion, fecha, tiempoRegistrado, id]
  );
};

export const getTasksByDate = (fecha: string): Tarea[] => {
  return db.getAllSync<Tarea>('SELECT * FROM tareas WHERE fecha = ?', [fecha]);
};

export const updateProgressTask = (tareaId: number, minutos: number) => {
  db.runSync(
    "UPDATE tareas SET tiempo_acumulado = tiempo_acumulado + ?, estado = CASE WHEN (tiempo_acumulado + ?) >= tiempo_registrado THEN 'completada' ELSE 'en proceso' END WHERE id = ?",
    [minutos, minutos, tareaId]
  );
  
  db.runSync(
    'INSERT INTO sesiones (tarea_id, minutos_aportados) VALUES (?, ?)',
    [tareaId, minutos]
  );
};
