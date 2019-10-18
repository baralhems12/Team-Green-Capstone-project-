import { Component, OnInit } from "@angular/core";
import {
  FormGroup,
  FormControl,
  FormArray,
  FormBuilder,
  Validators
} from "@angular/forms";
import { CalEvent } from "../events.model";
import { EventService } from "../events.service";
import { Router } from "@angular/router";
import { CalendarService } from "../calendar-list/calendar.service";
import { Calendar } from "../calendar-list/calendar.model";
import { DateRange } from "../../appointment/appointment-model/date-range.model";
import { MatDialog, MatDialogRef } from "@angular/material";
import { DataStorageService } from "../../shared/data-storage.service";
import { DialogDateTimeIntervalDialog } from "../../appointment/appointment-create/appointment-create.component";
import { EventDate } from "../event-date.model";
import { TimeInterval } from "../../appointment/appointment-model/time-interval.model";
import { EventTime } from "../event-times.model";
import { AuthService } from "src/app/auth/auth.service";

@Component({
  selector: "app-create-event",
  templateUrl: "./create-event.component.html",
  styleUrls: ["./create-event.component.css"]
})
export class CreateEventComponent implements OnInit {
  eventForm: FormGroup;
  eventData: CalEvent;
  email = new FormControl();
  dateRangeArray: EventDate[] = [];
  primaryColor: string = "";
  secondaryColor: string = "";
  allDay = false;
  calendars: Calendar[];
  obj: Object;
  username: string;
  selectedCal: number;
  defaultTime: Date = new Date();
  defaultTime2: Date = new Date();
  emails: string[];

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private authService: AuthService,
    public dialog: MatDialog,
    private dataStorage: DataStorageService,
    private calService: CalendarService
  ) {}

  ngOnInit() {
    this.emails = [];
    this.username = this.authService.username;
    this.calendars = this.calService
      .getCalendars()
      .filter(cal => cal.createdBy === this.username);
    console.log(this.calendars);
    this.eventForm = new FormGroup({
      title: new FormControl(),
      description: new FormControl(""),
      location: new FormControl(),
      email: this.email,
      startDate: new FormControl(new Date()),
      startTime: new FormControl(),
      endDate: new FormControl(new Date()),
      endTime: new FormControl(),
      primary: new FormControl(),
      allDay: new FormControl(),
      calendar: new FormControl()
    });
    this.defaultTime.setHours(this.defaultTime.getHours() + 1);
    this.defaultTime.setMinutes(0);
    this.defaultTime2.setHours(this.defaultTime2.getHours() + 2);
    this.defaultTime2.setMinutes(0);
  }

  getErrorMessage() {
    return this.email.hasError("email") ? "Not a valid email" : "";
  }

  openDateRangeDialog(): void {
    const dialogRef = this.dialog.open(EventTimeDialog, {
      width: "300px"
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log(result);
      this.dateRangeArray = result;
    });
  }

  allday() {
    this.allDay = !this.allDay;
    console.log(this.allDay);
  }

  onSubmit() {
    const eventFormValues = this.eventForm.value;
    if (eventFormValues.email) {
      this.emails = eventFormValues.email.split(",");
    }
    console.log(eventFormValues.startDate.toLocaleDateString());
    console.log(this.primaryColor);
    console.log(this.secondaryColor);
    const startDate = eventFormValues.startDate
      .toDateString()
      .concat(" ")
      .concat(eventFormValues.startTime);
    const endDate = eventFormValues.endDate
      .toDateString()
      .concat(" ")
      .concat(eventFormValues.endTime);

    if (!this.allDay) {
      this.obj = {
        calendarId: this.selectedCal,
        title: eventFormValues.title,
        description: eventFormValues.description,
        start: startDate,
        end: endDate,
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

    this.dataStorage.storeEvent(this.obj).subscribe(result => {
      if (result) {
        this.dataStorage.fetchCalendars();
      }
    });

    this.router.navigate(["home/calendar"]);
  }
  setPrimary(color: string) {
    this.primaryColor = color;
  }
  setSecondary(color: string) {
    this.secondaryColor = color;
  }
  onNoClick() {
    this.router.navigate(["home/calendar"]);
  }
  selectCalendar(id: number) {
    this.selectedCal = id;
    console.log(this.selectedCal);
  }
}

@Component({
  selector: "event-time-dialog",
  templateUrl: "event-timeInterval-dialog.html"
})
export class EventTimeDialog {
  date = new FormControl("");
  dateData: EventDate;
  dateDataArray: EventDate[] = [];
  eventTimeArray: EventTime[] = [];

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<EventTimeDialog>,
    public dialog: MatDialog
  ) {}

  openTimeDialog(): void {
    const dialogRef = this.dialog.open(EventTimeIntervalDialog, {
      width: "300px"
    });
    dialogRef.afterClosed().subscribe(result => {
      this.eventTimeArray = result;
    });
  }

  addDate() {
    this.dateData = new EventDate(this.date.value, this.eventTimeArray);
    this.dateDataArray.push(this.dateData);
    this.date.setValue("");
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  saveDialogData() {
    this.addDate();
    this.dialogRef.close(this.dateDataArray);
  }
}

@Component({
  selector: "event-time-dialog",
  templateUrl: "event-time-dialog.html"
})
export class EventTimeIntervalDialog implements OnInit {
  timeIntervalFormData: FormGroup;
  timeIntervalData: EventTime;
  timeDataArray: EventTime[] = [];

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<EventTimeIntervalDialog>
  ) {}

  ngOnInit() {
    this.timeIntervalFormData = this.formBuilder.group({
      startTime: ["", Validators.required],
      endTime: ["", Validators.required]
    });
  }
  addTimeInterval() {
    const timeIntervalDataValues = this.timeIntervalFormData.value;
    this.timeIntervalData = new EventTime(
      timeIntervalDataValues.startTime,
      timeIntervalDataValues.endTime
    );
    this.timeDataArray.push(this.timeIntervalData);
    this.timeIntervalFormData.reset();
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

  saveDialogData() {
    this.addTimeInterval();
    this.dialogRef.close(this.timeDataArray);
    this.timeDataArray = [];
  }
}

@Component({
  selector: "event-time-dialog",
  templateUrl: "event-timeInterval-dialog.html"
})
export class EventTimeDialog {
  startdate = new FormControl();
  enddate = new FormControl();
  startDate = new Date().toLocaleDateString();
  endDate = new Date().toLocaleDateString();
  dateData: EventDate;
  dateDataArray: EventDate[] = [];
  eventTimeArray: EventTime[] = [];

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<EventTimeDialog>,
    public dialog: MatDialog
  ) {}

  openTimeDialog(): void {
    const dialogRef = this.dialog.open(EventTimeIntervalDialog, {
      width: "300px"
    });
    dialogRef.afterClosed().subscribe(result => {
      this.eventTimeArray = result;
    });
  }

  addDate() {
    this.dateData = new EventDate(this.startdate.value, this.eventTimeArray);
    this.dateDataArray.push(this.dateData);
    this.startdate.setValue(this.startDate);
    this.enddate.setValue(this.enddate);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  saveDialogData() {
    this.addDate();
    this.dialogRef.close(this.dateDataArray);
  }
}

@Component({
  selector: "event-time-dialog",
  templateUrl: "event-time-dialog.html"
})
export class EventTimeIntervalDialog implements OnInit {
  timeIntervalFormData: FormGroup;
  timeIntervalData: EventTime;
  timeDataArray: EventTime[] = [];

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<EventTimeIntervalDialog>
  ) {}

  ngOnInit() {
    this.timeIntervalFormData = new FormGroup({
      startTime: new FormControl(),
      endTime: new FormControl()
    });
  }
  addTimeInterval() {
    const timeIntervalDataValues = this.timeIntervalFormData.value;
    this.timeIntervalData = new EventTime(
      timeIntervalDataValues.startTime,
      timeIntervalDataValues.endTime
    );
    this.timeDataArray.push(this.timeIntervalData);
    this.timeIntervalFormData.reset();
  }
  onNoClick(): void {
    this.dialogRef.close();
  }

  saveDialogData() {
    this.addTimeInterval();
    this.dialogRef.close(this.timeDataArray);
    this.timeDataArray = [];
  }
}
