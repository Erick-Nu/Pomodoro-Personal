import * as SQLite from 'expo-sqlite';

// Abrimos la base de datos local
const db = SQLite.openDatabaseSync('pomodoro_v4.db');

export const initDatabase = (): void => {
  try {
    db.execSync('PRAGMA foreign_keys = ON;');
    db.execSync('PRAGMA journal_mode = WAL;');

    db.execSync(`
      -- 1. Tabla de Tareas
      CREATE TABLE IF NOT EXISTS tareas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        descripcion TEXT,
        fecha TEXT NOT NULL,   
        tiempo_registrado INTEGER,      
        tiempo_acumulado INTEGER DEFAULT 0, 
        estado TEXT DEFAULT 'pendiente',  
        completada INTEGER DEFAULT 0       
      );

      -- 2. Tabla de Notas
      CREATE TABLE IF NOT EXISTS notas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tarea_id INTEGER NOT NULL,
        titulo TEXT NOT NULL,
        etiqueta TEXT DEFAULT 'nota',
        contenido TEXT NOT NULL,
        fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tarea_id) REFERENCES tareas (id) ON DELETE CASCADE
      );

      -- 3. Historial de Sesiones
      CREATE TABLE IF NOT EXISTS sesiones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tarea_id INTEGER NOT NULL,
        minutos_aportados INTEGER,         
        fecha_fin DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (tarea_id) REFERENCES tareas (id) ON DELETE CASCADE
      );
    `);
    console.log("Base de datos configurada correctamente.");
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
  }
};

export default db;
