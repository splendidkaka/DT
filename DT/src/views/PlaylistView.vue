<template>
  <div>
    <h1>Playlist</h1>
    <ul>
      <li v-for="song in songs" :key="song.id">{{ song.title }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  data() {
    return {
      songs: [
        { id: 1, title: 'Song 1' },
        { id: 2, title: 'Song 2' },
        { id: 3, title: 'Song 3' }
      ]
    };
  }
};
</script>

<style scoped>
h1 {
  color: #333;
}
</style>