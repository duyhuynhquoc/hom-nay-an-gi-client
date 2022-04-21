import { COMMA, ENTER } from '@angular/cdk/keycodes';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { Observable, Subscription } from 'rxjs';
import { BoundariesService } from 'src/app/boundaries.service';
import { map, startWith } from 'rxjs/operators';
import { FoodsService } from '../foods.service';
import { Food } from '../food.model';
import { FoodAddress } from '../foodAddress.model';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-food-edit',
  templateUrl: './food-edit.component.html',
  styleUrls: ['./food-edit.component.scss'],
})
export class FoodEditComponent implements OnInit, OnDestroy {
  addressCtrl: FormControl = new FormControl(null);

  wardCtrl: FormControl = new FormControl(null);
  selectedWard: any;
  wards: any[] = [];
  filterWards: Observable<any[]> = new Observable();

  districtCtrl: FormControl = new FormControl(null);
  selectedDistrict: any;
  districts: any[] = [];
  filterDistricts: Observable<any[]> = new Observable();

  cityCtrl: FormControl = new FormControl(null);
  selectedCity: any;
  cities: any[] = [];
  filterCities: Observable<any[]> = new Observable();

  reviewCtrl: FormControl = new FormControl(null);

  @ViewChild('tagInput', { static: false })
  tagInput: ElementRef<HTMLInputElement> = {} as ElementRef;
  separatorKeysCodes: number[] = [ENTER, COMMA];
  allTags: string[] = ['mon nuong', 'banh trang'];
  tags: string[] = [];
  tagCtrl: FormControl = new FormControl(null);
  filteredTags: Observable<string[]> = new Observable();

  foodForm: FormGroup = new FormGroup({
    foodName: new FormControl(null),
    averagePrice: new FormControl(null),
    note: new FormControl(null),
    addresses: new FormArray([]),
    reviews: new FormArray([]),
    images: new FormArray([]),
    tags: new FormArray([]),
  });

  constructor(
    private bService: BoundariesService,
    private foodService: FoodsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((fruit: string | null) =>
        fruit ? this._filter(fruit) : this.allTags.slice()
      )
    );
  }

  ngOnInit(): void {
    this.bService.getCities().subscribe((data) => {
      this.cities = data;

      this.filterCities = this.cityCtrl.valueChanges.pipe(
        startWith(''),
        map((value) => {
          return typeof value === 'string' ? value : value.name;
        }),
        map((name) => (name ? this._cityFilter(name) : this.cities.slice()))
      );
    });

    this.onAddAddress();
    this.onAddReview();
  }

  ngOnDestroy(): void {}

  addressControls() {
    return (<FormArray>this.foodForm.get('addresses')).controls;
  }

  reviewControls() {
    return (<FormArray>this.foodForm.get('reviews')).controls;
  }

  onAddAddress() {
    (<FormArray>this.foodForm.get('addresses')).push(
      new FormGroup({
        address: new FormControl(null),
        city: new FormControl(null),
        district: new FormControl(null),
        ward: new FormControl(null),
      })
    );
  }

  onAddReview() {
    (<FormArray>this.foodForm.get('reviews')).push(new FormControl(null));
  }

  onSubmit() {
    let addresses: any[] = [];
    this.foodForm.value.addresses.map((a: any) => {
      addresses.push(new FoodAddress(a.address, a.ward, a.district, a.city));
    });

    console.log(addresses);

    this.foodService.addFood(
      new Food(
        this.foodForm.value.foodName,
        this.foodForm.value.averagePrice,
        this.foodForm.value.note,
        addresses,
        this.foodForm.value.reviews,
        this.foodForm.value.tags,
        this.foodForm.value.images
      )
    );

    console.log(this.foodService.getFoods());

    this.router.navigate(['../'], { relativeTo: this.route });
  }

  add(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    // Add our tag
    if (value) {
      this.tags.push(value);
    }

    // Clear the input value
    event.chipInput!.clear();

    // Add tag to form control
    (<FormArray>this.foodForm.get('tags')).push(new FormControl(value));

    this.tagCtrl.setValue(null);
  }

  remove(tag: string): void {
    const index = this.tags.indexOf(tag);

    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    // Add tag to form control
    (<FormArray>this.foodForm.get('tags')).push(
      new FormControl(event.option.viewValue)
    );

    this.tags.push(event.option.viewValue);
    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue(null);
  }

  onWardSelected(ward: any) {
    this.selectedWard = ward;
  }

  onDistrictSelected(district: any) {
    this.selectedDistrict = district;

    this.wards = [];
    this.filterWards = new Observable();

    this.bService
      .getWards(this.selectedCity.id, this.selectedDistrict.id)
      .subscribe((data) => {
        this.wards = data;

        this.filterWards = this.districtCtrl.valueChanges.pipe(
          startWith(''),
          map((value) => {
            return typeof value === 'string' ? value : value.name;
          }),
          map((name) =>
            name ? this._districtFilter(name) : this.wards.slice()
          )
        );
      });
  }

  onCitySelected(city: any) {
    this.selectedCity = city;

    this.wards = [];
    this.filterWards = new Observable();

    this.districts = [];
    this.filterDistricts = new Observable();

    this.bService.getDistricts(this.selectedCity.id).subscribe((data) => {
      this.districts = data;

      this.filterDistricts = this.districtCtrl.valueChanges.pipe(
        startWith(''),
        map((value) => {
          return typeof value === 'string' ? value : value.name;
        }),
        map((name) =>
          name ? this._districtFilter(name) : this.districts.slice()
        )
      );
    });
  }

  private _cityFilter(name: string) {
    const filterValue = name.toLowerCase();

    return this.cities.filter((city) =>
      city.name.toLowerCase().includes(filterValue)
    );
  }

  private _districtFilter(name: string) {
    const filterValue = name.toLowerCase();

    return this.districts.filter((district) =>
      district.name.toLowerCase().includes(filterValue)
    );
  }

  displayFn(object: any) {
    return object && object.name ? object.name : '';
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allTags.filter((tag) =>
      tag.toLowerCase().includes(filterValue)
    );
  }
}
