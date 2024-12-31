import { Injectable } from '@angular/core';
import { HttpClientModule, HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { LocationDetails } from '../models/LocationDetails';
import { WeatherDetails } from '../models/WeatherDetails';
import { TemperatureData } from '../models/TemperatureData';
import { TodayData } from '../models/TodayData';
import { WeekData } from '../models/WeekData';
import { TodaysHighlight } from '../models/TodaysHighlight';
import { Observable } from 'rxjs';
import { EnvironmentVariables } from '../environment/environmentvariables';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  cityName : string = "Bengaluru";
  language : string = "en-US";
  date : string = "20241228";
  units : string = "m";
  currentTime : Date;
  today : boolean = false;
  week : boolean = true;
  celsius : boolean = true;
  fahrenheit : boolean = false;
  isLoading : boolean = false;
  constructor(private _httpClient : HttpClient) { 
    //this.getData();
  }

  locationDetails? : LocationDetails;
  weatherDetails? : WeatherDetails;
  temperatureData :TemperatureData = new TemperatureData();
  todaysData?:TodayData[]=[];
  weekData? : WeekData[] = [];
  todaysHighlight? : TodaysHighlight = new TodaysHighlight();

  celsiusToFahrenheit(celsius : number) : number{
    return +((celsius * 1.8) + 32).toFixed(2);
  }

  fahrenheitToCelsius(fahrenheit:number):number{
    return +((fahrenheit - 32) * 0.555).toFixed(2);
  }

  getTimeFromString(localTime:string){
    return localTime.slice(11,16);
  }

  fillTodaysHighlightData(){
    this.todaysHighlight.airQuality = this.weatherDetails['v3-wx-globalAirQuality'].globalairquality.airQualityIndex;
    this.todaysHighlight.humidity = this.weatherDetails['v3-wx-observations-current'].relativeHumidity;
    this.todaysHighlight.sunrise = this.getTimeFromString(this.weatherDetails['v3-wx-observations-current'].sunriseTimeLocal);
    this.todaysHighlight.sunset = this.getTimeFromString(this.weatherDetails['v3-wx-observations-current'].sunsetTimeLocal);
    this.todaysHighlight.uvIndex = this.weatherDetails['v3-wx-observations-current'].uvIndex;
    this.todaysHighlight.visibility = this.weatherDetails['v3-wx-observations-current'].visibility;
    this.todaysHighlight.windStatus = this.weatherDetails['v3-wx-observations-current'].windSpeed;
  }

  fillTemperatureDataModel(){
    //Setting left container details model properties
    this.currentTime = new Date();
    this.temperatureData.day = this.weatherDetails['v3-wx-observations-current'].dayOfWeek;
    this.temperatureData.time = `${String(this.currentTime.getHours()).padStart(2,'0')}:${String(this.currentTime.getMinutes()).padStart(2,'0')}`;
    this.temperatureData.temperature = this.weatherDetails['v3-wx-observations-current'].temperature;
    this.temperatureData.location = `${this.locationDetails.location.city[0]},${this.locationDetails.location.country[0]}`;
    this.temperatureData.rainPercent = this.weatherDetails['v3-wx-observations-current'].precip24Hour;
    this.temperatureData.summaryPhrase = this.weatherDetails['v3-wx-observations-current'].wxPhraseLong;
    this.temperatureData.summaryImage = this.getSummaryImage(this.temperatureData.summaryPhrase);
  }

  fillWeekData(){
    var weekCount = 0;
    while(weekCount<7){
      this.weekData.push(new WeekData());
      this.weekData[weekCount].day = this.weatherDetails['v3-wx-forecast-daily-15day'].dayOfWeek[weekCount].slice(0,3);
      this.weekData[weekCount].tempMax = this.weatherDetails['v3-wx-forecast-daily-15day'].calendarDayTemperatureMax[weekCount];
      this.weekData[weekCount].tempMin = this.weatherDetails['v3-wx-forecast-daily-15day'].calendarDayTemperatureMin[weekCount];
      this.weekData[weekCount].summaryImage = this.getSummaryImage(this.weatherDetails['v3-wx-forecast-daily-15day'].narrative[weekCount]);
      weekCount++;
    }
  }

  fillTodayData(){
    var todayCount = 0;
    while(todayCount < 7){
      this.todaysData.push(new TodayData());
      this.todaysData[todayCount].time = this.weatherDetails['v3-wx-forecast-hourly-10day'].validTimeLocal[todayCount].slice(11,16);
      this.todaysData[todayCount].temperature = this.weatherDetails['v3-wx-forecast-hourly-10day'].temperature[todayCount];
      this.todaysData[todayCount].summaryImage = this.getSummaryImage(this.weatherDetails['v3-wx-forecast-hourly-10day'].wxPhraseShort[todayCount]);
      todayCount++;
    }
  }

  getSummaryImage(summary:string):string{
    //Base folder Address containing the images
    var baseAddress = 'assets/';
    var cloudySunny = 'cloudyandsunny.png';
    var rainSunny = 'rainyandsunny.png';
    var windy = 'windy.png';
    var sunny = 'sun.png';
    var rainy = 'rainy.png';

    if (String(summary).includes('Partly Cloudy') ||String(summary).includes('P Cloudy'))
        return baseAddress + cloudySunny;
    else if (String(summary).includes('Partly Rainy') ||String(summary).includes('P Rainy'))
       return baseAddress + rainSunny;
    else if (String(summary).includes('wind')) 
      return baseAddress + windy;
    else if (String(summary).includes('rain')) 
      return baseAddress + rainy;
    else if (String(summary).includes('Sun')) 
      return baseAddress + sunny;
    
    return baseAddress + cloudySunny;
  }

  prepareData() : void{
    this.fillTemperatureDataModel();
    this.fillWeekData();
    this.fillTodayData();
    this.fillTodaysHighlightData();
    console.log(this.temperatureData);
    console.log(this.weekData);
    console.log(this.todaysData);
    console.log(this.todaysHighlight);
  }

  getLocationDetails(cityName:string, language: string) : Observable<LocationDetails>{
    return this._httpClient.get<LocationDetails>(EnvironmentVariables.weatherAPILocationBaseURL,{
      headers : new HttpHeaders()
      .set(EnvironmentVariables.xRapidapiKeyName,EnvironmentVariables.xRapidapiKeyValue)
      .set(EnvironmentVariables.xRapidapiHostName, EnvironmentVariables.xRapidapiHostValue),
      params : new HttpParams()
      .set('query',cityName)
      .set('language',language)
    })
  }

  getWeatherReport(date: string, latitude : number, longitude : number, language : string, units : string):Observable<WeatherDetails>{
    return this._httpClient.get<WeatherDetails>(EnvironmentVariables.weatherAPIForecastBaseURL, {
      headers : new HttpHeaders()
      .set(EnvironmentVariables.xRapidapiKeyName,EnvironmentVariables.xRapidapiKeyValue)
      .set(EnvironmentVariables.xRapidapiHostName, EnvironmentVariables.xRapidapiHostValue),
      params : new HttpParams()
      .set('date',date)
      .set('language',language)
      .set('latitude',latitude)
      .set('longitude',longitude)
      .set('units',units)
    });

  }

  getData() {
    this.isLoading = true;
    let latitude: number;
    let longitude: number;
    this.todaysData = [];
    this.weekData = [];
    this.temperatureData = new TemperatureData();
    this.todaysHighlight = new TodaysHighlight();
    this.getLocationDetails(this.cityName, this.language).subscribe({
      next: (response) => {
        this.locationDetails = response;
        console.log(this.locationDetails);
        latitude = this.locationDetails?.location.latitude[0];
        longitude = this.locationDetails?.location.longitude[0];
        this.getWeatherReport(this.date, latitude, longitude, this.language, this.units).subscribe({
          next: (weatherResponse) => {
            this.weatherDetails = weatherResponse;
            console.log(this.weatherDetails);
            this.isLoading = false;
            this.prepareData();
          },
          error: (weatherError) => {
            console.error('Error fetching weather details:', weatherError);
          }
        });
      },
      error: (locationError) => {
        console.error('Error fetching location details:', locationError);
      }
    });
  }
  
}
