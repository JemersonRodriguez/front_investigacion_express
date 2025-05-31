// Obtiene las tareas del usuario autenticado desde el backend
async function fetchTareasUsuario() {
  const token = localStorage.getItem("token");
  const response = await fetch("http://localhost:3000/api/tareas/", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
  if (!response.ok) {
    throw new Error("No se pudieron obtener las tareas");
  }
  return await response.json();
}

// Cambia el estado de la tarea (ASIGNADA -> INICIADA -> TERMINADA)
window.cambiarEstadoTarea = async function(id, estadoActual) {
  const token = localStorage.getItem("token");
  let nuevoEstado = "";
  if (estadoActual === "ASIGNADA") {
    nuevoEstado = "INICIADA";
  } else if (estadoActual === "INICIADA") {
    nuevoEstado = "TERMINADA";
  } else {
    return; // Si ya está terminada, no hace nada
  }

  const response = await fetch(`http://localhost:3000/api/tareas/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ estado_tarea: nuevoEstado })
  });

  if (response.ok) {
    // Recarga la tabla de tareas para reflejar el cambio
    window.renderTareasUsuario();
  } else {
    alert("No se pudo actualizar el estado de la tarea.");
  }
};

// Renderiza la tabla de tareas en el contenedor
window.renderTareasUsuario = async function() {
  try {
    const tareas = await fetchTareasUsuario();
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
            <th>ID</th>
            <th>Título</th>
            <th>Descripción</th>
            <th>Fecha de Vencimiento</th>
            <th>Prioridad</th>
            <th>Lugar</th>
            <th>Cantidad de Horas</th>
            <th>Imagen</th>
            <th>Creada</th>
            <th>Actualizada</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
    `;
    tareas.forEach(t => {
      let btnHtml = "";
      if (t.estado_tarea === "ASIGNADA") {
        btnHtml = `<button class="btn btn-sm btn-primary" onclick="cambiarEstadoTarea(${t.id}, 'ASIGNADA')">Iniciar</button>`;
      } else if (t.estado_tarea === "INICIADA") {
        btnHtml = `<button class="btn btn-sm btn-primary" onclick="cambiarEstadoTarea(${t.id}, 'INICIADA')">Finalizar</button>`;
      } else if (t.estado_tarea === "TERMINADA") {
        btnHtml = `<span class="badge bg-success">Completada</span>`;
      }
      html += `
        <tr>
          <td>${t.id}</td>
          <td>${t.titulo}</td>
          <td>${t.descripcion}</td>
          <td>${t.fecha_vencimiento || ""}</td>
          <td>${t.prioridad || ""}</td>
          <td>${t.lugar || ""}</td>
          <td>${t.cantidad_horas || ""}</td>
          <td>
            ${t.imagen_ruta ? `<img src="http://localhost:3000/uploads/${t.imagen_ruta}" alt="Imagen" style="max-width:60px;max-height:60px;">` : ""}
          </td>
          <td>${t.createdAt ? new Date(t.createdAt).toLocaleString() : ""}</td>
          <td>${t.updatedAt ? new Date(t.updatedAt).toLocaleString() : ""}</td>
          <td>
            ${btnHtml}
          </td>
        </tr>
      `;
    });
    html += "</tbody></table></div>";
    container.innerHTML = html;
  } catch (err) {
    document.getElementById("tareasContainer").innerHTML = "<p>Error al cargar las tareas.</p>";
  }
};