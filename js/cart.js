// variables

const cartBtn = document.querySelector('.cart-btn');
const clearCartBtn = document.querySelector('.clear-cart');
const totalCount = document.querySelector('.total-count');
const cartTotal = document.querySelector('.total-price');
const cartContent = document.querySelector('.cart-content');
const cartDOM = document.querySelector('.show-cart');
const productsDOM = document.querySelector('.product-show');

// cart items 
let cart = [];

// buttons
let buttonsDOM = [];

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
        products.forEach(product => {
            result += `
            <div class="col-sm-3 col-md-3">
            <img
                class="img-fluid img-kat" 
                src=${product.image}
                alt="Produk Tiyok"
            >
            <h5 class="text-kat">${product.title}</h5>
            <h5 class="harga-kat">Rp ${product.price}</h5>
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
        cart.map(item => {
            tempTotal += item.price * item.amount;
            itemsTotal += item.amount
        });
        cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
        totalCount.innerText = itemsTotal;
    }
    addCartItem(item) {
        const div = document.createElement('div')
        div.classList.add('cart-item');
        div.innerHTML = `
        <img src=${item.image} 
            alt="Tiyok Food">
            <div>
                <h4>${item.title}</h4>
                <h5>Rp ${item.price}</h5>
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
        this.setCartValues(cart);
        this.populateCart(cart);
    }
    populateCart(cart) {
        cart.forEach(item => this.addCartItem(item));
    }
    cartLogic() {
        clearCartBtn.addEventListener('click',
        () => {
            this.clearCart()
        });
        //cart functionality
        cartContent.addEventListener('click', event => {
            if (event.target.classList.contains('remove-item')) {
                    let removeItem = event.target;
                    let id = removeItem.dataset.id;
                    cartContent
                    this.removeItem(id);              
            }
        });
    }
    clearCart() {
        let cartItems = cart.map(item => item.id);
        cartItems.forEach(id => this.removeItem(id));
        console.log(cartContent.children);
        while(cartContent.children.length > 0) {
            cartContent.removeChild(cartContent.children[0]);
        };
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

// local storage
class Storage {
    static saveProducts(products) {
        localStorage.setItem("products", JSON.stringify(products));
    };
    static getProduct(id) {
        let products = JSON.parse(localStorage.getItem('products'));
        return products.find(product => product.id === id);
    };
    static saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    static getCart() {
        return localStorage.getItem('cart') ?
            JSON.parse(localStorage.getItem('cart')) : []
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