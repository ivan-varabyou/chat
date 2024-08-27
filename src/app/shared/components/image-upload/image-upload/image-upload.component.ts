import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  output,
  ViewChild,
} from '@angular/core';
import { ChatStore } from '../../../../core/store/chat/chat.store';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [],
  templateUrl: './image-upload.component.html',
})
export class ImageUploadComponent {
  @ViewChild('uploadInput', { read: ElementRef })
  private readonly uploadInput!: ElementRef<HTMLInputElement>;
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly store = inject(ChatStore);

  public upload = output<string>();
  protected hasUserName = !this.store.currentChatPartner()?.username;

  private selectedFile: File | null = null;
  protected base64String: string | null = null;

  protected readonly onFileSelected = (event: Event) => {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64prefix = this.setBase64Prefix(this.selectedFile?.type);
        this.base64String =
          base64prefix + reader.result?.toString().split(',')[1] || null;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(this.selectedFile);
    }
  };

  private readonly setBase64Prefix = (fileType: string | undefined): string => {
    let base64Prefix = '';
    switch (fileType) {
      case 'image/jpeg':
        base64Prefix = 'data:image/jpeg;base64,';
        break;
      case 'image/png':
        base64Prefix = 'data:image/png;base64,';
        break;
      case 'image/gif':
        base64Prefix = 'data:image/gif;base64,';
        break;
      case 'image/bmp':
        base64Prefix = 'data:image/bmp;base64,';
        break;
      case 'image/svg+xml':
        base64Prefix = 'data:image/svg+xml;base64,';
        break;
      case 'image/webp':
        base64Prefix = 'data:image/webp;base64,';
        break;
      default:
        base64Prefix = '';
    }
    return base64Prefix;
  };

  protected send() {
    this.upload.emit(this.base64String as string);
    this.clearSelectedFile();
  }

  protected clearSelectedFile() {
    this.base64String = null;
    this.selectedFile = null;
    this.uploadInput.nativeElement.value = '';
    this.cdr.detectChanges();
  }

  protected onUpload() {
    this.uploadInput.nativeElement.click();
  }
}
