export enum TokenType {
  // Anahtar Kelimeler
  FUNCTION = "FUNCTION",
  LOCAL = "LOCAL",
  IF = "IF",
  THEN = "THEN",
  ELSE = "ELSE",
  END = "END",
  WHILE = "WHILE",
  DO = "DO",
  RETURN = "RETURN",
  NIL = "NIL",

  // Operatörler
  PLUS = "PLUS",
  MINUS = "MINUS",
  MULTIPLY = "MULTIPLY",
  DIVIDE = "DIVIDE",
  ASSIGN = "ASSIGN",
  EQUALS = "EQUALS",
  NOT_EQUALS = "NOT_EQUALS",
  LESS_THAN = "LESS_THAN",
  LESS_EQUAL = "LESS_EQUAL",
  GREATER_THAN = "GREATER_THAN",
  GREATER_EQUAL = "GREATER_EQUAL",
  AND = "AND",
  OR = "OR",

  // Ayraçlar
  LEFT_PAREN = "LEFT_PAREN",
  RIGHT_PAREN = "RIGHT_PAREN",
  LEFT_BRACE = "LEFT_BRACE",
  RIGHT_BRACE = "RIGHT_BRACE",
  LEFT_BRACKET = "LEFT_BRACKET",
  RIGHT_BRACKET = "RIGHT_BRACKET",
  COMMA = "COMMA",
  DOT = "DOT",
  SEMICOLON = "SEMICOLON",
  COLON = "COLON",

  // Değerler
  IDENTIFIER = "IDENTIFIER",
  STRING = "STRING",
  NUMBER = "NUMBER",

  // Diğer
  EOF = "EOF",
}

export interface Token {
  type: TokenType;
  lexeme: string;
  literal: any;
  line: number;
}
