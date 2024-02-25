<script setup>
import RedoSVG from '@/assets/redo.svg';
import NextSVG from '@/assets/next.svg';
import UploadSVG from '@/assets/upload.svg';
import { useVerseSetStore } from '@/stores/verseSets';
import { ref, watch } from 'vue';

const languageList = {
  "english": "English",
  "korean": "Korean"
}
const verseSetStore = useVerseSetStore();
const currentSet = verseSetStore.currentSet;
const currentMode = ref("Practice Blanks");
const userReferenceInput = ref('');
const referenceValidationState = ref(''); // Can be '', 'correct', or 'incorrect'
const userFullVerseInput = ref('');
const fullVerseValidationState = ref(''); // Can be '', 'correct', or 'incorrect'
const displayedVerse = ref('');


const currentLanguage = ref(verseSetStore.currentLanguage)

const currentVerseIndex = ref(Math.floor(Math.random() * currentSet.length));
const currentVerse = ref(currentSet[currentVerseIndex.value]);
// Reactive property to store the processed verse
const processedVerse = ref([]);

watch([currentVerseIndex, currentLanguage], () => {
  // Update currentVerse based on the current index and language
  currentVerse.value = currentSet[currentVerseIndex.value];

  // Now, prepare the verse with blanks using the updated currentVerse
  const verseText = currentVerse.value[currentLanguage.value]["verse"];
  processedVerse.value = blankOutWordsRandomly(verseText);
}, { immediate: true });


function changeVerse(index) {
  currentVerseIndex.value = index;
  resetInputsAndValidationStates()
}


function changeLanguage(language) {
  currentLanguage.value = language.toLowerCase();
  resetInputsAndValidationStates()
}

function showFlag() {
  if (currentLanguage.value === "english") {
    return "🇺🇸";
  }
  else {
    return "🇰🇷";
  }
}

function blankOutWordsRandomly(verse) {
  let tokens, wordIndices;

  if (currentLanguage.value === "english") {
    // For English: Include spaces in the tokenization process
    tokens = verse.split(/(\s+|\b[\w'’]+\b|[.,;!?()])/).filter(token => token.length > 0);
    wordIndices = tokens
      .map((token, index) => token.match(/\b[\w'’]+\b/) ? index : null) // Identify word indices, ignoring punctuation and spaces
      .filter(index => index !== null);
  } else { // For Korean
    // For Korean: Split by spaces while preserving the spaces in the output
    tokens = verse.split(/(\s+)/);
    wordIndices = tokens
      .map((token, index) => (!token.match(/^\s+$/) && token.trim().length > 0) ? index : null) // Identify non-space tokens
      .filter(index => index !== null);
  }

  let blankCount = Math.floor(wordIndices.length * 0.2); // Determine the number of words to blank out
  let selectedIndices = new Set();
  while (selectedIndices.size < blankCount) {
    let randomIndex = wordIndices[Math.floor(Math.random() * wordIndices.length)];
    selectedIndices.add(randomIndex);
  }

  // Process tokens, explicitly preserving spaces
  return tokens.map((token, index) => {
    if (selectedIndices.has(index)) {
      // Directly use properties instead of ref
      return { type: 'blank', answer: token, userInput: '', validationState: 'unvalidated' };
    } else {
      return { type: 'text', value: token };
    }
  });
}

function checkAnswers() {
  if (currentMode.value === "Practice Reference") {
    // Check if the user's input matches the current verse reference
    if (userReferenceInput.value.trim().toLowerCase() === currentVerse.value[currentLanguage.value]["reference"].toLowerCase()) {
      referenceValidationState.value = 'correct';
    } else {
      referenceValidationState.value = 'incorrect';
    }
  } else if (currentMode.value === "Practice Blanks") {
    let highlightedVerse = "";
    let isAnyIncorrect = false; // Flag to check if any blank is filled incorrectly

    // Loop through each item in processedVerse
    processedVerse.value.forEach((item) => {
      if (item.type === 'blank') {
        if (item.userInput.trim() === item.answer) {
          item.validationState = 'correct';
          highlightedVerse += item.answer + " "; // Correctly answered blanks are not highlighted
        } else {
          item.validationState = 'incorrect';
          isAnyIncorrect = true;
          highlightedVerse += `<span style="color: red;">${item.answer}</span> `; // Highlight incorrect answers in red
        }
      } else {
        highlightedVerse += item.value + " "; // Non-blank parts of the verse
      }
    });

    // Only display the highlighted verse if there's an incorrect answer
    displayedVerse.value = isAnyIncorrect ? highlightedVerse : "";
  }
  else {
    const originalVerse = currentVerse.value[currentLanguage.value]["verse"];
    let markedVerse = "";
    // Example simplistic approach for highlighting differences (can be improved for more complex scenarios)
    if (userFullVerseInput.value !== originalVerse) {
      fullVerseValidationState.value = 'incorrect';
      // Splitting verses into words for basic comparison; consider punctuation, spaces, etc., for a more detailed approach
      const inputWords = userFullVerseInput.value.split(" ");
      const originalWords = originalVerse.split(" ");

      originalWords.forEach((word, index) => {
        if (inputWords[index] !== word) {
          markedVerse += `<span style="color: red;">${word}</span> `;
        } else {
          markedVerse += `${word} `;
        }
      });
    } else {
      fullVerseValidationState.value = 'correct';
      markedVerse = originalVerse; // No need to mark anything if correct
    }
    displayedVerse.value = markedVerse;
  }
}

function goToNextRandomVerse() {
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * currentSet.length);
  } while (newIndex === currentVerseIndex.value); // Ensure the new index is different from the current one

  currentVerseIndex.value = newIndex; // Update the current verse index with the new random index
  resetInputsAndValidationStates()
}


function retryCurrentVerse() {
  // Re-process the current verse to reset the blanks
  const verseText = currentVerse.value[currentLanguage.value]["verse"];
  processedVerse.value = blankOutWordsRandomly(verseText);
  resetInputsAndValidationStates()
}

function changeMode(mode) {
  currentMode.value = mode;
  resetInputsAndValidationStates()
}

function resetInputsAndValidationStates() {
  // Reset reference input and its validation state for "Practice Reference"
  userReferenceInput.value = '';
  referenceValidationState.value = '';

  // Reset the full verse input and its validation state for "Practice Full Verse"
  userFullVerseInput.value = '';
  fullVerseValidationState.value = '';

  // Reset displayed verse content for both "Practice Full Verse" and "Practice Blanks"
  displayedVerse.value = '';

  // Reset processed verse and validation states for "Practice Blanks"
  processedVerse.value.forEach(item => {
    if (item.type === 'blank') {
      item.userInput = ''; // Clear user input for blanks
      item.validationState = 'unvalidated'; // Reset validation state
    }
  });
}



</script>

<template>
  <div class="container mt-3">
    <div class="dropdown-options row mb-3">
      <!-- Mode Selection -->
      <div class="col-md-4 mb-2">
        <div class="dropdown">
          <button class="btn btn-danger dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            {{ currentMode }}
          </button>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="#" @click="() => changeMode('Practice Blanks')">Practice Blanks</a></li>
            <li><a class="dropdown-item" href="#" @click="() => changeMode('Practice Reference')">Practice Reference</a>
            </li>
            <li><a class="dropdown-item" href="#" @click="() => changeMode('Practice Full Verse')">Practice Full Verse</a>
            </li>
          </ul>
        </div>
      </div>
      <!-- Language Selection -->
      <div class="col-md-4 mb-2">
        <div class="dropdown">
          <button class="btn btn-info dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            {{ languageList[currentLanguage] }} {{ showFlag() }}
          </button>
          <ul class="dropdown-menu">
            <li v-for="language in languageList" :key="language" @click="changeLanguage(language)">
              <a class="dropdown-item">{{ language }}</a>
            </li>
          </ul>
        </div>
      </div>
      <!-- Verse Selection -->
      <div class="col-md-4 mb-2">
        <div class="dropdown" :class="{ 'hide-text': currentMode === 'Practice Reference' }">
          <button class="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
            {{ currentVerse[currentLanguage]["reference"] }}
          </button>
          <ul class="dropdown-menu" id="verse-dropdown">
            <li v-for="(verse, index) in currentSet" :key="verse" @click="changeVerse(index)">
              <a class="dropdown-item" :class="{ highlighted: index === currentVerseIndex }">
                {{ verse[currentLanguage]["reference"] }}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Practice Blanks Mode -->
    <div class="verse-content" v-if="currentMode === 'Practice Blanks'">
      <p>
        <span v-for="(item, index) in processedVerse" :key="index">
          <template v-if="item.type === 'blank'">
            <input type="text" class="blank-input" v-model="item.userInput"
              :class="{ 'correct': item.validationState === 'correct', 'incorrect': item.validationState === 'incorrect' }"
              @keyup.enter="checkAnswers">
          </template>
          <template v-else>
            {{ item.value }}
          </template>
        </span>
      </p>
      <div v-if="displayedVerse" v-html="displayedVerse" class="displayed-verse mt-3" id="blank-answer"></div>
    </div>

    <!-- Practice Reference Mode -->
    <div v-if="currentMode === 'Practice Reference'" class="mt-3">
      <p>{{ currentVerse[currentLanguage].verse }}</p>
      <input type="text" class="form-control mb-2"
        :class="{ 'correct': referenceValidationState === 'correct', 'incorrect': referenceValidationState === 'incorrect' }"
        placeholder="Enter verse reference" v-model="userReferenceInput">
      <div v-if="referenceValidationState === 'incorrect'" class="text-danger">
        Answer: {{ currentVerse[currentLanguage]["reference"] }}
      </div>
    </div>

    <!-- Practice Full Verse Mode -->
    <div v-if="currentMode === 'Practice Full Verse'" class="mt-3">
      <textarea class="form-control mb-2" rows="4" placeholder="Enter the full verse" v-model="userFullVerseInput"
        :class="{ 'correct': fullVerseValidationState === 'correct', 'incorrect': fullVerseValidationState === 'incorrect' }"></textarea>
      <div v-if="displayedVerse" v-html="displayedVerse" class="mt-3"></div>
    </div>

    <!-- Action Buttons -->
    <div class="d-flex gap-2 mt-3">
      <button class="btn btn-success" @click="checkAnswers">Submit <UploadSVG/> </button>
      <button class="btn btn-warning" @click="retryCurrentVerse">Retry Verse <RedoSVG /></button>
      <button class="btn btn-secondary" @click="goToNextRandomVerse">Next Verse <NextSVG /></button>
    </div>
  </div>
</template>


<style scoped>
/* Hide dropdown text unless hovered */
.hide-text .dropdown-toggle {
  color: transparent;
}

.hide-text .dropdown-toggle:hover,
.hide-text .dropdown-toggle:focus {
  color: white; /* Reset to default color on hover/focus */
}

/* Ensure dropdown menu items are always visible */
.hide-text .dropdown-menu .dropdown-item {
  color: initial;
}

.highlighted {
  background-color: lightblue;
}

#blank-answer {
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  padding: 10px;
}

.verse-content,
.dropdown-options,
.form-control,
.btn {
  width: 100%;
}

.blank-input {
  display: inline-block;
  width: 100px;
  height: 30px;
  /* Adjust based on content */
  margin: 0 5px;
  padding: 0.375rem 0.75rem;
  /* Bootstrap's default padding for inputs */
  font-size: 1rem;
  /* Adjust as needed */
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #ced4da;
  border-radius: 0.25rem;
  transition: border-color .15s ease-in-out, box-shadow .15s ease-in-out;
}

.correct {
  border: 2px solid green;
  background-color: #e6ffe6;
}

.dropdown-menu {
  max-height: 200px;
  /* Set a maximum height */
  overflow-y: auto;
  /* Enable scrolling */
}

.incorrect {
  border: 2px solid red;
  background-color: #ffe6e6;
}

@media (max-width: 768px) {
  .blank-input {
    min-width: 50px;
    /* Ensure readability on smaller screens */
  }
}</style>

