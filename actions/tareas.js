// Simulación de usuarios registrados
let usuariosDBForTareas = [
  { username: "admin", password: "admin123", rol: "admin" },
  { username: "usuario", password: "usuario123", rol: "usuario" },
  { username: "jonaikel", password: "jonaikel123", rol: "usuario" }
];

// Simulación de tareas
let tareasDB = [
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

// Simula fetch para obtener usuarios
function fetchUsuarios() {
  return new Promise(resolve => setTimeout(() => resolve(usuariosDBForTareas.filter(u => u.rol === "usuario")), 200));
}

// Simula fetch para obtener tareas
function fetchTareas() {
  return new Promise(resolve => setTimeout(() => resolve([...tareasDB]), 200));
}

// Simula fetch para eliminar tarea
function eliminarTarea(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const idx = tareasDB.findIndex(t => t.id === id);
      if (idx !== -1) {
        tareasDB.splice(idx, 1);
        resolve({ success: true });
      } else {
        reject({ success: false, message: "Tarea no encontrada" });
      }
    }, 200);
  });
}

// Simula fetch para crear tarea
function crearTarea(tarea) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const usuarioExiste = usuariosDBForTareas.some(u => u.username === tarea.usuario);
      if (!usuarioExiste) {
        reject({ success: false, message: "Usuario no existe" });
        return;
      }
      tarea.id = tareasDB.length ? Math.max(...tareasDB.map(t => t.id)) + 1 : 1;
      tareasDB.push(tarea);
      resolve({ success: true, tarea });
    }, 200);
  });
}

// Renderiza la tabla de tareas para admin
window.renderTareasAdmin = async function (filtro = "") {
  const tareas = await fetchTareas();
  const container = document.getElementById("adminTareasContainer");
  let tareasFiltradas = tareas;
  if (filtro) {
    const f = filtro.toLowerCase();
    tareasFiltradas = tareas.filter(t =>
      t.titulo.toLowerCase().includes(f) || t.usuario.toLowerCase().includes(f)
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
          <th>Estado</th>
          <th>Prioridad</th>
          <th>Lugar</th>
          <th>Horas</th>
          <th>Usuario</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
  `;
  tareasFiltradas.forEach(t => {
    html += `
      <tr>
        <td>${t.titulo}</td>
        <td>${t.descripcion}</td>
        <td>${t.fechaVencimiento}</td>
        <td>${t.estado.charAt(0).toUpperCase() + t.estado.slice(1)}</td>
        <td>${t.prioridad}</td>
        <td>${t.lugar}</td>
        <td>${t.horas}</td>
        <td>${t.usuario}</td>
        <td>
          <button class="btn btn-danger btn-sm" onclick="eliminarTareaAdmin(${t.id})">Eliminar</button>
        </td>
      </tr>
    `;
  });
  html += "</tbody></table></div>";
  container.innerHTML = html;
};

// Eliminar tarea desde admin
window.eliminarTareaAdmin = async function(id) {
  if (!confirm("¿Seguro que deseas eliminar esta tarea?")) return;
  try {
    await eliminarTarea(id);
    window.renderTareasAdmin(document.getElementById("filtroTarea").value);
  } catch (err) {
    alert("No se pudo eliminar la tarea.");
  }
};

// Filtrar tareas
window.filtrarTareasAdmin = function() {
  const filtro = document.getElementById("filtroTarea").value;
  window.renderTareasAdmin(filtro);
};

// Llenar select de usuarios en el modal
window.llenarUsuariosSelect = async function() {
  const usuarios = await fetchUsuarios();
  const select = document.getElementById("usuarioAsignadoTarea");
  select.innerHTML = '<option value="">Asignar a usuario</option>';
  usuarios.forEach(u => {
    select.innerHTML += `<option value="${u.username}">${u.username}</option>`;
  });
};

// Mostrar usuarios en el select cada vez que se abre el modal
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modalCrearTarea");
  if (modal) {
    modal.addEventListener("show.bs.modal", window.llenarUsuariosSelect);
  }
});

// Crear tarea desde el formulario del modal
window.crearTareaAdmin = async function(event) {
  event.preventDefault();
  const tarea = {
    titulo: document.getElementById("tituloTarea").value.trim(),
    descripcion: document.getElementById("descripcionTarea").value.trim(),
    fechaVencimiento: document.getElementById("fechaVencimientoTarea").value,
    prioridad: document.getElementById("prioridadTarea").value,
    lugar: document.getElementById("lugarTarea").value.trim(),
    horas: parseInt(document.getElementById("horasTarea").value, 10),
    usuario: document.getElementById("usuarioAsignadoTarea").value,
    estado: "asignada"
  };
  try {
    await crearTarea(tarea);
    // Cierra el modal
    const modal = bootstrap.Modal.getInstance(document.getElementById("modalCrearTarea"));
    modal.hide();
    // Limpia el formulario
    event.target.reset();
    // Refresca la tabla
    window.renderTareasAdmin(document.getElementById("filtroTarea").value);
  } catch (err) {
    alert(err.message || "No se pudo crear la tarea.");
  }
};