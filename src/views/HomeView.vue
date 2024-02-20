<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
// Sample verse sets
const verseSets = ref([
  { id: 1, name: 'Peace with God', route: 'peacewithGod'},
  // Add more sets here
]);
const router = useRouter();
function goToRoute(pathname){
  router.push({name: pathname});
}
</script>

<template>
  <div class="body">
    <h1>Memory Verse Practice App</h1>
    <div class="verse-sets-grid">
      <div class="verse-set-box" v-for="set in verseSets" :key="set.id" @click="goToRoute(set.route)">
        {{ set.name }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.body {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.verse-sets-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3 columns */
  gap: 20px; /* Space between boxes */
  width: 100%;
  max-width: 960px; /* Adjust based on your preference */
  margin-top: 20px;
}

.verse-set-box {
  border: 2px solid #ccc; /* Box border */
  border-radius: 10px; /* Rounded corners */
  padding: 20px;
  text-align: center;
  background-color: white; /* Light background color */
  cursor: pointer;
}
.verse-set-box:hover{
  background-color: #f9f9f9;
}
</style>
