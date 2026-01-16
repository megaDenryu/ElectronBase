/**
 * shortcut_list_style.css.ts
 * 
 * ショートカット一覧View用のvanilla extractスタイル定義
 */

import { style } from '@vanilla-extract/css';

export const ショートカット一覧_枠 = style({
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '16px',
    backgroundColor: 'rgba(250, 245, 255, 0.7)',
    borderRadius: '10px',
    border: '2px solid rgba(200, 180, 220, 0.4)'
});

export const ショートカットユニット = style({
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px',
    backgroundColor: 'rgba(240, 235, 250, 0.6)',
    borderRadius: '8px',
    border: '2px solid rgba(180, 160, 200, 0.4)',
    transition: 'all 0.3s ease',
    ':hover': {
        backgroundColor: 'rgba(230, 220, 245, 0.75)',
        borderColor: 'rgba(160, 140, 180, 0.6)'
    }
});

export const ショートカットキー = style({
    padding: '6px 12px',
    backgroundColor: 'rgba(200, 220, 240, 0.7)',
    border: '2px solid rgba(150, 180, 220, 0.5)',
    borderRadius: '6px',
    color: '#5a6a8a',
    fontSize: '14px',
    fontWeight: '500',
    minWidth: '100px',
    textAlign: 'center'
});

export const ショートカットコマンド = style({
    flex: 1,
    padding: '6px 12px',
    backgroundColor: 'rgba(230, 245, 240, 0.7)',
    border: '2px solid rgba(180, 220, 200, 0.5)',
    borderRadius: '6px',
    color: '#5a7a6a',
    fontSize: '14px'
});