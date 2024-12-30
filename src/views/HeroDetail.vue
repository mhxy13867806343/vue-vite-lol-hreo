<template>
  <div class="hero-detail-page" v-loading.fullscreen.lock="loading" element-loading-text="加载中..." :data-leaving="isLeaving">
    <div class="nav-container">
      <div class="nav-left">
        <back-button @beforeBack="handleBeforeBack" />
        <game-nav />
      </div>
    </div>

    <div class="hero-detail" v-if="heroDetail">
      <div class="hero-header">
        <div class="hero-avatar-wrapper">
          <el-image 
            :src="`https://game.gtimg.cn/images/lol/act/img/champion/${heroDetail.alias}.png`"
            :alt="heroDetail.name"
            class="hero-avatar"
            lazy
          >
            <template #placeholder>
              <div class="image-placeholder">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
            <template #error>
              <div class="image-error">
                <el-icon><Picture /></el-icon>
              </div>
            </template>
          </el-image>
          <div class="hero-avatar-overlay">
            <div class="overlay-content">
              <div class="overlay-circle"></div>
              <div class="overlay-text">{{ heroDetail.name }}</div>
            </div>
          </div>
        </div>
        <div class="hero-info">
          <h1 class="hero-name">{{ heroDetail.name }}</h1>
          <p class="hero-title">{{ heroDetail.title }}</p>
          <div class="hero-tags">
            <el-tag v-for="role in heroDetail.roles" :key="role" size="small" class="hero-tag">{{ role }}</el-tag>
          </div>
        </div>
      </div>

      <el-tabs class="hero-content">
        <el-tab-pane label="技能介绍">
          <div class="skills-container">
            <!-- 主动技能 -->
            <div class="skill-section">
              <h3>主动技能</h3>
              <template v-if="heroDetail.spells && heroDetail.spells.length > 0">
                <div v-for="spell in heroDetail.spells" :key="spell.spellKey" class="skill-item">
                  <el-image 
                    :src="spell.abilityIconPath" 
                    :alt="spell.name"
                    lazy
                  >
                    <template #placeholder>
                      <div class="image-placeholder">
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                  <div class="skill-info">
                    <h4>{{ spell.name }}</h4>
                    <p v-html="spell.description"></p>
                  </div>
                </div>
              </template>
              <no-data v-else />
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="英雄背景">
          <div class="hero-background">
            <template v-if="heroBackground">
              <div class="background-header">
                <h2>{{ heroDetail.name }} - {{ heroDetail.title }}</h2>
              </div>
              
              <div class="background-content">
                <div class="story-section" v-if="heroBackground.biography">
                  <div class="quote-section" v-if="heroBackground.quote">
                    <blockquote>{{ heroBackground.quote }}</blockquote>
                  </div>

                  <div class="short-bio" v-if="heroBackground.shortBio">
                    <h3>简介</h3>
                    <p>{{ heroBackground.shortBio }}</p>
                  </div>

                  <div class="full-bio" v-if="heroBackground.biography">
                    <h3>背景故事</h3>
                    <div class="story-content" v-html="heroBackground.biography"></div>
                  </div>
                </div>
                <no-data v-else />
              </div>
            </template>
            <no-data v-else />
          </div>
        </el-tab-pane>

        <el-tab-pane label="英雄关系">
          <div class="hero-relations">
            <div class="relations-grid">
              <div v-for="hero in heroRelations" :key="hero.slug" class="relation-item">
                <div class="hero-avatar-wrapper">
                  <el-image 
                    :src="hero.image.uri"
                    :alt="hero.name"
                    class="relation-avatar"
                    lazy
                  >
                    <template #error>
                      <div class="image-error">
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                    <template #placeholder>
                      <div class="image-placeholder">
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                  <div class="hero-avatar-overlay">
                    <div class="overlay-content">
                      <div class="overlay-circle"></div>
                      <div class="overlay-text">{{ hero.name }}</div>
                    </div>
                  </div>
                </div>
                <div class="hero-info">
                  <h3 class="hero-name">{{ hero.name }}</h3>
                  <p class="hero-title">{{ hero.title }}</p>
                </div>
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="英雄皮肤" name="skins">
          <div class="hero-skins">
            <el-carousel :interval="4000" type="card" height="400px" class="skin-carousel">
              <el-carousel-item v-for="skin in heroSkins" :key="skin.skinId">
                <el-image :src="skin.mainImg" :alt="skin.name" fit="contain" />
                <div class="skin-info">
                  <h3 class="skin-name">{{ skin.name }}</h3>
                  <p class="skin-description">{{ skin.description }}</p>
                </div>
              </el-carousel-item>
            </el-carousel>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>

  <el-dialog 
    v-model="storyDialogVisible" 
    title="英雄故事" 
    width="60%" 
    class="story-dialog"
    :close-on-click-modal="false"
  >
    <template v-if="selectedStory">
      <div class="story-content" v-html="selectedStory"></div>
    </template>
    <template v-else>
      <div class="no-story">
        <p>暂无故事内容</p>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { Picture, Link } from '@element-plus/icons-vue'
import GameNav from '../components/GameNav.vue'
import NoData from '../components/NoData.vue'
import BackButton from '../components/BackButton.vue'

const route = useRoute()
const router = useRouter()
const loading = ref(true)
const heroDetail = ref(null)
const heroBackground = ref(null)
const heroRelations = ref([])
const heroSkins = ref([])
const storyDialogVisible = ref(false)
const isLeaving = ref(false)
const selectedStory = ref(null)

// 获取英雄故事数据
const fetchHeroStory = async (heroAlias) => {
  try {
    const response = await axios.get(`https://yz.lol.qq.com/v1/zh_cn/champions/${heroAlias}/index.json`)
    if (response && response.data) {
      const { champion, 'related-champions': relatedChampions } = response.data;
      
      // 设置英雄背景故事数据
      heroBackground.value = {
        biography: champion.biography.full,
        shortBio: champion.biography.short,
        quote: champion.biography.quote,
        quoteAuthor: champion.biography['quote-author'],
        title: champion.title,
        relatedChampions
      }
      // 设置英雄关系数据
      if (relatedChampions) {
        heroRelations.value = relatedChampions.map(hero => ({
          ...hero,
          image: {
            uri: `https://game.gtimg.cn/images/lol/act/img/champion/${hero.id}.png`
          }
        }))
      }
    }
  } catch (error) {
    console.error('获取英雄故事失败:', error)
  }
}

// 获取英雄详情数据
const fetchHeroDetail = async () => {
  try {
    const response = await axios.get(`https://game.gtimg.cn/images/lol/act/img/js/hero/${route.params.heroId}.js`)
    if (response.data && response.data.hero) {
      heroDetail.value = response.data.hero
      // 获取技能信息
      if (response.data.spells) {
        heroDetail.value.spells = response.data.spells
      }
      if (response.data.passive) {
        heroDetail.value.passive = response.data.passive
      }
      // 获取皮肤信息
      if (response.data.skins) {
        heroSkins.value = response.data.skins.filter(skin => skin.mainImg)
      }
      // 获取英雄故事和关系数据
      await fetchHeroStory(heroDetail.value.alias.toLowerCase())
    }
  } catch (error) {
    console.error('获取英雄详情失败:', error)
  } finally {
    loading.value = false
  }
}

const handleBeforeBack = () => {
  isLeaving.value = true
  setTimeout(() => {
    router.back()
  }, 300) // 等待动画完成
}

onMounted(() => {
  fetchHeroDetail()
})
</script>

<style scoped>
.hero-detail-page {
  min-height: 100vh;
  background: #f5f7fa;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.hero-detail-page[data-leaving="true"] {
  opacity: 0;
  transform: translateX(-20px);
}

.hero-detail {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.hero-avatar-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
}

.hero-avatar {
  width: 100%;
  height: 100%;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero-avatar-wrapper:hover .hero-avatar {
  transform: scale(1.2) rotate(5deg);
}

.hero-avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(30, 35, 40, 0.8);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-avatar-wrapper:hover .hero-avatar-overlay {
  opacity: 1;
}

.overlay-content {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.overlay-circle {
  position: absolute;
  width: 0;
  height: 0;
  background: #c4b998;
  border-radius: 50%;
  opacity: 0.2;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.hero-avatar-wrapper:hover .overlay-circle {
  width: 150%;
  height: 150%;
  animation: pulseCircle 2s infinite;
}

.overlay-text {
  position: relative;
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
  text-align: center;
  z-index: 1;
}

.hero-avatar-wrapper:hover .overlay-text {
  opacity: 1;
  transform: translateY(0);
}

@keyframes pulseCircle {
  0% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  50% {
    transform: scale(1);
    opacity: 0.2;
  }
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
}

.hero-info {
  flex: 1;
}

.hero-name {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  color: #c4b998;
}

.hero-title {
  font-size: 16px;
  color: #a09b8c;
  margin: 5px 0;
}

.hero-tags {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.hero-tag {
  background-color: transparent;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.3);
  margin-right: 8px;
}

.hero-tag.el-tag {
  background-color: transparent;
}

.hero-content {
  margin-top: 20px;
  
  :deep(.el-tabs__item) {
    color: rgba(255, 255, 255, 0.6);
    
    &.is-active {
      color: #c4b998;
    }
  }
  
  :deep(.el-tabs__nav-wrap::after) {
    background-color: rgba(196, 185, 152, 0.1);
  }
  
  :deep(.el-tabs__active-bar) {
    background-color: #c4b998;
  }
}

.hero-background {
  padding: 20px;
  background: #1e2328;
  border-radius: 8px;
}

.background-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  h2 {
    margin: 0;
    color: #c4b998;
  }
}

.background-content {
  display: grid;
  gap: 24px;

  .story-section {
    h3 {
      color: #c4b998;
      margin-bottom: 16px;
    }

    .story-content {
      color: #a09b8c;
      line-height: 1.6;
      text-align: justify;

      p {
        margin-bottom: 1em;
      }
    }
  }
}

.quote-section {
  margin-bottom: 24px;
}

.quote-section blockquote {
  font-style: italic;
  color: #c4b998;
  font-size: 1.2em;
  margin: 0;
  line-height: 1.6;
  padding: 16px;
  border-left: 4px solid #463714;
  background: rgba(196, 185, 152, 0.1);
}

.short-bio {
  margin-bottom: 24px;
}

.full-bio {
  margin-top: 24px;
}

.story-content {
  color: #a09b8c;
  line-height: 1.6;
  text-align: justify;
}

.story-content :deep(p) {
  margin-bottom: 1em;
}

.story-content :deep(h1),
.story-content :deep(h2),
.story-content :deep(h3),
.story-content :deep(h4) {
  color: #c4b998;
  margin: 1em 0;
}

.hero-skins {
  padding: 20px;
}

.skin-carousel {
  .el-carousel__item {
    display: flex;
    justify-content: center;
    align-items: center;
    background: #1e2328;
  }

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
}

.skin-info {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  color: white;

  .skin-name {
    font-size: 18px;
    margin: 0;
    color: #c4b998;
  }

  .skin-description {
    margin: 5px 0 0;
    font-size: 14px;
    color: #a09b8c;
  }
}

.nav-container {
  background: #1e2328;
  border-bottom: 1px solid #463714;
  padding: 0 20px;
}

.nav-left {
  display: flex;
  align-items: center;
}

.back-button {
  display: flex;
  align-items: center;
  color: #c4b998;
  font-size: 14px;
  padding: 8px 12px;
  margin-right: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.back-button:hover {
  color: #e0d5b7;
}

.back-button:hover .back-icon {
  transform: translateX(-3px);
}

.back-icon {
  display: flex;
  align-items: center;
  margin-right: 8px;
  transition: transform 0.3s ease;
}

.back-text {
  position: relative;
  transition: transform 0.3s ease;
}

.back-button:hover .back-text {
  transform: translateX(-3px);
}

.back-button::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #c4b998;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.back-button:hover::after {
  transform: scaleX(1);
}

.back-button .el-icon {
  margin-right: 8px;
}

.story-button {
  margin-top: 10px;
  color: #c4b998;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.3s ease;
}

.story-button:hover {
  color: #e0d5b7;
}

.story-button .el-icon {
  font-size: 16px;
}

.story-dialog :deep(.el-dialog) {
  background: #1e2328;
  border: 1px solid #463714;
}

.story-dialog :deep(.el-dialog__title) {
  color: #c4b998;
}

.story-dialog :deep(.el-dialog__header) {
  border-bottom: 1px solid #463714;
  padding: 20px;
}

.story-dialog :deep(.el-dialog__body) {
  padding: 24px;
  max-height: 70vh;
  overflow-y: auto;
  color: #a09b8c;
}

.story-content {
  line-height: 1.8;
  font-size: 16px;
}

.story-content :deep(p) {
  margin-bottom: 1.5em;
}

.story-content :deep(h1),
.story-content :deep(h2),
.story-content :deep(h3) {
  color: #c4b998;
  margin: 1.5em 0 1em;
}

.story-content :deep(img) {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  margin: 1em 0;
}

.story-content :deep(blockquote) {
  border-left: 4px solid #463714;
  margin: 1.5em 0;
  padding: 1em;
  background: rgba(70, 55, 20, 0.2);
  color: #c4b998;
  font-style: italic;
}

.no-story {
  text-align: center;
  padding: 40px;
  color: #a09b8c;
}

/* 自定义滚动条样式 */
.story-dialog :deep(.el-dialog__body)::-webkit-scrollbar {
  width: 8px;
}

.story-dialog :deep(.el-dialog__body)::-webkit-scrollbar-track {
  background: #1e2328;
}

.story-dialog :deep(.el-dialog__body)::-webkit-scrollbar-thumb {
  background: #463714;
  border-radius: 4px;
}

.story-dialog :deep(.el-dialog__body)::-webkit-scrollbar-thumb:hover {
  background: #5a4519;
}

.hero-relations {
  padding: 20px;
}

.relations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px;
}

.relation-item {
  background: rgba(30, 35, 40, 0.8);
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  transition: all 0.3s ease;
}

.relation-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
}

.hero-avatar-wrapper {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
}

.relation-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.hero-avatar-wrapper:hover .relation-avatar {
  transform: scale(1.1);
}

.hero-avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: opacity 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-avatar-wrapper:hover .hero-avatar-overlay {
  opacity: 1;
}

.overlay-content {
  position: relative;
  width: 100%;
  height: 100%;
}

.overlay-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border: 2px solid #c4b998;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.overlay-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #c4b998;
  font-size: 14px;
  white-space: nowrap;
}

.hero-info {
  margin-top: 15px;
  text-align: center;
}

.hero-name {
  margin: 0;
  font-size: 16px;
  color: #c4b998;
  font-weight: bold;
}

.hero-title {
  margin: 5px 0 0;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.4;
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.8;
  }
}

.skill-info {
  flex: 1;
  padding-left: 15px;

  h4 {
    margin: 0 0 8px;
    font-size: 16px;
    color: #c4b998;
  }

  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.5;
    color: #a09b8c;
  }
}
</style>
