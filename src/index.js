const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 8080;

// Пути к папкам
const documentsPath = path.join(__dirname, "../documents");
const publicPath = path.join(__dirname, "../public");
let invertedIndex = {};

// Функция для построения инвертированного индекса
function buildIndex(directory) {
    const files = fs.readdirSync(directory);
    console.log("Файлы для индексирования:", files);
  
    files.forEach((file) => {
      const filePath = path.join(directory, file);
      const content = fs.readFileSync(filePath, "utf8").toLowerCase();
      console.log(`Содержимое файла "${file}":`, content);
  
      // Извлечение слов (русский + латинский алфавиты, цифры)
      const words = content.match(/[а-яёa-z0-9]+/gi) || [];
      console.log(`Слова из файла "${file}":`, words);
  
      words.forEach((word) => {
        if (!invertedIndex[word]) {
          invertedIndex[word] = [];
        }
        if (!invertedIndex[word].includes(file)) {
          invertedIndex[word].push(file);
        }
      });
    });
  
    console.log("Построенный инвертированный индекс:", invertedIndex);
  }

// Построение индекса при запуске сервера
buildIndex(documentsPath);

// Middleware для обработки форм и статических файлов
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicPath)); // Отдаем файлы из папки public

// Обработка поиска
app.get("/search", (req, res) => {
    const query = req.query.query.toLowerCase().trim(); // Извлечение и очистка строки запроса
    const words = query.match(/[а-яёa-z0-9]+/gi); // Разделение строки на слова
  
    if (!words || words.length === 0) {
        res.send(`
            <p>Введите одно или два слова для поиска.</p>
            <a href="/">Назад</a>
        `);
        return;
    }
  
    let result = [];
  
    if (words.length === 1) {
        // Поиск по одному слову
        result = invertedIndex[words[0]] || [];
    } else if (words.length === 2) {
        // Поиск по двум словам
        const [word1, word2] = words;
        const files1 = invertedIndex[word1] || [];
        const files2 = invertedIndex[word2] || [];
  
        // Находим пересечение массивов
        result = files1.filter((file) => files2.includes(file));
    }
  
    if (result.length === 0) {
        res.send(`
            <p>Ни одного совпадения для запроса "${query}" не найдено.</p>
            <a href="/">Назад</a>
        `);
    } else {
        // Формируем результат с содержимым файлов
        const fileList = result
            .map((file) => {
                const filePath = path.join(documentsPath, file);
                const content = fs.readFileSync(filePath, "utf8");
                return `
                    <li>
                        <strong>${file}</strong>
                        <pre>${content}</pre>
                    </li>`;
            })
            .join("");
  
        res.send(`
            <p>Результаты поиска для запроса "${query}":</p>
            <ul>${fileList}</ul>
            <a href="/">Назад</a>
        `);
    }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});







