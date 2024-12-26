import os

# Создаем папку documents, если её нет
os.makedirs("documents", exist_ok=True)

# Генерация файлов с уникальным содержанием
for i in range(1, 48):  # 47 файлов
    filename = f"documents/document{i}.txt"
    content = f"Это файл номер {i}. Он содержит тестовые данные для поиска."
    with open(filename, "w", encoding="utf-8") as f:
        f.write(content)

print("Файлы успешно созданы!")
