from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
import threading
import webview

dist_dir = Path(__file__).parent / "midi_parser" / "blender_dist"
PORT = 8765

handler = partial(SimpleHTTPRequestHandler, directory=str(dist_dir))
server = ThreadingHTTPServer(("127.0.0.1", PORT), handler)

threading.Thread(target=server.serve_forever, daemon=True).start()

webview.create_window("My Addon UI", f"http://127.0.0.1:{PORT}/index.html")
webview.start()