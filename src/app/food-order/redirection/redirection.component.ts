import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap  } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import { ApiService } from './../api.service';
import { PlatformLocation } from "@angular/common";

@Component({
  selector: 'app-redirection',
  templateUrl: './redirection.component.html',
  styleUrls: ['./redirection.component.css']
})
export class RedirectionComponent implements OnInit {

    refID: string;
    storeID: string;
    senderID: string;
    cartID: string;
    name: any;
    email: any;
    phone: any;
    amount: any;
    hash: any;
    status_id: any;
    order_id: any;
    transaction_id: any;
    msg: any;
    subDomain: string;

    currBaseURL:any;
    localURL:any;

  constructor(
    private route: Router,
    private activatedRoute: ActivatedRoute,
    private cookieService: CookieService,
    private apiService: ApiService,
    private platformLocation: PlatformLocation
  ) {


    // { path: "return/:name/:email/:phone/:amount/:hash/:status_id/:order_id/:transaction_id/:msg", component: RedirectionComponent },

    // get url parameter style e.g http://localhost:4200/catalogue?store_id=3
    this.activatedRoute.queryParams.subscribe(params => {
    
        this.name = params['name']
        this.email = params['email']
        this.phone = params['phone']
        this.amount = params['amount']
        this.hash = params['hash']
        this.status_id = params['status_id']
        this.order_id = params['order_id']
        this.transaction_id = params['transaction_id']
        this.msg = params['msg']
  
    });

    const allCookies: {} = this.cookieService.getAll();

    console.log('All cookies: ', allCookies)

   }

   async ngOnInit() {

        if(this.status_id == "1" || this.status_id == 1){
            this.status_id = "SUCCESS"
        }else{
            this.status_id = "FAILED"
        }

        const getOrdersByID = await this.getOrdersByID(this.order_id)
        console.log("getStore Data", getOrdersByID)

        this.storeID = getOrdersByID['storeId'];
        this.cartID = getOrdersByID['cartId'];

        // set back the cartID 
        localStorage.setItem('cart_id', this.storeID)
        localStorage.setItem('anonym_cart_id', this.storeID)

        // checkCart() will wait getProduct() to finished 
        const getMerchantInfo = await this.getMerchantInfo(this.storeID)
        console.log("getMerchantInfo Data", getMerchantInfo)

        this.subDomain = getMerchantInfo['domain']

        this.currBaseURL = (this.platformLocation as any).location.origin;
        // var domainTLD = this.currBaseURL.split('.')[2];
        var domainTLD = this.currBaseURL.split('.')[1]

        // console.log(this.currBaseURL);

        const url = "https://" + this.subDomain + "." + domainTLD + "/thankyou/"+this.status_id+"/"+this.msg
        // const testurl = "http://" + this.subDomain + ".test:4200/thankyou/"+this.status_id+"/"+this.msg

        alert('Domain:' + this.currBaseURL + '| subDomain: ' + this.subDomain + '| TLD: ' + domainTLD)
        // window.open(url,"_self");

  }

  getOrdersByID(order_id){

    return new Promise(resolve => {

        // get store id by order id 
        this.apiService.getOrdersByID(order_id).subscribe((res: any) => {
            
            resolve(res.data)

        }, error => {
            // Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
        })
            
    });

  }

  getMerchantInfo(store_id){
    return new Promise(resolve => {

        // get store id by order id 
        this.apiService.getStoreInfoByID(store_id).subscribe((res: any) => {
            
            resolve(res.data)

        }, error => {
            // Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
        })
            
    });
  }

}
