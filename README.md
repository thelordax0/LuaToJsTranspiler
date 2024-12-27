# Lua-to-JS Transpiler

Bu proje, Lua benzeri bir programlama dilini JavaScript'e dönüştüren bir transpiler'dır.

## Özellikler

- Lua benzeri sözdizimi
- Temel kontrol yapıları (if, while)
- Fonksiyon tanımlamaları
- Değişken tanımlamaları
- Tablo (array/object) desteği
- Aritmetik ve mantıksal operatörler

## Kurulum

```bash
# Bağımlılıkları yükle
npm install

# TypeScript kodunu derle
npm run build
```

## Kullanım

```bash
# Bir Lua dosyasını JavaScript'e dönüştür
npm run start <girdi-dosyası> <çıktı-dosyası>

# Örnek:
npm run start examples/test.lua dist/output.js
```

## Örnek Kod

```lua
-- Faktöriyel hesaplama
function factorial(n)
  if (n <= 1) then
    return 1;
  end
  return n * factorial(n - 1);
end

local result = factorial(5);
print(result);  -- Çıktı: 120
```

## Tablo Kullanımı

```lua
-- Array benzeri tablo
local numbers = {1, 2, 3, 4, 5};
print(numbers[1]);  -- Lua'da diziler 1'den başlar

-- Object benzeri tablo
local person = {
  name = "Ahmet",
  age = 25,
  ["favorite-color"] = "blue"
};

print(person.name);
print(person["favorite-color"]);
```

## Lisans

MIT
