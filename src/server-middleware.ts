
// Vite Server Middleware for API routes
import { handleRequest } from './pages/api/index';
import type { ViteDevServer } from 'vite';
import { IncomingMessage, ServerResponse } from 'http';

// Define types for middleware
type NextFunction = () => void;

export default function apiMiddleware() {
  return {
    name: 'api-middleware',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next: NextFunction) => {
        if (req.url?.startsWith('/api/')) {
          try {
            // Create a Request object from the incoming request
            const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
            
            console.log('API Request:', req.method, url.pathname);
            
            const headers = new Headers();
            
            // Copy headers safely
            if (req.headers) {
              Object.entries(req.headers).forEach(([key, value]) => {
                if (value !== undefined) {
                  // Handle both string and string[] header values
                  if (Array.isArray(value)) {
                    headers.set(key, value.join(', '));
                  } else if (typeof value === 'string') {
                    headers.set(key, value);
                  }
                }
              });
            }
            
            const requestInit: RequestInit = {
              method: req.method,
              headers: headers
            };
            
            // Add body for POST/PUT requests
            if (['POST', 'PUT', 'PATCH'].includes(req.method || '')) {
              const bodyPromise = new Promise<string>((resolve) => {
                let body = '';
                req.on('data', (chunk: Buffer) => {
                  body += chunk.toString();
                });
                req.on('end', () => {
                  console.log('Request body received:', body);
                  resolve(body);
                });
              });
              
              requestInit.body = await bodyPromise;
            }
            
            const request = new Request(url.toString(), requestInit);
            
            // Process the API request
            const response = await handleRequest(request);
            
            // Send the response back
            res.statusCode = response.status;
            
            response.headers.forEach((value, key) => {
              res.setHeader(key, value);
            });
            
            const responseBody = await response.text();
            console.log('API response:', responseBody);
            res.end(responseBody);
          } catch (error: any) {
            console.error('API middleware error:', error);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ 
              success: false, 
              message: 'Internal server error: ' + (error.message || error.toString())
            }));
          }
        } else {
          next();
        }
      });
    }
  };
}
