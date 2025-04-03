import { Component, ElementRef, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MeetingsService } from '../../services/meetings.service';
import { NewMeetDetail } from 'src/app/shared/modals/newMeetDetail';
import { ActivatedRoute, Router } from '@angular/router';
import { UserDetail } from 'src/app/shared/modals/userDetail';
import { SeatDetail } from 'src/app/shared/modals/seatDetail';

@Component({
  selector: 'app-meetings',
  templateUrl: './meetings.component.html',
  styleUrls: ['./meetings.component.scss']
})
export class MeetingsComponent implements OnInit, OnChanges {
  @ViewChild('videoElement', { static: false }) videoElement!: ElementRef;
  stream!: MediaStream;

  constructor(
    private _meetingServices: MeetingsService,
    private _activeRoute: ActivatedRoute,
    private _router: Router
  ) { }

  ngOnInit(): void {
    this._activeRoute.queryParams.subscribe(
      (res: any) => {
        if (res['meetId']) {
          this.loadMeetDetailsByMeetingCode(res['meetId']);
        }
      }
    )
  }

  ngOnChanges(changes: SimpleChanges): void {
    // if (this._userList) {
    //   this.userList = this._userList;
    //   this.updateUserList()
    // }
    // if (this._requestUserList) {
    //   this.requestUserList = this._requestUserList
    //   this.updateUserList()
    // }
  }

  meetingDetails: NewMeetDetail = new NewMeetDetail();

  loadMeetDetailsByMeetingCode(_meetId: string) {
    this.meetingDetails = this._meetingServices.getMeetDetailsByMeetCode(_meetId);
    if (this.meetingDetails.MeetCode) {
      this.loadUserList();
      this.generateSeatListByMeetSeatQuantity();
    }
  }


  seatList: SeatDetail[] = []
  generateSeatListByMeetSeatQuantity() {
    if (this.meetingDetails.MeetCandidateQuantity) {
      for (let i = 0; i < Number(this.meetingDetails.MeetCandidateQuantity); i++) {
        let _seat = new SeatDetail();
        this.seatList.push(_seat);
      }
    }
  }

  userList: UserDetail[] = [];
  _userList: UserDetail[] = [];
  requestUserList: UserDetail[] = [];
  _requestUserList: UserDetail[] = [];
  loadUserList() {
    let _localStoArray = localStorage;
    if (_localStoArray.length) {
      let __userList: UserDetail[] = [];
      let __requestUserList: UserDetail[] = [];
      // debugger
      for (let i = 0; i < localStorage.length; i++) {
        let _key = localStorage.key(i);
        if (_key?.toLowerCase().includes('user')) {
          let _userDetails: any = localStorage.getItem(_key);
          // console.log(_userDetails);
          if (_userDetails) {
            _userDetails = JSON.parse(_userDetails);
            if (_userDetails.MeetCode === this.meetingDetails.MeetCode) {
              if (_key?.includes('_NewRequest')) {
                __requestUserList.push(_userDetails)
              } else {
                __userList.push(_userDetails);
              }
            }
          }
        }
      }
      if (this._userList.length != __userList.length) {
        this._userList = __userList;
        this.updateUserList();
      }
      if (this._requestUserList.length != __requestUserList.length) {
        this._requestUserList = __requestUserList;
        this.updateUserList()
      }
      // this._requestUserList = __requestUserList
    }
    setInterval(() => {
      this.loadUserList();
    }, 1000);
  }

  showRequestList: boolean = false;
  updateUserList() {
    this.userList = this._userList;
    this.requestUserList = this._requestUserList
  }

  leaveMeeting() {
    // localStorage.removeItem('user');
    this._router.navigate(['dashboard']);
  }

  startCamera() {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        this.stream = stream;
        this.videoElement.nativeElement.srcObject = stream;
      })
      .catch((error) => {
        console.error('Error accessing camera:', error);
      });
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
  }

  private mediaStream: MediaStream | null = null;

  async startScreenSharing() {
    try {
      this.mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: 'browser',
        } as MediaTrackConstraints,
        audio: false
      });

      const videoElement = document.getElementById('screenVideo') as HTMLVideoElement;
      if (videoElement) {
        videoElement.srcObject = this.mediaStream;
      }

      this.mediaStream.getVideoTracks()[0].onended = () => {
        this.stopScreenSharing();
      };
    } catch (error) {
      console.error('Error capturing screen:', error);
    }
  }

  stopScreenSharing() {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }

  approveMemberRequest(_user: UserDetail) {
    debugger
    let _key = 'user_' + _user.ConatctNo + '_' + _user.MeetCode + '_' + 'NewRequest';
    let _userDetail = localStorage.getItem(_key) || null;
    if (_userDetail) {
      localStorage.removeItem(_key);
      _key = 'user_' + _user.ConatctNo + '_' + _user.MeetCode
      localStorage.setItem(_key, _userDetail);
      this.loadUserList();
    }
  }

  // approveMemberRequest(_user: UserDetail) {
  //   debugger
  //   let _key = 'user_' + _user.ConatctNo + '_' + _user.MeetCode + '_' + 'NewRequest';
  //   let _userDetail = localStorage.getItem(_key) || null;
  //   if (_userDetail) {
  //     localStorage.removeItem(_key);
  //     _key = 'user_' + _user.ConatctNo + '_' + _user.MeetCode
  //     localStorage.setItem(_key, _userDetail);
  //     this.loadUserList();
  //   }
  // }

  isMicOn: boolean = false;
  isVideoOn: boolean = false;
  isScreenShredOn: boolean = false;


}
