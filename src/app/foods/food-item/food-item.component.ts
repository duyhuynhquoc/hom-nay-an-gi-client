import { Component, Input, OnInit } from '@angular/core';
import { Food } from '../food.model';

@Component({
  selector: 'app-food-item',
  templateUrl: './food-item.component.html',
  styleUrls: ['./food-item.component.scss'],
})
export class FoodItemComponent implements OnInit {
  @Input() food: Food = new Food('', 0, '', [], [], [], []);

  constructor() {}

  ngOnInit(): void {}
}
