/**
 * style.css.ts
 * 
 * LauncherPageViewのvanilla extractスタイル定義
 */

import { style, keyframes } from '@vanilla-extract/css';

export const launcher_container = style({
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'rgba(250, 245, 230, 0.95)',
    color: '#5a5a5a',
    fontFamily: 'Arial, sans-serif'
});

export const launcher_header = style({
    padding: '20px',
    borderBottom: '2px solid rgba(150, 180, 200, 0.4)',
    textAlign: 'center',
    backgroundColor: 'rgba(230, 240, 250, 0.6)'
});

export const launcher_body = style({
    display: 'flex',
    flex: 1,
    overflow: 'hidden'
});

export const launcher_sidebar = style({
    width: '250px',
    backgroundColor: 'rgba(240, 230, 245, 0.7)',
    padding: '10px',
    boxSizing: 'border-box',
    borderRight: '2px solid rgba(180, 150, 200, 0.4)',
    display: 'flex',
    flexDirection: 'column',
    gap: '5px'
});

export const launcher_content = style({
    flex: 1,
    padding: '20px',
    overflow: 'auto',
    backgroundColor: 'rgba(255, 250, 240, 0.5)'
});

export const launcher_title = style({
    fontSize: '24px',
    fontWeight: 'bold',
    margin: 0,
    color: '#6a7a9a'
});

export const sidebar_button = style({
    padding: '12px 16px',
    backgroundColor: 'rgba(200, 220, 240, 0.6)',
    border: '2px solid rgba(150, 180, 220, 0.5)',
    borderRadius: '8px',
    color: '#5a6a8a',
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: '14px',
    transition: 'background-color 0.3s ease, transform 0.2s ease',
    ':hover': {
        backgroundColor: 'rgba(180, 200, 230, 0.8)',
        transform: 'translateX(4px)'
    }
});

export const sidebar_button_active = style({
    backgroundColor: 'rgba(150, 200, 250, 0.3)',
    fontWeight: 'bold',
    color: '#2a4a7a',
    boxShadow: '0 0 10px rgba(100, 170, 240, 0.4)',
    transform: 'translateX(4px)',
    ':hover': {
        backgroundColor: 'rgba(130, 180, 240, 0.4)'
    }
});

export const content_viewport_empty = style({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#9a9aaa',
    fontSize: '16px'
});
