import { Injectable } from '@angular/core';

@Injectable()
export class GoogleAnalyticsService {

  constructor() { }

  /**
   * load analytics
   * @param trackingID
   */
  static loadGoogleAnalytics(trackingID: string): void {
    const gaScript1 = document.createElement('script');
    gaScript1.innerText = `window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;ga(\'create\', \'${ trackingID }\', \'auto\');`;

    const gaScript = document.createElement('script');
    gaScript.setAttribute('async', 'true');
    gaScript.setAttribute('src', 'https://www.google-analytics.com/analytics.js');
    

    document.documentElement.firstChild.appendChild(gaScript1);
    document.documentElement.firstChild.appendChild(gaScript);
  }

}