<template>
  <transition name="fade" appear>
    <div class="page-container" v-loading.fullscreen.lock="loading" element-loading-text="加载中...">
      <game-nav />
      <div class="heroes-container">
        <div class="search-bar">
          <el-input
            v-model="searchQuery"
            placeholder="搜索英雄"
            :prefix-icon="Search"
            clearable
          />
        </div>
        <div class="hero-tabs">
          <el-tabs v-model="activeTab">
            <el-tab-pane label="所有英雄" name="all"></el-tab-pane>
            <el-tab-pane label="战士" name="fighter"></el-tab-pane>
            <el-tab-pane label="法师" name="mage"></el-tab-pane>
            <el-tab-pane label="刺客" name="assassin"></el-tab-pane>
            <el-tab-pane label="坦克" name="tank"></el-tab-pane>
            <el-tab-pane label="射手" name="marksman"></el-tab-pane>
            <el-tab-pane label="辅助" name="support"></el-tab-pane>
          </el-tabs>
        </div>
        <transition-group name="hero-list" tag="div" class="heroes-grid">
          <template v-if="!loading">
            <template v-if="filteredHeroes.length">
              <div v-for="hero in filteredHeroes" :key="hero.heroId" class="hero-card"
            
            @click="router.push(`/hero/${hero.heroId}`)"
            >
              <el-popover
                placement="right"
                :width="300"
                trigger="hover"
                popper-class="hero-popover"
              >
                <template #reference>
                  <el-card :body-style="{ padding: '0px' }" shadow="hover">
                    <el-image 
                      :src="`https://game.gtimg.cn/images/lol/act/img/champion/${hero.alias}.png`"
                      :alt="hero.name"
                      lazy
                      fit="cover"
                    >
                      <template #placeholder>
                        <div class="image-placeholder">
                          <el-icon><Picture /></el-icon>
                        </div>
                      </template>
                      <template #error>
                        <div class="image-error">
                          <el-icon><Picture /></el-icon>
                          <span>加载失败</span>
                        </div>
                      </template>
                    </el-image>
                    <div class="hero-info">
                      <span class="hero-name">{{ hero.name }}</span>
                      <span class="hero-title">{{ hero.title }}</span>
                    </div>
                  </el-card>
                </template>
                
                <div class="hero-detail">
                  <div class="hero-header">
                    <img :src="'https://game.gtimg.cn/images/lol/act/img/champion/' + hero.alias + '.png'" :alt="hero.name" class="hero-avatar">
                    <div class="hero-titles">
                      <h3>{{ hero.name }}</h3>
                      <p>{{ hero.title }}</p>
                    </div>
                  </div>
                  <div class="hero-meta">
                    <div class="meta-item">
                      <label>关键词：</label>
                      <div class="meta-content">{{ hero.keywords }}</div>
                    </div>
                    <div class="meta-item">
                      <label>标签：</label>
                      <div class="meta-content">{{ hero.changeLabel }}</div>
                    </div>
                    <div class="meta-item">
                      <label>金币价格：</label>
                      <div class="meta-content">{{ hero.goldPrice }}</div>
                    </div>
                    <div class="meta-item">
                      <label>点券价格：</label>
                      <div class="meta-content">{{ hero.couponPrice }}</div>
                    </div>
                  </div>
                  <div class="hero-actions">
                    <el-button 
                      type="primary" 
                      link 
                      @click="router.push(`/hero/${hero.heroId}`)"
                    >
                      查看详情
                    </el-button>
                  </div>
                </div>
              </el-popover>
            </div>
          </template>
          <div v-else class="empty-state">
            <el-empty description="暂无英雄" />
          </div>
        </template>
      </transition-group>
    </div>
  </div>
</transition>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { Search, Picture } from '@element-plus/icons-vue'
import GameNav from '../components/GameNav.vue'

const router = useRouter()
const heroes = ref([])
const searchQuery = ref('')
const activeTab = ref('all')
const filteredHeroes = ref([])
const loading = ref(false)

const getHeroes = async () => {
  if (heroes.value.length === 0) {
    loading.value = true
  }
  
  try {
    const response = await axios.get('https://game.gtimg.cn/images/lol/act/img/js/heroList/hero_list.js?v=04')
    if (response.data && response.data.hero) {
      heroes.value = response.data.hero
      filterHeroes()
    }
  } catch (error) {
    ElMessage.error('获取英雄数据失败')
    console.error('Error fetching heroes:', error)
  } finally {
    loading.value = false
  }
}

const roleMapping = {
  'fighter': 'fighter',
  'mage': 'mage',
  'assassin': 'assassin',
  'tank': 'tank',
  'marksman': 'marksman',
  'support': 'support'
}

const filterHeroes = () => {
  let filtered = [...heroes.value]
  
  // 搜索过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(hero => 
      hero.name.toLowerCase().includes(query) ||
      hero.title.toLowerCase().includes(query)
    )
  }
  
  // 标签页过滤
  if (activeTab.value !== 'all') {
    filtered = filtered.filter(hero => {
      return Array.isArray(hero.roles) && hero.roles.includes(roleMapping[activeTab.value])
    })
  }
  
  filteredHeroes.value = filtered
}

// 监听搜索和标签变化
watch([searchQuery, activeTab], () => {
  filterHeroes()
})

onMounted(() => {
  filteredHeroes.value = []
  getHeroes()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.page-container {
  min-height: 100vh;
  background: #f5f7fa;
}

.heroes-container {
  padding: 20px;
  max-width: 1280px;
  margin: 0 auto;
}

.search-bar {
  max-width: 600px;
  margin: 20px auto;
}

.search-bar :deep(.el-input__wrapper) {
  border-radius: 20px;
}

.hero-tabs {
  margin: 20px 0;
  background: #fff;
  padding: 0 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
}

.heroes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.1);
  min-height: 400px;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.hero-card {
  transition: all 0.3s ease;
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
}

.hero-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

:deep(.el-image) {
  width: 100%;
  height: 140px;
  display: block;
}

:deep(.el-image img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-info {
  padding: 12px;
  text-align: center;
  background: #fff;
}

.hero-name {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.hero-title {
  display: block;
  font-size: 14px;
  color: #909399;
  margin-top: 6px;
}

/* 动画效果 */
.hero-list-enter-active,
.hero-list-leave-active {
  transition: all 0.5s ease;
}

.hero-list-enter-from,
.hero-list-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.hero-list-move {
  transition: transform 0.5s ease;
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: #e4e7ed;
}

:deep(.el-tabs__item) {
  color: #606266;
}

:deep(.el-tabs__item.is-active) {
  color: #409EFF;
}

:deep(.el-tabs__active-bar) {
  background-color: #409EFF;
}

.hero-detail {
  padding: 16px;
}

.hero-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.hero-avatar {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  margin-right: 16px;
}

.hero-titles {
  flex: 1;
}

.hero-titles h3 {
  margin: 0;
  font-size: 18px;
  color: #303133;
}

.hero-titles p {
  margin: 4px 0 0;
  font-size: 14px;
  color: #909399;
}

.hero-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-item {
  display: flex;
  align-items: flex-start;
}

.meta-item label {
  font-size: 14px;
  color: #909399;
  width: 80px;
  flex-shrink: 0;
}

.meta-content {
  font-size: 14px;
  color: #303133;
  flex: 1;
  word-break: break-all;
  line-height: 1.4;
}

.hero-actions {
  margin-top: 16px;
  text-align: right;
}

:deep(.hero-popover) {
  padding: 0;
  border-radius: 8px;
  max-width: 400px;
}

.hero-card {
  cursor: pointer;
}

:deep(.el-loading-mask) {
  background-color: rgba(255, 255, 255, 0.9);
}

:deep(.el-loading-text) {
  font-size: 16px;
  margin-top: 10px;
}

:deep(.el-loading-spinner .circular) {
  width: 42px;
  height: 42px;
}

.image-placeholder,
.image-error {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.1);
  color: #909399;
}

.image-error {
  background: rgba(0,0,0,0.05);
}

.image-error span {
  margin-top: 8px;
  font-size: 12px;
}
</style>
