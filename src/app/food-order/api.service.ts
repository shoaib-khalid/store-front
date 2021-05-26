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

    // #############################
    // Services Method 
    // ############################# 

    // ===============
    // user service
    // ===============

    // Ref : http://209.58.160.20:20921/swagger-ui/index.html?configUrl=/v3/api-docs/swagger-config#/clients-controller/authenticateClient
    postAuthenticate(data) {
        // data sample : { "username": "string", "password": "string"}
        return this.http.post(this.userServiceURL + "clients/authenticate", data);
    }

    // Ref : http://209.58.160.20:20921/swagger-ui/index.html?configUrl=/v3/api-docs/swagger-config#/customers-controller/getCustomers_1
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

    // Ref : http://209.58.160.20:20921/swagger-ui/index.html?configUrl=/v3/api-docs/swagger-config#/customer-address-controller/getCustomerAddresss
    getCustomerProfileById(uuid) {
        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${this.token}`),
        };

        const url =
            "customer/" + uuid + "/address/?" +
            "page=0" +
            "&pageSize=20";

        return this.http.get(this.userServiceURL + url, header);
    }

    // ===============
    // product service
    // ===============

    // Ref : http://209.58.160.20:7071/swagger-ui.html#/store-asset-controller/getStoreAssetsUsingGET
    getStoreAssets(storeID){
        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${this.token}`),
        };
        const url =
            "stores/" + storeID +
            "/assets";

            return this.http.get(this.productServiceURL + url, header);
    }

    // Ref : http://209.58.160.20:7071/swagger-ui.html#/product-controller/getProductUsingGET_1
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

    // Ref : http://209.58.160.20:7071/swagger-ui.html#/store-controller/getStoreUsingGET_1
    getStoreInfo(storename) {
        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${this.token}`),
        };
        const url =
            "stores?domain=" + storename +
            "&page=0" +
            "&pageSize=20";

            return this.http.get(this.productServiceURL + url, header);
    }

    // Ref : http://209.58.160.20:7071/swagger-ui.html#/product-controller/getProductUsingGET
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

    // Ref : http://209.58.160.20:7071/swagger-ui.html#/store-category-controller/getCategoryUsingGET
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

    // Ref : http://209.58.160.20:7071/swagger-ui.html#/product-controller/getProductUsingGET_1
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

    // Ref : http://209.58.160.20:7071/swagger-ui.html#/store-product-controller/getStoreProductsUsingGET
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

    // Ref : http://209.58.160.20:7071/swagger-ui.html#/store-product-inventory-controller/getStoreProductInventorysUsingGET
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

    // ===============
    // order service
    // ===============

    // Ref : http://209.58.160.20:7072/swagger-ui.html#/cart-controller/getCartsUsingGET
    getCartList(customerID, storeID) {
        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${this.token}`),
        };
        const url =
            "carts?customerId="+ customerID +
            "&page=0" +
            "&pageSize=20" +
            "&storeId=" + storeID;

        return this.http.get(this.orderServiceURL + url, header);
    }

    // Ref : http://209.58.160.20:7072/swagger-ui.html#/order-controller/getOrdersUsingGET
    getOrderId(customerID, storeID){
        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${this.token}`),
        };
        const url =
            "orders?customerId="+ customerID +
            "&page=0" +
            "&pageSize=20" +
            "&storeId=" + storeID;

        return this.http.get(this.orderServiceURL + url, header);
    }

    // Ref : http://209.58.160.20:7072/swagger-ui.html#/cart-item-controller/getCartItemsUsingGET
    getCartItemByCartID(cartID) {
        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${this.token}`),
        };
        const url =
            "carts/" + cartID + 
            "/items?page=0"+
            "&pageSize=200";

        return this.http.get(this.orderServiceURL + url, header);
    }

    // Ref : http://209.58.160.20:7072/swagger-ui.html#/cart-item-controller/postCartItemsUsingPOST
    postAddToCart(data):Observable<any> {
        // data sample : { "cartId": "string", "id": "string", "itemCode": "string", "price": 0, "productId": "string", "productPrice": 0, "quantity": 0, "sku": "string", "weight": 0}

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

    // Ref : http://209.58.160.20:7072/swagger-ui.html#/order-item-controller/postOrderItemsUsingPOST
    postAddItemToOrder(data):Observable<any> {
        // data sample : { "id": "string", "itemCode": "string", "orderId": "string", "price": 0, "productId": "string", "productPrice": 0, "quantity": 0, "sku": "string", "weight": 0}

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
    
    // ref : http://209.58.160.20:7072/swagger-ui.html#/cart-controller/postCartsUsingPOST
    postCreateCart(data):Observable<any> {
        // data sample : { "created": "2021-05-26T01:59:19.698Z", "customerId": "string", "id": "string", "isOpen": true, "storeId": "string", "updated": "2021-05-26T01:59:19.699Z"}
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

    // ref : http://209.58.160.20:7072/swagger-ui.html#/order-controller/postOrdersUsingPOST
    postInitOrder(data):Observable<any> {
        // data : { "cartId": "string", "completionStatus": "string", "customerId": "string", "customerNotes": "string", "deliveryAddress": "string", "deliveryCity": "string", "deliveryContactName": "string", "deliveryContactPhone": "string", "deliveryCountry": "string", "deliveryEmail": "string", "deliveryPostcode": "string", "deliveryProviderId": 0, "deliveryState": "string", "paymentStatus": "string", "privateAdminNotes": "string", "storeId": "string", "subTotal": 0, "total": 0}
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

    // ref : http://209.58.160.20:7072/swagger-ui.html#/order-controller/postOrdersUsingPOST
    putUpdateOrderStatus(data):Observable<any> {
        // data : { "cartId": "string", "completionStatus": "string", "customerId": "string", "customerNotes": "string", "deliveryAddress": "string", "deliveryCity": "string", "deliveryContactName": "string", "deliveryContactPhone": "string", "deliveryCountry": "string", "deliveryEmail": "string", "deliveryPostcode": "string", "deliveryProviderId": 0, "deliveryState": "string", "paymentStatus": "string", "privateAdminNotes": "string", "storeId": "string", "subTotal": 0, "total": 0}
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

    // ref : http://209.58.160.20:7072/swagger-ui.html#/cart-item-controller/deleteCartItemsByIdUsingDELETE
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

    // ===============
    // delivery service
    // ===============
    
    // ref : http://209.58.160.20:5000/swagger-ui.html#/orders-controller/getPriceUsingPOST
    postTogetDeliveryFee(data):Observable<any> {
        // data : { "customerId": "string", "delivery": { "deliveryAddress": "string", "deliveryCity": "string", "deliveryContactEmail": "string", "deliveryContactName": "string", "deliveryContactPhone": "string", "deliveryCountry": "string", "deliveryPostcode": "string", "deliveryState": "string" }, "deliveryProviderId": 0, "insurance": true, "itemType": "parcel", "merchantId": 0, "orderId": "string", "pickup": { "parcelReadyTime": "string", "pickupAddress": "string", "pickupCity": "string", "pickupContactEmail": "string", "pickupContactName": "string", "pickupContactPhone": "string", "pickupCountry": "string", "pickupDate": "string", "pickupLocationId": 0, "pickupOption": "string", "pickupPostcode": "string", "pickupState": "string", "pickupTime": "string", "remarks": "string", "trolleyRequired": true, "vehicleType": "CAR" }, "pieces": 0, "productCode": "string", "shipmentContent": "string", "shipmentValue": 0, "storeId": "string", "totalWeightKg": 0, "transactionId": "string"}
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

    // ref : http://209.58.160.20:5000/swagger-ui.html#/orders-controller/submitOrderUsingPOST
    postSubmitDeliveryOrder(data):Observable<any> {
        // data : { "customerId": "string", "delivery": { "deliveryAddress": "string", "deliveryCity": "string", "deliveryContactEmail": "string", "deliveryContactName": "string", "deliveryContactPhone": "string", "deliveryCountry": "string", "deliveryPostcode": "string", "deliveryState": "string" }, "deliveryProviderId": 0, "insurance": true, "itemType": "parcel", "merchantId": 0, "orderId": "string", "pickup": { "parcelReadyTime": "string", "pickupAddress": "string", "pickupCity": "string", "pickupContactEmail": "string", "pickupContactName": "string", "pickupContactPhone": "string", "pickupCountry": "string", "pickupDate": "string", "pickupLocationId": 0, "pickupOption": "string", "pickupPostcode": "string", "pickupState": "string", "pickupTime": "string", "remarks": "string", "trolleyRequired": true, "vehicleType": "CAR" }, "pieces": 0, "productCode": "string", "shipmentContent": "string", "shipmentValue": 0, "storeId": "string", "totalWeightKg": 0, "transactionId": "string"}
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


    // ===============
    // pay service
    // ===============

    // ref : http://209.58.160.20:6001/swagger-ui.html#/payments-controller/makePaymentUsingPOST
    postPaymentLink(data):Observable<any> {
        // data : { "callbackUrl": "string", "customerId": 0, "customerName": "string", "paymentAmount": 0, "productCode": "string", "systemTransactionId": "string", "transactionId": "string"}
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
    
}
