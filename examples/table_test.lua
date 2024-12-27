-- Array-like table
local numbers = {1, 2, 3, 4, 5};
print(numbers[1]); -- Lua'da diziler 1'den başlar

-- Object-like table
local person = {
  name = "Ahmet",
  age = 25,
  ["favorite-color"] = "blue" -- özel karakterli anahtarlar için
};

print(person.name);
print(person["favorite-color"]); 