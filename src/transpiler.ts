import { Lexer } from "./lexer";
import { Parser } from "./parser";
import { JavaScriptGenerator } from "./generator";

export class Transpiler {
  private lexer!: Lexer;
  private parser!: Parser;
  private generator: JavaScriptGenerator;

  constructor() {
    this.generator = new JavaScriptGenerator();
  }

  transpile(source: string): string {
    try {
      // Lexical analiz
      this.lexer = new Lexer(source);
      const tokens = this.lexer.scanTokens();

      // Sözdizimsel analiz
      this.parser = new Parser(tokens);
      const statements = this.parser.parse();

      // JavaScript kodu üretimi
      return this.generator.generate(statements);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Transpilasyon hatası: ${error.message}`);
      }
      throw error;
    }
  }
}
