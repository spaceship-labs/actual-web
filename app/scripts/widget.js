

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
            "title": "ESPEJO NAPOLI 90X200 C/WALNUT",
            "price": 15899,
            "discount": true,
            "discount_percentage": 28,
            "photo": "https://d116li125og699.cloudfront.net/uploads/products/ST14572_1.png",
            "url": "/espejo-napoli-90x200-c-walnut/ST14572"
        },
        {
            "title": "Buro paamul c/parota 45x38x50",
            "price": 5799.01,
            "discount": true,
            "discount_percentage": 28,
            "photo": "https://d116li125og699.cloudfront.net/uploads/products/ST18862.jpeg",
            "url": "/buro-paamul-c-parota-45x38x50/ST18862"
        },
        {
            "title": "Sillon xpuha manila c/jequitiba t.f.pearl  80x80x72",
            "price": 28399.01,
            "discount": true,
            "discount_percentage": 28,
            "photo": "https://d116li125og699.cloudfront.net/uploads/products/CO75398_01.jpg",
            "url": "/sillon-xpuha-manila-c-jequitiba-t.f.pearl%C2%A0-80x80x72/CO75398"
        },
        {
            "title": "Cama paamul mat rd c/parota-yute-red 140x104",
            "price": 20299.01,
            "discount": true,
            "discount_percentage": 28,
            "photo": "https://d116li125og699.cloudfront.net/uploads/products/ST18857.jpeg",
            "url": "/cama-paamul-mat-rd-c-parota-yute-red-140x104/ST18857"
        },
        {
            "title": "Corner nuvola ii 92x92x64h spark ivory",
            "price": 14999,
            "discount": true,
            "discount_percentage": 28,
            "photo": "https://d116li125og699.cloudfront.net/uploads/products/fixed__1___1_.png",
            "url": "corner-nuvola-ii-92x92x64h-spark-ivory/ST18706"
        },

        {
            "title": "Mesa de centro free ii chica esp ng nat ce2289-03 e",
            "price": 9799,
            "discount": true,
            "discount_percentage": 28,
            "photo": "https://d116li125og699.cloudfront.net/uploads/products/AT0000217_1.jpg",
            "url": "/mesa-de-centro-free-ii-chica-esp-ng-nat-ce2289-03-e/AT0000217"
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
        document.getElementById("widget-url").href = producto.url

    } else {
        // En pantallas más pequeñas
        var producto = package1[numero];
        document.getElementById("mobile-product-image").src = producto.photo;
        document.getElementById("widget-product-title2").textContent = producto.title;
        document.getElementById("widget-product-price2").textContent = "$" + producto.price.toFixed(2);
        document.getElementById("widget-product-price-discount2").textContent = "$" + calcularPorcentaje(producto.price, producto.discount_percentage).toFixed(2);
        document.getElementById("product-discount2").textContent = "-" + producto.discount_percentage + "%"
        document.getElementById("widget-url2").href = producto.url
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


