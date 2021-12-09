import { Component, OnInit } from '@angular/core';
import { isPlatformBrowser, PlatformLocation } from "@angular/common";
import { Title, Meta } from '@angular/platform-browser'; 
import { ApiService } from './food-order/api.service';
import { Router, NavigationEnd } from '@angular/router';
import { GoogleAnalyticsService } from './food-order/googleAnalytics.service';


declare let gtag: Function;
declare let ga: any;


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
    urlAfterRedirectsS = '';
  constructor(
    private platformLocation: PlatformLocation,
    private titleService: Title,
    private apiService: ApiService,
    private router: Router,
  ) {
        this.currBaseURL = (this.platformLocation as any).location.origin;

        var host = this.currBaseURL
        var subdomain = host.split('.')[0]

        this.storeName = subdomain.replace(/^(https?:|)\/\//, '')    
        
        
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
              this.urlAfterRedirectsS = event.urlAfterRedirects;              
              console.log("this.urlAfterRedirects ", this.urlAfterRedirectsS);
              
            }
          }
        );

        // GoogleAnalyticsService.loadGoogleAnalytics(this.googleAnalyticId);
        // this.router.events.subscribe(event => {
        //     if (event instanceof NavigationEnd) {
        //       (window as any).ga('set', 'page', event.urlAfterRedirects);
        //       (window as any).ga('send', 'pageview');
        //       console.log("event.urlAfterRedirects ", event.urlAfterRedirects);
        //     }
        //   }
        // );
        console.log("googleAnalyticId ", this.googleAnalyticId);
 
  }
  ngAfterViewInit() {
    this.initGoogleAnalyticsPageView()
  }

  private initGoogleAnalyticsPageView() {
    const interval = setInterval(() => {
      if ((window as any).ga && (window as any).ga.getAll) {
        this.router.events.subscribe(event => {
          const ga = (window as any).ga
          if (event instanceof NavigationEnd) {
            const tracker = ga.getAll()[0]
            tracker.set('page', event.urlAfterRedirects)
            tracker.send('pageview')
          }
        })
        clearInterval(interval)
      }
    }, 50)
  }

  async ngOnInit(){

        const storeInfo = await this.getMerchantInfo(this.storeName)
        console.log("FROM INDEX Store Info: ", storeInfo)

        this.storeNameRaw = storeInfo['name']
        
        const pageTitle = this.storeNameRaw + " Store"
        this.titleService.setTitle(pageTitle)
        
        this.googleAnalyticId = storeInfo['googleAnalyticId'];
        GoogleAnalyticsService.loadGoogleAnalytics(this.googleAnalyticId);
        if (this.urlAfterRedirectsS) {
            (window as any).ga('set', 'page', this.urlAfterRedirectsS);
              (window as any).ga('send', 'pageview');
        }
        console.log("googleAnalyticId ", this.googleAnalyticId);

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
     node.async = true; // makes script run asynchronously
     node.src = 'https://www.googletagmanager.com/gtag/js?id='+ googleAnalyticId; // sets the source (insert url in between quotes)
 
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

    //  console.log("googleAnalyticId ", googleAnalyticId);
    //   console.log("event.urlAfterRedirectsAfter ", this.urlAfterRedirects);
    //   gtag('config', googleAnalyticId, {'page_path': this.urlAfterRedirects});
  }

}
