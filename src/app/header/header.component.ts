import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppService } from '../app.service';
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
    private foodsService: FoodsService,
    private appService: AppService
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

  async signOut() {
    this.appService.loadingOn();
    await this.authService.signOut();
    this.userName = '';
    this.foodsService.clearFoods();
    this.appService.loadingOff();
  }
}
