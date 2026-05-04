/*
 * @Author: chenzhongsheng
 * @Date: 2024-05-21 20:19:54
 * @Description: Coding something
 */

// for (let o = 1; o < 89; o++)
//     s.push((()=>{
//         const i = Le[o]
//           , l = t[i];
//         new Promise((c,d)=>{
//             if (l) {
//                 const h = l.split(",")[1]
//                   , m = Ct.decodeArrayBuffer(h);
//                 new Promise((p,f)=>{
//                     n.decodeAudioData(m, p, f)
//                 }
//                 ).then(p=>{
//                     this.buffers[o] = p,
//                     c()
//                 }
//                 ).catch(d)
//             }
//         }
//         )
//     }
//     )());
// noteOn(t) {
//     if (this.buffers[t]) {
//         this.sources[t] && this.noteOff(t);
//         const n = this.buffers[t]
//           , s = this.ctx.createBufferSource();
//         s.buffer = n;
//         const o = this.ctx.createGain();
//         o.connect(this.ctx.destination),
//         o.gain.value = 0,
//         s.connect(o),
//         s.start(),
//         o.gain.linearRampToValueAtTime(3, this.ctx.currentTime + .02),
//         this.sources[t] = {
//             source: s,
//             gainNode: o
//         }
//     } else
//         this.prepare()
// }
// noteOff(t) {
//     if (this.sources[t]) {
//         const {source: n, gainNode: s} = this.sources[t]
//           , o = s.gain;
//         o.linearRampToValueAtTime(o.value, this.ctx.currentTime),
//         o.linearRampToValueAtTime(0, this.ctx.currentTime + .1 + this.endGradualTime),
//         setTimeout(()=>{
//             n.disconnect()
//         }
//         , (.11 + this.endGradualTime) * 1e3),
//         this.sources[t] = null
//     }
// }