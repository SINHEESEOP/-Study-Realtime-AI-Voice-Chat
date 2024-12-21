let recognition;
let isListening = false;
let synthesis = window.speechSynthesis;
let transcriptBuffer = '';
let isProcessing = false;
let silenceTimer = null;
let isAISpeaking = false; // AI가 말하고 있는지 추적

// WebSocket 연결 설정
let socket = new WebSocket('ws://localhost:8000/ws');
let isConnected = false;

socket.onopen = () => {
    console.log('WebSocket 연결됨');
    isConnected = true;
};

socket.onclose = () => {
    console.log('WebSocket 연결 끊김');
    isConnected = false;
};

socket.onerror = (error) => {
    console.error('WebSocket 에러:', error);
    isConnected = false;
};

socket.onmessage = async (event) => {
    const response = JSON.parse(event.data);
    
    if (response.type === 'ai_response') {
        console.log('AI 응답:', response.content);
        addMessage(response.content, 'ai-message');
        await speakText(response.content);
    } else if (response.type === 'error') {
        console.error('서버 에러:', response.content);
        status.textContent = '에러 발생: ' + response.content;
    }
};

// 브라우저 음성 인식 API 지원 확인
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ko-KR';
} else {
    alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
}

// DOM 요소
const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const status = document.getElementById('status');
const chatMessages = document.getElementById('chat-messages');

// 음성 인식 시작
startButton.addEventListener('click', () => {
    if (!isListening) {
        transcriptBuffer = '';
        isProcessing = false;
        isAISpeaking = false;
        if (silenceTimer) {
            clearTimeout(silenceTimer);
            silenceTimer = null;
        }
        recognition.start();
        isListening = true;
        startButton.disabled = true;
        stopButton.disabled = false;
        status.textContent = '듣는 중...';
    }
});

// 음성 인식 중지
stopButton.addEventListener('click', () => {
    if (isListening) {
        recognition.stop();
        isListening = false;
        startButton.disabled = false;
        stopButton.disabled = true;
        status.textContent = '준비됨';
        
        if (silenceTimer) {
            clearTimeout(silenceTimer);
            silenceTimer = null;
        }
    }
});

// AI 응답을 음성으로 변환
function speakText(text) {
    return new Promise((resolve) => {
        console.log('음성 출력 시작:', text);
        synthesis.cancel();
        isAISpeaking = true;

        const sentences = text.split(/[.!?。]/g).filter(sentence => sentence.trim().length > 0);
        let currentIndex = 0;

        function speakNextSentence() {
            if (!isAISpeaking || currentIndex >= sentences.length) {
                isAISpeaking = false;
                resolve();
                return;
            }

            const utterance = new SpeechSynthesisUtterance(sentences[currentIndex] + '.');
            utterance.lang = 'ko-KR';
            utterance.pitch = 1;
            utterance.rate = 1.2;
            utterance.volume = 1;

            utterance.onstart = () => {
                if (currentIndex === 0) {
                    console.log('음성 재생 시작');
                    status.textContent = 'AI 응답 재생 중...';
                }
            };

            utterance.onend = () => {
                if (!isAISpeaking) {
                    resolve();
                    return;
                }
                
                currentIndex++;
                if (currentIndex >= sentences.length) {
                    console.log('음성 재생 종료');
                    status.textContent = '듣는 중...';
                    isAISpeaking = false;
                    resolve();
                } else {
                    speakNextSentence();
                }
            };

            utterance.onerror = (event) => {
                console.error('음성 재생 에러:', event);
                status.textContent = '음성 재생 에러';
                isAISpeaking = false;
                resolve();
            };

            synthesis.speak(utterance);
        }

        speakNextSentence();
    });
}

// 음성 인식 결과 처리
recognition.onresult = async (event) => {
    const results = event.results;
    const result = results[results.length - 1];
    const transcript = result[0].transcript;

    // AI가 말하고 있을 때 사용자 음성이 감지되면 AI 음성 중단
    if (isAISpeaking) {
        console.log('사용자 음성 감지, AI 응답 중단');
        synthesis.cancel();
        isAISpeaking = false;
        status.textContent = '새로운 입력 감지됨...';
    }
    
    if (result.isFinal) {
        transcriptBuffer += ' ' + transcript;
        
        if (silenceTimer) {
            clearTimeout(silenceTimer);
        }
        
        silenceTimer = setTimeout(async () => {
            if (!transcriptBuffer.trim() || !isConnected) return;
            
            isProcessing = true;
            console.log('최종 사용자 입력:', transcriptBuffer);
            
            addMessage(transcriptBuffer.trim(), 'user-message');
            status.textContent = 'AI가 응답하는 중...';
            
            try {
                socket.send(transcriptBuffer.trim());
            } catch (error) {
                console.error('메시지 전송 에러:', error);
                status.textContent = '전송 에러 발생';
            } finally {
                transcriptBuffer = '';
                isProcessing = false;
                silenceTimer = null;
            }
        }, 2000);
    } else {
        status.textContent = '듣는 중: ' + transcriptBuffer + ' ' + transcript;
    }
};

// 음성 인식이 끝났을 때 자동으로 다시 시작
recognition.onend = () => {
    if (isListening) {
        recognition.start();
    }
};

// 메시지 추가 함수 수정
function addMessage(text, className) {
    console.log('메시지 추가:', text, className); // 디버깅용 로그
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${className}`;
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 에러 처리
recognition.onerror = (event) => {
    console.error('음성 인식 에러:', event.error);
    status.textContent = '에러 발생: ' + event.error;
    startButton.disabled = false;
    stopButton.disabled = true;
    isListening = false;
};

// 연결 재시도 기능
function reconnectWebSocket() {
    if (!isConnected) {
        socket = new WebSocket('ws://localhost:8000/ws');
        socket.onopen = () => {
            console.log('WebSocket 재연결 성공');
            isConnected = true;
        };
    }
}

// 주기적으로 연결 상태 확인 및 재연결 시도
setInterval(reconnectWebSocket, 5000); 