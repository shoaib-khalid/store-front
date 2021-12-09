
  import {Injectable} from '@angular/core';
  import {HttpClient} from '@angular/common/http';
  import { ApiService } from './api.service';

  @Injectable()
  export class GoogleTrackingIDService {
  
    constructor(private http: HttpClient, private apiService: ApiService) { }
  
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