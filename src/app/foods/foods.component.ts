import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { FoodsService } from './foods.service';

@Component({
  selector: 'app-foods',
  templateUrl: './foods.component.html',
  styleUrls: ['./foods.component.css'],
})
export class FoodsComponent implements OnInit, OnDestroy {
  // userSub = new Subscription();

  constructor(
    private foodService: FoodsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.authService.getUserId() != '')
      this.foodService.fetchFoods(this.authService.getUserId());
  }

  ngOnDestroy(): void {
    // this.userSub.unsubscribe();
  }
}
