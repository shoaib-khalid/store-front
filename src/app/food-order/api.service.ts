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
    deliveryServiceURL: any;
    token:any = 'accessToken';
    tokenPay:any = 'accessToken';
    variantStr:string = "";

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

        let prodURL = this.currBaseURL.match(/symplified.store/g);
        let stagingURL = this.currBaseURL.match(/sandbox.symplified.ai/g);
        let localURL = this.currBaseURL.match(/localhost/g);

        if (prodURL != null) {
            // later if we have new production endpoint, kindly change all the endpoint under prodURL section 
            this.userServiceURL = "https://api.symplified.biz/v1/user-service/";
            this.productServiceURL = "https://api.symplified.biz/v1/product-service/";
            // this.payServiceURL = "https://209.58.160.20:6001/";
            this.payServiceURL = "https://api.symplified.biz/v1/payment-service/"
            this.orderServiceURL = "https://api.symplified.biz/v1/order-service/";
            // this.orderServiceURL = "http://209.58.160.20:7072/";
            this.deliveryServiceURL = "https://api.symplified.biz/v1/delivery-service/";

        } else if (stagingURL != null) {
            this.userServiceURL = "https://api.symplified.biz/v1/user-service/";
            this.productServiceURL = "https://api.symplified.biz/v1/product-service/";
            // this.payServiceURL = "https://209.58.160.20:6001/";
            this.payServiceURL = "https://api.symplified.biz/v1/payment-service/"
            this.orderServiceURL = "https://api.symplified.biz/v1/order-service/";
            // this.orderServiceURL = "http://209.58.160.20:7072/";
            this.deliveryServiceURL = "https://api.symplified.biz/v1/delivery-service/";

        } else {
            this.userServiceURL = "https://api.symplified.biz/v1/user-service/";
            this.productServiceURL = "https://api.symplified.biz/v1/product-service/";
            // this.payServiceURL = "https://209.58.160.20:6001/";
            this.payServiceURL = "https://api.symplified.biz/v1/payment-service/"
            this.orderServiceURL = "https://api.symplified.biz/v1/order-service/";
            // this.orderServiceURL = "http://209.58.160.20:7072/";
            this.deliveryServiceURL = "https://api.symplified.biz/v1/delivery-service/";
        }
    }

    postAuthenticate(data) {
        return this.http.post(this.userServiceURL + "clients/authenticate", data);
    }

    getStoreAssets(storeID){

        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${this.token}`),
        };
        const url =
            "stores/" + storeID +
            "/assets";

            return this.http.get(this.productServiceURL + url, header);

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

    getStoreInfo(storename) {
        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${this.token}`),
        };
        const url =
            "stores?name=" + storename +
            "&page=0" +
            "&pageSize=20";

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

    getProductSByName(name, store_id) {
        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${this.token}`),
        };

        const url =
            "stores/" + store_id +
            "/products?" +
            "&featured=true" +
            "&page=0" +
            "&pageSize=20" +
            "&name=" +
            name;

        console.log('URL: ' + this.productServiceURL + url)

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

    getOrderId(customerID, storeID){
        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${this.token}`),
        };
        // http://209.58.160.20:7072/orders?customerId=4&page=0&pageSize=20&storeId=b0c5d5bf-be25-465c-811a-44c20011d025
        const url =
            "orders?customerId="+ customerID +
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

    getUpdatedByVariant(storeId, productId, variantArr){
        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${this.token}`),
        };

        this.variantStr = ""

        variantArr.forEach((variant) => {

            if(variant.variantID === variantArr[variantArr.length - 1].variantID){
                this.variantStr += "variantIds=" + variant.variantID
            }else{
                this.variantStr += "variantIds=" + variant.variantID + "&"
            }

        });

        const url =
            "stores/" + storeId + 
            "/products/"+ productId +
            "/inventory?" + this.variantStr;

        console.log(url)

        return this.http.get(this.productServiceURL + url, header);
    }


    getCustomerProfileByEmail(email) {
        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${this.token}`),
        };

        const url =
            "customers/?email="+ email +
            "&page=0" +
            "&pageSize=20";

        return this.http.get(this.userServiceURL + url, header);
    }


    getCustomerProfileById(uuid) {
        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${this.token}`),
        };

        const url =
            "customer/" + uuid + "/address/?" +
            "page=0" +
            "&pageSize=20";

            // https://api.symplified.biz/v1/user-service/customer/acedr-uvbhnhk-okpbfk-jvhcxxg/address/?page=0&pageSize=20

        return this.http.get(this.userServiceURL + url, header);
    }

    
    postTogetDeliveryFee(data):Observable<any> {

        // http://209.58.160.20:5000/orders/getprice
        
        const httpOptions = {
            headers: new HttpHeaders(
            { 
               'Authorization': `Bearer ${this.tokenPay}`,
               'Content-Type': 'application/json'
            })
        }

        const url = this.deliveryServiceURL + "orders/getprice";

        // console.log('get delivery endpoint: ', url, data, httpOptions)
        return this.http.post(url, data, httpOptions);
        // return this.http.get(this.payServiceURL + "payments/makePayment", httpOptions);
    }

    postSubmitDeliveryOrder(data):Observable<any> {

        // http://209.58.160.20:5000/orders/submitorder
        
        const httpOptions = {
            headers: new HttpHeaders(
            { 
               'Authorization': `Bearer ${this.tokenPay}`,
               'Content-Type': 'application/json'
            })
        }

        const url = this.deliveryServiceURL + "orders/submitorder";

        // console.log('get delivery endpoint: ', url, data, httpOptions)
        return this.http.post(url, data, httpOptions);
        // return this.http.get(this.payServiceURL + "payments/makePayment", httpOptions);
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

        console.log('send payment: ', url, data, httpOptions)
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

    postAddItemToOrder(data):Observable<any> {

        const httpOptions = {
            headers: new HttpHeaders(
            { 
               'Authorization': `Bearer ${this.token}`,
               'Content-Type': 'application/json'
            })
        }

        const url = this.orderServiceURL + "orders/" + data.orderId + "/items";

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

    putUpdateOrderStatus(data):Observable<any> {

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
