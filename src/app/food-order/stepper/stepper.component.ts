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

  constructor(
    private route: Router,
    private _databindService: DataBindService
  ) { }

  ngOnInit(): void {
    this.stepper = this._databindService.getStepper();
  }

  goTo(event, id) {
    console.log(id);
    // console.log('current index: ' + idx);
    switch (id) {
      case 1:
        this.stepperHighlighter(id);
        this.route.navigate(['catalogue']);
        break;
      case 2:
        this.stepperHighlighter(id);
        this.route.navigate(['checkout']);
        break
      case 3: 
        this.stepperHighlighter(id);
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
