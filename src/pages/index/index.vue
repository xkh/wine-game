<template>
  <view class="content">
    <view class="player one">
      <image class="player-img" src="../../static/logo.png"></image>
      <view class="player-touch">测试</view>
    </view>
    <view class="player-stage">
      <view class="stage-left">
        <view
          class="player-btn"
          :class="{ begin: isBegin }"
          @tap="eventShuffle"
          >{{ isBegin ? "禁止洗" : isShuffle ? "再洗一洗" : "洗一洗" }}</view
        >
        <view class="player-btn" @tap="eventStart">{{
          isBegin ? "已开局" : "开局"
        }}</view>
        <view class="player-btn" @tap="eventShuffle"></view>
        <view class="player-btn" @tap="eventOver">结束</view>
      </view>
      <view class="player-start-list" v-if="pokerList && pokerList.length">
        <view class="poker-item" v-for="(poker, i) in pokerList" :key="i">
          *{{ poker }}
        </view>
      </view>
    </view>
    <view class="player two">
      <image class="player-img" src="../../static/logo.png"></image>
      <view class="player-touch">摸</view>
    </view>
  </view>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  data() {
    return {
      title: "Hello",
      poker: {
        Spade: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], //黑桃
        Heart: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], //红心
        Club: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], //梅花
        Diamond: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], //方块
        Joker: [14, 15], //大小王
      },
      pokerList: [],
      socketStatus: 0,
      isShuffle: false, //是否已刷牌
      isBegin: false, //是否开局
    };
  },
  computed: {
    initPoker() {
      const newPoker: any = [];
      const poker: any = this.poker;
      for (let p in poker) {
        if (poker[p].length) {
          poker[p].forEach((num: Number) => {
            const pk = `${p}:${num}`;
            newPoker.push(pk);
          });
        }
      }
      return newPoker;
    },
  },
  onLoad() {
    console.log("initPoker...", this.initPoker);
    if (!this.socketStatus) {
      this.initSocket();
    }
  },
  methods: {
    //初始化
    initSocket() {
      const that: any = this;
      console.log("iii...");
      //创建连接
      uni.connectSocket({
        url: "ws://127.0.0.1:2001/game/wss/000",
      });
      //socket打开后
      uni.onSocketOpen((res) => {
        this.socketStatus = 1;
        console.log("websocket已连接...", res);
        this.sendSocketMessage();
      });
      //监听socket 接受服务器的消息
      uni.onSocketMessage((msg: object) => {
        const { data } = msg as any;
        const { isBegin, isShuffle, list } = JSON.parse(data);
        if (list && list.length) {
          this.pokerList = list;
          this.isShuffle = isShuffle;
		  this.isBegin = isBegin;
        }
		if(isBegin){
			this.startSaveLocal(JSON.parse(data));
		}
        console.log("websocket监听到消息！！！", msg);
      });
      //socket断开后
      uni.onSocketClose((res) => {
        this.socketStatus = 0;
        this.closeSocket();
        console.log("websocket已断开...", res);
      });
      //socket异常
      uni.onSocketError((err) => {
        console.log("websocket异常了...", err);
      });
    },
    //关闭socket
    closeSocket() {
      if (this.socketStatus === 1) {
        uni.closeSocket({
          success: (res) => {
            console.log("关闭socket成功...", res);
            this.socketStatus = 0;
          },
        });
      }
    },
    //发送消息
    sendSocketMessage(msg = {}) {
      const params = {
        isBegin: false,
        isShuffle: false,
        list: this.initPoker,
        ...msg,
      };
      console.log("this.socketStatus...", this.socketStatus, params);
	  const {isBegin} = params;
	  if(isBegin){
		  this.startSaveLocal(params);
	  }
      if (this.socketStatus === 1) {
        uni.sendSocketMessage({
          data: JSON.stringify({
            toId: "111",
            msg: JSON.stringify(params),
          }) as any,
        });
      } else {
        console.log("未连接");
      }
    },
    //刷新
    eventShuffle() {
      if (this.isBegin) return;
      const pokerList = this.initPoker.sort(() => {
        return Math.random() > 0.5 ? -1 : 1;
      });
      this.pokerList = pokerList;
      this.isShuffle = true;
      console.log("pokerList...", JSON.stringify(this.pokerList));
      this.sendSocketMessage({ isShuffle: true, list: pokerList });
    },
    //开局禁止刷新
    eventStart() {
      if (!this.isBegin && this.isShuffle) {
        this.isBegin = true;
        this.sendSocketMessage({ isBegin: true });
      }
    },
	//结束游戏
    eventOver() {
      this.isShuffle = false;
      this.isBegin = false;
      this.sendSocketMessage({ isBegin: false, isShuffle: false });
	  uni.setStorage({
        key: "WS_MESSAGE",
        data: null,
        success: function () {
          console.log("本地存储success");
        },
      });
    },
	//本地存储
    startSaveLocal(param={}) {
      uni.setStorage({
        key: "WS_MESSAGE",
        data: param,
        success: function () {
          console.log("本地存储success");
        },
      });
    },
  },
});
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
.player {
  flex: 0 0 auto;
  display: flex;
  height: 150rpx;
  background: #eeeeee;
  width: 100%;
}
.player-stage {
  flex: 1 1 auto;
  display: flex;
  flex-direction: row;
  width: 100%;
}
.player-btn {
  height: 100rpx;
  line-height: 100rpx;
  background: slateblue;
  margin-bottom: 10rpx;
}

.player-btn.begin {
  background: #999999;
  color: #ffffff;
}
.stage-left {
  font-size: 26rpx;
  width: 150rpx;
}
.player-start-list {
  width: 600rpx;
  height: 800rpx;
  overflow: scroll;
}
.poker-item {
  width: 200rpx;
  background: seagreen;
  float: left;
}
.player-img {
  height: 100rpx;
  width: 100rpx;
}
.one {
  top: 20rpx;
  left: 20rpx;
}
.two {
  bottom: 20rpx;
  left: 20rpx;
}
.text-area {
  display: flex;
  justify-content: center;
}

.title {
  font-size: 36rpx;
  color: #8f8f94;
}
</style>
