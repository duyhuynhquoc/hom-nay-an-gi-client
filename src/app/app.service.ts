import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AppService {
  isLoading = false;
  isLoadingChanged: Subject<boolean> = new Subject<boolean>();

  loadingOn() {
    this.isLoading = true;
    this.isLoadingChanged.next(this.isLoading);
  }

  loadingOff() {
    this.isLoading = false;
    this.isLoadingChanged.next(this.isLoading);
  }
}
