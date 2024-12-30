<template>
  <el-button class="back-button" type="text" @click="handleBack">
    <div class="back-icon">
      <el-icon><ArrowLeft /></el-icon>
    </div>
    <span class="back-text">返回上一页</span>
  </el-button>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'

const router = useRouter()
const emit = defineEmits(['beforeBack'])

const handleBack = () => {
  emit('beforeBack')
  setTimeout(() => {
    router.back()
  }, 300)
}
</script>

<style scoped>
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
</style>
