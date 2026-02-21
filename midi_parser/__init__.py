bl_info = {
    "name" : "Blender Midi Parser",
    "description" : "An addon to parse midi files to be used in animation",
    "author" : "Frozen Breadstick & Kingpin",
    "version" : (0, 0, 1),
    "blender" : (2, 80, 0),
    "location" : "View3D",
    "warning" : "",
    "support" : "COMMUNITY",
    "doc_url" : "",
    "category" : "Animation"
}

import shutil
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
import threading
import bpy
from bpy_extras.io_utils import ImportHelper
from bpy.props import StringProperty
from bpy.types import Operator
from bpy.types import Panel

_server_instance = None

def stop_server():
    global _server_instance
    if _server_instance:
        _server_instance.shutdown()
        _server_instance.server_close()
        _server_instance = None

class BMP_OT_start(Operator):
    """ tooltip goes here """
    bl_idname = "bmp.start_server"
    bl_label = "Start/Opens the server"
    bl_options = {"REGISTER", "UNDO"}

    @classmethod
    def poll(cls, context):
        return context.mode == "OBJECT"

    def execute(self, context):
        global _server_instance

        dist_dir = Path(__file__).parent / "blender_dist"
        PORT = 8765

        if _server_instance is None: #Make sure server is not already running before trying to start
            try:
                handler = partial(SimpleHTTPRequestHandler, directory=str(dist_dir))
                _server_instance = ThreadingHTTPServer(("127.0.0.1", PORT), handler)

                thread = threading.Thread(target=_server_instance.serve_forever, daemon=True)
                thread.start()
                self.report({'INFO'}, "Server Started")
            except Exception as e:
                self.report({'ERROR'}, f"Could not start server: {e}")
                return {'CANCELLED'}
        else:
            self.report({'INFO'}, "Server already running, opening browser...")

        bpy.ops.wm.url_open(url=f"http://127.0.0.1:{PORT}")
 
        return {'FINISHED'}
    
class BMP_OT_stop(Operator):
    bl_idname = "bmp.stop_server"
    bl_label = "Stop Server"

    def execute(self, context):
        stop_server()
        self.report({'INFO'}, "Server Stopped")
        return {'FINISHED'}

class BMP_OT_import_file(Operator, ImportHelper):
    bl_idname = "bmp.file_select"
    bl_label = "Select Midi"

    filename_ext = ".midi"

    filter_glob: StringProperty(
        default="*.midi",
        options={'HIDDEN'}
    )

    filepath: StringProperty(
        name="File Path",
        description="Path to the file",
        maxlen=1024,
        subtype='FILE_PATH',
    )

    def execute(self, context):
        print("Selected file:", self.filepath)

        src = Path(self.filepath)
        
        cache_dir = Path(__file__).parent / "blender_dist" / ".cache"

        if cache_dir.exists() and cache_dir.name == ".cache" and cache_dir.is_dir():
            shutil.rmtree(cache_dir)

        cache_dir.mkdir(parents=True, exist_ok=True)

        dst = cache_dir / src.name #Get the destination folder

        shutil.copy2(src, dst) #Copy the midi file

        print("Copied to:", dst)

        return {'FINISHED'}

class BMP_PT_sidebar(Panel):
    bl_label = "BMP"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "BMP"

    def draw(self, context):
        layout = self.layout
        global _server_instance

        box = layout.box()

        if _server_instance:
            box.label(text="Server: RUNNING", icon='URL')
        else:
            box.label(text="Server: OFFLINE", icon='WORLD')

        start_text = "Open Browser" if _server_instance else "Start Server"
        start_icon = 'URL' if _server_instance else 'PLAY'
        box.operator(BMP_OT_start.bl_idname, text=start_text, icon=start_icon)

        row = box.row()
        row.enabled = _server_instance is not None
        row.operator(BMP_OT_stop.bl_idname, text="Stop Server", icon='CANCEL')

        layout.separator()
        layout.operator(BMP_OT_import_file.bl_idname, text='Select Midi', icon='FILE_NEW')
    
    
classes = [
    BMP_OT_start,
    BMP_OT_stop,
    BMP_PT_sidebar,
    BMP_OT_import_file
]
    

def register():
    for c in classes:
        bpy.utils.register_class(c)


def unregister():
    stop_server()
    for c in classes:
        bpy.utils.unregister_class(c)


if __name__ == '__main__':
    register()