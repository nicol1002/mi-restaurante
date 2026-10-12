// =====================================================
//  Café Aroma - app.js
//  1. Validación del formulario de reservas
//  2. Interfaz: menú responsive y modo claro / oscuro
//  3. Carrito de compras básico
//  4. Registro e ingreso de clientes
// =====================================================

// ---------- 1. FORMULARIO DE RESERVAS ----------

const formulario = document.getElementById("form-reserva");
const mensajeError = document.getElementById("mensaje-error");

formulario.addEventListener("submit", function (evento) {
  evento.preventDefault();

  const nombre = document.getElementById("nombre").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const personas = document.getElementById("personas").value;

  if (nombre === "") {
    mensajeError.style.color = "#b03030";
    mensajeError.textContent = "Por favor escribe tu nombre.";
    return;
  }

  if (correo === "" || !correo.includes("@")) {
    mensajeError.style.color = "#b03030";
    mensajeError.textContent = "Por favor escribe un correo válido.";
    return;
  }

  if (personas === "" || personas <= 0) {
    mensajeError.style.color = "#b03030";
    mensajeError.textContent = "El número de personas debe ser mayor a 0.";
    return;
  }

  mensajeError.textContent = "";
  mensajeError.style.color = "green";
  mensajeError.textContent = "¡Reserva enviada con éxito, " + nombre + "!";
});


// ---------- 2. INTERFAZ ----------

// Menú responsive: abre y cierra el menú en pantallas pequeñas
const botonMenu = document.getElementById("btn-menu");
const menuNav = document.getElementById("menu-nav");

botonMenu.addEventListener("click", function () {
  const abierto = menuNav.classList.toggle("abierto");
  botonMenu.setAttribute("aria-expanded", abierto);
});

// Al elegir un enlace, el menú móvil se cierra
menuNav.querySelectorAll("a").forEach(function (enlace) {
  enlace.addEventListener("click", function () {
    menuNav.classList.remove("abierto");
    botonMenu.setAttribute("aria-expanded", "false");
  });
});

// Modo claro / oscuro: alterna la clase "oscuro" en el <body>
const botonTema = document.getElementById("btn-tema");

function aplicarTema(oscuro) {
  document.body.classList.toggle("oscuro", oscuro);
  botonTema.textContent = oscuro ? "☀️" : "🌙";
  try {
    localStorage.setItem("cafe-aroma-tema", oscuro ? "oscuro" : "claro");
  } catch (error) {
    // Si no se puede guardar, el tema funciona igual durante la visita
  }
}

botonTema.addEventListener("click", function () {
  aplicarTema(!document.body.classList.contains("oscuro"));
});

try {
  aplicarTema(localStorage.getItem("cafe-aroma-tema") === "oscuro");
} catch (error) {
  aplicarTema(false);
}


// ---------- 3. CARRITO DE COMPRAS ----------

const CLAVE_CARRITO = "cafe-aroma-carrito";

// Cada item del carrito: { id, nombre, precio, cantidad }
let carrito = cargarCarrito();

const panelCarrito = document.getElementById("carrito");
const fondoCarrito = document.getElementById("fondo-carrito");
const botonCarrito = document.getElementById("btn-carrito");
const contadorCarrito = document.getElementById("contador-carrito");
const listaCarrito = document.getElementById("lista-carrito");
const textoVacio = document.getElementById("carrito-vacio");
const totalCarrito = document.getElementById("total-carrito");
const mensajeCarrito = document.getElementById("mensaje-carrito");

// Formatea un número como pesos colombianos: 4500 -> "$4.500"
function formatearPrecio(valor) {
  return "$" + valor.toLocaleString("es-CO");
}

// El carrito se guarda en el navegador para que sobreviva a una recarga
function cargarCarrito() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_CARRITO));
    return Array.isArray(guardado) ? guardado : [];
  } catch (error) {
    return [];
  }
}

function guardarCarrito() {
  try {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito));
  } catch (error) {
    // Si no se puede guardar, el carrito sigue funcionando en memoria
  }
}

// Crea un botón pequeño con texto, clase y atributo de acción
function crearBoton(texto, clase, etiqueta) {
  const boton = document.createElement("button");
  boton.type = "button";
  boton.className = clase;
  boton.textContent = texto;
  if (etiqueta) boton.setAttribute("aria-label", etiqueta);
  return boton;
}

// Agregar al carrito: si el producto ya existe, suma una unidad
function agregarProducto(producto) {
  const existente = carrito.find(function (item) {
    return item.id === producto.id;
  });

  if (existente) {
    existente.cantidad++;
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1,
    });
  }

  actualizarCarrito();
}

function cambiarCantidad(id, cambio) {
  const item = carrito.find(function (i) {
    return i.id === id;
  });
  if (!item) return;

  item.cantidad += cambio;
  if (item.cantidad <= 0) {
    eliminarProducto(id);
    return;
  }
  actualizarCarrito();
}

// Eliminar: quita el producto del carrito y el total se recalcula sin él
function eliminarProducto(id) {
  carrito = carrito.filter(function (item) {
    return item.id !== id;
  });
  actualizarCarrito();
}

// Vaciar Carrito: borra todo y el total vuelve a $0
function vaciarCarrito() {
  carrito = [];
  actualizarCarrito();
}

// Renderizado dinámico: crea los nodos HTML de cada producto y calcula el total
function actualizarCarrito() {
  listaCarrito.innerHTML = "";

  let total = 0; // acumulador del valor a pagar
  let cantidadTotal = 0;

  carrito.forEach(function (item) {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;
    cantidadTotal += item.cantidad;

    const li = document.createElement("li");
    li.dataset.id = item.id;

    const nombre = document.createElement("span");
    nombre.className = "item-nombre";
    nombre.textContent = item.nombre;

    const precioItem = document.createElement("span");
    precioItem.className = "item-subtotal";
    precioItem.textContent = formatearPrecio(subtotal);

    const controles = document.createElement("div");
    controles.className = "item-controles";

    const cantidad = document.createElement("span");
    cantidad.textContent = item.cantidad;

    controles.appendChild(crearBoton("−", "btn-menos", "Quitar una unidad"));
    controles.appendChild(cantidad);
    controles.appendChild(crearBoton("+", "btn-mas", "Agregar una unidad"));
    controles.appendChild(crearBoton("Eliminar", "btn-quitar"));

    li.appendChild(nombre);
    li.appendChild(precioItem);
    li.appendChild(controles);
    listaCarrito.appendChild(li);
  });

  contadorCarrito.textContent = cantidadTotal;
  totalCarrito.textContent = formatearPrecio(total);
  textoVacio.style.display = carrito.length === 0 ? "block" : "none";

  guardarCarrito();
}

function abrirCarrito() {
  panelCarrito.classList.add("abierto");
  fondoCarrito.classList.add("abierto");
  panelCarrito.setAttribute("aria-hidden", "false");
}

function cerrarCarrito() {
  panelCarrito.classList.remove("abierto");
  fondoCarrito.classList.remove("abierto");
  panelCarrito.setAttribute("aria-hidden", "true");
}

// Botones "Agregar al carrito": leen los data-id, data-nombre y data-precio
document.querySelectorAll(".btn-agregar").forEach(function (boton) {
  boton.addEventListener("click", function () {
    agregarProducto({
      id: boton.dataset.id,
      nombre: boton.dataset.nombre,
      precio: Number(boton.dataset.precio),
    });

    mensajeCarrito.textContent = "";

    // Pequeña confirmación visual en el botón
    boton.textContent = "¡Agregado!";
    setTimeout(function () {
      boton.textContent = "Agregar al carrito";
    }, 900);
  });
});

// Botones + / − / Eliminar dentro del carrito (un solo listener para toda la lista)
listaCarrito.addEventListener("click", function (evento) {
  const boton = evento.target.closest("button");
  if (!boton) return;

  const id = boton.closest("li").dataset.id;

  if (boton.classList.contains("btn-mas")) cambiarCantidad(id, 1);
  if (boton.classList.contains("btn-menos")) cambiarCantidad(id, -1);
  if (boton.classList.contains("btn-quitar")) eliminarProducto(id);
});

botonCarrito.addEventListener("click", abrirCarrito);
document.getElementById("cerrar-carrito").addEventListener("click", cerrarCarrito);
fondoCarrito.addEventListener("click", cerrarCarrito);

document.addEventListener("keydown", function (evento) {
  if (evento.key === "Escape") cerrarCarrito();
});

document.getElementById("btn-vaciar").addEventListener("click", function () {
  vaciarCarrito();
  mensajeCarrito.textContent = "";
});

document.getElementById("btn-finalizar").addEventListener("click", function () {
  if (carrito.length === 0) {
    mensajeCarrito.style.color = "#b03030";
    mensajeCarrito.textContent = "Agrega al menos un producto a tu pedido.";
    return;
  }

  const total = carrito.reduce(function (suma, item) {
    return suma + item.precio * item.cantidad;
  }, 0);

  vaciarCarrito();
  mensajeCarrito.style.color = "green";
  const sesion = obtenerSesion();
  mensajeCarrito.textContent =
    "¡Pedido recibido por " + formatearPrecio(total) + "! Gracias por elegirnos" +
    (sesion ? ", " + sesion.nombre : "") + ".";
});

// Dibuja el carrito al cargar la página (recupera lo guardado)
actualizarCarrito();


// ---------- 4. REGISTRO E INGRESO DE CLIENTES ----------
// Nota: este sitio no tiene servidor, así que las cuentas se guardan en el
// navegador (localStorage). Sirve para practicar y para la demo; en un sitio
// real los usuarios y contraseñas deben guardarse en un backend con base de datos.

const CLAVE_USUARIOS = "cafe-aroma-usuarios";
const CLAVE_SESION = "cafe-aroma-sesion";

const modalCuenta = document.getElementById("modal-cuenta");
const botonCuenta = document.getElementById("btn-cuenta");
const tabRegistro = document.getElementById("tab-registro");
const tabIngreso = document.getElementById("tab-ingreso");
const formRegistro = document.getElementById("form-registro");
const formIngreso = document.getElementById("form-ingreso");
const panelSesion = document.getElementById("panel-sesion");
const mensajeRegistro = document.getElementById("mensaje-registro");
const mensajeIngreso = document.getElementById("mensaje-ingreso");

function cargarUsuarios() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_USUARIOS));
    return Array.isArray(guardado) ? guardado : [];
  } catch (error) {
    return [];
  }
}

function guardarUsuarios(usuarios) {
  try {
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
    return true;
  } catch (error) {
    return false;
  }
}

// Devuelve el usuario con sesión iniciada (o null)
function obtenerSesion() {
  try {
    const correo = localStorage.getItem(CLAVE_SESION);
    if (!correo) return null;
    return (
      cargarUsuarios().find(function (u) {
        return u.correo === correo;
      }) || null
    );
  } catch (error) {
    return null;
  }
}

// La contraseña nunca se guarda en texto plano: se guarda su hash SHA-256 con una "sal" aleatoria
async function hashClave(clave, sal) {
  const texto = sal + clave;
  if (window.crypto && window.crypto.subtle) {
    const bytes = new TextEncoder().encode(texto);
    const resumen = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(resumen))
      .map(function (b) {
        return b.toString(16).padStart(2, "0");
      })
      .join("");
  }
  // Respaldo para navegadores sin crypto.subtle (por ejemplo, páginas sin HTTPS)
  let hash = 5381;
  for (let i = 0; i < texto.length; i++) {
    hash = ((hash << 5) + hash + texto.charCodeAt(i)) | 0;
  }
  return "d" + hash;
}

function crearSal() {
  const arreglo = new Uint8Array(16);
  crypto.getRandomValues(arreglo);
  return Array.from(arreglo)
    .map(function (b) {
      return b.toString(16).padStart(2, "0");
    })
    .join("");
}

function correoValido(correo) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
}

function mostrarMensaje(elemento, texto, esError) {
  elemento.style.color = esError ? "#b03030" : "green";
  elemento.textContent = texto;
}

// Cambia entre las pestañas "Registrarme" e "Ingresar"
function mostrarPestana(cual) {
  const registro = cual === "registro";
  formRegistro.hidden = !registro;
  formIngreso.hidden = registro;
  tabRegistro.classList.toggle("activa", registro);
  tabIngreso.classList.toggle("activa", !registro);
  tabRegistro.setAttribute("aria-selected", registro);
  tabIngreso.setAttribute("aria-selected", !registro);
  mensajeRegistro.textContent = "";
  mensajeIngreso.textContent = "";
}

// Actualiza el botón del encabezado, el panel de sesión y el formulario de reservas
function actualizarSesion() {
  const usuario = obtenerSesion();
  const tabs = document.querySelector(".cuenta-pestanas");

  if (usuario) {
    botonCuenta.textContent = "👤 " + usuario.nombre.split(" ")[0];
    document.getElementById("sesion-nombre").textContent = usuario.nombre;
    document.getElementById("sesion-correo").textContent = usuario.correo;
    tabs.hidden = true;
    formRegistro.hidden = true;
    formIngreso.hidden = true;
    panelSesion.hidden = false;

    // Completa la reserva con los datos del cliente
    document.getElementById("nombre").value = usuario.nombre;
    document.getElementById("correo").value = usuario.correo;
  } else {
    botonCuenta.textContent = "👤 Ingresar";
    tabs.hidden = false;
    panelSesion.hidden = true;
    mostrarPestana("registro");
  }
}

function iniciarSesion(correo) {
  try {
    localStorage.setItem(CLAVE_SESION, correo);
  } catch (error) {
    // Si no se puede guardar, la sesión dura solo hasta recargar
  }
  actualizarSesion();
}

formRegistro.addEventListener("submit", async function (evento) {
  evento.preventDefault();

  const nombre = document.getElementById("reg-nombre").value.trim();
  const correo = document.getElementById("reg-correo").value.trim().toLowerCase();
  const telefono = document.getElementById("reg-telefono").value.trim();
  const clave = document.getElementById("reg-clave").value;
  const clave2 = document.getElementById("reg-clave2").value;

  if (nombre.length < 3) {
    mostrarMensaje(mensajeRegistro, "Escribe tu nombre completo.", true);
    return;
  }
  if (!correoValido(correo)) {
    mostrarMensaje(mensajeRegistro, "Escribe un correo válido.", true);
    return;
  }
  if (telefono !== "" && !/^[0-9+\s-]{7,15}$/.test(telefono)) {
    mostrarMensaje(mensajeRegistro, "El teléfono solo puede tener números (7 a 15 dígitos).", true);
    return;
  }
  if (clave.length < 6) {
    mostrarMensaje(mensajeRegistro, "La contraseña debe tener mínimo 6 caracteres.", true);
    return;
  }
  if (clave !== clave2) {
    mostrarMensaje(mensajeRegistro, "Las contraseñas no coinciden.", true);
    return;
  }

  const usuarios = cargarUsuarios();
  const yaExiste = usuarios.some(function (u) {
    return u.correo === correo;
  });
  if (yaExiste) {
    mostrarMensaje(mensajeRegistro, "Ya hay una cuenta con ese correo. Prueba a ingresar.", true);
    return;
  }

  const sal = crearSal();
  usuarios.push({
    nombre: nombre,
    correo: correo,
    telefono: telefono,
    sal: sal,
    clave: await hashClave(clave, sal),
    creado: new Date().toISOString(),
  });

  if (!guardarUsuarios(usuarios)) {
    mostrarMensaje(mensajeRegistro, "No se pudo guardar la cuenta en este navegador.", true);
    return;
  }

  formRegistro.reset();
  iniciarSesion(correo);
});

formIngreso.addEventListener("submit", async function (evento) {
  evento.preventDefault();

  const correo = document.getElementById("ing-correo").value.trim().toLowerCase();
  const clave = document.getElementById("ing-clave").value;

  const usuario = cargarUsuarios().find(function (u) {
    return u.correo === correo;
  });

  // Mismo mensaje si falla el correo o la clave, para no revelar qué correos existen
  if (!usuario || (await hashClave(clave, usuario.sal)) !== usuario.clave) {
    mostrarMensaje(mensajeIngreso, "Correo o contraseña incorrectos.", true);
    return;
  }

  formIngreso.reset();
  iniciarSesion(correo);
});

document.getElementById("btn-salir").addEventListener("click", function () {
  try {
    localStorage.removeItem(CLAVE_SESION);
  } catch (error) {
    // nada que hacer
  }
  document.getElementById("nombre").value = "";
  document.getElementById("correo").value = "";
  actualizarSesion();
});

tabRegistro.addEventListener("click", function () {
  mostrarPestana("registro");
});
tabIngreso.addEventListener("click", function () {
  mostrarPestana("ingreso");
});

botonCuenta.addEventListener("click", function () {
  modalCuenta.showModal();
});
document.getElementById("cerrar-cuenta").addEventListener("click", function () {
  modalCuenta.close();
});
// Clic fuera de la tarjeta cierra el modal
modalCuenta.addEventListener("click", function (evento) {
  if (evento.target === modalCuenta) modalCuenta.close();
});

// Al cargar la página, recupera la sesión si existía
actualizarSesion();
