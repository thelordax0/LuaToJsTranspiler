import { Token } from "./types";

export interface Expression {
  accept<T>(visitor: ExpressionVisitor<T>): T;
}

export interface Statement {
  accept<T>(visitor: StatementVisitor<T>): T;
}

export interface ExpressionVisitor<T> {
  visitBinaryExpr(expr: Binary): T;
  visitGroupingExpr(expr: Grouping): T;
  visitLiteralExpr(expr: Literal): T;
  visitUnaryExpr(expr: Unary): T;
  visitVariableExpr(expr: Variable): T;
  visitAssignExpr(expr: Assign): T;
  visitCallExpr(expr: Call): T;
  visitTableExpr(expr: Table): T;
  visitIndexExpr(expr: Index): T;
}

export interface StatementVisitor<T> {
  visitExpressionStmt(stmt: ExpressionStmt): T;
  visitFunctionStmt(stmt: Function): T;
  visitIfStmt(stmt: If): T;
  visitReturnStmt(stmt: Return): T;
  visitVarStmt(stmt: Var): T;
  visitWhileStmt(stmt: While): T;
  visitBlockStmt(stmt: Block): T;
}

export class Binary implements Expression {
  constructor(
    public left: Expression,
    public operator: Token,
    public right: Expression
  ) {}

  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.visitBinaryExpr(this);
  }
}

export class Grouping implements Expression {
  constructor(public expression: Expression) {}

  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.visitGroupingExpr(this);
  }
}

export class Literal implements Expression {
  constructor(public value: any) {}

  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.visitLiteralExpr(this);
  }
}

export class Unary implements Expression {
  constructor(public operator: Token, public right: Expression) {}

  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.visitUnaryExpr(this);
  }
}

export class Variable implements Expression {
  constructor(public name: Token) {}

  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.visitVariableExpr(this);
  }
}

export class Assign implements Expression {
  constructor(public name: Token, public value: Expression) {}

  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.visitAssignExpr(this);
  }
}

export class Call implements Expression {
  constructor(
    public callee: Expression,
    public paren: Token,
    public args: Expression[]
  ) {}

  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.visitCallExpr(this);
  }
}

export class ExpressionStmt implements Statement {
  constructor(public expression: Expression) {}

  accept<T>(visitor: StatementVisitor<T>): T {
    return visitor.visitExpressionStmt(this);
  }
}

export class Function implements Statement {
  constructor(
    public name: Token,
    public params: Token[],
    public body: Statement[]
  ) {}

  accept<T>(visitor: StatementVisitor<T>): T {
    return visitor.visitFunctionStmt(this);
  }
}

export class If implements Statement {
  constructor(
    public condition: Expression,
    public thenBranch: Statement,
    public elseBranch: Statement | null
  ) {}

  accept<T>(visitor: StatementVisitor<T>): T {
    return visitor.visitIfStmt(this);
  }
}

export class Return implements Statement {
  constructor(public keyword: Token, public value: Expression | null) {}

  accept<T>(visitor: StatementVisitor<T>): T {
    return visitor.visitReturnStmt(this);
  }
}

export class Var implements Statement {
  constructor(public name: Token, public initializer: Expression | null) {}

  accept<T>(visitor: StatementVisitor<T>): T {
    return visitor.visitVarStmt(this);
  }
}

export class While implements Statement {
  constructor(public condition: Expression, public body: Statement) {}

  accept<T>(visitor: StatementVisitor<T>): T {
    return visitor.visitWhileStmt(this);
  }
}

export class Block implements Statement {
  constructor(public statements: Statement[]) {}

  accept<T>(visitor: StatementVisitor<T>): T {
    return visitor.visitBlockStmt(this);
  }
}

export class Table implements Expression {
  constructor(
    public entries: { key: Expression | null; value: Expression }[]
  ) {}

  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.visitTableExpr(this);
  }
}

export class Index implements Expression {
  constructor(public table: Expression, public key: Expression) {}

  accept<T>(visitor: ExpressionVisitor<T>): T {
    return visitor.visitIndexExpr(this);
  }
}
