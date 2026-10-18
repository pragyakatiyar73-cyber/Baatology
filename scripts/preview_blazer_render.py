import json, struct
import numpy as np
from PIL import Image

def render_preview():
    # Read glb
    with open('public/models/female_mentor.glb', 'rb') as f:
        magic, ver, length = struct.unpack('<III', f.read(12))
        chunk_len, chunk_type = struct.unpack('<II', f.read(8))
        json_bytes = f.read(chunk_len)
        gltf = json.loads(json_bytes.decode('utf-8'))
        b_len, b_type = struct.unpack('<II', f.read(8))
        bin_data = f.read(b_len)

    top_mesh = next(m for m in gltf['meshes'] if m.get('name') == 'Wolf3D_Outfit_Top')
    prim = top_mesh['primitives'][0]
    pos_acc = gltf['accessors'][prim['attributes']['POSITION']]
    uv_acc = gltf['accessors'][prim['attributes']['TEXCOORD_0']]
    idx_acc = gltf['accessors'][prim['indices']]

    pos_bv = gltf['bufferViews'][pos_acc['bufferView']]
    uv_bv = gltf['bufferViews'][uv_acc['bufferView']]
    idx_bv = gltf['bufferViews'][idx_acc['bufferView']]

    pos_stride = pos_bv.get('byteStride', 12)
    pos_off = pos_bv.get('byteOffset', 0) + pos_acc.get('byteOffset', 0)
    uv_stride = uv_bv.get('byteStride', 8)
    uv_off = uv_bv.get('byteOffset', 0) + uv_acc.get('byteOffset', 0)
    idx_off = idx_bv.get('byteOffset', 0) + idx_acc.get('byteOffset', 0)

    n_verts = pos_acc['count']
    verts = []
    uvs = []
    for i in range(n_verts):
        px, py, pz = struct.unpack_from('<fff', bin_data, pos_off + i * pos_stride)
        u, v = struct.unpack_from('<ff', bin_data, uv_off + i * uv_stride)
        verts.append((px, py, pz))
        uvs.append((u, v))

    # indices (triangles)
    idx_type = idx_acc['componentType']
    fmt = '<H' if idx_type == 5123 else '<I'
    sz = 2 if idx_type == 5123 else 4
    n_indices = idx_acc['count']
    indices = [struct.unpack_from(fmt, bin_data, idx_off + i * sz)[0] for i in range(n_indices)]

    # Load blazer texture
    tex_img = Image.open('public/models/blazer_texture.png').convert('RGB')
    tex_w, tex_h = tex_img.size
    tex_arr = np.array(tex_img)

    # Render image buffer (512x512)
    img_w, img_h = 512, 512
    out_buf = np.zeros((img_h, img_w, 3), dtype=np.uint8)
    z_buf = np.full((img_h, img_w), -999.0, dtype=np.float32)

    # We want front view: camera looking at upper body:
    # X from -0.3 to +0.3
    # Y from 1.0 to 1.55 (waist to neck/collar)
    x_min, x_max = -0.32, 0.32
    y_min, y_max = 1.05, 1.55

    for t in range(0, n_indices, 3):
        i0, i1, i2 = indices[t], indices[t+1], indices[t+2]
        v0, v1, v2 = verts[i0], verts[i1], verts[i2]

        # Cull back faces (pointing away from +Z)
        normal_z = (v1[0] - v0[0]) * (v2[1] - v0[1]) - (v1[1] - v0[1]) * (v2[0] - v0[0])
        if normal_z <= 0: # back facing or degenerate
            continue

        # project to 2D screen coordinates
        p0 = ((v0[0] - x_min) / (x_max - x_min) * (img_w - 1), (y_max - v0[1]) / (y_max - y_min) * (img_h - 1), v0[2])
        p1 = ((v1[0] - x_min) / (x_max - x_min) * (img_w - 1), (y_max - v1[1]) / (y_max - y_min) * (img_h - 1), v1[2])
        p2 = ((v2[0] - x_min) / (x_max - x_min) * (img_w - 1), (y_max - v2[1]) / (y_max - y_min) * (img_h - 1), v2[2])

        uv0 = uvs[i0]
        uv1 = uvs[i1]
        uv2 = uvs[i2]

        # Bounding box
        min_x = max(0, int(min(p0[0], p1[0], p2[0])))
        max_x = min(img_w - 1, int(max(p0[0], p1[0], p2[0])) + 1)
        min_y = max(0, int(min(p0[1], p1[1], p2[1])))
        max_y = min(img_h - 1, int(max(p0[1], p1[1], p2[1])) + 1)

        area = (p1[0] - p0[0]) * (p2[1] - p0[1]) - (p1[1] - p0[1]) * (p2[0] - p0[0])
        if abs(area) < 1e-5:
            continue

        for py in range(min_y, max_y):
            for px in range(min_x, max_x):
                w0 = ((p1[0] - px) * (p2[1] - py) - (p1[1] - py) * (p2[0] - px)) / area
                w1 = ((p2[0] - px) * (p0[1] - py) - (p2[1] - py) * (p0[0] - px)) / area
                w2 = 1.0 - w0 - w1
                if w0 >= 0 and w1 >= 0 and w2 >= 0:
                    pz = w0 * p0[2] + w1 * p1[2] + w2 * p2[2]
                    if pz > z_buf[py, px]:
                        z_buf[py, px] = pz
                        # interpolate UV
                        u = w0 * uv0[0] + w1 * uv1[0] + w2 * uv2[0]
                        v = w0 * uv0[1] + w1 * uv1[1] + w2 * uv2[1]
                        tx = int(np.clip(u * (tex_w - 1), 0, tex_w - 1))
                        ty = int(np.clip(v * (tex_h - 1), 0, tex_h - 1))
                        out_buf[py, px] = tex_arr[ty, tx]

    out_img = Image.fromarray(out_buf)
    out_img.save('public/models/preview_blazer_front.png')
    print('Saved preview to public/models/preview_blazer_front.png')

if __name__ == '__main__':
    render_preview()
