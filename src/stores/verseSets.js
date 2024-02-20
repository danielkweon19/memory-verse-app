import { defineStore } from 'pinia';

export const useVerseSetStore = defineStore('verseSet', {
  state: () => ({
    currentSet: null,
    currentLanguage: "english",
  }),
  actions: {
    setCurrentSet(set) {
      this.currentSet = set;
    }
  },
});
