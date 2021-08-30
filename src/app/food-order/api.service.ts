import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from "rxjs";
import { PlatformLocation } from "@angular/common";
// import { createConnection } from 'net';

import { AppConfig } from '../app.config';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

    // endpointBaseURL: any;
    orderServiceURL: any;
    productServiceURL: any;
    userServiceURL: any;
    payServiceURL: any;
    deliveryServiceURL: any;
    token:any = 'accessToken';
    tokenPay:any = 'accessToken';
    variantStr:string = "";

    protected apiServer = AppConfig.settings.serviceUrl;

    constructor(
        private http: HttpClient,
        private platformLocation: PlatformLocation
    ) {
        this.checkBaseUrl();
    }

    checkBaseUrl() {
        this.userServiceURL = AppConfig.settings.serviceUrl.userServiceURL;
        this.productServiceURL = AppConfig.settings.serviceUrl.productServiceURL;
        this.payServiceURL = AppConfig.settings.serviceUrl.payServiceURL;
        this.orderServiceURL = AppConfig.settings.serviceUrl.orderServiceURL;
        this.deliveryServiceURL = AppConfig.settings.serviceUrl.deliveryServiceURL;
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

    // Ref : http://209.58.160.20:1201/stores/8913d06f-a63f-4a16-8059-2a30a517663a/customers/?email=mwaqassh%40gmail.com&page=0&pageSize=20
    getCustomerProfileByEmail(email, storeId) {
        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${this.token}`),
        };
        const url =
            "stores/"+ storeId +
            "/customers/?email="+ email +
            "&storeId="+ storeId +
            "&page=0" +
            "&pageSize=20";
        return this.http.get(this.userServiceURL + url, header);
    }

    getCustomerProfileByMsisdn(msisdn,storeId) {
        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${this.token}`),
        };
        const url =
            "stores/"+ storeId +
            "/customers/?phoneNumber="+ msisdn +
            "&storeId="+ storeId +
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

            // https://api.symplified.biz/v1/user-service/customer/acedr-uvbhnhk-okpbfk-jvhcxxg/address/?page=0&pageSize=20

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

    // Ref : https://api.symplified.biz/product-service/v1/stores/McD

    getStoreInfoByID(storeID){
        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${this.token}`),
        };
        const url =
            "stores/" + storeID;

        return this.http.get(this.productServiceURL + url, header);
    }

    // REf : https://api.symplified.biz/product-service/v1/region-country-state?id=MYS
    getStateByCountryID(countryID){
        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${this.token}`),
        };
        const url =
            "region-country-state?regionCountryId=" + countryID;

        return this.http.get(this.productServiceURL + url, header);
    }

    // Ref : http://209.58.160.20:7071/swagger-ui.html#/product-controller/getProductUsingGET_1
    // old endpoint 
    // getProductSByStoreID(storeID) {
    //     const header = {
    //         headers: new HttpHeaders().set("Authorization", `Bearer ${this.token}`),
    //     };
    //     const url =
    //         "stores/" +storeID +
    //         "/products?featured=true" +
    //         "&page=0" +
    //         "&pageSize=20" +
    //         "&storeId=" +
    //         storeID;
    //         return this.http.get(this.productServiceURL + url, header);
    // }

    // https://api.symplified.biz/product-service/v1/stores/8913d06f-a63f-4a16-8059-2a30a517663a/products?pageSize=10&page=0&status=ACTIVE
    getProductSByStoreID(storeID) {
        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${this.token}`),
        };
        const url =
            "stores/" +storeID +
            "/products?pageSize=10" +
            "&page=0" + 
            "&status=ACTIVE";
            
            return this.http.get(this.productServiceURL + url, header);
    }

   
    getStoreHoursByID(storeID) {
        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${this.token}`),
        };
        const url =
            "stores/" + storeID;

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

    // Ref : https://api.symplified.biz/product-service/v1/stores/8913d06f-a63f-4a16-8059-2a30a517663a/deliverydetails
    getDeliveryOption(storeID){
        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${this.token}`),
        };
        const url =
            "stores/" +
            storeID + 
            "/deliverydetails";
            return this.http.get(this.productServiceURL + url, header);
    }

    // Ref : http://209.58.160.20:7071/swagger-ui.html#/product-controller/getProductUsingGET_1

    // https://api.symplified.biz/product-service/v1/stores/b91e95f5-4af5-40ff-b7d2-d90b67eb595b/
    // products?pageSize=10&page=0&status=ACTIVE&categoryId=ad3e14db-54c8-4595-ba57-ee6c450bab99
    getProductSByCategory(categoryId, storeID, sortId) {
        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${this.token}`),
        };
        
Endpoint: http://localhost:7071/stores/storeId/products?sortByCol=price&sortingOrder=DESC

        if(sortId == 1){
            // cheapest
            var url =
            "stores/"+storeID+"/products?pageSize=10" +
            "&page=0" +
            "&status=ACTIVE" +
            "&categoryId=" + categoryId +
            "&sortByCol=price" + 
            "&sortingOrder=ASC";

        }else if(sortId == 2){
            // expensive
            var url =
            "stores/"+storeID+"/products?pageSize=10" +
            "&page=0" +
            "&status=ACTIVE" +
            "&categoryId=" + categoryId +
            "&sortByCol=price" + 
            "&sortingOrder=DESC";
        }else if(sortId == 3){
            // by A-Z 
            var url =
            "stores/"+storeID+"/products?pageSize=10" +
            "&page=0" +
            "&status=ACTIVE" +
            "&categoryId=" + categoryId +
            "&sortingOrder=ASC";
        }else if(sortId == 4){
            // by Z-A
            var url =
            "stores/"+storeID+"/products?pageSize=10" +
            "&page=0" +
            "&status=ACTIVE" +
            "&categoryId=" + categoryId +
            "&sortingOrder=DESC";
        }else if(sortId == 5){
            // by Most Recent
            var url =
            "stores/"+storeID+"/products?pageSize=10" +
            "&page=0" +
            "&status=ACTIVE" +
            "&categoryId=" + categoryId +
            "&sortByCol = created" +
            "&sortingOrder=DESC";
        }else{
            // non sorted 
            var url =
            "stores/"+storeID+"/products?pageSize=10" +
            "&page=0" +
            "&status=ACTIVE" +
            "&categoryId=" + categoryId;
        }

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
            "&seoName=" +
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
        // http://209.58.160.20:7072/carts?customerId=4&page=0&pageSize=20
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
        // http://209.58.160.20:7072/orders?customerId=4&page=0&pageSize=20&storeId=b0c5d5bf-be25-465c-811a-44c20011d025
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
        // http://209.58.160.20:7072/carts/3/items?page=0&pageSize=20
        const url =
            "carts/" + cartID + "/items?page=0"+
            "&pageSize=200";

        return this.http.get(this.orderServiceURL + url, header);
    }


    // Ref : https://api.symplified.biz/order-service/v1/orders/000e0d1a-ed1a-4741-8a55-d5e598421364
    getOrdersByID(order_id) {
        const header = {
            headers: new HttpHeaders().set("Authorization", `Bearer ${this.token}`),
        };

        const url =
            "orders/" + order_id;

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
    
    // ref : http://209.58.160.20:7001/orders/placeOrder?cartId=0439aee0-b57f-4cf5-81c4-f93d6103c57f
    postConfirmCOD(data, cartId):Observable<any> {
        // data sample : { "created": "2021-05-26T01:59:19.698Z", "customerId": "string", "id": "string", "isOpen": true, "storeId": "string", "updated": "2021-05-26T01:59:19.699Z"}
        const httpOptions = {
            headers: new HttpHeaders(
            { 
               'Authorization': `Bearer ${this.token}`,
               'Content-Type': 'application/json'
            })
        }
        
        // const url = "http://209.58.160.20:7001/orders/placeOrder?cartId=" + cartId;
        const url = this.orderServiceURL + "orders/placeOrder?cartId=" + cartId;
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
    postInitOrder(data, isSaved):Observable<any> {
        // data : { "cartId": "string", "completionStatus": "string", "customerId": "string", "customerNotes": "string", "deliveryAddress": "string", "deliveryCity": "string", "deliveryContactName": "string", "deliveryContactPhone": "string", "deliveryCountry": "string", "deliveryEmail": "string", "deliveryPostcode": "string", "deliveryProviderId": 0, "deliveryState": "string", "paymentStatus": "string", "privateAdminNotes": "string", "storeId": "string", "subTotal": 0, "total": 0}
        const httpOptions = {
            headers: new HttpHeaders(
            { 
               'Authorization': `Bearer ${this.token}`,
               'Content-Type': 'application/json'
            })
        }
        // "https://api.symplified.biz/order-service/v1/",
        const url = this.orderServiceURL + "orders?saveCustomerInformation="+isSaved;
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

    // ref : http://209.58.160.20:7072/swagger-ui.html#/cart-item-controller/putCartItemsByIdUsingPUT
    putCartItem(data):Observable<any> {
        // data sample : { "cartId": "string", "itemId": "string", "operation": "string" }
        const httpOptions = {
            headers: new HttpHeaders(
            { 
                'Authorization': `Bearer ${this.token}`,
                'Content-Type': 'application/json'
            })
        }

        const url = this.orderServiceURL + 
                    "carts/" + data.cartId + 
                    "/items/" + data.id;

        return this.http.put(url, data, httpOptions);

    }

    // ref : http://209.58.160.20:7072/swagger-ui.html#/cart-item-controller/updateQuantityCartItemsByIdUsingPOST   
    updateCartItem(data):Observable<any> {
        // data sample : { "cartId": "string", "itemId": "string", "operation": "string" }
        const httpOptions = {
            headers: new HttpHeaders(
            { 
               'Authorization': `Bearer ${this.token}`,
               'Content-Type': 'application/json'
            })
        }

        const url = this.orderServiceURL + 
                    "carts/" + data.cartId + 
                    "/items/updatequantiy/" + data.id +
                    "/" + data.quantityChange;

        return this.http.post(url, data, httpOptions);

    }

    // ref : http://209.58.160.20:7072/swagger-ui.html#/cart-item-controller/deleteCartItemsByIdUsingDELETE
    deleteAllCartItem(data):Observable<any> {
        const httpOptions = {
            headers: new HttpHeaders(
            { 
               'Authorization': `Bearer ${this.token}`,
               'Content-Type': 'application/json'
            }),
            body: data
        }

        const url = this.orderServiceURL + "carts/"+data.cartId+"/items/clear";

        return this.http.delete(url, httpOptions);
    }

    // ===============
    // delivery service
    // ===============

    // ref : http://209.58.160.20:5000/swagger-ui.html#/orders-controller/getPriceUsingPOST
    postTogetDeliveryFee(xxx):Observable<any> {
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
        return this.http.post(url, xxx, httpOptions);
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
