# CIVE1-Team User Guide  

To get started, please **Create a GitHub Account/Log in to your GitHub Account** first: [GitHub](https://github.com/).  

## Quick Start  

### 1. Fork the Repository  

1. Open the project page: [CIVE1-Team GitHub Repository](https://github.com/hannahwangmb/CIVE1-Team).  
2. Click **Fork** (usually at the top right of the page).  

This copy of the project is in your GitHub repository. 

### 2. Open the Repository with CodeSpaces  
1. Go to GitHub and find the repository you forked earlier.  
2. Click `Code` -> `Codespaces`.  
3. Click `Create codespace on main`.  
4. Wait until it finished loading.  

### 3. Set Up Your OpenAI API Key  

1. Copy the API-Key you were provided with.  
2. Go back to GitHub CodeSpaces, open the `.env.example` file in your project folder on the left, and rename the file to `.env`.  
3. Find this line:  

    ```
    OPENAI_API_KEY="sk-proj-..."
    ```  

4. Replace `sk-proj-...` with the API-key you just copied.  


### 4. Install Required Files  

Please wait until it finishes downloading and installing the necessary files.


### 5. Start the Assistant

In the **terminal**, type:

```shell
npm run dev
```


### 6. Open in Your Browser

Once the assistant is running, follow the link provided in the terminal to access it in your web browser.

---

## Daily Use Instructions


### 1. Open Your Forked GitHub Repository

Go to GitHub and find the repository you forked earlier.
Usually named 'https://github.com/YOUR_GITHUB_ACCOUNT_NAME/CIVE1-Team'

### 2. Open Your Codespace

Click `Code` -> `Codespaces`

Select the Codespace you used last time.

### 3. Start the Assistant

In the terminal, type:

```shell
npm run dev
```

### 4. Open in Browser

Follow the link in the terminal to access the assistant.   


## Tips

1. Always start a new chat when the previous context is no longer needed, otherwise it costs more and more as the conversation gets longer.  
2. You can share a chat history with team members by click the group button next to the edit button. Note that once a conversation is shared, it cannot be ungrouped. To join a shared chat, click **Join Team Chat** and enter the provided ID. To see what other people send in the group chat, you might need to refresh the page manually.  
3. The file search widget displays only the 20 most recent files. Files uploaded here will become part of the model's shared knowledge base, accessible to all lab members. If you don’t want a file to be stored, remember to delete it after use. 
