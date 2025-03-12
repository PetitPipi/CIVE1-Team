"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "./chat.module.css";
import { AssistantStream } from "openai/lib/AssistantStream";
import Markdown from "react-markdown";
// @ts-expect-error - no types for this yet
import { AssistantStreamEvent } from "openai/resources/beta/assistants/assistants";
import { RequiredActionFunctionToolCall } from "openai/resources/beta/threads/runs/runs";
import ThreadList from "./thread-list";

type MessageProps = {
  role: "user" | "assistant" | "code";
  text: string;
};

const UserMessage = ({ text }: { text: string }) => {
  return <div className={styles.userMessage}>{text}</div>;
};

const AssistantMessage = ({ text }: { text: string }) => {
  return (
    <div className={styles.assistantMessage}>
      <Markdown>{text}</Markdown>
    </div>
  );
};

const CodeMessage = ({ text }: { text: string }) => {
  return (
    <div className={styles.codeMessage}>
      {text.split("\n").map((line, index) => (
        <div key={index}>
          <span>{`${index + 1}. `}</span>
          {line}
        </div>
      ))}
    </div>
  );
};

const Message = ({ role, text }: MessageProps) => {
  switch (role) {
    case "user":
      return <UserMessage text={text} />;
    case "assistant":
      return <AssistantMessage text={text} />;
    case "code":
      return <CodeMessage text={text} />;
    default:
      return null;
  }
};

type ChatProps = {
  functionCallHandler?: (
    toolCall: RequiredActionFunctionToolCall
  ) => Promise<string>;
};

const Chat = ({
  functionCallHandler = () => Promise.resolve(""),
}: ChatProps) => {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [threadId, setThreadId] = useState("");
  const [isGroupConversation, setIsGroupConversation] = useState(false);
  const threadListRef = useRef(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinThreadInput, setJoinThreadInput] = useState('');

  // 添加一个生成默认名称的函数
  const getDefaultThreadName = () => {
    return new Date().toLocaleString();
  };

  // automatically scroll to bottom of chat
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 定期轮询API获取最新消息
  useEffect(() => {
    if (!isGroupConversation) return;

    const intervalId = setInterval(async () => {
      if (threadId) {
        await loadThread(threadId);
      }
    }, 1000);

    return () => clearInterval(intervalId); // 清除定时器
  }, [threadId, isGroupConversation]);

  useEffect(() => {
    const createThread = async () => {
      // 1. 先检查是否有历史线程
      const response = await fetch('/api/assistants/threads/history');
      const data = await response.json();
      
      // 修改这里，现在需要访问 data.threads
      if (data.threads && data.threads.length > 0) {
        // 如果有历史线程，使用最新的一个
        const latestThreadId = data.threads[data.threads.length - 1].id;
        setThreadId(latestThreadId);
        loadThread(latestThreadId); // 加载最新的历史消息
        return;
      }
      
      // 2. 如果没有历史线程，才创建新的
      const res = await fetch(`/api/assistants/threads`, {
        method: "POST",
      });
      const threadData = await res.json();
      setThreadId(threadData.threadId);
  
      const defaultName = new Date().toLocaleString();
      await fetch(`/api/assistants/threads/history`, {
        method: "POST",
        body: JSON.stringify({ 
          threadId: threadData.threadId, 
          name: defaultName 
        }),
        headers: {
          'Content-Type': 'application/json',
        }
      });
  
      // 重置消息列表
      setMessages([]);
      
      // 刷新线程列表
      if (threadListRef.current) {
        await threadListRef.current.fetchThreads();
      }
    };
    createThread();
  }, []); 

  const sendMessage = async (text) => {
    const response = await fetch(
      `/api/assistants/threads/${threadId}/messages`,
      {
        method: "POST",
        body: JSON.stringify({
          content: text,
        }),
      }
    );
    const stream = AssistantStream.fromReadableStream(response.body);
    handleReadableStream(stream);
  };

  const submitActionResult = async (runId, toolCallOutputs) => {
    const response = await fetch(
      `/api/assistants/threads/${threadId}/actions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          runId: runId,
          toolCallOutputs: toolCallOutputs,
        }),
      }
    );
    const stream = AssistantStream.fromReadableStream(response.body);
    handleReadableStream(stream);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;
    sendMessage(userInput);
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", text: userInput },
    ]);
    setUserInput("");
    setInputDisabled(true);
    scrollToBottom();
  };

  /* Stream Event Handlers */

  // textCreated - create new assistant message
  const handleTextCreated = () => {
    appendMessage("assistant", "");
  };

  // textDelta - append text to last assistant message
  const handleTextDelta = (delta) => {
    if (delta.value != null) {
      appendToLastMessage(delta.value);
    };
    if (delta.annotations != null) {
      annotateLastMessage(delta.annotations);
    }
  };

  // imageFileDone - show image in chat
  const handleImageFileDone = (image) => {
    appendToLastMessage(`\n![${image.file_id}](/api/files/${image.file_id})\n`);
  }

  // toolCallCreated - log new tool call
  const toolCallCreated = (toolCall) => {
    if (toolCall.type != "code_interpreter") return;
    appendMessage("code", "");
  };

  // toolCallDelta - log delta and snapshot for the tool call
  const toolCallDelta = (delta, snapshot) => {
    if (delta.type != "code_interpreter") return;
    if (!delta.code_interpreter.input) return;
    appendToLastMessage(delta.code_interpreter.input);
  };

  // handleRequiresAction - handle function call
  const handleRequiresAction = async (
    event: AssistantStreamEvent.ThreadRunRequiresAction
  ) => {
    const runId = event.data.id;
    const toolCalls = event.data.required_action.submit_tool_outputs.tool_calls;
    // loop over tool calls and call function handler
    const toolCallOutputs = await Promise.all(
      toolCalls.map(async (toolCall) => {
        const result = await functionCallHandler(toolCall);
        return { output: result, tool_call_id: toolCall.id };
      })
    );
    setInputDisabled(true);
    submitActionResult(runId, toolCallOutputs);
  };

  // handleRunCompleted - re-enable the input form
  const handleRunCompleted = () => {
    setInputDisabled(false);
  };

  const handleReadableStream = (stream: AssistantStream) => {
    // messages
    stream.on("textCreated", handleTextCreated);
    stream.on("textDelta", handleTextDelta);

    // image
    stream.on("imageFileDone", handleImageFileDone);

    // code interpreter
    stream.on("toolCallCreated", toolCallCreated);
    stream.on("toolCallDelta", toolCallDelta);

    // events without helpers yet (e.g. requires_action and run.done)
    stream.on("event", (event) => {
      if (event.event === "thread.run.requires_action")
        handleRequiresAction(event);
      if (event.event === "thread.run.completed") handleRunCompleted();
    });
  };

  /*
    =======================
    === Utility Helpers ===
    =======================
  */

  const appendToLastMessage = (text) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
        text: lastMessage.text + text,
      };
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
  };

  const appendMessage = (role, text) => {
    setMessages((prevMessages) => [...prevMessages, { role, text }]);
  };

  const annotateLastMessage = (annotations) => {
    setMessages((prevMessages) => {
      const lastMessage = prevMessages[prevMessages.length - 1];
      const updatedLastMessage = {
        ...lastMessage,
      };
      annotations.forEach((annotation) => {
        if (annotation.type === 'file_path') {
          updatedLastMessage.text = updatedLastMessage.text.replaceAll(
            annotation.text,
            `/api/files/${annotation.file_path.file_id}`
          );
        }
      })
      return [...prevMessages.slice(0, -1), updatedLastMessage];
    });
    
  }

  const loadThread = async (threadId: string) => {
    try {
      setThreadId(threadId);
      // use new history endpoint to retrieve messages
      const response = await fetch(`/api/assistants/threads/${threadId}/history`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const messages = data.messages.map(msg => ({
        role: msg.role,
        text: msg.content[0]?.text?.value || ''
      }))
      .reverse();
      setMessages(messages);
    } catch (error) {
      console.error('Failed loading history conversation:', error);
    }
  }
  const createNewThread = async () => {
    try {
      // 1. 创建新线程
      const res = await fetch(`/api/assistants/threads`, {
        method: "POST",
      });
      const data = await res.json();
      
      // 2. 设置本地状态
      setThreadId(data.threadId);
      setMessages([]); 
      setIsGroupConversation(false); // 添加这行，确保新对话不是群组对话
  
      // 3. 保存到历史记录
      const defaultName = getDefaultThreadName();
      await fetch(`/api/assistants/threads/history`, {
        method: "POST",
        body: JSON.stringify({ 
          threadId: data.threadId,
          name: defaultName,
          isGroup: false
        }),
        headers: {
          'Content-Type': 'application/json',
        }
      });
  
      // 4. 刷新线程列表
      if (threadListRef.current) {
        await threadListRef.current.fetchThreads();
      }
    } catch (error) {
      console.error('Failed to create new thread:', error);
    }
  };

  const handleThreadSelect = (threadId: string, isGroup: boolean) => {
    setThreadId(threadId);
    setIsGroupConversation(isGroup);
    loadThread(threadId);
  };

  const handleJoinTeam = async () => {
    if (!joinThreadInput.trim()) return;
    
    try {
      const defaultName = getDefaultThreadName();
      const response = await fetch('/api/assistants/threads/history', {
        method: 'POST',
        body: JSON.stringify({ 
          threadId: joinThreadInput,
          name: defaultName,
          isGroup: true 
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) throw new Error('Failed to join team chat');
      
      setShowJoinModal(false);
      setJoinThreadInput('');
      handleThreadSelect(joinThreadInput, true);
      
      // 刷新线程列表
      if (threadListRef.current) {
        await threadListRef.current.fetchThreads();
      }
    } catch (error) {
      console.error('Error joining team chat:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <ThreadList 
          ref={threadListRef}
          currentThreadId={threadId}
          onThreadSelect={handleThreadSelect}
        />
      </div>
    <div className={styles.chatContainer}>
      <div className={styles.messages}>
        {messages.map((msg, index) => (
          <Message key={index} role={msg.role} text={msg.text} />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSubmit}
        className={`${styles.inputForm} ${styles.clearfix}`}
      >
        <button
          type="button" 
          onClick={createNewThread}
          className={styles.newChatBtn}
        >
          New Chat
        </button>
        <button
          type="button"
          onClick={() => setShowJoinModal(true)}
          className={styles.newChatBtn}
        >
          Join Team Chat
        </button>
        {showJoinModal && (
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <h3>Join Team Chat</h3>
              <input
                type="text"
                value={joinThreadInput}
                onChange={(e) => setJoinThreadInput(e.target.value)}
                placeholder="Enter Team Thread ID"
              />
              <div className={styles.modalButtons}>
                <button onClick={() => setShowJoinModal(false)}>Cancel</button>
                <button onClick={handleJoinTeam}>Join</button>
              </div>
            </div>
          </div>
        )}
        <input
          type="text"
          className={styles.input}
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Enter your question"
        />
        <button
          type="submit"
          className={styles.button}
          disabled={inputDisabled}
        >
          Send
        </button>
      </form>
    </div>
    </div>
  );
};

export default Chat;
