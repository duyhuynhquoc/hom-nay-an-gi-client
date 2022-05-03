import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'hnag';
  isLoading = false;
  isLoadingSub = new Subscription();

  constructor(
    private authService: AuthService,
    private appService: AppService
  ) {}

  ngOnInit(): void {
    this.authService.authenticate();

    this.isLoadingSub = this.appService.isLoadingChanged.subscribe(
      (data) => (this.isLoading = data)
    );
  }

  ngOnDestroy(): void {
    this.isLoadingSub.unsubscribe();
  }
}
