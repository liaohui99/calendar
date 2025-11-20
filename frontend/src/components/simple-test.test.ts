import { add, subtract } from './simple-test';

describe('Simple Functions Tests', () => {
  test('add should correctly sum two numbers', () => {
    expect(add(1, 2)).toBe(3);
  });

  test('subtract should correctly subtract two numbers', () => {
    expect(subtract(5, 2)).toBe(3);
  });
});