<script setup>
import { useVerseSetStore } from '@/stores/verseSets';
import MemoryVersePractice from '@/components/MemoryVersePractice.vue';
import peacewithGodverses from '@/assets/verses/peace-with-God.json';

const verseSetStore = useVerseSetStore();
verseSetStore.setCurrentSet(peacewithGodverses);
</script>

<template>
  <div class="body">
    <h1>Peace with God Verses</h1>
    <MemoryVersePractice />
  </div>
</template>

<style scoped>
  .body{
    display: flex;
    flex-direction: column;
    align-items: center;
  }
</style>