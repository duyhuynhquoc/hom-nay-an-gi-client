import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { FoodsService } from '../foods/foods.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  userName: string = '';
  userSub = new Subscription();

  constructor(
    private authService: AuthService,
    private foodsService: FoodsService
  ) {}

  ngOnInit(): void {
    this.userSub = this.authService.userChanged.subscribe((data) => {
      this.userName = data.userName;
    });

    this.userName = this.authService.getUserName();
  }

  ngOnDestroy(): void {
    this.userSub.unsubscribe();
  }

  signOut() {
    this.authService.signOut();
    this.userName = '';
    this.foodsService.clearFoods();
  }
}
