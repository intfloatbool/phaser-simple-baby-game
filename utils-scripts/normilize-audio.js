const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Создание выходной папки
const inputDir = '.';
const outputDir = path.join(__dirname, 'normalized');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

const files = fs.readdirSync(inputDir).filter(file => file.endsWith('.mp3'));

if (files.length === 0) {
    console.log('Нет mp3 файлов для обработки.');
    process.exit(0);
}

console.log(`Найдено ${files.length} mp3 файлов. Начинаю нормализацию...`);

files.forEach((file, index) => {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, file);

    const cmd = `ffmpeg -y -i "${inputPath}" -af loudnorm=I=-16:TP=-1.5:LRA=11 "${outputPath}"`;

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`Ошибка при обработке ${file}:`, error.message);
        } else {
            console.log(`✓ ${file} обработан`);
        }

        // Завершение
        if (index === files.length - 1) {
            console.log('Все файлы обработаны.');
        }
    });
});
