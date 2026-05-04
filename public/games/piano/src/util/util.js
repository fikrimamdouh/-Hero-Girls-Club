/*
 * @Author: chenzhongsheng
 * @Date: 2024-05-21 19:16:18
 * @Description: Coding something
 */
import tool from 'easy-dom-util';
import initStore from '../store';
export let $ = tool;

const _keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function decode (e, t) {
    var n = _keyStr.indexOf(e.charAt(e.length - 1))
        , s = _keyStr.indexOf(e.charAt(e.length - 1))
        , o = Math.ceil(3 * e.length / 4);
    n == 64 && o--,
    s == 64 && o--;
    var i, l, c, d, h, m, p, f, u = 0, a = 0;
    for (t ? i = new Uint8Array(t) : i = new Uint8Array(o),
    e = e.replace(/[^A-Za-z0-9+/=]/g, ''),
    u = 0; u < o; u += 3)
        h = _keyStr.indexOf(e.charAt(a++)),
        m = _keyStr.indexOf(e.charAt(a++)),
        p = _keyStr.indexOf(e.charAt(a++)),
        f = _keyStr.indexOf(e.charAt(a++)),
        l = h << 2 | m >> 4,
        c = (m & 15) << 4 | p >> 2,
        d = (p & 3) << 6 | f,
        i[u] = l,
        p != 64 && (i[u + 1] = c),
        f != 64 && (i[u + 2] = d);
    return i;
}

export function base64ToUint8Array (e) {
    var t = Math.ceil(3 * e.length / 4)
        , n = new ArrayBuffer(t);
    return decode(e, n);
}

// export function base64ToUint8Array (base64String) {
//     const padding = '='.repeat((4 - base64String.length % 4) % 4);
//     const base64 = (base64String + padding)
//         .replace(/\-/g, '+')
//         .replace(/_/g, '/');
    
//     const rawData = window.atob(base64);
//     const outputArray = new Uint8Array(rawData.length);
    
//     for (let i = 0; i < rawData.length; ++i) {
//         outputArray[i] = rawData.charCodeAt(i);
//     }
//     return outputArray;
// }

export function isUndf (v) {
    return typeof v === 'undefined';
}

export function isObject (v) {
    return typeof v === 'object';
}

export function getWindowSize () {
    return {
        width: document.documentElement.clientWidth,
        height: document.documentElement.clientHeight
    };
}

export function random (a, b) {
    return (a + Math.round(Math.random() * (b - a)));
};

export function isPC () {
    return !(/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent));
}

let toastTimer = null;

export function toast (text) {
    clearTimeout(toastTimer);
    initStore().commit('ui/setToast', text);
    toastTimer = setTimeout(() => {
        initStore().commit('ui/setToast', '');
    }, 3000);
}