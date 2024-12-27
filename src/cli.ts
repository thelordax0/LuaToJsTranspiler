import { Transpiler } from "./transpiler";
import * as fs from "fs";
import * as path from "path";

function main() {
  const args = process.argv.slice(2);
  if (args.length !== 2) {
    console.error("Kullanım: ts-node cli.ts <girdi-dosyası> <çıktı-dosyası>");
    process.exit(1);
  }

  const [inputFile, outputFile] = args.map((arg) =>
    arg.replace(/\//g, path.sep)
  );

  try {
    const source = fs.readFileSync(inputFile, "utf-8");
    const transpiler = new Transpiler();
    const result = transpiler.transpile(source);

    const outputDir = path.dirname(outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputFile, result);
    console.log(`Transpilasyon başarılı: ${outputFile}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Hata:", error.message);
    } else {
      console.error("Bilinmeyen hata oluştu");
    }
    process.exit(1);
  }
}

main();
