import { Component, OnInit } from '@angular/core';
import { PlatformLocation } from "@angular/common";
import { Title, Meta } from '@angular/platform-browser'; 

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'simplify-fe';
    currBaseURL: any;
    storeName: string;

  constructor(
    private platformLocation: PlatformLocation,
    private titleService: Title,
  ) {
        this.currBaseURL = (this.platformLocation as any).location.origin;

        var host = this.currBaseURL
        var subdomain = host.split('.')[0]

        this.storeName = subdomain.replace(/^(https?:|)\/\//, '')
  }

  ngOnInit(): void {

        const pageTitle = this.storeName + " store"
        this.titleService.setTitle(pageTitle)

  }

}
