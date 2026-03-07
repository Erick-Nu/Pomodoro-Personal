export interface Tarea {
  id: number;
  nombre: string;
  descripcion?: string;
  fecha: string;
  tiempo_registrado: number; // en minutos
  tiempo_acumulado: number;  // en minutos
  estado: 'pendiente' | 'en proceso' | 'completada';
  completada: number;        // 0 o 1 (booleano en SQLite)
}

export interface Nota {
  id: number;
  tarea_id: number;
  titulo: string;
  etiqueta: 'importante' | 'idea' | 'conclusión' | 'nota';
  contenido: string;
  fecha_registro: string;
}

export type RootStackParamList = {
  Inicio: undefined;
  TaskDetail: { tarea: Tarea };
  AddTask: { initialDate?: string };
  Timer: { tarea: Tarea };
  Calendario: undefined;
  DetalleDia: { date: string };
};
