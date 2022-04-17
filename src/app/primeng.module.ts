import { NgModule } from '@angular/core';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@NgModule({
  imports: [TableModule, ButtonModule, CardModule],
  exports: [TableModule, ButtonModule, CardModule],
})
export class PrimeNgModule {}
