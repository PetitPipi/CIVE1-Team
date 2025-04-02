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

**For Administrators:**
1. Log in to/Register [OpenAI](https://platform.openai.com/api-keys) using the email invited by Dr. Lin.
2. Ensure the organization is set to **CIVE1** and the project is set to **CIVE1-GPT** (top left of the screen).  
3. Click **Create new secret key** and copy the key that appears.

**For Regular Users:**
1. Copy the secret key you were provided with.

**For Everyone, after the above operations:**
1. Go back to GitHub CodeSpaces, open the `.env.example` file in your project folder on the left, and rename the file to `.env`.  
2. Find this line:  

    ```
    OPENAI_API_KEY="sk-proj-..."
    ```  

3. Replace `sk-proj-...` with the secret key you just created.  

4. Rename the file to `.env` 


### 4. Install Required Files  

Please wait until it finishes downloading and installing the necessary files.


### 5. Start the Assistant

In the terminal, type:

```shell
npm run dev
```


### 6. Open in Your Browser

Once the assistant is running, follow the link provided in the terminal to access it in your web browser.

---

## Daily Use Instructions


### 1. Open Your Forked GitHub Repository

Go to GitHub and find the repository you forked earlier.

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

1. Always start a new conversation when the previous context is no longer needed, otherwise it costs more and more as the conversation gets longer.
2. You can share a conversation with team members by copying the thread ID. However, be cautious—anyone with the ID can delete the thread from the system.   
3. The file search widget displays only the 20 most recent files. Files uploaded here will become part of the model's shared knowledge base, accessible to all users. If you don't want your file to be included, please remember to delete it after completing your query.   
