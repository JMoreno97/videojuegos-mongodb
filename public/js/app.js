// Función para mostrar mensajes de error
function mostrarError(mensaje, detalles = "") {
  const videojuegosLista = document.getElementById("videojuegosLista");
  videojuegosLista.innerHTML = `
        <div class="alert alert-danger">
            <h4>Error</h4>
            <p>${mensaje}</p>
            ${detalles ? `<hr><p>${detalles}</p>` : ""}
        </div>
    `;
}

// Función para mostrar estado de carga
function mostrarCargando() {
  const videojuegosLista = document.getElementById("videojuegosLista");
  videojuegosLista.innerHTML = `
        <div class="spinner"></div>
    `;
}

// Función para cargar los géneros
async function cargarGeneros() {
  console.log("Cargando géneros...");
  try {
    const response = await fetch("/api/generos");
    console.log("Respuesta de géneros:", response);
    const generos = await response.json();
    console.log("Géneros recibidos:", generos);

    const generoSelect = document.getElementById("genero");
    generoSelect.innerHTML = '<option value="">Todos los géneros</option>';

    generos.forEach((genero) => {
      const option = document.createElement("option");
      option.value = genero.nombre;
      option.textContent = genero.nombre;
      generoSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar géneros:", error);
    mostrarError("Error al cargar los géneros", error.message);
  }
}

// Función para cargar las plataformas
async function cargarPlataformas() {
  console.log("Cargando plataformas...");
  try {
    const response = await fetch("/api/plataformas");
    console.log("Respuesta de plataformas:", response);
    const plataformas = await response.json();
    console.log("Plataformas recibidas:", plataformas);

    const plataformaSelect = document.getElementById("plataforma");
    plataformaSelect.innerHTML =
      '<option value="">Todas las plataformas</option>';

    plataformas.forEach((plataforma) => {
      const option = document.createElement("option");
      option.value = plataforma.nombre;
      option.textContent = plataforma.nombre;
      plataformaSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error al cargar plataformas:", error);
    mostrarError("Error al cargar las plataformas", error.message);
  }
}

// Función para cargar los videojuegos
async function cargarVideojuegos(filtros = {}) {
  console.log("Cargando videojuegos...", filtros);
  try {
    const queryParams = new URLSearchParams(filtros);
    const response = await fetch(`/api/videojuegos?${queryParams}`);
    console.log("Respuesta de videojuegos:", response);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || "Error al cargar los videojuegos");
    }

    const videojuegos = await response.json();
    console.log("Videojuegos recibidos:", videojuegos);

    const videojuegosLista = document.getElementById("videojuegosLista");

    if (videojuegos.length === 0) {
      videojuegosLista.innerHTML = `
        <div class="alert alert-info">
          No se encontraron videojuegos con los filtros seleccionados.
        </div>
      `;
      return;
    }

    videojuegosLista.innerHTML = "";

    videojuegos.forEach((videojuego) => {
      console.log("Procesando videojuego:", videojuego);
      const col = document.createElement("div");
      col.className = "videojuego-card";

      col.innerHTML = `
        <div class="videojuego-card-body">
          <h5 class="videojuego-card-title">${
            videojuego.titulo || "Sin título"
          }</h5>
          <p class="videojuego-card-text">
            <strong>Género:</strong> ${
              videojuego.genero?.nombre || "No especificado"
            }<br>
            <strong>Desarrollador:</strong> ${
              videojuego.desarrollador?.nombre || "No especificado"
            }<br>
            <strong>Edad mínima:</strong> ${
              videojuego.edad_minima || "No especificada"
            } años<br>
            <strong>Año:</strong> ${
              videojuego.anio_lanzamiento || "No especificado"
            }<br>
            <strong>Plataformas:</strong><br>
            ${
              videojuego.plataformas
                ?.map(
                  (plataforma) =>
                    `<span class="plataforma-tag">${plataforma.nombre}</span>`
                )
                .join(" ") || "No especificadas"
            }
          </p>
        </div>
        <div class="videojuego-card-footer">
          <small>${
            videojuego.disponible ? "Disponible" : "No disponible"
          }</small>
        </div>
      `;

      videojuegosLista.appendChild(col);
    });
  } catch (error) {
    console.error("Error al cargar videojuegos:", error);
    mostrarError("Error al cargar los videojuegos", error.message);
  }
}

// Inicialización cuando el DOM está listo
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM cargado, iniciando aplicación...");

  // Cargar datos iniciales
  cargarGeneros();
  cargarPlataformas();
  cargarVideojuegos();

  // Configurar el formulario de filtros
  const filtroForm = document.getElementById("filtroForm");
  if (filtroForm) {
    filtroForm.addEventListener("submit", function (e) {
      e.preventDefault();
      console.log("Formulario enviado");
      const formData = new FormData(e.target);
      const filtros = {
        titulo: formData.get("titulo"),
        genero: formData.get("genero"),
        plataforma: formData.get("plataforma"),
      };
      console.log("Filtros aplicados:", filtros);
      cargarVideojuegos(filtros);
    });
  } else {
    console.error("No se encontró el formulario de filtros");
  }
});
