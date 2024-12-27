import { Token, TokenType } from "./types";
import {
  Expression,
  Binary,
  Unary,
  Literal,
  Grouping,
  Variable,
  Assign,
  Call,
  Statement,
  ExpressionStmt,
  Function,
  If,
  Return,
  Var,
  While,
  Block,
  Table,
} from "./ast";

export class Parser {
  private current = 0;

  constructor(private tokens: Token[]) {}

  parse(): Statement[] {
    const statements: Statement[] = [];
    while (!this.isAtEnd()) {
      statements.push(this.declaration());
    }
    return statements;
  }

  private declaration(): Statement {
    try {
      if (this.match(TokenType.FUNCTION)) return this.function("function");
      if (this.match(TokenType.LOCAL)) return this.varDeclaration();
      return this.statement();
    } catch (error) {
      this.synchronize();
      throw error;
    }
  }

  private function(kind: string): Function {
    const name = this.consume(TokenType.IDENTIFIER, `${kind} adı bekleniyor.`);
    this.consume(TokenType.LEFT_PAREN, `${kind} adından sonra '(' bekleniyor.`);

    const parameters: Token[] = [];
    if (!this.check(TokenType.RIGHT_PAREN)) {
      do {
        if (parameters.length >= 255) {
          this.error(this.peek(), "Fonksiyon 255'ten fazla parametre alamaz.");
        }
        parameters.push(
          this.consume(TokenType.IDENTIFIER, "Parametre adı bekleniyor.")
        );
      } while (this.match(TokenType.COMMA));
    }

    this.consume(
      TokenType.RIGHT_PAREN,
      "Parametre listesinden sonra ')' bekleniyor."
    );

    const body: Statement[] = [];
    while (!this.check(TokenType.END) && !this.isAtEnd()) {
      body.push(this.declaration());
    }

    this.consume(
      TokenType.END,
      "Fonksiyon gövdesinden sonra 'end' bekleniyor."
    );
    return new Function(name, parameters, body);
  }

  private varDeclaration(): Statement {
    const name = this.consume(TokenType.IDENTIFIER, "Değişken adı bekleniyor.");

    let initializer: Expression | null = null;
    if (this.match(TokenType.ASSIGN)) {
      initializer = this.expression();
    }

    this.consume(
      TokenType.SEMICOLON,
      "Değişken tanımından sonra ';' bekleniyor."
    );
    return new Var(name, initializer);
  }

  private statement(): Statement {
    if (this.match(TokenType.IF)) return this.ifStatement();
    if (this.match(TokenType.WHILE)) return this.whileStatement();
    if (this.match(TokenType.LEFT_BRACE)) return new Block(this.block());
    if (this.match(TokenType.RETURN)) return this.returnStatement();

    return this.expressionStatement();
  }

  private ifStatement(): Statement {
    const condition = this.expression();
    this.consume(TokenType.THEN, "Koşuldan sonra 'then' bekleniyor.");

    const thenBranch = this.statement();
    let elseBranch = null;

    if (this.match(TokenType.ELSE)) {
      elseBranch = this.statement();
    }

    this.consume(TokenType.END, "If bloğundan sonra 'end' bekleniyor.");
    return new If(condition, thenBranch, elseBranch);
  }

  private whileStatement(): Statement {
    const condition = this.expression();
    this.consume(TokenType.DO, "Koşuldan sonra 'do' bekleniyor.");

    const body = this.statement();
    this.consume(TokenType.END, "While bloğundan sonra 'end' bekleniyor.");
    return new While(condition, body);
  }

  private block(): Statement[] {
    const statements: Statement[] = [];

    while (!this.check(TokenType.RIGHT_BRACE) && !this.isAtEnd()) {
      statements.push(this.declaration());
    }

    this.consume(TokenType.RIGHT_BRACE, "Bloktan sonra '}' bekleniyor.");
    return statements;
  }

  private returnStatement(): Statement {
    const keyword = this.previous();
    let value = null;

    if (!this.check(TokenType.SEMICOLON)) {
      value = this.expression();
    }

    this.consume(
      TokenType.SEMICOLON,
      "Return ifadesinden sonra ';' bekleniyor."
    );
    return new Return(keyword, value);
  }

  private expressionStatement(): Statement {
    const expr = this.expression();
    this.consume(TokenType.SEMICOLON, "İfadeden sonra ';' bekleniyor.");
    return new ExpressionStmt(expr);
  }

  private expression(): Expression {
    return this.assignment();
  }

  private assignment(): Expression {
    const expr = this.or();

    if (this.match(TokenType.ASSIGN)) {
      const equals = this.previous();
      const value = this.assignment();

      if (expr instanceof Variable) {
        return new Assign(expr.name, value);
      }

      this.error(equals, "Geçersiz atama hedefi.");
    }

    return expr;
  }

  private or(): Expression {
    let expr = this.and();

    while (this.match(TokenType.OR)) {
      const operator = this.previous();
      const right = this.and();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private and(): Expression {
    let expr = this.equality();

    while (this.match(TokenType.AND)) {
      const operator = this.previous();
      const right = this.equality();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private equality(): Expression {
    let expr = this.comparison();

    while (this.match(TokenType.NOT_EQUALS, TokenType.EQUALS)) {
      const operator = this.previous();
      const right = this.comparison();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private comparison(): Expression {
    let expr = this.term();

    while (
      this.match(
        TokenType.GREATER_THAN,
        TokenType.GREATER_EQUAL,
        TokenType.LESS_THAN,
        TokenType.LESS_EQUAL
      )
    ) {
      const operator = this.previous();
      const right = this.term();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private term(): Expression {
    let expr = this.factor();

    while (this.match(TokenType.MINUS, TokenType.PLUS)) {
      const operator = this.previous();
      const right = this.factor();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private factor(): Expression {
    let expr = this.unary();

    while (this.match(TokenType.DIVIDE, TokenType.MULTIPLY)) {
      const operator = this.previous();
      const right = this.unary();
      expr = new Binary(expr, operator, right);
    }

    return expr;
  }

  private unary(): Expression {
    if (this.match(TokenType.MINUS)) {
      const operator = this.previous();
      const right = this.unary();
      return new Unary(operator, right);
    }

    return this.call();
  }

  private call(): Expression {
    let expr = this.primary();

    while (true) {
      if (this.match(TokenType.LEFT_PAREN)) {
        expr = this.finishCall(expr);
      } else {
        break;
      }
    }

    return expr;
  }

  private finishCall(callee: Expression): Expression {
    const args: Expression[] = [];
    if (!this.check(TokenType.RIGHT_PAREN)) {
      do {
        if (args.length >= 255) {
          this.error(this.peek(), "255'ten fazla argüman olamaz.");
        }
        args.push(this.expression());
      } while (this.match(TokenType.COMMA));
    }

    const paren = this.consume(
      TokenType.RIGHT_PAREN,
      "Argümanlardan sonra ')' bekleniyor."
    );

    return new Call(callee, paren, args);
  }

  private primary(): Expression {
    if (this.match(TokenType.NUMBER, TokenType.STRING)) {
      return new Literal(this.previous().literal);
    }

    if (this.match(TokenType.NIL)) {
      return new Literal(null);
    }

    if (this.match(TokenType.IDENTIFIER)) {
      return new Variable(this.previous());
    }

    if (this.match(TokenType.LEFT_BRACE)) {
      return this.tableConstructor();
    }

    if (this.match(TokenType.LEFT_PAREN)) {
      const expr = this.expression();
      this.consume(TokenType.RIGHT_PAREN, "İfadeden sonra ')' bekleniyor.");
      return new Grouping(expr);
    }

    throw this.error(this.peek(), "İfade bekleniyor.");
  }

  private tableConstructor(): Expression {
    const entries: { key: Expression | null; value: Expression }[] = [];

    if (!this.check(TokenType.RIGHT_BRACE)) {
      do {
        if (this.match(TokenType.LEFT_BRACKET)) {
          // [key] = value şeklindeki girişler
          const key = this.expression();
          this.consume(
            TokenType.RIGHT_BRACKET,
            "Anahtar sonunda ']' bekleniyor."
          );
          this.consume(TokenType.ASSIGN, "Anahtar sonunda '=' bekleniyor.");
          const value = this.expression();
          entries.push({ key, value });
        } else if (
          this.check(TokenType.IDENTIFIER) &&
          this.checkNext(TokenType.ASSIGN)
        ) {
          // key = value şeklindeki girişler
          const key = new Literal(this.advance().lexeme);
          this.advance(); // = işaretini atla
          const value = this.expression();
          entries.push({ key, value });
        } else {
          // Sadece değer (array gibi)
          const value = this.expression();
          entries.push({ key: null, value });
        }
      } while (this.match(TokenType.COMMA));
    }

    this.consume(TokenType.RIGHT_BRACE, "Tablo sonunda '}' bekleniyor.");
    return new Table(entries);
  }

  private checkNext(type: TokenType): boolean {
    if (this.current + 1 >= this.tokens.length) return false;
    return this.tokens[this.current + 1].type === type;
  }

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw this.error(this.peek(), message);
  }

  private error(token: Token, message: string): Error {
    if (token.type === TokenType.EOF) {
      return new Error(`${token.line} satırının sonunda: ${message}`);
    } else {
      return new Error(
        `${token.line} satırında '${token.lexeme}' yakınında: ${message}`
      );
    }
  }

  private synchronize(): void {
    this.advance();

    while (!this.isAtEnd()) {
      if (this.previous().type === TokenType.SEMICOLON) return;

      switch (this.peek().type) {
        case TokenType.FUNCTION:
        case TokenType.LOCAL:
        case TokenType.IF:
        case TokenType.WHILE:
        case TokenType.RETURN:
          return;
      }

      this.advance();
    }
  }
}
