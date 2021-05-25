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

  constructor(
    private apiService: ApiService,
    private platformLocation: PlatformLocation,
    private activatedRoute: ActivatedRoute,
  ) { 

        // get the store id base on subdomain
        this.currBaseURL = (this.platformLocation as any).location.origin;
        this.localURL = this.currBaseURL.match(/localhost/g);

        console.log('Base URL: ' + this.currBaseURL)

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
            console.log('Location: Prod')
            var host = this.currBaseURL
            var subdomain = host.split('.')[0]

            console.log('subdomain: ' + subdomain)
            console.log('removed https: ' + subdomain.replace(/^(https?:|)\/\//, ''))

            this.storeName = subdomain.replace(/^(https?:|)\/\//, '')

            // this.storeName = "mcd";
            console.log('storename: ' + this.storeName)

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
    
    // alert('storeID: ' + this.storeID)

    // return false;
    const storeInfo = await this.getMerchantInfo(this.storeName)
    console.log("store info...", storeInfo)

    this.storeID = storeInfo['id']
    console.log('storeID REAL: ' + this.storeID)
    // return false

    const assetData = await this.getAssets(this.storeID)
    console.log("asset Data...", assetData)
    this.assets = assetData
    // this.cartID = created_cart['id'];

    if(this.assets != null){
        this.bannerExist = true;
    }

  }

  getMerchantInfo(storename){
    return new Promise(resolve => {
        this.apiService.getStoreInfo(storename).subscribe((res: any) => {
            resolve(res.data.content[0])
        }), error => {

        }
    })
  }

  getAssets(storeID){

    return new Promise(resolve => {

        // check count Item in Cart 
        this.apiService.getStoreAssets(storeID).subscribe((res: any) => {
       
            resolve(res.data)

        }, error => {
            // Swals.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")

        }) 
        
    });

}

}
