import {
  Expression,
  Statement,
  ExpressionVisitor,
  StatementVisitor,
  Binary,
  Grouping,
  Literal,
  Unary,
  Variable,
  Assign,
  Call,
  ExpressionStmt,
  Function,
  If,
  Return,
  Var,
  While,
  Block,
  Table,
  Index,
} from "./ast";
import { TokenType } from "./types";

export class JavaScriptGenerator
  implements ExpressionVisitor<string>, StatementVisitor<string>
{
  generate(statements: Statement[]): string {
    return statements.map((stmt) => stmt.accept(this)).join("\n");
  }

  visitBinaryExpr(expr: Binary): string {
    return `(${expr.left.accept(this)} ${this.getOperator(
      expr.operator.type
    )} ${expr.right.accept(this)})`;
  }

  visitGroupingExpr(expr: Grouping): string {
    return `(${expr.expression.accept(this)})`;
  }

  visitLiteralExpr(expr: Literal): string {
    if (expr.value === null) return "null";
    if (typeof expr.value === "string") return `"${expr.value}"`;
    return expr.value.toString();
  }

  visitUnaryExpr(expr: Unary): string {
    return `(${expr.operator.lexeme}${expr.right.accept(this)})`;
  }

  visitVariableExpr(expr: Variable): string {
    return expr.name.lexeme;
  }

  visitAssignExpr(expr: Assign): string {
    return `${expr.name.lexeme} = ${expr.value.accept(this)}`;
  }

  visitCallExpr(expr: Call): string {
    const callee = expr.callee.accept(this);
    const args = expr.args.map((arg) => arg.accept(this)).join(", ");

    if (callee === "print") {
      return `console.log(${args})`;
    }

    return `${callee}(${args})`;
  }

  visitExpressionStmt(stmt: ExpressionStmt): string {
    return `${stmt.expression.accept(this)};`;
  }

  visitFunctionStmt(stmt: Function): string {
    const params = stmt.params.map((param) => param.lexeme).join(", ");
    const body = stmt.body.map((s) => s.accept(this)).join("\n");
    return `function ${stmt.name.lexeme}(${params}) {\n${this.indent(body)}\n}`;
  }

  visitIfStmt(stmt: If): string {
    let result = `if (${stmt.condition.accept(this)}) {\n${this.indent(
      stmt.thenBranch.accept(this)
    )}\n}`;
    if (stmt.elseBranch !== null) {
      result += ` else {\n${this.indent(stmt.elseBranch.accept(this))}\n}`;
    }
    return result;
  }

  visitReturnStmt(stmt: Return): string {
    if (stmt.value === null) return "return;";
    return `return ${stmt.value.accept(this)};`;
  }

  visitVarStmt(stmt: Var): string {
    let result = `let ${stmt.name.lexeme}`;
    if (stmt.initializer !== null) {
      result += ` = ${stmt.initializer.accept(this)}`;
    }
    return result + ";";
  }

  visitWhileStmt(stmt: While): string {
    return `while (${stmt.condition.accept(this)}) {\n${this.indent(
      stmt.body.accept(this)
    )}\n}`;
  }

  visitBlockStmt(stmt: Block): string {
    return stmt.statements.map((s) => s.accept(this)).join("\n");
  }

  visitTableExpr(expr: Table): string {
    const entries = expr.entries.map((entry, index) => {
      if (entry.key === null) {
        // Array-like table
        return entry.value.accept(this);
      } else {
        // Object-like table
        const key =
          entry.key instanceof Literal
            ? JSON.stringify(entry.key.value)
            : `[${entry.key.accept(this)}]`;
        return `${key}: ${entry.value.accept(this)}`;
      }
    });

    // Eğer tüm anahtarlar null ise array, değilse object olarak üret
    const isArray = expr.entries.every((entry) => entry.key === null);
    return isArray ? `[${entries.join(", ")}]` : `{${entries.join(", ")}}`;
  }

  visitIndexExpr(expr: Index): string {
    const table = expr.table.accept(this);
    const key =
      expr.key instanceof Literal && typeof expr.key.value === "string"
        ? `.${expr.key.value}`
        : `[${expr.key.accept(this)}]`;
    return `${table}${key}`;
  }

  private getOperator(type: TokenType): string {
    switch (type) {
      case TokenType.PLUS:
        return "+";
      case TokenType.MINUS:
        return "-";
      case TokenType.MULTIPLY:
        return "*";
      case TokenType.DIVIDE:
        return "/";
      case TokenType.EQUALS:
        return "===";
      case TokenType.NOT_EQUALS:
        return "!==";
      case TokenType.LESS_THAN:
        return "<";
      case TokenType.LESS_EQUAL:
        return "<=";
      case TokenType.GREATER_THAN:
        return ">";
      case TokenType.GREATER_EQUAL:
        return ">=";
      case TokenType.AND:
        return "&&";
      case TokenType.OR:
        return "||";
      default:
        throw new Error(`Bilinmeyen operatör: ${type}`);
    }
  }

  private indent(code: string): string {
    return code
      .split("\n")
      .map((line) => "  " + line)
      .join("\n");
  }
}
