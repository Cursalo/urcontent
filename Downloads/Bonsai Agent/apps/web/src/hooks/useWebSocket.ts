import { useEffect, useRef, useState, useCallback } from 'react';
import { createWebSocketClient, getWebSocketClient } from '@/lib/websocket/client';
import { WebSocketConfig, BonsaiWebSocketClient, ConnectionStatus, WebSocketEvents } from '@/lib/websocket/types';

interface UseWebSocketOptions {
  autoConnect?: boolean;
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onError?: (error: any) => void;
  onReconnect?: () => void;
}

interface UseWebSocketReturn {
  client: BonsaiWebSocketClient | null;
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  connect: () => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;
  emit: <K extends keyof WebSocketEvents>(event: K, data: Parameters<WebSocketEvents[K]>[0]) => void;
  on: <K extends keyof WebSocketEvents>(event: K, callback: WebSocketEvents[K]) => void;
  off: <K extends keyof WebSocketEvents>(event: K, callback?: WebSocketEvents[K]) => void;
}

export function useWebSocket(config: WebSocketConfig, options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const [client, setClient] = useState<BonsaiWebSocketClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const clientRef = useRef<BonsaiWebSocketClient | null>(null);
  const optionsRef = useRef(options);

  // Update options ref when options change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Initialize client
  useEffect(() => {
    const wsClient = createWebSocketClient(config);
    setClient(wsClient);
    clientRef.current = wsClient;

    // Set up event listeners
    wsClient.on('user:connect', () => {
      setIsConnected(true);
      setConnectionStatus('connected');
      optionsRef.current.onConnect?.();
    });

    wsClient.on('user:disconnect', (data) => {
      setIsConnected(false);
      setConnectionStatus('disconnected');
      optionsRef.current.onDisconnect?.(data.reason);
    });

    wsClient.on('error', (error) => {
      optionsRef.current.onError?.(error);
    });

    wsClient.on('reconnect', () => {
      optionsRef.current.onReconnect?.();
    });

    // Auto-connect if specified
    if (options.autoConnect !== false) {
      wsClient.connect().catch((error) => {
        console.error('❌ Auto-connect failed:', error);
        optionsRef.current.onError?.(error);
      });
    }

    // Cleanup on unmount
    return () => {
      wsClient.disconnect();
    };
  }, [config]);

  // Update connection status based on client status
  useEffect(() => {
    if (client) {
      const updateStatus = () => {
        setIsConnected(client.isConnected);
        setConnectionStatus(client.status || 'disconnected');
      };

      // Check status periodically
      const interval = setInterval(updateStatus, 1000);
      updateStatus(); // Initial check

      return () => clearInterval(interval);
    }
  }, [client]);

  const connect = useCallback(async () => {
    if (clientRef.current) {
      setConnectionStatus('connecting');
      try {
        await clientRef.current.connect();
      } catch (error) {
        setConnectionStatus('disconnected');
        throw error;
      }
    }
  }, []);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      setConnectionStatus('disconnecting');
      clientRef.current.disconnect();
      setConnectionStatus('disconnected');
    }
  }, []);

  const reconnect = useCallback(async () => {
    if (clientRef.current) {
      setConnectionStatus('reconnecting');
      try {
        await clientRef.current.reconnect();
      } catch (error) {
        setConnectionStatus('disconnected');
        throw error;
      }
    }
  }, []);

  const emit = useCallback(<K extends keyof WebSocketEvents>(
    event: K,
    data: Parameters<WebSocketEvents[K]>[0]
  ) => {
    if (clientRef.current) {
      clientRef.current.emit(event, data);
    }
  }, []);

  const on = useCallback(<K extends keyof WebSocketEvents>(
    event: K,
    callback: WebSocketEvents[K]
  ) => {
    if (clientRef.current) {
      clientRef.current.on(event, callback);
    }
  }, []);

  const off = useCallback(<K extends keyof WebSocketEvents>(
    event: K,
    callback?: WebSocketEvents[K]
  ) => {
    if (clientRef.current) {
      clientRef.current.off(event, callback);
    }
  }, []);

  return {
    client,
    isConnected,
    connectionStatus,
    connect,
    disconnect,
    reconnect,
    emit,
    on,
    off,
  };
}

// Hook for using existing WebSocket client
export function useExistingWebSocket(): UseWebSocketReturn | null {
  const [client, setClient] = useState<BonsaiWebSocketClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');

  useEffect(() => {
    const existingClient = getWebSocketClient();
    if (existingClient) {
      setClient(existingClient);
      setIsConnected(existingClient.isConnected);
      setConnectionStatus(existingClient.status || 'disconnected');

      // Monitor connection status
      const interval = setInterval(() => {
        setIsConnected(existingClient.isConnected);
        setConnectionStatus(existingClient.status || 'disconnected');
      }, 1000);

      return () => clearInterval(interval);
    }
  }, []);

  if (!client) {
    return null;
  }

  return {
    client,
    isConnected,
    connectionStatus,
    connect: () => client.connect(),
    disconnect: () => client.disconnect(),
    reconnect: () => client.reconnect(),
    emit: (event, data) => client.emit(event, data),
    on: (event, callback) => client.on(event, callback),
    off: (event, callback) => client.off(event, callback),
  };
}

// Hook for WebSocket connection status only
export function useWebSocketStatus(): {
  isConnected: boolean;
  status: ConnectionStatus;
  hasClient: boolean;
} {
  const [isConnected, setIsConnected] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [hasClient, setHasClient] = useState(false);

  useEffect(() => {
    const client = getWebSocketClient();
    if (client) {
      setHasClient(true);
      setIsConnected(client.isConnected);
      setStatus(client.status || 'disconnected');

      const interval = setInterval(() => {
        setIsConnected(client.isConnected);
        setStatus(client.status || 'disconnected');
      }, 1000);

      return () => clearInterval(interval);
    } else {
      setHasClient(false);
    }
  }, []);

  return { isConnected, status, hasClient };
}