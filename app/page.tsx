"use client";
import React from "react";
import Chat from "./components/chat";
import FileViewer from "./components/file-viewer";
import styles from "./page.module.css";

const FileSearchPage = () => {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.chatContainer}>
          <div className={styles.chat}>
            <Chat />
          </div>
        </div>
        <div className={styles.column}>
          <FileViewer />
        </div>
      </div>
    </main>
  );
};

export default FileSearchPage;