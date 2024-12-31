import { CommonModule, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faThumbsUp, faThumbsDown, faFaceSmile, faFaceFrown } from '@fortawesome/free-solid-svg-icons';
import { WeatherService } from '../service/weather.service';

@Component({
  selector: 'app-right-container',
  standalone: true,
  imports: [CommonModule,FontAwesomeModule],
  templateUrl: './right-container.component.html',
  styleUrl: './right-container.component.css'
})
export class RightContainerComponent {
  constructor(public weatherService : WeatherService){}

  faThumbsUp : any = faThumbsUp;
  faThumbsDown : any = faThumbsDown;
  faFaceSmile : any = faFaceSmile;
  faFaceFrown : any = faFaceFrown;

  onTodayClick(){
    this.weatherService.today = true;
    this.weatherService.week = false;
  }

  onWeekClick(){
    this.weatherService.today = false;
    this.weatherService.week = true;
  }

  onCelsiusClick(){
    this.weatherService.celsius = true;
    this.weatherService.fahrenheit = false;
  }

  onFahrenheitClick(){
    this.weatherService.fahrenheit = true;
    this.weatherService.celsius=false;
  }
}
