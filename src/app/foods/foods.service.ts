import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Food } from './food.model';

@Injectable({
  providedIn: 'root',
})
export class FoodsService {
  foodsChanged = new Subject<Food[]>();

  private foods: Food[] = [
    new Food(
      'Buffet Thịt nướng Meat & Meet',
      169000,
      'Giới hạn thời gian 120p',
      [],
      [],
      ['Món nướng', 'Buffet'],
      [
        'https://images.foody.vn/res/g100/992567/prof/s576x330/foody-upload-api-foody-mobile-70-191223094942.jpg',
      ]
    ),
    new Food('Bánh tráng', 20000, 'Đồng giá 20k', [], [], ['Bánh tráng'], []),
  ];

  constructor() {}

  getFoods() {
    return this.foods.slice();
  }

  addFood(f: Food) {
    this.foods.push(f);
    this.foodsChanged.next(this.getFoods());
  }
}
