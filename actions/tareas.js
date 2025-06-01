// Obtiene las tareas reales del backend
async function fetchTareas() {
  const token = localStorage.getItem("token");
  const response = await fetch("http://localhost:3000/api/tareas/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("No se pudieron obtener las tareas");
  return await response.json();
}

// Obtiene los usuarios reales del backend
async function fetchUsuarios() {
  const token = localStorage.getItem("token");
  const response = await fetch("http://localhost:3000/api/usuarios/", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("No se pudieron obtener los usuarios");
  return await response.json();
}

// Renderiza el select de usuarios en la modal de crear tarea
window.renderSelectUsuarios = async function () {
  const select = document.getElementById("usuarioAsignadoTarea");
  select.innerHTML = '<option value="">Asignar a usuario</option>';
  try {
    const usuarios = await fetchUsuarios();
    usuarios.forEach((u) => {
      select.innerHTML += `<option value="${u.id}">${u.nombre}</option>`;
    });
  } catch (err) {
    select.innerHTML = '<option value="">Error al cargar usuarios</option>';
  }
};

// Crear tarea con imagen
window.crearTareaAdmin = async function (event) {
  event.preventDefault();

  const token = localStorage.getItem("token");
  const titulo = document.getElementById("tituloTarea").value.trim();
  const descripcion = document.getElementById("descripcionTarea").value.trim();
  const fecha_vencimiento = document.getElementById(
    "fechaVencimientoTarea"
  ).value;
  const prioridad = document.getElementById("prioridadTarea").value;
  const lugar = document.getElementById("lugarTarea").value.trim();
  const cantidad_horas = document.getElementById("horasTarea").value;
  const usuarioId = document.getElementById("usuarioAsignadoTarea").value;
  const imagenInput = document.getElementById("imagenTarea");

  const formData = new FormData();
  formData.append("titulo", titulo);
  formData.append("descripcion", descripcion);
  formData.append("fecha_vencimiento", fecha_vencimiento);
  formData.append("prioridad", prioridad);
  formData.append("lugar", lugar);
  formData.append("cantidad_horas", cantidad_horas);
  formData.append("usuarioId", usuarioId);

  if (imagenInput && imagenInput.files[0]) {
    formData.append("imagen", imagenInput.files[0]);
  }

  try {
    const response = await fetch("http://localhost:3000/api/tareas/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // No pongas Content-Type aquí, fetch lo pone solo con FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      alert(error.error || "No se pudo crear la tarea");
      return;
    }

    // Cierra la modal y recarga la tabla
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("modalCrearTarea")
    );
    if (modal) modal.hide();
    window.renderTareasAdmin();
    event.target.reset();
  } catch (err) {
    alert("Error al crear la tarea");
  }
};

// Renderiza la tabla de tareas para admin, con filtro
window.renderTareasAdmin = async function (filtro = "") {
  try {
    const tareas = await fetchTareas();
    const container = document.getElementById("adminTareasContainer");
    let tareasFiltradas = tareas;
    if (filtro) {
      const f = filtro.toLowerCase();
      tareasFiltradas = tareas.filter(
        (t) =>
          t.titulo.toLowerCase().includes(f) ||
          (t.usuario && t.usuario.toLowerCase().includes(f)) ||
          (t.usuarioId && t.usuarioId.toString().includes(f))
      );
    }
    if (tareasFiltradas.length === 0) {
      container.innerHTML = "<p>No hay tareas registradas.</p>";
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
          <th>Prioridad</th>
          <th>Lugar</th>
          <th>Cantidad de Horas</th>
          <th>Imagen</th>
          <th>Usuario</th>
          <th>Creada</th>
          <th>Actualizada</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
  `;

    tareasFiltradas.forEach((t) => {
      let acciones = "";
      if (t.estado_tarea === "ASIGNADA") {
        acciones = `
        <div class="d-flex gap-2 justify-content-center">
          <button class="btn btn-sm btn-warning" onclick="mostrarModalEditarTarea(${t.id})">Editar</button>
          <button class="btn btn-sm btn-danger" onclick="eliminarTareaAdmin(${t.id})">Eliminar</button>
        </div>
      `;
      } else if (t.estado_tarea === "INICIADA") {
        acciones = `<span class="badge bg-info text-dark">Iniciada</span>`;
      } else if (t.estado_tarea === "TERMINADA") {
        acciones = `<span class="badge bg-success">Terminada</span>`;
      }
      html += `
    <tr>
      <td>${t.titulo}</td>
      <td>${t.descripcion}</td>
      <td>${t.fecha_vencimiento || ""}</td>
      <td>${t.prioridad || ""}</td>
      <td>${t.lugar || ""}</td>
      <td>${t.cantidad_horas || ""}</td>
      <td>
        ${
          t.imagen_ruta
            ? `<img src="http://localhost:3000/uploads/${t.imagen_ruta}" alt="Imagen" style="max-width:60px;max-height:60px;">`
            : ""
        }
      </td>
      <td>${t.usuarioId || ""}</td>
      <td>${t.createdAt ? new Date(t.createdAt).toLocaleString() : ""}</td>
      <td>${t.updatedAt ? new Date(t.updatedAt).toLocaleString() : ""}</td>
      <td>${acciones}</td>
    </tr>
  `;
    });

    html += "</tbody></table></div>";
    container.innerHTML = html;
  } catch (err) {
    document.getElementById("adminTareasContainer").innerHTML = "<p>Error al cargar las tareas. Intenta recargar la página o cerrar sesión.</p>";
  }
};

// Filtrar tareas (igual que antes)
window.filtrarTareasAdmin = function () {
  const filtro = document.getElementById("filtroTarea").value;
  window.renderTareasAdmin(filtro);
};

// Mostrar modal de edición con datos precargados
window.mostrarModalEditarTarea = function(id) {
  // Busca la tarea en la tabla actual (ya cargada)
  fetchTareas().then(tareas => {
    const tarea = tareas.find(t => t.id === id);
    if (!tarea) {
      alert("Tarea no encontrada.");
      return;
    }
    // Llena los campos de la modal de edición (debes tener una modal similar a la de crear)
    document.getElementById("editarTareaId").value = tarea.id;
    document.getElementById("editarTituloTarea").value = tarea.titulo;
    document.getElementById("editarDescripcionTarea").value = tarea.descripcion;
    document.getElementById("editarFechaVencimientoTarea").value = tarea.fecha_vencimiento;
    document.getElementById("editarPrioridadTarea").value = tarea.prioridad;
    document.getElementById("editarLugarTarea").value = tarea.lugar;
    document.getElementById("editarHorasTarea").value = tarea.cantidad_horas;
    document.getElementById("editarUsuarioAsignadoTarea").value = tarea.usuarioId;
    // No precargar imagen por seguridad, pero puedes mostrar el nombre actual si quieres

    // Mostrar la modal
    const modal = new bootstrap.Modal(document.getElementById("modalEditarTarea"));
    modal.show();
    renderSelectUsuariosEditar(); // Para llenar el select de usuarios en edición
  });
};

// Enviar PATCH para editar tarea
window.editarTareaAdmin = async function(event) {
  event.preventDefault();
  const token = localStorage.getItem("token");
  const id = document.getElementById("editarTareaId").value;
  const titulo = document.getElementById("editarTituloTarea").value.trim();
  const descripcion = document.getElementById("editarDescripcionTarea").value.trim();
  const fecha_vencimiento = document.getElementById("editarFechaVencimientoTarea").value;
  const prioridad = document.getElementById("editarPrioridadTarea").value;
  const lugar = document.getElementById("editarLugarTarea").value.trim();
  const cantidad_horas = document.getElementById("editarHorasTarea").value;
  const usuarioId = document.getElementById("editarUsuarioAsignadoTarea").value;
  const imagenInput = document.getElementById("editarImagenTarea");

  const formData = new FormData();
  formData.append("titulo", titulo);
  formData.append("descripcion", descripcion);
  formData.append("fecha_vencimiento", fecha_vencimiento);
  formData.append("prioridad", prioridad);
  formData.append("lugar", lugar);
  formData.append("cantidad_horas", cantidad_horas);
  formData.append("usuarioId", usuarioId);

  if (imagenInput && imagenInput.files[0]) {
    formData.append("imagen", imagenInput.files[0]);
  }

  try {
    const response = await fetch(`http://localhost:3000/api/tareas/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`
        // No pongas Content-Type aquí
      },
      body: formData
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || "No se pudo editar la tarea.");
      return;
    }
    // Cierra la modal y recarga la tabla
    const modal = bootstrap.Modal.getInstance(document.getElementById("modalEditarTarea"));
    if (modal) modal.hide();
    window.renderTareasAdmin();
    event.target.reset();
  } catch (err) {
    alert("Error al editar la tarea.");
  }
};

// Renderiza el select de usuarios en la modal de editar tarea
window.renderSelectUsuariosEditar = async function () {
  const select = document.getElementById("editarUsuarioAsignadoTarea");
  select.innerHTML = '<option value="">Asignar a usuario</option>';
  try {
    const usuarios = await fetchUsuarios();
    usuarios.forEach((u) => {
      select.innerHTML += `<option value="${u.id}">${u.nombre}</option>`;
    });
  } catch (err) {
    select.innerHTML = '<option value="">Error al cargar usuarios</option>';
  }
};

window.eliminarTareaAdmin = async function(id) {
  if (!confirm("¿Seguro que deseas eliminar esta tarea?")) return;
  const token = localStorage.getItem("token");
  try {
    const response = await fetch(`http://localhost:3000/api/tareas/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.error || data.mensaje || "No se pudo eliminar la tarea.");
      return;
    }
    window.renderTareasAdmin();
  } catch (err) {
    alert("Error al eliminar la tarea.");
  }
};