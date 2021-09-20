import { Component, OnInit } from '@angular/core';
import { ApiService } from './../api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PlatformLocation } from "@angular/common";

@Component({
  selector: 'food-app-banner-catalogue',
  templateUrl: './banner-catalogue.component.html',
  styleUrls: ['./banner-catalogue.component.css']
})
export class BannerCatalogueComponent implements OnInit {
  currBaseURL: any;
    localURL: any;
    senderID: any;
    storeID: any;
    storeName: any;
    has_storeId: boolean = false;
    assets = {};
    bannerExist: boolean = false;
    logoExist: boolean = false;
    storeDescription: any;

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
    // this.storeName = storeInfo['name']

    console.log('Banner StoreID: ' + this.storeID)
    // return false

    console.log("Banner Calling FUNCTION getAssets")
    const assetData = await this.getAssets(this.storeID)
    console.log("Banner Receive FUNCTION getAssets, Data: ", assetData)
    this.assets = assetData
    // this.cartID = created_cart['id'];

    // console.log('assets Data: ', this.assets)

    if(this.assets['bannerUrl'] != null){
        this.bannerExist = true;
    }

    if(this.assets['logoUrl'] != null){
        this.logoExist = true
    }

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
