// Simulación de tareas asignadas
let tareasDBUser = [
  {
    id: 1,
    usuario: "usuario",
    titulo: "Preparar informe mensual",
    descripcion: "Elaborar el informe de actividades del mes.",
    fechaVencimiento: "2025-06-10",
    estado: "asignada",
    prioridad: "alta",
    lugar: "Oficina",
    horas: 5
  },
  {
    id: 2,
    usuario: "usuario",
    titulo: "Revisión de inventario",
    descripcion: "Verificar el inventario de productos.",
    fechaVencimiento: "2025-06-15",
    estado: "asignada",
    prioridad: "media",
    lugar: "Almacén",
    horas: 3
  }
];

// Simula fetch para obtener tareas del usuario
function fetchTareasUsuario(username) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(tareasDBUser.filter(t => t.usuario === username));
    }, 200);
  });
}

// Simula fetch para actualizar estado de tarea
function updateEstadoTarea(id, nuevoEstado) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const tarea = tareasDBUser.find(t => t.id === id);
      if (tarea) {
        tarea.estado = nuevoEstado;
        resolve({ success: true, tarea });
      } else {
        reject({ success: false, message: "Tarea no encontrada" });
      }
    }, 200);
  });
}

// Renderiza la tabla de tareas en el contenedor
window.renderTareasUsuario = async function(username) {
  const tareas = await fetchTareasUsuario(username);
  const container = document.getElementById("tareasContainer");
  if (tareas.length === 0) {
    container.innerHTML = "<p>No tienes tareas asignadas.</p>";
    return;
  }
  let html = `
    <div class="table-responsive">
    <table class="table table-bordered table-striped align-middle">
      <thead>
        <tr>
          <th>Título</th>
          <th>Descripción</th>
          <th>Fecha de Vencimiento</th>
          <th>Estado</th>
          <th>Prioridad</th>
          <th>Lugar</th>
          <th>Horas</th>
          <th>Acción</th>
        </tr>
      </thead>
      <tbody>
  `;
  tareas.forEach(t => {
    let nextEstado = "";
    let btnText = "";
    if (t.estado === "asignada") {
      nextEstado = "iniciada";
      btnText = "Iniciar";
    } else if (t.estado === "iniciada") {
      nextEstado = "finalizada";
      btnText = "Finalizar";
    }
    html += `
      <tr>
        <td>${t.titulo}</td>
        <td>${t.descripcion}</td>
        <td>${t.fechaVencimiento}</td>
        <td>${t.estado.charAt(0).toUpperCase() + t.estado.slice(1)}</td>
        <td>${t.prioridad}</td>
        <td>${t.lugar}</td>
        <td>${t.horas}</td>
        <td>
          ${t.estado !== "finalizada"
            ? `<button class="btn btn-sm btn-primary" onclick="cambiarEstadoTarea(${t.id}, '${nextEstado}')">${btnText}</button>`
            : `<span class="badge bg-success">Completada</span>`
          }
        </td>
      </tr>
    `;
  });
  html += "</tbody></table></div>";
  container.innerHTML = html;
};

// Acción para cambiar el estado de la tarea
window.cambiarEstadoTarea = async function(id, nuevoEstado) {
  try {
    await updateEstadoTarea(id, nuevoEstado);
    // Obtener el usuario actual del input (o puedes guardar el usuario logueado en una variable global)
    const username = document.getElementById("username").value.trim();
    window.renderTareasUsuario(username);
  } catch (err) {
    alert("Error al actualizar la tarea");
  }
};