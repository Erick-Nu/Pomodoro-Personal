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

El sistema se compone de unidades funcionales diseñadas para maximizar el flujo de trabajo del usuario:

<table width="100%">
  <tr>
    <td width="30%" align="center"><img src="screenshot-home.jpg" width="220" alt="Home Screen" style="border-radius: 10px; border: 1px solid #e1e4e8;"></td>
    <td>
      <h3><img src="https://img.shields.io/badge/Home-111827?style=flat-square&logo=icloud&logoColor=white" alt="Home"> Panel de Control Diario</h3>
      <p>Centro neurálgico de la aplicación que proporciona una visión agregada del rendimiento en tiempo real.</p>
      <ul>
        <li><b>Métricas de Desempeño:</b> Visualización dinámica de tiempo foco, tareas totales y tasa de completitud.</li>
        <li><b>Work Queue:</b> Lista inteligente de tareas programadas con indicadores de progreso porcentual.</li>
        <li><b>UX Adaptativo:</b> Saludo dinámico y estados de carga basados en el contexto temporal del usuario.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="30%" align="center"><img src="screenshot-calendar.jpg" width="220" alt="Calendar Screen" style="border-radius: 10px; border: 1px solid #e1e4e8;"></td>
    <td>
      <h3><img src="https://img.shields.io/badge/Calendario-4B5563?style=flat-square&logo=google-calendar&logoColor=white" alt="Calendar"> Vista Cronológica</h3>
      <p>Módulo de auditoría temporal para el seguimiento de la productividad a largo plazo.</p>
      <ul>
        <li><b>Navegación Histórica:</b> Interfaz de calendario integrada para la consulta de registros pasados.</li>
        <li><b>Resumen de Jornada:</b> Visualización rápida de actividades realizadas en fechas específicas.</li>
        <li><b>Deep-Linking:</b> Acceso directo al desglose detallado de cada sesión histórica.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="30%" align="center"><img src="screenshot-timer.jpg" width="220" alt="Timer Screen" style="border-radius: 10px; border: 1px solid #e1e4e8;"></td>
    <td>
      <h3><img src="https://img.shields.io/badge/Temporizador-1E3A8A?style=flat-square&logo=clockify&logoColor=white" alt="Timer"> Motor de Concentración</h3>
      <p>Interfaz de alta fidelidad diseñada para eliminar distracciones y ejecutar sesiones de enfoque profundo.</p>
      <ul>
        <li><b>Ciclos de Enfoque:</b> Control preciso de temporización con duraciones preconfiguradas (25m, 45m, 60m).</li>
        <li><b>Estado de Ejecución:</b> Gestión asíncrona de estados (Play, Pause, Reset) con feedback visual circular.</li>
        <li><b>Integración Multimedia:</b> Soporte para audio y control de sesiones mediante notificaciones locales.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="30%" align="center"><img src="screenshot-add-task.jpg" width="220" alt="Add Task Screen" style="border-radius: 10px; border: 1px solid #e1e4e8;"></td>
    <td>
      <h3><img src="https://img.shields.io/badge/Registro-D97706?style=flat-square&logo=plus-square&logoColor=white" alt="Add"> Configuración de Tareas</h3>
      <p>Herramienta ágil para la definición de objetivos y estimación de recursos de tiempo.</p>
      <ul>
        <li><b>Definición de Metadatos:</b> Campos estructurados para nombre, descripción y parámetros técnicos.</li>
        <li><b>Estimación Predictiva:</b> Cálculo automático de equivalencia en ciclos Pomodoro según la inversión de tiempo.</li>
        <li><b>Validación de Datos:</b> Aseguramiento de la integridad de los registros antes de la persistencia en SQLite.</li>
      </ul>
    </td>
  </tr>
  <tr>
    <td width="30%" align="center"><i>Visuales en proceso</i></td>
    <td>
      <h3><img src="https://img.shields.io/badge/Detalles-059669?style=flat-square&logo=google-keep&logoColor=white" alt="Details"> Gestión de Tarea y Notas</h3>
      <p>Capa de administración detallada para el seguimiento cualitativo del trabajo realizado.</p>
      <ul>
        <li><b>Registro de Notas:</b> Clasificación semántica de anotaciones (Ideas, Conclusiones, Importante).</li>
        <li><b>Persistencia Relacional:</b> Vinculación estricta de notas a entidades de tareas mediante IDs únicos.</li>
        <li><b>Auditoría:</b> Consulta de fechas de registro y contenidos históricos para trazabilidad.</li>
      </ul>
    </td>
  </tr>
</table>

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
*Desarrollado bajo estándares de ingeniería de software para maximizar la eficiencia personal.*
