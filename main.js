// Array donde se guardan todos los productos cargados desde el JSON
let productos = [];

// Array que representa el carrito de compras
let carrito = [];

// Variables para controlar el filtro activo y la búsqueda
let categoriaActiva = "todas";
let textoBusqueda = "";

// Al cargar la página, iniciamos la app
document.addEventListener("DOMContentLoaded", () => {
    cargarProductos();
    configurarEventos();
});


// CARGA DE PRODUCTOS


// Trae los productos del archivo JSON usando fetch
async function cargarProductos() {
    try {
        const respuesta = await fetch("data/products.json");
        productos = await respuesta.json();
        renderizarProductos(productos);
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error al cargar",
            text: "No se pudieron obtener los productos. Verificá que el archivo JSON esté en su lugar."
        });
    }
}


// EVENTOS


// Conecta todos los eventos de la interfaz
function configurarEventos() {
    // Clic en cada botón de categoría
    document.querySelectorAll(".btn-cat").forEach(btn => {
        btn.addEventListener("click", () => {
            // Quitamos el estilo activo del botón anterior
            document.querySelectorAll(".btn-cat").forEach(b => b.classList.remove("activo"));
            // Marcamos como activo el botón clickeado
            btn.classList.add("activo");
            categoriaActiva = btn.dataset.cat;
            filtrarYMostrar();
        });
    });

    // Escritura en la barra de búsqueda
    document.getElementById("buscador").addEventListener("input", (e) => {
        textoBusqueda = e.target.value.toLowerCase();
        filtrarYMostrar();
    });

    // Abrir y cerrar el carrito
    document.getElementById("btn-carrito").addEventListener("click", () => {
        document.getElementById("carrito").classList.toggle("oculto");
    });

    document.getElementById("btn-cerrar-carrito").addEventListener("click", () => {
        document.getElementById("carrito").classList.add("oculto");
    });

    // Finalizar compra
    document.getElementById("btn-comprar").addEventListener("click", finalizarCompra);
}


// FILTRADO


// Aplica el filtro de categoría y el texto de búsqueda, luego muestra los resultados
function filtrarYMostrar() {
    let resultado = productos;

    // Filtra por categoría si no está en "todas"
    if (categoriaActiva !== "todas") {
        resultado = resultado.filter(p => p.categoria === categoriaActiva);
    }

    // Filtra por texto de búsqueda
    if (textoBusqueda !== "") {
        resultado = resultado.filter(p => p.nombre.toLowerCase().includes(textoBusqueda));
    }

    renderizarProductos(resultado);
}

// Genera y muestra las tarjetas de productos en el DOM
function renderizarProductos(lista) {
    const contenedor = document.getElementById("contenedor-productos");
    contenedor.innerHTML = "";

    if (lista.length === 0) {
        contenedor.innerHTML = `<p class="sin-productos">No se encontraron productos.</p>`;
        return;
    }

    lista.forEach(producto => {
        const tarjeta = document.createElement("div");
        tarjeta.classList.add("tarjeta");

        // Si el producto tiene imagen la muestra, si no muestra un placeholder
        const imagenHTML = producto.imagen
            ? `<img src="imagenes/${producto.imagen}" alt="${producto.nombre}">`
            : `<div class="sin-imagen">Sin imagen</div>`;

        tarjeta.innerHTML = `
            ${imagenHTML}
            <h3>${producto.nombre}</h3>
            <p class="precio">$${producto.precio.toLocaleString("es-AR")}</p>
            <button data-id="${producto.id}">Agregar al carrito</button>
        `;

        // Evento del botón de cada tarjeta
        tarjeta.querySelector("button").addEventListener("click", () => {
            agregarAlCarrito(producto.id);
        });

        contenedor.appendChild(tarjeta);
    });
}


// LÓGICA DEL CARRITO


// Agrega un producto al carrito o suma una unidad si ya está
function agregarAlCarrito(id) {
    const producto = productos.find(p => p.id === id);
    const enCarrito = carrito.find(item => item.id === id);

    if (enCarrito) {
        enCarrito.cantidad++;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }

    actualizarCarrito();

    // Notificación tipo toast (sin bloquear la pantalla)
    Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Producto agregado al carrito",
        showConfirmButton: false,
        timer: 1500
    });
}

// Quita una unidad del producto; si llega a 0 lo elimina del carrito
function quitarDelCarrito(id) {
    const enCarrito = carrito.find(item => item.id === id);

    if (enCarrito.cantidad > 1) {
        enCarrito.cantidad--;
    } else {
        carrito = carrito.filter(item => item.id !== id);
    }

    actualizarCarrito();
}

// Actualiza el panel del carrito: items, cantidad total y precio total
function actualizarCarrito() {
    const contenedor = document.getElementById("items-carrito");
    const spanCantidad = document.getElementById("cant-carrito");
    const spanTotal = document.getElementById("total-precio");

    contenedor.innerHTML = "";

    if (carrito.length === 0) {
        contenedor.innerHTML = `<p style="text-align:center; color:#aaa; padding: 20px 0;">El carrito está vacío.</p>`;
    } else {
        carrito.forEach(item => {
            const div = document.createElement("div");
            div.classList.add("item-carrito");

            div.innerHTML = `
                <span class="nombre-item">${item.nombre}</span>
                <div class="controles">
                    <button class="btn-restar" data-id="${item.id}">-</button>
                    <span>${item.cantidad}</span>
                    <button class="btn-sumar" data-id="${item.id}">+</button>
                </div>
                <span class="precio-item">$${(item.precio * item.cantidad).toLocaleString("es-AR")}</span>
            `;

            div.querySelector(".btn-restar").addEventListener("click", () => quitarDelCarrito(item.id));
            div.querySelector(".btn-sumar").addEventListener("click", () => agregarAlCarrito(item.id));

            contenedor.appendChild(div);
        });
    }

    // Cantidad de items en el botón del header
    const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    spanCantidad.textContent = totalItems;

    // Precio total de la compra
    const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    spanTotal.textContent = total.toLocaleString("es-AR");
}


// FINALIZAR COMPRA


// Simula el proceso de compra con una confirmación y luego vacía el carrito
function finalizarCompra() {
    if (carrito.length === 0) {
        Swal.fire({
            icon: "warning",
            title: "Carrito vacío",
            text: "Agregá al menos un producto antes de finalizar la compra."
        });
        return;
    }

    Swal.fire({
        icon: "success",
        title: "¡Compra realizada con éxito!",
        text: "Gracias por tu compra. En breve recibirás un correo con los detalles.",
        confirmButtonText: "Aceptar",
        confirmButtonColor: "#1a1a2e"
    }).then(() => {
        // Vaciamos el carrito y cerramos el panel
        carrito = [];
        actualizarCarrito();
        document.getElementById("carrito").classList.add("oculto");
    });
}
