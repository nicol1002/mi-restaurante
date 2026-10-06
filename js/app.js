// =====================================================
//  Café Aroma - app.js
//  1. Validación del formulario de reservas
//  2. Interfaz: menú responsive y modo claro / oscuro
//  3. Carrito de compras básico
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
  mensajeCarrito.textContent =
    "¡Pedido recibido por " + formatearPrecio(total) + "! Gracias por elegirnos.";
});

// Dibuja el carrito al cargar la página (recupera lo guardado)
actualizarCarrito();
