// variables

const cartBtn = document.querySelector('.cart-btn');
const clearCartBtn = document.querySelector('.clear-cart');
const totalCount = document.querySelector('.total-count');
const cartTotal = document.querySelector('.total-price');
const cartContent = document.querySelector('.cart-content');
const cartDOM = document.querySelector('.show-cart');
const productsDOM = document.querySelector('.product-show');
const totalBelanja = document.querySelector('.total-belanja');
const showCart = document.getElementById('#cart');

// cart items 
let cart = [];

// buttons
let buttonsDOM = [];

class Converter {
    rupiah(angka, prefix) {
        var number_string = angka.toString().replace(/[^,\d]/g, ''),
            split = number_string.split(','),
            sisa = split[0].length % 3,
            rupiah = split[0].substr(0, sisa),
            ribuan = split[0].substr(sisa).match(/\d{3}/gi);
            console.log(ribuan, rupiah, sisa, split);
        
        if (ribuan) {
            var separator = sisa ? '.' : '';
            rupiah += separator + ribuan.join('.');
        }

        rupiah = split[1] != undefined ? rupiah + ',' + split[1] : rupiah;
        return prefix == undefined ? rupiah : (rupiah ? 'Rp ' + rupiah : '');
    }
};

// getting the products
class Products {
    async getProducts() {
        try {
            let result = await fetch('../data.json');
            let data = await result.json();
            let products = data.items;
            products = products.map(item => {
                const { title, price } = item.fields;
                const { id } = item.sys;
                const image = item.fields.image.fields.file.url;
                return { title, price, id, image }
            })
            return products;
        } catch (error) {
            console.log(error);
        };
    };
};

// display the products
class UI {
    displayProducts(products) {
        let result = '';
        let rupiah = 'rupiah';
        let price = new Converter()
        products.forEach(product => {
            result += `
            <div class="col-sm-3 col-md-3">
            <img
                class="img-fluid img-kat" 
                src=${product.image}
                alt="Produk Tiyok"
            >
            <h5 class="text-kat">${product.title}</h5>
            <h5 class="harga-kat">${price.rupiah(product.price, rupiah)}</h5>
            <button type="button" 
                class="add-cart btn btn-primary" data-id=${product.id}>
            tambah ke keranjang
            </button>
            </div>
            `;
        });
        productsDOM.innerHTML = result;
    }
    getBagButtons() {
        const buttons = [...document.querySelectorAll('.add-cart')];
        buttonsDOM = buttons;
        buttons.forEach(button => {
            let id = button.dataset.id;
            let inCart = cart.find(item => item.id === id);
            if (inCart) {
                button.innerText = "Berhasil Ditambahkan";
                button.disabled = true;
            }
            button.addEventListener('click', event => {
                event.target.innerText = "Berhasil Ditambahkan";
                event.target.disabled = true;
                $('#cart').modal('show');
                // get product from products
                let cartItem = { ...Storage.getProduct(id), amount: 1 };
                // add product to the cart
                cart = [...cart, cartItem];
                // save the cart in local storage
                Storage.saveCart(cart);
                // set cart values
                this.setCartValues(cart);
                // display cart item
                this.addCartItem(cartItem);
            });
        });
    };
    setCartValues(cart) {
        let tempTotal = 0;
        let itemsTotal = 0;
        let rupiah = 'rupiah';
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount;
        });
        const converter = new Converter();
        cartTotal.innerText = converter.rupiah(tempTotal, rupiah);
        totalCount.innerText = itemsTotal;
    }

    addCartItem(item) {
        const div = document.createElement('div');
        let rupiah = 'rupiah';
        let price = new Converter();
        div.classList.add('cart-item');
        div.innerHTML = `
        <img src=${item.image} 
            alt="Tiyok Food">
            <div>
                <h4>${item.title}</h4>
                <h5>${price.rupiah(item.price, rupiah)}</h5>
                <span class="remove-item" data-id=${item.id}>
                    remove
                </span>
            </div>
            <div>
                <svg width="1em" height="1em" viewBox="0 0 16 16"
                    class="bi bi-caret-up-fill" data-id=${item.id} fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M7.247 4.86l-4.796 5.481c-.566.647-.106 1.659.753 1.659h9.592a1 1 0 0 0 .753-1.659l-4.796-5.48a1 1 0 0 0-1.506 0z" />
                </svg>
                <p class="total-amount">${item.amount}</p>
                <svg width="1em" height="1em" viewBox="0 0 16 16"
                    class="bi bi-caret-down-fill" data-id=${item.id} fill="currentColor"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M7.247 11.14L2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                </svg>
            </div>
        `;
        cartContent.appendChild(div);
    }
    setupAPP() {
        cart = Storage.getCart();
        console.log(cart);
        this.setCartValues(cart);
        this.populateCart(cart);
    }
    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }
    cartLogic() {
        // clear cart button
        clearCartBtn.addEventListener('click',
            () => {
                this.clearCart()
            });
        //cart functionality
        cartContent.addEventListener('click', event => {
            if (event.target.classList.contains('remove-item')) {
                let removeItem = event.target;
                let id = removeItem.dataset.id;
                cartContent.removeChild(removeItem.parentElement.parentElement);
                this.removeItem(id);
            }
            else if (event.target.classList.contains('bi-caret-up-fill')) {
                let addAmount = event.target;
                let id = addAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount + 1;
                Storage.saveCart(cart);
                this.setCartValues(cart);
                addAmount.nextElementSibling.innerText = tempItem.amount;
            }
            else if (event.target.classList.contains('bi-caret-down-fill')) {
                let lowerAmount = event.target;
                let id = lowerAmount.dataset.id;
                let tempItem = cart.find(item => item.id === id);
                tempItem.amount = tempItem.amount - 1;
                if (tempItem.amount > 0) {
                    Storage.saveCart(cart);
                    this.setCartValues(cart);
                    lowerAmount.previousElementSibling.innerText = tempItem.amount;
                }
                else {
                    cartContent.removeChild(lowerAmount.parentElement.parentElement);
                    this.removeItem(id);
                }
            }
        });
    }
    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        console.log(cartContent.children);
        while (cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        };
        $('#cart').modal('hide');
    };
    removeItem(id) {
        cart = cart.filter(item => item.id !== id);
        this.setCartValues(cart);
        Storage.saveCart(cart);
        let button = this.getSingleButton(id);
        button.disabled = false;
        button.innerText = "Tambah Ke Keranjang"
    }
    getSingleButton(id) {
        return buttonsDOM.find(button => button.dataset.id === id);
    }
};

// session storage
class Storage {
    static saveProducts(products) {
        sessionStorage.setItem("products", JSON.stringify(products));
    };
    static getProduct(id) {
        let products = JSON.parse(sessionStorage.getItem('products'));
        return products.find(product => product.id === id);
    };
    static saveCart(cart) {
        sessionStorage.setItem('cart', JSON.stringify(cart));
    }
    static getCart() {
        console.log();
        return sessionStorage.getItem('cart') ?
            JSON.parse(sessionStorage.getItem('cart')) : [];
    }
    static totalCart() {
        return sessionStorage.setItem('itemsTotal', JSON.stringify(itemsTotal));
    }
};

// event listener
document.addEventListener("DOMContentLoaded", () => {

    const ui = new UI();
    const products = new Products();

    // setup applications
    ui.setupAPP();

    // get all products
    products.getProducts().then(products => {
        ui.displayProducts(products);
        Storage.saveProducts(products);
    }).then(() => {
        ui.getBagButtons();
        ui.cartLogic();
    });
});