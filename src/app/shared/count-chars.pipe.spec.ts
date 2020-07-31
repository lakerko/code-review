import { CountCharsPipe } from './count-chars.pipe';

describe('CountCharsPipe', () => {
  it('create an instance', () => {
    const pipe = new CountCharsPipe();
    expect(pipe).toBeTruthy();
  });
});
