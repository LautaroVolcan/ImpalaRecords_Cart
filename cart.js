//Variables

const cartBtn = document.querySelector(".cartButton");
const closeCartBtn = document.querySelector("#closeButton");
const clearCartBtn = document.querySelector(".clearCartBtn");
const cartDOM = document.querySelector(".popUp");
const cartOverlay = document.querySelector(".bigContainer");
const cartItems = document.querySelector(".cartItems");
const cartTotal = document.querySelector(".cartTotal");
const cartContent = document.querySelector(".cartContent");
const productsDOM = document.querySelector("#card-container");

// Main Cart
let cart = [];

//buttons
let buttonsDOM = [];

//Getting the Products
class Products {
  async getProducts() {
    try {
      let result = await fetch("discos.json");
      let data = await result.json();
      return data;
    } catch (error) {
      console.log(error);
    }
  }
}

// Display Products

class Ui {
  displayProducts(products) {
    let result = "";
    products.forEach((disco) => {
      result += `
        <article class= "discos">
            <p class= "cardTitle">  ${disco.title}</p>
            <img class= "cardImg" src= "${disco.img}"></img>
            <br>
            <div class="precio"> $ ${disco.Price}</div>
            <br>
            <div class="addtocartbtn" data-id=${disco.id} > Add to Cart </div>
            </article>`;
    });

    productsDOM.innerHTML = result;
  }
  getAddCartBtns() {
    const addToCartBtns = [...document.querySelectorAll(".addtocartbtn")];
    buttonsDOM = addToCartBtns;
    addToCartBtns.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }

      button.addEventListener("click", (event) => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;
        //get product from Products
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        //add product to the cart
        cart = [...cart, cartItem];

        //save cart in local storage
        Storage.saveCart(cart);
        //set cart values
        this.setCartValues(cart);
        //display cart item
        this.addCartItem(cartItem);
        //show the cart
        this.showCart();
      });
    });
  }
  setCartValues(cart) {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.Price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
  }

  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cartItem");
    div.innerHTML = `<img src=${item.img} alt="">
      <div>
        <h4>${item.title}</h4>
        <h5>$ ${item.Price}</h5>
        <span class="removeItem" data-id =${item.id} >Remove</span>
      </div>
      <div>
        <i class="fas fa-chevron-up" aria-hidden="true" data-id=${item.id} ></i>
        <p class="itemAmount">${item.amount} </p>
        <i class="fas fa-chevron-down" aria-hidden="true" data-id=${item.id} ></i>
      </div>`;

    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add("bigContainerActive");
    cartDOM.classList.add("popUpActive");
  }
  setupApp() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }
  populateCart(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }
  hideCart() {
    cartOverlay.classList.remove("bigContainerActive");
    cartDOM.classList.remove("popUpActive");
  }
  cartLogic() {
    //clearCart Button
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
    //cartFunctionaliy
    cartContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("removeItem")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.removeItem(id);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount + 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find((item) => item.id === id);
        tempItem.amount = tempItem.amount - 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart);
          this.setCartValues(cart);
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }

  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }

  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerText = "Add To Cart";
  }
  getSingleButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}
// Local Storage
class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new Ui();
  const products = new Products();
  // setupAPP
  ui.setupApp();
  // GetProducts
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getAddCartBtns();
      ui.cartLogic();
    });
});
