<template>
  <div class="game-nav">
    <div class="nav-container">
      <router-link 
        :to="{ name: 'Heroes', query: { game: 'lol' }}"
        class="nav-item active"
      >
        <img src="//wegame.gtimg.com/g.26-r.c2d3c/helper/lol/assis/images/resources/heroes/logo.png" alt="英雄联盟">
        <span>英雄联盟</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.game-nav {
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 10px 0;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  gap: 30px;
  padding: 0 20px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: #666;
  padding: 8px 16px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.nav-item img {
  width: 24px;
  height: 24px;
}

.nav-item:hover {
  background: #f5f7fa;
  color: #409EFF;
}

.nav-item.active {
  background: #ecf5ff;
  color: #409EFF;
}
</style>
