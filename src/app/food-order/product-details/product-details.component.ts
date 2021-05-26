import { Component, OnInit } from '@angular/core';
import { PlatformLocation } from "@angular/common";
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from './../api.service';
import { NgxGalleryOptions, NgxGalleryImage, NgxGalleryAnimation } from 'ngx-gallery-9';
import Swal from 'sweetalert2'

import { faCartPlus, faEye, faShoppingCart, faShoppingBag, faArrowCircleLeft, faMinusCircle, faPlusCircle, faTrashAlt } from '@fortawesome/free-solid-svg-icons';

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

    productName: any;
    productId: any;

    detailsObj: any = {};
    productAssets:any;

    galleryOptions: NgxGalleryOptions[];
    galleryImages: NgxGalleryImage[];
    imageCollection = [];
    currentVariant:any = [];

    itemWithinProduct:any;

    requestParamVariant:any;
    variantOfSelected: any;
    productPrice:any = 0;
    productItemCode: any;
    storeID:any;
    storeName:any;
    inputQty:any;

    cartID:any;
    cartitemDetailsCount:any;
    senderID:any;

    currBaseURL:any;
    localURL:any;
    cartLength:number;

    constructor(
        private activatedRoute: ActivatedRoute,
        private route: Router,
        private apiService: ApiService,
        private platformLocation: PlatformLocation
        ) {

        this.cartID = localStorage.getItem("anonym_cart_id")

        // this.currBaseURL = this.route.url;
        console.log('Base URL: ' + this.activatedRoute.snapshot.url[2].path)

        // url path style e.g http://209.58.160.20:4200/catalogue/3
        this.activatedRoute.params.subscribe(params => {
            this.productName = params['prodName'];
            this.storeName = params['storeName'];
            console.log('product name before: ' + this.productName); // Print the parameter to the console. 

            var re = /-/gi; 
            var str = this.productName;
            var newstr = str.replace(re, "%20"); 

            this.productName = newstr

            console.log('product name after: ' + this.productName); // Print the parameter to the console. 
            
        });

        this.productId = ""


        this.currBaseURL = (this.platformLocation as any).location.origin;
        this.localURL = this.currBaseURL.match(/localhost/g);

        if(this.storeName === undefined){
            this.storeName = "elo"
        }

        // this.storeID = "af2cda1a-d4ac-4a9e-b51b-fc5b32578e5a"
        console.log('storeName: ' + this.storeName)
   }

    async ngOnInit() {

        this.inputQty = 1

        this.cartID = localStorage.getItem("anonym_cart_id")
        console.log('cart session: ' + this.cartID)

        if(!this.cartID){
            console.log('cart session not exist!')
            
        }else{
            console.log('cart id exist ' + this.cartID)

            const cartDetails = await this.getItemDetails(this.cartID)
            console.log("cart item details ", cartDetails)
            console.log("cart item count is " + cartDetails['length'])

            this.cartLength = cartDetails['length']
        }

        this.galleryOptions = [
            {
                width: '450px',
                height: '450px',
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
                width: '100%',
                height: '350px',
                imagePercent: 80,
                thumbnailsPercent: 30,
                thumbnailsMargin: 10,
                thumbnailMargin: 5,
            }
        ];

        await this.getVariantFlow()

    }

    goToCheckout(){

        console.log(this.senderID+"-"+this.cartID+"-"+this.storeID)

        this.route.navigate(['checkout']);
    }

    async addToCart(){
        // alert('itemCode: ' + this.productItemCode + "| productID: " + this.productId + "| quantity: " + this.inputQty)

        if(!this.cartID){
            const created_cart = await this.createCart()
            console.log("creating anonymous cart finished...", created_cart)
            this.cartID = created_cart['id'];

            console.log('new cart_id created: ' + this.cartID)

            localStorage.setItem('anonym_cart_id', this.cartID)
            
        }else{
            console.log('cart id exist ' + this.cartID)
        }

        await this.addItemToCart(this.cartID, this.productItemCode, this.productId, this.inputQty)

        const cartDetails = await this.getItemDetails(this.cartID)
        console.log("cart item details ", cartDetails)
        console.log("cart item count is " + cartDetails['length'])

        this.cartLength = cartDetails['length']

        this.inputQty = 1
    }

    getItemDetails(cartID){

        return new Promise(resolve => {

            // check count Item in Cart 
            this.apiService.getCartItemByCartID(cartID).subscribe((res: any) => {
                // console.log('cart item by cart ID 3: ', res.data.content)

                resolve(res.data.content)

                if (res.message){
                    // this.cartitemDetails = res.data.content;
                    // this.cartitemDetailsCount = this.cartitemDetails.length;

                    // this.inputQty = 1;
                }

            }, error => {
                Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")

            }) 
            
        });

    }

    addItemToCart(cartID, itemCode, productID, qty){
        console.log("starting to add item to cart...")
        return new Promise(resolve => {

            let data = {
                "cartId": cartID,
                "id": "",
                "itemCode": itemCode,
                "productId": productID,
                "quantity": qty
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


    async getVariantFlow(){

        this.galleryImages = [];
        this.imageCollection = [];
        this.requestParamVariant = []


        const storeInfo = await this.getStoreInfo(this.storeName)
        console.log('promised storeInfo details: ', storeInfo)

        this.storeID = storeInfo[0]['id']
        console.log('store id: ' + this.storeID)

        const prodName = await this.getProductDetailsByName(this.productName, this.storeID)

        console.log('promised prodName details: ', prodName)

        this.productId = prodName['id']
        // this.productId = '676d58ce-5561-482f-a024-0728ef40b173'
        // this.productId = '2803e270-0e8c-40c0-8af5-98275dcf5894'
        // this.productId = 'b7b956ab-5a3d-46ee-a82d-ad520ed85c4e'
        // this.productId = 'c9543ed3-3208-41ff-a621-3d67b81521d1'

        // const prodDetails = await this.getProductByID(this.productId)

        // console.log('promised prod details: ' , prodDetails)

        this.detailsObj = prodName

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


        // Variant logic

        this.itemWithinProduct = this.detailsObj.productInventories

        console.log('item within product: ', this.itemWithinProduct)

        this.currentVariant = []

        // let variantOfSelected = this.selectedProduct.productInventoryItems
        let minimum_item = this.itemWithinProduct.reduce((r, e) => r.price < e.price ? r : e);
        console.log('minimum item: ', minimum_item)

        this.variantOfSelected = minimum_item.productInventoryItems
        this.productPrice = minimum_item.price;
        this.productItemCode = minimum_item.itemCode;


        this.variantOfSelected.forEach(variants => {

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
        
    }

    getStoreInfo(store_name){
        console.log('initialize getStoreInfo...')
        
        return new Promise( resolve => {
        
            this.apiService.getStoreInfo(store_name).subscribe((res: any) => {
    
                if (res.message){
                    resolve(res.data.content)
                } 
    
            }, error => {
                Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
            }) 
        })
    }

    getProductDetailsByName(product_name, store_id){
        console.log('getProductDetailsByName(): ' + product_name)

        return new Promise( resolve => {
            
            this.apiService.getProductSByName(product_name, store_id).subscribe((res: any) => {
    
                if (res.message){
                    resolve(res.data.content[0])
                } 
    
            }, error => {
                Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
            }) 
        })
    }

    getProductByID(product_id){
        
        return new Promise( resolve => {
            
            this.apiService.getProductSByProductID(product_id).subscribe((res: any) => {
    
                if (res.message){
                    resolve(res.data)
                } 
    
            }, error => {
                Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
            }) 
        })

    }

    onChangeVariant(id, type, productID){
        // alert(id + "|" + type + "|" + productID)

        this.requestParamVariant.map( variant => {
            if(variant.basename == type && variant.variantID != id){

                console.log(variant.variantID + ' (' + type + ') has been replaced with ' + id + '(' + type + ')')

                this.requestParamVariant.find( oldVariant => oldVariant.basename === type).variantID = id
            }
            
        })

        console.log('updated request param: ', this.requestParamVariant)

        this.apiService.getUpdatedByVariant(this.storeID, productID, this.requestParamVariant).subscribe((res: any) => {
            // console.log('cart item by cart ID: ', res.data.content)

            if (res.message){
                console.log('getUpdatedByVariant response: ', res.data)

                this.productPrice = res.data[0].price
                this.productItemCode = res.data[0].itemCode
            } 

        }, error => {
            // Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
        }) 
    }

}
