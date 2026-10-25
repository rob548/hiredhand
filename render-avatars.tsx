import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import BotAvatar from './src/components/avatars/BotAvatar';
import { bots } from './src/data/bots';
import fs from 'fs';
const tiles = bots.map(b =>
  `<div style="text-align:center"><div style="width:120px;height:120px">${renderToStaticMarkup(React.createElement(BotAvatar, { bot: b, mood: b.status==='online'?'working':b.status==='waiting'?'waiting':'idle' }))}</div><div style="color:#ECF0F8;font:12px sans-serif;margin-top:6px">${b.name}</div></div>`
).join('');
fs.writeFileSync('/tmp/av5.html', `<!doctype html><body style="background:#0A0C12;display:grid;grid-template-columns:repeat(4,1fr);gap:24px;padding:30px">${tiles}</body>`);
