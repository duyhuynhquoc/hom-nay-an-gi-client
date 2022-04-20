import { NgModule } from '@angular/core';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { AutoCompleteModule } from 'primeng/autocomplete';

@NgModule({
  imports: [
    TableModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    AutoCompleteModule,
  ],
  exports: [
    TableModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    AutoCompleteModule,
  ],
})
export class PrimeNgModule {}
