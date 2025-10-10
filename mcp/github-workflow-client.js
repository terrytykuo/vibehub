const WebSocket = require('ws');

/**
 * Simple MCP client for dispatching GitHub workflows.
 * The client talks JSON-RPC 2.0 over WebSocket to an MCP server.
 */
class GithubWorkflowMcpClient {
  constructor() {
    this.url = process.env.PO_BOT_MCP_SERVER_URL;
    this.authToken = process.env.PO_BOT_MCP_TOKEN;
    this.clientName = 'vibehub-po-bot';
    this.clientVersion = '1.0.0';
    this.ws = null;
    this.connected = false;
    this.connecting = null;
    this.nextId = 1;
    this.pending = new Map();
  }

  /**
   * Ensure we have an active MCP connection.
   */
  async ensureConnection() {
    if (!this.url) {
      throw new Error('缺少環境變數 PO_BOT_MCP_SERVER_URL');
    }

    if (this.connected && this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    if (this.connecting) {
      return this.connecting;
    }

    this.connecting = new Promise((resolve, reject) => {
      const headers = {};
      if (this.authToken) {
        headers.Authorization = `Bearer ${this.authToken}`;
      }

      const ws = new WebSocket(this.url, { headers });
      this.ws = ws;

      ws.on('open', async () => {
        try {
          await this.initialize();
          this.connected = true;
          resolve();
        } catch (error) {
          reject(error);
        } finally {
          this.connecting = null;
        }
      });

      ws.on('message', (data) => {
        let payload = null;
        try {
          payload = JSON.parse(data.toString());
        } catch (error) {
          console.error('[MCP] Received non-JSON message:', data.toString());
          return;
        }

        if (payload.id && this.pending.has(payload.id)) {
          const { resolve: res, reject: rej, timeout } = this.pending.get(payload.id);
          clearTimeout(timeout);
          this.pending.delete(payload.id);

          if (payload.error) {
            const err = new Error(payload.error.message || 'MCP request failed');
            err.data = payload.error.data;
            rej(err);
          } else {
            res(payload.result);
          }
        } else if (payload.method) {
          // Currently we do not handle server-initiated requests.
          if (payload.id) {
            this.sendNotification('error', {
              message: `Unhandled request: ${payload.method}`
            });
          }
        }
      });

      ws.on('close', () => {
        this.connected = false;
        this.ws = null;
        this.pending.forEach(({ reject: rej, timeout }) => {
          clearTimeout(timeout);
          rej(new Error('MCP connection closed'));
        });
        this.pending.clear();
      });

      ws.on('error', (error) => {
        console.error('[MCP] Connection error:', error);
      });
    });

    return this.connecting;
  }

  async initialize() {
    const initResult = await this.sendRequest('initialize', {
      capabilities: {},
      clientInfo: {
        name: this.clientName,
        version: this.clientVersion
      }
    });

    // Optionally request tool list to warm up connection
    await this.sendNotification('initialized', {});

    if (initResult?.capabilities?.tools) {
      return initResult.capabilities.tools;
    }

    return initResult;
  }

  /**
   * Send a JSON-RPC request over MCP connection.
   */
  async sendRequest(method, params) {
    await this.ensureConnection();

    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('MCP 連線尚未建立');
    }

    const id = this.nextId++;
    const payload = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`MCP request timeout: ${method}`));
      }, Number(process.env.PO_BOT_MCP_TIMEOUT_MS || 10000));

      this.pending.set(id, { resolve, reject, timeout });

      try {
        this.ws.send(JSON.stringify(payload));
      } catch (error) {
        clearTimeout(timeout);
        this.pending.delete(id);
        reject(error);
      }
    });
  }

  /**
   * Send a JSON-RPC notification (no response expected).
   */
  async sendNotification(method, params) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }
    const payload = {
      jsonrpc: '2.0',
      method,
      params
    };
    this.ws.send(JSON.stringify(payload));
  }

  /**
   * Dispatch GitHub workflow via MCP tool.
   */
  async dispatchWorkflow({ owner, repo, workflow, ref, inputs }) {
    const toolName = process.env.PO_BOT_MCP_WORKFLOW_TOOL || 'github.workflow_dispatch';

    const argumentsPayload = {
      owner,
      repo,
      repo_full_name: `${owner}/${repo}`,
      workflow_id: workflow,
      ref,
      inputs
    };

    const result = await this.sendRequest('tools/call', {
      name: toolName,
      arguments: argumentsPayload
    });

    if (Array.isArray(result?.content)) {
      return result.content.map(part => part?.text || '').join('\n');
    }

    return result;
  }
}

const singleton = new GithubWorkflowMcpClient();

module.exports = {
  GithubWorkflowMcpClient: GithubWorkflowMcpClient,
  githubWorkflowMcpClient: singleton
};
