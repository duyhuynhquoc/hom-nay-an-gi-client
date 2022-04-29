import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { Food } from '../food.model';
import { FoodsService } from '../foods.service';

@Component({
  selector: 'app-food-list',
  templateUrl: './food-list.component.html',
  styleUrls: ['./food-list.component.scss'],
})
export class FoodListComponent implements OnInit, OnDestroy {
  foods: Food[] = [];
  isFetching = false;
  isAuthenticated = false;

  foodsSub = new Subscription();
  authSub = new Subscription();

  constructor(
    private foodService: FoodsService,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.foodsSub = this.foodService.foodsChanged.subscribe((foods) => {
      this.foods = foods;
    });

    this.authSub = this.authService.userChanged.subscribe((data) => {
      this.isAuthenticated = !(data.userId == '');
    });

    this.isAuthenticated = this.authService.getUserName() != '';
    this.foods = this.foodService.getFoods();
  }

  ngOnDestroy(): void {
    this.foodsSub.unsubscribe();
    this.authSub.unsubscribe();
  }

  onAddFood() {
    this.router.navigate(['new'], { relativeTo: this.route });
  }
}
