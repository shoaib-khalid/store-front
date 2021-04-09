import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { Category } from './food-order/../../models/Category';
import { Product } from './food-order/../../models/Product';

import { faEye, faShoppingCart, faShoppingBag, faArrowCircleLeft, faMinusCircle, faPlusCircle, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

import { DataBindService } from './../databind.service';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';

import { ApiService } from './../api.service';

import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery-9';
// import { exists } from 'fs';
// import { ucFirst } from 'ngx-pipes/src/ng-pipes/pipes/helpers/helpers';
import Swal from 'sweetalert2'



@Component({
  selector: 'food-app-catalogue',
  templateUrl: './catalogue.component.html',
  styleUrls: ['./catalogue.component.css']
})
export class CatalogueComponent implements OnInit, AfterViewInit, OnDestroy {

    iconEye = faEye;
    iconCart = faShoppingCart;
    iconBag = faShoppingBag;
    iconBack = faArrowCircleLeft;
    iconAdd = faPlusCircle;
    iconMinus = faMinusCircle;
    iconTrash = faTrashAlt;

    // categories:Category[];
    //   product:Product[];
    categories:any;
    newCategories:Category[];
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
    cartitemDetails:any = {};
    cartitemDetailsCount:number = 0;
    cartID:any = null;
    fromAddToCart:boolean = false;
    catalogueList = [];
    allProductInventory = [];

    //applicable for variant product logic
    singleInventoriesMode:boolean = false;

    // modal variable
    value: number;
    detailsObj: any = {};
    galleryOptions: NgxGalleryOptions[];
    galleryImages: NgxGalleryImage[];
    inputQty:any;
    imageCollection = [];
    productAssets:any;
    popupPrice:any = 0;
    inventoryObj: any = {};
    popupItemCode:any = null;

    subTotal:any;
    totalPrice:any;
    orderId:any;

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

    goToCheckout(){
        this.route.navigate(['checkout']);
    }

    checkCart(){
        // console.log('check cart: ' + this.senderID + "|" + this.storeID)

        // return false;
        this.apiService.getCartList(this.senderID, this.storeID).subscribe((res: any) => {

            console.log('checkCart obj: ', res.data.content)
            // console.log('initial cart id: ', res.data.content.id)
            if (res.message){

                this.cart = res.data.content;
                // if cart empty then initiate cart API
                this.cartCount = this.cart.length;

                if(this.cartCount > 0){
                    this.cartExist = true;

                    this.cartID = this.cart[0].id;
                    localStorage.setItem('cart_id', this.cartID);

                    console.log('cart id : ' + this.cartID)

                    // check count Item in Cart 
                    this.apiService.getCartItemByCartID(this.cartID).subscribe((res: any) => {
                        console.log('cart item by cart ID 1: ', res.data.content)

                        if (res.message){
                            this.cartitemDetails = res.data.content;
                            this.cartitemDetailsCount = this.cartitemDetails.length;

                        } else {

                        }

                    }, error => {
                        console.log(error)
                    }) 

                }else{
                    this.cartitemDetailsCount = 0;
                }
                
            }else{

            }
        }, error => {
            console.log(error)
        }) 
    }

    addToCart(event, productID, itemCode, option){

        // alert("productID: " + productID + " itemCode: " + itemCode + " option: " + option)
        // return false;
        // pseudo quantity & option
        // if option 1 then add single item 
        // if option 2 then use this.inputQty 

        console.log('Change Quantity: ' + this.inputQty);
        
        let qty = 1;
        // replace qty if option is 2
        option == 2 ? qty = this.inputQty : console.log('single item added to cart!');

        if(qty == 0 || qty == null){
            Swal.fire("", "Quantity required!", "warning")
            this.inputQty = 0;
            return false;
        }

        this.priceObj.map(product => {
            if(product.product_id == productID){
                // console.log('selected product: ', product);
                this.popupPrice = product.minPrice;
                return this.popupPrice;
            }
        })

        let data = {
            "cartId": this.cartID,
            "id": "",
            "itemCode": itemCode,
            "productId": productID,
            "quantity": qty
        }
        console.log('let data cart object: ', data)

        // pseudo cart 
        // 1 - If cart exists 
            // then - directly Add item to cart using cartID in checkCart method  

        // 2 - If cart not exists 
            // then - create cart first
            // then - get cart again to get the cartId 
            // then - Add item to cart by cartID  

        if(this.cartExist == true){

            this.apiService.postAddToCart(data).subscribe((res: any) => {

                console.log('add to cart resp: ', res)

                // Update item count in Cart 
                this.apiService.getCartItemByCartID(data.cartId).subscribe((res: any) => {
                    console.log('cart item by cart ID 2: ', res.data.content)

                    if (res.message){
                        this.cartitemDetails = res.data.content;
                        this.cartitemDetailsCount = this.cartitemDetails.length;

                        Swal.fire("Great!", "Item successfully added to cart", "success")
                        this.inputQty = 0;

                    } else {
                        Swal.fire("Great!", "Item failed", "error")
                    }

                }, error => {
                    Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
                }) 

            }, error => {
                Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
            }) 

        }else{

            let data = {
                "created": "2021-04-01T04:51:01.765Z",
                "customerId": this.senderID,
                "id": "",
                "storeId": this.storeID,
                "updated": "2021-04-01T04:51:01.765Z"
            }

            this.apiService.postCreateCart(data).subscribe((res: any) => {
                console.log('creating cart: ', res.data.content)

                if (res.message){

                    this.apiService.getCartList(this.senderID, this.storeID).subscribe((res: any) => {

                        console.log('cart obj: ', res.data.content)
                        if (res.message){
            
                            this.cart = res.data.content;
                            // if cart empty then initiate cart API
                            this.cartCount = this.cart.length;
            
                            if(this.cartCount > 0){
                                this.cartExist = true;
            
                                this.cartID = this.cart[0].id;
                                localStorage.setItem('cart_id', this.cartID);
            
                                console.log('cart id : ' + this.cartID)
            
                                // check count Item in Cart 
                                this.apiService.getCartItemByCartID(this.cartID).subscribe((res: any) => {
                                    console.log('cart item by cart ID 3: ', res.data.content)
            
                                    if (res.message){
                                        this.cartitemDetails = res.data.content;
                                        this.cartitemDetailsCount = this.cartitemDetails.length;
        
                                        // add to cart 
                                        this.apiService.postAddToCart(data).subscribe((res: any) => {
        
                                        }, error => {
                                            Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
                                        }) 
            
                                    } else {
            
                                    }
            
                                }, error => {
                                    Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
                                }) 
            
                            }else{
                                this.cartitemDetailsCount = 0;
                            }
                            
                        }else{
            
                        }
                    }, error => {
                        Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
                    }) 

                }else{

                }

            }, error => {
                Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
            }) 
        }  
    }

    getCategory(){
        this.apiService.getCategoryByStoreID(this.storeID).subscribe((res: any) => {

            console.log('category obj: ', res)
            

            if (res.message){

                if(res.data.content.length > 1){

                    // let data = {
                    //     "id": "a27e3a32-391c-4eb3-b76e-49c22ad1bce9",
                    //     "name": "All Item",
                    //     "parentCategoryId": null,
                    //     "storeId": "af2cda1a-d4ac-4a9e-b51b-fc5b32578e5b",
                    //     "thumbnailUrl": null
                    // }
                    
                    this.categories = res.data.content;

                    // this.categories.push(data);
                }else{
                    
                    // let data = {
                    //     "id": "a27e3a32-391c-4eb3-b76e-49c22ad1bce9",
                    //     "name": "All Item",
                    //     "parentCategoryId": null,
                    //     "storeId": "af2cda1a-d4ac-4a9e-b51b-fc5b32578e5b",
                    //     "thumbnailUrl": null
                    // }

                    this.categories = res.data.content;

                    // this.categories.push(data);
                    
                }

                // this.newCategories = this.categories
                console.log('newCategories getCategory: ', this.categories);
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
                // console.log('price: ', this.product[0].productInventories[1]);

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
                    
                    // console.log('Final Object: ', this.priceObj);
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
                console.log('getProduct(): ', this.product);
                // console.log('price: ', this.product[0].productInventories[1]);

                // return false;

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

                            // clean back clusterPriceArr  
                            this.clusterPriceArr = [];

                            inventoryArr.forEach( inventoryObj => {
                                // creating a collection of price array base on cluster item 
                                this.clusterPriceArr.push(inventoryObj.price);

                                // creating a collection of productInventories array to prepare base mapping 
                                // for logic that related to itemCode
                                this.allProductInventory.push(inventoryObj);
                            });

                            // get min price among the clusterPriceArr 
                            this.minVal = this.clusterPriceArr.reduce((a, b)=>Math.min(a, b));

                            let count = false

                            // map and stored the item object with minimum price to be shown on the catalogue list 
                            inventoryArr.map(item => {
                                if(item.price == this.minVal && !count){
                                    // console.log('selected product: ', product);

                                    count = true;
                                    this.catalogueList.push(item)
                                    return this.catalogueList;
                                }
                            })

                            // map and stored the item object with minimum price to be shown on the catalogue list 
                            // inventoryArr.map(item => {
                            //     if(item.price == this.minVal){
                            //         // console.log('selected product: ', product);
                            //         this.catalogueList.push(item)
                            //         return this.catalogueList;
                            //     }
                            // })
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
                    
                    // console.log('Final Object: ', this.priceObj);
                    
                });
                
                console.log('initial catalogue product: ', this.catalogueList)
                console.log('all product inventories: ', this.allProductInventory)

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

        // inventoryArr.map(item => {
        //     if(item.price == this.minVal){
        //         // console.log('selected product: ', product);
        //         this.catalogueList.push(item)
        //         return this.catalogueList;
        //     }
        // })

        // this.priceObj.map(product => {
        //     if(product.product_id == productid){
        //         // console.log('selected product: ', product);
        //         this.popupPrice = product.minPrice;
        //         return this.popupPrice;
        //     }
        // })

        // 1st popup will default item from catalogue list, which is the minimum price one 
        this.catalogueList.map(product => {
            if(product.productId == productid){
                console.log('selected product: ', product);
                this.popupPrice = product.price;
                this.popupItemCode = product.itemCode;
                // return this.popupPrice;
            }
        })

        // reinstantiate
        this.inputQty = 0;
        this.galleryImages = [];
        this.imageCollection = [];

        this.galleryOptions = [
            {
                width: '200px',
                height: '200px',
                thumbnailsColumns: 3,
                imageAnimation: NgxGalleryAnimation.Zoom,
                thumbnailsArrows: true,
                // previewDownload: true,
                imageArrowsAutoHide: true, 
                thumbnailsArrowsAutoHide: true
            },
            // max-width 767 Mobile configuration
            {
                breakpoint: 767,
                thumbnailsColumns: 2,
                width: '100%',
                height: '250px',
                imagePercent: 80,
                thumbnailsPercent: 30,
                thumbnailsMargin: 10,
                thumbnailMargin: 5,
            }
        ];

        this.apiService.getProductSByProductID(productid).subscribe((res: any) => {

            // console.log('product details:', res.data);

            let product_details = res.data;

            if (res.message) {
                this.details = product_details;
                // console.log('details data: ' , this.details['name']);

                // when product id is triggered, kindly fetch product image
                this.galleryImagesInit = 'assets/image/food-sample1.jpg';
                
                // convert arr to obj 
                this.detailsObj = Object.assign({}, this.details);

                console.log('detailsObj: ', this.detailsObj)
                
                // this.detailPrice = this.detailsObj.productInventories[0].price;

                this.productAssets = this.detailsObj.productAssets;

                this.productAssets.forEach( obj => {
                    // console.log('productAssets: ', obj.url);

                    let img_obj = {
                        small: ''+obj.url+'',
                        medium: ''+obj.url+'',
                        big: ''+obj.url+''
                    }

                    this.imageCollection.push(img_obj)
                });

                console.log('imageCollection: ', this.imageCollection);
                
                this.galleryImages = this.imageCollection
                
            } else {

            }

        }, error => {
            Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
        }) 
    }


    deleteItem(id, productID){

        console.log('deleted product_id: ' + productID + "| id: " + id)

        // return false;
        console.log('cart Id delete: ' + this.cartID)

        // return false;

        let data = {
            "cartId": this.cartID,
            "id": id,
            "itemCode": productID,
            "productId": productID,
            "quantity": "1"
          }

        this.apiService.deleteCartItemID(data, id).subscribe((res: any) => {

            if (res.message){
                console.log('delete response : ', res)

                // Update item count in Cart 
                this.apiService.getCartItemByCartID(data.cartId).subscribe((res: any) => {
                    // console.log('cart item by cart ID: ', res.data.content)

                    if (res.message){
                        this.cartitemDetails = res.data.content;
                        this.cartitemDetailsCount = this.cartitemDetails.length;

                        Swal.fire({
                            icon: 'info',
                            title: 'Item successfully deleted',
                            showConfirmButton: false,
                            timer: 1000
                        })

                    } else {

                    }

                }, error => {
                    Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
                }) 

            } else {

            }

        }, error => {
            Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
        }) 

    }


    getCartItemDetails(){
        
        console.log('masok')
        
        // check count Item in Cart 
        this.apiService.getCartItemByCartID(this.cartID).subscribe((res: any) => {
            console.log('cart item from Cart Item Details: ', res.data.content)

            if (res.message){
                this.cartitemDetails = res.data.content;
                this.cartitemDetailsCount = this.cartitemDetails.length;

            } else {

            }

        }, error => {
            console.log(error)
        }) 

    }

    checkQuantity(){
        console.log('Change Quantity: ' + this.inputQty);
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
