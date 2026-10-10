// ==UserScript==
// @name    获取大乐斗cookies
// @namespace http://tampermonkey.net/
// @version 1.2
// @description    获取大乐斗cookies、执行请求并计算强化保底消耗
// @author    You
// @license   MIT
// @include    https://dld.qzapp.z.qq.com/*
// @grant    GM_setClipboard
// @require  https://cdn.jsdelivr.net/npm/lucide@1.53.0/dist/umd/lucide.min.js
// @downloadURL https://update.greasyfork.org/scripts/550434/%E8%8E%B7%E5%8F%96%E5%A4%A7%E4%B9%90%E6%96%97cookies.user.js
// @updateURL https://update.greasyfork.org/scripts/550434/%E8%8E%B7%E5%8F%96%E5%A4%A7%E4%B9%90%E6%96%97cookies.meta.js
// ==/UserScript==
(function() {
    'use strict';

    const cookieNames = ['RK', 'ptcz', 'openId', 'accessToken', 'newuin'];
    const panelStateKey = 'dldHelperPanelState';
    let requestIntervalId = null;
    let isRunning = false;

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #dld-helper-panel,
            #dld-helper-toggle {
                --dld-panel: #ffffff;
                --dld-soft: #f3f6f9;
                --dld-soft-strong: #e8eef5;
                --dld-text: #18212b;
                --dld-muted: #687585;
                --dld-border: #dce3ea;
                --dld-accent: #1769e0;
                --dld-accent-soft: #eaf2ff;
                --dld-accent-text: #0d4ea9;
                --dld-success: #168357;
                --dld-danger: #c63a3a;
                box-sizing: border-box;
                color: var(--dld-text);
                font-family: Inter, "PingFang SC", "Microsoft YaHei", sans-serif;
            }

            #dld-helper-panel *,
            #dld-helper-toggle * {
                box-sizing: border-box;
            }

            #dld-helper-panel[hidden],
            #dld-helper-panel [hidden] {
                display: none !important;
            }

            #dld-helper-panel {
                position: fixed;
                right: 10px;
                bottom: 60px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                width: min(380px, calc(100vw - 20px));
                max-height: calc(100vh - 80px);
                overflow: hidden;
                background: var(--dld-panel);
                border: 1px solid var(--dld-border);
                border-radius: 16px;
                box-shadow: 0 18px 50px rgba(38, 55, 74, 0.18);
            }

            #dld-helper-panel button,
            #dld-helper-panel input {
                font: inherit;
            }

            #dld-helper-panel button {
                cursor: pointer;
            }

            #dld-helper-panel .dld-header {
                display: flex;
                flex: 0 0 auto;
                align-items: center;
                justify-content: space-between;
                padding: 16px 18px 12px;
                cursor: move;
                user-select: none;
                touch-action: none;
            }

            #dld-helper-panel .dld-brand {
                display: flex;
                align-items: center;
                gap: 11px;
            }

            #dld-helper-panel .dld-brand-icon {
                display: grid;
                width: 36px;
                height: 36px;
                place-items: center;
                color: var(--dld-accent);
                background: var(--dld-accent-soft);
                border-radius: 10px;
            }

            #dld-helper-panel .dld-brand-icon svg {
                display: block;
                width: 19px;
                height: 19px;
                margin: auto;
            }

            #dld-helper-panel .dld-brand strong {
                display: block;
                font-size: 15px;
                line-height: 1.3;
            }

            #dld-helper-panel .dld-icon-button {
                display: grid;
                width: 32px;
                height: 32px;
                padding: 0;
                place-items: center;
                color: var(--dld-muted);
                background: transparent;
                border: 0;
                border-radius: 8px;
            }

            #dld-helper-panel .dld-icon-button:hover {
                color: var(--dld-text);
                background: var(--dld-soft);
            }

            #dld-helper-panel .dld-icon-button svg {
                display: block;
                width: 17px;
                height: 17px;
                margin: auto;
            }

            #dld-helper-panel .dld-content {
                flex: 1 1 auto;
                min-height: 0;
                overflow-y: auto;
                scrollbar-width: thin;
            }

            #dld-helper-panel .dld-session-button,
            #dld-helper-panel .dld-primary-button {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                color: #ffffff;
                background: var(--dld-accent);
                border: 0;
                border-radius: 10px;
                font-weight: 650;
            }

            #dld-helper-panel .dld-session-button {
                width: calc(100% - 36px);
                margin: 0 18px;
                padding: 10px 14px;
            }

            #dld-helper-panel .dld-session-button svg,
            #dld-helper-panel .dld-primary-button svg,
            #dld-helper-panel .dld-reset svg {
                display: block;
                width: 16px;
                height: 16px;
            }

            #dld-helper-panel .dld-tabs {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 4px;
                margin: 14px 18px 0;
                padding: 4px;
                background: var(--dld-soft);
                border-radius: 10px;
            }

            #dld-helper-panel .dld-tab {
                padding: 8px 10px;
                color: var(--dld-muted);
                background: transparent;
                border: 0;
                border-radius: 7px;
                font-size: 13px;
                font-weight: 600;
            }

            #dld-helper-panel .dld-tab.is-active {
                color: var(--dld-text);
                background: var(--dld-panel);
                box-shadow: 0 1px 4px rgba(37, 54, 72, 0.12);
            }

            #dld-helper-panel .dld-tab-panel {
                padding: 18px;
            }

            #dld-helper-panel .dld-section-heading {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 15px;
            }

            #dld-helper-panel .dld-section-heading strong,
            #dld-helper-panel .dld-section-heading span {
                display: block;
            }

            #dld-helper-panel .dld-section-heading strong {
                font-size: 14px;
            }

            #dld-helper-panel .dld-section-heading span {
                margin-top: 3px;
                color: var(--dld-muted);
                font-size: 11px;
            }

            #dld-helper-panel .dld-reset {
                display: flex;
                align-items: center;
                gap: 5px;
                padding: 6px 8px;
                color: var(--dld-muted);
                background: transparent;
                border: 0;
                border-radius: 7px;
                font-size: 12px;
            }

            #dld-helper-panel .dld-reset:hover {
                color: var(--dld-text);
                background: var(--dld-soft);
            }

            #dld-helper-panel .dld-reset svg {
                width: 13px;
                height: 13px;
            }

            #dld-helper-panel .dld-input-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 12px;
            }

            #dld-helper-panel .dld-field {
                display: grid;
                min-width: 0;
                gap: 6px;
            }

            #dld-helper-panel .dld-field-wide {
                margin-bottom: 12px;
            }

            #dld-helper-panel .dld-field-label {
                color: var(--dld-muted);
                font-size: 12px;
            }

            #dld-helper-panel .dld-input-wrap {
                position: relative;
                display: block;
            }

            #dld-helper-panel .dld-field input {
                width: 100%;
                height: 40px;
                padding: 0 38px 0 11px;
                color: var(--dld-text);
                background: var(--dld-soft);
                border: 1px solid transparent;
                border-radius: 9px;
                outline: none;
                font-size: 14px;
                font-weight: 650;
            }

            #dld-helper-panel .dld-field-wide input {
                padding-right: 11px;
            }

            #dld-helper-panel .dld-field input:focus {
                border-color: var(--dld-accent);
                box-shadow: 0 0 0 3px var(--dld-accent-soft);
            }

            #dld-helper-panel .dld-input-unit {
                position: absolute;
                top: 50%;
                right: 11px;
                transform: translateY(-50%);
                color: var(--dld-muted);
                font-size: 11px;
                font-style: normal;
                pointer-events: none;
            }

            #dld-helper-panel .dld-results {
                margin-top: 16px;
                overflow: hidden;
                background: var(--dld-accent-soft);
                border-radius: 12px;
            }

            #dld-helper-panel .dld-main-result {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 15px 16px;
                color: var(--dld-accent-text);
            }

            #dld-helper-panel .dld-main-result > span {
                font-size: 12px;
                font-weight: 650;
            }

            #dld-helper-panel .dld-main-result strong {
                font-size: 27px;
                line-height: 1;
                letter-spacing: -0.04em;
            }

            #dld-helper-panel .dld-results small {
                margin-left: 4px;
                font-size: 11px;
                font-weight: 500;
                letter-spacing: 0;
            }

            #dld-helper-panel .dld-secondary-results {
                display: grid;
                grid-template-columns: 1fr 1fr;
                background: var(--dld-soft-strong);
            }

            #dld-helper-panel .dld-secondary-results > div {
                padding: 13px 16px;
            }

            #dld-helper-panel .dld-secondary-results > div + div {
                border-left: 1px solid var(--dld-border);
            }

            #dld-helper-panel .dld-secondary-results span,
            #dld-helper-panel .dld-secondary-results strong {
                display: block;
            }

            #dld-helper-panel .dld-secondary-results span {
                color: var(--dld-muted);
                font-size: 11px;
            }

            #dld-helper-panel .dld-secondary-results strong {
                margin-top: 5px;
                font-size: 18px;
            }

            #dld-helper-panel .dld-primary-button {
                width: 100%;
                margin-top: 14px;
                padding: 10px 14px;
            }

            #dld-helper-panel .dld-primary-button.is-running {
                background: var(--dld-danger);
            }

            #dld-helper-panel .dld-status {
                display: flex;
                align-items: center;
                gap: 7px;
                margin-top: 12px;
                color: var(--dld-muted);
                font-size: 12px;
            }

            #dld-helper-panel .dld-status-dot {
                width: 7px;
                height: 7px;
                background: var(--dld-success);
                border-radius: 50%;
            }

            #dld-helper-panel .dld-status.is-error {
                color: var(--dld-danger);
            }

            #dld-helper-panel .dld-status.is-error .dld-status-dot {
                background: var(--dld-danger);
            }

            #dld-helper-panel .dld-error {
                margin: 10px 0 0;
                color: var(--dld-danger);
                font-size: 12px;
            }

            #dld-helper-toggle {
                position: fixed;
                right: 10px;
                bottom: 10px;
                z-index: 10001;
                display: grid;
                width: 40px;
                height: 40px;
                padding: 0;
                place-items: center;
                color: #ffffff;
                background: var(--dld-accent);
                border: 0;
                border-radius: 50%;
                box-shadow: 0 5px 16px rgba(23, 105, 224, 0.3);
                cursor: pointer;
            }

            #dld-helper-toggle svg {
                display: block;
                width: 19px;
                height: 19px;
                margin: auto;
            }

            @media (prefers-color-scheme: dark) {
                #dld-helper-panel,
                #dld-helper-toggle {
                    --dld-panel: #191f27;
                    --dld-soft: #222a34;
                    --dld-soft-strong: #293440;
                    --dld-text: #edf3f8;
                    --dld-muted: #9aa9b8;
                    --dld-border: #313d49;
                    --dld-accent: #397edc;
                    --dld-accent-soft: #1d3150;
                    --dld-accent-text: #acd0ff;
                    --dld-success: #56d49d;
                    --dld-danger: #ff8989;
                }

                #dld-helper-panel {
                    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.4);
                }
            }

            @media (max-width: 430px) {
                #dld-helper-panel {
                    border-radius: 13px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function renderIcons(root) {
        if (typeof lucide !== 'undefined' && typeof lucide.createIcons === 'function') {
            lucide.createIcons({
                attrs: {
                    width: 16,
                    height: 16,
                    'stroke-width': 2
                },
                root
            });
        }
    }

    function loadPanelState() {
        try {
            return JSON.parse(localStorage.getItem(panelStateKey) || '{}');
        } catch (error) {
            console.warn('大乐斗助手面板状态读取失败:', error);
            return {};
        }
    }

    function savePanelState(state) {
        localStorage.setItem(panelStateKey, JSON.stringify(state));
    }

    function createRequestControls() {
        injectStyles();

        const savedState = loadPanelState();
        const panelState = {
            hidden: Boolean(savedState.hidden),
            activeTab: savedState.activeTab === 'request' ? 'request' : 'calculator'
        };

        const controlsContainer = document.createElement('section');
        controlsContainer.id = 'dld-helper-panel';
        controlsContainer.setAttribute('aria-label', '大乐斗助手');
        controlsContainer.innerHTML = `
            <header class="dld-header">
                <div class="dld-brand">
                    <span class="dld-brand-icon"><i data-lucide="swords" aria-hidden="true"></i></span>
                    <div>
                        <strong>大乐斗助手</strong>
                    </div>
                </div>
                <button class="dld-icon-button" type="button" aria-label="收起面板">
                    <i data-lucide="minus" aria-hidden="true"></i>
                </button>
            </header>
            <div class="dld-content">
                <button class="dld-session-button" type="button">
                    <i data-lucide="copy" aria-hidden="true"></i>
                    <span>获取会话</span>
                </button>
                <div class="dld-tabs" role="tablist" aria-label="工具类型">
                    <button class="dld-tab" type="button" role="tab" data-tab="request" aria-controls="dld-request-panel">请求执行</button>
                    <button class="dld-tab" type="button" role="tab" data-tab="calculator" aria-controls="dld-calculator-panel">强化计算</button>
                </div>
                <div id="dld-request-panel" class="dld-tab-panel" role="tabpanel">
                    <label class="dld-field dld-field-wide">
                        <span class="dld-field-label">请求 URL</span>
                        <span class="dld-input-wrap">
                            <input id="dld-request-url" type="text" placeholder="粘贴要执行的链接到此处">
                        </span>
                    </label>
                    <div class="dld-input-grid">
                        <label class="dld-field">
                            <span class="dld-field-label">执行次数</span>
                            <span class="dld-input-wrap"><input id="dld-request-count" type="number" value="10" min="1" step="1"></span>
                        </label>
                        <label class="dld-field">
                            <span class="dld-field-label">间隔时间</span>
                            <span class="dld-input-wrap">
                                <input id="dld-request-interval" type="number" value="1" min="0" step="1">
                                <em class="dld-input-unit">秒</em>
                            </span>
                        </label>
                    </div>
                    <button class="dld-primary-button" type="button">
                        <i data-lucide="play" aria-hidden="true"></i>
                        <span>开始请求</span>
                    </button>
                    <div class="dld-status">
                        <span class="dld-status-dot"></span>
                        <span class="dld-status-text">当前空闲</span>
                    </div>
                </div>
                <div id="dld-calculator-panel" class="dld-tab-panel" role="tabpanel">
                    <div class="dld-section-heading">
                        <div>
                            <strong>强化保底计算</strong>
                            <span>输入数值后实时更新</span>
                        </div>
                        <button class="dld-reset" type="button">
                            <i data-lucide="rotate-ccw" aria-hidden="true"></i>
                            <span>重置</span>
                        </button>
                    </div>
                    <div class="dld-input-grid">
                        <label class="dld-field">
                            <span class="dld-field-label">祝福满值</span>
                            <span class="dld-input-wrap"><input id="dld-m" type="number" value="100" min="1" step="1"><em class="dld-input-unit">点</em></span>
                        </label>
                        <label class="dld-field">
                            <span class="dld-field-label">每次祝福</span>
                            <span class="dld-input-wrap"><input id="dld-p" type="number" value="2" min="1" step="1"><em class="dld-input-unit">点</em></span>
                        </label>
                        <label class="dld-field">
                            <span class="dld-field-label">每次材料</span>
                            <span class="dld-input-wrap"><input id="dld-n" type="number" value="3" min="1" step="1"><em class="dld-input-unit">个</em></span>
                        </label>
                        <label class="dld-field">
                            <span class="dld-field-label">单材积分</span>
                            <span class="dld-input-wrap"><input id="dld-n2" type="number" value="40" min="1" step="1"><em class="dld-input-unit">分</em></span>
                        </label>
                    </div>
                    <div class="dld-results" aria-live="polite">
                        <div class="dld-main-result">
                            <span>保底强化次数</span>
                            <strong><output id="dld-s">12</output><small>次</small></strong>
                        </div>
                        <div class="dld-secondary-results">
                            <div>
                                <span>总耗材料</span>
                                <strong><output id="dld-s2">36</output><small>个</small></strong>
                            </div>
                            <div>
                                <span>保底总积分</span>
                                <strong><output id="dld-s3">720</output><small>分</small></strong>
                            </div>
                        </div>
                    </div>
                    <p class="dld-error" role="alert" hidden>请输入大于 0 的有效数字</p>
                </div>
            </div>
        `;

        const togglePanelButton = document.createElement('button');
        togglePanelButton.id = 'dld-helper-toggle';
        togglePanelButton.type = 'button';
        togglePanelButton.setAttribute('aria-label', '显示或隐藏大乐斗助手');
        togglePanelButton.innerHTML = '<i data-lucide="menu" aria-hidden="true"></i>';
        document.body.append(controlsContainer, togglePanelButton);

        const find = selector => controlsContainer.querySelector(selector);
        const header = find('.dld-header');
        const collapseButton = find('.dld-icon-button');
        const sessionButton = find('.dld-session-button');
        const requestButton = find('.dld-primary-button');
        const resetButton = find('.dld-reset');
        const statusDisplay = find('.dld-status');
        const statusText = find('.dld-status-text');
        const urlInput = find('#dld-request-url');
        const countInput = find('#dld-request-count');
        const intervalInput = find('#dld-request-interval');
        const calculatorError = find('.dld-error');
        const calculatorInputs = {
            m: find('#dld-m'),
            p: find('#dld-p'),
            n: find('#dld-n'),
            n2: find('#dld-n2')
        };
        const calculatorOutputs = {
            s: find('#dld-s'),
            s2: find('#dld-s2'),
            s3: find('#dld-s3')
        };
        const tabsByName = Object.fromEntries(
            [...controlsContainer.querySelectorAll('.dld-tab')].map(tab => [
                tab.dataset.tab,
                { tab, panel: find(`#dld-${tab.dataset.tab}-panel`) }
            ])
        );

        function persistState() {
            savePanelState(panelState);
        }

        function setPanelHidden(hidden) {
            panelState.hidden = hidden;
            controlsContainer.hidden = hidden;
            togglePanelButton.setAttribute('aria-expanded', String(!hidden));
            persistState();
        }

        function setActiveTab(name) {
            const activeName = tabsByName[name] ? name : 'calculator';
            panelState.activeTab = activeName;
            Object.entries(tabsByName).forEach(([tabName, item]) => {
                const active = tabName === activeName;
                item.tab.classList.toggle('is-active', active);
                item.tab.setAttribute('aria-selected', String(active));
                item.panel.hidden = !active;
            });
            persistState();
        }

        function setRequestStatus(message, isError = false) {
            statusText.textContent = message;
            statusDisplay.classList.toggle('is-error', isError);
        }

        function setRequestRunning(running) {
            isRunning = running;
            requestButton.classList.toggle('is-running', running);
            requestButton.innerHTML = `
                <i data-lucide="${running ? 'square' : 'play'}" aria-hidden="true"></i>
                <span>${running ? '停止请求' : '开始请求'}</span>
            `;
            renderIcons(requestButton);
        }

        function updateCalculator() {
            const values = Object.fromEntries(
                Object.entries(calculatorInputs).map(([name, input]) => [name, Number(input.value)])
            );
            const valid = Object.values(values).every(value => Number.isFinite(value) && value > 0);

            calculatorError.hidden = valid;
            if (!valid) {
                Object.values(calculatorOutputs).forEach(output => { output.value = '—'; });
                return;
            }

            const guaranteedAttempts = Math.ceil(values.m / values.p);
            const totalMaterials = guaranteedAttempts * values.n;
            const totalPoints = totalMaterials * values.n2;
            calculatorOutputs.s.value = guaranteedAttempts.toLocaleString('zh-CN');
            calculatorOutputs.s2.value = totalMaterials.toLocaleString('zh-CN');
            calculatorOutputs.s3.value = totalPoints.toLocaleString('zh-CN');
        }

        sessionButton.addEventListener('click', () => {
            const extractedCookies = cookieNames.flatMap(name => {
                const value = getCookie(name);
                return value === undefined ? [] : [`${name}=${value}`];
            });
            const cookieString = extractedCookies.join('; ');
            if (!cookieString) {
                alert('Cookies匹配失败');
                return;
            }
            GM_setClipboard(cookieString);
            alert('成功复制会话信息到粘贴板');
        });

        Object.entries(tabsByName).forEach(([name, item]) => {
            item.tab.addEventListener('click', () => setActiveTab(name));
        });
        collapseButton.addEventListener('click', () => setPanelHidden(true));
        togglePanelButton.addEventListener('click', () => setPanelHidden(!controlsContainer.hidden));
        Object.values(calculatorInputs).forEach(input => input.addEventListener('input', updateCalculator));
        resetButton.addEventListener('click', () => {
            Object.entries({ m: 100, p: 9, n: 3, n2: 20 }).forEach(([name, value]) => {
                calculatorInputs[name].value = String(value);
            });
            updateCalculator();
        });

        requestButton.addEventListener('click', async () => {
            const urlToFetch = urlInput.value.trim();
            const repeatCount = parseInt(countInput.value, 10);
            const intervalMilliseconds = parseInt(intervalInput.value, 10) * 1000;

            if (!urlToFetch) {
                alert('请输入要请求的 URL！');
                return;
            }
            if (Number.isNaN(repeatCount) || repeatCount < 1) {
                alert('执行次数至少为1');
                return;
            }
            if (Number.isNaN(intervalMilliseconds) || intervalMilliseconds < 0) {
                alert('间隔至少为0秒');
                return;
            }
            if (isRunning) {
                clearTimeout(requestIntervalId);
                setRequestRunning(false);
                setRequestStatus('已停止');
                return;
            }

            let currentCount = 0;
            setRequestRunning(true);
            setRequestStatus(`运行中，剩余 ${repeatCount} 次`);

            const requestLoop = async () => {
                try {
                    const authHeader = cookieNames.flatMap(name => {
                        const value = getCookie(name);
                        return value === undefined ? [] : [`${name}=${value}`];
                    }).join('; ');
                    const response = await fetch(urlToFetch, {
                        method: 'GET',
                        headers: {
                            'User-Agent': navigator.userAgent,
                            'Referer': window.location.href,
                            'Cookie': authHeader
                        }
                    });
                    const text = await response.text();
                    console.log(`[${currentCount + 1}/${repeatCount}] 响应: `, `${text.substring(0, 100)}...`);
                } catch (error) {
                    console.error(error);
                    setRequestStatus(`请求失败: ${error.message}`, true);
                }

                currentCount++;
                if (!isRunning) return;
                if (currentCount >= repeatCount) {
                    setRequestRunning(false);
                    setRequestStatus('当前空闲');
                    alert('所有请求已完成！');
                    return;
                }
                setRequestStatus(`运行中，剩余 ${repeatCount - currentCount} 次`);
                requestIntervalId = setTimeout(requestLoop, intervalMilliseconds);
            };

            await requestLoop();
        });

        let isDragging = false;
        let offsetX = 0;
        let offsetY = 0;

        header.addEventListener('pointerdown', event => {
            if (event.target.closest('button')) return;
            const rect = controlsContainer.getBoundingClientRect();
            offsetX = event.clientX - rect.left;
            offsetY = event.clientY - rect.top;
            controlsContainer.style.left = `${rect.left}px`;
            controlsContainer.style.top = `${rect.top}px`;
            controlsContainer.style.removeProperty('right');
            controlsContainer.style.removeProperty('bottom');
            isDragging = true;
            header.setPointerCapture(event.pointerId);
        });

        header.addEventListener('pointermove', event => {
            if (!isDragging) return;
            const maxLeft = Math.max(0, window.innerWidth - controlsContainer.offsetWidth);
            const maxTop = Math.max(0, window.innerHeight - controlsContainer.offsetHeight);
            controlsContainer.style.left = `${Math.max(0, Math.min(event.clientX - offsetX, maxLeft))}px`;
            controlsContainer.style.top = `${Math.max(0, Math.min(event.clientY - offsetY, maxTop))}px`;
        });

        const endDrag = event => {
            if (!isDragging) return;
            isDragging = false;
            if (header.hasPointerCapture(event.pointerId)) header.releasePointerCapture(event.pointerId);
        };
        header.addEventListener('pointerup', endDrag);
        header.addEventListener('pointercancel', endDrag);
        header.addEventListener('dblclick', event => {
            if (event.target.closest('button')) return;
            controlsContainer.style.removeProperty('left');
            controlsContainer.style.removeProperty('top');
            controlsContainer.style.right = '10px';
            controlsContainer.style.bottom = '60px';
        });

        updateCalculator();
        setActiveTab(panelState.activeTab);
        setPanelHidden(panelState.hidden);
        renderIcons(controlsContainer);
        renderIcons(togglePanelButton);
    }

    window.addEventListener('load', createRequestControls);
})();
