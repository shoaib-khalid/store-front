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
import { CookieService } from 'ngx-cookie-service';

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
    storeDeliveryPercentage:number;
    storeName:any;

    cartExist:boolean = false;
    cartCount:number;
    cart:any;
    cartitemDetails:any;
    cartitemDetailsCount:number = 0;
    cartItemCount:number;
    cartID:any;
    product:any;
    allProductInventory = [];
    allProductAssets = [];
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
    userState:string = "";
    userCountries:any = "";
    customerNotes:any = "";

    visible:boolean = false;

    currBaseURL:any;
    providerId: any;
    // localURL:any;

    initOrderRes:any;
    hasDeliveryFee:boolean = false;
    deliveryRef:any;

    allFieldValidated:boolean = false;

    // States (Malaysia State)
    mStates:any;

    phoneError:any;
    emailError:any;

    deliveryValidUpTo:any;
    serverDateTime:any;
    showCountDownTime:any;
    timerReset:number = 0;

    payDisable:boolean = true;

    disableForm:boolean = false;
    dayArr = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

    store_close:boolean = true;
    storeTimingObj:any = {};

    currencySymbol:string = "";
    storeDomain: any;
    CountryID: any;
    btnString: string = "CONFIRM ORDER";
    paymentType: string = "COD";
    deliveryOption: string;
    storePickup: boolean = false;
    isSelfPickup: boolean = false;
    // storeCountries: string = "";
    providerListing:any = {};
    showProvider: boolean = false;
    providerName: string = 'providerName';
    showCounter: boolean = false;
    viewForm: boolean = true;
    storeAddress: any;
    storeCity: any;
    storeState: any;
    storePostcode: any;
    storePhone: any;
    storeEmail: any;
    hasInitForm: boolean = false;
    allowStorePickup: boolean = false;
    isCustNote: boolean = false;
    isSaved: boolean = true;
    customer_id:any;
    vertical_fees_txt:string = "SERVICE CHARGES"
    subTotalDiscount: any = 0;
    subTotalDiscountDesc: any = "0%";
    deliveryDiscount: any = 0;
    deliveryDiscountDesc: any = "0%";
    queryValidate: boolean = false;

    constructor(
        private _databindService: DataBindService,
        private mScrollbarService: MalihuScrollbarService,
        private route: Router,
        private apiService: ApiService,
        private datePipe: DatePipe,
        private spinner: NgxSpinnerService,
        private platformLocation: PlatformLocation,
        private cookieService: CookieService
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
        // console.log('ngOnInit');

        this.senderID = localStorage.getItem('sender_id');
        this.refID = localStorage.getItem('ref_id');
        this.storeID = localStorage.getItem('store_id');

        // this.storeDeliveryPercentage = localStorage.getItem('store_delivery_percentage');

        // console.log('storeDeliveryPercentage: ', typeof(this.storeDeliveryPercentage))

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

        const deliveryResp = await this.getDeliveryOption(this.storeID)

        // SELF = Self Delivery 
        // ADHOC = Adhoc Delivery
        // SCHEDULED = Scheduled Delivery

        this.deliveryOption = deliveryResp['type']
        this.allowStorePickup = deliveryResp['allowsStorePickup']
        console.log('deliveryObj: ', deliveryResp)

        console.log('allow store pickup : ' + this.allowStorePickup)

        // alert(this.deliveryOption)
        // if(this.deliveryOption == "SELF"){

        // }

        // if(this.deliveryOption == "SCHEDULED") {

        // }
        

        console.log('deliveryOption: ' + this.deliveryOption)

        this.getStoreHour()
        
        const getProduct = await this.getProduct()
        console.log("getProduct execute first...", getProduct)

        // checkCart() will wait getProduct() to finished 
        const checkCart = await this.checkCart()
        console.log("checkCart execute second...", checkCart)

        this.cartitemDetailsCount = checkCart['length'];

        console.log('satu: ', this.cartitemDetails)
        console.log('dua: ', this.allProductAssets)

        this.subTotal = 0
        this.totalServiceCharges = 0

        // added image url into the cartItem object 
        this.cartitemDetails.forEach(cartItem => {
            // this.allProductAssets.map(allAssets => {
            //     // console.log("allProduct.itemCode : " + allProduct.itemCode + "\ncartItem.itemCode : " + cartItem.itemCode);
            //     if(allAssets.itemCode == cartItem.itemCode){
            //         cartItem["url"] = allAssets.url;
            //     }
            // })

            this.subTotal = this.subTotal + cartItem.price;

            // alert(this.subTotal)
            
        });

        this.totalServiceCharges = (this.storeDeliveryPercentage == 0) ? this.storeDeliveryPercentage : ((this.storeDeliveryPercentage/100) * this.subTotal);


        this.totalPrice = this.subTotal + this.deliveryFee + this.totalServiceCharges

        if(this.totalPrice < 0){
            this.totalPrice == 0;
        }
        
        console.log('new satu: ', this.cartitemDetails) 

        console.log('cartItemLength: ' + this.cartitemDetailsCount)

        console.log('ALL PRODUCT SET ON INIT: ', this.allProductInventory)

        // countPrice() will wait checkCart() to finished 
        // const countTotal = await this.countPrice(this.allProductInventory)
        // console.log("countTotalPrice executed third...")

        this.spinner.show();

        // NEW PART HERE
        // load states
        // this.mStates = getStates(); // no longer depend on json by miqdaad

        var userEmailSes = localStorage.getItem('userEmail');

        // If userEmail exist, then rePopulate form Data
        if(this.userEmail !== 'undefined'){
            this.userEmail = userEmailSes
            await this.toRepopulate('userEmail')
        }

    }

    getDeliveryOption(storeID){

        return new Promise(resolve => {
            this.apiService.getDeliveryOption(storeID).subscribe(async (res: any) => {
                if (res.message){
                    resolve(res.data)
                } else {
                    console.log('getDeliveryOption operation failed')
                }
            }, error => {
                console.log(error)
            })
        })

    }

    async getStoreHour(){
        // get list of statest 
        const storeInfo = await this.getStoreInfoByID(this.storeID);
        console.log('store business hour: ', storeInfo)

        this.currencySymbol =  storeInfo['regionCountry']['currencySymbol'];

        this.storeDomain = storeInfo['domain']
        
        this.storeAddress = storeInfo['address']
        this.storePostcode = storeInfo['postcode']
        this.storeCity = storeInfo['city']
        this.storeState = storeInfo['regionCountryStateId']

        this.storeEmail = storeInfo['email']
        this.storePhone = storeInfo['phoneNumber']

        this.cookieService.set( 'subdomain', this.storeDomain );

        // set userCountries by default of store countries 
        this.userCountries = storeInfo['regionCountry']['name']
        this.CountryID = storeInfo['regionCountry']['id']
        this.paymentType = storeInfo['paymentType']
        this.storeDeliveryPercentage = storeInfo['serviceChargesPercentage']

        if(this.paymentType == "ONLINEPAYMENT"){
            this.btnString = "PAY NOW"
        }

        console.log('symbol currency: ', this.currencySymbol)

        if(storeInfo['verticalCode'] == "FnB" || storeInfo['verticalCode'] == "FnB_PK"){
            this.vertical_fees_txt = "TAKEAWAY FEE"
        }

        if(storeInfo['verticalCode'] == "ECommerece" || storeInfo['verticalCode'] == "ECommerece_PK"){
            this.vertical_fees_txt = "PROCESSING FEE"
        }

        const currentDate = new Date();
        var todayDay = this.dayArr[currentDate.getDay()];
        var browserTime = new Date();

        // alert(currentDate)

        this.storeTimingObj = storeInfo['storeTiming']

        this.storeTimingObj.forEach( obj => {

            let dayObj = obj.day;
            if(dayObj == todayDay){
                // true = store closed ; false = store opened
                let isOff = obj.isOff;

                if (isOff == false) {
                    var openTime = new Date();
                    openTime.setHours(obj.openTime.split(":")[0], obj.openTime.split(":")[1], 0); 
                    var closeTime = new Date();
                    closeTime.setHours(obj.closeTime.split(":")[0], obj.closeTime.split(":")[1], 0); 

                    console.log("happy hour?")
                    if(browserTime >= openTime && browserTime < closeTime ){
                        console.log("WE ARE OPEN !");
                    }else{
                        console.log("OH No, sorry! between 5.30pm and 6.30pm");
                        this.store_close = false
                    }
                } else {
                    console.log("WERE ARE CLOSED")
                    this.store_close = false
                }
            }
        });

        // get list of statest 
        const statesList = await this.getStatesByID(this.CountryID);

        console.log('list of states: ', statesList)

        this.mStates = statesList
    }

    getStatesByID(countryID){

        return new Promise(resolve => {
            this.apiService.getStateByCountryID(countryID).subscribe(async (res: any) => {
                if (res.message){
                    resolve(res.data.content)
                } else {
                    console.log('getStateByCountryID operation failed')
                }
            }, error => {
                console.log(error)
            })
        })
        
    }

    getStoreInfoByID(storeID){
        return new Promise(resolve => {
            this.apiService.getStoreHoursByID(storeID).subscribe((res: any) => {
                if (res.message){
                    resolve(res.data)
                } else {
                    console.log('getStoreHoursByID operation failed')
                }
            }, error => {
                console.log(error)
            })

        })
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
        if (this.hasDeliveryFee === false && this.isSelfPickup === false) {
            Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'> Please wait for us to calculate delivery fee</small>", "error")
            return false;
        }

        console.log("initOrder initiated:");

        // alert(this.userMsisdn)
        
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
            let productName = cartItem.productName
            let specialInstruction = cartItem.specialInstruction
            let price = cartItem.price
            let productPrice = cartItem.productPrice


            console.log("Checkout SKU: "+ sku);
    
            
            // console.log("realOrderId: "+ JSON.stringify(realOrderId) + "")
            // console.log("realOrderId: "+ JSON.stringify(orderId) + "")

            this.postAddItemToOrder(itemCode,orderId,price,productId,productPrice,quantity,sku,weight,productName,specialInstruction);
    
            // await this.allProductInventory.forEach(allItem => {
    
            //     let price = allItem.price
    
            //     if(itemCode == allItem.itemCode){
                    
            //         // console.log("itemCode: " + itemCode +
            //         // "\norderId: " + orderId +
            //         // "\nprice: " + price +
            //         // "\nproductId: " + productId +
            //         // "\nproductPrice: " + price +
            //         // "\nquantity: " + quantity +
            //         // "\nsku: " + sku +
            //         // "\nweight: " + weight);
                    
            //         this.postAddItemToOrder(itemCode,orderId,price,productId,price,quantity,sku,weight,productName,specialInstruction);
    
            //     }
            // });
    
        })

        // console.log('go Here tak?')
    
        if(this.paymentType == "ONLINEPAYMENT"){
            // start the loading 
            this.visible = true;

            this.goPay()
        }else{
            this.goCod()
        }
        
    }
    
    postAddItemToOrder(itemCode,orderId,price,productId,productPrice,quantity,sku,weight,productName,specialInstruction) {
    
        console.log("itemCode: " + itemCode +
        "\norderId: " + orderId +
        "\nprice: " + price +
        "\nproductId: " + productId +
        "\nproductPrice: " + productPrice +
        "\nquantity: " + quantity +
        "\nsku: " + sku +
        "\nweight: " + weight) +
        "\nspecialInstruction: " + specialInstruction;
    
        let data = {
            "itemCode": itemCode,
            "orderId": orderId,
            "price": price,
            "productId": productId,
            "productPrice": productPrice,
            "quantity": quantity,
            "SKU": sku,
            "weight": weight,
            "productName": productName,
            "specialInstruction": specialInstruction
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

                        // collect asset image info 
                        let productAssets = obj.productAssets;
                        
                        if(productAssets.length !== 0){
                            productAssets.forEach(assetObj => {
                                this.allProductAssets.push(assetObj)
                            });
                        }
                    });
                    
                    console.log('all product inventories: ', this.allProductInventory)
                    console.log('all product assets: ', this.allProductAssets)

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

    // countPrice(productList:any){

    //     this.subTotal = 0
    //     this.totalServiceCharges = 0

    //     // console.log('in countPrice Obj: ', this.cartitemDetails)

    //     // console.log('productList: ' , productList)

    //     // console.log("this.cartitemDetails: "+this.cartitemDetails);

    //     this.cartitemDetails.forEach(cartItem => {
    //         productList.map(allProduct => {
    //             // console.log("allProduct.itemCode : " + allProduct.itemCode + "\ncartItem.itemCode : " + cartItem.itemCode);
    //             if(allProduct.itemCode == cartItem.itemCode){
    //                 this.subTotal = this.subTotal + (allProduct.price * cartItem.quantity);
    //             }
    //         })
    //     });

    //     this.totalServiceCharges = (this.storeDeliveryPercentage == 0) ? this.storeDeliveryPercentage : ((this.storeDeliveryPercentage/100) * this.subTotal);


    //     this.totalPrice = this.subTotal + this.deliveryFee + this.totalServiceCharges

    //     console.log(typeof(this.totalPrice))
    //     console.log(typeof(this.subTotal))
    //     console.log(typeof(this.deliveryFee))
    //     console.log(typeof(this.totalServiceCharges))

    //     console.log("Sub-total : "+this.subTotal);
    //     console.log("Service Charges : "+this.subTotal);
    //     console.log("Delivery Charges : "+this.deliveryFee);
    //     console.log("Grant Total : "+this.totalPrice);
        
    // }

    goSkip(){
        this.route.navigate(['thankyou/SUCCESS/ORDER_CONFIRMED']);   
        // http://cinema-online.test:4200/thankyou/SUCCESS/ORDER_CONFIRMED
    }

    goCod(){

        // alert("cart id: " + this.cartID)

        // return false;
        
        let data = { 
            "cartId": this.cartID, 
            "customerId": this.customer_id, 
            "orderPaymentDetails": { 
                "accountName": this.userName, 
                "deliveryQuotationAmount": this.deliveryFee, 
                "deliveryQuotationReferenceId": this.deliveryRef, 
                "gatewayId": "" 
            }, 
            "orderShipmentDetails": { 
                "address": this.userAddress,
                "city": this.userCities, 
                "country": this.userCountries, 
                "deliveryProviderId": this.providerId, 
                "email": this.userEmail, 
                "phoneNumber": this.userMsisdn, 
                "receiverName": this.userName, 
                "state": this.userState, 
                "zipcode": this.userPostcode
            }
        }

        this.apiService.postConfirmCOD(data, this.cartID).subscribe((res: any) => {
            // console.log('add item to order loop: ', res)
            if (res.message){
                console.log('confirmed COD flow: '+ res.data)

                this.goSkip();

            } else {
            }
        }, error => {
            console.log(error)
        }) 

    }

    goPay(){

        console.log('MASOK X PAYMENT?')

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

        console.log('let data: ', data)

        this.apiService.postPaymentLink(data).subscribe((res: any) => {
            console.log('raw resp:', res.data.paymentLink)
            if (res.message) {
                console.log("Data from PS: "+res.data);
                let paymentLink = res.data.paymentLink;

                console.log('PAYMENLINK : ' + paymentLink)
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

        let uuid = undefined;

        this.customer_id = null
        this.userMsisdn = null
        this.userName = null
        this.userAddress = null
        this.userPostcode = null
        this.userCities = null
        this.userState = null
        this.payDisable = true;

        if (userinfo === 'userMsisdn') {
            const regex = new RegExp('^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\.\/0-9]*$');
            if (this.userMsisdn == "" || this.userMsisdn === undefined) {
                console.log("Phonenumber can't be empty");
                this.phoneError = "Phonenumber can't be empty";
                return false;
            } else if (this.userMsisdn.length < 7) {
                console.log("Not a valid phonenumber format (minimum length does not meet)");
                this.phoneError = "Not a valid phonenumber format (minimum length does not meet)";
                return false;
            } else if (!regex.test(this.userMsisdn)){
                console.log("Not a valid phonenumber format");
                this.phoneError = "Not a valid phonenumber format";
                return false;
            } else {
                this.phoneError = undefined;
                
                // sanatise input
                this.userMsisdn = (this.userMsisdn).replace(/[^0-9]/g, '');
                
            }
        } else if (userinfo === 'userEmail') {

            var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

            if (this.userEmail == "" || this.userEmail === undefined) {
                console.log("Email can't be empty");
                this.emailError = "Email can't be empty";
                return false;
            } else if (!this.userEmail.match(validRegex)){
                console.log("Not a valid email format");
                this.emailError = "Not a valid email format";
                return false;
            } else {
                this.emailError = undefined;
                localStorage.setItem('userEmail', this.userEmail);
            }

        } else {
            Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'> Failed to populate data!!</small>", "error")
        }


        const customer = await this.getCustomerProfileByEmail(this.userEmail)
        console.log("customer data...", customer)

        // alert(JSON.stringify(customer));

        this.customer_id = customer['id'];
        this.userMsisdn = customer['phoneNumber']
        this.userName = customer['name']
        this.userAddress = customer['customerAddress'][0]['address']
        this.userPostcode = customer['customerAddress'][0]['postCode']
        this.userCities = customer['customerAddress'][0]['city']
        this.userState = customer['customerAddress'][0]['state']

        // alert(this.customer_id)
        // alert('toValidate')
        await this.toValidate();

        // console.log('uuid: ' + uuid)

        // const details = await this.getPersonalDetails(uuid)
        // console.log("delivery data...", details)

        // this.userName = details['name']
        // this.userMsisdn = details['phoneNumber']
        // this.userAddress = details['address']
        // this.userPostcode = details['postCode']
        // this.userCities = details['city']
        // this.userState = details['state']
        // this.userCountries = details['country']  //userCountries need to get from store countries
        // later add function to calculate delivery charges
    }

    toValidate(){
        if (this.userEmail && this.userName && this.userMsisdn && this.userAddress && this.userPostcode 
            && this.userCities && this.userState && this.userCountries) {

                this.allFieldValidated = true;

                // only if viewForm true get deliveryFees 
                if(this.viewForm){
                    this.getDeliveryFee()
                }

                // if(this.isSelfPickup == false){
                //     this.getDeliveryFee()
                // }else{
                //     this.payDisable = false;
                // }

                // if(this.deliveryOption == "ADHOC" || this.deliveryOption == "SELF"){
                //     this.payDisable = false;
                // }
                

                this.queryValidate = true;

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

    custNote(event){
        this.isCustNote = event.target.checked

        // alert(this.isCustNote)
    }

    saveInfo(event){
        this.isSaved = !this.isSaved
    }

    selfPickup(event){
        this.isSelfPickup = event.target.checked;
        // alert(event.target.checked)

        if(this.isSelfPickup){

            // alert('hello')
            this.viewForm = !this.viewForm

            // alert(this.viewForm);

            this.showProvider = false;
            this.showCounter = false
            this.deliveryFee = 0

        }else{
            this.viewForm = !this.viewForm

            this.payDisable = true;

            if(this.deliveryOption == "SCHEDULED"){
                if(this.hasInitForm === true){
                    this.getDeliveryFee()
                    this.showProvider = true;
                }
            }

            if(this.deliveryOption == "ADHOC" || this.deliveryOption == "SELF"){
                if(this.hasInitForm === true){
                    this.getDeliveryFee()
                }
            }
        }

        // if(this.isSelfPickup == true){
        //     this.showProvider = false;
        //     this.showCounter = false
        //     this.deliveryFee = 0
        // }else{
        //     if(this.deliveryOption == "SCHEDULED"){
        //         this.getDeliveryFee()
        //         this.showProvider = true;
        //         this.payDisable = true;
        //     }

        //     if(this.deliveryOption == "ADHOC" || this.deliveryOption == "SELF"){
        //         this.getDeliveryFee()
        //     }

        // }



        this.totalPrice = this.subTotal + this.deliveryFee + this.totalServiceCharges

        if(this.totalPrice < 0){
            this.totalPrice == 0;
        }
    }

    selectedProvider(providerID){
        // alert("provider ID: " + providerID)

        // this.providerListing.find(el => el.id === '45').foo;
        const found = this.providerListing.find(el => el.providerId === providerID);

        console.log("FOUND: ", found); 

        this.deliveryFee = found.price
        this.providerId = found.providerId
        this.deliveryRef = found.refId

        this.totalPrice = this.subTotal + this.deliveryFee + this.totalServiceCharges

        if(this.totalPrice < 0){
            this.totalPrice == 0;
        }

        // If COD and region is PAKISTAN then allow proceed button 
        if(this.paymentType == "COD" && this.CountryID == "PAK"){
            this.payDisable = false;   
        }
    }

    async getDeliveryFee(){

        // alert('postcode: ' + 
        // this.userPostcode + this.userName + this.userEmail + 
        // this.userMsisdn + this.userAddress + this.userState + 
        // this.userCountries)

        const delivery = await this.postGetDelivery()
        console.log("delivery data...", delivery)

        if(this.deliveryOption == "SCHEDULED"){
    
            this.providerListing = delivery['data'];
            this.showProvider = true;

            console.log('PROVIDER: ', this.providerListing)
        }else{

            if(this.deliveryOption == "ADHOC"){
                this.deliveryFee = delivery['data'][0]['price'];
                this.providerId = delivery['data'][0]['providerId'];
                this.deliveryRef = delivery['data'][0]['refId'];
                this.deliveryValidUpTo = delivery['data'][0]['validUpTo'];
                this.serverDateTime = delivery['timestamp'];

                var isError = delivery['data'][0]['isError'];
                var errorMessage = delivery['message'];
            }else{
                this.deliveryFee = delivery['data']['price'];
                this.providerId = delivery['data']['providerId'];
                this.deliveryRef = delivery['data']['refId'];
                this.deliveryValidUpTo = delivery['data']['validUpTo'];
                this.serverDateTime = delivery['timestamp'];

                var isError = delivery['data']['isError'];
                var errorMessage = delivery['message'];
            }
            
            // alert('delivery charge: '+this.deliveryFee)

            // this.totalPrice = this.subTotal + this.deliveryFee;
            // console.log('total price : ' + this.totalPrice)

            if(isError){

                Swal.fire("Oops...", errorMessage, "error")

            }else{
                this.hasDeliveryFee = true;

                console.log("server time now(): "+ this.serverDateTime+"\n"+"this.deliveryValidUpTo: "+this.deliveryValidUpTo);
                this.timerReset = this.timerReset + 1;

                if(this.deliveryOption == "ADHOC"){
                    this.timeCounter(this.serverDateTime,this.deliveryValidUpTo);
                }
                
                // calling countPrice again so that deliveryFee included in the FE calculation
                // const countTotal = await this.countPrice(this.allProductInventory)
                // this.totalPrice = this.subTotal + this.deliveryFee + this.totalServiceCharges

                // Swal.fire("Delivery Fees", "Additional charges RM " + this.deliveryFee, "info")

                this.payDisable = false;
            }



            this.totalPrice = this.subTotal + this.deliveryFee + this.totalServiceCharges

            if(this.totalPrice < 0){
                this.totalPrice == 0;
            }

            this.hasInitForm = true;
        }


        const discount = await this.getDiscount(this.cartID, this.deliveryFee)
        console.log("discount data...", discount)

        this.subTotalDiscount = discount['data']['subTotalDiscount']
        this.subTotalDiscountDesc = '(' + discount['data']['subTotalDiscountDescription'] + ')'
        this.deliveryDiscount = discount['data']['deliveryDiscount']
        this.deliveryDiscountDesc = '(' + discount['data']['deliveryDiscountDescription'] + ')'

        // Recalculate detail price after fetch discount 

        if(this.subTotalDiscount > this.subTotal){
            this.subTotalDiscount == this.subTotal;
        }

        var newsubTotal = this.subTotal - this.subTotalDiscount

        if(this.deliveryDiscount > this.deliveryFee){
            this.deliveryDiscount == this.deliveryFee;
        }
        var newdeliveryFee = this.deliveryFee - this.deliveryDiscount

        this.totalPrice = newsubTotal + newdeliveryFee + this.totalServiceCharges

        if(this.totalPrice < 0){
            this.totalPrice == 0;
        }
        

    }

    postGetDelivery(){
        return new Promise(resolve => {

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
    
                // console.log('RESPONDEDNTAHSADAHSJHADSAS', res)
                if (res.message) {
    
                    resolve(res)
                    
                }
            }, error => {
                Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
            }) 
            // console.log("result: "+ JSON.stringify(result))
        })
    }

    getDiscount(cartId, deliveryCharge){
        return new Promise(resolve => {
    
            // console.log("data: "+ JSON.stringify(data));
            this.apiService.getDiscount(cartId, deliveryCharge).subscribe(async (res: any) => {
    
                if (res.message) {
    
                    resolve(res)
                    
                }
            }, error => {
                Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
            }) 
            // console.log("result: "+ JSON.stringify(result))
        })
    }

    postInitOrder(){
        return new Promise(resolve => {

            let data = {
                "cartId": this.cartID,
                "completionStatus": "RECEIVED_AT_STORE",
                "created": "",
                "customerId": this.customer_id,
                "customerNotes": this.customerNotes,
                "deliveryCharges": this.deliveryFee,
                "id": "",
                "invoiceId": "", 
                // "klCommission": 0,
                "orderPaymentDetail": {
                    "accountName":  this.userName, 
                    // "couponId": "", 
                    "deliveryQuotationAmount": this.deliveryFee,
                    "deliveryQuotationReferenceId": this.deliveryRef,
                    "gatewayId": "", 
                    "orderId": null, 
                    "time": ""
                },
                "orderShipmentDetail": {
                    "address": this.userAddress,  
                    "city": this.userCities,
                    "country": this.userCountries,
                    "deliveryProviderId": this.providerId,
                    "email": this.userEmail,
                    "orderId": null, 
                    "phoneNumber": this.userMsisdn,
                    "receiverName": this.userName,
                    "state": this.userState,
                    // "trackingUrl": "string",
                    "storePickup": this.isSelfPickup,
                    "zipcode": this.userPostcode
                },
                "paymentStatus": "PENDING",
                "privateAdminNotes": "",
                "serviceCharges": this.totalServiceCharges,
                "storeId": this.storeID,
                // "storeServiceCharges": 0,
                // "storeShare": 0,
                "subTotal": this.subTotal,
                "total": this.totalPrice,
                "updated": ""
            }

            // alert(JSON.stringify(data))
            // console.log("result: "+ JSON.stringify(result))

            this.apiService.postInitOrder(data, this.isSaved).subscribe(async (res: any) => {
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

    timeCounter = (nowDate, validityDate) => {
        
        let dateToShow;
        
        const matchDate:any = new Date(validityDate);
        const currentDate:any = new Date(nowDate);
        
        let distance = matchDate - currentDate;

        let showTime = (callback) => {

          distance = distance - 1000;

          // Time calculations for days, hours, minutes and seconds
          var days = Math.floor(distance / (1000 * 60 * 60 * 24));
          var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          var seconds = Math.floor((distance % (1000 * 60)) / 1000);

          let time = minutes + "m " + seconds + "s ";
          time = (hours >= 1) ? (hours + "h " + time) : time;
          time = (days >= 1) ? (days + "d " + time) : time;

        //   console.log("time: "+time)

      
          return dateToShow = distance < 0 ? false : time;
        };
      
      
        const logWhenDone = logData => console.log(logData)
      
        let timeReset = this.timerReset;
        const timer = setInterval(() => {
            this.showCountDownTime = showTime(logWhenDone);
            if (this.showCountDownTime === false){
                console.log("DONE");
                // stop current countdown
                clearInterval(timer);
                // calling getPrice again
                this.getDeliveryFee();
                return false;
            }
            if (this.timerReset > timeReset){
                clearInterval(timer);
            }
        }, 1000);
        this.showCounter = true
        
        // this is just the return value of the setInterval function, which is just a reference to that interval
        // console.log(showTime(logWhenDone));
    };

}
