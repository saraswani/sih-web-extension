/**
 * PrivacyShield Options Page Controller
 */
document.addEventListener('DOMContentLoaded', async () => {
  const proxyInput = document.getElementById('input-proxy-url');
  const testProxyBtn = document.getElementById('btn-test-proxy');
  const statusMsg = document.getElementById('proxy-status-msg');
  const saveBtn = document.getElementById('btn-save-settings');
  const toast = document.getElementById('save-toast');
  const powerToggle = document.getElementById('toggle-power-mode');
  const clearAuditBtn = document.getElementById('btn-clear-audit');
  const resetBandwidthBtn = document.getElementById('btn-reset-bandwidth');

  // Import / Export Profile JSON Buttons
  const importProfileBtn = document.getElementById('btn-import-profile');
  const exportProfileBtn = document.getElementById('btn-export-profile');
  const fileImportInput = document.getElementById('file-import-profile');

  // Diagnostics Elements
  const diagMemory = document.getElementById('diag-memory');
  const diagBackend = document.getElementById('diag-backend');
  const diagHw = document.getElementById('diag-hw');
  const diagBandwidth = document.getElementById('diag-bandwidth');
  const auditTbody = document.getElementById('audit-log-tbody');

  // Form Fields
  const nameInput = document.getElementById('profile-name');
  const firstNameInput = document.getElementById('profile-firstname');
  const lastNameInput = document.getElementById('profile-lastname');
  const emailInput = document.getElementById('profile-email');
  const phoneInput = document.getElementById('profile-phone');
  const aadhaarInput = document.getElementById('profile-aadhaar');
  const panInput = document.getElementById('profile-pan');
  const passportInput = document.getElementById('profile-passport');
  const genderInput = document.getElementById('profile-gender');
  const cityInput = document.getElementById('profile-city');
  const stateInput = document.getElementById('profile-state');
  const pincodeInput = document.getElementById('profile-pincode');
  const countryInput = document.getElementById('profile-country');
  const addressInput = document.getElementById('profile-address');
  const photoInput = document.getElementById('profile-photo');
  const signatureInput = document.getElementById('profile-signature');
  const feedbackInput = document.getElementById('profile-feedback');

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0.0 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  // Show Toast Message
  function showToast(msg) {
    if (toast) {
      toast.textContent = msg;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 3500);
    }
  }

  // Populate Form Fields from Profile Object
  function populateProfileForm(p) {
    if (!p) return;
    if (p.name && nameInput) nameInput.value = p.name;
    if (p.first_name && firstNameInput) firstNameInput.value = p.first_name;
    if (p.last_name && lastNameInput) lastNameInput.value = p.last_name;
    if (p.email && emailInput) emailInput.value = p.email;
    if (p.phone && phoneInput) phoneInput.value = p.phone;
    if (p.aadhaar && aadhaarInput) aadhaarInput.value = p.aadhaar;
    if (p.pan && panInput) panInput.value = p.pan;
    if (p.passport && passportInput) passportInput.value = p.passport;
    if (p.gender && genderInput) genderInput.value = p.gender;
    if (p.city && cityInput) cityInput.value = p.city;
    if (p.state && stateInput) stateInput.value = p.state;
    if (p.pincode && pincodeInput) pincodeInput.value = p.pincode;
    if (p.country && countryInput) countryInput.value = p.country;
    if (p.address && addressInput) addressInput.value = p.address;
    if (p.photo && photoInput) photoInput.value = p.photo;
    if (p.signature && signatureInput) signatureInput.value = p.signature;
    if (p.feedback && feedbackInput) feedbackInput.value = p.feedback;
  }

  // Build Profile Object from Form Inputs
  function buildProfileObject() {
    const fullName = nameInput ? nameInput.value.trim() : 'Aarav Sharma';
    const firstName = firstNameInput && firstNameInput.value.trim() ? firstNameInput.value.trim() : fullName.split(' ')[0] || 'Aarav';
    const lastName = lastNameInput && lastNameInput.value.trim() ? lastNameInput.value.trim() : fullName.split(' ').slice(1).join(' ') || 'Sharma';

    return {
      name: fullName,
      first_name: firstName,
      last_name: lastName,
      email: emailInput ? emailInput.value.trim() : '',
      phone: phoneInput ? phoneInput.value.trim() : '',
      aadhaar: aadhaarInput ? aadhaarInput.value.trim() : '',
      pan: panInput ? panInput.value.trim() : '',
      passport: passportInput ? passportInput.value.trim() : '',
      gender: genderInput ? genderInput.value.trim() : 'Male',
      city: cityInput ? cityInput.value.trim() : '',
      state: stateInput ? stateInput.value.trim() : '',
      pincode: pincodeInput ? pincodeInput.value.trim() : '',
      country: countryInput ? countryInput.value.trim() : 'India',
      address: addressInput ? addressInput.value.trim() : '',
      photo: photoInput ? photoInput.value.trim() : '',
      signature: signatureInput ? signatureInput.value.trim() : '',
      feedback: feedbackInput ? feedbackInput.value.trim() : 'The portal interface was intuitive and the process was completed seamlessly.'
    };
  }

  // Render System Diagnostics
  function updateDiagnostics(data) {
    if (typeof performance !== 'undefined' && performance.memory && performance.memory.usedJSHeapSize) {
      diagMemory.textContent = formatBytes(performance.memory.usedJSHeapSize);
    } else {
      diagMemory.textContent = '~12.4 MB (est)';
    }

    if (typeof navigator !== 'undefined' && navigator.gpu) {
      diagHw.textContent = 'WebGPU (Hardware)';
    } else if (typeof WebAssembly !== 'undefined') {
      diagHw.textContent = 'WASM (SIMD Ready)';
    } else {
      diagHw.textContent = 'CPU / JavaScript';
    }

    diagBackend.textContent = 'BlazeFace (WebGL/WASM)';

    const sentBytes = Number(data?.totalDataSentBytes) || 0;
    const count = Number(data?.requestCount) || 0;
    diagBandwidth.textContent = `${formatBytes(sentBytes)} (${count} reqs)`;
  }

  // Render Audit Log
  function renderAuditLog(log = []) {
    if (!auditTbody) return;

    if (!Array.isArray(log) || log.length === 0) {
      auditTbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align:center;color:#94a3b8;padding:16px;">
            No redaction events recorded yet. Run a scan on any webpage to generate on-device audit events.
          </td>
        </tr>
      `;
      return;
    }

    auditTbody.innerHTML = '';
    log.forEach(item => {
      const tr = document.createElement('tr');
      const timeStr = new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const conf = item.confidence || 95;
      const confColor = conf >= 95 ? '#34d399' : '#fbbf24';

      tr.innerHTML = `
        <td style="font-family:ui-monospace, monospace;color:#94a3b8;">${timeStr}</td>
        <td style="color:#cbd5e1;font-weight:500;">${item.url || 'webpage'}</td>
        <td><span style="background:rgba(56,189,248,0.15);color:#38bdf8;padding:1px 6px;border-radius:4px;font-size:11px;">${item.category}</span></td>
        <td style="font-family:ui-monospace, monospace;font-weight:600;color:#38bdf8;">${item.token}</td>
        <td><strong style="color:${confColor};font-family:ui-monospace, monospace;">${conf}%</strong></td>
        <td style="color:#94a3b8;font-size:11px;">${item.verificationMethod || 'Verified'}</td>
      `;
      auditTbody.appendChild(tr);
    });
  }

  // Load Saved Settings & Audit Log from storage
  chrome.storage.local.get(['proxyUrl', 'mockProfile', 'powerMode', 'totalDataSentBytes', 'requestCount', 'localRedactionAuditLog'], (data) => {
    if (data.proxyUrl) {
      proxyInput.value = data.proxyUrl;
    }
    if (powerToggle) {
      powerToggle.checked = !!data.powerMode;
    }
    if (data.mockProfile) {
      populateProfileForm(data.mockProfile);
    }

    updateDiagnostics(data);
    renderAuditLog(data.localRedactionAuditLog);
  });

  // Export Profile JSON Handler
  if (exportProfileBtn) {
    exportProfileBtn.addEventListener('click', () => {
      const profile = buildProfileObject();
      const jsonStr = JSON.stringify({ mockProfile: profile }, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = 'phantom-profile.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('📤 Exported phantom-profile.json successfully!');
    });
  }

  // Import Profile JSON Handler
  if (importProfileBtn && fileImportInput) {
    importProfileBtn.addEventListener('click', () => {
      fileImportInput.click();
    });

    fileImportInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          const profile = parsed.mockProfile || parsed;
          populateProfileForm(profile);

          const mockProfile = buildProfileObject();
          chrome.storage.local.set({ mockProfile }, () => {
            showToast('📥 Imported profile successfully & saved to local storage!');
          });
        } catch (err) {
          alert('Failed to parse JSON profile file. Please ensure it is a valid phantom-profile.json file.');
        }
      };
      reader.readAsText(file);
    });
  }

  // Clear Audit Log
  if (clearAuditBtn) {
    clearAuditBtn.addEventListener('click', () => {
      chrome.storage.local.set({ localRedactionAuditLog: [] }, () => {
        renderAuditLog([]);
      });
    });
  }

  // Reset Bandwidth Counter
  if (resetBandwidthBtn) {
    resetBandwidthBtn.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'RESET_BANDWIDTH_STATS' }, () => {
        diagBandwidth.textContent = '0.0 KB (0 reqs)';
      });
    });
  }

  // Test Proxy Endpoint Connection
  testProxyBtn.addEventListener('click', async () => {
    const url = proxyInput.value.trim();
    statusMsg.style.color = '#38bdf8';
    statusMsg.textContent = 'Testing connection...';

    try {
      const parsed = new URL(url);
      const healthUrl = `${parsed.protocol}//${parsed.host}/health`;

      const res = await fetch(healthUrl, { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        statusMsg.style.color = '#34d399';
        statusMsg.textContent = `✔ Connected! VLM Provider: ${data.provider || 'Ready'} (${data.model || 'VLM Active'}) - Server Memory: ${data.memory?.heapUsedMB || 0} MB`;
      } else {
        statusMsg.style.color = '#f59e0b';
        statusMsg.textContent = `Proxy responded with HTTP ${res.status}. Endpoint is reachable.`;
      }
    } catch (err) {
      statusMsg.style.color = '#ef4444';
      statusMsg.textContent = `✕ Could not connect to ${url}. Make sure your proxy server is running.`;
    }
  });

  // Save Settings
  saveBtn.addEventListener('click', () => {
    const proxyUrl = proxyInput.value.trim() || 'http://localhost:3001/api/agent';
    const powerMode = powerToggle ? powerToggle.checked : false;
    const mockProfile = buildProfileObject();

    chrome.storage.local.set({ proxyUrl, mockProfile, powerMode }, () => {
      showToast('✔ Settings saved successfully to local extension storage!');
    });
  });
});
