import { Component, OnInit } from '@angular/core';
import { ApiService } from './../api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PlatformLocation } from "@angular/common";

@Component({
  selector: 'food-app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css']
})
export class BannerComponent implements OnInit {
  currBaseURL: any;
    localURL: any;
    senderID: any;
    storeID: any;
    storeName: any;
    has_storeId: boolean = false;
    assets = {};
    bannerExist: boolean = false;
    storeDescription: any;
    storeDiscount:any = {};
    salesDiscount:any = {};
    deliveryDiscount:any = {};
    is_sales: boolean = true;
    is_delivery: boolean = false;
    vertical: any;
    hasBanner:any;
    isFnb: boolean = false;
    isEcomm: boolean = false;

  constructor(
    private apiService: ApiService,
    private platformLocation: PlatformLocation,
    private activatedRoute: ActivatedRoute,
  ) { 

        // get the store id base on subdomain
        this.currBaseURL = (this.platformLocation as any).location.origin;
        this.localURL = this.currBaseURL.match(/localhost/g);

        console.log('Banner Base URL: ' + this.currBaseURL)

        if(this.localURL != null){
            // use this for localhost
            // let defaultStore = "McD"
            let defaultStore = "217cc14c-fbf0-4af7-b927-9328458a61d0"

            // get url parameter style e.g http://localhost:4200/catalogue?store_id=3
            this.activatedRoute.queryParams.subscribe(params => {
                // this.refID = params['referenceId'];
                this.senderID = params['senderId'];
                this.storeID = params['storeId'];

                if(this.storeID == undefined){
                    this.storeID = defaultStore
                }

            });

            console.log('Location: Staging')

            this.storeName = "cinema-online"

        }else{
            console.log('Banner Location: Prod')
            var host = this.currBaseURL
            var subdomain = host.split('.')[0]

            console.log('Banner Subdomain: ' + subdomain)
            // console.log('removed https: ' + subdomain.replace(/^(https?:|)\/\//, ''))

            this.storeName = subdomain.replace(/^(https?:|)\/\//, '')

            // this.storeName = "mcd";
            console.log('Banner Storename: ' + this.storeName)

            // get url parameter style e.g http://localhost:4200/catalogue?store_id=3
            this.activatedRoute.queryParams.subscribe(params => {
                this.senderID = params['senderId'];
                this.storeID = params['storeId'];

                if(this.storeID){
                    this.has_storeId = true
                }
            });

        }
  }
  
  async ngOnInit(){
    
    // return false;
    console.log("Banner Calling FUNCTION getMerchantInfo")
    const storeInfo = await this.getMerchantInfo(this.storeName)
    console.log("Banner Receive FUNCTION getMerchantInfo, Store Info: ", storeInfo)

    this.storeID = storeInfo['id']
    this.storeDescription = storeInfo['storeDescription']
    this.vertical = storeInfo['verticalCode']

    // alert('vertical: ' + this.vertical)
    // this.storeName = storeInfo['name']

    if(this.vertical == "FnB" || this.vertical == "FnB_PK"){
        this.isFnb = true;
    }

    if(this.vertical == "ECommerece" || this.vertical == "ECommerece_PK"){
        this.isEcomm = true;
    }

    console.log('Banner StoreID: ' + this.storeID)
    // return false

    console.log("Banner Calling FUNCTION getAssets")
    const assetData = await this.getAssets(this.storeID)
    console.log("Banner Receive FUNCTION getAssets, Data: ", assetData)
    this.assets = assetData
    // this.cartID = created_cart['id'];

    // console.log('assets Data: ', this.assets)

    if(this.assets != null){
        this.bannerExist = true;
    }

    const storeDiscount = await this.getStoreDiscount(this.storeID)
    console.log('storeDiscount: ', storeDiscount)

    this.storeDiscount = storeDiscount

    this.storeDiscount.forEach(obj => {

        if(obj.discountType == "TOTALSALES"){
            this.salesDiscount = obj;
        }

        if(obj.discountType == "SHIPPING"){
            this.deliveryDiscount = obj;
        }

    });


    console.log('sales discount obj: ', this.salesDiscount)
    console.log('delivery discount obj: ', this.deliveryDiscount)

  }

  isSalesDiscount(){
    this.is_sales = true;
    this.is_delivery = false;

  }

  isDeliveryDiscount(){
    this.is_sales = false;
    this.is_delivery = true;
  }

  getStoreDiscount(storeID){

    return new Promise(resolve => {
        // check count Item in Cart 
        this.apiService.getStoreActiveDiscount(storeID).subscribe((res: any) => {
            // console.log('Banner Receive BACKEND getStoreAssets');
            resolve(res.data)
        }, error => {
            // Swals.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
        }) 
        
    });

  }

  getMerchantInfo(storename){
    console.log('Banner Calling BACKEND getStoreInfo');
    return new Promise(resolve => {
        this.apiService.getStoreInfo(storename).subscribe((res: any) => {
            console.log('Banner Receive BACKEND getStoreInfo');
            resolve(res.data.content[0])
        }), error => {

        }
    })
  }

  getAssets(storeID){
    console.log('Banner Calling BACKEND getStoreAssets');
    return new Promise(resolve => {
        // check count Item in Cart 
        this.apiService.getStoreAssets(storeID).subscribe((res: any) => {
            console.log('Banner Receive BACKEND getStoreAssets');
            resolve(res.data)
        }, error => {
            // Swals.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
        }) 
        
    });

}

}
