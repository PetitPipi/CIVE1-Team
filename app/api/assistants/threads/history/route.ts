import { openai } from "@/app/openai";
import fs from 'fs';
import path from 'path';

const THREADS_FILE = path.join(process.cwd(), 'userThreads.json');

// 获取所有对话线程ID列表
export async function GET() {
  if(!fs.existsSync(THREADS_FILE)) {
    const defaultData = { nickname: '', threads: [] };
    fs.writeFileSync(THREADS_FILE, JSON.stringify(defaultData, null, 2));
    return Response.json(defaultData);
  }
  const data = JSON.parse(fs.readFileSync(THREADS_FILE, 'utf8'));
  return Response.json(data);
}

// 保存新的 thread ID 和名称
export async function POST(request) {
  const { threadId, name, isGroup = false } = await request.json();
  
  try {
    // 初始化数据结构
    let data = { nickname: '', threads: [] };
    
    // 如果文件存在，读取现有数据
    if(fs.existsSync(THREADS_FILE)) {
      data = JSON.parse(fs.readFileSync(THREADS_FILE, 'utf8'));
    }
    
    // 检查是否已存在该线程
    if (!data.threads.some(thread => thread.id === threadId)) {
      // 添加新线程
      data.threads.push({ 
        id: threadId, 
        name: name || new Date().toLocaleString(),
        ...(isGroup && { isGroup: true })
      });
      
      // 保存更新后的数据
      fs.writeFileSync(THREADS_FILE, JSON.stringify(data, null, 2));
    }
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Save thread error:', error);
    return Response.json(
      { error: error.message || 'Failed to save thread' },
      { status: 500 }
    );
  }
}

// 更新线程名称或群组状态
export async function PUT(request) {
  const { threadId, newName, isGroup, nickname } = await request.json();
  let data = { nickname: '', threads: [] };
  
  if(fs.existsSync(THREADS_FILE)) {
    data = JSON.parse(fs.readFileSync(THREADS_FILE, 'utf8'));
  }

  if (nickname !== undefined) {
    // 更新昵称
    data.nickname = nickname;
  } else if (threadId) {
    // 更新线程信息
    data.threads = data.threads.map(thread => 
      thread.id === threadId ? 
      { ...thread, name: newName ?? thread.name, isGroup: isGroup ?? thread.isGroup } 
      : thread
    );
  }

  fs.writeFileSync(THREADS_FILE, JSON.stringify(data, null, 2));
  return Response.json({ success: true });
}

// 删除线程
export async function DELETE(request: Request) {
  try {
    const { threadId } = await request.json();
    
    try {
      // 尝试删除 OpenAI 上的线程
      await openai.beta.threads.del(threadId);
    } catch (openaiError) {
      // 如果 OpenAI 删除失败，记录错误但继续执行
      console.error('OpenAI thread deletion failed:', openaiError);
    }
    
    // 无论 OpenAI 删除是否成功，都从本地存储中删除
    if(fs.existsSync(THREADS_FILE)) {
      let data = JSON.parse(fs.readFileSync(THREADS_FILE, 'utf8'));
      data.threads = data.threads.filter(thread => thread.id !== threadId);
      fs.writeFileSync(THREADS_FILE, JSON.stringify(data, null, 2));
    }
    
    return Response.json({ success: true });
  } catch (error) {
    console.error('Delete thread error:', error);
    return Response.json(
      { error: error.message || 'Failed to delete thread' }, 
      { status: 500 }
    );
  }
}