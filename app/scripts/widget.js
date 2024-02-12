

function calcularPorcentaje(numeroOriginal, porcentaje) {
    // Calculamos el porcentaje
    var cantidadPorcentaje = (porcentaje / 100) * numeroOriginal;

    // Restamos el porcentaje del número original
    var resultado = numeroOriginal - cantidadPorcentaje;

    return resultado;
}

function accion(numero) {
    let package1 = [
        {
            "title": "Espejo decorativo redondo cae060 ø1.20 dorado",
            "price": 6999,
            "discount": true,
            "discount_percentage": 20,
            "photo": "https://d116li125og699.cloudfront.net/uploads/products/CO69272_1.jpg"
        },
        {
            "title": "Buró Bahía-02 c/ 2 cajones color blanco alto brillo",
            "price": 6799.01,
            "discount": true,
            "discount_percentage": 20,
            "photo": "https://d116li125og699.cloudfront.net/uploads/products/ST16451_1.jpg"
        },
        {
            "title": "SILLA MONTECARLO CUERDA FLAT AZUL C/BRAZOS TEKA DARK BROWN TELA CANVAS NATURAL",
            "price": 18499,
            "discount": true,
            "discount_percentage": 20,
            "photo": "https://d116li125og699.cloudfront.net/uploads/products/CO62810_01.jpg"
        },
        {
            "title": "Cama King Size tapizada en tela gris claro con cabecera lisa",
            "price": 14999,
            "discount": true,
            "discount_percentage": 20,
            "photo": "https://d116li125og699.cloudfront.net/uploads/products/ST10019_01_Cama_lisa_gris_king_size.jpg"
        },
        {
            "title": "Sofa cama con chaise izquierdo modelo Alexa tapizado en tela gris",
            "price": 37999.01,
            "discount": true,
            "discount_percentage": 20,
            "photo": "https://d116li125og699.cloudfront.net/uploads/products/ST15340_4.jpg"
        },

        {
            "title": "MESA CENTRAL FIORDO REDONDA GRANDE 100DX50H ACABADO NOGAL NATURAL",
            "price": 9499,
            "discount": true,
            "discount_percentage": 20,
            "photo": "https://d116li125og699.cloudfront.net/uploads/products/ST15071_011.jpg"
        }
    ]
    if (window.innerWidth >= 1200) {
        // En pantallas de laptop hacia arriba
        var producto = package1[numero];
        document.getElementById("widget-product-image").src = producto.photo;
        document.getElementById("widget-product-title").textContent = producto.title.substring(0, 36);
        document.getElementById("widget-product-price").textContent = "$" + producto.price.toFixed(2);
        document.getElementById("widget-product-price-discount").textContent = "$" + calcularPorcentaje(producto.price, producto.discount_percentage).toFixed(2);
        document.getElementById("product-discount").textContent = "-" + producto.discount_percentage + "%"
    } else {
        // En pantallas más pequeñas
        var producto = package1[numero];
        document.getElementById("mobile-product-image").src = producto.photo;
        document.getElementById("widget-product-title2").textContent = producto.title;
        document.getElementById("widget-product-price2").textContent = "$" + producto.price.toFixed(2);
        document.getElementById("widget-product-price-discount2").textContent = "$" + calcularPorcentaje(producto.price, producto.discount_percentage).toFixed(2);
        openMobileSheet();
    }
}

function openMobileSheet() {
    var sheet = document.getElementById("mobile-sheet");
    sheet.style.bottom = "0";
}

// Para cerrar la hoja móvil
function closeMobileSheet() {
    var sheet = document.getElementById("mobile-sheet");
    sheet.style.bottom = "-100%";
}


