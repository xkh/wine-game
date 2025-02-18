<script lang="ts">
    import Vue from 'vue';
    export default Vue.extend({
        mpType: 'app',
        globalData:{
            userInfo:null,
            statusBarHeight:25,
            titleBarHeight:0,
        },
        onLaunch() {
            console.log('App Launch')
            const updateManager = uni.getUpdateManager();
            updateManager.onUpdateReady(() => {
                uni.showModal({
                    title: "更新提示",
                    content: "新版本已经准备好，请重启应用体验新功能",
                    complete: function () {
                        updateManager.applyUpdate();
                    },
                });
            });
        },
        onShow() {
            console.log('App Show')
        },
        onHide() {
            console.log('App Hide')
        }
    });
</script>

<style>
    /* #ifdef H5 */
    uni-page-head { display: none; } 
    /* #endif */
</style>
