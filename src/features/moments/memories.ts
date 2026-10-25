import type { L10n } from '../../core/i18n';

export interface Place { name: L10n; lat: number; lng: number }
export interface Media { type: 'image' | 'video'; src: string; alt: L10n }
export interface Memory { id: string; date: string; place: Place; title: L10n; text: L10n; media: Media[] }

export const PLACES = {
  shenzhen: { name: { zh: '深圳', en: 'Shenzhen' }, lat: 22.5431, lng: 114.0579 },
  collegeStation: { name: { zh: '德州 College Station', en: 'College Station, Texas' }, lat: 30.628, lng: -96.3344 },
} satisfies Record<string, Place>;

// To add a memory: put the photo/video in public/media/ and append an entry here.
export const memories: Memory[] = [
  {
    id: 'hearts',
    date: '2026-10-10',
    place: PLACES.shenzhen,
    title: { zh: '我们互相比心', en: 'Hearts from both sides' },
    text: {
      zh: '你在深圳比心，我在拍立得里比心。两张照片，拼成一颗完整的心。',
      en: 'You made a heart in Shenzhen, I made one in a Polaroid. Two photos, one whole heart.',
    },
    media: [{ type: 'image', src: 'media/moments/hearts.jpg', alt: { zh: '两张比心的照片', en: 'Two photos of us making hearts' } }],
  },
  {
    id: 'first-flowers',
    date: '2026-10-12',
    place: PLACES.shenzhen,
    title: { zh: '第一次送你花', en: 'The first flowers I sent you' },
    text: {
      zh: '10 月 12 日早上，花送到了你深圳的家。你发来一串“呜呜呜”，说“这也太漂亮了”。隔着太平洋，花替我先到了你身边。',
      en: 'On the morning of October 12 the flowers reached your home in Shenzhen. You sent me a row of happy sobs: “this is way too beautiful.” From across the Pacific, the flowers got to you before I could.',
    },
    media: [
      { type: 'image', src: 'media/moments/first-flowers.jpg', alt: { zh: '静仪和一大捧彩色的花', en: 'Jingyi beside a big bouquet of colourful flowers' } },
      { type: 'image', src: 'media/moments/first-flowers-chat.jpg', alt: { zh: '收到花时的聊天记录', en: 'Our chat when the flowers arrived' } },
    ],
  },
  {
    id: 'first-zoom',
    date: '2026-10-17',
    place: PLACES.collegeStation,
    title: { zh: '第一次 Zoom，和一张手绘机票', en: 'Our first Zoom — and a hand-drawn ticket' },
    text: {
      zh: '第一次视频，我在白板上给你画了一张机票：CYF925，深圳宝安飞纽约 JFK，2027 年 2 月 5 日，登机口 LOVE910，座位 99A。下面是从 9.20 到 10.17 的每一天，一天一颗心，一直画到 forever。',
      en: 'On our first video call I drew you a plane ticket: flight CYF925, Shenzhen Bao’an to New York JFK, February 5, 2027, gate LOVE910, seat 99A. Below it, one heart for every day from 9.20 to 10.17 — all the way to forever.',
    },
    media: [
      { type: 'image', src: 'media/moments/first-zoom.jpg', alt: { zh: '第一次 Zoom 和手绘机票', en: 'Our first Zoom call next to the hand-drawn ticket' } },
      { type: 'image', src: 'media/moments/flight-ticket.jpg', alt: { zh: '手绘机票 CYF925 深圳到纽约', en: 'Hand-drawn ticket CYF925, Shenzhen to New York' } },
    ],
  },
  {
    id: 'zoom-proposal',
    date: '2026-10-18',
    place: PLACES.collegeStation,
    title: { zh: 'Zoom 上一起练 proposal', en: 'Rehearsing my proposal defense on Zoom' },
    text: {
      zh: '你陪我把答辩一遍一遍讲完，听我讲灾害、遥感和我的研究。屏幕那头有你，我就不紧张了。',
      en: 'You stayed with me through every run of my defense talk — disasters, remote sensing, all of it. With you on the other side of the screen, I wasn’t nervous anymore.',
    },
    media: [{ type: 'image', src: 'media/moments/zoom-proposal.jpg', alt: { zh: 'Zoom 通话里的我们', en: 'The two of us on a Zoom call' } }],
  },
  {
    id: 'piano',
    date: '2026-10-21',
    place: PLACES.shenzhen,
    title: { zh: '电钢琴到家了', en: 'The digital piano arrives' },
    text: {
      zh: '这周三，电钢琴送到了你家。你说：“老公你给我买电钢琴了！！！哇趣！！！”希望它替我陪着你，弹好多好多首歌。',
      en: 'On Wednesday the digital piano arrived at your place. “You bought me a piano!!! Wow!!!” I hope it keeps you company for me, through many, many songs.',
    },
    media: [
      { type: 'image', src: 'media/moments/piano.jpg', alt: { zh: '送到家的电钢琴', en: 'The digital piano at home' } },
      { type: 'image', src: 'media/moments/piano-chat.jpg', alt: { zh: '收到电钢琴时的聊天记录', en: 'Our chat when the piano arrived' } },
    ],
  },
  {
    id: 'first-games',
    date: '2026-10-23',
    place: PLACES.collegeStation,
    title: { zh: '第一次一起下五子棋、玩你画我猜', en: 'Our first Gomoku and Pictionary' },
    text: {
      zh: '同一天，我们在 Zoom 的白板上下了第一盘五子棋，紫色是你，绿色是我；又一起玩你画我猜，你画的小猫把我难住了。你在深圳的深夜，我在德州的白天，笑声是同一个频道。',
      en: 'On the same day we played our first game of Gomoku on a Zoom whiteboard — purple for you, green for me — and then Pictionary, where your little cat drawing stumped me. Late night in Shenzhen, daytime in Texas, and our laughter on the same channel.',
    },
    media: [
      { type: 'image', src: 'media/moments/first-games-zoom.jpg', alt: { zh: 'Zoom 上一起玩游戏', en: 'Playing games together on Zoom' } },
      { type: 'image', src: 'media/moments/first-gomoku.jpg', alt: { zh: '白板上的第一盘五子棋', en: 'Our first Gomoku game on a whiteboard' } },
      { type: 'image', src: 'media/moments/first-pictionary.jpg', alt: { zh: '你画我猜的画', en: 'A Pictionary drawing' } },
    ],
  },
  {
    id: 'first-makeup',
    date: '2026-10-24',
    place: PLACES.shenzhen,
    title: { zh: '第一次闹别扭，然后和好', en: 'Our first quarrel — and making up' },
    text: {
      zh: '第一次因为年龄差让你不开心了。你是 98 年的，我是 99 年的，你的在意我都认真听了。说开、和好之后，我只想告诉你：我想和你一起过的，是以后的每一年。和好以后，更爱你了。',
      en: 'The first time our age gap made you sad. You were born in ’98, me in ’99, and I listened to every worry you had. After we talked it through and made up, all I want to tell you is this: what I want with you is every year still to come. I love you even more now.',
    },
    media: [{ type: 'image', src: 'media/moments/first-makeup.jpg', alt: { zh: '静仪拿着抹茶的自拍', en: 'Jingyi’s selfie with a matcha drink' } }],
  },
  {
    id: 'heart-and-camera',
    date: '2026-10-24',
    place: PLACES.collegeStation,
    title: { zh: '棋盘上画了一颗心，和补回来的那台相机', en: 'A heart on the Gomoku board, and the camera we got back' },
    text: {
      zh: '这一盘五子棋没有分胜负：蓝色和紫色的棋子在棋盘上拼成了一颗心。同一天，我给你订了生日礼物，富士 X100VI。10 月 5 日你在旅途中弄丢了相机，我说：要么去找到，要么好好挣钱再买一台；一个人旅行注定在风中行走，得到和失去一样多。丢的那台，我帮你补上。以后风里的路，让它替我陪你一起记下来。',
      en: 'This game of Gomoku had no winner: the blue and purple stones came together into a heart on the board. The same day I ordered your birthday present, a Fujifilm X100VI. On October 5 you lost your camera on a trip, and I told you: either go find it, or earn the money and buy another; travelling alone means walking in the wind, where you lose as much as you gain. The one you lost, I am replacing. On every windy road ahead, let it keep you company and remember things for me.',
    },
    media: [
      { type: 'image', src: 'media/moments/heart-gomoku.jpg', alt: { zh: '五子棋棋盘上用棋子拼出的爱心', en: 'A heart made of stones on the Gomoku board' } },
      { type: 'image', src: 'media/moments/x100vi-gift.jpg', alt: { zh: '微信礼物页面：富士 X100VI 相机', en: 'WeChat gift page: Fujifilm X100VI camera' } },
      { type: 'image', src: 'media/moments/lost-camera-chat.jpg', alt: { zh: '10 月 5 日关于丢相机和一个人旅行的聊天', en: 'Our chat on October 5 about the lost camera and travelling alone' } },
    ],
  },
];

export function sortedMemories(): Memory[] {
  return [...memories].sort((a, b) => a.date.localeCompare(b.date));
}
