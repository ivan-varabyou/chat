import { TestBed } from '@angular/core/testing';
import { SafeHtmlPipe } from './safe-html.pipe';
import { Renderer2 } from '@angular/core';

describe('SafeHtmlPipe', () => {
  let pipe: SafeHtmlPipe;
  let renderer: Renderer2;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Renderer2],
    });
    renderer = TestBed.inject(Renderer2);
    pipe = new SafeHtmlPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform HTML to plain text', () => {
    const htmlString = '<div>Hello <b>World</b></div>';
    const transformedString = pipe.transform(htmlString);
    expect(transformedString).toBe('Hello World');
  });

  it('should handle empty string', () => {
    const transformedString = pipe.transform('');
    expect(transformedString).toBe('');
  });
});
