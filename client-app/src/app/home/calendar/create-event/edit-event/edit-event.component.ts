import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CalEvent } from '../../events.model';
import { CalendarService } from '../../calendar-list/calendar.service';
import { Calendar } from '../../calendar-list/calendar.model';
import { DataStorageService, Emails } from 'src/app/home/shared/data-storage.service';
import { AuthService } from 'src/app/auth/auth.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { MatChipInputEvent, MatSnackBar, MatDialog, MatAutocomplete, MatAutocompleteSelectedEvent } from '@angular/material';
import { NgxMaterialTimepickerTheme } from 'ngx-material-timepicker';
import { GroupSelection } from 'src/app/home/shared/group-selection';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { AppointmentSnackbarComponent } from 'src/app/home/appointment/shared-appointment/appointment-snackbar/appointment-snackbar.component';

@Component({
  selector: 'app-edit-event',
  templateUrl: './edit-event.component.html',
  styleUrls: ['../create-event.component.css']
})
export class EditEventComponent implements OnInit {
  id:number;
  startDate;
  endDate;
  event: CalEvent;
  eventForm: FormGroup;
  primaryColor: string='';
  allDay=false;
  calendars: Calendar[];
  obj: Object;
  username: string;
  selectedCal: number;
  defaultTime: Date = new Date();
  defaultTime2: Date = new Date();
  email = new FormControl("",[Validators.email]);
  newEnd: Date;
  emails: string[] = [];
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  role: string;
  filteredUserList: Observable<string[]>;
  userList: string[] = [];
  @ViewChild("userInput", { static: false }) userInput: ElementRef<
    HTMLInputElement
  >;
  @ViewChild("chipList", { static: false }) chipList;
  @ViewChild("auto", { static: false }) matAutocomplete: MatAutocomplete;


  //theme for time picker
  timeTheme: NgxMaterialTimepickerTheme={
    container: {
      bodyBackgroundColor: 'darkgrey',
      buttonColor: 'white'
    },
    dial: {
      dialBackgroundColor: 'rgb(185, 163, 90)'
    },
    clockFace: {
      clockHandColor: '#800029',

    }
  }
  isEmailValid: boolean;
  errorMessage: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private dataStorage: DataStorageService,
    private calService: CalendarService,
    private snackbar: MatSnackBar,
    private dialog: MatDialog
  ) { 
    this.dataStorage.getEmails();
    this.dataStorage.emails.subscribe((result: Emails[]) => {
      if (result.length > 0) {
        result.forEach(o => this.userList.push(o.email));
      }
    });

    this.filteredUserList = this.email.valueChanges.pipe(
      startWith(null),
      map((user: string | null) =>
        user ? this.filter(user) : this.userList.slice()
      )
    );
  }

  filter(value: string): string[] {
    const filterValue = value.toLocaleLowerCase();
    return this.userList.filter(user =>
      user.toLocaleLowerCase().includes(filterValue)
    );
  }
  selected(event: MatAutocompleteSelectedEvent): void {
    if (!this.emails.includes(event.option.value)) {
      this.emails.push(event.option.value);
      this.userInput.nativeElement.value = "";
      this.email.setValue(null);
    }
  }

  ngOnInit() {
    this.role = this.authService.user;
    this.dataStorage.fetchCalendars();
    this.dataStorage.isLoading.subscribe(loading => {
      if(!loading){
        this.calendars = this.calService.getCalendars();
      }
    });
    this.route.params.subscribe((params: Params) => {
      this.id = +params["id"];
    });
    this.event = this.calService.getEvent(this.id);
    console.log(this.event);
    this.newEnd = this.event.end;
    if(this.event.allDay){
      this.newEnd.setDate(this.newEnd.getDate()-1);
    }
    
    this.primaryColor = this.event.backgroundColor;
    this.username = this.authService.name;
    this.calendars=this.calService.getCalendars().filter(cal => cal.createdBy.email === this.username);
    this.selectedCal = this.calService.getEventCal(this.event);
    console.log(this.selectedCal);
    this.allDay=(this.event.allDay);
    console.log(this.allDay);
    this.eventForm = new FormGroup({
      title: new FormControl(this.event.title,[Validators.required]),
      location: new FormControl(this.event.location, [Validators.required]),
      description: new FormControl(this.event.description, [Validators.required]),
      email: this.email,
      startDate: new FormControl(this.event.start,[Validators.required]),
      endDate: new FormControl(this.newEnd,[Validators.required]),
      startTime: new FormControl(this.event.start.toLocaleTimeString()),
      endTime: new FormControl(this.event.end.toLocaleTimeString()),
      primary: new FormControl(this.event.backgroundColor),
      allDay: new FormControl(this.event.allDay),
      calendar: new FormControl([Validators.required]),
    })

    for(let user of this.event.recipients){
      this.emails.push(user.email);
    }
  }

  getErrorMessage(){
    return this.email.hasError("email")
    ? "Not a valid email"
    : "";
  }

  allday(){
    this.allDay = !this.allDay;
    console.log(this.allDay)
  }

  onSubmit() {
    const eventFormValues = this.eventForm.value;
    if (eventFormValues.email) {
      this.emails = eventFormValues.email.split(",");
    }
    if(!this.allDay){
      this.startDate = new Date(eventFormValues.startDate
        .toDateString()
        .concat(" ")
        .concat(eventFormValues.startTime));
      this.endDate = new Date(eventFormValues.endDate
        .toDateString()
        .concat(" ")
        .concat(eventFormValues.endTime));
    } else{
      this.startDate = new Date(eventFormValues.startDate.toLocaleDateString());
      this.endDate = new Date(eventFormValues.endDate.toLocaleDateString());
    }
    console.log(this.startDate,this.endDate);
    //checking if start comes before end
    if ((this.startDate <= this.endDate && this.allDay) || (this.startDate<this.endDate && !this.allDay)) {
      //creating event object based on allDay
      if (!this.allDay) {
        this.obj = {
          calendarId: this.selectedCal,
          title: eventFormValues.title,
          description: eventFormValues.description,
          start: this.startDate,
          end: this.endDate,
          recipients: this.emails,
          location: eventFormValues.location,
          backgroundColor: this.primaryColor,
          borderColor: this.primaryColor,
          allDay: this.allDay
        };
      } else {
        eventFormValues.endDate.setDate(eventFormValues.endDate.getDate() + 1);
        this.obj = {
          calendarId: this.selectedCal,
          title: eventFormValues.title,
          description: eventFormValues.description,
          start: eventFormValues.startDate,
          end: eventFormValues.endDate.toISOString(),
          recipients: this.emails,
          location: eventFormValues.location,
          backgroundColor: this.primaryColor,
          borderColor: this.primaryColor,
          allDay: this.allDay
        };
      }

      console.log(this.obj);

      this.dataStorage.editEvent(this.event.id,this.obj).subscribe(result => {
        if(result) {
          this.dataStorage.fetchCalendars();
          this.snackbar.open(result.message, 'close', {duration:4000, panelClass: ["standard"]})
          this.router.navigate(["home/calendar"]);
        } else {
          this.snackbar.open('Something went wrong.', 'close', {duration:4000, panelClass: ["standard"]})
        }
      });
      this.router.navigate(["home/calendar"]);

    } else {
      //warning for start not being before end
      this.snackbar.open('Start must come before end.', 'close', {duration:4000, panelClass: ["standard"]})
    }

  }

  setPrimary(color: string){
    this.primaryColor = color;
  }

  onNoClick(){
    this.router.navigate(["home/calendar"]);
  }

  selectCalendar(id: number){
    this.selectedCal = id;
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    // const value = event.value;
    this.email.setValue(event.value);
    console.log(this.email.hasError("email"));
    if (!this.email.hasError("email")) {
      // if (!this.email.hasError("email")) {
      if (this.email.value.trim()) {
        this.isEmailValid = true;
        this.emails.push(this.email.value.trim());
        this.emails.sort((a, b) =>
          a.toLowerCase() < b.toLowerCase()
            ? -1
            : a.toLowerCase() > b.toLowerCase()
            ? 1
            : 0
        );
        console.log(this.emails);
      } else if (this.email.value === "" && this.emails.length < 0) {
        this.chipList.errorState = true;
        this.isEmailValid = false;
        this.errorMessage = "please enter a valid email address";
      } else {
        this.chipList.errorState = false;
      }
    } else {
      this.chipList.errorState = true;
      this.isEmailValid = false;
      this.errorMessage = "please enter a valid email address";
    }

    // Reset the input value
    if (input) {
      input.value = "";
    }
  }

  remove(email: string): void {
    const index = this.emails.indexOf(email);

    if (index >= 0) {
      this.emails.splice(index, 1);
    }
  }

  groupSelect(){
    const dialogRef = this.dialog.open(GroupSelection, {
      width: "500px"
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
      for(let group of result){
        console.log(group);
        for(let email of group.emails){
          console.log(email);
          if(!this.emails.includes(email.email)){
            this.emails.push(email.email);
          }
        }
      }
    })
}

}
