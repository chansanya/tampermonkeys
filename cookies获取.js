// ==UserScript==
// @name         获取网站Cookies
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  在任意网站获取全部Cookies并复制到剪贴板
// @author       You
// @include      https://y.qq.com/*
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';

    // 获取所有Cookies并格式化
    function getAllCookies() {
        const cookies = document.cookie.split('; ');
        return cookies.filter(cookie => cookie.trim() !== '').join('; ');
    }

    // 创建操作面板
    function createCookiePanel() {
        // 主容器
        const panel = document.createElement('div');
        panel.style.cssText = `
            position: fixed;
            bottom: 60px;
            right: 10px;
            z-index: 99999;
            background: #f5f5f5;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            display: flex;
            flex-direction: column;
            gap: 10px;
            min-width: 250px;
        `;
        panel.id = 'cookiePanel';

        // 标题栏（可拖动）
        const header = document.createElement('div');
        header.style.cssText = `
            font-weight: bold;
            padding: 5px 0;
            cursor: move;
            color: #333;
            border-bottom: 1px solid #eee;
        `;
        header.textContent = 'Cookies获取';
        panel.appendChild(header);


        // 获取按钮
        const getBtn = document.createElement('button');
        getBtn.style.cssText = `
            padding: 8px 12px;
            background: #4285f4;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
        `;
        getBtn.textContent = '复制';
        getBtn.addEventListener('click', () => {
            const allCookies = getAllCookies();
            if (allCookies) {
                GM_setClipboard(allCookies);
                alert(`成功复制会话信息到粘贴板`);
            } else {
                alert('当前网站没有Cookies');
            }
        });
        panel.appendChild(getBtn);

        // 显示面板
        document.body.appendChild(panel);

        // 悬浮开关按钮
        const toggleBtn = document.createElement('div');
        toggleBtn.style.cssText = `
            position: fixed;
            bottom: 10px;
            right: 10px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #4285f4;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            z-index: 99999;
        `;
        toggleBtn.textContent = '🍪';
        toggleBtn.addEventListener('click', () => {
            panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
        });
        document.body.appendChild(toggleBtn);

        // 实现面板拖动功能
        let isDragging = false;
        let offsetX, offsetY;
        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - panel.getBoundingClientRect().left;
            offsetY = e.clientY - panel.getBoundingClientRect().top;
            panel.style.transition = 'none'; // 拖动时关闭过渡动画
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;
            // 限制在可视区域内
            const maxX = window.innerWidth - panel.offsetWidth;
            const maxY = window.innerHeight - panel.offsetHeight;
            panel.style.left = `${Math.max(0, Math.min(x, maxX))}px`;
            panel.style.top = `${Math.max(0, Math.min(y, maxY))}px`;
            panel.style.bottom = 'auto';
            panel.style.right = 'auto';
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
            panel.style.transition = 'all 0.2s'; // 恢复过渡动画
        });
    }

    // 页面加载完成后创建面板
    window.addEventListener('load', createCookiePanel);
})();