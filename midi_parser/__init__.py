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

import bpy
from bpy.types import Operator
from bpy.types import Panel

from midi_parser.external import webbrowser

class BMP_OT_operator(Operator):
    """ tooltip goes here """
    bl_idname = "webpage.operator"
    bl_label = "Opens a webpage"
    bl_options = {"REGISTER", "UNDO"}

    @classmethod
    def poll(cls, context):
        return context.mode == "OBJECT"

    def execute(self, context):

        self.report({'INFO'},
            f"execute()")
        
        webbrowser.open_new('https://www.wikipedia.org/')

        return {'FINISHED'}


class BMP_PT_sidebar(Panel):
    """Display test button"""
    bl_label = "BMP"
    bl_space_type = "VIEW_3D"
    bl_region_type = "UI"
    bl_category = "BMP"

    def draw(self, context):
        col = self.layout.column(align=True)
        prop = col.operator(BMP_OT_operator.bl_idname, text="Say Something")
    
    
classes = [
    BMP_OT_operator,
    BMP_PT_sidebar,
]
    

def register():
    for c in classes:
        bpy.utils.register_class(c)


def unregister():
    for c in classes:
        bpy.utils.unregister_class(c)


if __name__ == '__main__':
    register()