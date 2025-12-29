# SleepyPerp (Perplexport)

## 1. Project Scope

SleepyPerp is a tool designed to export conversations from Perplexity AI and convert them into Markdown files. It provides two primary modes of operation: a command-line interface (CLI) for direct exports, and a REST API server for programmatic access. The project uses headless browser automation to interact with the Perplexity web interface.

## 2. Functional Requirements

### 2.1. CLI Mode
- The tool MUST be executable from the command line.
- The user MUST provide their Perplexity email address as an argument.
- The tool SHALL scrape conversations from the user's Perplexity account.
- The tool SHALL save each conversation as both a `.json` and a `.md` file.
- The tool SHALL keep track of previously downloaded conversations to avoid duplicates.

### 2.2. API Mode
- The tool MUST provide a REST API server.
- The server SHALL expose a `GET /export` endpoint.
- The `/export` endpoint MUST accept an `email` query parameter.
- Upon receiving a request, the server SHALL trigger the headless export process.
- The server SHALL return an array of exported conversations as a JSON object.
- The server SHALL handle errors gracefully and return appropriate HTTP status codes.

## 3. Non-Functional Requirements

- **Environment:** Requires Node.js (v16.0.0 or higher).
- **Automation:** Uses Puppeteer for headless browser automation.
- **Platform:** The project scripts must be cross-platform compatible (Windows, macOS, Linux).
- **Security:** Headless login is subject to bot detection mechanisms and may require manual intervention or the use of session cookies for reliable operation. The user's email is required for operation but is not stored long-term by the application.

## 4. API Schema

### `GET /export`

Triggers a headless process to scrape and export all conversations for a given user.

**Query Parameters:**

| Parameter     | Type   | Description                                            | Required |
|---------------|--------|----------------------------------------------------------|----------|
| `email`       | string | The user's Perplexity AI email.                          | Yes      |
| `userDataDir` | string | Path to a browser user data directory for session reuse. | No       |

**Responses:**

- **`200 OK`**: Successful export.
  - **Body:** `Array<ExportedConversation>`
    ```json
    [
      {
        "id": "string",
        "markdown": "string",
        "json": {}
      }
    ]
    ```

- **`400 Bad Request`**: The `email` query parameter was not provided.
  - **Body:**
    ```json
    {
      "error": "Email query parameter is required."
    }
    ```

- **`500 Internal Server Error`**: The headless export process failed.
  - **Body:**
    ```json
    {
      "error": "Failed to export conversations.",
      "details": "string"
    }
    ```

## 4.5. A Word of Warning from the Horseman

> **Go away! No plebs go near the Horseman.**
>
> Bypassing modern anti-bot and CAPTCHA measures is a dark art. The headless browser automation in this project is powerful, but websites are ever-vigilant. The default login process will likely fail. Proceed only if you are prepared to delve into the complexities of session management and browser fingerprinting.

## 4.6. Authentication and Bypassing CAPTCHA

The most reliable method to bypass login prompts and CAPTCHAs is to reuse an existing, authenticated browser session. You can do this by providing the path to your browser's user data directory.

**How to Use:**

1.  **Log in to Perplexity:** Using your normal Chrome or Edge browser, log in to your Perplexity AI account.
2.  **Find your User Data Directory:**
    - **Windows (Chrome):** `C:\Users\<YourUser>\AppData\Local\Google\Chrome\User Data`
    - **Windows (Edge):** `C:\Users\<YourUser>\AppData\Local\Microsoft\Edge\User Data`
    - **macOS (Chrome):** `~/Library/Application Support/Google/Chrome/`
    - **Linux (Chrome):** `~/.config/google-chrome/`
3.  **Provide the Path:** Pass this directory path to the API using the `userDataDir` query parameter. Make sure to URL-encode the path.

**Example API Call:**
```
http://localhost:3000/export?email=your-email@example.com&userDataDir=C%3A%5CUsers%5CYourUser%5CAppData%5CLocal%5CGoogle%5CChrome%5CUser%20Data
```
By using an existing profile, the headless browser will start with your existing cookies and session, appearing as if you are already logged in.

## 5. Build and Installation

### 5.1. Setup Steps
1. Clone the repository.
2. Navigate to the project directory: `cd sleepyperp`
3. Install the required Node.js dependencies:
   ```bash
   npm install
   ```

### 5.2. Build Instructions
To compile the TypeScript source code into JavaScript in the `dist` directory, run:
```bash
npm run build
```

## 6. Usage

### 6.1. Running the API Server
To start the REST API server, run:
```bash
npm run serve
```
The server will be available at `http://localhost:3000`.

### 6.2. Running the CLI
To run the tool directly from the command line, use the `start` script (which uses `ts-node`):
```bash
npm run start -- --email your-email@example.com
```

## 7. Contribution Guidelines

1. **Fork the repository.**
2. **Create a new branch** for your feature or bug fix (`git checkout -b feature/your-feature-name`).
3. **Make your changes.** Ensure your code adheres to the project's style and conventions.
4. **Commit your changes** (`git commit -m 'Add some amazing feature'`).
5. **Push to the branch** (`git push origin feature/your-feature-name`).
6. **Open a Pull Request.** Provide a clear description of your changes and why they are needed.