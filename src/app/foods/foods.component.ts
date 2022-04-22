import { Component, OnInit } from '@angular/core';
import { FoodsService } from './foods.service';

@Component({
  selector: 'app-foods',
  templateUrl: './foods.component.html',
  styleUrls: ['./foods.component.css'],
})
export class FoodsComponent implements OnInit {
  constructor(private foodService: FoodsService) {}

  ngOnInit(): void {
    this.foodService.fetchFoods();
  }
}
