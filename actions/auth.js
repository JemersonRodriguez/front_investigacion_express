// Simulación de usuarios registrados
const usuariosDB = [
  { username: "admin", password: "admin123", rol: "admin" },
  { username: "usuario", password: "usuario123", rol: "usuario" }
];

// Simulación de fetch para login
function VerifyUser(username, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const user = usuariosDB.find(
        u => u.username === username && u.password === password
      );
      if (user) {
        resolve({ success: true, rol: user.rol });
      } else {
        reject({ success: false, message: "Usuario o contraseña incorrectos" });
      }
    }, 100); // Simula retardo de red
  });
}

// Manejo del login
window.Login = async function () {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const res = await VerifyUser(username, password);
    document.getElementById("loginView").hidden = true;
    if (res.rol === "admin") {
      document.getElementById("adminView").hidden = false;
      document.getElementById("usuarioView").hidden = true;
      window.renderTareasAdmin();
    } else if (res.rol === "usuario") {
      document.getElementById("usuarioView").hidden = false;
      document.getElementById("adminView").hidden = true;
      window.renderTareasUsuario(username);
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
};