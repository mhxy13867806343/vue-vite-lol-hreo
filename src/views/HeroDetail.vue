<template>
  <transition name="slide-fade" appear>
    <div class="hero-detail-container">
      <div class="back-button" @click="handleBack">
        <el-icon><ArrowLeft /></el-icon>
        返回
      </div>
      
      <div class="hero-detail" v-if="heroDetail">
        <div class="hero-header">
          <div class="hero-avatar-wrapper">
            <el-image 
              :src="`https://game.gtimg.cn/images/lol/act/img/champion/${heroDetail.alias}.png`"
              :alt="heroDetail.name"
              class="hero-avatar"
            />
            <div class="hero-avatar-overlay">
              <div class="overlay-content">
                <div class="overlay-circle"></div>
                <div class="overlay-text">{{ heroDetail.name }}</div>
              </div>
            </div>
          </div>
          <div class="hero-info">
            <h1>{{ heroDetail.name }}</h1>
            <p class="hero-title">{{ heroDetail.title }}</p>
          </div>
        </div>

        <div class="hero-content">
          <el-tabs>
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
                <template v-if="heroRelations && heroRelations.length">
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
                </template>
                <no-data v-else />
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
    </div>
  </transition>

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
import { Picture, Link, ArrowLeft } from '@element-plus/icons-vue'
import GameNav from '../components/GameNav.vue'
import NoData from '../components/NoData.vue'
import BackButton from '../components/BackButton.vue'

const router = useRouter()
const route = useRoute()

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

// 处理返回
const handleBack = () => {
  router.push('/heroes')
}

onMounted(() => {
  fetchHeroDetail()
})
</script>

<style scoped>
.hero-detail-container {
  position: relative;
  min-height: 100vh;
  background: #000;
  color: #fff;
  overflow-x: hidden;
}

.back-button {
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-button:hover {
  background: rgba(0, 0, 0, 0.8);
}

.hero-detail {
  padding: 60px 20px 20px;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.hero-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.hero-avatar-wrapper {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 3px solid #c4b998;
  position: relative;
  cursor: pointer;
}

.hero-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.hero-avatar-wrapper:hover .hero-avatar {
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
  text-align: center;
  color: #fff;
}

.overlay-circle {
  width: 40px;
  height: 40px;
  border: 2px solid #c4b998;
  border-radius: 50%;
  margin: 0 auto 8px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.4;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
}

.hero-info {
  flex: 1;
}

.hero-info h1 {
  margin: 0;
  color: #c4b998;
  font-size: 24px;
}

.hero-info .hero-title {
  color: #a09b8c;
  margin-top: 8px;
}

.hero-content {
  margin-top: 20px;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 其他样式保持不变... */
</style>
