import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Food } from '../food.model';

@Component({
  selector: 'app-food-item',
  templateUrl: './food-item.component.html',
  styleUrls: ['./food-item.component.scss'],
})
export class FoodItemComponent implements OnInit {
  @Input() food: Food = new Food('', '', 0, '', [], [], [], []);

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {}

  onEditFood() {
    this.router.navigate(['foods', this.food.foodId, 'edit']);
  }
}
