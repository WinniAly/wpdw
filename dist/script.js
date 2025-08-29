// Global variables
let messages = [];
let currentUser = 'User' + Math.floor(Math.random() * 1000);
let onlineUsers = 1;

// DOM elements
const page1 = document.getElementById('page1');
const page2 = document.getElementById('page2');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const backBtn = document.getElementById('backBtn');
const charCount = document.getElementById('charCount');
const messagesDisplay = document.getElementById('messagesDisplay');
const userCount = document.getElementById('userCount');
const flyingNeedle = document.getElementById('flyingNeedle');
const centerEffect = document.getElementById('centerEffect');
const backgroundVideo = document.getElementById('backgroundVideo');
const minimizeBtn = document.getElementById('minimizeBtn');
const messagesContainer = document.querySelector('.messages-container');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing app...');
    console.log('Message input element:', messageInput);
    initializeApp();
    loadMessages();
    updateOnlineUsers();
    initializeMedia();

    // Test input functionality
    if (messageInput) {
        messageInput.focus();
        console.log('Input focused successfully');
    }
});

function initializeApp() {
    // Character counter


    // // Enter key to send (Ctrl+Enter for new line)
    // messageInput.addEventListener('keydown', function(e) {
    //     if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey) {
    //         e.preventDefault();
    //         handleSendMessage();
    //     }
    // });

    // Back button handler
    backBtn.addEventListener('click', goBackToInput);

    // Minimize button handler
    if (minimizeBtn) {
        minimizeBtn.addEventListener('click', toggleMinimize);
    }

    // Create ripple effect on button click
    sendBtn.addEventListener('click', createRipple);

    // Simulate other users joining/leaving
    setInterval(simulateUserActivity, 10000);

    // Load messages from localStorage
    const savedMessages = localStorage.getItem('messageThread');
    if (savedMessages) {
        messages = JSON.parse(savedMessages);
        displayMessages();
    } else {
        showEmptyState();
    }
}



function createRipple(e) {
    const button = e.currentTarget;
    const ripple = button.querySelector('.ripple');
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    // Remove previous animation
    ripple.style.animation = 'none';
    ripple.offsetHeight; // Trigger reflow
    ripple.style.animation = 'ripple-animation 0.6s linear';
}

function handleSendMessage() {
    const messageText = messageInput.value.trim();

    if (messageText === '' || messageText.length > 500) {
        return;
    }

    // Disable send button temporarily
    sendBtn.disabled = true;

    // Create message object
    const message = {
        id: Date.now(),
        content: messageText,
        user: currentUser,
        timestamp: new Date().toISOString(),
        isNew: true
    };

    // Add message to array
    messages.push(message);

    // Save to localStorage
    localStorage.setItem('messageThread', JSON.stringify(messages));

    // Start flying needle animation
    startFlyingNeedleAnimation();

    // Clear input
    messageInput.value = '';
    updateCharCount();

    // Switch to page 2 after animation
    setTimeout(() => {
        switchToPage2();
        sendBtn.disabled = false;
    }, 1500);

    // Simulate message broadcast to other users
    simulateMessageBroadcast(message);
}

function startFlyingNeedleAnimation() {
    console.log('Starting flying needle animation');
    const needleImage = document.querySelector('.needle-image');
    const threadPath = document.getElementById('threadPath');

    console.log('Needle image element:', needleImage);
    console.log('Thread path element:', threadPath);

    if (!needleImage || !threadPath) {
        console.error('Elements not found!');
        return;
    }

    // 针线从屏幕左侧中央开始
    const startX = -150; // 从屏幕左侧开始
    const startY = window.innerHeight / 2; // 屏幕中央高度

    console.log(`Starting position: ${startX}, ${startY}`);

    // 设置针的起始位置
    needleImage.style.left = (startX - 75) + 'px'; // 减去一半宽度居中
    needleImage.style.top = startY + 'px';
    needleImage.style.display = 'block';
    needleImage.style.position = 'absolute';

    // 显示针线动画容器
    flyingNeedle.classList.add('animate');
    console.log('Animation container activated');

    // 创建连续的线条路径
    let pathData = `M ${startX} ${startY}`;
    let currentStep = 0;
    const totalSteps = 100;

    // 创建真正平滑的波浪路径
    const createSmoothWavePath = () => {
        const totalWidth = window.innerWidth - startX + 200;
        const amplitude = window.innerHeight * 0.08; // 波浪幅度
        const frequency = 1.5; // 波浪频率

        let path = `M ${startX} ${startY}`;

        // 使用三次贝塞尔曲线创建完全平滑的波浪
        const segments = 20; // 减少段数，每段用贝塞尔曲线

        for (let i = 1; i <= segments; i++) {
            const progress = i / segments;
            const prevProgress = (i - 1) / segments;

            // 当前点
            const currentX = startX + totalWidth * progress;
            const currentWaveOffset = Math.sin(progress * frequency * Math.PI * 2) * amplitude;
            const currentY = startY + currentWaveOffset;

            // 前一个点
            const prevX = startX + totalWidth * prevProgress;
            const prevWaveOffset = Math.sin(prevProgress * frequency * Math.PI * 2) * amplitude;
            const prevY = startY + prevWaveOffset;

            // 计算控制点以创建平滑的三次贝塞尔曲线
            const cp1Progress = prevProgress + (progress - prevProgress) * 0.33;
            const cp2Progress = prevProgress + (progress - prevProgress) * 0.66;

            const cp1X = startX + totalWidth * cp1Progress;
            const cp1WaveOffset = Math.sin(cp1Progress * frequency * Math.PI * 2) * amplitude;
            const cp1Y = startY + cp1WaveOffset;

            const cp2X = startX + totalWidth * cp2Progress;
            const cp2WaveOffset = Math.sin(cp2Progress * frequency * Math.PI * 2) * amplitude;
            const cp2Y = startY + cp2WaveOffset;

            // 使用三次贝塞尔曲线
            path += ` C ${cp1X} ${cp1Y} ${cp2X} ${cp2Y} ${currentX} ${currentY}`;
        }

        console.log('Generated path:', path);
        return path;
    };

    // 生成完整的波浪路径
    const fullWavePath = createSmoothWavePath();

    // 先设置完整路径，然后初始化为不可见
    threadPath.setAttribute('d', fullWavePath);
    threadPath.setAttribute('stroke', '#ffffff');
    threadPath.setAttribute('stroke-width', '6');
    threadPath.setAttribute('fill', 'none');
    threadPath.setAttribute('opacity', '1');
    threadPath.style.stroke = '#ffffff';
    threadPath.style.strokeWidth = '6px';
    threadPath.style.fill = 'none';
    threadPath.style.opacity = '1';

    console.log('Thread path configured:', threadPath);
    console.log('Path stroke color:', threadPath.getAttribute('stroke'));

    const pathLength = threadPath.getTotalLength();
    threadPath.style.strokeDasharray = `0 ${pathLength}`;

    console.log('Path length:', pathLength);

    // 绘制线条动画
    const drawThread = () => {
        if (currentStep <= totalSteps) {
            const progress = currentStep / totalSteps;

            // 计算当前针的位置（与路径生成使用相同参数）
            const totalWidth = window.innerWidth - startX + 200;
            const amplitude = window.innerHeight * 0.08;
            const frequency = 1.5;

            const currentX = startX + totalWidth * progress;
            const waveOffset = Math.sin(progress * frequency * Math.PI * 2) * amplitude;
            const currentY = startY + waveOffset;

            // 移动针到当前位置
            needleImage.style.left = (currentX - 75) + 'px'; // 减去一半宽度居中
            needleImage.style.top = (currentY - 75) + 'px'; // 减去一半高度居中

            // 计算针的旋转角度
            if (currentStep > 0) {
                const prevProgress = (currentStep - 1) / totalSteps;
                const prevX = startX + totalWidth * prevProgress;
                const prevWaveOffset = Math.sin(prevProgress * frequency * Math.PI * 2) * amplitude;
                const prevY = startY + prevWaveOffset;

                const angle = Math.atan2(currentY - prevY, currentX - prevX) * (180 / Math.PI);
                needleImage.style.transform = `rotate(${angle}deg)`;
            }

            // 逐步显示路径
            const visibleLength = pathLength * progress;
            threadPath.style.strokeDasharray = `${visibleLength} ${pathLength}`;

            currentStep++;
            requestAnimationFrame(drawThread);
        } else {
            // 动画完成后的处理
            setTimeout(() => {
                switchToPage2();
            }, 500);
        }
    };

    // 开始绘制线条
    requestAnimationFrame(drawThread);

    console.log('Needle animation started');
    console.log('Thread path element:', threadPath);
    console.log('Thread path attributes:', {
        d: threadPath.getAttribute('d'),
        stroke: threadPath.getAttribute('stroke'),
        strokeWidth: threadPath.getAttribute('stroke-width'),
        opacity: threadPath.getAttribute('opacity')
    });
}

// 插值函数已不再需要，直接使用数学函数计算位置

function switchToPage2() {
    // 清理针线动画
    flyingNeedle.classList.remove('animate');
    const threadPath = document.getElementById('threadPath');
    if (threadPath) {
        threadPath.setAttribute('d', '');
    }

    page1.classList.remove('active');
    page1.classList.add('fade-out');

    setTimeout(() => {
        page1.style.display = 'none';
        page1.classList.remove('fade-out');
        page2.classList.add('active');
        displayMessages();
        scrollToBottom();

        // Start video playback when entering page 2
        if (backgroundVideo) {
            backgroundVideo.play().catch(function(error) {
                console.warn('Failed to resume video playback:', error);
            });
        }
    }, 500);
}

// 已加入
function goBackToInput() {
    // Pause video when leaving page 2
    if (backgroundVideo) {
        backgroundVideo.pause();
    }

    page2.classList.remove('active');
    page1.style.display = 'flex';

    setTimeout(() => {
        page1.classList.add('active');
        messageInput.focus();
    }, 100);
}

// Toggle minimize function
function toggleMinimize() {
    if (messagesContainer) {
        messagesContainer.classList.toggle('minimized');

        // Update minimize button icon
        const isMinimized = messagesContainer.classList.contains('minimized');
        const minimizeIcon = minimizeBtn.querySelector('svg path');

        if (isMinimized) {
            // Change to expand icon (chevron up)
            minimizeIcon.setAttribute('d', 'M18 15L12 9L6 15');
        } else {
            // Change back to minimize icon (line)
            minimizeIcon.setAttribute('d', 'M6 12L18 12');
        }
    }
}

function displayMessages() {
    if (messages.length === 0) {
        showEmptyState();
        return;
    }

    messagesDisplay.innerHTML = '';

    messages.forEach((message, index) => {
        const messageElement = createMessageElement(message);
        messagesDisplay.appendChild(messageElement);

        // Add stagger animation for initial load
        if (message.isNew) {
            setTimeout(() => {
                messageElement.classList.add('new');
                message.isNew = false;
            }, index * 100);
        }
    });
}

function createMessageElement(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-item';
    messageDiv.dataset.messageId = message.id;

    const date = new Date(message.timestamp);
    const timeString = date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    const dateString = date.toLocaleDateString();

    messageDiv.innerHTML = `
        <div class="message-content">${escapeHtml(message.content)}</div>
        <div class="message-meta">
            <span class="message-user">${escapeHtml(message.user)}</span>
            <span class="message-time">${timeString} • ${dateString}</span>
        </div>
    `;

    return messageDiv;
}

function showEmptyState() {
    messagesDisplay.innerHTML = `
        <div class="empty-state">
            <p>No messages yet. Be the first to share something!</p>
        </div>
    `;
}

function scrollToBottom() {
    setTimeout(() => {
        messagesDisplay.scrollTop = messagesDisplay.scrollHeight;
    }, 100);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Simulate real-time features
function simulateMessageBroadcast(message) {
    // In a real application, this would use WebSockets or Server-Sent Events
    // Auto-reply functionality has been disabled per user request
    console.log('Message broadcast simulated (auto-reply disabled):', message.content);
}

// Auto-reply function removed per user request

function simulateUserActivity() {
    // Randomly change online user count
    const change = Math.random() < 0.5 ? -1 : 1;
    onlineUsers = Math.max(1, onlineUsers + change);
    onlineUsers = Math.min(10, onlineUsers); // Cap at 10 users
    updateOnlineUsers();
}

function updateOnlineUsers() {
    const plural = onlineUsers === 1 ? 'user' : 'users';
    userCount.textContent = `${onlineUsers} ${plural} online`;
}

function loadMessages() {
    // Simulate loading messages from server
    // In a real app, this would be an API call
    const savedMessages = localStorage.getItem('messageThread');
    if (savedMessages) {
        messages = JSON.parse(savedMessages);
    }
}

// Handle page visibility changes (for real-time updates)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && page2.classList.contains('active')) {
        // Refresh messages when page becomes visible
        loadMessages();
        displayMessages();
        scrollToBottom();
    }
});

// Handle window resize for responsive design
window.addEventListener('resize', function() {
    if (page2.classList.contains('active')) {
        scrollToBottom();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Escape key to go back to input page
    if (e.key === 'Escape' && page2.classList.contains('active')) {
        goBackToInput();
    }

    // Ctrl/Cmd + Enter to send message
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && page1.classList.contains('active')) {
        handleSendMessage();
    }
});

// Initialize media elements
function initializeMedia() {
    // Handle background video
    if (backgroundVideo) {
        // Enable sound and ensure video plays
        backgroundVideo.muted = false;
        backgroundVideo.playsInline = true;
        backgroundVideo.volume = 0.7; // Set volume to 70%

        // Handle video load errors
        backgroundVideo.addEventListener('error', function(e) {
            console.warn('Background video failed to load:', e);
            // Fallback to gradient background if video fails
            const videoContainer = document.querySelector('.background-video');
            if (videoContainer) {
                videoContainer.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            }
        });

        // Ensure video starts playing with sound
        backgroundVideo.addEventListener('loadeddata', function() {
            // Try to play with sound first
            backgroundVideo.play().catch(function(error) {
                console.warn('Video autoplay with sound was prevented, trying muted:', error);
                // If autoplay with sound fails, try muted first then unmute
                backgroundVideo.muted = true;
                backgroundVideo.play().then(function() {
                    // Unmute after a short delay
                    setTimeout(function() {
                        backgroundVideo.muted = false;
                    }, 1000);
                }).catch(function(error) {
                    console.warn('Video autoplay completely failed:', error);
                });
            });
        });

        // Add click listener to unmute if needed
        backgroundVideo.addEventListener('click', function() {
            if (backgroundVideo.muted) {
                backgroundVideo.muted = false;
                console.log('Video unmuted by user interaction');
            }
        });
    }

    // Handle background image
    const backgroundImage = document.querySelector('.background-image img');
    if (backgroundImage) {
        backgroundImage.addEventListener('error', function() {
            console.warn('Background image failed to load');
            // Fallback to gradient background if image fails
            const imageContainer = document.querySelector('.background-image');
            if (imageContainer) {
                imageContainer.style.background = 'linear-gradient(135deg, #f8f8f8 0%, #e8e8e8 100%)';
            }
        });
    }
}

// Add some initial demo messages if none exist
if (messages.length === 0) {
    const demoMessages = [
        {
            id: Date.now() - 3600000,
            content: "Welcome to the message thread! This is where all shared thoughts and stories appear.",
            user: "System",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            isNew: false
        }
    ];

    // Only add demo messages if no saved messages exist
    const savedMessages = localStorage.getItem('messageThread');
    if (!savedMessages) {
        messages = demoMessages;
        localStorage.setItem('messageThread', JSON.stringify(messages));
    }
}
