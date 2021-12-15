import { Component, OnDestroy, OnInit } from '@angular/core';
import { isPlatformBrowser, PlatformLocation } from "@angular/common";
import { Title, Meta } from '@angular/platform-browser'; 
import { ApiService } from './food-order/api.service';
import { Router, NavigationEnd } from '@angular/router';
import { GoogleAnalyticsService } from './food-order/googleAnalytics.service';
import { timer } from 'rxjs/internal/observable/timer';
import { filter } from 'rxjs/internal/operators/filter';
import { switchMap, take, takeUntil, tap } from 'rxjs/operators';
import { Subject } from 'rxjs';


declare let gtag: Function;
const has = Object.prototype.hasOwnProperty;


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
    private destroy$ = new Subject<void>();

  constructor(
    private platformLocation: PlatformLocation,
    private titleService: Title,
    private apiService: ApiService,
    private router: Router,
    private googleAnalyticsService: GoogleAnalyticsService
  ) {
        this.currBaseURL = (this.platformLocation as any).location.origin;

        var host = this.currBaseURL
        var subdomain = host.split('.')[0]

        this.storeName = subdomain.replace(/^(https?:|)\/\//, '');


        
        this.getMerchantInfo(this.storeName).then((res)=>{
            this.googleAnalyticId = res['googleAnalyticId']
            console.log("googleAnalyticId0 ", this.googleAnalyticId);
            console.log("this.urlAfterRedirects ", this.urlAfterRedirectsS);

            
            // register google tag manager
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.src = 'https://www.google-analytics.com/analytics.js';
            document.head.appendChild(script);
            
            
            // register google tag manager
            const script2 = document.createElement('script');
            script2.async = true;
            script2.src = 'https://www.googletagmanager.com/gtag/js?id=' + this.googleAnalyticId;
            document.head.appendChild(script2);


            
            const gaScript = document.createElement('script');
            gaScript.innerHTML = `
            window.dataLayer = window.dataLayer || [];
            function gtag() { dataLayer.push(arguments); }
            gtag('js', new Date());
            gtag('config', '${this.googleAnalyticId}');
            `;
            document.head.appendChild(gaScript);

            this.router.events.subscribe(event => {
                console.log("router ", this.router.url);
          
                if(event instanceof NavigationEnd){
          
                    console.log("event.urlAfterRedirects ", event.urlAfterRedirects);
                    // register google analytics

                    gtag('config', this.googleAnalyticId, {'page_path': event.urlAfterRedirects});
                    
                }
    
            });

            // gtag('config', this.googleAnalyticId, 
            //        {
            //          'page_path': this.urlAfterRedirectsS
            //        }
            //       );
        });

        // this.router.events.pipe(
        //     filter(event => event instanceof NavigationEnd)
        //   ).subscribe((event: NavigationEnd) => {
        //     /** START : Code to Track Page View  */
        //      gtag('event', 'page_view', {
        //         page_path: event.urlAfterRedirects
        //      })
        //     /** END */
        //   })

        // this.router.events.subscribe(event => {      
        //     if(event instanceof NavigationEnd){

        //       console.log("googleAnalyticId1 ", this.googleAnalyticId);
        //       this.urlAfterRedirectsS = event.urlAfterRedirects;              
        //       console.log("event.urlAfterRedirects ", this.urlAfterRedirectsS);
        //     }
        //   })

        // GoogleAnalyticsService.loadGoogleAnalytics(this.googleAnalyticId);
        // this.router.events.subscribe(event => {
        //     if (event instanceof NavigationEnd) {
        //       (window as any).ga('set', 'page', event.urlAfterRedirects);
        //       (window as any).ga('send', 'pageview');
        //       console.log("event.urlAfterRedirects ", event.urlAfterRedirects);
        //     }
        //   }
        // );
        
 
  }
  ngAfterViewInit() {
    // this.initGoogleAnalyticsPageView()
  }

  

//   private initGoogleAnalyticsPageView() {
//     this.getMerchantInfo(this.storeName).then((res)=>{
//         console.log("res", res)
//         this.googleAnalyticId = res['googleAnalyticId']
//         console.log("googleAnalyticId0 ", this.googleAnalyticId);
//         console.log("this.urlAfterRedirects ", this.urlAfterRedirectsS);
//         gtag('config', this.googleAnalyticId, {'page_path': this.urlAfterRedirectsS});
//         const script = document.createElement('script');
//         script.async = true;
//         script.src = 'https://www.googletagmanager.com/gtag/js?id=' + this.googleAnalyticId;
//         document.head.prepend(script);
//     });
//   }

  /** Add Google Analytics Script Dynamically */
//   addGAScript() {
//     const res = this.getMerchantInfo(this.storeName)
//     this.googleAnalyticId = res['googleAnalyticId']

//     let gtagScript: HTMLScriptElement = document.createElement('script');
//     gtagScript.async = true;
//     gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + this.googleAnalyticId;
//     document.head.prepend(gtagScript);
//     /** Disable automatic page view hit to fix duplicate page view count  **/
//     gtag('config', this.googleAnalyticId, { send_page_view: false });
// }

  async ngOnInit(){

        const storeInfo = await this.getMerchantInfo(this.storeName)
        console.log("FROM INDEX Store Info: ", storeInfo)

        this.storeNameRaw = storeInfo['name']
        
        const pageTitle = this.storeNameRaw + " Store"
        this.titleService.setTitle(pageTitle)
        
        // timer(500)
        // .pipe(
        // filter(() => has.call(window, 'ga')),
        // take(1),
        // switchMap(() => {
        //     return this.router.events.pipe(
        //     filter((e) => e instanceof NavigationEnd),
        //     tap((e: NavigationEnd) => {
        //         console.log("NavigationEnd", e);
                
        //         this.googleAnalyticsService.logPageView(e.url);
        //     })
        //     );
        // }),
        // takeUntil(this.destroy$)
        // )
        // .subscribe();
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

//   loadScript(googleAnalyticId, urlAfterRedirectsS) {

//     /**
//      * First section
//      */
//      let node = document.createElement('script'); // creates the script tag
//      node.async = true; // makes script run asynchronously
//      node.src = 'https://www.googletagmanager.com/gtag/js?id='+ googleAnalyticId; // sets the source (insert url in between quotes)
 
//      document.getElementsByTagName('head')[0].appendChild(node);
 
//      /**
//       * Second section
//       */
//      let node2 = document.createElement('script'); // creates the script tag
 
//      let content2 = `
//      window.dataLayer = window.dataLayer || [];
//      function gtag(){dataLayer.push(arguments);}
//      gtag('js', new Date());
 
//      gtag('config', '${googleAnalyticId}', {'page_path': ${urlAfterRedirectsS}});`;
//      // and give it some content
//      const newContent2 = document.createTextNode(content2);
//      node2.appendChild(newContent2);
 
//      document.getElementsByTagName('head')[0].appendChild(node2);
 
//      /**
//       * Third section
//       */
//      let node3 = document.createElement('script'); // creates the script tag
 
//      let content3 = `Static.COOKIE_BANNER_CAPABLE = true;`;
//      // and give it some content
//      const newContent3 = document.createTextNode(content3);
//      node3.appendChild(newContent3);
 
//      document.getElementsByTagName('head')[0].appendChild(node3);
 
//      // append to head of document

//     //  console.log("googleAnalyticId ", googleAnalyticId);
//     //   console.log("event.urlAfterRedirectsAfter ", this.urlAfterRedirects);
//     //   gtag('config', googleAnalyticId, {'page_path': this.urlAfterRedirects});
//   }

}
