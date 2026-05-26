import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/auth';
import api from '../api/client';

type WebSocketCallback = (data: any) => void;
const listeners = new Set<WebSocketCallback>();

/**
 * Adiciona um listener global para mensagens recebidas via WebSocket.
 * Retorna uma função para remover o listener.
 */
export const addWebSocketListener = (callback: WebSocketCallback) => {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
};

const getWsURL = () => {
  const baseURL = api.defaults.baseURL || 'http://10.0.2.2:8000/api/v1';
  // Substitui http por ws, e https por wss
  let wsURL = baseURL.replace(/^http/, 'ws');
  // Remove o sufixo /api/v1 para apontar diretamente para a raiz do backend (/ws/notifications)
  wsURL = wsURL.replace('/api/v1', '');
  return `${wsURL}/ws/notifications`;
};

export const useWebSocket = () => {
  const { token, isAuthenticated } = useAuthStore();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);
  const shouldReconnectRef = useRef(true);

  const connect = () => {
    if (!isAuthenticated || !token) {
      cleanup();
      return;
    }

    cleanup();
    shouldReconnectRef.current = true;

    const wsUrl = `${getWsURL()}?token=${token}`;
    console.log(`[WebSocket] A ligar a: ${wsUrl}`);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[WebSocket] Ligado com sucesso!');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('[WebSocket] Mensagem recebida:', data);
        
        // Notificar todos os subscritores
        listeners.forEach((listener) => {
          try {
            listener(data);
          } catch (err) {
            console.error('[WebSocket] Erro no listener:', err);
          }
        });
      } catch (err) {
        console.error('[WebSocket] Falha ao parsear mensagem:', err);
      }
    };

    ws.onclose = (event) => {
      console.log(`[WebSocket] Ligação fechada: ${event.reason || 'Sem razão'} (Código: ${event.code})`);
      if (shouldReconnectRef.current) {
        scheduleReconnect();
      }
    };

    ws.onerror = (error) => {
      console.error('[WebSocket] Erro na ligação:', error);
      // O onclose será disparado em seguida, cuidando da reconexão
    };
  };

  const scheduleReconnect = () => {
    if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    console.log('[WebSocket] A agendar reconexão em 5 segundos...');
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, 5000);
  };

  const cleanup = () => {
    shouldReconnectRef.current = false;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      connect();
    } else {
      cleanup();
    }

    return () => {
      cleanup();
    };
  }, [token, isAuthenticated]);

  return {
    sendMessage: (data: any) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify(data));
      } else {
        console.warn('[WebSocket] Não foi possível enviar, ligação inativa.');
      }
    },
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
  };
};
