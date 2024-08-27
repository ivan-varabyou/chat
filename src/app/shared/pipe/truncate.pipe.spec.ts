import { TruncatePipe } from './truncate.pipe';

describe('TruncatePipe', () => {
  it('create an instance', () => {
    const pipe = new TruncatePipe();
    expect(pipe).toBeTruthy();
  });

  it('should return empy value', () => {
    const pipe = new TruncatePipe();
    const value = '';
    expect(pipe.transform(value, 5)).toEqual(value);
  });

  it('should return correct value if value length 5 and limit is 3', () => {
    const pipe = new TruncatePipe();
    const value = 'hello';
    const limit = 3;
    expect(pipe.transform(value, limit)).toEqual('hel...');
  });

  it('should return correct value if value length 5 and limit is 5', () => {
    const pipe = new TruncatePipe();
    const value = 'hello';
    const limit = 5;
    expect(pipe.transform(value, limit)).toEqual('hello');
  });
});
