import os
from http.server import HTTPServer, BaseHTTPRequestHandler

class DumpHandler(BaseHTTPRequestHandler):
    def end_cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_cors()

    def do_POST(self):
        length = int(self.headers.get('content-length', 0))
        data = self.rfile.read(length)
        
        # Save one directory up (in the workspace root)
        workspace_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        
        if self.path == '/dump-html':
            with open(os.path.join(workspace_dir, 'dom_dump.html'), 'wb') as f:
                f.write(data)
            print("Received HTML dump!")
        elif self.path == '/dump-css':
            with open(os.path.join(workspace_dir, 'dom_dump.css'), 'wb') as f:
                f.write(data)
            print("Received CSS dump!")
            
        self.send_response(200)
        self.end_cors()
        self.wfile.write(b"OK")

if __name__ == "__main__":
    print("Starting scraper server on http://localhost:3010...")
    print("Press Ctrl+Shift+Y in the browser to dump data here.")
    HTTPServer(("", 3010), DumpHandler).serve_forever()
