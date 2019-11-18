import { Component, OnInit, Inject } from '@angular/core';
import { CalendarService } from '../calendar-list/calendar.service';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { CalEvent } from '../events.model';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';
import { DataStorageService } from '../../shared/data-storage.service';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-event-detail',
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.css']
})
export class EventDetailComponent implements OnInit {
  id:number;
  event: any;
  newEnd: Date;
  isAppt: boolean;
  username: string;

  constructor(private calService: CalendarService,
    private router: Router,
    private ref: MatDialogRef<EventDetailComponent>,
    private authService: AuthService,
    private dialog: MatDialog,
    private dataStorage: DataStorageService,
    @Inject(MAT_DIALOG_DATA)public data: CalEvent) { 
    }

  ngOnInit() {
    this.event = this.data;
    this.username = this.authService.name;
    if(this.event.allDay && this.event.end){
      this.newEnd = this.event.end;
      this.newEnd.setDate(this.event.end.getDate()-1);
      console.log(this.newEnd);
      console.log(this.event.id);
    }
    console.log(this.event);
    if(this.event.extendedProps.timeSlotId){
      this.isAppt = true;
    } else{
      this.isAppt = false;
    }
  }

  close(){
    this.ref.close();
  }

  onNoClick(){
    this.ref.close();
  }

  editEvent(){
    this.ref.close();
    this.router.navigate(["home/edit-event", this.event.id])
  }

  deleteEvent(){
    const dialogRef = this.dialog.open(EventDeleteConfirm, {
      width: "300px"
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result === 'confirmed'){
        this.dataStorage.deleteEvent(this.event.id);
      }
    })
  }

}

@Component({
  selector: 'confirm-event-delete',
  templateUrl: 'event-delete-confirm.html',
  styleUrls: ['./event-detail.component.css']
})

export class EventDeleteConfirm{
  constructor(
    private ref: MatDialogRef<EventDeleteConfirm>
  ){}

  delete(){
    this.ref.close('confirmed')
  }

  close(){
    this.ref.close('cancel');
  }
}
