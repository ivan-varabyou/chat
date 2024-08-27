import { Pipe, PipeTransform, Renderer2, inject } from '@angular/core';

@Pipe({
  name: 'safeHtml',
  standalone: true,
})
export class SafeHtmlPipe implements PipeTransform {
  transform(value: string): string {
    if (typeof value !== 'string') return '';
    const renderer = inject(Renderer2);
    const div = renderer.createElement('div');
    div.innerHTML = value;
    return div.textContent || div.innerText || '';
  }
}
