"""Meridian — a parametric engagement ring built in Blender.

Run headless:
    /Applications/Blender.app/Contents/MacOS/Blender -b -P ring/meridian.py -- --render

Everything is in millimetres (scene unit scale 0.001). Ring axis is world Y,
the centre stone sits at +Z. Four prongs point N/E/S/W like a compass, a fine
meridian groove runs around the outer band, a hidden sapphire sits inside the
bottom of the band, and the inner surface carries an engraving.
"""
import math
import sys
from pathlib import Path

import bpy
import bmesh
from mathutils import Vector, Matrix

HERE = Path(__file__).resolve().parent

P = dict(
    inner_diameter=16.5,     # US size 6 placeholder
    band_t=1.7,              # round band cross-section diameter
    groove_r=0.2,           # meridian groove radius
    stone_d=6.0,             # ~0.8 ct round brilliant
    prong_r=0.38,
    seat_r=2.45, seat_t=0.28,
    collet_r_bottom=1.25, collet_r_top=2.3, collet_h=1.9,
    sapphire_r=0.55,
    engraving="2026 · 09 · 20              40.64°N  73.78°W",  # the sapphire sits in the gap
    engraving_size=0.72,
    samples=192, res=1200,
)
P["inner_r"] = P["inner_diameter"] / 2
P["outer_r"] = P["inner_r"] + P["band_t"]
P["band_mid_r"] = P["inner_r"] + P["band_t"] / 2

ROT_AXIS_Y = (math.radians(90), 0, 0)   # torus made in XY -> axis along Y


# ---------------------------------------------------------------- helpers
def clear_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.unit_settings.system = 'METRIC'
    sc.unit_settings.scale_length = 0.001
    sc.unit_settings.length_unit = 'MILLIMETERS'


def mat(name, color, *, metallic=1.0, rough=0.15, glass=False, ior=1.5):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new('ShaderNodeOutputMaterial')
    if glass:
        bsdf = nt.nodes.new('ShaderNodeBsdfGlass')
        bsdf.inputs['Color'].default_value = (*color, 1)
        bsdf.inputs['Roughness'].default_value = rough
        bsdf.inputs['IOR'].default_value = ior
    else:
        bsdf = nt.nodes.new('ShaderNodeBsdfPrincipled')
        bsdf.inputs['Base Color'].default_value = (*color, 1)
        bsdf.inputs['Metallic'].default_value = metallic
        bsdf.inputs['Roughness'].default_value = rough
    nt.links.new(bsdf.outputs[0], out.inputs['Surface'])
    return m


def smooth(obj):
    for p in obj.data.polygons:
        p.use_smooth = True
    return obj


def torus(name, major, minor, loc=(0, 0, 0), rot=(0, 0, 0), seg=(128, 48)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor,
                                     major_segments=seg[0], minor_segments=seg[1],
                                     location=loc, rotation=rot)
    o = bpy.context.object
    o.name = name
    return smooth(o)


def cylinder(name, r, z0, z1, xy=(0, 0), r_top=None, verts=48):
    h = z1 - z0
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r, radius2=r if r_top is None else r_top,
                                    depth=h, location=(xy[0], xy[1], (z0 + z1) / 2))
    o = bpy.context.object
    o.name = name
    return smooth(o)


def sphere(name, r, loc):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=48, ring_count=24)
    o = bpy.context.object
    o.name = name
    return smooth(o)


def boolean(target, cutter, op='DIFFERENCE'):
    md = target.modifiers.new(op.lower(), 'BOOLEAN')
    md.operation = op
    md.object = cutter
    md.solver = 'EXACT'
    cutter.hide_render = cutter.hide_viewport = True
    return md


def brilliant(name, d, girdle_z, facets=16):
    """Round brilliant cut as a faceted lathe (table, crown, girdle, pavilion)."""
    R = d / 2
    crown_h, pav_h, girdle_h, table_r = 0.15 * d, 0.43 * d, 0.025 * d, 0.57 * R
    profile = [(0, crown_h), (table_r, crown_h), (0.84 * R, crown_h * 0.42),
               (R, girdle_h / 2), (R, -girdle_h / 2), (0.62 * R, -pav_h * 0.5), (0, -pav_h)]
    bm = bmesh.new()
    verts = [bm.verts.new((r, 0, z)) for r, z in profile]
    edges = [bm.edges.new((verts[i], verts[i + 1])) for i in range(len(verts) - 1)]
    bmesh.ops.spin(bm, geom=verts + edges, cent=(0, 0, 0), axis=(0, 0, 1),
                   angle=2 * math.pi, steps=facets, use_merge=True)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-4)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    o.location = (0, 0, girdle_z)
    return o


# ---------------------------------------------------------------- build
def build():
    clear_scene()
    platinum = mat("Platinum", (0.86, 0.87, 0.89), rough=0.10)
    gold = mat("YellowGold", (1.0, 0.74, 0.30), rough=0.14)
    diamond = mat("Diamond", (1, 1, 1), glass=True, rough=0.0, ior=2.42)
    sapphire = mat("Sapphire", (0.03, 0.09, 0.42), glass=True, rough=0.02, ior=1.77)
    ink = mat("Engraving", (0.12, 0.10, 0.08), metallic=0.6, rough=0.55)

    inner_r, outer_r, mid_r = P["inner_r"], P["outer_r"], P["band_mid_r"]

    # --- band + meridian groove
    band = torus("Band", mid_r, P["band_t"] / 2, rot=ROT_AXIS_Y, seg=(256, 64))
    band.data.materials.append(platinum)
    groove = torus("GrooveCutter", outer_r, P["groove_r"], rot=ROT_AXIS_Y, seg=(256, 24))
    boolean(band, groove)

    # --- hidden sapphire at the bottom, inside the band
    z_in = -inner_r
    pocket = sphere("SapphirePocket", P["sapphire_r"] + 0.08, (0, 0, z_in - 0.42))
    boolean(band, pocket)
    sap = sphere("Sapphire", P["sapphire_r"], (0, 0, z_in - 0.40))
    sap.data.materials.append(sapphire)
    bezel = torus("SapphireBezel", P["sapphire_r"] + 0.1, 0.15, loc=(0, 0, z_in - 0.1), seg=(64, 16))
    bezel.data.materials.append(gold)

    # --- head: collet (platinum), seat ring + 4 prongs (gold), stone
    z0 = outer_r - 0.35
    collet = cylinder("Collet", P["collet_r_bottom"], z0, z0 + P["collet_h"], r_top=P["collet_r_top"])
    collet.data.materials.append(platinum)
    z_seat = z0 + P["collet_h"]
    seat = torus("Seat", P["seat_r"], P["seat_t"], loc=(0, 0, z_seat), seg=(96, 24))
    seat.data.materials.append(gold)

    girdle_z = z_seat + 0.45
    stone = brilliant("Diamond", P["stone_d"], girdle_z)
    stone.data.materials.append(diamond)

    prong_ring_r = P["stone_d"] / 2 + 0.05
    tip_z = girdle_z + 0.15 * P["stone_d"] * 0.8
    tilt = math.radians(9)
    for i, ang in enumerate((0, 90, 180, 270)):           # E N W S
        a = math.radians(ang)
        z_base = z_seat - 0.25
        L = (tip_z - z_base) / math.cos(tilt)
        base = Vector((prong_ring_r * math.cos(a), prong_ring_r * math.sin(a), z_base))
        direction = Vector((-math.sin(tilt) * math.cos(a), -math.sin(tilt) * math.sin(a), math.cos(tilt)))
        pr = cylinder(f"Prong{i}", P["prong_r"], -L / 2, L / 2, r_top=P["prong_r"] * 0.8)
        pr.rotation_euler = direction.to_track_quat('Z', 'Y').to_euler()
        pr.location = base + direction * (L / 2)
        pr.data.materials.append(gold)
        tip = sphere(f"ProngTip{i}", P["prong_r"] * 0.82, base + direction * L)
        tip.data.materials.append(gold)

    # --- inner engraving, wrapped on the inside of the band
    curve = bpy.data.curves.new("EngravePath", 'CURVE')
    curve.dimensions = '3D'
    sp = curve.splines.new('NURBS')
    npts = 64
    sp.points.add(npts - 1)
    rr = inner_r + 0.02
    for i in range(npts):
        a = 2 * math.pi * i / npts
        sp.points[i].co = (rr * math.cos(a), rr * math.sin(a), 0, 1)
    sp.use_cyclic_u = True
    sp.order_u = 4
    path = bpy.data.objects.new("EngravePath", curve)
    bpy.context.collection.objects.link(path)

    tcurve = bpy.data.curves.new("EngraveText", 'FONT')
    tcurve.body = P["engraving"]
    tcurve.size = P["engraving_size"]
    tcurve.extrude = 0.04
    tcurve.align_x = 'CENTER'
    tcurve.align_y = 'CENTER'
    text = bpy.data.objects.new("Engraving", tcurve)
    bpy.context.collection.objects.link(text)
    bpy.context.view_layer.objects.active = text
    bpy.ops.object.select_all(action='DESELECT')
    text.select_set(True)
    bpy.ops.object.convert(target='MESH')
    text = bpy.context.object
    # glyph height -> Z (ring axis), face normal -> -Y (toward ring centre after wrap)
    # glyph height -> ring axis, glyph fronts toward the ring centre, upright when read from inside
    text.data.transform(Matrix.Rotation(math.radians(-90), 4, 'X'))
    # place it on the bottom of the ring (angle -90deg on the circle = arc length 3/4 around)
    text.data.transform(Matrix.Translation((2 * math.pi * rr * 0.75, 0, 0)))
    cm = text.modifiers.new("wrap", 'CURVE')
    cm.object = path
    cm.deform_axis = 'POS_X'
    text.data.materials.append(ink)
    for ob in (path, text):
        ob.rotation_euler = ROT_AXIS_Y
    path.hide_render = True

    # --- backdrop, lights, cameras
    bpy.ops.mesh.primitive_plane_add(size=400, location=(0, 0, -inner_r - P["band_t"]))
    floor = bpy.context.object
    floor.name = "Floor"
    floor.data.materials.append(mat("Backdrop", (0.012, 0.045, 0.10), metallic=0, rough=0.5))
    bpy.ops.mesh.primitive_plane_add(size=400, location=(0, 120, 0), rotation=(math.radians(90), 0, 0))
    wall = bpy.context.object
    wall.name = "Wall"
    wall.data.materials.append(floor.data.materials[0])

    def light(name, loc, power, size, color=(1, 1, 1)):
        ld = bpy.data.lights.new(name, 'AREA')
        ld.energy, ld.size, ld.color = power, size, color
        lo = bpy.data.objects.new(name, ld)
        bpy.context.collection.objects.link(lo)
        lo.location = loc
        lo.rotation_euler = (Vector((0, 0, 0)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
        return lo
    light("Key", (60, -70, 90), 16000, 60)
    light("Fill", (-90, -40, 40), 3500, 90, (0.9, 0.95, 1.0))
    light("Rim", (-30, 80, 70), 5000, 40, (1.0, 0.93, 0.8))
    light("Top", (0, 0, 140), 9000, 120)
    light("Front", (0, -120, 30), 4000, 120)

    world = bpy.data.worlds.new("Studio")
    bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs[0].default_value = (0.55, 0.60, 0.68, 1)
    bg.inputs[1].default_value = 1.2

    cams = {}
    def camera(name, loc, target=(0, 0, 3), lens=85):
        cd = bpy.data.cameras.new(name)
        cd.lens = lens
        cd.clip_end = 2000
        co = bpy.data.objects.new(name, cd)
        bpy.context.collection.objects.link(co)
        co.location = loc
        co.rotation_euler = (Vector(target) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
        cams[name] = co
    camera("hero", (30, -42, 27), target=(0, 0, 3.5))
    camera("top", (0.01, -0.01, 70), target=(0, 0, 6))
    camera("inside", (-6, -34, 14), target=(0, 0, -7.5), lens=70)
    camera("profile", (0, -62, 2), target=(0, 0, 2))
    camera("detail", (-2, -16, 2), target=(0, 0, -8.2), lens=100)
    return cams


def render(cams, which):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.samples = P["samples"]
    sc.cycles.use_denoising = True
    try:
        prefs = bpy.context.preferences.addons['cycles'].preferences
        prefs.compute_device_type = 'METAL'
        prefs.get_devices()
        for d in prefs.devices:
            d.use = True
        sc.cycles.device = 'GPU'
    except Exception as e:  # noqa
        print("GPU setup failed, using CPU:", e)
    sc.render.resolution_x = sc.render.resolution_y = P["res"]
    sc.render.image_settings.file_format = 'PNG'
    sc.view_settings.view_transform = 'AgX'
    sc.view_settings.look = 'AgX - Medium High Contrast'
    out = HERE / "renders"
    out.mkdir(exist_ok=True)
    for name in which:
        sc.camera = cams[name]
        sc.render.filepath = str(out / f"meridian_{name}.png")
        bpy.ops.render.render(write_still=True)
        print("wrote", sc.render.filepath)


def export_glb(path):
    """Web copy: glTF has no Glass BSDF, so stones become Principled transmission."""
    studio = {"Floor", "Wall", "Key", "Fill", "Rim", "Top", "Front", "EngravePath"}
    for name in ("Diamond", "Sapphire"):
        m = bpy.data.materials[name]
        bsdf = m.node_tree.nodes.new('ShaderNodeBsdfPrincipled')
        glass = next(n for n in m.node_tree.nodes if n.type == 'BSDF_GLASS')
        bsdf.inputs['Base Color'].default_value = glass.inputs['Color'].default_value
        bsdf.inputs['Roughness'].default_value = glass.inputs['Roughness'].default_value
        bsdf.inputs['IOR'].default_value = glass.inputs['IOR'].default_value
        bsdf.inputs['Transmission Weight'].default_value = 1.0
        out = next(n for n in m.node_tree.nodes if n.type == 'OUTPUT_MATERIAL')
        m.node_tree.links.new(bsdf.outputs[0], out.inputs['Surface'])
    bpy.ops.object.select_all(action='DESELECT')
    for ob in bpy.context.scene.objects:
        if ob.type == 'MESH' and ob.name not in studio and not ob.hide_render:
            ob.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(path), export_format='GLB', use_selection=True,
                              export_apply=True, export_yup=True, export_image_format='NONE')
    print("exported", path)


if __name__ == "__main__":
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    cams = build()
    bpy.ops.wm.save_as_mainfile(filepath=str(HERE / "meridian.blend"))
    if "--render" in argv:
        which = [a for a in argv if a in cams] or list(cams)
        render(cams, which)
    if "--export" in argv:
        export_glb(HERE.parent / "public" / "media" / "ring" / "meridian.glb")
