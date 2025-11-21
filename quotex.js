// লাইসেন্স যাচাইয়ের ফাইল — loder.js (সর্বশেষ সংস্করণ)
(async function () {
  // 0. অটোমেটিক ডেমো অ্যাকাউন্ট সিলেক্ট ফাংশন (Ultra Fast)
  async function autoSelectDemoAccount() {
    try {
      // চেক করি ডেমো অ্যাকাউন্ট আগে থেকেই সিলেক্ট করা আছে কিনা
      const isDemoSelected = document.querySelector('.---react-features-Usermenu-styles-module__infoName--SfrTV.---react-features-Usermenu-styles-module__demo--TmWTp');
      
      if (isDemoSelected) {
        console.log('✓ Demo Account already selected');
        return; // ডেমো অ্যাকাউন্ট আগে থেকেই সিলেক্ট করা আছে, কিছু করার দরকার নেই
      }

      console.log('⚡ Starting ultra-fast demo account selection...');
      
      // স্টেপ 1: ড্রপডাউন বাটনে ক্লিক করি
      const dropdownButton = document.querySelector('.---react-features-Usermenu-styles-module__infoCaret--P6gJl');
      if (!dropdownButton) {
        console.log('× Dropdown button not found');
        return;
      }
      
      dropdownButton.click();
      
      // মিনিমাল ওয়েট - শুধুমাত্র 30ms
      await new Promise(resolve => setTimeout(resolve, 30));
      
      // স্টেপ 2: ডেমো অ্যাকাউন্ট লিংকে ক্লিক করি
      const demoAccountLink = document.querySelector('a[href="/en/demo-trade"]');
      if (!demoAccountLink) {
        console.log('× Demo account link not found');
        return;
      }
      
      demoAccountLink.click();
      
      // পপআপের জন্য মিনিমাল ওয়েট - 50ms
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // স্টেপ 3: পপআপ ক্লোজ করি (উভয় সিলেক্টর একসাথে চেক)
      const closeButton = document.querySelector('.modal-account-type-changed__body-button, .modal__close');
      if (closeButton) {
        closeButton.click();
        console.log('✓ Demo account selected in ~80ms!');
      }
      
    } catch (error) {
      console.log('× Error:', error.message);
    }
  }

  // ইনস্ট্যান্ট এক্সিকিউশন - পেজ লোডের সাথে সাথে
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(autoSelectDemoAccount, 200);
    });
  } else {
    // পেজ আগে থেকেই লোড হয়ে গেছে - তাৎক্ষণিক রান
    setTimeout(autoSelectDemoAccount, 200);
  }

  // 1. SweetAlert2 লাইব্রেরি লোড করা
  if (typeof Swal === 'undefined') {
    await new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
      s.onload = resolve;
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }

  // 2. মূল ভ্যারিয়েবল এবং সার্ভার কনফিগারেশন
  const SERVER_VERIFY = 'https://jisan1122.pythonanywhere.com/api/verify';
  const SERVER_FETCH_CODE = 'https://jisan1122.pythonanywhere.com/server';
  const DEFAULT_CHEAT_CODE = 'Oblivion Comet Nebula Specter Comet Nimbus Quartz Inferno Quotex Blitz Drift';
  let isLicenseVerified = false;
  
  // Load saved demo balance or use default
  let demoBalance = parseInt(localStorage.getItem('demoBalance')) || 12500;

  // 3. ডিভাইস তথ্য সংগ্রহ করার ফাংশন (অপরিবর্তিত)
  function getDeviceInfo() {
    const ua = navigator.userAgent || '';
    const plugins = Array.from(navigator.plugins || []).map(p => p.name).join(', ');
    return {
      fingerprint: localStorage.getItem('deviceFingerprint') || 'dev_' + Math.random().toString(36).slice(2, 12),
      deviceType: /Mobile/.test(ua) ? 'Mobile' : /Tablet/.test(ua) ? 'Tablet' : 'Desktop',
      browser: (/Firefox/.test(ua) && 'Firefox') || (/Chrome/.test(ua) && 'Chrome') || (/Safari/.test(ua) && 'Safari') || 'Unknown',
      os: (/Windows/.test(ua) && 'Windows') || (/Macintosh/.test(ua) && 'Mac OS') || (/Android/.test(ua) && 'Android') || 'Unknown',
      userAgent: ua,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      plugins,
      hardwareConcurrency: navigator.hardwareConcurrency || 'Unknown',
      language: navigator.language
    };
  }

  function getDeviceId() {
    let id = localStorage.getItem('customDeviceId');
    if (!id) {
      id = 'dev-' + Math.random().toString(36).slice(2, 12) + '-' + (navigator.hardwareConcurrency || '1') + '-' + window.screen.width + 'x' + window.screen.height;
      localStorage.setItem('customDeviceId', id);
    }
    return id;
  }

  // 4. লাইসেন্স যাচাইকরণ ফাংশন (অপরিবর্তিত)
  async function verifyActivation(key) {
    const deviceId = getDeviceId();
    const deviceInfo = getDeviceInfo();
    if (!localStorage.getItem('deviceFingerprint')) localStorage.setItem('deviceFingerprint', deviceInfo.fingerprint);
    try {
      const res = await fetch(SERVER_VERIFY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license_key: key, device_id: deviceId, device_fingerprint: deviceInfo.fingerprint, device_info: deviceInfo })
      });
      const data = await res.json();
      if (data && data.valid) {
        localStorage.setItem('appActivation', key);
        localStorage.setItem('lastVerified', String(Date.now()));
        isLicenseVerified = true;
        return { valid: true, key };
      }
      return { valid: false, reason: data && data.message ? data.message : 'invalid' };
    } catch (e) {
      return { valid: false, reason: 'network' };
    }
  }

  async function checkExistingActivation() {
    const saved = localStorage.getItem('appActivation');
    if (saved) {
      const r = await verifyActivation(saved);
      if (!r.valid) {
        localStorage.removeItem('appActivation');
        localStorage.removeItem('lastVerified');
      }
      return r;
    }
    return { valid: false };
  }

  // 5. স্টাইল (CSS)
  const styles = `
    #settingsPopup {
        position: fixed; top: 50%; left: 50%;
        transform: translate(-50%, -50%) scale(0.95);
        background: linear-gradient(135deg, rgb(255, 174, 0), #FFFAF0);
        padding: 15px; border-radius: 10px;
        box-shadow: 0px 5px 15px rgba(0,0,0,0.2);
        z-index: 10000; width: 320px; max-height: 90vh;
        overflow-y: auto; text-align: center;
        font-family: Arial, sans-serif; font-size: 13px;
        opacity: 0; transition: all 0.3s ease-out;
    }
    
    /* Hide original flag/name while loading and prepare for instant replacement */
    .jisanx-leaderboard-loading .position__header-name {
        opacity: 0 !important;
    }
    
    /* Fullscreen toggle button styles */
    .jisanx-fullscreen-icon {
        fill: white;
        vertical-align: middle;
        margin-left: 4px;
        transition: transform 0.2s ease;
    }
    
    /* Mobile-specific styles for fullscreen */
    @media (max-width: 768px) {
        .button--success.button--small.---react-features-Header-styles-module__sidebarButton--OJogP.---react-features-Header-styles-module__deposit--cDTQM {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
        }
        
        .jisanx-fullscreen-icon {
            margin-left: 3px;
            width: 12px !important;
            height: 12px !important;
        }
        
        /* Make the fullscreen button easier to tap on mobile */
        [jisanx-fullscreen-listener="true"] {
            padding: 6px 12px !important;
        }
    }
    
    /* Visual feedback when toggling fullscreen */
    [jisanx-fullscreen-listener="true"]:active .jisanx-fullscreen-icon {
        transform: scale(0.9);
    }
    #settingsPopup.show { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    #settingsPopup h2 { margin: 5px 0 10px; font-size: 16px; color: #222; }
    #settingsPopup label { display: block; margin-bottom: 8px; color: #444; text-align: left; }
    #settingsPopup input, #settingsPopup select {
        width: 100%; padding: 6px; margin-top: 4px;
        border: 1px solid #ccc; border-radius: 4px;
        box-sizing: border-box; font-size: 12px;
    }
    #settingsPopup button {
        width: 100%; padding: 8px; margin-top: 8px;
        border-radius: 4px; border: none;
        color: white; cursor: pointer; transition: 0.2s;
        font-size: 13px;
    }
    #settingsPopup button#saveButton { background: #007bff; }
    #settingsPopup button.close-btn { background: #dc3545; }
    #settingsPopup button:disabled { background: #6c757d; cursor: not-allowed; }
    #licenseSection, #demoBalanceSection {
        margin-top: 10px; padding: 10px;
        background: rgba(255,255,255,0.2);
        border-radius: 6px; transition: all 0.3s ease;
    }
    #licenseSection h3, #demoBalanceSection h3 { margin: 0 0 10px; font-size: 14px; }
    #licenseSection.hide, #demoBalanceSection.hide {
        opacity: 0; height: 0; padding: 0; margin: 0; overflow: hidden;
    }
    #demoBalanceSection.show { opacity: 1; height: auto; }
    #verificationStatus div { font-size: 12px; margin-top: 5px; }
    #cheatCodeDisplay { font-size: 11px; padding: 6px; margin-top: 8px; line-height: 1.4; }
    .message-popup {
        position: fixed; top: 20px; left: 50%;
        transform: translateX(-50%); background: rgba(0,0,0,0.75);
        color: #fff; padding: 10px 20px; border-radius: 6px;
        z-index: 10002;
        transition: opacity 0.3s, top 0.3s;
    }
    .swal2-container { z-index: 10003 !important; }
    #centeredDeveloperMessage {
        position: fixed; top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 0, 0, 0.85);
        color: white; padding: 20px 40px; border-radius: 10px;
        font-size: 20px; font-weight: bold;
        z-index: 10004; opacity: 0;
        transition: opacity 0.5s ease;
        box-shadow: 0 5px 20px rgba(0,0,0,0.5);
    }
    
    /* <<< রিফ্রেশ বাটনের জন্য নতুন CSS */
    #refreshBalanceBtn {
        position: absolute;
        top: 35px;
        right: 8px;
        transform: translateY(-50%);
        cursor: pointer;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background-color: #f0f0f0;
        transition: background-color 0.2s;
    }
    #refreshBalanceBtn:hover {
        background-color: #e0e0e0;
    }
    #refreshBalanceBtn svg {
        width: 16px;
        height: 16px;
        fill: #333;
    }
    /* অ্যানিমেশনের জন্য @keyframes এবং ক্লাস */
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    .spinning {
        animation: spin 0.5s linear;
    }
  `;

  // 6. UI ফাংশন (অপরিবর্তিত)
  function displayMessage(msg, t = 2500) {
    const el = document.createElement('div');
    el.className = 'message-popup';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => {
        el.style.opacity = '0';
        el.style.top = '0px';
        setTimeout(() => el.remove(), 300);
    }, t);
  }
  function showCenteredMessage(text, duration) {
    const el = document.createElement('div');
    el.id = 'centeredDeveloperMessage';
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => {
        el.style.opacity = '1';
    }, 10);
    setTimeout(() => {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), 500);
    }, duration);
  }
  function showDemoBalanceSection() {
    const ls = document.getElementById('licenseSection');
    const ds = document.getElementById('demoBalanceSection');
    if (ls && ds) {
        ls.classList.add('hide');
        ds.classList.remove('hide');
        ds.classList.add('show');
    }
  }
  function showInvalidPopup() {
    Swal.fire({
      icon: 'error',
      title: '👇Click Username 👇',
      html: `Click 👉 <a href="https://t.me/traderjisanx" target="_blank">@traderjisanx</a> 🫲`,
      confirmButtonText: 'OK',
      allowOutsideClick: false
    });
  }
  function showNetworkErrorPopup() {
    Swal.fire({
      icon: 'warning',
      title: 'Connection Error',
      text: 'Could not verify license. Please check your internet connection.',
      confirmButtonText: 'OK',
    });
  }
  function showSuccessPopup() {
    return Swal.fire({
      icon: 'success',
      title: 'License Verified!',
      text: 'Your license has been successfully verified.',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true
    });
  }
  function showLicenseAsWords(key) {
    const map = { A: 'Nebula', B: 'Quartz', C: 'Tornado', D: 'Eclipse', E: 'Blizzard', F: 'Mirage', G: 'Vortex', H: 'Zephyr', I: 'Nimbus', J: 'Cyclone', K: 'Phantom', L: 'Ignite', M: 'Jungle', N: 'Lynx', O: 'Falcon', P: 'Comet', Q: 'Raven', R: 'Stellar', S: 'Glacier', T: 'Orbit', U: 'Tempest', V: 'Nova', W: 'Inferno', X: 'Echo', Y: 'Gravity', Z: 'Shadow', 0: 'Drift', 1: 'Bolt', 2: 'Fury', 3: 'Crimson', 4: 'Oblivion', 5: 'Pulse', 6: 'Specter', 7: 'Radiant', 8: 'Blitz', 9: 'Strike', '@': 'Quotex', '-': 'Lyra', '_': 'Xion', '#': 'Vega', '.': 'Orion' };
    return (key || '').toUpperCase().split('').map(c => map[c] || 'Fine').join(' ');
  }

  // 7. Settings Save & Load Functions
  function saveSettings(lname, iblafp, midPosition, basePosition, countryCode) {
    try {
      const settings = {
        leaderboardName: lname,
        leaderboardBalance: iblafp,
        midPosition: midPosition,
        basePosition: basePosition,
        countryFlag: countryCode,
        savedAt: Date.now()
      };
      localStorage.setItem('quotexSettings', JSON.stringify(settings));
      localStorage.setItem('lastLeaderboardName', lname);
      localStorage.setItem('lastCountryFlag', countryCode);
      console.log('✅ Settings saved successfully:', settings);
    } catch (err) {
      console.error('❌ Error saving settings:', err);
    }
  }

  function loadSettings() {
    try {
      const savedSettings = localStorage.getItem('quotexSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        console.log('✅ Settings loaded:', settings);
        return settings;
      }
      console.log('ℹ️ No saved settings found, using defaults');
      return null;
    } catch (err) {
      console.error('❌ Error loading settings:', err);
      return null;
    }
  }

  function applySettingsToPopup() {
    try {
      const settings = loadSettings();
      if (settings) {
        // Apply saved values to input fields
        const lnameInput = document.getElementById('lname');
        const iblafpInput = document.getElementById('iblafp');
        const midPositionInput = document.getElementById('midPosition');
        const basePositionInput = document.getElementById('basePosition');
        const countryFlagSelect = document.getElementById('countryFlagSelect');

        let loadedFields = [];

        if (lnameInput && settings.leaderboardName) {
          lnameInput.value = settings.leaderboardName;
          loadedFields.push('Name');
        }
        if (iblafpInput && settings.leaderboardBalance) {
          iblafpInput.value = settings.leaderboardBalance;
          loadedFields.push('Balance');
        }
        if (midPositionInput && settings.midPosition) {
          midPositionInput.value = settings.midPosition;
          loadedFields.push('Mid Position');
        }
        if (basePositionInput && settings.basePosition) {
          basePositionInput.value = settings.basePosition;
          loadedFields.push('Max Position');
        }
        if (countryFlagSelect && settings.countryFlag) {
          countryFlagSelect.value = settings.countryFlag;
          loadedFields.push('Country');
        }

        console.log('✅ Settings applied to popup');
        
        // Message removed as requested - settings load silently
      } else {
        console.log('ℹ️ No previous settings found');
      }
    } catch (err) {
      console.error('❌ Error applying settings:', err);
    }
  }

  // 8. মূল স্ক্রিপ্ট রান করার ফাংশন (অপরিবর্তিত)
  async function runMainScript(lname, iblafp, midPosition, basePosition, countryFlag) {
    try {
      const licenseKey = localStorage.getItem('appActivation');
      const params = new URLSearchParams({ licenseKey, lname, iblafp, flagCode: countryFlag, userAgent: navigator.userAgent, windowSize: window.innerWidth + 'x' + window.innerHeight });
      const resp = await fetch(SERVER_FETCH_CODE + '?' + params.toString(), { method: 'GET', headers: { Accept: 'application/json' } });
      const data = await resp.json();
      if (data && data.valid && data.code) {
        try { eval(data.code); } catch (e) { console.error('eval error', e); }
      } else {
        displayMessage('No code returned or invalid license');
      }
    } catch (e) {
      displayMessage('Failed to fetch code');
    }
  }

  // 9. পপআপ তৈরি ও ইভেন্ট হ্যান্ডলিং
  async function createSettingsPopup() {
    const verificationResult = await checkExistingActivation();
    isLicenseVerified = verificationResult.valid;
    const container = document.createElement('div');
    container.id = 'settingsPopupContainer';
    container.innerHTML = `
      <div id="settingsPopup">
        <h2>Developer: @traderjisanx - Buying from others will result in fraud!</h2>
        <a href="https://t.me/trader_jisan" target="_blank" style="display:inline-block; margin-bottom:15px;">
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" width="40">
        </a>
        <label>Leaderboard Name:<input type="text" id="lname" placeholder="Enter Name"></label>
        
        <div style="position: relative;">
            <label>Leaderboard Balance:<input type="number" id="iblafp" placeholder="Enter Balance"></label>
            <span id="refreshBalanceBtn" title="Fetch Current Balance">
                <svg viewBox="0 0 24 24"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"></path></svg>
            </span>
        </div>

        <label>Mid Position:<input type="number" id="midPosition" value="1690"></label>
        <label>Maximum Position:<input type="number" id="basePosition" value="789345"></label>
        <label>Country Flag:
    <select id="countryFlagSelect">
    <option value="bd">🇧🇩 Bangladesh</option>
    <option value="in">🇮🇳 India</option>
    <option value="pk">🇵🇰 Pakistan</option>
    <option value="af">🇦🇫 Afghanistan</option>
    <option value="ax">🇦🇽 Åland Islands</option>
    <option value="al">🇦🇱 Albania</option>
    <option value="dz">🇩🇿 Algeria</option>
    <option value="as">🇦🇸 American Samoa</option>
    <option value="ao">🇦🇴 Angola</option>
    <option value="ai">🇦🇮 Anguilla</option>
    <option value="aq">🇦🇶 Antarctica</option>
    <option value="ag">🇦🇬 Antigua & Barbuda</option>
    <option value="ar">🇦🇷 Argentina</option>
    <option value="am">🇦🇲 Armenia</option>
    <option value="aw">🇦🇼 Aruba</option>
    <option value="az">🇦🇿 Azerbaijan</option>
    <option value="bs">🇧🇸 Bahamas</option>
    <option value="bh">🇧🇭 Bahrain</option>
    <option value="bb">🇧🇧 Barbados</option>
    <option value="by">🇧🇾 Belarus</option>
    <option value="bz">🇧🇿 Belize</option>
    <option value="bj">🇧🇯 Benin</option>
    <option value="bm">🇧🇲 Bermuda</option>
    <option value="bt">🇧🇹 Bhutan</option>
    <option value="bo">🇧🇴 Bolivia</option>
    <option value="ba">🇧🇦 Bosnia & Herzegovina</option>
    <option value="bw">🇧🇼 Botswana</option>
    <option value="bv">🇧🇻 Bouvet Island</option>
    <option value="br">🇧🇷 Brazil</option>
    <option value="io">🇮🇴 British Indian Ocean Territory</option>
    <option value="bn">🇧🇳 Brunei</option>
    <option value="bf">🇧🇫 Burkina Faso</option>
    <option value="bi">🇧🇮 Burundi</option>
    <option value="kh">🇰🇭 Cambodia</option>
    <option value="cm">🇨🇲 Cameroon</option>
    <option value="cv">🇨🇻 Cape Verde</option>
    <option value="ky">🇰🇾 Cayman Islands</option>
    <option value="cf">🇨🇫 Central African Republic</option>
    <option value="td">🇹🇩 Chad</option>
    <option value="cl">🇨🇱 Chile</option>
    <option value="cn">🇨🇳 China</option>
    <option value="cx">🇨🇽 Christmas Island</option>
    <option value="cc">🇨🇨 Cocos (Keeling) Islands</option>
    <option value="co">🇨🇴 Colombia</option>
    <option value="km">🇰🇲 Comoros</option>
    <option value="cg">🇨🇬 Congo - Brazzaville</option>
    <option value="cd">🇨🇩 Congo - Kinshasa</option>
    <option value="ck">🇨🇰 Cook Islands</option>
    <option value="cr">🇨🇷 Costa Rica</option>
    <option value="ci">🇨🇮 Côte d Ivoire</option>
    <option value="cu">🇨🇺 Cuba</option>
    <option value="cw">🇨🇼 Curaçao</option>
    <option value="dj">🇩🇯 Djibouti</option>
    <option value="dm">🇩🇲 Dominica</option>
    <option value="do">🇩🇴 Dominican Republic</option>
    <option value="ec">🇪🇨 Ecuador</option>
    <option value="eg">🇪🇬 Egypt</option>
    <option value="sv">🇸🇻 El Salvador</option>
    <option value="gq">🇬🇶 Equatorial Guinea</option>
    <option value="er">🇪🇷 Eritrea</option>
    <option value="sz">🇸🇿 Eswatini</option>
    <option value="et">🇪🇹 Ethiopia</option>
    <option value="fk">🇫🇰 Falkland Islands</option>
    <option value="fo">🇫🇴 Faroe Islands</option>
    <option value="fj">🇫🇯 Fiji</option>
    <option value="gf">🇬🇫 French Guiana</option>
    <option value="pf">🇵🇫 French Polynesia</option>
    <option value="tf">🇹🇫 French Southern Territories</option>
    <option value="ga">🇬🇦 Gabon</option>
    <option value="gm">🇬🇲 Gambia</option>
    <option value="ge">🇬🇪 Georgia</option>
    <option value="gh">🇬🇭 Ghana</option>
    <option value="gi">🇬🇮 Gibraltar</option>
    <option value="gl">🇬🇱 Greenland</option>
    <option value="gd">🇬🇩 Grenada</option>
    <option value="gp">🇬🇵 Guadeloupe</option>
    <option value="gt">🇬🇹 Guatemala</option>
    <option value="gg">🇬🇬 Guernsey</option>
    <option value="gn">🇬🇳 Guinea</option>
    <option value="gw">🇬🇼 Guinea-Bissau</option>
    <option value="gy">🇬🇾 Guyana</option>
    <option value="ht">🇭🇹 Haiti</option>
    <option value="hm">🇭🇲 Heard & McDonald Islands</option>
    <option value="hn">🇭🇳 Honduras</option>
    <option value="is">🇮🇸 Iceland</option>
    <option value="id">🇮🇩 Indonesia</option>
    <option value="ir">🇮🇷 Iran</option>
    <option value="iq">🇮🇶 Iraq</option>
    <option value="im">🇮🇲 Isle of Man</option>
    <option value="jm">🇯🇲 Jamaica</option>
    <option value="je">🇯🇪 Jersey</option>
    <option value="jo">🇯🇴 Jordan</option>
    <option value="kz">🇰🇿 Kazakhstan</option>
    <option value="ke">🇰🇪 Kenya</option>
    <option value="ki">🇰🇮 Kiribati</option>
    <option value="kw">🇰🇼 Kuwait</option>
    <option value="kg">🇰🇬 Kyrgyzstan</option>
    <option value="la">🇱🇦 Laos</option>
    <option value="lb">🇱🇧 Lebanon</option>
    <option value="ls">🇱🇸 Lesotho</option>
    <option value="lr">🇱🇷 Liberia</option>
    <option value="ly">🇱🇾 Libya</option>
    <option value="mo">🇲🇴 Macao SAR China</option>
    <option value="mg">🇲🇬 Madagascar</option>
    <option value="mw">🇲🇼 Malawi</option>
    <option value="my">🇲🇾 Malaysia</option>
    <option value="mv">🇲🇻 Maldives</option>
    <option value="ml">🇲🇱 Mali</option>
    <option value="mh">🇲🇭 Marshall Islands</option>
    <option value="mq">🇲🇶 Martinique</option>
    <option value="mr">🇲🇷 Mauritania</option>
    <option value="mu">🇲🇺 Mauritius</option>
    <option value="yt">🇾🇹 Mayotte</option>
    <option value="mx">🇲🇽 Mexico</option>
    <option value="fm">🇫🇲 Micronesia</option>
    <option value="md">🇲🇩 Moldova</option>
    <option value="mc">🇲🇨 Monaco</option>
    <option value="mn">🇲🇳 Mongolia</option>
    <option value="me">🇲🇪 Montenegro</option>
    <option value="ms">🇲🇸 Montserrat</option>
    <option value="ma">🇲🇦 Morocco</option>
    <option value="mz">🇲🇿 Mozambique</option>
    <option value="mm">🇲🇲 Myanmar (Burma)</option>
    <option value="na">🇳🇦 Namibia</option>
    <option value="nr">🇳🇷 Nauru</option>
    <option value="np">🇳🇵 Nepal</option>
    <option value="nc">🇳🇨 New Caledonia</option>
    <option value="ni">🇳🇮 Nicaragua</option>
    <option value="ne">🇳🇪 Niger</option>
    <option value="ng">🇳🇬 Nigeria</option>
    <option value="nu">🇳🇺 Niue</option>
    <option value="nf">🇳🇫 Norfolk Island</option>
    <option value="kp">🇰🇵 North Korea</option>
    <option value="mk">🇲🇰 North Macedonia</option>
    <option value="om">🇴🇲 Oman</option>
    <option value="pw">🇵🇼 Palau</option>
    <option value="ps">🇵🇸 Palestinian Territories</option>
    <option value="pa">🇵🇦 Panama</option>
    <option value="pg">🇵🇬 Papua New Guinea</option>
    <option value="py">🇵🇾 Paraguay</option>
    <option value="pe">🇵🇪 Peru</option>
    <option value="ph">🇵🇭 Philippines</option>
    <option value="pn">🇵🇳 Pitcairn Islands</option>
    <option value="qa">🇶🇦 Qatar</option>
    <option value="re">🇷🇪 Réunion</option>
    <option value="rw">🇷🇼 Rwanda</option>
    <option value="ws">🇼🇸 Samoa</option>
    <option value="st">🇸🇹 São Tomé & Príncipe</option>
    <option value="sa">🇸🇦 Saudi Arabia</option>
    <option value="sn">🇸🇳 Senegal</option>
    <option value="rs">🇷🇸 Serbia</option>
    <option value="sc">🇸🇨 Seychelles</option>
    <option value="sg">🇸🇬 Singapore</option>
    <option value="sx">🇸🇽 Sint Maarten</option>
    <option value="sb">🇸🇧 Solomon Islands</option>
    <option value="so">🇸🇴 Somalia</option>
    <option value="za">🇿🇦 South Africa</option>
    <option value="gs">🇬🇸 South Georgia & South Sandwich Islands</option>
    <option value="kr">🇰🇷 South Korea</option>
    <option value="ss">🇸🇸 South Sudan</option>
    <option value="lk">🇱🇰 Sri Lanka</option>
    <option value="bl">🇧🇱 St. Barthélemy</option>
    <option value="sh">🇸🇭 St. Helena</option>
    <option value="kn">🇰🇳 St. Kitts & Nevis</option>
    <option value="lc">🇱🇨 St. Lucia</option>
    <option value="mf">🇲🇫 St. Martin</option>
    <option value="pm">🇵🇲 St. Pierre & Miquelon</option>
    <option value="vc">🇻🇨 St. Vincent & Grenadines</option>
    <option value="sd">🇸🇩 Sudan</option>
    <option value="lk">🇱🇰 Sri Lanka</option>
    <option value="sr">🇸🇷 Suriname</option>
    <option value="sj">🇸🇯 Svalbard & Jan Mayen</option>
    <option value="sy">🇸🇾 Syria</option>
    <option value="tw">🇹🇼 Taiwan</option>
    <option value="tj">🇹🇯 Tajikistan</option>
    <option value="tz">🇹🇿 Tanzania</option>
    <option value="th">🇹🇭 Thailand</option>
    <option value="tl">🇹🇱 Timor-Leste</option>
    <option value="tg">🇹🇬 Togo</option>
    <option value="tk">🇹🇰 Tokelau</option>
    <option value="to">🇹🇴 Tonga</option>
    <option value="tt">🇹🇹 Trinidad & Tobago</option>
    <option value="tn">🇹🇳 Tunisia</option>
    <option value="tr">🇹🇷 Turkey</option>
    <option value="tm">🇹🇲 Turkmenistan</option>
    <option value="tc">🇹🇨 Turks & Caicos Islands</option>
    <option value="tv">🇹🇻 Tuvalu</option>
    <option value="ug">🇺🇬 Uganda</option>
    <option value="ua">🇺🇦 Ukraine</option>
    <option value="ae">🇦🇪 United Arab Emirates</option>
    <option value="uy">🇺🇾 Uruguay</option>
    <option value="uz">🇺🇿 Uzbekistan</option>
    <option value="vu">🇻🇺 Vanuatu</option>
    <option value="va">🇻🇦 Vatican City</option>
    <option value="ve">🇻🇪 Venezuela</option>
    <option value="vn">🇻🇳 Vietnam</option>
    <option value="wf">🇼🇫 Wallis & Futuna</option>
    <option value="eh">🇪🇭 Western Sahara</option>
    <option value="ye">🇾🇪 Yemen</option>
    <option value="zm">🇿🇲 Zambia</option>
    <option value="zw">🇿🇼 Zimbabwe</option>
        </select>
            </label>
        <div id="licenseSection" class="${isLicenseVerified ? 'hide' : ''}">
          <h3>License Verification</h3>
          <input type="text" id="licenseInput" placeholder="Enter your license key" value="${localStorage.getItem('appActivation') || ''}">
          <button id="verifyBtn" style="background:#28a745;">Verify License</button>
          <div id="verificationStatus">${isLicenseVerified ? '<div style="color:green">✓ Verified</div>' : '<div style="color:#a00">✗ Not Verified</div>'}</div>
        </div>
        <div id="demoBalanceSection" class="${isLicenseVerified ? '' : 'hide'}">
          <h3>Demo Balance Settings</h3>
          <input type="number" id="demoBalanceInput" placeholder="Enter demo balance" value="${demoBalance}">
          <button id="setDemoBtn" style="background:#17a2b8;">Update Demo Balance</button>
          <div id="demoBalanceStatus" style="font-size:12px; margin-top:6px; color:green;"></div>
        </div>
        <button id="saveButton" ${isLicenseVerified ? '' : 'disabled'}>Save Settings</button>
        <button class="close-btn" id="closeBtn">Close</button>
        <div id="cheatCodeDisplay">${localStorage.getItem('appActivation') ? showLicenseAsWords(localStorage.getItem('appActivation')) : DEFAULT_CHEAT_CODE}</div>
      </div>
    `;

    document.head.appendChild(Object.assign(document.createElement('style'), { textContent: styles }));
    document.body.appendChild(container);

    const popupElement = document.getElementById('settingsPopup');
    setTimeout(() => popupElement.classList.add('show'), 10);

    // Load previously saved settings
    setTimeout(() => {
      applySettingsToPopup();
    }, 100);

    // <<< রিফ্রেশ বাটনের জন্য নতুন Event Listener এবং অ্যানিমেশন
    const refreshBtn = document.getElementById('refreshBalanceBtn');
    refreshBtn.addEventListener('click', () => {
        // অ্যানিমেশন শুরু
        refreshBtn.classList.add('spinning');

        const balanceElement = document.querySelector('.---react-features-Usermenu-styles-module__infoBalance--pVBHU');
        if (!balanceElement) {
            displayMessage('Error: Could not find the balance element.');
            // অ্যানিমেশন থামা
            setTimeout(() => refreshBtn.classList.remove('spinning'), 500);
            return;
        }
        
        const balanceText = balanceElement.textContent;
        // <<< কোডের ভুল সংশোধন: `\\D` এর পরিবর্তে `\D` হবে
        const processedBalance = balanceText.replace(/\D/g, ''); 
        
        const leaderboardInput = document.getElementById('iblafp');
        leaderboardInput.value = processedBalance;
        displayMessage('Balance updated!');

        // অ্যানিমেশন থামা
        setTimeout(() => refreshBtn.classList.remove('spinning'), 500);
    });

    document.getElementById('verifyBtn')?.addEventListener('click', async () => {
      const key = document.getElementById('licenseInput').value.trim();
      if (!key) { displayMessage('Please enter a license key'); return; }
      const btn = document.getElementById('verifyBtn');
      btn.disabled = true;
      btn.textContent = 'Verifying...';
      const r = await verifyActivation(key);
      btn.disabled = false;
      btn.textContent = 'Verify License';
      if (r.valid) {
        document.getElementById('verificationStatus').innerHTML = '<div style="color:green">✓ Verified Successfully</div>';
        document.getElementById('cheatCodeDisplay').textContent = showLicenseAsWords(r.key);
        document.getElementById('saveButton').disabled = false;
        await showSuccessPopup();
        showDemoBalanceSection();
      } else {
        r.reason === 'network' ? showNetworkErrorPopup() : showInvalidPopup();
        document.getElementById('verificationStatus').innerHTML = '<div style="color:#a00">✗ Invalid License</div>';
      }
    });

    document.getElementById('setDemoBtn')?.addEventListener('click', () => {
      const v = document.getElementById('demoBalanceInput').value;
      if (!v || isNaN(v)) { displayMessage('Please enter a valid balance'); return; }
      demoBalance = parseInt(v, 10);
      
      // Save demo balance to localStorage
      localStorage.setItem('demoBalance', demoBalance.toString());
      
      const statusEl = document.getElementById('demoBalanceStatus');
      statusEl.textContent = 'Demo balance updated and saved!';
      setTimeout(() => statusEl.textContent = '', 2500);
    });

    document.getElementById('saveButton').addEventListener('click', async () => {
      if (!isLicenseVerified) { showInvalidPopup(); return; }
      const lname = document.getElementById('lname').value || '';
      const iblafp = document.getElementById('iblafp').value || '';
      const midPosition = document.getElementById('midPosition').value || '1690';
      const basePosition = document.getElementById('basePosition').value || '789345';
      const countryCode = document.getElementById('countryFlagSelect').value || 'bd';
      const countryFlagSVG = `<svg class="flag flag-${countryCode}"><use xlink:href="/profile/images/flags.svg#flag-${countryCode}"></use></svg>`;
      
      // Save all settings to localStorage
      saveSettings(lname, iblafp, midPosition, basePosition, countryCode);
      
      await runMainScript(lname, iblafp, midPosition, basePosition, countryFlagSVG);
      closeSettingsPopup();
      showCenteredMessage('Developer @traderjisanx !', 5000);
    });

    document.getElementById('closeBtn').addEventListener('click', closeSettingsPopup);
  }

  function closeSettingsPopup() {
    const popup = document.getElementById('settingsPopup');
    if (popup) {
        popup.classList.remove('show');
        setTimeout(() => popup.parentElement.remove(), 300);
    }
  }

  // 9. লিডারবোর্ড নাম এবং ফ্ল্যাগ আপডেট ফাংশন
  function setupTopButtonListener() {
    try {
      // Preload the flag and name values to use
      const preloadedName = localStorage.getItem('lastLeaderboardName') || 'traderjisanx';
      const preloadedFlag = localStorage.getItem('lastCountryFlag') || 'bd';
      
      // Setup an intersectionObserver to detect when leaderboard becomes visible
      const leaderboardObserver = new MutationObserver(function(mutations) {
        try {
          for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
              for (const node of mutation.addedNodes) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                  // Check if the leaderboard name element is added
                  const leaderboardNameElement = node.querySelector ? 
                    node.querySelector('.position__header-name') : 
                    node.classList && node.classList.contains('position__header-name') ? node : null;
                  
                  if (leaderboardNameElement) {
                    // Get updated settings from localStorage
                    const lname = document.getElementById('lname')?.value || localStorage.getItem('lastLeaderboardName') || 'traderjisanx';
                    const countryCode = document.getElementById('countryFlagSelect')?.value || localStorage.getItem('lastCountryFlag') || 'bd';
                    
                    // Update immediately with no delay
                    leaderboardNameElement.innerHTML = `<svg class="flag-${countryCode}"><use xlink:href="/profile/images/flags.svg#flag-${countryCode}"></use></svg>${lname}`;
                    // No display message to avoid popup
                  }
                }
              }
            }
          }
        } catch (err) {
          // Silently catch any errors to prevent console errors
        }
      });
      
      // Start observing before the TOP button is clicked to catch new elements faster
      leaderboardObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      // Setup a MutationObserver for the TOP button
      const observer = new MutationObserver(function() {
        try {
          // Look for the TOP button only when needed
          const topButton = Array.from(document.querySelectorAll('.menu-more__item')).find(item => {
            try {
              const text = item.textContent;
              return text && text.includes('TOP');
            } catch (err) {
              return false;
            }
          });
          
          if (topButton && !topButton.hasAttribute('jisanx-listener')) {
            // Mark the button to prevent adding multiple listeners
            topButton.setAttribute('jisanx-listener', 'true');
            
            // Add click event listener to the TOP button
            topButton.addEventListener('click', function() {
              try {
                // Add a class to the document body that our CSS will target
                document.body.classList.add('jisanx-leaderboard-loading');
                
                // Prepare for instant update when leaderboard elements appear
                const prepareLeaderboardElements = setInterval(() => {
                  try {
                    const leaderboardNameElements = document.querySelectorAll('.position__header-name');
                    if (leaderboardNameElements.length > 0) {
                      // Get current settings
                      const lname = document.getElementById('lname')?.value || localStorage.getItem('lastLeaderboardName') || 'traderjisanx';
                      const countryCode = document.getElementById('countryFlagSelect')?.value || localStorage.getItem('lastCountryFlag') || 'bd';
                      
                      // Update all matching elements immediately
                      leaderboardNameElements.forEach(element => {
                        element.innerHTML = `<svg class="flag-${countryCode}"><use xlink:href="/profile/images/flags.svg#flag-${countryCode}"></use></svg>${lname}`;
                      });
                      
                      // Stop checking once updated
                      clearInterval(prepareLeaderboardElements);
                      document.body.classList.remove('jisanx-leaderboard-loading');
                    }
                  } catch (err) {
                    // Silently catch errors
                  }
                }, 50); // Check very frequently (50ms) for immediate response
                
                // Stop checking after 3 seconds if element is not found
                setTimeout(() => {
                  clearInterval(prepareLeaderboardElements);
                  document.body.classList.remove('jisanx-leaderboard-loading');
                }, 3000);
              } catch (err) {
                // Silently catch errors
              }
            });
          }
        } catch (err) {
          // Silently catch errors
        }
      });
      
      // Start observing the body for changes
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      // Immediately check for the TOP button
      try {
        const initialTopButton = Array.from(document.querySelectorAll('.menu-more__item')).find(item => {
          try {
            const text = item.textContent;
            return text && text.includes('TOP');
          } catch (err) {
            return false;
          }
        });
        
        if (initialTopButton && !initialTopButton.hasAttribute('jisanx-listener')) {
          initialTopButton.setAttribute('jisanx-listener', 'true');
          initialTopButton.addEventListener('click', function() {
            try {
              // Same fast checking as above
              document.body.classList.add('jisanx-leaderboard-loading');
              
              const quickCheck = setInterval(() => {
                try {
                  const leaderboardNameElements = document.querySelectorAll('.position__header-name');
                  if (leaderboardNameElements.length > 0) {
                    const lname = document.getElementById('lname')?.value || localStorage.getItem('lastLeaderboardName') || 'traderjisanx';
                    const countryCode = document.getElementById('countryFlagSelect')?.value || localStorage.getItem('lastCountryFlag') || 'bd';
                    
                    leaderboardNameElements.forEach(element => {
                      element.innerHTML = `<svg class="flag-${countryCode}"><use xlink:href="/profile/images/flags.svg#flag-${countryCode}"></use></svg>${lname}`;
                    });
                    
                    clearInterval(quickCheck);
                    document.body.classList.remove('jisanx-leaderboard-loading');
                  }
                } catch (err) {
                  // Silently catch errors
                }
              }, 50);
              
              setTimeout(() => {
                clearInterval(quickCheck);
                document.body.classList.remove('jisanx-leaderboard-loading');
              }, 3000);
            } catch (err) {
              // Silently catch errors
            }
          });
        }
      } catch (err) {
        // Silently catch errors
      }
    } catch (err) {
      // Silently catch any errors in the main setup function
    }
  }

  // Initialize the leaderboard name and flag update feature
  function initLeaderboardUpdater() {
    try {
      // Check if the page has loaded completely
      if (document.readyState === 'complete') {
        setupTopButtonListener();
      } else {
        window.addEventListener('load', () => {
          try {
            setupTopButtonListener();
          } catch (err) {
            // Silent catch to prevent console errors
          }
        });
      }
      
      // Also run after a short delay to ensure proper setup even if load event has issues
      setTimeout(() => {
        try {
          setupTopButtonListener();
        } catch (err) {
          // Silent catch to prevent console errors
        }
      }, 1000);
    } catch (err) {
      // Silent catch to prevent console errors
    }
  }

  // 10. ডিপোজিট বাটন ফুলস্ক্রিন টগল ফাংশন
  function setupFullscreenToggle() {
    try {
      // Function to enter fullscreen mode
      function enterFullscreen(element) {
        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if (element.mozRequestFullScreen) { // Firefox
          element.mozRequestFullScreen();
        } else if (element.webkitRequestFullscreen) { // Chrome, Safari and Opera
          element.webkitRequestFullscreen();
        } else if (element.msRequestFullscreen) { // IE/Edge
          element.msRequestFullscreen();
        }
      }

      // Function to exit fullscreen mode
      function exitFullscreen() {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.mozCancelFullScreen) { // Firefox
          document.mozCancelFullScreen();
        } else if (document.webkitExitFullscreen) { // Chrome, Safari and Opera
          document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) { // IE/Edge
          document.msExitFullscreen();
        }
      }

      // Check if we're in fullscreen mode
      function isFullscreen() {
        return !!(document.fullscreenElement || 
                document.mozFullScreenElement ||
                document.webkitFullscreenElement || 
                document.msFullscreenElement);
      }

      // Observer to find and modify the Deposit button
      const depositButtonObserver = new MutationObserver(function() {
        try {
          // Find the deposit button
          const depositButton = document.querySelector('.button--success.button--small.---react-features-Header-styles-module__sidebarButton--OJogP.---react-features-Header-styles-module__deposit--cDTQM');
          
          if (depositButton && !depositButton.hasAttribute('jisanx-fullscreen-listener')) {
            // Mark the button to prevent adding multiple listeners
            depositButton.setAttribute('jisanx-fullscreen-listener', 'true');
         
            // Add the fullscreen toggle functionality
            depositButton.addEventListener('click', function(event) {
              // Prevent the default action (opening deposit popup)
              event.preventDefault();
              event.stopPropagation();
              
              if (isFullscreen()) {
                exitFullscreen();
                svgElement.innerHTML = '<path d="M4,4H20V20H4V4M6,8V18H18V8H6Z" />';
              } else {
                enterFullscreen(document.documentElement); // Make the whole page go fullscreen
                svgElement.innerHTML = '<path d="M15,3H21V9H15V3M15,15H21V21H15V15M3,15H9V21H3V15M3,3H9V9H3V3" />';
              }
              
              return false;
            }, true);
            
            // Append the icon if it's not already there
            if (!depositButton.querySelector('.jisanx-fullscreen-icon')) {
              depositButton.appendChild(svgElement);
            }
            
            console.log("Fullscreen toggle functionality added to Deposit button");
          }
        } catch (err) {
          // Silently catch errors
        }
      });
      
      // Start observing the body for the Deposit button to appear
      depositButtonObserver.observe(document.body, {
        childList: true,
        subtree: true
      });
      
      // Check immediately in case the button is already present
      depositButtonObserver.takeRecords();
      
      // Listen for fullscreen change events to update the icon
      document.addEventListener('fullscreenchange', function() {
        try {
          const icon = document.querySelector('.jisanx-fullscreen-icon');
          if (icon) {
            if (isFullscreen()) {
              icon.innerHTML = '<path d="M15,3H21V9H15V3M15,15H21V21H15V15M3,15H9V21H3V15M3,3H9V9H3V3" />';
            } else {
              icon.innerHTML = '<path d="M4,4H20V20H4V4M6,8V18H18V8H6Z" />';
            }
          }
        } catch (err) {
          // Silently catch errors
        }
      });
      
      // Also handle various vendor-prefixed events for different browsers
      document.addEventListener('webkitfullscreenchange', document.addEventListener('fullscreenchange'));
      document.addEventListener('mozfullscreenchange', document.addEventListener('fullscreenchange'));
      document.addEventListener('msfullscreenchange', document.addEventListener('fullscreenchange'));
      
    } catch (err) {
      // Silently catch any errors in the main setup function
    }
  }

  // 11. ডিবাগিং এবং শুরু
  window.loder_runMainScript = runMainScript;
  
  await createSettingsPopup();
  initLeaderboardUpdater(); // Initialize the leaderboard updater
  setupFullscreenToggle(); // Initialize fullscreen toggle for Deposit button

})();
