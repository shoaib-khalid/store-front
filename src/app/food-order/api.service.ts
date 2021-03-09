import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { Observable, of } from "rxjs";
import { PlatformLocation } from "@angular/common";


@Injectable({
  providedIn: 'root'
})
export class ApiService {

    currBaseURL: any;
    // endpointBaseURL: any;
    productServiceURL: any;
    userServiceURL: any;
    token:any = 'W0JAMWU1N2VhZTY=';

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

        } else if (stagingURL != null) {
            this.userServiceURL = "http://209.58.160.20:20921/";
            this.productServiceURL = "http://symplified.ai:7071/";

        } else {
            this.userServiceURL = "http://209.58.160.20:20921/";
            this.productServiceURL = "http://symplified.ai:7071/";
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

}
