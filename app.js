const cartBtn = document.querySelector( ".cart-btn");
const cartModal = document.querySelector(".cart");
const backDrop = document.querySelector(".backdrop");
const closeModal = document.querySelector(".cart-item-confirm");

const productsDOM = document.querySelector('.products-center'); 
const cartTotal = document.querySelector ('.cart-total');
const cartItems = document.querySelector( '.cart-items');
const cartContent = document.querySelector ('.cart-content');
const clearCart = document.querySelector ('.clear-cart');


import { productsData } from "./products.js";
let cart = [];
let buttonsDOM= [];



//1. get product 
class Products {
    getProducts (){
        return productsData;
    }

}




//2.display products
class UI {  
    displayProducts (products){
        let result = '';
        products.forEach((item) => {
            result += `<div class="product">
            <div class="img-container">
              <img src=${item.imageUrl} class="product-img" />
            </div>
            <div class="product-desc">
              <p class="product-price">${item.price}</p>
              <p class="product-title">${item.title}</p>
            </div>
            <button class="btn add-to-cart " data-id= ${item.id}>
              add to cart
            </button>
          </div>`
          productsDOM.innerHTML = result;
            
        });
    }

    getAddToCartBtns(){
        const addToCartBtns = [...document.querySelectorAll ('.add-to-cart')];
        buttonsDOM =addToCartBtns;

        addToCartBtns.forEach(btn =>{
            const id = btn.dataset.id;
            // check if this product id is in cart or not !;
            const isInCart = cart.find (p => p.id === parseInt(id));
            if (isInCart){
                btn.innerText = 'In Cart';
                btn.disabled = true;
            }
            btn.addEventListener('click',(event)=>{
                event.target.innerText = ' In Cart';
                event.target.disabled = true;
                const addedProduct = {...Storage.getproduct(id), quantity :1};
                cart = [...cart,addedProduct]; 
                Storage.saveCart(cart);
                this.setCartValue(cart);
                this.addCartItem(addedProduct);

            });

        });
    }
    setCartValue(cart){
        let tempCartItem = 0;
        const totalPrice = cart.reduce((acc,curr)=> {
            tempCartItem += curr.quantity;
            return acc + curr.quantity *curr.price;
        }, 0);
        cartTotal.innerText = `total price : ${totalPrice.toFixed(2)} $`;
        cartItems.innerText = tempCartItem;
    }
    addCartItem (cartItem){
        const div = document.createElement ('div');
        div.classList.add('cart-item');
        div.innerHTML = `  <img class="cart-item-img" src= ${cartItem.imageUrl} />
        <div class="cart-item-desc">
          <h4>${cartItem.title}</h4>
          <h5>$ ${cartItem.price}</h5>
        </div>
        <div class="cart-item-conteoller">
          <i class="fas fa-chevron-up" data-id=${cartItem.id}></i>
          <p>${cartItem.quantity}</p>
          <i class="fas fa-chevron-down" data-id=${cartItem.id}></i>
        </div>
        <i class="far fa-trash-alt" data-id=${cartItem.id}></i>
        `;
        cartContent.appendChild(div);
    };
    setupApp (){
        // GET CART FROM STORAGE
        cart = Storage.getCart() || [];
        // ADD CART ITEMS
        cart.forEach(cartItem =>this.addCartItem(cartItem));
        // SET VALUE:PRICE+ITEMS
        this.setCartValue(cart);


    }
    cartLagic(){
        // clear cart
        clearCart.addEventListener('click', ()=> this.clearCart());
        // cart functinality
        cartContent.addEventListener('click', (event)=>{
            if (event.target.classList.contains('fa-chevron-up')){
                const addQuantity = event.target;
                // get item from cart 
                const addedItem = cart.find(cItem => cItem.id == addQuantity.dataset.id);
                addedItem.quantity ++;
                // update cart value
                this.setCartValue(cart);
                // save cart
                Storage.saveCart(cart);
                // update cart item in ui
                addQuantity.nextElementSibling.innerText = addedItem.quantity;
            }else if (event.target.classList.contains('fa-trash-alt')){
                const removeItem = event.target;
                const _removedItem = cart.find((c)=> c.id == removeItem.dataset.id);
                this.removeItem(_removedItem.id);
                Storage.saveCart(cart);
                cartContent.removeChild(removeItem.parentElement);
                // remove from cart item
                // remove
            }else if (event.target.classList.contains('fa-chevron-down')){
                const subQuantity = event.target;
                const substractedItem = cart.find((c)=> c.id == subQuantity.dataset.id);
                if (substractedItem.quantity==1){
                    this.removeItem(substractedItem.id);
                    cartContent.removeChild(subQuantity.parentElement.parentElement);
                    return
                };
                substractedItem.quantity -- ; 
                 // update cart value
                 this.setCartValue(cart);
                 // save cart
                 Storage.saveCart(cart);
                 // update cart item in ui
                 subQuantity.previousElementSibling.innerText = substractedItem.quantity;

            }

        });
    }
    clearCart(){
         // remove : (DRY)
         cart.forEach((cItem )=> this.removeItem(cItem.id));
         // remove cart content children
         while (cartContent.children.length){
             cartContent.removeChild(cartContent.children[0]);
         }
         closeModalFunction();
    }
    removeItem (id){
        cart = cart.filter ((cItem) => cItem.id !==parseInt(id));
        this.setCartValue(cart);
        Storage.saveCart(cart);
        // get add to cart btns :update text and disable
        this.getSingleButton (id);
    }
    getSingleButton (id){
        const button =buttonsDOM.find(
            (btn) => parseInt(btn.dataset.id) === parseInt(id));
        button.innerText = 'add to cart';
        button.disabled = false;
    };
    }





//3.storage 
class Storage {
   static saveProducts (products){
        localStorage.setItem('products', JSON.stringify(products));
    }
    static getproduct(id){
       const _products= JSON.parse(localStorage.getItem('products'));
       return _products.find((p)=> p.id === parseInt(id)); 
    }
    static saveCart (cart){
        localStorage.setItem ('cart', JSON.stringify(cart));
    }
    static getCart (cart){
        return JSON.parse(localStorage.getItem('cart'));
    }

}



document.addEventListener ('DOMContentLoaded', ()=>{
    const products = new Products();
    const productsData = products.getProducts();
    const ui = new UI;
    ui.setupApp(cart);
    ui.displayProducts(productsData);
    ui.getAddToCartBtns(productsData)  ;
    ui.cartLagic()
    Storage.saveProducts(productsData);
    // console.log (productsData);
}
)


//cart item modal 

function showModalFunction (){
    backDrop.style.display = 'block';
    cartModal.style.opacity = '1';
    cartModal.style.top = '20%';  
}
 
function closeModalFunction (){
    backDrop.style.display = 'none';
    cartModal.style.opacity = '0';
    cartModal.style.top = '-100%';  
}

cartBtn.addEventListener("click", showModalFunction);
closeModal.addEventListener("click", closeModalFunction);
backDrop.addEventListener("click", closeModalFunction);

