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
import { Observable } from 'rxjs';
import { BoundariesService } from 'src/app/boundaries.service';
import { map, startWith } from 'rxjs/operators';
import { FoodsService } from '../foods.service';
import { FoodAddress } from '../foodAddress.model';
import { ActivatedRoute, Router } from '@angular/router';
import { SupabaseService } from 'src/app/supabase.service';
import { Food } from '../food.model';

@Component({
  selector: 'app-food-edit',
  templateUrl: './food-edit.component.html',
  styleUrls: ['./food-edit.component.scss'],
})
export class FoodEditComponent implements OnInit, OnDestroy {
  // Each position i represents for the i-th address FormGroup
  addressControls: FormControl[] = [];

  wardControls: FormControl[] = [];
  selectedWard: any[] = [];
  wards: any[] = [];
  filterWards: Observable<any[]>[] = [];

  districtControls: FormControl[] = [];
  selectedDistrict: any[] = [];
  districts: any[] = [];
  filterDistricts: Observable<any[]>[] = [];

  cityControls: FormControl[] = [];
  selectedCity: any[] = [];
  cities: any[] = [];
  filterCities: Observable<any[]>[] = [];

  reviewCtrl: FormControl = new FormControl(null);

  @ViewChild('tagInput', { static: false })
  tagInput: ElementRef<HTMLInputElement> = {} as ElementRef;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  allTags: string[] = [];
  tags: string[] = [];
  tagCtrl: FormControl = new FormControl(null);
  filteredTags: Observable<string[]> = new Observable();

  foodForm: FormGroup = new FormGroup({
    foodName: new FormControl(''),
    averagePrice: new FormControl(0),
    note: new FormControl(''),
    addresses: new FormArray([]),
    reviews: new FormArray([]),
    images: new FormArray([]),
    tags: new FormArray([]),
  });

  constructor(
    private bService: BoundariesService,
    private foodService: FoodsService,
    private supabaseService: SupabaseService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.bService.getCities().subscribe((data) => {
      this.cities = data;
    });

    // If it is edit mode -> Init form
    if (this.route.snapshot.routeConfig?.path === ':id/edit') {
      let food = this.foodService.getFood(this.route.snapshot.params['id']);
      this.initForm(food);

      this.foodService.foodsChanged.subscribe((foods) => {
        food = this.foodService.getFood(this.route.snapshot.params['id']);
        this.initForm(food);
      });
    }

    // Fetch tags from DB
    (await this.supabaseService.supabase.from('FoodTag').select('*')).data?.map(
      (tag) => this.allTags.push(tag.foodTagName)
    );

    // Update auto-complete input
    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((fruit: string | null) =>
        fruit ? this._filter(fruit) : this.allTags.slice()
      )
    );
  }

  ngOnDestroy(): void {}

  addressGroupControls() {
    return (<FormArray>this.foodForm.get('addresses')).controls;
  }

  reviewControls() {
    return (<FormArray>this.foodForm.get('reviews')).controls;
  }

  private initForm(food: Food) {
    console.log(food);

    let addresses = new FormArray([]);
    food.addresses.map((a) => {
      let addressCtrl: FormControl = new FormControl(a.address);
      let wardCtrl: FormControl = new FormControl(a.ward);
      let districtCtrl: FormControl = new FormControl(a.district);
      let cityCtrl: FormControl = new FormControl(a.city);

      this.addressControls.push(addressCtrl);
      this.wardControls.push(wardCtrl);
      this.districtControls.push(districtCtrl);
      this.cityControls.push(cityCtrl);

      console.log(addressCtrl);
      console.log(wardCtrl);
      console.log(districtCtrl);
      console.log(cityCtrl);

      addresses.push(
        new FormGroup({
          address: addressCtrl,
          ward: wardCtrl,
          district: districtCtrl,
          city: cityCtrl,
        })
      );
    });

    let reviews = new FormArray([]);
    food.reviews.map((r) => {
      reviews.push(new FormControl(r));
    });

    let tags = new FormArray([]);
    food.tags.map((t) => {
      tags.push(new FormControl(t));
    });

    if (food) {
      this.foodForm = new FormGroup({
        foodName: new FormControl(food.foodName),
        averagePrice: new FormControl(food.averagePrice),
        note: new FormControl(food.note),
        addresses: addresses,
        reviews: reviews,
        images: new FormArray([]),
        tags: tags,
      });
    }
  }

  onAddAddress() {
    let addressCtrl: FormControl = new FormControl('');
    let wardCtrl: FormControl = new FormControl('');
    let districtCtrl: FormControl = new FormControl('');
    let cityCtrl: FormControl = new FormControl('');

    this.addressControls.push(addressCtrl);
    this.wardControls.push(wardCtrl);
    this.districtControls.push(districtCtrl);
    this.cityControls.push(cityCtrl);

    this.filterCities[(<FormArray>this.foodForm.get('addresses')).length] =
      cityCtrl.valueChanges.pipe(
        startWith(''),
        map((value) => {
          return typeof value === 'string' ? value : value.name;
        }),
        map((name) => (name ? this._cityFilter(name) : this.cities.slice()))
      );

    (<FormArray>this.foodForm.get('addresses')).push(
      new FormGroup({
        address: addressCtrl,
        ward: wardCtrl,
        district: districtCtrl,
        city: cityCtrl,
      })
    );
  }

  onAddReview() {
    (<FormArray>this.foodForm.get('reviews')).push(new FormControl(''));
  }

  async onSubmit() {
    let addresses: any[] = [];
    this.foodForm.value.addresses.map((a: any) => {
      addresses.push(
        new FoodAddress(
          a.address,
          {
            id: a.ward.id,
            name: a.ward.name,
          },
          {
            id: a.district.id,
            name: a.district.name,
          },
          {
            id: a.city.id,
            code: a.city.code,
            name: a.city.name,
          }
        )
      );
    });

    const { foodName, averagePrice, note, reviews, tags, images } =
      this.foodForm.value;

    await this.foodService.addFood(
      foodName,
      averagePrice,
      note,
      addresses,
      reviews,
      tags,
      images
    );

    this.router.navigate(['../'], { relativeTo: this.route });
  }

  async onDeleteFood() {
    await this.foodService.deleteFood(this.route.snapshot.params['id']);
    this.router.navigate(['foods']);
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

  onWardSelected(i: number, ward: any) {
    this.selectedWard = ward;
  }

  onDistrictSelected(i: number, district: any) {
    this.selectedDistrict[i] = district;

    this.filterWards[i] = new Observable();

    this.bService
      .getWards(this.selectedCity[i].id, this.selectedDistrict[i].id)
      .subscribe((data) => {
        this.wards = data;

        this.filterWards[i] = this.wardControls[i].valueChanges.pipe(
          startWith(''),
          map((value) => {
            return typeof value === 'string' ? value : value.name;
          }),
          map((name) => (name ? this._wardFilter(name) : this.wards.slice()))
        );
      });
  }

  onCitySelected(i: number, city: any) {
    this.selectedCity[i] = city;
    console.log(city);

    this.filterWards[i] = new Observable();

    this.filterDistricts[i] = new Observable();

    this.bService.getDistricts(this.selectedCity[i].id).subscribe((data) => {
      this.districts = data;

      this.filterDistricts[i] = this.districtControls[i].valueChanges.pipe(
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

  private _wardFilter(name: string) {
    const filterValue = name.toLowerCase();

    return this.wards.filter((ward) =>
      ward.name.toLowerCase().includes(filterValue)
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
