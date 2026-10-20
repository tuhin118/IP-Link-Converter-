let currentMode = 'domainToIp';

function switchTab(mode, event) {
    currentMode = mode;
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    
    // event.target ব্যবহার না করে সরাসরি বাটনটিকে অ্যাক্টিভ করা
    if (event && event.target) {
        event.target.classList.add('active');
    }
    
    // UI Reset
    document.getElementById('resultBox').classList.add('hidden');
    document.getElementById('errorBox').classList.add('hidden');
    document.getElementById('targetInput').value = ''; // ইনপুট বক্স খালি করা
    
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
            // IP কে রিভার্স করে .in-addr.arpa ফরম্যাটে রূপান্তর
            const reversedIp = input.split('.').reverse().join('.') + '.in-addr.arpa';
            apiUrl = `https://dns.google/resolve?name=${reversedIp}&type=PTR`;
        }

        const response = await fetch(apiUrl);
        const data = await response.json();

        loading.classList.add('hidden'); // Hide loading

        if (data.Answer && data.Answer.length > 0) {
            let finalResult = data.Answer[0].data;
            
            // রেজাল্ট প্রসেসিং
            if (currentMode === 'ipToDomain') {
                // PTR রেকর্ডের শেষে সাধারণত একটি ডট থাকে, সেটি সরানো
                finalResult = finalResult.replace(/\.$/, ''); 
                // লিংকের মতো দেখানোর জন্য https:// যোগ করা
                finalResult = `https://${finalResult}`;
            }
            
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

// কপি করার ফাংশন
function copyResult() {
    const textToCopy = document.getElementById('resultText').innerText;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        const copyBtn = document.getElementById('copyBtn');
        const originalText = copyBtn.innerText;
        
        // বাটনের লেখা সাময়িকভাবে পরিবর্তন করা
        copyBtn.innerText = "[ COPIED! ]";
        copyBtn.style.backgroundColor = "var(--main-green)";
        copyBtn.style.color = "var(--bg-color)";
        
        setTimeout(() => {
            copyBtn.innerText = originalText;
            copyBtn.style.backgroundColor = "transparent";
            copyBtn.style.color = "var(--main-green)";
        }, 2000);
    }).catch(err => {
        alert("Failed to copy: " + err);
    });
}
