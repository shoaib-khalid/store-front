import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from "rxjs";
import { PlatformLocation } from "@angular/common";
// import { createConnection } from 'net';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

    currBaseURL: any;
    // endpointBaseURL: any;
    orderServiceURL: any;
    productServiceURL: any;
    userServiceURL: any;
    payServiceURL: any;
    token:any = 'accessToken';
    tokenPay:any = '73e7cf38-f390-4d4b-b2e8-7f24cbcf2f46';

    constructor(
        private http: HttpClient,
        private platformLocation: PlatformLocation
    ) {
        this.checkBaseUrl();
    }

    checkBaseUrl() {
        // console.log("api service loaded");
        // console.log((this.platformLocation as any).location.origin);
        this.currBaseURL = (this.platformLocation as any).location.origin;

        let prodURL = this.currBaseURL.match(/symplified.ai/g);
        let stagingURL = this.currBaseURL.match(/sandbox.symplified.ai/g);
        let localURL = this.currBaseURL.match(/localhost/g);

        if (prodURL != null) {
            // later if we have new production endpoint, kindly change all the endpoint under prodURL section 
            this.userServiceURL = "http://209.58.160.20:20921/";
            this.productServiceURL = "http://symplified.ai:7071/";
            this.payServiceURL = "https://209.58.160.20:6001/";
            this.orderServiceURL = "http://209.58.160.20:7072/";

        } else if (stagingURL != null) {
            this.userServiceURL = "http://209.58.160.20:20921/";
            this.productServiceURL = "http://symplified.ai:7071/";
            this.payServiceURL = "https://209.58.160.20:6001/";
            this.orderServiceURL = "http://209.58.160.20:7072/";

        } else {
            this.userServiceURL = "http://209.58.160.20:20921/";
            this.productServiceURL = "http://symplified.ai:7071/";
            this.payServiceURL = "https://209.58.160.20:6001/";
            this.orderServiceURL = "http://209.58.160.20:7072/";
        }
    }

    postAuthenticate(data) {
        return this.http.post(this.userServiceURL + "clients/authenticate", data);
    }

    getProductSByStoreID(storeID) {
    const header = {
        headers: new HttpHeaders().set("Authorization", `Bearer ${this.token}`),
    };
    const url =
        "products?featured=true" +
        "&page=0" +
        "&pageSize=20" +
        "&storeId=" +
        storeID;
        return this.http.get(this.productServiceURL + url, header);
    }

    // http://symplified.ai:7071/products/BeefBiryani?featured=true&page=0&pageSize=20
    getProductSByProductID(productID) {
        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${this.token}`),
        };
        const url =
            "products/"+ productID
            "?featured=true" +
            "&page=0" +
            "&pageSize=20";
            
            return this.http.get(this.productServiceURL + url, header);
        }

    getCategoryByStoreID(storeID){
        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${this.token}`),
        };
        const url =
            "store-categories?page=0" +
            "&pageSize=20" +
            "&storeId=" +
            storeID;
            return this.http.get(this.productServiceURL + url, header);
    }

    getProductSByCategory(categoryId, storeID) {
        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${this.token}`),
        };

        const url =
            "products?categoryId="+ categoryId +
            "&featured=true" +
            "&page=0" +
            "&pageSize=20" +
            "&storeId=" +
            storeID;

        return this.http.get(this.productServiceURL + url, header);
    }

    getCartList(customerID, storeID) {
        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${this.token}`),
        };
        // http://209.58.160.20:7072/carts?customerId=4&page=0&pageSize=20
        const url =
            "carts?customerId="+ customerID +
            "&page=0" +
            "&pageSize=20" +
            "&storeId=" + storeID;

        return this.http.get(this.orderServiceURL + url, header);
    }

    getCartItemByCartID(cartID) {
        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${this.token}`),
        };
        // http://209.58.160.20:7072/carts/3/items?page=0&pageSize=20
        const url =
            "carts/" + cartID + "/items?page=0"+
            "&pageSize=200";

        return this.http.get(this.orderServiceURL + url, header);
    }

    postPaymentLink(data):Observable<any> {

        const httpOptions = {
            headers: new HttpHeaders(
            { 
               'Authorization': `Bearer ${this.tokenPay}`,
               'Content-Type': 'application/json'
            })
        }

        const url = this.payServiceURL + "payments/makePayment";

        console.log('send: ', url, data, httpOptions)
        return this.http.post(url, data, httpOptions);
        // return this.http.get(this.payServiceURL + "payments/makePayment", httpOptions);
    }

    postAddToCart(data):Observable<any> {

        const httpOptions = {
            headers: new HttpHeaders(
            { 
               'Authorization': `Bearer ${this.token}`,
               'Content-Type': 'application/json'
            })
        }

        const url = this.orderServiceURL + "carts/" + data.cartId + "/items";

        return this.http.post(url, data, httpOptions);

    }
    
    // postAuthenticate(data) {
    //     return this.http.post(this.userServiceURL + "clients/authenticate", data);
    // }
    
    postCreateCart(data):Observable<any> {

        const httpOptions = {
            headers: new HttpHeaders(
            { 
               'Authorization': `Bearer ${this.token}`,
               'Content-Type': 'application/json'
            })
        }
        
        const url = this.orderServiceURL + "carts";
        return this.http.post(url, data, httpOptions);
    }

    postInitOrder(data):Observable<any> {

        const httpOptions = {
            headers: new HttpHeaders(
            { 
               'Authorization': `Bearer ${this.token}`,
               'Content-Type': 'application/json'
            })
        }
        
        const url = this.orderServiceURL + "orders";
        return this.http.post(url, data, httpOptions);
    }

    deleteCartItemID(data, id):Observable<any> {

        const httpOptions = {
            headers: new HttpHeaders(
            { 
               'Authorization': `Bearer ${this.token}`,
               'Content-Type': 'application/json'
            }),
            body: data
        }

        const url = this.orderServiceURL + "carts/"+data.cartId+"/items/"+id;

        return this.http.delete(url, httpOptions);

    }
    
}
