import { Component, OnInit, ViewChild } from '@angular/core';

// import classes
import { Category } from './food-order/../../models/Category';
import { Stepper } from './food-order/../../models/Stepper';

// import { DragScrollComponent } from './../../../../projects/ngx-drag-scroll/src/lib/ngx-drag-scroll.component';

@Component({
  selector: 'food-app-banner',
  templateUrl: './banner.component.html',
  styleUrls: ['./banner.component.css']
})
export class BannerComponent implements OnInit {

  categories:Category[];
  stepper:Stepper[];
  leftNavDisabled = false;
  rightNavDisabled = false;
  idx = 0;

  // public scrollbarOptions = { axis: 'x', theme: 'dark' };

  constructor() { }
  
  ngOnInit(): void {
    this.stepper = [
      {
        id: 1,
        name: 'Order',
        status: true
      },
      {
        id: 2,
        name: 'Checkout',
        status: false
      },
      {
        id: 3,
        name: 'Done',
        status: false
      }

    ]

    this.categories = [
      {
        category: 'Food',
        available: true,
        img: 'banner-sample5.jpg' 
      },
      {
        category: 'Beverages',
        available: true,
        img: 'banner-sample4.jpg' 
      },
      {
        category: 'Special',
        available: false,
        img: 'banner-sample3.jpg' 
      },
      {
        category: "All Category",
        available: true,
        img: 'banner-sample6.jpg' 
      },
      {
        category: "All Category",
        available: true,
        img: 'banner-sample3.jpg' 
      },
      {
        category: "All Category",
        available: true,
        img: 'banner-sample2.jpg' 
      },
      {
        category: "All Category",
        available: true,
        img: 'banner-sample7.jpg' 
      },
      {
        category: 'Food',
        available: true,
        img: 'banner-sample3.jpg' 
      },
      {
        category: 'Beverages',
        available: true,
        img: 'banner-sample4.jpg' 
      },
      {
        category: 'Special',
        available: false,
        img: 'banner-sample5.jpg' 
      },
      {
        category: 'Addon',
        available: false,
        img: 'banner-sample4.jpg' 
      },
      {
        category: 'Ala Carte',
        available: true,
        img: 'banner-sample7.jpg' 
      }
    ]
  }

  // @ViewChild('nav', { read: DragScrollComponent, static: true }) ds: DragScrollComponent;

  onIndexChanged(idx) {
    this.idx = idx;
    // console.log('current index: ' + idx);
  }

  onDragScrollInitialized() {
    // console.log('first demo drag scroll has been initialized.');
  }

  leftBoundStat(reachesLeftBound: boolean) {
    this.leftNavDisabled = reachesLeftBound;
  }

  rightBoundStat(reachesRightBound: boolean) {
    this.rightNavDisabled = reachesRightBound;
  }

  onSnapAnimationFinished() {
    // console.log('snap animation finished');
  }

  onDragStart() {
    // console.log('drag start');
  }

  onDragEnd() {
    // console.log('drag end');
  }

}
