import { Component } from '@angular/core';
import { faMagnifyingGlass, faLocation, faCloud, faCloudRain } from '@fortawesome/free-solid-svg-icons'; 
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { WeatherService } from '../service/weather.service';

@Component({
  selector: 'app-left-container',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './left-container.component.html',
  styleUrl: './left-container.component.css'
})
export class LeftContainerComponent {
  faMagnifyingGlass : any = faMagnifyingGlass;
  faLocation : any = faLocation;
  faCloud : any = faCloud;
  faCloudRain : any = faCloudRain;

  constructor(public weatherService : WeatherService){}

  onSearchLocation(location : string){
    this.weatherService.cityName = location;
    this.weatherService.getData();

  }

}
