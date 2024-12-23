from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
import openai
import os
from dotenv import load_dotenv
import json
import uvicorn

# .env 파일에서 환경변수 로드
load_dotenv()

# OpenAI API 키 설정
openai.api_key = os.getenv("OPENAI_API_KEY")

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 루트 경로에서 index.html 제공
@app.get("/")
async def read_index():
    return FileResponse('index.html')

# WebSocket 연결 처리
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    try:
        await websocket.accept()
        print("WebSocket connected")
        
        while True:
            try:
                # 클라이언트로부터 메시지 수신
                message = await websocket.receive_text()
                print(f"받은 메시지: {message}")
                
                # OpenAI API 호출
                response = openai.ChatCompletion.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "당신은 도움이 되는 AI 어시스턴트입니다."},
                        {"role": "user", "content": message}
                    ],
                    temperature=0.7,
                    max_tokens=150
                )
                
                ai_response = response.choices[0].message.content
                print(f"AI 응답: {ai_response}")
                
                # 클라이언트에 응답 전송
                await websocket.send_text(json.dumps({
                    "type": "ai_response",
                    "content": ai_response
                }))
                
            except Exception as e:
                print(f"처리 중 에러 발생: {str(e)}")
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "content": str(e)
                }))
                
    except WebSocketDisconnect:
        print("WebSocket disconnected")
    except Exception as e:
        print(f"WebSocket 에러: {str(e)}")

# 정적 파일 제공 설정 - 마지막에 위치
app.mount("/", StaticFiles(directory="."), name="static")

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)