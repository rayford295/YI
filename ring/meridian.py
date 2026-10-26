"""Meridian — a pair of parametric rings built in Blender.

    Blender -b -P ring/meridian.py -- --ring hers --render            # all views of her ring
    Blender -b -P ring/meridian.py -- --ring his  --render hero       # one view of his ring
    Blender -b -P ring/meridian.py -- --ring hers --export            # GLB for the website
    Blender -b -P ring/meridian.py -- --ring both --render --export   # everything

Millimetres throughout (scene unit scale 0.001). Ring axis is world Y, the top of the
ring is +Z. Shared signature of the pair: a yellow-gold meridian line inlaid around the
outside of a platinum band, a hidden sapphire inside the bottom, and an engraving that
reads  <other's name> · <day we met>  ✦sapphire✦  <where we meet>.

Hers: slim round band, round brilliant on four compass prongs.
His:  wide flat comfort-fit band, brushed platinum, no stone.
"""
import math
import sys
from pathlib import Path

import os
import bpy
import bmesh
from mathutils import Vector, Matrix

HERE = Path(__file__).resolve().parent
MET, PLACE = "2026·09·20", "40.64°N 73.78°W"
HIM, HER = "Dr. Yifan Yang, 25th Sept.", "Jingyi Chen, 31st Oct."   # each ring carries the other's name

# Her ring has two versions and the site shows both: "hers" is the current design (v2, 2026-10-26),
# "hers_v1" the first (2026-10-25). Both share his band's language; v2 sinks the stone into the band.
RINGS = {
    "hers": dict(
        style="flat", inner_diameter=16.5, band_w=5.0, band_t=2.6,     # US 6 placeholder; thicker so the pavilion stays inside
        groove_r=0.22, sapphire_r=0.55, brushed=True,
        flush_stone=4.2, flush_rim=0.14,                               # centre stone sunk into the band, gold rim at the surface
        flush_melee=(1.5, 2, 17.0),                                    # (diameter, count per side, degrees apart) along the meridian
        engraving=(HIM, f"{MET} · {PLACE}"), engraving_size=0.80,
    ),
    "hers_v1": dict(
        style="round", inner_diameter=16.5, band_t=1.8,        # US 6 placeholder
        stone_d=7.0, prong_r=0.38, seat_r=2.9, seat_t=0.26,     # ~1.3 ct centre stone
        collet_r_bottom=1.3, collet_r_top=2.8, collet_h=2.0,
        halo_n=18, melee_d=0.9,                                 # halo of small brilliants
        shoulder_n=5, shoulder_d=(1.35, 0.95),                   # graduated stones along the meridian
        groove_r=0.2, sapphire_r=0.55, brushed=False,
        engraving=(HIM, f"{MET} · {PLACE}"), engraving_size=0.70,
    ),
    "his": dict(
        style="flat", inner_diameter=19.8, band_w=5.2, band_t=1.9,   # US 10 placeholder
        groove_r=0.26, sapphire_r=0.6, brushed=True,
        engraving=(HER, f"{MET} · {PLACE}"), engraving_size=0.92,
    ),
}
RENDER = dict(samples=int(os.environ.get("RING_SAMPLES", 192)), res=int(os.environ.get("RING_RES", 1200)))
FONTS = ["/System/Library/Fonts/Supplemental/Didot.ttc",          # engraving: a high-contrast serif
         "/System/Library/Fonts/Supplemental/Baskerville.ttc",
         "/System/Library/Fonts/Supplemental/Songti.ttc"]
ROT_AXIS_Y = (math.radians(90), 0, 0)


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


def link(name, bm, loc=(0, 0, 0), rot=(0, 0, 0)):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    o.location, o.rotation_euler = loc, rot
    return o


def torus(name, major, minor, loc=(0, 0, 0), rot=(0, 0, 0), seg=(128, 48)):
    bpy.ops.mesh.primitive_torus_add(major_radius=major, minor_radius=minor,
                                     major_segments=seg[0], minor_segments=seg[1],
                                     location=loc, rotation=rot)
    o = bpy.context.object
    o.name = name
    return smooth(o)


def cylinder(name, r, z0, z1, xy=(0, 0), r_top=None, verts=48):
    bpy.ops.mesh.primitive_cone_add(vertices=verts, radius1=r, radius2=r if r_top is None else r_top,
                                    depth=z1 - z0, location=(xy[0], xy[1], (z0 + z1) / 2))
    o = bpy.context.object
    o.name = name
    return smooth(o)


def sphere(name, r, loc):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=r, location=loc, segments=48, ring_count=24)
    o = bpy.context.object
    o.name = name
    return smooth(o)


def boolean(target, cutter, op='DIFFERENCE', apply=False):
    md = target.modifiers.new(op.lower(), 'BOOLEAN')
    md.operation, md.object, md.solver = op, cutter, 'EXACT'
    cutter.hide_render = cutter.hide_viewport = True
    if apply:
        apply_modifiers(target)
    return md


def apply_modifiers(obj):
    """Bake the modifier stack in order; stacked EXACT booleans whose cutters overlap can otherwise
    resolve to a union instead of a difference."""
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    for m in list(obj.modifiers):
        bpy.ops.object.modifier_apply(modifier=m.name)


def lathe(name, profile, steps, axis=(0, 0, 1), flat=False):
    """Revolve an (r, axial) profile around `axis` (Z or Y)."""
    bm = bmesh.new()
    pt = (lambda r, a: (r, a, 0)) if axis[1] else (lambda r, a: (r, 0, a))
    verts = [bm.verts.new(pt(r, a)) for r, a in profile]
    closed = profile[0] == profile[-1]
    n = len(verts) - (1 if closed else 0)
    edges = [bm.edges.new((verts[i], verts[(i + 1) % n])) for i in range(n if closed else n - 1)]
    bmesh.ops.spin(bm, geom=verts[:n] + edges, cent=(0, 0, 0), axis=axis,
                   angle=2 * math.pi, steps=steps, use_merge=True)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-4)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    o = link(name, bm)
    return o if flat else smooth(o)


def brilliant(name, d, girdle_z, facets=16):
    R = d / 2
    crown_h, pav_h, girdle_h, table_r = 0.15 * d, 0.43 * d, 0.025 * d, 0.57 * R
    profile = [(0, crown_h), (table_r, crown_h), (0.84 * R, crown_h * 0.42),
               (R, girdle_h / 2), (R, -girdle_h / 2), (0.62 * R, -pav_h * 0.5), (0, -pav_h)]
    o = lathe(name, profile, facets, flat=True)
    o.location = (0, 0, girdle_z)
    return o


def rounded_rect_profile(inner_r, t, w, fillet, comfort=0.18, n_arc=8, n_flat=14):
    """Cross-section of a flat band in the (radial, axial) plane, closed, counter-clockwise."""
    ro, ri = inner_r + t, inner_r
    pts = []
    def arc(cx, cz, a0, a1):
        for i in range(n_arc + 1):
            a = math.radians(a0 + (a1 - a0) * i / n_arc)
            pts.append((cx + fillet * math.cos(a), cz + fillet * math.sin(a)))
    def flat(p0, p1):
        for i in range(1, n_flat):
            k = i / n_flat
            pts.append((p0[0] + (p1[0] - p0[0]) * k, p0[1] + (p1[1] - p0[1]) * k))
    h = w / 2
    arc(ro - fillet, h - fillet, 0, 90)                  # outer-top corner
    flat((ro - fillet, h), (ri + fillet, h))             # top side
    arc(ri + fillet, h - fillet, 90, 180)                # inner-top corner
    # inner face bows inward slightly: comfort fit
    for i in range(1, n_flat):
        k = i / n_flat
        z = (h - fillet) - (w - 2 * fillet) * k
        pts.append((ri - comfort * math.sin(math.pi * k), z))
    arc(ri + fillet, -h + fillet, 180, 270)
    flat((ri + fillet, -h), (ro - fillet, -h))
    arc(ro - fillet, -h + fillet, 270, 360)
    flat((ro, -h + fillet), (ro, h - fillet))
    pts.append(pts[0])
    return pts


def load_font():
    for f in FONTS:
        try:
            return bpy.data.fonts.load(f)
        except Exception:
            continue
    return None


# ---------------------------------------------------------------- build
def build(which):
    P = dict(RINGS[which])
    inner_r = P["inner_diameter"] / 2
    outer_r = inner_r + P["band_t"]
    clear_scene()
    platinum = mat("Platinum", (0.86, 0.87, 0.89), rough=0.32 if P["brushed"] else 0.10)
    polished = mat("PlatinumPolished", (0.86, 0.87, 0.89), rough=0.10)
    gold = mat("YellowGold", (1.0, 0.74, 0.30), rough=0.14)
    diamond = mat("Diamond", (1, 1, 1), glass=True, rough=0.0, ior=2.42)
    sapphire = mat("Sapphire", (0.03, 0.09, 0.42), glass=True, rough=0.02, ior=1.77)
    ink = mat("Engraving", (0.12, 0.10, 0.08), metallic=0.6, rough=0.55)

    # --- band
    if P["style"] == "round":
        band = torus("Band", inner_r + P["band_t"] / 2, P["band_t"] / 2, rot=ROT_AXIS_Y, seg=(256, 64))
        half_w = P["band_t"] / 2
    else:
        comfort = 0.18
        prof = rounded_rect_profile(inner_r, P["band_t"], P["band_w"], fillet=0.55, comfort=comfort)
        band = lathe("Band", prof, 256, axis=(0, 1, 0))
        half_w = P["band_w"] / 2
        inner_r -= comfort                                   # the inner face bows inward at mid-width
    band.data.materials.append(platinum)

    # --- meridian: groove cut, then a gold line laid into it
    groove = torus("GrooveCutter", outer_r, P["groove_r"], rot=ROT_AXIS_Y, seg=(256, 24))
    boolean(band, groove)
    inlay = torus("MeridianInlay", outer_r - 0.03, P["groove_r"] * 0.92, rot=ROT_AXIS_Y, seg=(256, 24))
    inlay.data.materials.append(gold)

    # --- flush-set stones (hers v2): sunk into the flat band along the meridian, a gold rim at the lip
    if P.get("flush_stone"):
        def flush(tag, d, th, rim):
            th = th or 1e-3                                           # never exactly on the lathe seam: EXACT booleans fail on coincident geometry
            dirv = Vector((math.sin(th), 0, math.cos(th)))
            rot = (0, th, 0.05)
            crown_h, pav_h = 0.15 * d, 0.43 * d
            girdle_z = outer_r - crown_h * 0.6                        # crown just proud of the surface so the facets catch light
            def place(o, z):
                o.location = dirv * z
                o.rotation_euler = rot
                return o
            # one manifold cutter for the whole seat: a cone under the pavilion, a bore up through the surface
            # (two overlapping cylinders made the EXACT solver union instead of subtract)
            rc = d / 2 + 0.06
            seat = lathe(f"{tag}Seat", [(0, outer_r + 1.5), (rc, outer_r + 1.5), (rc, girdle_z - 0.02),
                                        (0, girdle_z - pav_h - 0.05), (0, outer_r + 1.5)], 64, flat=True)   # same winding as brilliant()
            seat.rotation_euler = rot
            boolean(band, seat, apply=True)
            boolean(inlay, seat, apply=True)
            # a polished gold liner inside the seat: light bounces back into the stone, as in a real bezel
            liner = lathe(f"{tag}Liner", [(rc - 0.01, outer_r - 0.03), (rc - 0.01, girdle_z - 0.02), (0.02, girdle_z - pav_h - 0.04),
                                          (0.02, girdle_z - pav_h - 0.02), (rc - 0.03, girdle_z - 0.01), (rc - 0.03, outer_r - 0.03),
                                          (rc - 0.01, outer_r - 0.03)], 64)
            liner.rotation_euler = rot
            liner.data.materials.append(gold)
            st = brilliant(f"{tag}Stone", d, 0, facets=24)
            place(st, girdle_z)
            st.data.materials.append(diamond)
            r_rim = place(torus(f"{tag}Rim", d / 2 + rim * 0.9, rim, seg=(96, 16)), outer_r - 0.04)
            r_rim.data.materials.append(gold)
        flush("Centre", P["flush_stone"], 0.0, P["flush_rim"])
        md, n, step = P["flush_melee"]
        for sgn in (-1, 1):
            for k in range(1, n + 1):
                flush(f"Melee{'L' if sgn < 0 else 'R'}{k}", md, sgn * math.radians(step * k), P["flush_rim"] * 0.6)

    # --- hidden sapphire, bottom inside
    z_in = -inner_r
    pocket = sphere("SapphirePocket", P["sapphire_r"] + 0.08, (0, 0, z_in - 0.42))
    boolean(band, pocket)
    sap = sphere("Sapphire", P["sapphire_r"], (0, 0, z_in - 0.40))
    sap.data.materials.append(sapphire)
    bezel = torus("SapphireBezel", P["sapphire_r"] + 0.1, 0.15, loc=(0, 0, z_in - 0.1), seg=(64, 16))
    bezel.data.materials.append(gold)

    # --- head (hers only)
    if P["style"] == "round":
        z0 = outer_r - 0.35
        collet = cylinder("Collet", P["collet_r_bottom"], z0, z0 + P["collet_h"], r_top=P["collet_r_top"])
        collet.data.materials.append(polished)
        bore = cylinder("ColletBore", P["collet_r_bottom"] - 0.45, z0 + 0.5, z0 + P["collet_h"] + 1, r_top=P["collet_r_top"] - 0.45)
        boolean(collet, bore)
        z_seat = z0 + P["collet_h"]
        seat = torus("Seat", P["seat_r"], P["seat_t"], loc=(0, 0, z_seat), seg=(96, 24))
        seat.data.materials.append(gold)
        girdle_z = z_seat + 0.45
        stone = brilliant("Diamond", P["stone_d"], girdle_z)
        stone.data.materials.append(diamond)
        prong_ring_r = P["stone_d"] / 2 + 0.05
        tip_z = girdle_z + 0.15 * P["stone_d"] * 0.85
        tilt = math.radians(12)
        for i, ang in enumerate((0, 90, 180, 270)):        # E N W S
            a = math.radians(ang)
            z_base = z_seat - 0.25
            L = (tip_z - z_base) / math.cos(tilt)
            base = Vector((prong_ring_r * math.cos(a), prong_ring_r * math.sin(a), z_base))
            d = Vector((-math.sin(tilt) * math.cos(a), -math.sin(tilt) * math.sin(a), math.cos(tilt)))
            pr = cylinder(f"Prong{i}", P["prong_r"], -L / 2, L / 2, r_top=P["prong_r"] * 0.55)
            pr.rotation_euler = d.to_track_quat('Z', 'Y').to_euler()
            pr.location = base + d * (L / 2)
            pr.data.materials.append(gold)
            tip = sphere(f"ProngTip{i}", P["prong_r"] * 0.58, base + d * L)
            tip.data.materials.append(gold)

        # halo: a flared platinum cup under the girdle carrying a ring of small brilliants
        m_r = P["melee_d"] / 2
        halo_r = P["stone_d"] / 2 + m_r + 0.22
        z_cup = girdle_z - 0.35
        r_out = halo_r + m_r * 0.9
        wall = 0.38                                           # open gallery: a thin flared wall lets light reach the pavilion
        cup = lathe("HaloCup", [(P["collet_r_top"], z_seat - 0.05), (r_out, z_cup), (r_out - wall, z_cup),
                                (P["collet_r_top"] - wall, z_seat - 0.05), (P["collet_r_top"], z_seat - 0.05)], 96)
        cup.data.materials.append(polished)
        collar = torus("HaloCollar", halo_r, m_r * 0.95, loc=(0, 0, z_cup), seg=(160, 24))
        collar.data.materials.append(polished)
        for i in range(P["halo_n"]):
            a = 2 * math.pi * (i + 0.5) / P["halo_n"]
            mel = brilliant(f"Halo{i}", P["melee_d"], z_cup + m_r * 0.55, facets=12)
            mel.location = (halo_r * math.cos(a), halo_r * math.sin(a), mel.location.z)
            mel.data.materials.append(diamond)
            bead = sphere(f"HaloBead{i}", 0.14, (halo_r * math.cos(a + math.pi / P["halo_n"]),
                                                 halo_r * math.sin(a + math.pi / P["halo_n"]), z_cup + m_r * 0.7))
            bead.data.materials.append(gold)

        # shoulders: the gold meridian turns into a run of graduated stones as it climbs to the head
        d0, d1 = P["shoulder_d"]
        for sgn in (-1, 1):
            for k in range(P["shoulder_n"]):
                t = k / max(P["shoulder_n"] - 1, 1)
                md = d0 + (d1 - d0) * t
                th = math.radians(24 + 10.5 * k)
                st = brilliant(f"Shoulder{'L' if sgn < 0 else 'R'}{k}", md, 0, facets=12)
                st.location = (sgn * (outer_r - 0.22) * math.sin(th), 0, (outer_r - 0.22) * math.cos(th))
                st.rotation_euler = (0, sgn * th, 0)
                st.data.materials.append(diamond)

    # --- engraving on the inner surface
    curve = bpy.data.curves.new("EngravePath", 'CURVE')
    curve.dimensions = '3D'
    sp = curve.splines.new('NURBS')
    npts = 64
    sp.points.add(npts - 1)
    rr = inner_r + 0.02
    for i in range(npts):
        a = 2 * math.pi * i / npts
        sp.points[i].co = (rr * math.cos(a), rr * math.sin(a), 0, 1)
    sp.use_cyclic_u, sp.order_u = True, 4
    path = bpy.data.objects.new("EngravePath", curve)
    bpy.context.collection.objects.link(path)

    font = load_font()
    gap = P["sapphire_r"] + 1.2
    for side, body, align, dx in (("L", P["engraving"][0], 'RIGHT', -gap), ("R", P["engraving"][1], 'LEFT', gap)):
        tcurve = bpy.data.curves.new(f"EngraveText{side}", 'FONT')
        if font:
            tcurve.font = font
        tcurve.body, tcurve.size, tcurve.extrude = body, P["engraving_size"], 0.04
        tcurve.align_x, tcurve.align_y = align, 'CENTER'
        text = bpy.data.objects.new(f"Engraving{side}", tcurve)
        bpy.context.collection.objects.link(text)
        bpy.context.view_layer.objects.active = text
        bpy.ops.object.select_all(action='DESELECT')
        text.select_set(True)
        bpy.ops.object.convert(target='MESH')
        text = bpy.context.object
        # glyph height -> ring axis, glyph fronts toward the centre, upright when read from inside
        text.data.transform(Matrix.Rotation(math.radians(-90), 4, 'X'))
        text.data.transform(Matrix.Translation((2 * math.pi * rr * 0.75 + dx, 0, 0)))
        cm = text.modifiers.new("wrap", 'CURVE')
        cm.object, cm.deform_axis = path, 'POS_X'
        text.data.materials.append(ink)
        text.rotation_euler = ROT_AXIS_Y
    path.rotation_euler = ROT_AXIS_Y
    path.hide_render = True

    # --- studio
    bpy.ops.mesh.primitive_plane_add(size=400, location=(0, 0, -outer_r))
    floor = bpy.context.object
    floor.name = "Floor"
    floor.data.materials.append(mat("Backdrop", (0.012, 0.045, 0.10), metallic=0, rough=0.5))
    bpy.ops.mesh.primitive_plane_add(size=400, location=(0, 120, 0), rotation=(math.radians(90), 0, 0))
    bpy.context.object.name = "Wall"
    bpy.context.object.data.materials.append(floor.data.materials[0])

    def light(name, loc, power, size, color=(1, 1, 1)):
        ld = bpy.data.lights.new(name, 'AREA')
        ld.energy, ld.size, ld.color = power, size, color
        lo = bpy.data.objects.new(name, ld)
        bpy.context.collection.objects.link(lo)
        lo.location = loc
        lo.rotation_euler = (Vector((0, 0, 0)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
    # Emissive softboxes: area lights are not seen through refraction, so without these the stones
    # render as grey glass. The panels are hidden from the camera but show in reflections and facets.
    glow = mat("Softbox", (1, 1, 1), metallic=0, rough=1)
    em = glow.node_tree.nodes.new('ShaderNodeEmission')
    em.inputs['Strength'].default_value = 5.0
    glow.node_tree.links.new(em.outputs[0], next(n for n in glow.node_tree.nodes if n.type == 'OUTPUT_MATERIAL').inputs['Surface'])
    # thin strips rather than big panels: facets then show streaks of light instead of one white disc
    for name, loc, size, strip in (("SoftKey", (70, -60, 110), 90, 0.12), ("SoftFill", (-110, -30, 60), 110, 0.10),
                                   ("SoftRim", (-20, 90, 90), 80, 0.12), ("SoftTop", (0, 10, 170), 160, 0.08)):
        bpy.ops.mesh.primitive_plane_add(size=size, location=loc)
        pl = bpy.context.object
        pl.name = name
        pl.rotation_euler = (Vector((0, 0, 0)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
        pl.scale = (strip, 1, 1)
        pl.data.materials.append(glow)
        pl.visible_camera = False
        pl.visible_shadow = False
    light("Key", (60, -70, 90), 16000, 60)
    light("Fill", (-90, -40, 40), 3500, 90, (0.9, 0.95, 1.0))
    light("Rim", (-30, 80, 70), 5000, 40, (1.0, 0.93, 0.8))
    light("Top", (0, 0, 140), 9000, 120)
    light("Front", (0, -120, 30), 4000, 120)
    world = bpy.data.worlds.new("Studio")
    bpy.context.scene.world = world
    world.use_nodes = True
    bg = world.node_tree.nodes["Background"]
    bg.inputs[0].default_value = (0.80, 0.84, 0.90, 1)
    bg.inputs[1].default_value = 2.0

    s = outer_r / 9.95            # camera distances scale with the ring
    cams = {}
    def camera(name, loc, target, lens=85):
        cd = bpy.data.cameras.new(name)
        cd.lens, cd.clip_end = lens, 2000
        co = bpy.data.objects.new(name, cd)
        bpy.context.collection.objects.link(co)
        co.location = Vector(loc) * s
        co.rotation_euler = (Vector(target) * s - Vector(loc) * s).to_track_quat('-Z', 'Y').to_euler()
        cams[name] = co
    camera("hero", (30, -42, 27), (0, 0, 3.5))
    camera("top", (0.01, -0.01, 70), (0, 0, 6))
    camera("inside", (-6, -34, 14), (0, 0, -7.5), lens=70)
    camera("profile", (0, -62, 2), (0, 0, 2))
    camera("detail", (-2, -16, 2), (0, 0, -8.2), lens=100)
    return cams


def render(cams, which, tag):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.samples, sc.cycles.use_denoising = RENDER["samples"], True
    sc.cycles.max_bounces, sc.cycles.transmission_bounces, sc.cycles.glossy_bounces = 24, 24, 12
    try:
        prefs = bpy.context.preferences.addons['cycles'].preferences
        prefs.compute_device_type = 'METAL'
        prefs.get_devices()
        for d in prefs.devices:
            d.use = True
        sc.cycles.device = 'GPU'
    except Exception as e:  # noqa
        print("GPU setup failed, using CPU:", e)
    sc.render.resolution_x = sc.render.resolution_y = RENDER["res"]
    sc.render.image_settings.file_format = 'PNG'
    sc.view_settings.view_transform, sc.view_settings.look = 'AgX', 'AgX - Medium High Contrast'
    out = HERE / "renders"
    out.mkdir(exist_ok=True)
    for name in which:
        sc.camera = cams[name]
        sc.render.filepath = str(out / f"{tag}_{name}.png")
        bpy.ops.render.render(write_still=True)
        print("wrote", sc.render.filepath)


def export_glb(path):
    """Web copy: glTF has no Glass BSDF, so stones become Principled transmission."""
    studio = {"Floor", "Wall", "Key", "Fill", "Rim", "Top", "Front", "EngravePath", "SoftKey", "SoftFill", "SoftRim", "SoftTop"}
    for m in bpy.data.materials:
        glass = next((n for n in m.node_tree.nodes if n.type == 'BSDF_GLASS'), None)
        if not glass:
            continue
        bsdf = m.node_tree.nodes.new('ShaderNodeBsdfPrincipled')
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
    path.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.export_scene.gltf(filepath=str(path), export_format='GLB', use_selection=True,
                              export_apply=True, export_yup=True, export_image_format='NONE')
    print("exported", path)


if __name__ == "__main__":
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    ring = argv[argv.index("--ring") + 1] if "--ring" in argv else "hers"
    for which in (("hers", "hers_v1", "his") if ring == "both" else (ring,)):
        cams = build(which)
        bpy.ops.wm.save_as_mainfile(filepath=str(HERE / f"meridian_{which}.blend"))
        if "--render" in argv:
            views = [a for a in argv if a in cams] or list(cams)
            render(cams, views, which)
        if "--export" in argv:
            export_glb(HERE.parent / "public" / "media" / "ring" / f"meridian_{which}.glb")
