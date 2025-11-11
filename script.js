// ============================
// RepuestOnline - script.js (con registro + campos dinámicos)
// ============================

// Productos
const productos = [
  { id: 1, nombre: 'Filtro de aceite Bosch', precio: 85, img: 'img/filtro.jpg' },
  { id: 2, nombre: 'Batería ACDelco 12V', precio: 950, img: 'img/bateria.jpg' },
  { id: 3, nombre: 'Pastillas de freno delanteras', precio: 420, img: 'img/pastillas.jpg' },
  { id: 4, nombre: 'Llantas Michelin 17"', precio: 1100, img: 'img/llantas.jpg' },
  { id: 5, nombre: 'Aceite sintético 5W-30', precio: 250, img: 'img/aceite.jpg' },
  { id: 6, nombre: 'Amortiguadores', precio: 350, img: 'img/amortiguadores.jpg' },
  { id: 7, nombre: 'Motor de Mazda', precio: 2500, img: 'img/motor.jpg' },
  { id: 8, nombre: 'Cigüeñal', precio: 500, img: 'img/cigueñal.jpg' }
];

// Estado
const cart = new Map(); // id -> {producto, cantidad}
let logged = false;

// Helpers
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const fmtQ = (n) => `Q${n.toFixed(2)}`;

// Render catálogo
function renderProductos() {
  const cont = $("#productList");
  cont.innerHTML = "";
  productos.forEach((p) => {
    const div = document.createElement("div");
    div.className = "card";
    div.innerHTML = `
      <img src="${p.img}" alt="${p.nombre}">
      <div class="info">
        <h3>${p.nombre}</h3>
        <p>${fmtQ(p.precio)}</p>
        <label>Cant: <input type="number" id="qty-${p.id}" min="1" value="1" style="width:70px"></label><br>
        <button data-add="${p.id}" ${!logged ? "disabled" : ""}>Agregar</button>
      </div>`;
    cont.appendChild(div);
  });
}

// Login UI
function updateLoginUI() {
  $("#estadoLogin").textContent = logged ? "Sesión activa" : "No has iniciado sesión";
  $("#btnSalir").disabled = !logged;
  $("#carrito").classList.toggle("hidden", !logged);
  $$("[data-add]").forEach((b) => (b.disabled = !logged));
}

// Carrito
function addToCart(id) {
  const prod = productos.find((x) => x.id === id);
  const qty = Math.max(1, parseInt($("#qty-" + id).value || "1", 10));
  const item = cart.get(id) || { producto: prod, cantidad: 0 };
  item.cantidad += qty;
  cart.set(id, item);
  alert(`${qty} × "${prod.nombre}" agregado(s) al carrito`);
}

function envioCosto() {
  const sel = $("#envio");
  if (!sel) return 25;
  return sel.value === "express" ? 45 : sel.value === "pickup" ? 0 : 25;
}

function renderCart() {
  const body = $("#cartBody");
  body.innerHTML = "";
  let subtotal = 0;

  cart.forEach(({ producto, cantidad }) => {
    const sub = producto.precio * cantidad;
    subtotal += sub;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${producto.nombre}</td>
      <td>${fmtQ(producto.precio)}</td>
      <td>${cantidad}</td>
      <td>${fmtQ(sub)}</td>`;
    body.appendChild(tr);
  });

  const iva = subtotal * 0.12;
  const envio = envioCosto();
  $("#subTotal").textContent = fmtQ(subtotal);
  $("#iva").textContent = fmtQ(iva);
  $("#envioCosto").textContent = fmtQ(envio);
  $("#total").textContent = fmtQ(subtotal + iva + envio);
  $("#resultadoCheckout").textContent = "";
}

// Dinámica: campos extra (tarjeta / dirección)
function renderDatosExtra() {
  const metodoPago = (document.querySelector('input[name="pago"]:checked') || {}).value;
  const tipoEnvio = $("#envio")?.value;
  const datosExtra = $("#datosExtra");
  if (!datosExtra) return;

  let html = "";

  if (metodoPago === "tarjeta") {
    html += `
      <div class="panel">
        <h4>Datos de la tarjeta</h4>
        <label>Número de tarjeta:
          <input type="text" id="numTarjeta" maxlength="16" placeholder="0000 0000 0000 0000">
        </label>
        <label>Fecha de vencimiento:
          <input type="month" id="vencimiento">
        </label>
        <label>CVV:
          <input type="password" id="cvv" maxlength="3" placeholder="123">
        </label>
      </div>
    `;
  }

  if (tipoEnvio !== "pickup") {
    html += `
      <div class="panel">
        <h4>Dirección de entrega</h4>
        <label>Dirección exacta:
          <textarea id="direccion" rows="2" style="width:100%" placeholder="Ej. 3ra calle 10-45 zona 10, Ciudad de Guatemala"></textarea>
        </label>
      </div>
    `;
  }

  datosExtra.innerHTML = html;
}

// Eventos
document.addEventListener("DOMContentLoaded", () => {
  renderProductos();
  updateLoginUI();

  // Agregar producto
  $("#catalogo").addEventListener("click", (e) => {
    if (e.target.dataset.add) addToCart(parseInt(e.target.dataset.add));
  });

  // Ver detalle
  $("#btnVerCarrito").addEventListener("click", () => {
    $("#detalleCarrito").classList.toggle("hidden");
    renderCart();
    renderDatosExtra();
  });

  // Vaciar
  $("#btnVaciar").addEventListener("click", () => {
    cart.clear();
    renderCart();
    renderDatosExtra();
  });

  // Cambios en envío o método de pago → actualizar campos extra y totales
  document.addEventListener("change", (e) => {
    if (e.target.id === "envio" || e.target.name === "pago") {
      renderCart();
      renderDatosExtra();
    }
  });

  // ===== Registro de usuario =====
  $("#btnRegistrar").addEventListener("click", () => {
    const nombre = $("#regNombre").value.trim();
    const correo = $("#regCorreo").value.trim();
    const pass = $("#regPass").value.trim();

    if (!nombre || !correo || !pass) {
      alert("Por favor, completa todos los campos del registro.");
      return;
    }

    const userData = { nombre, correo, pass };
    localStorage.setItem("usuarioRegistrado", JSON.stringify(userData));
    alert("Registro exitoso. Ahora puedes iniciar sesión con tu cuenta.");

    $("#regNombre").value = "";
    $("#regCorreo").value = "";
    $("#regPass").value = "";
  });

  // ===== Login =====
  $("#btnLogin").addEventListener("click", () => {
    const u = $("#user").value.trim();
    const p = $("#pass").value.trim();
    const registrado = JSON.parse(localStorage.getItem("usuarioRegistrado"));

    const okAlumno = (u === "alumno" && p === "2025");
    const okRegistrado = (registrado && registrado.correo === u && registrado.pass === p);

    if (okAlumno || okRegistrado) {
      logged = true;
      updateLoginUI();
      renderProductos();
      alert("Bienvenido " + (okRegistrado ? registrado.nombre : "alumno") + ".");
      location.hash = "#catalogo";
    } else {
      alert("Usuario o contraseña incorrectos.");
    }
  });

  // Logout
  $("#btnSalir").addEventListener("click", () => {
    logged = false;
    updateLoginUI();
    renderProductos();
    alert("Has cerrado sesión.");
  });

  // Concluir compra
  $("#btnPagar").addEventListener("click", () => {
    if (cart.size === 0) { alert("Carrito vacío."); return; }
    if (!$("#terminos").checked) { alert("Debes aceptar los términos y condiciones."); return; }

    renderCart();

    const pago = (document.querySelector('input[name="pago"]:checked') || {}).value || "tarjeta";
    const total = $("#total").textContent;
    const envioSel = $("#envio").value;
    const notas = $("#notas").value.trim();

    const direccion = $("#direccion")?.value || "No aplica";
    const numTarjeta = $("#numTarjeta")?.value || "";
    const venc = $("#vencimiento")?.value || "";
    const cvv = $("#cvv")?.value || "";

    // Validaciones mínimas de demostración
    if (pago === "tarjeta" && (!numTarjeta || !venc || !cvv)) {
      alert("Completa los datos de la tarjeta.");
      return;
    }
    if (envioSel !== "pickup" && (!direccion || direccion.length < 6)) {
      alert("Ingresa una dirección válida para la entrega.");
      return;
    }

    $("#resultadoCheckout").innerHTML = `
      <div class="panel">
        ✔️ <b>Compra finalizada</b><br>
        Método de pago: <b>${pago}</b><br>
        Tipo de envío: <b>${envioSel}</b><br>
        Total a pagar: <b>${total}</b><br>
        ${envioSel !== "pickup" ? `Dirección: ${direccion}<br>` : ""}
        ${pago === "tarjeta" ? `Tarjeta: **** **** **** ${numTarjeta.slice(-4)}<br>` : ""}
        ${notas ? `Notas: <i>${notas}</i><br>` : ""}
      </div>
    `;
    alert("¡Gracias por tu compra!");
  });

  // ===== Header transparente estable =====
  const header = document.querySelector("header");
  const onScroll = () => {
    if (window.scrollY > 50) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  };
  window.addEventListener("scroll", onScroll);
  onScroll();
});
