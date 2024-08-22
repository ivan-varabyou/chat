import { TestBed } from '@angular/core/testing';
import { ViewService } from './view.service';
import { View } from './view.models';

describe('ViewService', () => {
  let service: ViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ViewService],
    });
    service = TestBed.inject(ViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with startView', () => {
    expect(service.currentView()).toBe(View.chatList);
  });

  it('should update current view', () => {
    service.goToChatWindow();
    expect(service.currentView()).toBe(View.chatWindow);
  });

  it('should go back to previous view', () => {
    service.goToChatWindow();
    service.goToFriendList();
    service.goBack();
    expect(service.currentView()).toBe(View.chatList);
  });

  it('should detect mobile iphone user agent', () => {
    spyOnProperty(navigator, 'userAgent', 'get').and.returnValue('iphone');
    expect(service.isRealMobile).toBeTrue();
  });

  it('should detect mobile android user agent', () => {
    spyOnProperty(navigator, 'userAgent', 'get').and.returnValue('android');

    expect(service.isRealMobile).toBeTrue();
  });

  it('should detect not mobile user agent', () => {
    spyOnProperty(navigator, 'userAgent', 'get').and.returnValue('chrome');
    expect(service.isRealMobile).toBeFalse();
  });

  it('should detect small screen as mobile', () => {
    service.innerWith.set(500);
    expect(service.isMobile()).toBeTrue();
  });

  it('should handle window resize', () => {
    const resizeEvent = new Event('resize');
    spyOn(window, 'dispatchEvent');
    service.innerWith.set(800);
    window.dispatchEvent(resizeEvent);
    expect(service.innerWith()).toBe(800);
  });

  afterEach(() => {
    service.resizeSubscription.unsubscribe();
  });
});
