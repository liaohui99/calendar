// 最简单的测试文件，符合Jest命名规范
describe('Basic Tests', () => {
  test('should pass basic test', () => {
    expect(true).toBeTruthy();
  });
  
  test('should handle numbers correctly', () => {
    expect(1 + 1).toEqual(2);
  });
});