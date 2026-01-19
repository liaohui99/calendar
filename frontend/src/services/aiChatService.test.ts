// src/services/aiChatService.test.ts
import { clearChatMemory, createNewSession } from './aiChatService';

// 模拟fetch
global.fetch = jest.fn();

describe('aiChatService测试', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('clearChatMemory', () => {
    test('应成功清空对话历史', async () => {
      // 模拟成功的API响应
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      const result = await clearChatMemory(123456789);

      expect(result).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        '/ai/calendar/chat/memory/123456789',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          credentials: 'include',
        })
      );
    });

    test('应在API响应失败时返回false', async () => {
      // 模拟失败的API响应
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await clearChatMemory(123456789);

      expect(result).toBe(false);
    });

    test('应在请求异常时返回false', async () => {
      // 模拟请求异常
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await clearChatMemory(123456789);

      expect(result).toBe(false);
    });

    test('应在请求超时时返回false', async () => {
      // 模拟请求超时
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      const result = await clearChatMemory(123456789);

      expect(result).toBe(false);
    });
  });

  describe('createNewSession', () => {
    test('应成功创建新会话并返回memoryId', async () => {
      // 模拟成功的API响应
      const mockNewMemoryId = 1704067200000;
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ data: mockNewMemoryId }),
      });

      const result = await createNewSession();

      expect(result).toBe(mockNewMemoryId);
      expect(global.fetch).toHaveBeenCalledWith(
        '/ai/calendar/chat/session',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          credentials: 'include',
        })
      );
    });

    test('应在API响应失败时返回null', async () => {
      // 模拟失败的API响应
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await createNewSession();

      expect(result).toBeNull();
    });

    test('应在请求异常时返回null', async () => {
      // 模拟请求异常
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await createNewSession();

      expect(result).toBeNull();
    });

    test('应在请求超时时返回null', async () => {
      // 模拟请求超时
      (global.fetch as jest.Mock).mockImplementationOnce(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      const result = await createNewSession();

      expect(result).toBeNull();
    });
  });
});
