import { Component, OnInit } from '@angular/core';
import { PlatformLocation } from "@angular/common";
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from './../api.service';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery-9';
import Swal from 'sweetalert2'

import { faCartPlus, faEye, faShoppingCart, faShoppingBag, faArrowCircleLeft, faMinusCircle, faPlusCircle, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { ProductService } from 'src/app/core/services/product/product.service';
import { element } from 'protractor';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {

    iconEye = faEye;
    iconCart = faShoppingCart;
    iconBag = faShoppingBag;
    iconBack = faArrowCircleLeft;
    iconAdd = faPlusCircle;
    iconMinus = faMinusCircle;
    iconTrash = faTrashAlt;
    iconAddItem = faCartPlus;

    // store
    store:any;
    storeID:any;
    storeName:any;
    storeDeliveryPercentage:any;
    storeBaseURL:any;
    storeCurrency:string = "";
    
    // product
    product: any = {};

    productSeoName: any;
    productAssets:any;

    displayedProductPrice:any = 0;
    displayedProductItemCode: any;
    displayedProductSku: any;

    // combo
    combos: any = [];
    currentCombo: any = [];

    // images
    imageCollection = [];
    galleryOptions: NgxGalleryOptions[] = [];
    galleryImages: NgxGalleryImage[] = [];

    // variant
    currentVariant:any = [];    
    requestParamVariant:any = [];
    requestParamVariantNew:any = [];
    
    // inventory item
    productInventories:any;
    selectedInventoryItems: any;

    // cart
    cartitemDetails:any = [];
    cartitemDetailsCount:number;
    cartLength:number;
    
    // client
    senderID:any;

    // user input
    userInputQuantity:number = 1;
    userInputInstruction: string = "";

    constructor(
        private activatedRoute: ActivatedRoute,
        private route: Router,
        private apiService: ApiService,
        private platformLocation: PlatformLocation,
        private _productService: ProductService
    ) {

        // Get current base URL
        this.storeBaseURL = (this.platformLocation as any).location.origin;
        // Get subdomain name from the base URL
        let subdomain = this.storeBaseURL.split('.')[0];
        // Remove unnecessary string from the subdomain name to get the store name 
        this.storeName = subdomain.replace(/^(https?:|)\/\//, '');

        // ger product seoName from path parameter
        this.activatedRoute.params.subscribe(params => {
            this.productSeoName = params['prodSeoName'];
        });

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    /**
     * Getter for cartID
     */
    get cartID$(): string
    {
        return localStorage.getItem("anonym_cart_id");
    }

    /**
     * Setter for cartID
     */
     set cartID(value: string)
     {
        localStorage.setItem('anonym_cart_id', value);
     }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------


    async ngOnInit() {

        // get current cartItem to be displayed at checkout button 
        // (this will now current cart item quantity)
        if (this.cartID$) {
            const cartDetails = await this.getCartItem(this.cartID$)
            this.cartLength = cartDetails['length']
        }

        /**
         * STORE
         */

        // get store info
        const storeInfo = await this.getStoreInfo(this.storeName)
        this.store = storeInfo[0];
        this.storeID = storeInfo[0]['id'];
        this.storeDeliveryPercentage = storeInfo[0]['serviceChargesPercentage'];

        // get getStoreHour
        this.getStoreHour(this.storeID);

        // set to local storage
        localStorage.setItem('store_id', this.storeID);
        localStorage.setItem('store_delivery_percentage', this.storeDeliveryPercentage);
        
        /**
         * PRODUCT
         */

        // get product info
        const _product = await this.getProductDetailsByName(this.productSeoName, this.storeID)        
        this.product = _product[0];
        this.productAssets = this.product.productAssets;
        this.productInventories = this.product.productInventories

        // get cheapest item price
        let _cheapestItem = this.productInventories.reduce((r, e) => r.price < e.price ? r : e);

        // set initial selectedInventoryItems to the cheapest item
        this.selectedInventoryItems = _cheapestItem.productInventoryItems;

        if (this.selectedInventoryItems) {
            this.displayedProductPrice = _cheapestItem.price;
            this.displayedProductItemCode = _cheapestItem.itemCode;
            this.displayedProductSku = _cheapestItem.sku;
        } else {
            this.displayedProductPrice = this.productInventories.price;
            this.displayedProductItemCode = this.productInventories.itemCode;
            this.displayedProductSku = this.productInventories.sku;
        }

        // get product package if exists
        if (this.product.isPackage) {
            this._productService.getProductPackageOptions(this.product.id)
            .subscribe((response)=>{
                console.log("response:", response);
                this.combos = response["data"];
                
                this.combos.forEach(element => {
                    this.currentCombo[element.id] = [];
                });

            });
        }

        
        /**
         * ASSETS GALLERY
         */

        // set galleryOptions
        this.galleryOptions = [
            {
                width: '350px',
                height: '350px',
                thumbnailsColumns: 3,
                imageAnimation: NgxGalleryAnimation.Slide,
                thumbnailsArrows: true,
                // previewDownload: true,
                imageArrowsAutoHide: true, 
                thumbnailsArrowsAutoHide: true,
                // "imageSize": "contain",
                "previewCloseOnClick": true, 
                "previewCloseOnEsc": true,
                // "thumbnailsRemainingCount": true
                
            },
            // max-width 767 Mobile configuration
            {
                breakpoint: 767,
                thumbnailsColumns: 2,
                width: '350px',
                height: '350px',
                // imagePercent: 100,
                // thumbnailsPercent: 30,
                // thumbnailsMargin: 10,
                // thumbnailMargin: 5,
            }
        ];

        // set currentVariant
        this.selectedInventoryItems.forEach(item => {
            this.currentVariant.push(item.productVariantAvailableId)
        });

        // set assets images
        this.productAssets.forEach( object => {
            let _imageObject = {
                small   : '' + object.url,
                medium  : '' + object.url,
                big     : '' + object.url
            }

            // fist this will push all images expect the one that are currently display
            if(object.itemCode != this.displayedProductItemCode){
                this.imageCollection.push(_imageObject)
            } 
        });

        // loop second one to push the one that are currently display in first array
        this.productAssets.forEach( object => {
            let _imageObject = {
                small   : '' + object.url,
                medium  : '' + object.url,
                big     : '' + object.url
            }
            
            if(object.itemCode == this.displayedProductItemCode){
                this.imageCollection.unshift(_imageObject)
            }
        });

        // set to galerry images
        this.galleryImages = this.imageCollection

        /**
         * VARIANTS
         */

        // logic to extract current selected variant and to reconstruct new object with its string identifier 
        // basically it create new array of object from this.product.productVariants to => this.requestParamVariant
        let _productVariants = this.product.productVariants
        console.log("this.product.productVariants", this.product.productVariants)
        console.log("this.currentVariant", this.currentVariant);
        _productVariants.map(variantBase => {
            let _productVariantsAvailable = variantBase.productVariantsAvailable;
            _productVariantsAvailable.forEach(element => {
                this.currentVariant.map(currentVariant => {
                    if(currentVariant.indexOf(element.id) > -1){
                        let _data = {
                            basename: variantBase.name,
                            variantID: element.id,
                        }
                        this.requestParamVariant.push(_data)
                    }
                })

            })
        });
        console.log("this.requestParamVariant", this.requestParamVariant) // amd you'll see

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Private methods
    // -----------------------------------------------------------------------------------------------------

    async getStoreHour(storeId: string){
        this.apiService.getStoreHoursByID(storeId).subscribe((res: any) => {
            if (res.message){                
                this.storeCurrency =  res.data.regionCountry.currencySymbol;
            } else {
            }
        }, error => {
            console.log(error)
        }) 
    }

    getCartItem(cartID){

        return new Promise(resolve => {
            // check count Item in Cart 
            this.apiService.getCartItemByCartID(cartID).subscribe((res: any) => {

                // resolve the data first for cartLength usage in above ngInit
                resolve(res.data.content);

                // count quantity from the backend and set to frontend
                if (res.message){
                    let quantity = 0;

                    this.cartitemDetails = res.data.content;
                    this.cartitemDetails.forEach(item => {
                        quantity = quantity + item.quantity;
                    });

                    // set item quantity in cart
                    this.cartitemDetailsCount = quantity;
                }
            }, error => {
                Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
            }) 
            
        });

    }

    createCart(){
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
            }) 
            
        });
        
    }

    addItemToCart(cartID, itemCode, productID, qty, price, sku, instruction){

        return new Promise(resolve => {
            let data = {
                "cartId": cartID,
                "id": "",
                "itemCode": itemCode,
                "productId": productID,
                "quantity": qty,
                "price": price,
                "productPrice": price,
                // "weight": weight,
                "SKU": sku,
                "specialInstruction": instruction
            }

            if(this.product.isPackage){
                data["cartSubItem"] = [];

                // loop all combos from backend
                this.combos.forEach(item => {
                    // compare it with current selected combo by user
                    if (this.currentCombo[item.id]) {
                        // loop the selected current combo
                        this.currentCombo[item.id].forEach(element => {
                            // get productPakageOptionDetail from this.combo[].productPackageOptionDetail where it's subitem.productId == element (id in this.currentcombo array)
                            let productPakageOptionDetail = item.productPackageOptionDetail.find(subitem => subitem.productId === element);
                            console.log("productPakageOptionDetail", productPakageOptionDetail)   
                            if (productPakageOptionDetail){
                                // push to cart
                                data["cartSubItem"].push(
                                    {
                                        SKU: productPakageOptionDetail.productInventory[0].sku,
                                        productName: productPakageOptionDetail.product.name,
                                        productId: element,
                                        itemCode: productPakageOptionDetail.productInventory[0].itemCode,  // this assume all product under fnb have only 1 inventory
                                        quantity: 1,
                                        productPrice: 0,
                                        specialInstruction: null
                                    }
                                );
                            }
                        });
                    }
                });
            }

            // add to cart 
            this.apiService.postAddToCart(data).subscribe((res: any) => {
                resolve(res.data)
                Swal.fire("Great!", "Item successfully added to cart", "success")
            }, error => {
                Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
            }) 
        });
    }

    getStoreInfo(storeName){        
        return new Promise( resolve => {
            this.apiService.getStoreInfo(storeName).subscribe((res: any) => {
                if (res.message){
                    resolve(res.data.content)
                } 
            }, error => {
                Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
            }) 
        })
    }

    getProductDetailsByName(seo_name, store_id){
        return new Promise( resolve => {            
            this.apiService.getProductSByName(seo_name, store_id).subscribe((res: any) => {
                if (res.message){
                    resolve(res.data.content)
                } 
            }, error => {
                Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
            }) 
        })
    }

    findInventory(productID) {

        let toFind = this.requestParamVariantNew

        let productArr = this.product
        let inventories = productArr.productInventories
        let assetsArr = productArr.productAssets


        let flag = true;
        let selectedItem;
        let productInventoryItems;
        
        for (let i = 0; i < inventories.length; i++) {
            flag=true;
            selectedItem = inventories[i]

            productInventoryItems = inventories[i]['productInventoryItems']

            for (let j = 0; j < productInventoryItems.length; j++) {
                if(toFind.includes(productInventoryItems[j].productVariantAvailableId)){
                    continue;
                }else{
                    flag = false;
                    break;
                }
            }

            if(flag){

                this.displayedProductPrice = selectedItem.price
                this.displayedProductItemCode = selectedItem.itemCode
                this.displayedProductSku = selectedItem.sku

                // reorder image collection 
                this.galleryImages = [];
                this.imageCollection = [];

                this.productAssets = assetsArr;

                // rearrange imageCollection 
                this.productAssets.forEach( object => {
                    // console.log('productAssets: ', obj.url);
                    let _imageObject = {
                        small   : '' + object.url,
                        medium  : '' + object.url,
                        big     : '' + object.url
                    }
                    
                    if(object.itemCode != this.displayedProductItemCode){
                        this.imageCollection.push(_imageObject)
                    }
                    
                });

                this.productAssets.forEach( object => {
                    let _imageObject = {
                        small   : '' + object.url,
                        medium  : '' + object.url,
                        big     : '' + object.url
                    }
                    
                    if(object.itemCode == this.displayedProductItemCode){
                        this.imageCollection.unshift(_imageObject)
                    }
                    
                });

                this.galleryImages = this.imageCollection
                // end of reorder image collection
            }
            
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    goToCheckout(){
        this.route.navigate(['checkout']);
    }

    async addToCart(){

        if(!this.cartID$){
            const created_cart = await this.createCart()
            console.log("creating anonymous cart finished...", created_cart)
            this.cartID = created_cart['id'];

            console.log('new cart_id created: ' + this.cartID$)

            localStorage.setItem('anonym_cart_id', this.cartID$)
            
        } else {
            console.log('cart id exist ' + this.cartID$)
        }

        await this.addItemToCart(this.cartID$, this.displayedProductItemCode, this.product.id, this.userInputQuantity, this.displayedProductPrice, this.displayedProductSku, this.userInputInstruction)

        const cartDetails = await this.getCartItem(this.cartID$)
        console.log("cart item details ", cartDetails)
        console.log("cart item count is " + cartDetails['length'])

        this.cartLength = cartDetails['length']

        // reset user input
        this.userInputQuantity = 1;
        this.userInputInstruction = "";
    }

    goToBack(){
        var catId = localStorage.getItem("category_id");

        //the local storage keep null in string
        if(catId !== 'null'){
            this.route.navigate(['catalogue/'+catId]);   
        }else{

            this.route.navigate(['catalogue/'+'all'])
        }
      
    }

    onChangeVariant(id, type, productID){     

        this.requestParamVariant.map( variant => {
            if(variant.basename == type && variant.variantID != id){
                this.requestParamVariant.find( oldVariant => oldVariant.basename === type).variantID = id
            }
        });

        this.requestParamVariantNew = [];
        this.requestParamVariant.forEach(element => {
            this.requestParamVariantNew.push(element.variantID)
        });

        this.findInventory(productID)
    }

    onChangeCombo(comboId, event){

        let productID = event.target.value;

        // remove only unchecked item in array
        if (event.target.checked === false) {
            let index = this.currentCombo[comboId].indexOf(productID);
            if (index !== -1) {
                this.currentCombo[comboId].splice(index, 1);
                return;
            }
        }

        let currentComboSetting = this.combos.find(item => item.id === comboId);

        // remove first item in array if it exceed totalAllow
        if (this.currentCombo[comboId].length >= currentComboSetting.totalAllow){
            this.currentCombo[comboId].shift();
        }

        // set currentCombo
        this.combos.forEach(combo => {
            combo.productPackageOptionDetail.forEach(item => {
                    

                if(item.productId === productID){
                    this.currentCombo[comboId].push(item.productId)
                }
            });
        });
    }

}