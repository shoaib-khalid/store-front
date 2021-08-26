import { Component, OnInit, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
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

import { PlatformLocation } from "@angular/common";
import { not } from '@angular/compiler/src/output/output_ast';

import { version } from '../../../../package.json';



@Component({
    selector: 'app-landing',
    templateUrl: './landing.component.html',
    styleUrls: ['./landing.component.css']
  })
export class LandingComponent implements OnInit, AfterViewInit, OnDestroy {

    // @HostListener("window:onbeforeunload",["$event"])
    // clearLocalStorage(event){
    //     localStorage.clear();
    // }

    version:any = version;

    iconEye = faEye;
    iconCart = faShoppingCart;
    iconBag = faShoppingBag;
    iconBack = faArrowCircleLeft;
    iconAdd = faPlusCircle;
    iconMinus = faMinusCircle;
    iconTrash = faTrashAlt;

    isActive = true;

    // categories:Category[];
    //   product:Product[];
    categories:any[] = [];
    newCategories:Category[];
    product:any[] = [];
    leftNavDisabled = false;
    rightNavDisabled = false;
    idx = 0;
    details: any[] = [];
    modalDataTest:any = [];
    data = {};
    storeID:any = null;
    storeDeliveryPercentage:any;
    priceObj = [];
    clusterPriceArr = [];
    minVal:any;
    detailPrice:any = '0.00';
    galleryImagesInit:any;
    senderID:any = null;
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

    subTotal:any = 0;
    totalPrice:any;
    orderId:any;
    priceMapVariant:any;
    itemWithinProduct:any;
    selectedProduct:any = {};
    currentVariant:any = [];
    selectedVariantID:any;
    allVariantObj:any;
    selectedOption:any;
    variantOption:any;
    requestParamVariant:any = [];

    currBaseURL:any;
    storeName:any;
    storeContact:any;
    localURL:any;

    popupSKU: any;
    popupWeight: any;

    disableForm:boolean = false;
    dayArr = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

    store_close:boolean = true;
    storeTimingObj:any = {};

    currencySymbol:string = "";
    logoImage:any;
    bannerImage:any;
    storeInformation:any = [];
    showVersion: boolean = false;

    constructor(
        private _databindService: DataBindService, 
        private route: Router,
        private activatedRoute: ActivatedRoute,
        private mScrollbarService: MalihuScrollbarService,
        private apiService: ApiService,
        private platformLocation: PlatformLocation
    ) { 
        
        // init clear localStorage
        // localStorage.clear();
        


        // get url parameter style e.g http://localhost:4200/catalogue?store_id=3
        // this.activatedRoute.queryParams.subscribe(params => {
        //     this.refID = params['referenceId'];
        //     this.senderID = params['senderId'];
        //     this.storeID = params['storeId'];
        //     console.log(this.refID + "-" + this.senderID + "-" + this.storeID); // Print the parameter to the console. 
        // });

        // url path style e.g http://localhost:4200/catalogue/3
        // this.activatedRoute.params.subscribe(params => {
        //     let date = params['store_id'];
        //     console.log(date); // Print the parameter to the console. 
        // });

        // get the store id base on subdomain
        this.currBaseURL = (this.platformLocation as any).location.origin;
        this.localURL = this.currBaseURL.match(/localhost/g);

        console.log('Catalogue Base URL: ' + this.currBaseURL)

        if(this.localURL != null){
            // use this for localhost
            // let defaultStore = "a6df650a-3792-4dc8-b3de-92508357276b"
            let defaultStore = "217cc14c-fbf0-4af7-b927-9328458a61d0"
            // this.storeID = 'McD'
            this.storeName = "mcd"

            // get url parameter style e.g http://localhost:4200/catalogue?store_id=3
            this.activatedRoute.queryParams.subscribe(params => {
                // this.refID = params['referenceId'];
                this.senderID = params['senderId'];
                this.storeID = params['storeId'];

                if(this.storeID == undefined){
                    this.storeID = defaultStore
                }

                console.log(this.refID + "-" + this.senderID + "-" + this.storeID); // Print the parameter to the console. 
            });

            localStorage.setItem('store_id', this.storeID)
            localStorage.setItem('sender_id', this.senderID)

            console.log('Location: Staging')
        }else{
            console.log('Catalogue Location: Prod')
            var host = this.currBaseURL
            var subdomain = host.split('.')[0]

            console.log('Catalogue Subdomain: ' + subdomain)
            // console.log('removed https: ' + subdomain.replace(/^(https?:|)\/\//, ''))

            this.storeName = subdomain.replace(/^(https?:|)\/\//, '')

            // this.storeName = "mcd";
            console.log('Catalogue Storename: ' + this.storeName)

            // get url parameter style e.g http://localhost:4200/catalogue?store_id=3
            this.activatedRoute.queryParams.subscribe(params => {
                this.senderID = params['senderId'];
                this.storeID = params['storeId'];

                console.log('Catalogue SenderID: ' + this.senderID); 
                console.log('Catalogue StoreID: ' + this.storeID); 

                var whatuser = (!this.senderID) ? console.log('Catalogue Customer: Anonymous') : console.log('Catalogue Customer: ' + this.senderID)

            });

            localStorage.setItem('sender_id', this.senderID)

        }

    }

    ngOnInit(): void {
        console.log('Catalogue On Page Load');
        // this is for initial base setup 

        // alert('version: ' + version)

        if(this.localURL != null){

            //Staging

            this.getProduct();

            this.getCategory();

            if(this.senderID){
                this.checkCart();
                console.log('senderId exist!' + this.senderID)
            }else{

                // sessionStorage = only for current browser, The data survives page refresh, but not closing/opening the tab
                // localStorage = The data does not expire. It remains after the browser restart and even OS reboot. Shared between all tabs and windows from the same origin.
                this.cartID = localStorage.getItem("anonym_cart_id")
                // var sesStoreName = localStorage.getItem('store_name')

                if(this.cartID){
                    this.getItemDetails(this.cartID)
                }else{
                    this.cartitemDetailsCount = 0;
                }

                console.log('you are anonymous')
            }
            
        } else {
            // Production
            
            if(!this.storeID){
                console.log('Catalogue StoreID is '+this.storeID+', calling FUNCTION getMerchantInfo Function')
                this.getMerchantInfo(this.storeName)
            } else {
                console.log('Catalogue StoreID is '+this.storeID+', calling FUNCTION skipMerchantInfo Function')
                this.skipMerchantInfo()

                // get Assets Data 
                this.getAssets(this.storeID)
                // this.assets = assetData
            }

            // this.getStoreCurrency(this.storeID)

        }
    }

    goToCategory(catId){

        // alert(catId)

        // return false;
        this.route.navigate(['catalogue/'+catId]);
        // alert('Hello')
    }

    getAssets(storeID){
        this.apiService.getStoreAssets(storeID).subscribe((res: any) => {
            console.log('ASSET Data: ', res)

            this.bannerImage = res.data.bannerUrl
            this.logoImage = res.data.logoUrl
        }, error => {
            // Swals.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
        }) 
    }

    getMerchantInfo(storename){
        console.log('Catalogue Calling BACKEND getStoreInfo');

        this.storeInformation = []

        this.apiService.getStoreInfo(storename).subscribe((res: any) => {
            console.log('Catalogue Receive BACKEND getStoreInfo');
            console.log('Catalogue Store Information: ', res.data.content)

            let data = res.data.content[0]
            let exist = data.length

            this.storeInformation = res.data.content[0]

            if (res.message){

                if(exist == 0){
                    Swal.fire("Ops!", "Store information not exist!", "error")

                    return false
                }

                this.storeID = data.id;

                this.storeContact = data.phoneNumber;
                // since checkout page does query store service , i passed this storeDeliveryPercentage via local storage.. lol
                this.storeDeliveryPercentage = data.serviceChargesPercentage;

                this.getProduct()

                // this.getProductNew();
                this.getCategory();

                this.getStoreHour();

                this.getAssets(this.storeID)

                // check cart first 
                // this.checkCart();

                //add block prod here

                if(this.senderID){
                    this.checkCart();
                    console.log('senderId exist!' + this.senderID)
                }else{
    
                    // sessionStorage = only for current browser, The data survives page refresh, but not closing/opening the tab
                    // localStorage = The data does not expire. It remains after the browser restart and even OS reboot. Shared between all tabs and windows from the same origin.
                    this.cartID = localStorage.getItem("anonym_cart_id")
                    // var sesStoreName = localStorage.getItem('store_name')
    
                    if(this.cartID){
                        this.getItemDetails(this.cartID)
                    }else{
                        this.cartitemDetailsCount = 0;
                    }
    
                    console.log('you are anonymous')
                }

                console.log('id: ' + this.storeID)
                console.log('store_delivery_percentage: ' + this.storeDeliveryPercentage)
                localStorage.setItem('store_id', this.storeID);
                localStorage.setItem('store_delivery_percentage', this.storeDeliveryPercentage);

            } else {
                Swal.fire("Great!", "Item failed", "error")
            }

        }, error => {
            Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
        }) 

    }

    getProduct() {

        this.catalogueList = []

        // console.log('Calling Backend getProductSByStoreID');
        this.apiService.getProductSByStoreID(this.storeID).subscribe((res: any) => {
            // console.log('Receive Backend getProductSByStoreID');
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
                                    console.log('catalogueList: ', this.catalogueList)
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

    async flow_anonymCheckCartItem(){

        const created_cart = await this.createCart()
        console.log("creating anonymous cart finished...", created_cart)
        this.cartID = created_cart['id'];

        await this.checkCartItemByID(this.cartID)
        console.log("checking cart item["+ this.cartID+"] is finished...")

    }

    async flow_anonymAddToCart(itemCode, productID, qty, price, weight, sku){


        console.log("the SKU value: "+ sku);

        console.log("init flow_anonymAddToCart.... ")

        // var sesStoreName = localStorage.getItem('store_name')

        

        if(!this.cartID){
            
            console.log('cart session not exist')
            const created_cart = await this.createCart()
            console.log("creating anonymous cart finished...", created_cart)
            this.cartID = created_cart['id'];
            localStorage.setItem('anonym_cart_id', this.cartID)
            // localStorage.setItem('store_name', this.storeName)
            this.cartExist = true
            console.log('created cart id: ' + this.cartID)
        }

        const add_item = await this.addItemToCart(this.cartID, itemCode, productID, qty, price, weight, sku)
        console.log("item added to cart...")
        console.log("add item details ", add_item )

        const count_cart = await this.getItemDetails(this.cartID)
        console.log("starting to get cart item details...")
        console.log("cart item details ", count_cart)
        console.log("cart item count is " + count_cart['length'])

        // call countPrice to update new
        // const countTotal = await this.countPrice(this.allProductInventory)

    }

    getItemDetails(cartID){

        return new Promise(resolve => {

            // check count Item in Cart 
            this.apiService.getCartItemByCartID(cartID).subscribe(async (res: any) => {
                // console.log('cart item by cart ID 3: ', res.data.content)

                resolve(res.data.content)

                this.cartitemDetails = []

                if (res.message){
                    this.cartitemDetails = res.data.content;
                    // this.cartitemDetailsCount = this.cartitemDetails.length;
                    
                    this.inputQty = 1;

                    this.subTotal = 0;

                    var quantity = 0;
                    await this.cartitemDetails.forEach(allItem => {
                        this.subTotal = this.subTotal + (allItem.quantity * allItem.price);
                        // this.cartitemDetailsCount = this.cartitemDetailsCount + allItem.quantity
                        quantity = quantity + allItem.quantity
                        // console.log("miqdaad: "+JSON.stringify(allItem.quantity * allItem.price)+"\n");
                    });

                    this.cartitemDetailsCount = quantity
                }

            }, error => {
                Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")

            }) 
            
        });

    }

    addItemToCart(cartID, itemCode, productID, qty, price, weight, sku){
        console.log("starting to add item to cart...")
        return new Promise(resolve => {


            let data = {
                "cartId": cartID,
                "id": "",
                "itemCode": itemCode,
                "productId": productID,
                "quantity": qty,
                "price": price,
                "productPrice": price,
                "weight": weight,
                "SKU": sku
            }

            console.log('addItemToCart request data: ' , data)

            // add to cart 
            this.apiService.postAddToCart(data).subscribe((res: any) => {
                
                resolve(res.data)

                Swal.fire("Great!", "Item successfully added to cart", "success")

            }, error => {
                Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
            })
                
        });

    }

    createCart(){
        console.log("creating anonymous cart...")

        return new Promise(resolve => {

            let data = {
                "created": "2021-04-01T04:51:01.765Z",
                "customerId": this.senderID,
                "id": "",
                "storeId": this.storeID,
                "updated": "2021-04-01T04:51:01.765Z"
            }

            this.apiService.postCreateCart(data).subscribe((res: any) => {
                // resolve hold data as return 
                resolve(res.data)

            }, error => {
                Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
                // console.log('failed at postCreateCart')
            }) 
            
        });

    }

    skipMerchantInfo(){
        this.getProduct();
        // this.getProductNew();
        this.getCategory();

        this.getStoreHour();
        
        // check cart first 
        // this.checkCart();

        //add block prod here

        if(this.senderID){
            this.checkCart();
            console.log('senderId exist!' + this.senderID)
        }else{

            // sessionStorage = only for current browser, The data survives page refresh, but not closing/opening the tab
            // localStorage = The data does not expire. It remains after the browser restart and even OS reboot. Shared between all tabs and windows from the same origin.
            this.cartID = localStorage.getItem("anonym_cart_id")
            // var sesStoreName = localStorage.getItem('store_name')

            if(this.cartID){
                this.getItemDetails(this.cartID)
            }else{
                this.cartitemDetailsCount = 0;
            }

            console.log('you are anonymous')
        }

        console.log('id: ' + this.storeID)
        localStorage.setItem('store_id', this.storeID);
    }
  
    ngAfterViewInit(){
        // this.mScrollbarService.initScrollbar(document.body, { axis: 'y', theme: 'dark-3', scrollButtons: { enable: true } });
        // this.mScrollbarService.initScrollbar('#scrollable2', { axis: 'x', theme: 'dark-thin', scrollButtons: { enable: true } });
    }

    ngOnDestroy() {
        // custom cleanup upon closing browser tab
        // this.mScrollbarService.destroy(document.body);
        // this.mScrollbarService.destroy('#scrollable2');


    }

    goToCheckout(){

        console.log(this.senderID+"-"+this.cartID+"-"+this.storeID)

        this.route.navigate(['checkout']);
    }

    goToDetails(prodName){

        // alert(prodName)

        // return false;
        this.route.navigate(['products/name/'+prodName]);
        // alert('Hello')
    }

    checkCartItemByID(cartID){
        // check count Item in Cart 
        this.apiService.getCartItemByCartID(cartID).subscribe((res: any) => {
            console.log('cart item by cart ID 1: ', res.data.content)

            this.cartitemDetails = []

            if (res.message){
                this.cartitemDetails = res.data.content;
                // this.cartitemDetailsCount = this.cartitemDetails.length;

                this.cartitemDetails.forEach(allItem => {
                    this.cartitemDetailsCount = this.cartitemDetailsCount + allItem.quantity
                });

            } else {

            }

        }, error => {
            console.log(error)
        }) 
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

                    this.checkCartItemByID(this.cartID)

                }else{
                    this.cartitemDetailsCount = 0;
                }
                
            }else{

            }
        }, error => {
            console.log(error)
        }) 
    }

    addToCart(event, productID, itemCode, option, price, weight ,sku){

        // alert("productID: " + productID + " itemCode: " + itemCode + " option: " + option)
        // return false;
        // pseudo quantity & option
        // if option 1 then add single item 
        // if option 2 then use this.inputQty 

        // console.log('Change Quantity: ' + this.inputQty);
        
        let qty = 1;
        // replace qty if option is 2
        option == 2 ? qty = this.inputQty : console.log('single item added to cart!');

        if(qty == 0 || qty == null){
            Swal.fire("", "Quantity required!", "warning")
            this.inputQty = 1;
            return false;
        }

        // let data = {
        //     "cartId": this.cartID,
        //     "id": "",
        //     "itemCode": itemCode,
        //     "productId": productID,
        //     "quantity": qty
        // }
        let data = {
            "cartId": this.cartID,
            "id": "",
            "itemCode": itemCode,
            "productId": productID,
            "quantity": qty,
            "price": price,
            "productPrice": price,
            "weight": weight,
            "SKU": sku
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

            console.log('masok cartExist true')

            this.apiService.postAddToCart(data).subscribe((res: any) => {

                console.log('add to cart resp: ', res)

                // Update item count in Cart 
                this.apiService.getCartItemByCartID(data.cartId).subscribe((res: any) => {
                    console.log('cart item by cart ID 2: ', res.data.content)

                    this.cartitemDetails = []

                    if (res.message){
                        this.cartitemDetails = res.data.content;

                        // set back to zero and re-count 
                        this.cartitemDetailsCount = this.cartitemDetailsCount + qty;

                        // this.cartitemDetails.forEach(allItem => {
                        //     this.cartitemDetailsCount = this.cartitemDetailsCount + allItem.quantity

                        // });

                        Swal.fire("Great!", "Item successfully added to cart", "success")
                        this.inputQty = 1;

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

            console.log('masok cartExist false' + price)

            if(this.senderID){

                let new_data = {
                    "created": "2021-04-01T04:51:01.765Z",
                    "customerId": this.senderID,
                    "id": "",
                    "storeId": this.storeID,
                    "updated": "2021-04-01T04:51:01.765Z"
                }
    
                this.apiService.postCreateCart(new_data).subscribe((res: any) => {
                    console.log('creating cart: ', res)
    
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
                
                                        this.cartitemDetails = []

                                        if (res.message){
                                            this.cartitemDetails = res.data.content;
                                            // this.cartitemDetailsCount = this.cartitemDetails.length;
                                            // set back to zero and re-count 
                                            this.cartitemDetailsCount = this.cartitemDetailsCount + qty;
            
                                            // add to cart 
                                            this.apiService.postAddToCart(data).subscribe((res: any) => {
            
                                            }, error => {
                                                Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
                                                console.log('failed at postAddToCart')
                                            }) 
                
                                        } else {
                
                                        }
                
                                    }, error => {
                                        Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
                                        console.log('failed at getCartItemByCartID')
                                    }) 
                
                                }else{
                                    this.cartitemDetailsCount = 0;
                                }
                                
                            }else{
                
                            }
                        }, error => {
                            Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
                            console.log('failed at getCartList')
                        }) 
    
                    }else{
    
                    }
    
                }, error => {
                    Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
                    console.log('failed at postCreateCart')
                }) 

                
            }else{

                console.log("flow_anonymAddToCart" +
                            "\nitemCode: " + itemCode +
                            "\nproductID: " + productID +
                            "\nqty: " + qty +
                            "\nprice: " + price +
                            "\nweight: " + weight +
                            "\nsku: " + sku);
                this.flow_anonymAddToCart(itemCode, productID, qty, price, weight, sku)
            }

            
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
                this.selectedProduct = product
                this.popupPrice = product.price;
                this.popupItemCode = product.itemCode;
                this.popupSKU = product.sku;
                this.popupWeight = product.weight;
                // return this.popupPrice;
            }
        })

        // reinstantiate
        this.inputQty = 1;
        this.galleryImages = [];
        this.imageCollection = [];
        this.requestParamVariant = []

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

                // this.priceMapVariant = this.detailsObj

                this.itemWithinProduct = this.detailsObj.productInventories

                console.log('item within product: ', this.itemWithinProduct)

                this.currentVariant = []

                // this is redundant, later to be enhanced 
                let variantOfSelected = this.selectedProduct.productInventoryItems

                variantOfSelected.forEach(variants => {

                    console.log('selected item variant id: ', variants.productVariantAvailableId)

                    this.currentVariant.push(variants.productVariantAvailableId)
                });

                console.log('current variant obj:', this.currentVariant)
                // end of redundant code activity 

                // logic to extract current selected variant and to reconstruct new object with its string identifier 
                let allVariantObjBase = this.detailsObj.productVariants

                console.log('allVariantObjBase: ' , allVariantObjBase)

                allVariantObjBase.map(variantBase => {

                    console.log(variantBase)

                    let productVariantsAvailable = variantBase.productVariantsAvailable
                    
                    productVariantsAvailable.forEach(element => {
                        console.log('element: ' + element.id + " basename: " + variantBase.name)

                        this.currentVariant.map(currentVariant => {
                            console.log('currentVariant: ', currentVariant)

                            if(currentVariant.indexOf(element.id) > -1){
                                console.log(element.id + ' exist in array')

                                let data = {
                                    basename: variantBase.name,
                                    variantID: element.id,
                                }

                                this.requestParamVariant.push(data)
                            }
                        })

                    })

                })

                console.log('requestParamVariant: ' , this.requestParamVariant)

                // console.log('data: ' , this.allVariantObj)
                
            } else {

            }

        }, error => {
            Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
        }) 
    }

    onChangeVariant(id, type, productID){

        // alert(id + "|" + type)

        this.requestParamVariant.map( variant => {
            if(variant.basename == type && variant.variantID != id){

                console.log(variant.variantID + ' (' + type + ') has been replaced with ' + id + '(' + type + ')')

                this.requestParamVariant.find( oldVariant => oldVariant.basename === type).variantID = id
            }
            
        })

        console.log('updated request param: ', this.requestParamVariant)

        this.apiService.getUpdatedByVariant(this.storeID, productID, this.requestParamVariant).subscribe((res: any) => {
            console.log('cart item by cart ID: ', res.data)

            if (res.data){
                console.log('getUpdatedByVariant response: ', res.data)

                // this.catalogueList.map(product => {
                //     if(product.productId == productID){
                //         console.log('selected product: ', product);
                //         this.selectedProduct = product
                //         this.popupPrice = product.price;
                //         this.popupItemCode = product.itemCode;
                //     }
                // })

                this.popupPrice = res.data[0].price
                this.popupItemCode = res.data[0].itemCode

                console.log('update price variant: ' + this.popupPrice)
            } 

        }, error => {
            Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
        }) 

    }

    getItemByVariant(event, id){
        alert(id)
        // this.moreThan = false;
        console.log(event)
        this.selectedVariantID = id

        console.log('targer id: ' + event.target.id)

        this.selectedOption = id;

        // if(event.target.id == id){
        //     event.srcElement.classList.add("active")
        // }else{
        //     event.srcElement.classList.remove("active")
        // }
  
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

                    this.cartitemDetails = []

                    if (res.message){
                        this.cartitemDetails = res.data.content;
                        this.cartitemDetailsCount = 0;
                        this.subTotal = 0;

                        this.cartitemDetails.forEach(allItem => {
                            this.subTotal = this.subTotal + (allItem.quantity * allItem.price);
                            this.cartitemDetailsCount = this.cartitemDetailsCount + allItem.quantity
                        });

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

            this.cartitemDetails=[]

            if (res.message){
                this.cartitemDetails = res.data.content;
                // this.cartitemDetailsCount = this.cartitemDetails.length;

                // this.cartitemDetails.forEach(allItem => {
                //     this.cartitemDetailsCount = this.cartitemDetailsCount + allItem.quantity
                // });

            } else {

            }

        }, error => {
            console.log(error)
        }) 

    }

    checkQuantity(){
        console.log('Change Quantity: ' + this.inputQty);
    }

    // onGetCategoriesItem(categoryId){

    //     // alert('here')
        

    //     console.log('Category ID: ' + categoryId);

    //     this.apiService.getProductSByCategory(categoryId, this.storeID).subscribe((res: any) => {
    //         console.log('getProductSByCategory resp:', res.data.content)
    //         let new_product = res.data.content;
    //         if (res.message) {
    //             // this.details = product_details;
    //             // this.detailPrice = product_details.productInventories.price;
    //             this.product = new_product;
    //             console.log('new product: ', this.product);
    //         } else {

    //         }

    //     }, error => {
    //         console.log(error)
    //     }) 

    // }

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

    async adjustItem(itemId, productId, itemCode, operation, index){
        // alert("itemId: "+itemId+
        //     " \nproductId: " + productId +
        //     " \nitemCode: " + itemCode +
        //     " \ncartId: " + this.cartID +
        //     " \noperation: " + operation +
        //     " \nindex: " + index);

        // front end quantity
        let minQtty = 1;
        let maxQtty = 10;
        if ((this.cartitemDetails[index].quantity <= minQtty) && operation == "-1") {
            this.cartitemDetails[index].quantity = minQtty;
            Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + "Item can't be less than " + minQtty + "</small>", "error")
        } else if ((this.cartitemDetails[index].quantity >= maxQtty) && operation == "1") {
            this.cartitemDetails[index].quantity = maxQtty;
            Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + "Item can't be more than " + maxQtty + "</small>", "error")

        } else {
            // front end quantity
            this.cartitemDetails[index].quantity = this.cartitemDetails[index].quantity + operation;
            // back end quantity
            // this.updateCartItem(itemId, operation);
            this.putCartItem(itemId, productId, itemCode , this.cartitemDetails[index].quantity);

            this.subTotal = 0;
            this.cartitemDetailsCount = 0;
            await this.cartitemDetails.forEach(allItem => {
                // console.log("itemId: "+itemId+"\n"+"allItem.itemId: "+JSON.stringify(allItem.id)+"\n");
                this.subTotal = this.subTotal + (allItem.quantity * allItem.price);
                this.cartitemDetailsCount = this.cartitemDetailsCount + allItem.quantity
                // console.log("OK OK OK")
                // console.log("miqdaad: "+JSON.stringify(allItem.quantity * allItem.price)+"\n");
            });

        }
        
        // backend quantity
        // console.log("cartitemDetails: "+ JSON.stringify(this.cartitemDetails[index]))
    }

    updateCartItem(itemId, operation){
        // alert("itemId: "+itemId+" | cartId: "+this.cartID+" | operation: "+operation);

        let data = {
            "cartId": this.cartID,
            "id": itemId,
            "quantityChange": operation
        }

        this.apiService.updateCartItem(data).subscribe((res: any) => {
            console.log('updateCartItem result: ', res)
            if (res.message){
                console.log('operation successfull')
            } else {
                console.log('operation failed')
            }
        }, error => {
            console.log(error)
        }) 
    }

    putCartItem(itemId, productId, itemCode, quantity){
        // alert("itemId: "+itemId+" | cartId: "+this.cartID+" | operation: "+operation);

        let data = {
            "cartId": this.cartID,
            "id": itemId,
            "productId": productId,
            "itemCode": itemCode,
            "quantity": quantity
        }

        this.apiService.putCartItem(data).subscribe((res: any) => {
            console.log('updateCartItem result: ', res)
            if (res.message){
                console.log('operation successfull')
            } else {
                console.log('operation failed')
            }
        }, error => {
            console.log(error)
        }) 
    }

    clearCart(){
        console.log("clear cart initiated");
        this.deleteAllCartItem();
        console.log("clear cart finished");
    }

    deleteAllCartItem(){
        let data = {
            "cartId": this.cartID
        }

        this.apiService.deleteAllCartItem(data).subscribe((res: any) => {

            if (res.message){
                console.log('deleteAllCartItem response : ', res)

                // Update item count in Cart 
                this.apiService.getCartItemByCartID(data.cartId).subscribe(async (res: any) => {
                    // console.log('cart item by cart ID: ', res.data.content)

                    this.cartitemDetails=[]
                    
                    if (res.message){
                        this.cartitemDetails = res.data.content;
                        this.cartitemDetailsCount = 0;

                        Swal.fire({
                            icon: 'info',
                            title: 'All Items successfully deleted',
                            showConfirmButton: false,
                            timer: 1000
                        })

                        this.subTotal = 0;
                        // await this.cartitemDetails.forEach(allItem => {
                        //     this.subTotal = this.subTotal + (allItem.quantity * allItem.price);
                        //     this.cartitemDetailsCount = this.cartitemDetailsCount + allItem.quantity
                        // });

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

    getStoreHour(){
        this.apiService.getStoreHoursByID(this.storeID).subscribe((res: any) => {
            console.log('store business hour: ', res)
            if (res.message){
                console.log('storeTiming : ', res.data.storeTiming)
                
                this.currencySymbol =  res.data.regionCountry.currencySymbol;

                console.log('symbol currency: ', this.currencySymbol)

                const currentDate = new Date();

                var todayDay = this.dayArr[currentDate.getDay()];

                var browserTime = new Date();

                this.storeTimingObj = res.data.storeTiming;

                this.storeTimingObj.forEach( obj => {

                    let dayObj = obj.day;

                    if(dayObj == todayDay){
                        // true = store closed ; false = store opened
                        let isOff = obj.isOff;

                        if (isOff == false) {
                            var openTime = new Date();
                            openTime.setHours(obj.openTime.split(":")[0], obj.openTime.split(":")[1], 0); 
                            var closeTime = new Date();
                            closeTime.setHours(obj.closeTime.split(":")[0], obj.closeTime.split(":")[1], 0); 

                            console.log("happy hour?")
                            if(browserTime >= openTime && browserTime < closeTime ){
                                console.log("WE ARE OPEN !");
                            }else{
                                console.log("OH No, sorry! between 5.30pm and 6.30pm");
                                this.store_close = false
                            }

                        } else {
                            console.log("WERE ARE CLOSED")
                            this.store_close = false
                        }
                    }
                });

            } else {
            }
        }, error => {
            console.log(error)
        }) 
    }

    showVersionPill(e){
        this.showVersion = !this.showVersion
    }

}

