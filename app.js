let currentMode = 'domainToIp';

function switchTab(mode) {
    currentMode = mode;
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    // UI Reset
    document.getElementById('resultBox').classList.add('hidden');
    document.getElementById('errorBox').classList.add('hidden');
    
    if(mode === 'domainToIp') {
        document.getElementById('targetInput').placeholder = "Enter Domain (e.g., google.com)";
    } else {
        document.getElementById('targetInput').placeholder = "Enter IP (e.g., 8.8.8.8)";
    }
}

async function startScan() {
    const input = document.getElementById('targetInput').value.trim();
    const loading = document.getElementById('loading');
    const resultBox = document.getElementById('resultBox');
    const errorBox = document.getElementById('errorBox');
    const resultText = document.getElementById('resultText');
    const errorText = document.getElementById('errorText');

    if (!input) {
        alert("Please enter a target!");
        return;
    }

    // Offline Check
    if (!navigator.onLine) {
        resultBox.classList.add('hidden');
        errorBox.classList.remove('hidden');
        errorText.innerText = "⚠️ SYSTEM OFFLINE: Internet Connection Required for DNS Scan.";
        return;
    }

    // Show Loading Animation
    resultBox.classList.add('hidden');
    errorBox.classList.add('hidden');
    loading.classList.remove('hidden');

    try {
        let apiUrl = '';
        if (currentMode === 'domainToIp') {
            apiUrl = `https://dns.google/resolve?name=${input}&type=A`;
        } else {
            apiUrl = `https://dns.google/resolve?name=${input}&type=PTR`;
        }

        const response = await fetch(apiUrl);
        const data = await response.json();

        loading.classList.add('hidden'); // Hide loading

        if (data.Answer && data.Answer.length > 0) {
            // Extract IP or Domain based on mode
            let finalResult = data.Answer[0].data;
            resultText.innerText = finalResult;
            resultBox.classList.remove('hidden');
        } else {
            errorBox.classList.remove('hidden');
            errorText.innerText = "❌ SCAN FAILED: No record found for this target.";
        }

    } catch (error) {
        loading.classList.add('hidden');
        errorBox.classList.remove('hidden');
        errorText.innerText = "❌ ERROR: Failed to connect to DNS Server.";
    }
}
