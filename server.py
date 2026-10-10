#!/usr/bin/env python3
"""
Lightweight Recipe Web Application Server
Built with Python standard library (no pip packages needed).
Serves static frontend and provides full REST API persistence in data/recipes.json.
"""

import http.server
import socketserver
import json
import os
import sys
import urllib.parse

PORT = 8000
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')
DATA_FILE = os.path.join(DATA_DIR, 'recipes.json')

def load_recipes():
    """Load recipes from data/recipes.json or fallback to empty list."""
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"[Error] Failed to read {DATA_FILE}: {e}")
    return []

def save_recipes(recipes):
    """Save recipes atomically to data/recipes.json."""
    os.makedirs(DATA_DIR, exist_ok=True)
    temp_file = DATA_FILE + '.tmp'
    with open(temp_file, 'w', encoding='utf-8') as f:
        json.dump(recipes, f, indent=2, ensure_ascii=False)
    os.replace(temp_file, DATA_FILE)

class RecipeRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Request handler supporting static files and /api/recipes endpoints."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        # Enable CORS for convenience
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def _send_json(self, status_code, payload):
        data = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        self.send_response(status_code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def _read_body_json(self):
        content_length = int(self.headers.get('Content-Length', 0))
        if content_length == 0:
            return None
        body = self.rfile.read(content_length).decode('utf-8')
        return json.loads(body)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == '/api/health':
            return self._send_json(200, {"status": "ok", "message": "Recipe API is healthy"})

        if path == '/api/recipes':
            recipes = load_recipes()
            return self._send_json(200, recipes)

        if path.startswith('/api/recipes/'):
            recipe_id = path.split('/api/recipes/')[1]
            recipes = load_recipes()
            for r in recipes:
                if str(r.get('id')) == recipe_id:
                    return self._send_json(200, r)
            return self._send_json(404, {"error": "Recipe not found"})

        # Fallback to standard static file server
        return super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path == '/api/recipes':
            try:
                recipe_data = self._read_body_json()
                if not recipe_data or not isinstance(recipe_data, dict):
                    return self._send_json(400, {"error": "Invalid JSON body"})

                recipes = load_recipes()
                # Ensure id exists
                if 'id' not in recipe_data or not recipe_data['id']:
                    recipe_data['id'] = f"recipe-{int(os.times().elapsed * 1000)}"

                recipes.insert(0, recipe_data)
                save_recipes(recipes)
                return self._send_json(201, {"success": True, "recipe": recipe_data})
            except Exception as e:
                return self._send_json(500, {"error": str(e)})

        if path == '/api/recipes/import':
            try:
                imported = self._read_body_json()
                if not isinstance(imported, list):
                    return self._send_json(400, {"error": "Expected an array of recipes"})
                save_recipes(imported)
                return self._send_json(200, {"success": True, "count": len(imported)})
            except Exception as e:
                return self._send_json(500, {"error": str(e)})

        return self._send_json(404, {"error": "Endpoint not found"})

    def do_PUT(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path.startswith('/api/recipes/'):
            recipe_id = path.split('/api/recipes/')[1]
            try:
                updated_data = self._read_body_json()
                recipes = load_recipes()
                found = False
                for i, r in enumerate(recipes):
                    if str(r.get('id')) == recipe_id:
                        recipes[i] = {**r, **updated_data, "id": recipe_id}
                        found = True
                        break
                if not found:
                    return self._send_json(404, {"error": "Recipe not found"})
                save_recipes(recipes)
                return self._send_json(200, {"success": True, "recipe": recipes[i]})
            except Exception as e:
                return self._send_json(500, {"error": str(e)})

        return self._send_json(404, {"error": "Endpoint not found"})

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path

        if path.startswith('/api/recipes/'):
            recipe_id = path.split('/api/recipes/')[1]
            try:
                recipes = load_recipes()
                original_len = len(recipes)
                recipes = [r for r in recipes if str(r.get('id')) != recipe_id]
                if len(recipes) == original_len:
                    return self._send_json(404, {"error": "Recipe not found"})
                save_recipes(recipes)
                return self._send_json(200, {"success": True, "deleted": recipe_id})
            except Exception as e:
                return self._send_json(500, {"error": str(e)})

        return self._send_json(404, {"error": "Endpoint not found"})


def find_available_port(start_port=8000, max_attempts=20):
    import socket
    for port in range(start_port, start_port + max_attempts):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            if s.connect_ex(('127.0.0.1', port)) != 0:
                return port
    return start_port

def run_server(port=PORT):
    actual_port = find_available_port(port)
    server_address = ('', actual_port)

    # Allow immediate address reuse
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(server_address, RecipeRequestHandler) as httpd:
        print("=" * 60)
        print("🍳 Recipe Web App Server running!")
        print(f"👉 Local URL: http://localhost:{actual_port}")
        print(f"👉 Serving directory: {BASE_DIR}")
        print("Press Ctrl+C to stop the server.")
        print("=" * 60)
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server cleanly...")

if __name__ == '__main__':
    port_arg = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    run_server(port_arg)

