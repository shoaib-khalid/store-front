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
            let defaultStore = "McD"

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

    const assetData = await this.getAssets()
    console.log("asset Data...", assetData)
    this.assets = assetData
    // this.cartID = created_cart['id'];

  }

  getAssets(){

    return new Promise(resolve => {

        // check count Item in Cart 
        this.apiService.getStoreAssets(this.storeID).subscribe((res: any) => {
       
            resolve(res.data)

        }, error => {
            // Swals.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")

        }) 
        
    });

}

}
