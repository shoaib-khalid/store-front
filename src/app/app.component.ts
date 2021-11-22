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
    googleAnalyticId: string;

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
        
        this.googleAnalyticId = storeInfo['googleAnalyticId'];
        if (this.googleAnalyticId) {
            this.loadScript(this.googleAnalyticId);
        }
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

  loadScript(googleAnalyticId) {

    /**
     * First section
     */
     let node = document.createElement('script'); // creates the script tag
     node.src = 'https://www.googletagmanager.com/gtag/js?id='+ googleAnalyticId; // sets the source (insert url in between quotes)
     node.async = true; // makes script run asynchronously
 
     document.getElementsByTagName('head')[0].appendChild(node);
 
     /**
      * Second section
      */
     let node2 = document.createElement('script'); // creates the script tag
 
     let content2 = `
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
 
     gtag('config', '${googleAnalyticId}');`;
     // and give it some content
     const newContent2 = document.createTextNode(content2);
     node2.appendChild(newContent2);
 
     document.getElementsByTagName('head')[0].appendChild(node2);
 
     /**
      * Third section
      */
     let node3 = document.createElement('script'); // creates the script tag
 
     let content3 = `Static.COOKIE_BANNER_CAPABLE = true;`;
     // and give it some content
     const newContent3 = document.createTextNode(content3);
     node3.appendChild(newContent3);
 
     document.getElementsByTagName('head')[0].appendChild(node3);
 
     // append to head of document
  }

}
