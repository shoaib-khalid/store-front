import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Category } from './food-order/../../models/Category';
import { Product } from './food-order/../../models/Product';

import { faEye, faShoppingCart, faShoppingBag } from '@fortawesome/free-solid-svg-icons';

import { DataBindService } from './../databind.service';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';

import { ApiService } from './../api.service';


@Component({
  selector: 'food-app-catalogue',
  templateUrl: './catalogue.component.html',
  styleUrls: ['./catalogue.component.css']
})
export class CatalogueComponent implements OnInit, AfterViewInit, OnDestroy {

    iconEye = faEye;
    iconCart = faShoppingCart;
    iconBag = faShoppingBag;

    // categories:Category[];
    //   product:Product[];
    categories:any;
    product:any;
    leftNavDisabled = false;
    rightNavDisabled = false;
    idx = 0;
    details: any[] = [];
    modalDataTest:any = [];
    data = {};
    storeID:any;
    priceObj = [];
    clusterPriceArr = [];
    minVal:any;
    detailPrice:any = '0.00';
    galleryImagesInit:any;
    senderID:any;
    refID:any;
    cartExist:boolean = false;
    cartCount:number;
    cart:any;
    cartItemCount:number;
    cartitemDetails:any;
    cartitemDetailsCount:number = 0;
    fromAddToCart:boolean = false;
    singleInventoriesMode:boolean = true;

    constructor(
        private _databindService: DataBindService, 
        private route: Router,
        private activatedRoute: ActivatedRoute,
        private mScrollbarService: MalihuScrollbarService,
        private apiService: ApiService
    ) { 
        
        // get url parameter style e.g http://localhost:4200/catalogue?store_id=3
        this.activatedRoute.queryParams.subscribe(params => {
            this.refID = params['referenceId'];
            this.senderID = params['senderId'];
            this.storeID = params['storeId'];
            console.log(this.refID + "-" + this.senderID + "-" + this.storeID); // Print the parameter to the console. 
        });

        // url path style e.g http://localhost:4200/catalogue/3
        // this.activatedRoute.params.subscribe(params => {
        //     let date = params['store_id'];
        //     console.log(date); // Print the parameter to the console. 
        // });
    }

    ngOnInit(): void {
        localStorage.setItem('ref_id', this.refID);     // reference
        localStorage.setItem('sender_id', this.senderID);   //customer
        localStorage.setItem('store_id', this.storeID);    // storeid
        // this.product = this._databindService.getProduct();
        // this.categories = this._databindService.getCategories();
        this.modalDataTest = this._databindService.getProduct();

        // console.log('modal details: ', this.details);
        
        this.getProduct();
        // this.getProductNew();
        this.getCategory();

        // check cart first 
        this.checkCart();
    }
  
    ngAfterViewInit(){
        // this.mScrollbarService.initScrollbar(document.body, { axis: 'y', theme: 'dark-3', scrollButtons: { enable: true } });
        this.mScrollbarService.initScrollbar('#scrollable2', { axis: 'x', theme: 'dark-thin', scrollButtons: { enable: true } });
    }

    ngOnDestroy() {
        // custom cleanup
        // this.mScrollbarService.destroy(document.body);
        this.mScrollbarService.destroy('#scrollable2');
    }

    checkCart(){
        this.apiService.getCartList(this.senderID).subscribe((res: any) => {

            console.log('cart obj: ', res.data.content)
            if (res.message){

                this.cart = res.data.content;
                // if cart empty then initiate cart API
                this.cartCount = this.cart.length;

                if(this.cartCount > 0){
                    this.cartExist = true;

                    let cartID = this.cart[0].id;

                    console.log('cart id : ' + cartID)

                    // check count Item in Cart 
                    this.apiService.getCartItemByCartID(cartID).subscribe((res: any) => {
                        console.log('cart item by cart ID: ', res.data.content)

                        if (res.message){
                            this.cartitemDetails = res.data.content;
                            this.cartitemDetailsCount = this.cartitemDetails.length;

                        } else {

                        }

                    }, error => {
                        console.log(error)
                    }) 

                }else{
                    this.cartItemCount = 0;
                }
                
            }else{

            }
        }, error => {
            console.log(error)
        }) 
    }

    goTo(event){
        // console.log('ditekan mengenai');
        this.route.navigate(['checkout']);   
    }

    addToCart(event, productID, quantity){

        let qty = 1;
        // replace qty if quantity param exist 
        quantity ? qty = quantity : console.log('qty no change');

        let data = {
            "cartId": "3",
            "id": "",
            "itemCode": productID,
            "productId": productID,
            "quantity": qty
        }

        if(this.cartExist == true){
            
            this.apiService.postAddToCart(data).subscribe((res: any) => {

                // Update item count in Cart 
                this.apiService.getCartItemByCartID(data.cartId).subscribe((res: any) => {
                    // console.log('cart item by cart ID: ', res.data.content)

                    if (res.message){
                        this.cartitemDetails = res.data.content;
                        this.cartitemDetailsCount = this.cartitemDetails.length;

                    } else {

                    }

                }, error => {
                    console.log(error)
                }) 

            }, error => {
                console.log(error)
            }) 

        }else{

            this.apiService.getCartList(this.senderID).subscribe((res: any) => {

                console.log('cart obj: ', res.data.content)
                if (res.message){
    
                    this.cart = res.data.content;
                    // if cart empty then initiate cart API
                    this.cartCount = this.cart.length;
    
                    if(this.cartCount > 0){
                        this.cartExist = true;
    
                        let cartID = this.cart[0].id;
    
                        console.log('cart id : ' + cartID)
    
                        // check count Item in Cart 
                        this.apiService.getCartItemByCartID(cartID).subscribe((res: any) => {
                            console.log('cart item by cart ID: ', res.data.content)
    
                            if (res.message){
                                this.cartitemDetails = res.data.content;
                                this.cartitemDetailsCount = this.cartitemDetails.length;

                                // add to cart 
                                this.apiService.postAddToCart(data).subscribe((res: any) => {

                                }, error => {
                                    console.log(error)
                                }) 
    
                            } else {
    
                            }
    
                        }, error => {
                            console.log(error)
                        }) 
    
                    }else{
                        this.cartItemCount = 0;
                    }
                    
                }else{
    
                }
            }, error => {
                console.log(error)
            }) 
        }  
    }

    getCategory(){
        this.apiService.getCategoryByStoreID(this.storeID).subscribe((res: any) => {

            console.log('category obj: ', res)
            if (res.message){
                this.categories = res.data.content;

                console.log('category obj: ', this.categories);
            }else{

            }

        }, error => {
            console.log(error)
        }) 
    }

    // this function can be used if there is only 1 object inside productInventories 
    getProductNew(){

        this.apiService.getProductSByStoreID(this.storeID).subscribe((res: any) => {
            // console.log('raw resp:', res)
            if (res.message) {
                this.product = res.data.content;
                console.log('product: ', this.product);
                console.log('price: ', this.product[0].productInventories[1]);

                let productObj = this.product;

                productObj.forEach( obj => {
                    // console.log(obj);

                    let productID = obj.id;
                    let inventoryArr = obj.productInventories;

                    if(inventoryArr.length !== 0){
                        // inventoryArr.forEach( inventoryObj => {
                            // creating a collection of price array base on cluster item 
                            // this.clusterPriceArr.push(inventoryObj.price);
                        // });
                        // checking the minimum price of each cluster item 
                        // this.minVal = this.clusterPriceArr.reduce((a, b)=>Math.min(a, b));

                        this.minVal = inventoryArr[0].price;

                    }else{
                        this.minVal = 0;
                    }
                
                    // creating an object of a specific product item 
                    let data = {
                        product_id : productID,
                        minPrice : this.minVal
                    }

                    // populate product id as identifier of item and its min price into a new final object collection 
                    this.priceObj.push(data);
                    
                    console.log('Final Object: ', this.priceObj);
                });

            } else {
                // condition if required for different type of response message 
            }
        }, error => {
            console.log(error)
        }) 

    }

    getProduct(){
        this.apiService.getProductSByStoreID(this.storeID).subscribe((res: any) => {
            // console.log('raw resp:', res)
            if (res.message) {
                this.product = res.data.content;
                console.log('product: ', this.product);
                console.log('price: ', this.product[0].productInventories[1]);

                let productObj = this.product;

                productObj.forEach( obj => {
                    // console.log(obj);

                    let productID = obj.id;
                    let inventoryArr = obj.productInventories;

                    if(inventoryArr.length !== 0){
                        
                        // pseudocode : If this.singleInventoriesMode is true, then select first Object, if false then loop and get min price 
                        // for food industries is on this.singleInventoriesMode mode for other might be true or false 
                        if(this.singleInventoriesMode){
                            this.minVal = inventoryArr[0].price;
                        }else{
                            inventoryArr.forEach( inventoryObj => {
                                // creating a collection of price array base on cluster item 
                                this.clusterPriceArr.push(inventoryObj.price);
                            });
                            // checking the minimum price of each cluster item 
                            this.minVal = this.clusterPriceArr.reduce((a, b)=>Math.min(a, b));
                        }

                    }else{
                        this.minVal = 0;
                    }
                
                    // creating an object of a specific product item 
                    let data = {
                        product_id : productID,
                        minPrice : this.minVal
                    }

                    // populate product id as identifier of item and its min price into a new final object collection 
                    this.priceObj.push(data);
                    
                    console.log('Final Object: ', this.priceObj);
                });

            } else {
                // condition if required for different type of response message 
            }
        }, error => {
            console.log(error)
        }) 
    }

    onGetDetails(productid){
        // console.log('product id: ', productid)

        // console.log('product obj: ', this.product);

        // this.product.map(product => {
        //     if(product.id == productid){
        //         console.log('selected product: ', product);
        //         this.details = product;
        //         return this.details;
        //     }
        // })


        this.apiService.getProductSByProductID(productid).subscribe((res: any) => {

            console.log('product details:', res.data);

            let product_details = res.data;

            if (res.message) {
                this.details = product_details;
                this.detailPrice = product_details.productInventories[0].price;
                // console.log('detailPrice: ' + this.detailPrice);

                // when product id is triggered, kindly fetch product image
                this.galleryImagesInit = 'assets/image/food-sample1.jpg';

                // console.log('test 2: ' + this.galleryImagesInit)
            } else {

            }

        }, error => {
            console.log(error)
        }) 
    }

    onGetCategoriesItem(categoryId){

        console.log('Category ID: ' + categoryId);

        this.apiService.getProductSByCategory(categoryId, this.storeID).subscribe((res: any) => {
            console.log('getProductSByCategory resp:', res.data.content)
            let new_product = res.data.content;
            if (res.message) {
                // this.details = product_details;
                // this.detailPrice = product_details.productInventories.price;
                this.product = new_product;
                console.log('new product: ', this.product);
            } else {

            }

        }, error => {
            console.log(error)
        }) 

    }

  onIndexChanged(idx) {
    this.idx = idx;
    // console.log('current index: ' + idx);
  }

  onDragScrollInitialized() {
    // console.log('first demo drag scroll has been initialized.');
  }

  leftBoundStat(reachesLeftBound: boolean) {
    this.leftNavDisabled = reachesLeftBound;
  }

  rightBoundStat(reachesRightBound: boolean) {
    this.rightNavDisabled = reachesRightBound;
  }

  onSnapAnimationFinished() {
    // console.log('snap animation finished');
  }

  onDragStart() {
    // console.log('drag start');
  }

  onDragEnd() {
    // console.log('drag end');
  }

}
