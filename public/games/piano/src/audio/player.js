// /*
//  * @Author: chenzhongsheng
//  * @Date: 2024-05-21 19:16:18
//  * @Description: Coding something
//  */
// import {base64ToUint8Array} from '../util/util';

// let AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;

// let buffers = {};

// const ctx = new AudioContext();

// function play (keyIndex) {
//     const n = buffers[keyIndex];
//     const s = ctx.createBufferSource();
//     s.buffer = n;
//     const o = ctx.createGain();
//     o.connect(ctx.destination);
//     o.gain.value = 0;
//     s.connect(o);
//     s.start();
//     o.gain.linearRampToValueAtTime(3, ctx.currentTime + .02);
// }

// export default class Player {

//     constructor (src, keyIndex) {

//         this.keyIndex = keyIndex;

//         let buffer = base64ToUint8Array(src.substr(src.indexOf(',') + 1)).buffer;
//         ctx.decodeAudioData(buffer, (audioBuffer) => { // 解码成功时的回调函数
//             buffers[keyIndex] = audioBuffer;
//             this.audioBuffer = audioBuffer;
//         }, function (e) { // 解码出错时的回调函数
//             console.log('Error decoding file', e);
//         });
//     }

//     play () {

//         play(this.keyIndex);

//         // this.stop();
//         // this.source = this.ctx.createBufferSource();
//         // this.source.buffer = this.audioBuffer;
//         // this.source.loop = false; // 循环播放
//         // this.source.connect(this.ctx.destination);
//         // this.source.start(0); // 立即播放
//     }
//     stop () {
//         // if (this.source) {
//         //     this.source.stop(0); // 立即停止
//         //     this.source = null;
//         // }
//     }
// }


import {base64ToUint8Array} from '../util/util';

let AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;

const ctx = new AudioContext();
export default class Player {
    constructor (src, keyIndex) {
        this.source = null;
        this.keyIndex = keyIndex;
        this.src = src;
        // let buffer = base64ToUint8Array(src.substr(src.indexOf(',') + 1)).buffer;
        let buffer = base64ToUint8Array(src).buffer;
        console.log(src.length);
        
        this.decode(buffer, src, keyIndex);
    }

    async decode (buffer, src, keyIndex) {

        try {
            await ctx.decodeAudioData(buffer, (audioBuffer) => { // 解码成功时的回调函数
                this.audioBuffer = audioBuffer;
            }, function (e) { // 解码出错时的回调函数
                console.log('Error decoding file', e);
            });
            console.warn('decode success', src.length, keyIndex);
        } catch (e) {
            console.error('Error decoding fail', src.length, keyIndex);
        }
    }

    play () {
        // this.stop();
        this.source = ctx.createBufferSource();
        this.source.buffer = this.audioBuffer;
        this.source.loop = false; // 循环播放
        this.source.connect(ctx.destination);
        this.source.start(); // 立即播放
        console.log('play audio:', this.keyIndex);
        // const n = this.audioBuffer;
        // const s = ctx.createBufferSource();
        // s.buffer = n;
        // const o = ctx.createGain();
        // o.connect(ctx.destination);
        // o.gain.value = 0;
        // s.connect(o);
        // s.start();
        // o.gain.linearRampToValueAtTime(3, ctx.currentTime + .02);
    }
    stop () {
        // if (this.source) {
        //     this.source.stop(0); // 立即停止
        //     this.source = null;
        // }
    }
}
