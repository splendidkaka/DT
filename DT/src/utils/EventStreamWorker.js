// @/utils/EventStreamWorker.js
let fetchController = null;
let abortDataCache = null;
const decoder = new TextDecoder();

const createAbortController = () => {
  const controller = new AbortController();
  return {
    abort: (reason) => controller.abort(reason),
    signal: controller.signal,
  };
};

const messageHandler = {
  onopen: (response) => {
    self.postMessage({
      status: "onopen",
      data: {
        status: response.status,
        statusText: response.statusText,
      },
    });
  },

  onmessage: (rawData) => {
    try {
      const data = JSON.parse(rawData);
      // console.log('ON-data',data);
      self.postMessage({
        status: "onmessage",
        data: {
          content: data.text || "",
          contentThink: data.think || "",
          done: data.done,
          error: data.error,
        },
      });
    } catch (error) {
      self.postMessage({
        status: "onmessage",
        data: {
          text: rawData,
          contentThink: "",
        },
      });
    }
  },

  onerror: (error) => {
    const errorType =
      error.name === "AbortError"
        ? "abort"
        : error.message.includes("timeout")
        ? "timeout"
        : "network";

    self.postMessage({
      status: "onerror",
      error: {
        type: errorType,
        message: error.message,
        abortData: abortDataCache,
      },
    });
  },

  onfinally: () => {
    self.postMessage({
      status: "onfinally",
    });
  },
};

self.onmessage = async (e) => {
  const { action, url, params, headers, timeout, method } = e.data;

  if (action === "abort") {
    if (fetchController) {
      fetchController.abort("user_cancel");
      abortDataCache = e.data.abortData;
    }
    return;
  }

  if (action === "sse") {
    fetchController = createAbortController();
    abortDataCache = e.data.abortData;

    // 超时处理
    const timeoutId =
      timeout &&
      setTimeout(() => {
        fetchController.abort(`Timeout after ${timeout}ms`);
      }, timeout);

    try {
      const response = await fetch(url, {
        method: method || "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify(params),
        signal: fetchController.signal,
      });

      if (timeoutId) clearTimeout(timeoutId);
      if (!response.ok)
        throw new Error(`${response.status} ${response.statusText}`);

      messageHandler.onopen(response);
      console.log('response',response);
      const reader = response.body.getReader();
      console.log('reader',reader);
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let lineEndIndex;
        while ((lineEndIndex = buffer.indexOf("\n")) !== -1) {
          const line = buffer.slice(0, lineEndIndex).trim();
          buffer = buffer.slice(lineEndIndex + 1);

          if (line.startsWith("data:")) {
            const data = line.slice(5).trim();
            // console.log('data',data);

            
            messageHandler.onmessage(data);
          }
        }
      }
    } catch (error) {
      messageHandler.onerror(error);
    } finally {
      messageHandler.onfinally();
      fetchController = null;
      if (timeoutId) clearTimeout(timeoutId);
    }
  }
};
