import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class BoundariesService {
  constructor(private http: HttpClient) {}

  getCities() {
    return this.http.get<any[]>('/assets/boundaries.json');
  }

  getDistricts(cityId: number) {
    return this.getCities().pipe(
      map((data) => {
        let districts: any[] = data[cityId - 1].districts;
        return districts;
      })
    );
  }

  getWards(cityId: number, districtId: number) {
    return this.getCities().pipe(
      map((data) => {
        let lastDistrictNumber = 0;
        if (cityId >= 2)
          lastDistrictNumber =
            data[cityId - 2].districts[data[cityId - 2].districts.length - 1]
              .id;

        let wards: any[] =
          data[cityId - 1].districts[districtId - 1 - lastDistrictNumber].wards;
        return wards;
      })
    );
  }
}
