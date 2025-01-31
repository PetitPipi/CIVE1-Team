"use client";

import React from "react";
import styles from "./warnings.module.css";

const Warnings = () => {
  return (
    <div className={styles.container}>
      <h1>Start by setting your API key</h1>
      <div className={styles.message}>
        <strong>1.</strong> Open the file:<br />
        &nbsp;&nbsp;&nbsp;&nbsp;<span>.env.example</span>
        <br /><br />
        <strong>2.</strong> Find the line:<br />
        &nbsp;&nbsp;&nbsp;&nbsp;<span>OPENAI_API_KEY="YOUR_API_KEY"</span>
        <br /><br />
        <strong>3.</strong> Replace <span>YOUR_API_KEY</span> with your actual key.<br />
        &nbsp;&nbsp;&nbsp;&nbsp;For example:<br />
        &nbsp;&nbsp;&nbsp;&nbsp;<span>OPENAI_API_KEY="sk-proj-..."</span>
        <br /><br />
        <strong>4.</strong> Rename the file:<br />
        &nbsp;&nbsp;&nbsp;&nbsp;<span>.env.example</span> → <span>.env</span>
      </div>
    </div>
  );
};

export default Warnings;
