const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Flashcard = require('./models/Flashcard');
const McqQuestion = require('./models/McqQuestion');

// Helper to load TypeScript MCQ files dynamically without transpilers
function loadTSMcqFile(filePath, varName) {
  let content = fs.readFileSync(filePath, 'utf8');
  const regex = new RegExp(`export\\s+const\\s+${varName}\\s*=`, 'i');
  content = content.replace(regex, 'module.exports =');
  const tempPath = path.join(__dirname, `temp_${varName}.js`);
  fs.writeFileSync(tempPath, content, 'utf8');
  const data = require(tempPath);
  fs.unlinkSync(tempPath);
  return data;
}

// Helper to extract flashcards from app/flashcards.tsx
function loadTSFlashcardFile() {
  const filePath = path.join(__dirname, '../app/flashcards.tsx');
  const content = fs.readFileSync(filePath, 'utf8');
  const startKeyword = 'const flashcardData = {';
  const endKeyword = 'const cardGradients = [';
  
  const startIdx = content.indexOf(startKeyword);
  const endIdx = content.indexOf(endKeyword);
  
  if (startIdx === -1 || endIdx === -1) {
    throw new Error('Failed to find flashcardData boundaries in flashcards.tsx');
  }
  
  const flashcardDataStr = content.substring(startIdx, endIdx);
  const cleanContent = flashcardDataStr.replace('const flashcardData =', 'module.exports =') + ';';
  
  const tempPath = path.join(__dirname, 'temp_flashcards.js');
  fs.writeFileSync(tempPath, cleanContent, 'utf8');
  const data = require(tempPath);
  fs.unlinkSync(tempPath);
  return data;
}

async function seed() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    // 1. Clear old content collections
    console.log('Clearing old collections...');
    await Flashcard.deleteMany({});
    await McqQuestion.deleteMany({});
    console.log('Collections cleared.');

    // 2. Load and insert Flashcards
    console.log('Loading flashcard data...');
    const flashcardData = loadTSFlashcardFile();
    const flashcardsToInsert = [];
    
    for (const [lang, cardList] of Object.entries(flashcardData)) {
      cardList.forEach((card, idx) => {
        flashcardsToInsert.push({
          language: lang,
          question: card.question,
          answer: card.answer,
          code: card.code || '',
          link: card.link || '',
          index: idx
        });
      });
    }

    console.log(`Inserting ${flashcardsToInsert.length} flashcards...`);
    await Flashcard.insertMany(flashcardsToInsert);
    console.log('Flashcards inserted.');

    // 3. Load and insert MCQ Questions
    console.log('Loading MCQ data files...');
    const mcqFiles = {
      'C': { path: '../data/cMcq.ts', var: 'cMcq' },
      'C++': { path: '../data/cppMcq.ts', var: 'cppMcq' },
      'Java': { path: '../data/javaMcq.ts', var: 'javaMcq' },
      'Python': { path: '../data/pythonMcq.ts', var: 'pythonMcq' }
    };

    const mcqsToInsert = [];

    for (const [lang, meta] of Object.entries(mcqFiles)) {
      const filePath = path.join(__dirname, meta.path);
      console.log(`Loading MCQs for ${lang} from ${meta.path}...`);
      const langData = loadTSMcqFile(filePath, meta.var);
      
      for (const [levelName, qList] of Object.entries(langData)) {
        qList.forEach((q) => {
          mcqsToInsert.push({
            language: lang,
            level: levelName,
            question: q.question,
            options: q.options,
            answer: q.answer
          });
        });
      }
    }

    console.log(`Inserting ${mcqsToInsert.length} MCQ questions...`);
    await McqQuestion.insertMany(mcqsToInsert);
    console.log('MCQs inserted.');

    console.log('\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database.');
  }
}

seed();
