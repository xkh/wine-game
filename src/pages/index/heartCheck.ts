const heartCheck:any = {
    timeout: 7000,
    timeoutObj: null,
    serverTimeoutObj: null,
    reset: function () {
        clearTimeout(this.timeoutObj);
        clearTimeout(this.serverTimeoutObj);
        return this;
    },
    start: function () {
        this.timeoutObj = setTimeout(() => {
            uni.sendSocketMessage({
                data: "ping",
            });
            this.serverTimeoutObj = setTimeout(() => {
                (uni as any).closeSocket();
            }, this.timeout);
        }, this.timeout);
    }
} 

export default heartCheck;