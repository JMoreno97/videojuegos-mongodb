# Catálogo de Videojuegos con MongoDB

Este proyecto es una aplicación web que permite gestionar un catálogo de videojuegos utilizando MongoDB como base de datos. La aplicación está construida con Node.js y Express, siguiendo el patrón de diseño MVC.

## 🚀 Características

- Catálogo completo de videojuegos
- Filtrado por género, plataforma y título
- Gestión de desarrolladores
- Interfaz de usuario intuitiva y responsive
- Dos versiones del servidor:
  - Versión MVC (server.js)
  - Versión simplificada en un solo archivo (server2.js)

## 📋 Prerrequisitos

- Node.js (versión 14 o superior)
- MongoDB (versión 4.4 o superior)
- npm o yarn

## 🔧 Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/JMoreno97/videojuegos-mongodb.git
cd videojuegos-mongodb
```

2. Instala las dependencias:

```bash
npm install
```

3. Configura las variables de entorno:
   - Crea un archivo `.env` en la raíz del proyecto
   - Para la versión con MongoDB Atlas, añade:
     ```
     MONGODB_URI=tu_uri_de_mongodb_atlas
     ```
   - Para la versión local, no es necesario configurar variables de entorno

## 🚀 Uso

### Versión con MongoDB Atlas (server.js)

1. Inicia el servidor en modo producción:

```bash
npm start
```

2. Inicia el servidor en modo desarrollo (con recarga automática):

```bash
npm run dev
```

### Versión con MongoDB Local (server2.js)

1. Asegúrate de tener MongoDB instalado y corriendo localmente

2. Inicia el servidor en modo producción:

```bash
npm run start-local
```

3. Inicia el servidor en modo desarrollo (con recarga automática):

```bash
npm run dev-local
```

## 📁 Estructura del Proyecto

```
videojuegos-mongodb/
├── config/
│   └── database.js      # Configuración de la base de datos
├── public/
│   ├── css/
│   │   └── style.css    # Estilos de la aplicación
│   ├── js/
│   │   └── app.js       # Lógica del cliente
│   └── index.html       # Página principal
├── routes/
│   └── videojuegos.js   # Rutas de la API
├── server.js            # Servidor principal (MVC)
├── server2.js           # Servidor simplificado
├── .env                 # Variables de entorno
├── package.json         # Dependencias y scripts
└── README.md           # Documentación
```

## 📚 API Endpoints

### Videojuegos

- `GET /api/videojuegos` - Obtiene todos los videojuegos
  - Query params:
    - `genero`: Filtra por género
    - `plataforma`: Filtra por plataforma
    - `titulo`: Busca por título (búsqueda parcial)

### Géneros

- `GET /api/generos` - Obtiene todos los géneros

### Plataformas

- `GET /api/plataformas` - Obtiene todas las plataformas

### Desarrolladores

- `GET /api/desarrolladores` - Obtiene todos los desarrolladores

## 🛠️ Tecnologías Utilizadas

- Node.js
- Express.js
- MongoDB
- HTML5
- CSS3
- JavaScript (ES6+)


## 📝 Licencia

Este proyecto está bajo la Licencia ISC.

## ✨ Autor

- Jesús Moreno - [GitHub](https://github.com/JMoreno97)
