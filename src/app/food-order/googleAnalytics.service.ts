import { Injectable } from "@angular/core";

type Tracker = {
    send: (
      hitType: string,
      category: string,
      action: string,
      label?: string
    ) => void;
  };
  
  declare const ga: {
    (...args: any[]): () => void;
    getAll: () => Tracker[];
  };
  
  const has = Object.prototype.hasOwnProperty;
  
  @Injectable({ providedIn: "root" })
  export class GoogleAnalyticsService {
    logCustomEvent(
      eventCategory: string,
      eventAction: string,
      eventLabel?: string
    ) {
      ga(() => {
        if (has.call(window, "ga")) {
          const tracker = ga.getAll();
          if (tracker?.length > 0) {
            tracker[0]?.send("event", eventCategory, eventAction, eventLabel);
          }
        }
      });
    }
  
    logPageView(url: string) {
      ga(() => {
        if (has.call(window, "ga")) {
          ga("set", "page", url);
          ga("send", "pageview");
        }
      });
    }
  }