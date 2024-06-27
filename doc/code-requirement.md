# 牛马之家代码规范

为了确保 "牛马之家" 项目代码的高质量、可维护性和一致性，特制定以下 Go 语言代码规范。请所有开发人员遵循本规范进行开发。

## 1. 文件和目录结构

- 使用小写字母和短横线（`-`）命名目录和文件。
  - 例如：`user_service.go`，`order_repository.go`
- 每个包在单独的目录中，包名应与目录名一致。

## 2. 包导入

- 标准库导入应放在最上层。
- 第三方库放在中间层。
- 项目内部包放在最下层。
- 各部分之间用空行分隔。
- 示例：

  ```go
  import (
      "fmt"
      "net/http"

      "github.com/sirupsen/logrus"

      "githome.com/company/project/repo/module"
  )
  ```

## 3. 变量和常量命名

- 使用驼峰命名法（camelCase）命名变量和常量。
  - 例如：`userID`, `orderList`
- 使用简短但有意义的名字。
- 全局常量使用 PascalCase，并添加类型前缀。
  - 例如：`const MaxUserLimit int = 100`

## 4. 函数和方法

- 函数名使用 PascalCase。
  - 例如：`func CalculateTotal() int {...}`
- 确保函数单一职责，一个函数只完成一项任务。
- 避免函数参数过多，超过 3 个参数请考虑重构。

## 5. 注释

- 所有公共函数和结构体必须有注释。注释采用完整句式，并结束于句号。
- 使用行注释（`//`）而非块注释（`/*...*/`）。
- 示例：
  ```go
  // CalculateTotal calculates the total amount for the given orders.
  func CalculateTotal(orders []Order) int {...}
  ```

## 6. 错误处理

- 使用统一的错误处理模式。
- 优先使用 `errors.New` 或 `fmt.Errorf` 创建错误。
  - 例如：
    ```go
    if err != nil {
        return errors.New("failed to open file")
    }
    ```
- 使用 `panic` 仅限于真正的不可恢复的错误。

## 7. 流程控制

- 避免过度嵌套的 `if`、`for` 等语句。
- 使用早返回（early return）简化函数逻辑。
- 示例：
  ```go
  func ProcessOrder(order Order) error {
      if !order.IsValid() {
          return errors.New("invalid order")
      }
      // 处理后续逻辑...
  }
  ```

## 8. 格式化和风格

- 使用 `gofmt` 自动格式化代码。
- 确保代码缩进为 1 个 tab。
- 使用空格分隔操作符，保证代码可读性。
  - 例如：`a + b`，而不是`a+b`

## 9. 并发编程

- 小心使用共享资源，必要时使用 `sync.Mutex` 或 channel。
- 为每个 goroutine 命名，便于调试和日志记录。
