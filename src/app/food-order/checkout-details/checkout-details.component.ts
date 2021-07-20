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
    userState:string = "Choose States";
    userCountries:any = "";

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

    phoneError:any;
    emailError:any;

    deliveryValidUpTo:any;
    serverDateTime:any;
    showCountDownTime:any = undefined;
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
    // storeCountries: string = "";

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
        console.log('ngOnInit');

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

        

        this.getStoreHour()
        
        const getProduct = await this.getProduct()
        console.log("getProduct execute first...", getProduct)

        // checkCart() will wait getProduct() to finished 
        const checkCart = await this.checkCart()
        console.log("checkCart execute second...", checkCart)

        this.cartitemDetailsCount = checkCart['length'];

        console.log('satu: ', this.cartitemDetails)
        console.log('dua: ', this.allProductAssets)

        // added image url into the cartItem object 
        this.cartitemDetails.forEach(cartItem => {
            this.allProductAssets.map(allAssets => {
                // console.log("allProduct.itemCode : " + allProduct.itemCode + "\ncartItem.itemCode : " + cartItem.itemCode);
                if(allAssets.itemCode == cartItem.itemCode){
                    cartItem["url"] = allAssets.url;
                }
            })
        });
        
        console.log('new satu: ', this.cartitemDetails) 

        console.log('cartItemLength: ' + this.cartitemDetailsCount)

        // countPrice() will wait checkCart() to finished 
        const countTotal = await this.countPrice(this.allProductInventory)
        console.log("countTotalPrice executed third...")

        this.spinner.show();

        // NEW PART HERE
        // load states
        // this.mStates = getStates(); // no longer depend on json by miqdaad

    }

    async getStoreHour(){
        // get list of statest 
        const storeInfo = await this.getStoreInfoByID(this.storeID);
        console.log('store business hour: ', storeInfo)

        this.currencySymbol =  storeInfo['regionCountry']['currencySymbol'];

        this.storeDomain = storeInfo['domain']

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

        const currentDate = new Date();
        var todayDay = this.dayArr[currentDate.getDay()];
        var browserTime = new Date();

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
            let productName = cartItem.productName
            let specialInstruction = cartItem.specialInstruction


            console.log("Checkout SKU: "+ sku);
    
            
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
                    
                    this.postAddItemToOrder(itemCode,orderId,price,productId,price,quantity,sku,weight,productName,specialInstruction);
    
                    
                //     // start the loading 
                    this.visible = true;
                }
            });
    
        })

        // console.log('go Here tak?')
    
        this.goPay()
    }
    
    postAddItemToOrder(itemCode,orderId,price,productId,productPrice,quantity,sku,weight,productName,specialInstruction) {
    
        console.log("itemCode: " + itemCode +
        "\norderId: " + orderId +
        "\nprice: " + price +
        "\nproductId: " + productId +
        "\nproductPrice: " + price +
        "\nquantity: " + quantity +
        "\nsku: " + sku +
        "\nweight: " + weight) +
        "\nspecialInstruction: " + specialInstruction;
    
        let data = {
            "itemCode": itemCode,
            "orderId": orderId,
            "price": price*quantity,
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

        console.log(typeof(this.totalPrice))
        console.log(typeof(this.subTotal))
        console.log(typeof(this.deliveryFee))
        console.log(typeof(this.totalServiceCharges))

        console.log("Sub-total : "+this.subTotal);
        console.log("Service Charges : "+this.subTotal);
        console.log("Delivery Charges : "+this.deliveryFee);
        console.log("Grant Total : "+this.totalPrice);
        
    }

    goSkip(e){
        this.route.navigate(['thankyou']);   
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

                const customer = await this.getCustomerProfileByMsisdn(this.userMsisdn)
                console.log("customer data...", customer)
                uuid = customer['id'];
            }
        } else if (userinfo === 'userEmail') {
            const regex = new RegExp('(([^\<\>\/\(\)\[\\\]\.\,\;\:\s\@\"]+(\.[^\<\>\(\)\/\[\\\]\.\,\;\:\s@\"]+)*)|(\".+\"))@(([^\<\>\(\)\[\\\]\.\/\,\;\:\s\@\"]+\.)+[^\<\>\(\)\[\\\]\.\/\,\;\:\s\@\"]{2,})$');
            if (this.userEmail == "" || this.userEmail === undefined) {
                console.log("Email can't be empty");
                this.emailError = "Email can't be empty";
                return false;
            } else if (!regex.test(this.userEmail)){
                console.log("Not a valid email format");
                this.emailError = "Not a valid email format";
                return false;
            } else {
                this.emailError = undefined;

                const customer = await this.getCustomerProfileByEmail(this.userEmail)
                console.log("customer data...", customer)
                uuid = customer['id'];
            }
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
        // this.userCountries = details['country']  //userCountries need to get from store countries
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

            // console.log('RESPONDEDNTAHSADAHSJHADSAS', res)
            if (res.message) {

                this.deliveryFee = res.data[0].price;
                this.providerId = res.data[0].providerId;
                this.deliveryRef = res.data[0].refId;
                this.deliveryValidUpTo = res.data[0].validUpTo;
                this.serverDateTime = res.timestamp;

                const isError = res.data[0].isError;
                const errorMessage = res.data[0].message;

                // alert('delivery charge: '+this.deliveryFee)

                this.totalPrice = this.subTotal + this.deliveryFee;
                console.log('total price : ' + this.totalPrice)

                if(isError){

                    Swal.fire("Oops...", errorMessage, "error")

                }else{
                    this.hasDeliveryFee = true;

                    console.log("server time now(): "+ this.serverDateTime+"\n"+"this.deliveryValidUpTo: "+this.deliveryValidUpTo);
                    this.timerReset = this.timerReset + 1;
                    this.timeCounter(this.serverDateTime,this.deliveryValidUpTo);

                    // calling countPrice again so that deliveryFee included in the FE calculation
                    const countTotal = await this.countPrice(this.allProductInventory)

                    // Swal.fire("Delivery Fees", "Additional charges RM " + this.deliveryFee, "info")

                    this.payDisable = false;
                }
                
            }
        }, error => {
            Swal.fire("Oops...", "Error : <small style='color: red; font-style: italic;'>" + error.error.message + "</small>", "error")
        }) 

    }

    postInitOrder(){
        return new Promise(resolve => {
            // let data = {
            //     "cartId": this.cartID,
            //     "completionStatus": "",
            //     "created": "",
            //     "customerId": this.senderID,
            //     "customerNotes": "",
            //     "id": "",
            //     "paymentStatus": "PENDING",
            //     "privateAdminNotes": "",
            //     "storeId": this.storeID,
            //     "subTotal": 0,
            //     "total": this.totalPrice,
            //     "updated": "",
            //     "deliveryContactName": this.userName,
            //     "deliveryAddress": this.userAddress,  
            //     "deliveryContactPhone": this.userMsisdn,
            //     "deliveryPostcode":this.userPostcode,
            //     "deliveryCity": this.userCities,
            //     "deliveryState":this.userState,
            //     "deliveryCountry":this.userCountries,
            //     "deliveryEmail": this.userEmail,
            //     "deliveryProviderId": this.providerId,
            //     "deliveryQuotationReferenceId": this.deliveryRef,
            //     "deliveryQuotationAmount": this.deliveryFee,
            // }

            let data = {
                "cartId": this.cartID,
                "completionStatus": "RECEIVED_AT_STORE",
                "created": "",
                "customerId": this.senderID,
                "customerNotes": "",
                "id": "",
                "invoiceId": "", 
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
                    "zipcode": this.userPostcode
                },
                "paymentStatus": "PENDING",
                "privateAdminNotes": "",
                "storeId": this.storeID,
                "subTotal": this.subTotal,
                "total": this.totalPrice,
                "updated": ""
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
        
        // this is just the return value of the setInterval function, which is just a reference to that interval
        // console.log(showTime(logWhenDone));
    };

}
