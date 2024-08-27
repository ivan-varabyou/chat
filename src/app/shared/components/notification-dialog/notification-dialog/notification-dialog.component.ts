import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationDialogComponent {
  dialogRef = inject(DialogRef);
  data: { message: string } = inject(DIALOG_DATA);

  close() {
    this.dialogRef.close();
  }
}
