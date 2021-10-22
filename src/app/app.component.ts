import { Component, OnInit } from '@angular/core';
import { PlatformLocation } from "@angular/common";
import { Title, Meta } from '@angular/platform-browser'; 
import { ApiService } from './food-order/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'simplify-fe';
    currBaseURL: any;
    storeName: string;
    storeNameRaw: any;

  constructor(
    private platformLocation: PlatformLocation,
    private titleService: Title,
    private apiService: ApiService
  ) {
        this.currBaseURL = (this.platformLocation as any).location.origin;

        var host = this.currBaseURL
        var subdomain = host.split('.')[0]

        this.storeName = subdomain.replace(/^(https?:|)\/\//, '')
  }

  async ngOnInit(){

        const storeInfo = await this.getMerchantInfo(this.storeName)
        console.log("FROM INDEX Store Info: ", storeInfo)

        this.storeNameRaw = storeInfo['name']

        const pageTitle = this.storeNameRaw + " Store"
        this.titleService.setTitle(pageTitle)
        

  }


  getMerchantInfo(storename){
    console.log('Banner Calling BACKEND getStoreInfo');
    return new Promise(resolve => {
        this.apiService.getStoreInfo(storename).subscribe((res: any) => {
            console.log('Banner Receive BACKEND getStoreInfo');
            resolve(res.data.content[0])
        }), error => {

        }
    })
  }

}
