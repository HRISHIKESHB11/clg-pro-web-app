import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClassRoomRoutingModule } from './class-room-routing.module';
import { ClassRoomComponent } from './class-room.component';


@NgModule({
  declarations: [
    ClassRoomComponent
  ],
  imports: [
    CommonModule,
    ClassRoomRoutingModule
  ]
})
export class ClassRoomModule { }
