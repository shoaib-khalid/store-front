import { Component, OnInit } from '@angular/core';
import { Stepper } from './food-order/../../models/Stepper';
import { Router } from '@angular/router';
import { DataBindService } from '../databind.service';

@Component({
  selector: 'food-app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.css']
})
export class StepperComponent implements OnInit {

    stepper:Stepper[];
    senderID:any;
    refID:any;
    storeID:any;

  constructor(
    private route: Router,
    private _databindService: DataBindService
  ) { }

  ngOnInit(): void {
    this.stepper = this._databindService.getStepper();

    if (this.route.url === '/checkout') {
        this.stepperHighlighter(2);
    }

  }

  goTo(event, id) {
    console.log(id);
    // console.log('current index: ' + idx);

    this.senderID = localStorage.getItem('sender_id');
    this.refID = localStorage.getItem('ref_id');
    this.storeID = localStorage.getItem('store_id');

    console.log(this.refID + "-" + this.senderID + "-" + this.storeID);

    switch (id) {
      case 1:
        // this.stepperHighlighter(id);
        this.route.navigateByUrl('/');
        // this.route.navigate(['/:referenceId'+this.refID+'/:senderId='+this.senderID+'/:storeId/:'+this.storeID])
        // this.route.navigateByUrl('/catalogue?referenceId='+this.refID+'&senderId='+this.senderID+'&storeId='+this.storeID);
        // router.navigateByUrl('/page?id=37&username=jimmy');
        // this.route.navigate(['catalogue']);
        // this.route.navigate(['catalogue', { referenceId: this.refID, senderId: this.senderID, storeId: this.storeID }]);
        break;
      case 2:
        // this.stepperHighlighter(id);
        this.route.navigate(['checkout']);
        break
      case 3: 
        // this.stepperHighlighter(id);
        break
      default:
        break;
    }
  }

  stepperHighlighter(id:number) {
    this.stepper.map((stepper, index) => {
      index++;
      if(index == id){
        stepper.status = !stepper.status;
        return stepper;
      }
    })
  }

}
