window.Login = async function () {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await fetch("http://localhost:3000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error de autenticación");
    }

    const data = await response.json();

    // Guardar token y rol en localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("rol", data.usuario.rol);
    localStorage.setItem("usuarioEmail", data.usuario.email);
    localStorage.setItem("usuarioNombre", data.usuario.nombre);

    document.getElementById("loginView").hidden = true;
    if (data.usuario.rol === "ADMIN") {
      document.getElementById("adminView").hidden = false;
      document.getElementById("usuarioView").hidden = true;
      window.renderTareasAdmin();
    } else if (data.usuario.rol === "USER" || data.usuario.rol === "usuario") {
      document.getElementById("usuarioView").hidden = false;
      document.getElementById("adminView").hidden = true;
      window.renderTareasUsuario(data.usuario.email);
    }
  } catch (err) {
    alert(err.message);
  }
};

// Cerrar sesión
window.logout = function () {
  document.getElementById("loginView").hidden = false;
  document.getElementById("adminView").hidden = true;
  document.getElementById("usuarioView").hidden = true;
  // Limpiar localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("rol");
  localStorage.removeItem("usuarioEmail");
  localStorage.removeItem("usuarioNombre");
};