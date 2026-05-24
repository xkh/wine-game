<template>
  <block>
    <view class="BanContain">
      <view
        class="status_bar"
        :style="{ height: statusBarHeight + 'px' }"
      ></view>
      <view class="navBar" :style="{ height: titleBarHeight + 'px' }">
        <text class="bans-title" v-if="title">
          {{title}}
        </text>
      </view>
    </view>
  </block>
</template>

<script>
export default {
    props: ['title'],
  data() {
    return {
      statusBarHeight: 0,
      titleBarHeight: 0,
    };
  },
  methods: {
    backPre() {
      uni.navigateBack();
    },
  },
  mounted() {
    let systemInfo = uni.getSystemInfoSync();
    this.statusBarHeight = systemInfo.statusBarHeight;
    let menuButtonInfo = uni.getMenuButtonBoundingClientRect();
    this.titleBarHeight =
      (menuButtonInfo.top - this.statusBarHeight) * 2 + menuButtonInfo.height;
      console.log('ttt...',this.titleBarHeight)
    getApp().globalData.statusBarHeight = this.statusBarHeight;
    getApp().globalData.titleBarHeight = this.titleBarHeight;
  },
};
</script>

<style>
.bans-title {
  text-align: center;
  color: #fff;
  font-size: 36rpx;
  font-weight: 600;
  letter-spacing: 2rpx;
  text-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.3);
}
.BanContain {
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 999;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.3);
}
.back-img {
  width: 34px;
  height: 34px;
  margin-left: 18rpx;
}
.navBar {
  display: flex;
  align-items: center;
  width: 100%;
  text-align: center;
  justify-content: center;
}
.status_bar {
  height: var(--status-bar-height);
  width: 100%;
}
</style>