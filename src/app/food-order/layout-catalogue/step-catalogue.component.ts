import { Component, OnInit } from '@angular/core';

// import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';

@Component({
  selector: 'app-step-catalogue',
  templateUrl: './step-catalogue.component.html',
  styleUrls: ['./step-catalogue.component.css']
})
export class StepCatalogueComponent implements OnInit {

  constructor(
    // public mScrollbarService: MalihuScrollbarService
  ) { }

  ngOnInit(): void {
    // this.mScrollbarService.initScrollbar(document.body, { axis: 'y', theme: 'dark-3', scrollButtons: { enable: true } });
  }

}
