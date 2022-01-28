<template>
  <view class="content">
    <view class="player-user one">
      <view class="my-info">
        <image class="player-img" :src="otherPhoto"></image>
        <view class="player-name">{{ otherName }}</view>
      </view>
      <view class="player-away">已逃{{ myAwayTime }}次</view>
    </view>
    <view class="player-stage">
      <view class="stage-left">
        <view
          class="player-btn"
          :class="{ begin: isBegin }"
          @tap="eventShuffle"
          >{{ isBegin ? "禁止洗" : isShuffle ? "再洗洗" : "洗一洗" }}</view
        >
        <view class="player-btn" @tap="eventStart">{{
          isBegin ? "已开局" : "开局"
        }}</view>
        <view class="player-btn" @tap="eventWhoFirst">
          {{ isFirstStatus === 0 ? "黑/红" : "" }}
          {{ isFirstStatus === 1 ? "黑" : "" }}
          {{ isFirstStatus === 2 ? "红" : "" }}
        </view>
        <view class="player-btn over" @tap="eventOver">结束</view>
        <view class="player-btn gap" @tap="eventGetCard">摸牌</view>
        <view class="player-btn" @tap="eventOpenCard">开牌</view>
        <view class="player-btn" @tap="eventRunAway">逃跑</view>
        <view class="player-btn" @tap="eventGetCard">1分</view>
        <view class="player-btn" @tap="eventGetCard">2分</view>
        <view class="player-btn" @tap="eventGetCard">3分</view>
      </view>
      <view class="stage-right">
        <view class="right-all-card">
          <!-- <view class="player-start-list" v-if="pokerList && pokerList.length">
            <view class="poker-item" v-for="(poker, i) in pokerList" :key="i">
              *{{ poker }}
            </view>
          </view> -->
          <view class="all-cards">
            <image
              class="all-cards-img"
              src="../../static/images/all.jpg"
            ></image>
          </view>
          <view class="open-msg"></view>
        </view>
        <view class="right-my-card">
          <view class="card-img" v-if="cardOne">
            <image class="img-one" :src="cardOneImg"></image>
          </view>
          <view class="card-img" v-if="cardTwo">
            <image class="img-two" :src="cardTwoImg"></image>
          </view>
          <button
            @tap="getUserProfile"
            class="get-name-btn"
            v-if="!myName"
          >
            参与游戏
          </button>
        </view>
      </view>
    </view>
    <view class="player-user two">
      <view class="my-info">
        <image class="player-img" :src="myPhoto"></image>
        <view class="player-name">{{ myName }}</view>
      </view>
      <view class="player-card">{{ cardTwo }}</view>
      <view class="player-away">已逃{{ myAwayTime }}次</view>
    </view>
  </view>
</template>

<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  data() {
    return {
      poker: {
        spade: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], //黑桃
        heart: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], //红心
        club: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], //梅花
        diamond: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], //方块
        joker: [3, 6], //大小王
      },
      pokerList: [],
      socketStatus: 0,
      isShuffle: false, //是否已刷牌
      isBegin: false, //是否开局
      isFirstStatus: 0, //是黑还是红
      cardOne: "",
      cardTwo: "",
      myPhoto: "../../static/images/default.jpg",
      myName: "",
      myAwayTime: 0, //我逃跑的次数
      otherPhoto: "../../static/images/default.jpg",
      otherName: "",
      otherAwayTime: 0, //他人跑的次数
      uid:"",
    };
  },
  computed: {
    initPoker() {
      const newPoker: any = [];
      const poker: any = this.poker;
      for (let p in poker) {
        if (poker[p].length) {
          poker[p].forEach((num: Number) => {
            const pk = `${p}_${num}`;
            newPoker.push(pk);
          });
        }
      }
      return newPoker;
    },
    cardOneImg() {
      const name: string = this.cardOne;
      return name ? `../../static/images/${name}.jpg` : "";
    },
    cardTwoImg() {
      const name: string = this.cardTwo;
      return name ? `../../static/images/${name}.jpg` : "";
    },
  },
  onLoad() {
    console.log("initPoker...", this.initPoker);
  },
  methods: {
    getUserProfile() {
      const that = this;
      uni.getUserProfile({
        desc: "获取您的昵称用于链接其他玩家",
        success(res) {
          console.log("用户信息获取成功...", res);
          const { userInfo = {} } = res || {};
          const { nickName, avatarUrl, signature } = userInfo as any;
          that.uid = signature;
          that.myName = nickName;
          that.myPhoto = avatarUrl;
          if (!that.socketStatus) {
            that.initSocket(signature);
          }
        },
        fail() {
          that.toast("请授权头像、昵称参与游戏~");
        },
      });
    },
    //初始化
    initSocket(id='') {
      if(!id) return;
      //创建连接
      uni.connectSocket({
        url: "wss:api.xonepage.com/game/wss/"+id,
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
        if (isBegin) {
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
      const { isBegin } = params;
      if (isBegin) {
        this.startSaveLocal(params);
      }
      if (this.socketStatus === 1) {
        uni.sendSocketMessage({
          data: JSON.stringify({
            toId: "000",
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
      if (!this.isShuffle) {
        this.toast("洗一洗更健康");
        return;
      } else if (!this.isBegin) {
        this.isBegin = true;
        this.sendSocketMessage({ isBegin: true });
      }
    },
    //结束游戏
    eventOver() {
      this.isShuffle = false;
      this.isBegin = false;
      this.isFirstStatus = 0;
      this.cardOne = "";
      this.cardTwo = "";
      this.sendSocketMessage({ isBegin: false, isShuffle: false });
      uni.setStorage({
        key: "WS_MESSAGE",
        data: null,
        success: function () {
          console.log("清除本地存储");
        },
      });
    },
    //本地存储
    startSaveLocal(param = {}) {
      uni.setStorage({
        key: "WS_MESSAGE",
        data: param,
        success: function () {
          console.log("保存本地存储success");
        },
      });
    },
    eventGetCard() {
      if (!this.isBegin) {
        this.toast("请点击开局");
        return;
      }
      if (this.cardOne && this.cardTwo) {
        this.cardOne = "";
        this.cardTwo = "";
        return;
      }
      const pokerList = this.pokerList;
      const card = pokerList[0];
      if (!this.cardOne) {
        this.cardOne = card;
      } else if (!this.cardTwo) {
        this.cardTwo = card;
      }
      const newList = pokerList.slice(1, 55);
      this.pokerList = newList;
      this.sendSocketMessage({ list: newList });
      console.log("card...", card, newList);
    },
    //黑红
    eventWhoFirst() {
      if (this.isFirstStatus) {
        this.isFirstStatus = 0;
      } else {
        this.isFirstStatus = Math.random() > 0.5 ? 1 : 2;
      }
    },
    //run away
    eventRunAway() {
      if (this.cardOne && this.cardTwo) {
        this.cardOne = "";
        this.cardTwo = "";
        this.myAwayTime++;
      }
    },
    //open card
    eventOpenCard() {},
    toast(title = "") {
      if (title) {
        uni.showToast({ title, icon: "none" });
      }
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
.player-user {
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
  width: 750rpx;
}
.player-btn {
  height: 70rpx;
  width: 120rpx;
  line-height: 70rpx;
  background: #2fb157;
  border-radius: 10rpx;
  margin: 15rpx 0 0 15rpx;
  text-align: center;
  color: #ffffff;
  font-weight: bold;
  font-size: 30rpx;
}

.player-btn.begin {
  background: #999999;
}
.player-btn.over {
  background: #f54551;
}
.player-btn.gap {
  margin-top: 80rpx;
}
.stage-left {
  font-size: 26rpx;
  width: 150rpx;
  border: 2rpx solid #f5f5f5;
  flex-shrink: 0;
}
.stage-right {
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
}
.player-start-list {
  overflow: scroll;
  flex-shrink: 0;
}
.right-all-card {
  flex: 1;
}
.all-cards {
  width: 600rpx;
  height: 470rpx;
}
.all-cards-img {
  width: 600rpx;
  height: 470rpx;
}
.right-my-card {
  padding-top: 80rpx;
  flex: 1;
  min-height: 300rpx;
  background: #f5f5f5;
  position: relative;
}
.card-img .img-one,
.card-img .img-two {
  position: absolute;
  height: 300rpx;
  width: 210rpx;
}
.card-img .img-one {
  left: 50rpx;
  z-index: 1;
}
.card-img .img-two {
  left: 130rpx;
  z-index: 2;
}
.poker-item {
  background: seagreen;
  float: left;
}
.player-img {
  height: 100rpx;
  width: 100rpx;
  border-radius: 100rpx;
}
.one {
  top: 20rpx;
  left: 20rpx;
}
.two {
  bottom: 20rpx;
  left: 20rpx;
}
.my-info{
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}
.player-name{
  height: 30rpx;
  line-height: 30rpx;
  width: 120rpx;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.text-area {
  display: flex;
  justify-content: center;
}

.get-name-btn {
  height: 120rpx;
  line-height: 120rpx;
  width: 180rpx;
  background: #2fb157;
  border-radius: 10rpx;
  margin: 15rpx 0 0 15rpx;
  text-align: center;
  color: #ffffff;
  font-weight: bold;
  font-size: 30rpx;
  margin-left: 200rpx;
  margin-top: 120rpx;
}
</style>
