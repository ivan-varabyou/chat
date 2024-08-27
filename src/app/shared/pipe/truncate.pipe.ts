import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate',
  standalone: true,
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit: number): string {
    if (!value) return '';
    const newValue = value.trim();
    return newValue.length > limit
      ? newValue.slice(0, limit) + '...'
      : newValue;
  }
}
