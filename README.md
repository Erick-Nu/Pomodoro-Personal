# Pomodoro Personal - Productivity Management System

![Build Status](https://img.shields.io/badge/Build-Stable-success?style=flat-square)
![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=flat-square)
![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS-lightgrey?style=flat-square)
![License](https://img.shields.io/badge/License-Proprietary-red?style=flat-square)

---

## Resumen Ejecutivo

**Pomodoro Personal** es una solución móvil de alto rendimiento diseñada para la gestión del tiempo y la optimización de la productividad individual. Basada en la metodología Pomodoro, la aplicación permite a los usuarios finales planificar tareas, ejecutar ciclos de concentración y analizar el rendimiento mediante un sistema de persistencia local robusto.

---

## Especificaciones Técnicas

### Stack de Tecnologías

| Capa | Tecnología | Implementación |
| :--- | :--- | :--- |
| **Framework Principal** | ![React Native](https://img.shields.io/badge/React_Native-61DAFB?style=flat-square&logo=react&logoColor=black) | Desarrollo Cross-Platform nativo. |
| **Ecosistema** | ![Expo](https://img.shields.io/badge/Expo-000020?style=flat-square&logo=expo&logoColor=white) | Gestión de ciclo de vida y SDK v54. |
| **Lenguaje** | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white) | Tipado estricto y arquitectura escalable. |
| **Base de Datos** | ![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white) | Almacenamiento relacional local (expo-sqlite). |
| **UI/UX** | ![Vector Icons](https://img.shields.io/badge/Ionicons-438AFE?style=flat-square&logo=ionic&logoColor=white) | Diseño modular y componentes interactivos. |

### Funcionalidades Core

*   **Motor de Temporización:** Sistema de control de ciclos Pomodoro con estados de ejecución asíncronos.
*   **Gestión de Tareas:** CRUD completo de objetivos diarios con seguimiento de tiempo acumulado versus objetivo.
*   **Módulo de Notas Contextuales:** Sistema de anotaciones vinculado a entidades de tareas mediante relaciones de llave foránea.
*   **Analítica de Sesiones:** Registro histórico de bloques de tiempo (sesiones) para auditoría de productividad.
*   **Sistema de Notificaciones:** Integración nativa para alertas de fin de ciclo y recordatorios de sistema.

---

## Módulos de Interfaz (Screens)

El sistema se compone de módulos de interfaz especializados para cada etapa del flujo de productividad:

### ![Home](https://img.shields.io/badge/Home-111827?style=flat-square&logo=icloud&logoColor=white) Panel de Control Diario
Módulo principal que presenta un resumen ejecutivo del rendimiento diario. Incluye indicadores de tiempo de enfoque acumulado, conteo de tareas completadas y una lista priorizada de objetivos para la jornada actual.
![Imagen de Screen: Home]

### ![Calendar](https://img.shields.io/badge/Calendario-4B5563?style=flat-square&logo=google-calendar&logoColor=white) Vista Cronológica
Módulo de navegación temporal que permite visualizar la distribución de carga de trabajo mediante un calendario interactivo. Sirve como punto de acceso para la auditoría de días previos.
![Imagen de Screen: Calendario]

### ![DayDetail](https://img.shields.io/badge/Historial-374151?style=flat-square&logo=docsdotrs&logoColor=white) Detalle de Jornada Histórica
Interfaz dedicada al desglose de actividades realizadas en una fecha específica. Permite revisar el estado final de las tareas y el tiempo invertido en sesiones pasadas.
![Imagen de Screen: Detalle Dia]

### ![Timer](https://img.shields.io/badge/Temporizador-1E3A8A?style=flat-square&logo=clockify&logoColor=white) Motor de Concentración
Interfaz de alta fidelidad dedicada a la ejecución de ciclos Pomodoro. Implementa controles de estado (Play/Pause/Reset) y visualización de progreso en tiempo real para la tarea activa.
![Imagen de Screen: Temporizador]

### ![Details](https://img.shields.io/badge/Detalles-059669?style=flat-square&logo=google-keep&logoColor=white) Gestión de Tarea y Notas
Vista detallada que permite la administración de metadatos de una tarea específica. Facilita la creación y categorización de notas contextuales (Importante, Idea, Conclusión) vinculadas directamente al historial de trabajo.
![Imagen de Screen: Detalles]

### ![Calendar](https://img.shields.io/badge/Historial-4B5563?style=flat-square&logo=google-calendar&logoColor=white) Auditoría y Calendario
Módulo de análisis retrospectivo que permite navegar por el historial de productividad mediante un calendario interactivo. Proporciona acceso a los registros de tareas y sesiones de días anteriores.
![Imagen de Screen: Calendario]

### ![Add](https://img.shields.io/badge/Registro-D97706?style=flat-square&logo=plus-square&logoColor=white) Configuración de Tareas
Interfaz optimizada para el registro de nuevos objetivos, permitiendo definir nombres, descripciones técnicas y tiempos estimados de ejecución de forma ágil.
![Imagen de Screen: Registro]

---

## Arquitectura de Software

La aplicación sigue un patrón de diseño modular centrado en la separación de responsabilidades:

```text
src/
├── components/    # Unidades de interfaz de usuario atómicas y reutilizables.
├── database/      # Capa de abstracción de datos (DAL) y esquemas relacionales.
├── hooks/         # Lógica de negocio encapsulada y controladores de estado.
├── screens/       # Componentes de alto nivel (vistas de navegación).
├── styles/        # Definiciones globales de temas y tokens de diseño.
└── types/         # Definiciones de tipos estáticos e interfaces de dominio.
```

---

## Instalación y Despliegue

### Requisitos Previos

*   Node.js (versión LTS recomendada).
*   Gestor de paquetes npm o yarn.
*   Expo Go instalado en el dispositivo de pruebas o un emulador configurado.

### Procedimiento de Configuración

1.  **Clonación del Repositorio:**
    ```bash
    git clone <repository-url>
    cd Pomodoro-Personal
    ```

2.  **Instalación de Dependencias:**
    ```bash
    npm install
    ```

3.  **Ejecución del Entorno de Desarrollo:**
    ```bash
    npx expo start
    ```

---

## Consideraciones de Seguridad y Datos

*   **Persistencia:** Todos los datos se almacenan localmente en el dispositivo mediante SQLite, garantizando la privacidad del usuario.
*   **Integridad:** Se utilizan llaves foráneas y borrado en cascada para mantener la integridad referencial entre tareas y notas.

---
