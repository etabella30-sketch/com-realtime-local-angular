import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, SimpleChanges } from '@angular/core';
import { CommonfunctionService } from '../../../core/utility/commonfunction.service';

@Component({
  selector: 'avtr',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  templateUrl: './avatar.component.html',
  styleUrl: './avatar.component.scss'
})
export class AvatarComponent {
  @Input() size: string = 'lg';
  @Input() detail: any;
  @Input() active: boolean = false;
  initials: any = {};

  constructor(private cf: CommonfunctionService, private cdr: ChangeDetectorRef) { }


  ngOnChanges(changes: SimpleChanges): void {
    if (changes['detail'] && changes['detail'].currentValue) {
      this.cf.get_userinit(this.detail).then((initials) => {
        this.initials = initials;
        this.cdr.markForCheck();  // Mark this component for check
      });
    }
  }


}
