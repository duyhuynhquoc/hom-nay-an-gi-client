import { Component, OnInit } from '@angular/core';
import { Food } from '../food.model';
import { FoodsService } from '../foods.service';

@Component({
  selector: 'app-food-list',
  templateUrl: './food-list.component.html',
  styleUrls: ['./food-list.component.scss'],
})
export class FoodListComponent implements OnInit {
  foods: Food[] = [];

  constructor(private foodService: FoodsService) {}

  ngOnInit(): void {
    this.foodService.foodsChanged.subscribe((foods) => {
      this.foods = foods;
    });

    this.foods = this.foodService.getFoods();
    console.log(this.foods);
  }

  onAddFood() {}
}
