// 全局变量声明
interface Global {
  mockNavigateFn?: jest.Mock;
}

declare var global: Global;