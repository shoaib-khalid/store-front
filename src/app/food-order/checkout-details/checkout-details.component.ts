import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from './../api.service';
// model 
import { CartList } from './food-order/../../models/CartList';
// services
import { DataBindService } from './../databind.service';
import { NgxSpinnerService } from "ngx-spinner";

import { faMoneyBillAlt } from '@fortawesome/free-solid-svg-icons';

import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { totalmem } from 'os';
import Swal from 'sweetalert2'
import { forkJoin } from 'rxjs';
import { PlatformLocation } from "@angular/common";

import {
    allPostcodes,
    getStates,
    getCities,
    getPostcodes,
    findPostcode,
  } from "malaysia-postcodes";

@Component({
  selector: 'app-checkout-details',
  templateUrl: './checkout-details.component.html',
  styleUrls: ['./checkout-details.component.css']
})
export class CheckoutDetailsComponent implements OnInit, AfterViewInit, OnDestroy {

    cartList:CartList[];
    trxid: any;

    iconMoney = faMoneyBillAlt;

    senderID:any;
    refID:any;
    storeID:any;
    storeDeliveryPercentage:any;
    storeName:any;

    cartExist:boolean = false;
    cartCount:number;
    cart:any;
    cartitemDetails:any;
    cartitemDetailsCount:number;
    cartItemCount:number;
    cartID:any;
    product:any;
    allProductInventory = [];
    orderId:any;

    totalPrice:number = 0;
    subTotal:number = 0;
    totalServiceCharges:number = 0;
    deliveryFee:number = 0;

    userPostcode:any;
    userName:any;
    userEmail:any;
    userMsisdn:any;
    userAddress:any;
    userCities:any;
    userState:any;
    userCountries:any;

    visible:boolean = false;

    currBaseURL:any;
    providerId: any;
    // localURL:any;

    initOrderRes:any;
    hasDeliveryFee:boolean = false;
    deliveryRef:any;

    allFieldValidated:boolean;

    // States (Malaysia State)
    mStates:any;

    constructor(
        private _databindService: DataBindService,
        private mScrollbarService: MalihuScrollbarService,
        private route: Router,
        private apiService: ApiService,
        private datePipe: DatePipe,
        private spinner: NgxSpinnerService,
        private platformLocation: PlatformLocation
    ) {

        this.currBaseURL = (this.platformLocation as any).location.origin;
        // this.localURL = this.currBaseURL.match(/localhost/g);

        var host = this.currBaseURL
        var subdomain = host.split('.')[0]
        this.storeName = subdomain.replace(/^(https?:|)\/\//, '')

        console.log('base URL: ' + this.currBaseURL)

     }

    // using async method for javascript function trigger 
    // allowing to use wait method, one function will wait until previous method is finished
    async ngOnInit() {
        console.log('ngOnInit');


        this.senderID = localStorage.getItem('sender_id');
        this.refID = localStorage.getItem('ref_id');
        this.storeID = localStorage.getItem('store_id');
        this.storeDeliveryPercentage = localStorage.getItem('store_delivery_percentage');

        if(this.senderID === 'undefined'){
            this.cartID = localStorage.getItem("anonym_cart_id")
            console.log('cart id anonymous session: ' + this.cartID)
        }else{
            this.cartID = localStorage.getItem('cart_id');
            console.log('cart id session: ' + this.cartID)
        }
        
        // this.orderID = localStorage.getItem('order_id')

        console.log('senderID: ' + this.senderID + "\nstoreID: " + this.storeID + "\ncartID: " + this.cartID);

        // dummy total, if u delete this view will crash and checkCart() will not be called, later to enhance
        // this.cartList = this._databindService.getCartList();

        // this.getProduct();
        // this.checkCart();

        
        const getProduct = await this.getProduct()
        console.log("getProduct execute first...", getProduct)

        // checkCart() will wait getProduct() to finished 
        const checkCart = await this.checkCart()
        console.log("checkCart execute second...", checkCart)

        this.cartitemDetailsCount = checkCart['length'];

        console.log('cartItemLength: ' + this.cartitemDetailsCount)

        // countPrice() will wait checkCart() to finished 
        const countTotal = await this.countPrice(this.allProductInventory)
        console.log("countTotalPrice executed third...")

        this.spinner.show();

        // NEW PART HERE
        // load states
        this.mStates = getStates();

    }

    ngAfterViewInit(){
        console.log("after view init");
        // this.mScrollbarService.initScrollbar(document.body, { axis: 'y', theme: 'dark-3', scrollButtons: { enable: true } });
        this.mScrollbarService.initScrollbar('#scrollable4', { axis: 'y', theme: 'dark-thin', scrollButtons: { enable: true } });
    }

    ngOnDestroy() {
        // custom cleanup
        // this.mScrollbarService.destroy(document.body);
        this.mScrollbarService.destroy('#scrollable4');
    }

    showSpinner() {
        // visible return true 
        this.visible = true;

        // calling function after 2 second 
        setTimeout(() => {;
            this.hideSpinner()
        }, 1500);
    }

    hideSpinner(){
        // visible return false 
        this.visible = false;
        // this.spinner.hide();
    }

    async initOrder(){

        // wait for delivery service to get quotation
        if (this.hasDeliveryFee === false) {
            Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'> Please wait for us to calculate delivery fee</small>", "error")
            return false;
        }

        console.log("initOrder initiated:");
        
        const orderId = await this.postInitOrder();
        this.addItemOrder(orderId['id'])
        this.orderId = orderId['id'];

        console.log("initOrder received (orderId):"+ orderId['id']);

        // forkJoin([initOrder, getOrderId]).subscribe(results => {

        //     let objGet = results[1]

        //     // always get latest order id 
        //     this.orderId = objGet['data'].content[0].id

        //     // console.log('result 1: ', objPost)
        //     console.log('orderID: ', this.orderId)

        //     this.addItemOrder(this.orderId)

        // }, error =>{
        //     Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
        // });
    }

    async addItemOrder(orderId){
        console.log('cartitemDetails')
        await this.cartitemDetails.map(async cartItem => {
            console.log('cartitemDetails in')
    
            let realOrderId = orderId;
            let itemCode = cartItem.itemCode
            let productId = cartItem.productId
            let quantity = cartItem.quantity
            let sku = cartItem.sku
            let weight = cartItem.weight
    
            
            // console.log("realOrderId: "+ JSON.stringify(realOrderId) + "")
            // console.log("realOrderId: "+ JSON.stringify(orderId) + "")
    
            await this.allProductInventory.forEach(allItem => {
    
                let price = allItem.price
    
                if(itemCode == allItem.itemCode){
                    
                    // console.log("itemCode: " + itemCode +
                    // "\norderId: " + orderId +
                    // "\nprice: " + price +
                    // "\nproductId: " + productId +
                    // "\nproductPrice: " + price +
                    // "\nquantity: " + quantity +
                    // "\nsku: " + sku +
                    // "\nweight: " + weight);
                    
                    this.postAddItemToOrder(itemCode,orderId,price,productId,price,quantity,sku,weight);
    
                    
                //     // start the loading 
                    this.visible = true;
                }
            });
    
        })
    
        this.goPay()
    }
    
    postAddItemToOrder(itemCode,orderId,price,productId,productPrice,quantity,sku,weight) {
    
        console.log("itemCode: " + itemCode +
        "\norderId: " + orderId +
        "\nprice: " + price +
        "\nproductId: " + productId +
        "\nproductPrice: " + price +
        "\nquantity: " + quantity +
        "\nsku: " + sku +
        "\nweight: " + weight);
    
        let data = {
            "itemCode": itemCode,
            "orderId": orderId,
            "price": price,
            "productId": productId,
            "productPrice": productPrice,
            "quantity": quantity,
            "sku": sku,
            "weight": weight
        }
    
        this.apiService.postAddItemToOrder(data).subscribe((res: any) => {
            // console.log('add item to order loop: ', res)
            if (res.message){
                console.log('item succesfully added: '+ res.data)
            } else {
            }
        }, error => {
            console.log(error)
        }) 
    }

    getProduct(){

        return new Promise(resolve => {

            console.log("Checkout calling BACKEND getProductSByStoreID");
            this.apiService.getProductSByStoreID(this.storeID).subscribe((res: any) => {
                console.log("Checkout receive BACKEND getProductSByStoreID");
                if (res.message) {
                    this.product = res.data.content;
                    console.log('getProduct(): ', this.product);
                    // console.log('price: ', this.product[0].productInventories[1]);

                    // return false;

                    let productObj = this.product;

                    productObj.forEach( obj => {
                        // console.log(obj);
                        // let productID = obj.id;
                        let inventoryArr = obj.productInventories;

                        if(inventoryArr.length !== 0){

                            inventoryArr.forEach( inventoryObj => {
                                // creating a collection of productInventories array to prepare base mapping 
                                // for logic that related to itemCode
                                this.allProductInventory.push(inventoryObj);
                            });
                        }
                    });
                    
                    console.log('all product inventories: ', this.allProductInventory)

                    resolve(this.allProductInventory)

                    //get the price
                    // this.countPrice(this.allProductInventory);

                } else {
                    // condition if required for different type of response message 
                }
            }, error => {
                console.log(error)
            }) 

        })
        
    }

    checkCart(){

        return new Promise(resolve => {
            // check count Item in Cart 
            this.apiService.getCartItemByCartID(this.cartID).subscribe((res: any) => {
                console.log('check cart item: ', res.data.content)

                if (res.message){
                    this.cartitemDetails = res.data.content;
                    // this.cartitemDetailsCount = this.cartitemDetails.length;

                    console.log("getCartItemByCartID responded")

                    resolve(this.cartitemDetails)

                } else {
                }
            }, error => {
                console.log(error)
            }) 
        })
        
    }

    countPrice(productList:any){

        this.subTotal = 0
        this.totalServiceCharges = 0

        // console.log('in countPrice Obj: ', this.cartitemDetails)

        // console.log('productList: ' , productList)

        // console.log("this.cartitemDetails: "+this.cartitemDetails);

        this.cartitemDetails.forEach(cartItem => {
            productList.map(allProduct => {
                // console.log("allProduct.itemCode : " + allProduct.itemCode + "\ncartItem.itemCode : " + cartItem.itemCode);
                if(allProduct.itemCode == cartItem.itemCode){
                    this.subTotal = this.subTotal + (allProduct.price * cartItem.quantity);
                }
            })
        });

        this.totalServiceCharges = (this.storeDeliveryPercentage == 0) ? this.storeDeliveryPercentage : ((this.storeDeliveryPercentage/100) * this.subTotal);


        this.totalPrice = this.subTotal + this.deliveryFee + this.totalServiceCharges

        console.log("Sub-total : "+this.subTotal);
        console.log("Service Charges : "+this.subTotal);
        console.log("Delivery Charges : "+this.deliveryFee);
        console.log("Grant Total : "+this.totalPrice);
        
    }

    goSkip(e){
        this.route.navigate(['thankyou']);   
    }

    goPay(){

        let dateTime = new Date()

        this.trxid = this.datePipe.transform(dateTime, "yyyyMMddhhmmss")

        let data = {
            "customerId": this.senderID,
            "customerName": this.userName,
            "productCode": "parcel",
            "storeName": this.storeName,
            "systemTransactionId": this.trxid,
            "transactionId": this.orderId,	
            "paymentAmount": this.totalPrice.toFixed(2),
            "callbackUrl" : this.currBaseURL + '/thankyou'
        }

        this.apiService.postPaymentLink(data).subscribe((res: any) => {
            console.log('raw resp:', res.data.paymentLink)
            if (res.message) {
                console.log("Data from PS: "+res.data);
                let paymentLink = res.data.paymentLink;
                // window.open(paymentLink, "_blank");

                // this.visible = false
                // console.log('goto pay mobi: ' + paymentLink)

                /**
                    payment provider id :
                    senangPay = 2
                    mobiPay = 1
                */
                if (res.data.providerId == 1) {
                    window.location.href = paymentLink;
                } else if (res.data.providerId == 2) {
                    this.postForm(paymentLink, {"detail" : this.storeName, "amount": this.totalPrice.toFixed(2), "order_id": this.orderId, "name": this.userName, "email": this.userEmail, "phone": this.userMsisdn, "hash": res.data.hash },'post');
                } else {
                    alert("provider id not configured !!");
                }
            } 
        }, error => {
            Swal.fire("Payment failed!", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
        }) 
    }

    postForm(path, params, method) {
        method = method || 'post';
    
        var form = document.createElement('form');
        form.setAttribute('method', method);
        form.setAttribute('action', path);
    
        for (var key in params) {
            if (params.hasOwnProperty(key)) {
                var hiddenField = document.createElement('input');
                hiddenField.setAttribute('type', 'hidden');
                hiddenField.setAttribute('name', key);
                hiddenField.setAttribute('value', params[key]);
    
                form.appendChild(hiddenField);
            }
        }
    
        document.body.appendChild(form);
        form.submit();
    }
    

    async toRepopulate(userinfo){

        // alert('email: ' + this.userEmail)
        // return false

        let uuid = undefined;
        if (userinfo === 'userEmail'){
            const customer = await this.getCustomerProfileByEmail(this.userEmail)
            console.log("customer data...", customer)
            uuid = customer['id'];
        } else if (userinfo === 'userMsisdn') {
            const customer = await this.getCustomerProfileByMsisdn(this.userMsisdn)
            console.log("customer data...", customer)
            uuid = customer['id'];
        } else {
            Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'> Failed to populate data!!</small>", "error")
        }

        console.log('uuid: ' + uuid)

        const details = await this.getPersonalDetails(uuid)
        console.log("delivery data...", details)

        this.userName = details['name']
        this.userMsisdn = details['phoneNumber']
        this.userAddress = details['address']
        this.userPostcode = details['postCode']
        this.userCities = details['city']
        this.userState = details['state']
        this.userCountries = details['country']
        // later add function to calculate delivery charges
    }

    toValidate(){
        if (this.userEmail && this.userName && this.userMsisdn && this.userAddress && this.userPostcode 
            && this.userCities && this.userState && this.userCountries) {
                this.allFieldValidated = true;
                this.getDeliveryFee()
                console.log("All field validated")
        } else {
            // console.log("this.userName: " +  this.userName +
            // "\nthis.userMsisdn: " + this.userMsisdn + 
            // "\nthis.userAddress: " + this.userAddress + 
            // "\nthis.userPostcode: " + this.userPostcode + 
            // "\nthis.userCities: " + this.userCities + 
            // "\nthisuserState.: " + this.userState + 
            // "\nthis.userCountries: " + this.userCountries)
        }
    }

    getCustomerProfileByEmail(email){
        return new Promise(resolve => {
            this.apiService.getCustomerProfileByEmail(email,this.storeID).subscribe((res: any) => {
                resolve(res.data.content[0])
            }, error => {
                Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
            }) 
        });
    }

    getCustomerProfileByMsisdn(msisdn){
        return new Promise(resolve => {
            this.apiService.getCustomerProfileByMsisdn(msisdn,this.storeID).subscribe((res: any) => {
                resolve(res.data.content[0])
            }, error => {
                Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
            }) 
        });
    }

    getPersonalDetails(uuid){

        return new Promise(resolve => {
            this.apiService.getCustomerProfileById(uuid).subscribe((res: any) => {
                resolve(res.data.content[0])

            }, error => {
                Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")

            }) 
            
        });

    }

    // not used anywhere
    checkOut(){
        // alert('postcode: ' + 
        // this.userPostcode + this.userName + this.userEmail + 
        // this.userMsisdn + this.userAddress + this.userState + 
        // this.userCountries)

        let data = {
            "merchantId":1,
            "customerId": 1,
            "productCode": "document",
            "itemType": "parcel",
            "deliveryProviderId":1,
            "totalWeightKg":1,
            "shipmentContent":"Flyers Supllies",
            "pieces": 2,
            "IsInsurance": false,
            "shipmentValue":1,
            
            "delivery" : {
                "deliveryPostcode": this.userPostcode,
                "deliveryAddress": this.userAddress,
                "deliveryCity": this.userCities,
                "deliveryContactEmail": this.userEmail,
                "deliveryContactName": this.userName,
                "deliveryContactPhone": this.userMsisdn,
                "deliveryCountry": this.userCountries,
                "deliveryState": this.userState 
            },
            
            "pickup" : {
                "pickupOption":"ADDHOC",
                "vehicleType":"MOTORCYCLE",
                "isTrolleyRequired":false,
                "pickupRemarks":"",
                "pickupContactName": "SK",
                "pickupContactPhone": "0123327339",
                "pickupContactEmail": "taufik@kalsym.com",
                "pickupAddress": "Unit S-14-09,Level 12B, First Subang,Jalan SS15/4G,47500 Subang Jaya, Selangor",  
                "pickupPostcode":"47500",
                "pickupCity":"Subang Jaya",
                "pickupState":"Selangor",
                "pickupCountry":"MYS",
                "pickupLocationId":34176
            }
          }

        this.submitOrder(data);
    }

    submitOrder(data:any){

        this.apiService.postSubmitDeliveryOrder(data).subscribe((res: any) => {
            if (res.message) {

                console.log('submit order response: ' , res)

                this.goPay()

            }
        }, error => {
            Swal.fire("Submit order failed!", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
        }) 

    }

    getDeliveryFee(){

        // alert('postcode: ' + 
        // this.userPostcode + this.userName + this.userEmail + 
        // this.userMsisdn + this.userAddress + this.userState + 
        // this.userCountries)

        console.log("customerId: "+ this.senderID + // if anonymous
                    "\ndeliveryProviderId: "+ null+ // current fixed to mr speedy
                    "\ncartId: "+ this.cartID+
                    "\nstoreId: "+ this.storeID+
                    "\ndelivery: "+
                        "\n\tdeliveryAddress: "+ this.userAddress+
                        "\n\tdeliveryCity: "+this.userCities+
                        "\n\tdeliveryContactEmail: "+ this.userEmail+
                        "\n\tdeliveryContactName: "+ this.userName+
                        "\n\tdeliveryContactPhone: "+ this.userMsisdn+
                        "\n\tdeliveryCountry: "+ this.userCountries+
                        "\n\tdeliveryPostcode: "+ this.userPostcode+
                        "\n\tdeliveryState: "+ this.userState
        );

        // return false;
        let data = {
            "customerId": this.senderID, // if anonymous
            "deliveryProviderId": null, // current fixed to mr speedy
            "cartId": this.cartID,
            "storeId": this.storeID,
            "delivery": {
              "deliveryAddress": this.userAddress,
              "deliveryCity": this.userCities,
              "deliveryContactEmail": this.userEmail,
              "deliveryContactName": this.userName,
              "deliveryContactPhone": this.userMsisdn,
              "deliveryCountry": this.userCountries,
              "deliveryPostcode": this.userPostcode,
              "deliveryState": this.userState
            }
        }

        // console.log("data: "+ JSON.stringify(data));
        this.apiService.postTogetDeliveryFee(data).subscribe(async (res: any) => {
            if (res.message) {

                this.deliveryFee = res.data[0].price;
                this.providerId = res.data[0].providerId;
                this.deliveryRef = res.data[0].refId;

                // alert('delivery charge: '+this.deliveryFee)

                this.totalPrice = this.subTotal + this.deliveryFee;
                this.hasDeliveryFee = true;

                // calling countPrice again so that deliveryFee included in the FE calculation
                const countTotal = await this.countPrice(this.allProductInventory)

                // Swal.fire("Delivery Fees", "Additional charges RM " + this.deliveryFee, "info")
            }
        }, error => {
            Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
        }) 

    }

    postInitOrder(){
        return new Promise(resolve => {
            let data = {
                "cartId": this.cartID,
                "completionStatus": "",
                "created": "",
                "customerId": this.senderID,
                "customerNotes": "",
                "id": "",
                "paymentStatus": "PENDING",
                "privateAdminNotes": "",
                "storeId": this.storeID,
                "subTotal": 0,
                "total": this.totalPrice,
                "updated": "",
                "deliveryContactName": this.userName,
                "deliveryAddress": this.userAddress,  
                "deliveryContactPhone": this.userMsisdn,
                "deliveryPostcode":this.userPostcode,
                "deliveryCity": this.userCities,
                "deliveryState":this.userState,
                "deliveryCountry":this.userCountries,
                "deliveryEmail": this.userEmail,
                "deliveryProviderId": this.providerId,
                "deliveryQuotationReferenceId": this.deliveryRef,
                "deliveryQuotationAmount": this.deliveryFee,
            }

            this.apiService.postInitOrder(data).subscribe(async (res: any) => {
                console.log('updateCartItem result: ', res)
                if (res.message){
                    console.log('postInitOrder operation successfull')
                    console.log("res.data.id: "+ res.data)
                    resolve(res.data)
                    // this.initOrderRes = res.data;
                } else {
                    console.log('postInitOrder operation failed')
                }
            }, error => {
                console.log(error)
            })
            // console.log("result: "+ JSON.stringify(result))
        })
    }

}
