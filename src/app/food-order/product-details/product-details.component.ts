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

    productSeoName: any;
    productId: any;

    detailsObj: any = {};
    product:any[] = [];
    productAssets:any;

    galleryOptions: NgxGalleryOptions[];
    galleryImages: NgxGalleryImage[];
    imageCollection = [];
    currentVariant:any = [];

    itemWithinProduct:any;

    requestParamVariant:any = [];
    requestParamVariantNew:any = [];
    variantOfSelected: any;
    productPrice:any = 0;
    productItemCode: any;
    storeID:any;
    storeDeliveryPercentage:any;
    storeName:any;
    inputQty:any;

    cartID:any;
    cartitemDetailsCount:any;
    senderID:any;

    currBaseURL:any;
    localURL:any;
    cartLength:number;
    currencySymbol:string = "";
    addToInstruction: string = "";
    productSku: any;

    constructor(
        private activatedRoute: ActivatedRoute,
        private route: Router,
        private apiService: ApiService,
        private platformLocation: PlatformLocation
        ) {

        this.currBaseURL = (this.platformLocation as any).location.origin;
        this.localURL = this.currBaseURL.match(/localhost/g);
        console.log('Base URL: ' + this.currBaseURL)


        if(this.localURL != null){
            console.log('Location: Staging')
        } else {
            console.log('Location: Prod')
            var host = this.currBaseURL
            var subdomain = host.split('.')[0]

            console.log('Domain: ' + subdomain)
            console.log('removed https: ' + subdomain.replace(/^(https?:|)\/\//, ''))

            this.storeName = subdomain.replace(/^(https?:|)\/\//, '')
        }


        this.activatedRoute.params.subscribe(params => {
            this.productSeoName = params['prodSeoName'];
            this.storeName = (params['storeName']) ? params['storeName'] : this.storeName;
            console.log('product name before: ' + this.productSeoName); // Print the parameter to the console.             
        });

        // this.productId = ""

        // if(this.storeName === undefined){
        //     this.storeName = "elo"
        // }

        this.cartID = localStorage.getItem("anonym_cart_id")
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

        this.getStoreHour();

    }

    async getStoreHour(){

        const storeInfo = await this.getStoreInfo(this.storeName)
        console.log('getStoreHour storeID: ', storeInfo)

        this.storeID = storeInfo[0]['id']

        this.apiService.getStoreHoursByID(this.storeID).subscribe((res: any) => {
            console.log('store business hour: ', res)
            if (res.message){
                console.log('storeTiming : ', res.data.storeTiming)
                
                this.currencySymbol =  res.data.regionCountry.currencySymbol;

                console.log('symbol currency: ', this.currencySymbol)

            } else {
            }
        }, error => {
            console.log(error)
        }) 
    }

    goToCheckout(){

        console.log(this.senderID+"-"+this.cartID+"-"+this.storeID)

        this.route.navigate(['checkout']);
    }

    async addToCart(productPrice){
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

        await this.addItemToCart(this.cartID, this.productItemCode, this.productId, this.inputQty, productPrice, this.productSku, this.addToInstruction)

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

    addItemToCart(cartID, itemCode, productID, qty, price, sku, instruction){
        console.log("starting to add item to cart...")

        // alert(instruction)

        // return false;
        return new Promise(resolve => {

            // let data = {
            //     "cartId": cartID,
            //     "id": "",
            //     "itemCode": itemCode,
            //     "productId": productID,
            //     "quantity": qty,
            //     "specialInstruction": instruction
            // }

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
        this.storeDeliveryPercentage = storeInfo[0]['serviceChargesPercentage']

        console.log('store id: ' + this.storeID)
        console.log('store_delivery_percentage id: ' + this.storeDeliveryPercentage)
        localStorage.setItem('store_id', this.storeID);
        localStorage.setItem('store_delivery_percentage', this.storeDeliveryPercentage);
        
        const prodName = await this.getProductDetailsByName(this.productSeoName, this.storeID)

        console.log('promised prodName details: ', prodName)

        this.productId = prodName[0]['id']
        // this.productId = '676d58ce-5561-482f-a024-0728ef40b173'
        // this.productId = '2803e270-0e8c-40c0-8af5-98275dcf5894'
        // this.productId = 'b7b956ab-5a3d-46ee-a82d-ad520ed85c4e'
        // this.productId = 'c9543ed3-3208-41ff-a621-3d67b81521d1'

        // const prodDetails = await this.getProductByID(this.productId)

        // console.log('promised prod details: ' , prodDetails)

        this.detailsObj = prodName[0]
        this.product = prodName[0]

        this.productAssets = this.detailsObj.productAssets;
        
        console.log("detailsObj: "+ prodName[0]['description']);
        console.log("this.productAssets: ", this.productAssets);

    
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
        this.productSku = minimum_item.sku;


        this.variantOfSelected.forEach(variants => {

            console.log('selected item variant id: ', variants.productVariantAvailableId)

            this.currentVariant.push(variants.productVariantAvailableId)
        });

        console.log('current variant obj:', this.currentVariant)
        // end of redundant code activity 

        // image collection logic 

        this.productAssets.forEach( obj => {
            // console.log('productAssets: ', obj.url);

            let img_obj = {
                small: ''+obj.url+'',
                medium: ''+obj.url+'',
                big: ''+obj.url+''
            }

            console.log(obj.itemCode + " |||| " + this.productItemCode)
            if(obj.itemCode != this.productItemCode){
                this.imageCollection.push(img_obj)
            }
            
        });

        this.productAssets.forEach( obj => {
            // console.log('productAssets: ', obj.url);
            let img_obj = {
                small: ''+obj.url+'',
                medium: ''+obj.url+'',
                big: ''+obj.url+''
            }
            
            if(obj.itemCode == this.productItemCode){
                this.imageCollection.unshift(img_obj)
            }
            
        });

        console.log('imageCollection: ', this.imageCollection);
        this.galleryImages = this.imageCollection

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

    getProductDetailsByName(seo_name, store_id){
        console.log('getProductDetailsByName(): ' + seo_name)

        return new Promise( resolve => {
            
            this.apiService.getProductSByName(seo_name, store_id).subscribe((res: any) => {
    
                if (res.message){
                    // resolve(res.data.content[0])
                    resolve(res.data.content)
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

        this.requestParamVariantNew = []        

        this.requestParamVariant.forEach(el => {

            this.requestParamVariantNew.push(el.variantID)
            
        });

        console.log('updated request param: ', this.requestParamVariantNew)

        this.findInventory(productID)

        // return false;

        // this.apiService.getUpdatedByVariant(this.storeID, productID, this.requestParamVariant).subscribe((res: any) => {
        //     console.log('cart item by cart ID: ', res.data)

        //     if (res.data){
        //         console.log('getUpdatedByVariant response: ', res.data)


        //         this.popupPrice = res.data[0].price
        //         this.popupItemCode = res.data[0].itemCode

        //         console.log('update price variant: ' + this.popupPrice)
        //     } 

        // }, error => {
        //     Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
        // }) 

    }

    findInventory(productID) {
        var toFind = this.requestParamVariantNew

        console.log('test: ', productID)
        var productArr = this.detailsObj

        console.log('product: ', productArr)

        var inventories = productArr.productInventories

        var assetsArr = productArr.productAssets

        console.log('inventories: ', inventories)
        var flag = true;
        var selectedItem;

        var productInventoryItems;
        
        for (let i = 0; i < inventories.length; i++) {
            flag=true;
            selectedItem = inventories[i]

            productInventoryItems = inventories[i]['productInventoryItems']

            for (let j = 0; j < productInventoryItems.length; j++) {
                if(toFind.includes(productInventoryItems[j].productVariantAvailableId)){
                    continue;
                }else{
                    flag=false;
                    break;
                }
            }

            if(flag){
                console.log('selected item: ', selectedItem)

                this.productPrice = selectedItem.price
                this.productItemCode = selectedItem.itemCode
                this.productSku = selectedItem.sku

                // reorder image collection 

                this.galleryImages = [];
                this.imageCollection = [];

                this.productAssets = assetsArr;

                // rearrange imageCollection 
                this.productAssets.forEach( obj => {
                    // console.log('productAssets: ', obj.url);
                    let img_obj = {
                        small: ''+obj.url+'',
                        medium: ''+obj.url+'',
                        big: ''+obj.url+''
                    }
                    
                    if(obj.itemCode != this.productItemCode){
                        this.imageCollection.push(img_obj)
                    }
                    
                });

                this.productAssets.forEach( obj => {
                    // console.log('productAssets: ', obj.url);
                    let img_obj = {
                        small: ''+obj.url+'',
                        medium: ''+obj.url+'',
                        big: ''+obj.url+''
                    }
                    
                    if(obj.itemCode == this.productItemCode){
                        this.imageCollection.unshift(img_obj)
                    }
                    
                });


                console.log('new imageCollection: ', this.imageCollection);
                
                this.galleryImages = this.imageCollection
                // end of reorder image collection

                console.log('popup details: ' + this.productPrice + " | " + this.productItemCode + " | " + this.productSku)
            }
            
        }
    }

}
