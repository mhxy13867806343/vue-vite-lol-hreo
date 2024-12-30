<template>
  <div class="no-data">
    <el-icon class="no-data-icon"><Picture /></el-icon>
    <p class="no-data-text">暂无数据</p>
  </div>
</template>

<script setup>
import { Picture } from '@element-plus/icons-vue'
</script>

<style scoped>
.no-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
  color: #909399;
}

.no-data-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.no-data-text {
  font-size: 14px;
  margin: 0;
}
</style>
